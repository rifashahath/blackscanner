const API_BASE = '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${res.status}`);
    }
    return res.json();
}

// Scan endpoints
export const api = {
    // Scans
    createScan: (data: { target_url: string; mode: string; auth_config?: Record<string, string> }) =>
        request<{ id: string; status: string }>('/scans', { method: 'POST', body: JSON.stringify(data) }),

    getScans: () =>
        request<{ scans: import('@/types').ScanJob[] }>('/scans'),

    getScan: (id: string) =>
        request<import('@/types').ScanJob>(`/scans/${id}`),

    getScanEvents: (id: string) =>
        request<{ events: import('@/types').ScanEvent[] }>(`/scans/${id}/events`),

    cancelScan: (id: string) =>
        request<{ status: string }>(`/scans/${id}/cancel`, { method: 'POST' }),

    // Surface Intelligence
    getSurface: (scanId: string) =>
        request<{
            routes: import('@/types').DiscoveredRoute[];
            forms: import('@/types').DiscoveredForm[];
            parameters: import('@/types').DiscoveredParameter[];
            js_files: import('@/types').DiscoveredJSFile[];
            api_calls: import('@/types').APICall[];
            stats: import('@/types').SurfaceStats;
        }>(`/scans/${scanId}/surface`),

    // Findings
    getFindings: (scanId: string) =>
        request<{ findings: import('@/types').Finding[] }>(`/scans/${scanId}/findings`),

    getFinding: (findingId: string) =>
        request<import('@/types').Finding & { evidence: import('@/types').Evidence[] }>(`/findings/${findingId}`),

    // Hypotheses
    getHypotheses: (scanId: string) =>
        request<{ hypotheses: import('@/types').Hypothesis[] }>(`/scans/${scanId}/hypotheses`),

    // Reports
    getReports: () =>
        request<{ reports: import('@/types').Report[] }>('/reports'),

    getReport: (id: string) =>
        request<import('@/types').Report>(`/reports/${id}`),

    generateReport: (scanId: string, format: string) =>
        request<{ id: string }>(`/scans/${scanId}/report`, { method: 'POST', body: JSON.stringify({ format }) }),

    exportReport: (id: string, format: string = 'json') =>
        `${API_BASE}/reports/${id}/export?format=${format}`,

    // Dashboard
    getDashboardStats: () =>
        request<import('@/types').DashboardStats>('/dashboard/stats'),
};
