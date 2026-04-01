"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe, Route, FormInput, Code, FileText, Zap,
    Filter, Search, Lock, AlertTriangle, ArrowUpDown,
    ChevronDown, ExternalLink, Eye, Radio, Shield
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { SeverityBadge } from "@/components/shared/Badges";
import { useScanStore } from "@/store/useScanStore";
import { cn, severityColor, timeAgo } from "@/lib/utils";

type Tab = "routes" | "forms" | "params" | "jsfiles" | "api";

export default function SurfaceIntelligence() {
    const {
        scans,
        currentScan,
        currentSurface: surface,
        fetchScans,
        fetchSurface,
        fetchScanDetails,
        isLoadingStats
    } = useScanStore();

    const [activeTab, setActiveTab] = useState<Tab>("routes");
    const [searchQuery, setSearchQuery] = useState("");
    const [riskFilter, setRiskFilter] = useState<string>("all");
    const [authFilter, setAuthFilter] = useState<string>("all");
    const [selectedScanId, setSelectedScanId] = useState<string>("");

    useEffect(() => {
        fetchScans();
    }, [fetchScans]);

    useEffect(() => {
        if (scans.length > 0 && !selectedScanId) {
            setSelectedScanId(scans[0].id);
        }
    }, [scans, selectedScanId]);

    useEffect(() => {
        if (selectedScanId) {
            fetchSurface(selectedScanId);
            fetchScanDetails(selectedScanId);
        }
    }, [selectedScanId, fetchSurface, fetchScanDetails]);

    const stats = surface.stats || {
        total_routes: 0,
        total_forms: 0,
        total_params: 0,
        total_js_files: 0,
        total_api_calls: 0,
        auth_routes: 0,
        state_changing_routes: 0,
        high_risk_routes: 0,
    };

    const tabs: { key: Tab; label: string; icon: React.ElementType; count: number }[] = [
        { key: "routes", label: "Routes", icon: Route, count: stats.total_routes },
        { key: "forms", label: "Forms", icon: FormInput, count: stats.total_forms },
        { key: "params", label: "Parameters", icon: Code, count: stats.total_params },
        { key: "jsfiles", label: "JS Files", icon: FileText, count: stats.total_js_files },
        { key: "api", label: "API Calls", icon: Zap, count: stats.total_api_calls },
    ];

    const filteredRoutes = useMemo(() => {
        return surface.routes.filter((route) => {
            if (searchQuery && !route.url.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (riskFilter !== "all" && route.risk_level !== riskFilter) return false;
            if (authFilter === "auth" && !route.auth_required) return false;
            if (authFilter === "unauth" && route.auth_required) return false;
            return true;
        });
    }, [surface.routes, searchQuery, riskFilter, authFilter]);

    if (!selectedScanId && scans.length === 0) {
        return (
            <div className="p-8 text-center glass-card m-8">
                <Radio className="w-12 h-12 text-cyber-cyan mx-auto mb-4 animate-pulse" />
                <h2 className="text-xl font-bold mb-2">No Reconnaissance Data</h2>
                <p className="text-cyber-text-dim mb-6">Launch a scan to begin mapping the attack surface.</p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-cyber-green rounded-full" />
                        <h1 className="text-2xl font-bold">
                            Surface Intelligence
                        </h1>
                    </div>
                    <p className="text-cyber-text-secondary text-sm">
                        Attack surface map — discovered endpoints, forms, parameters, and API integrations
                    </p>
                </motion.div>

                {/* Scan Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-cyber-text-dim font-mono">Source Scan:</span>
                    <select
                        value={selectedScanId}
                        onChange={(e) => setSelectedScanId(e.target.value)}
                        className="cyber-input py-1.5 px-3 text-xs min-w-[200px]"
                    >
                        {scans.map(s => (
                            <option key={s.id} value={s.id}>{s.target_url.split('//')[1]} ({timeAgo(s.created_at)})</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={Route} label="Total Routes" value={stats.total_routes} accentColor="cyan" />
                <StatCard icon={Lock} label="Auth Routes" value={stats.auth_routes} accentColor="yellow" />
                <StatCard icon={Zap} label="State-Changing" value={stats.state_changing_routes} accentColor="green" />
                <StatCard icon={AlertTriangle} label="High Risk" value={stats.high_risk_routes} accentColor="red" />
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-1 border-b border-cyber-border pb-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px",
                            activeTab === tab.key
                                ? "border-cyber-cyan text-cyber-cyan"
                                : "border-transparent text-cyber-text-dim hover:text-cyber-text-secondary"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        <span className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded ml-1.5">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-text-dim" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search endpoints..."
                        className="cyber-input w-full pl-10 py-2 text-xs text-cyber-text-primary"
                    />
                </div>
                <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="cyber-input py-2 text-xs text-cyber-text-primary"
                >
                    <option value="all">All Risk Levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select
                    value={authFilter}
                    onChange={(e) => setAuthFilter(e.target.value)}
                    className="cyber-input py-2 text-xs text-cyber-text-primary"
                >
                    <option value="all">All Auth States</option>
                    <option value="auth">Authenticated</option>
                    <option value="unauth">Unauthenticated</option>
                </select>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === "routes" && (
                    <motion.div key="routes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-cyber-border text-left">
                                            <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider">Method</th>
                                            <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider">Endpoint</th>
                                            <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider">Group</th>
                                            <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider">Risk</th>
                                            <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider">Auth</th>
                                            <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider text-right">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRoutes.map((route, i) => (
                                            <motion.tr
                                                key={route.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.01 }}
                                                className="border-b border-cyber-border/50 hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="px-4 py-3">
                                                    <span className={cn(
                                                        "text-xs font-mono font-bold",
                                                        route.method === "GET" ? "text-cyber-green" :
                                                            route.method === "POST" ? "text-cyber-yellow" :
                                                                route.method === "PUT" ? "text-cyber-cyan" :
                                                                    route.method === "DELETE" ? "text-cyber-red" : "text-cyber-text-secondary"
                                                    )}>
                                                        {route.method}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs font-mono text-cyber-text-primary group-hover:text-cyber-cyan transition-colors truncate block max-w-md">
                                                        {route.url}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={cn(
                                                        "text-xs font-mono",
                                                        route.status_code < 300 ? "text-cyber-green" :
                                                            route.status_code < 400 ? "text-cyber-yellow" : "text-cyber-red"
                                                    )}>
                                                        {route.status_code}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-cyber-text-secondary">{route.functional_group}</td>
                                                <td className="px-4 py-3"><SeverityBadge severity={route.risk_level} /></td>
                                                <td className="px-4 py-3">
                                                    {route.auth_required ? (
                                                        <Lock className="w-3.5 h-3.5 text-cyber-yellow" />
                                                    ) : (
                                                        <Eye className="w-3.5 h-3.5 text-cyber-text-dim" />
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-[10px] font-mono text-cyber-text-dim">{timeAgo(route.discovered_at)}</span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "forms" && (
                    <motion.div key="forms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {surface.forms.map((form) => (
                                <div key={form.id} className="glass-card p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <span className={cn(
                                                "text-xs font-mono font-bold",
                                                form.method === "POST" ? "text-cyber-yellow" : "text-cyber-cyan"
                                            )}>
                                                {form.method}
                                            </span>
                                            <span className="text-xs font-mono text-cyber-text-primary ml-2">{form.action}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {form.is_state_changing && (
                                                <span className="text-[9px] bg-cyber-yellow/10 border border-cyber-yellow/30 text-cyber-yellow px-1.5 py-0.5 rounded font-mono uppercase">State-Change</span>
                                            )}
                                            {!form.has_csrf_token && (
                                                <span className="text-[9px] bg-cyber-red/10 border border-cyber-red/30 text-cyber-red px-1.5 py-0.5 rounded font-mono uppercase">Missing CSRF</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        {form.fields.map((field) => (
                                            <div key={field.name} className="flex items-center gap-3 text-xs bg-white/5 rounded p-2">
                                                <span className="font-mono text-cyber-text-secondary w-24 truncate">{field.name}</span>
                                                <span className="font-mono text-cyber-text-dim">{field.type}</span>
                                                {field.required && <span className="text-cyber-red text-[10px] uppercase ml-auto">Required</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === "params" && (
                    <motion.div key="params" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="glass-card overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-cyber-border">
                                        <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider text-left">Name</th>
                                        <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider text-left">Location</th>
                                        <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider text-left">Type</th>
                                        <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider text-left">Sample</th>
                                        <th className="px-4 py-3 text-[10px) font-mono uppercase text-cyber-text-dim tracking-wider text-left">Sensitive</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {surface.parameters.map((param) => (
                                        <tr key={param.id} className="border-b border-cyber-border/50 hover:bg-white/[0.02]">
                                            <td className="px-4 py-3 text-xs font-mono text-cyber-cyan">{param.name}</td>
                                            <td className="px-4 py-3 text-xs font-mono text-cyber-text-secondary">
                                                <span className={cn(
                                                    "px-1.5 py-0.5 rounded text-[10px] border font-mono uppercase",
                                                    param.location === "path" ? "bg-cyber-purple/10 border-cyber-purple/30 text-cyber-purple" :
                                                        param.location === "query" ? "bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan" :
                                                            param.location === "body" ? "bg-cyber-yellow/10 border-cyber-yellow/30 text-cyber-yellow" :
                                                                "bg-white/10 text-cyber-text-dim border-cyber-border"
                                                )}>
                                                    {param.location}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-cyber-text-dim font-mono">{param.param_type}</td>
                                            <td className="px-4 py-3 text-xs font-mono text-cyber-text-dim truncate max-w-[200px]">{param.sample_value}</td>
                                            <td className="px-4 py-3">
                                                {param.is_sensitive && <Shield className="w-3.5 h-3.5 text-cyber-red" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === "jsfiles" && (
                    <motion.div key="jsfiles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="space-y-3">
                            {surface.jsFiles.map((file) => (
                                <div key={file.id} className="glass-card p-4 hover:border-cyber-cyan/20 transition-all">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-cyber-yellow" />
                                            <span className="text-sm font-mono text-cyber-text-primary truncate block max-w-xl">{file.url}</span>
                                        </div>
                                        <span className="text-xs font-mono text-cyber-text-dim">{(file.size / 1024).toFixed(0)} KB</span>
                                    </div>
                                    <div className="flex gap-2 mb-2">
                                        {file.has_api_endpoints && (
                                            <span className="text-[9px] bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan px-1.5 py-0.5 rounded font-mono uppercase">API Endpoints</span>
                                        )}
                                        {file.has_sensitive_data && (
                                            <span className="text-[9px] bg-cyber-red/10 border border-cyber-red/30 text-cyber-red px-1.5 py-0.5 rounded font-mono uppercase">Sensitive Info</span>
                                        )}
                                    </div>
                                    {file.endpoints_found.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {file.endpoints_found.map((ep) => (
                                                <span key={ep} className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-cyber-text-dim">
                                                    {ep}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === "api" && (
                    <motion.div key="api" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="glass-card overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-cyber-border">
                                        <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider text-left">Method</th>
                                        <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider text-left">Endpoint</th>
                                        <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider text-left">Source</th>
                                        <th className="px-4 py-3 text-[10px] font-mono uppercase text-cyber-text-dim tracking-wider text-left">Auth</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {surface.apiCalls.map((call) => (
                                        <tr key={call.id} className="border-b border-cyber-border/50 hover:bg-white/[0.02]">
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "text-xs font-mono font-bold",
                                                    call.method === "GET" ? "text-cyber-green" :
                                                        call.method === "POST" ? "text-cyber-yellow" :
                                                            call.method === "DELETE" ? "text-cyber-red" : "text-cyber-cyan"
                                                )}>
                                                    {call.method}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono text-cyber-text-primary">{call.url}</td>
                                            <td className="px-4 py-3 text-xs text-cyber-text-dim font-mono">{call.source}</td>
                                            <td className="px-4 py-3">
                                                {call.auth_header && <Lock className="w-3.5 h-3.5 text-cyber-yellow" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
