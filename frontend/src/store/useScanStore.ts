import { create } from 'zustand';
import { api } from '@/lib/api';
import {
    DashboardStats,
    ScanJob,
    ScanEvent,
    DiscoveredRoute,
    DiscoveredForm,
    DiscoveredParameter,
    DiscoveredJSFile,
    APICall,
    SurfaceStats,
    Hypothesis,
    Finding,
    Evidence,
    Report
} from '@/types';

interface ScanState {
    // Dashboard
    stats: DashboardStats | null;
    scans: ScanJob[];
    isLoadingStats: boolean;
    isLoadingScans: boolean;
    lastFetchStats: number;
    lastFetchScans: number;

    // Live Scan
    currentScan: ScanJob | null;
    currentEvents: ScanEvent[];
    currentSurface: {
        routes: DiscoveredRoute[];
        forms: DiscoveredForm[];
        parameters: DiscoveredParameter[];
        jsFiles: DiscoveredJSFile[];
        apiCalls: APICall[];
        stats: SurfaceStats | null;
    };
    currentHypotheses: Hypothesis[];
    currentFindings: Finding[];
    currentFindingDetail: (Finding & { evidence: Evidence[] }) | null;
    isLoadingCurrent: boolean;

    // Actions
    fetchStats: (force?: boolean) => Promise<void>;
    fetchScans: (force?: boolean) => Promise<void>;
    fetchScanDetails: (id: string) => Promise<void>;
    fetchScanEvents: (id: string) => Promise<void>;
    fetchSurface: (id: string) => Promise<void>;
    fetchHypotheses: (id: string) => Promise<void>;
    fetchFindings: (id: string) => Promise<void>;
    fetchFinding: (id: string) => Promise<void>;

    // Mutation Actions
    launchScan: (targetUrl: string, mode: string, authCookie?: string, authHeader?: string) => Promise<string>;
    cancelScan: (id: string) => Promise<void>;
}

export const useScanStore = create<ScanState>((set, get) => ({
    stats: null,
    scans: [],
    isLoadingStats: false,
    isLoadingScans: false,
    lastFetchStats: 0,
    lastFetchScans: 0,

    currentScan: null,
    currentEvents: [],
    currentSurface: {
        routes: [],
        forms: [],
        parameters: [],
        jsFiles: [],
        apiCalls: [],
        stats: null,
    },
    currentHypotheses: [],
    currentFindings: [],
    currentFindingDetail: null,
    isLoadingCurrent: false,

    fetchStats: async (force = false) => {
        const now = Date.now();
        // Prevent excessive calls (throttle to 2 seconds unless forced)
        if (!force && now - get().lastFetchStats < 2000) return;

        const isFirstLoad = !get().stats;
        if (isFirstLoad) set({ isLoadingStats: true });

        set({ lastFetchStats: now });
        try {
            const stats = await api.getDashboardStats();
            set({ stats, isLoadingStats: false });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            set({ isLoadingStats: false });
        }
    },

    fetchScans: async (force = false) => {
        const now = Date.now();
        // Prevent excessive calls (throttle to 2 seconds unless forced)
        if (!force && now - get().lastFetchScans < 2000) return;

        const isFirstLoad = get().scans.length === 0;
        if (isFirstLoad) set({ isLoadingScans: true });

        set({ lastFetchScans: now });
        try {
            const { scans } = await api.getScans();
            set({ scans, isLoadingScans: false });
        } catch (error) {
            console.error('Failed to fetch scans:', error);
            set({ isLoadingScans: false });
        }
    },

    fetchScanDetails: async (id: string) => {
        if (!get().currentScan || get().currentScan?.id !== id) {
            set({ isLoadingCurrent: true });
        }
        try {
            const scan = await api.getScan(id);
            set({ currentScan: scan, isLoadingCurrent: false });
        } catch (error) {
            console.error('Failed to fetch scan details:', error);
            set({ isLoadingCurrent: false });
        }
    },

    fetchScanEvents: async (id: string) => {
        try {
            const { events } = await api.getScanEvents(id);
            set({ currentEvents: events });
        } catch (error) {
            console.error('Failed to fetch scan events:', error);
        }
    },

    fetchSurface: async (id: string) => {
        try {
            const surface = await api.getSurface(id);
            set({
                currentSurface: {
                    routes: surface.routes,
                    forms: surface.forms,
                    parameters: surface.parameters,
                    jsFiles: surface.js_files,
                    apiCalls: surface.api_calls,
                    stats: surface.stats,
                }
            });
        } catch (error) {
            console.error('Failed to fetch surface:', error);
        }
    },

    fetchHypotheses: async (id: string) => {
        try {
            const { hypotheses } = await api.getHypotheses(id);
            set({ currentHypotheses: hypotheses });
        } catch (error) {
            console.error('Failed to fetch hypotheses:', error);
        }
    },

    fetchFindings: async (id: string) => {
        try {
            const { findings } = await api.getFindings(id);
            set({ currentFindings: findings });
        } catch (error) {
            console.error('Failed to fetch findings:', error);
        }
    },

    fetchFinding: async (id: string) => {
        set({ isLoadingCurrent: true });
        try {
            const finding = await api.getFinding(id);
            set({ currentFindingDetail: finding, isLoadingCurrent: false });
        } catch (error) {
            console.error('Failed to fetch finding detail:', error);
            set({ isLoadingCurrent: false });
        }
    },

    launchScan: async (targetUrl, mode, authCookie, authHeader) => {
        try {
            const authConfig: Record<string, string> = {};
            if (authCookie) authConfig.cookie = authCookie;
            if (authHeader) authConfig.header = authHeader;

            const { id } = await api.createScan({
                target_url: targetUrl,
                mode,
                auth_config: Object.keys(authConfig).length > 0 ? authConfig : undefined
            });
            await get().fetchScans(true);
            await get().fetchStats(true);
            return id;
        } catch (error) {
            console.error('Failed to launch scan:', error);
            throw error;
        }
    },

    cancelScan: async (id: string) => {
        try {
            await api.cancelScan(id);
            await get().fetchScans(true);
            if (get().currentScan?.id === id) {
                await get().fetchScanDetails(id);
            }
        } catch (error) {
            console.error('Failed to cancel scan:', error);
        }
    }
}));
