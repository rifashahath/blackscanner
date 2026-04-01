"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Shield, AlertTriangle, Filter, Search, ArrowRight,
    ChevronDown, ChevronUp, Globe, Brain, Eye, CheckCircle, Radio
} from "lucide-react";
import { SeverityBadge, StatusBadge, ConfidenceBadge } from "@/components/shared/Badges";
import { useScanStore } from "@/store/useScanStore";
import { cn, severityColor, timeAgo } from "@/lib/utils";
import { Severity, FindingStatus } from "@/types";

export default function FindingsBoard() {
    const {
        scans,
        currentFindings: findings,
        fetchScans,
        fetchFindings,
        isLoadingStats
    } = useScanStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [severityFilter, setSeverityFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);
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
            fetchFindings(selectedScanId);
        }
    }, [selectedScanId, fetchFindings]);

    const filteredFindings = useMemo(() => {
        return findings.filter((f) => {
            if (searchQuery && !f.title.toLowerCase().includes(searchQuery.toLowerCase()) && !f.affected_route.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (severityFilter !== "all" && f.severity !== severityFilter) return false;
            if (statusFilter !== "all" && f.status !== statusFilter) return false;
            return true;
        });
    }, [findings, searchQuery, severityFilter, statusFilter]);

    const severityCounts: Record<string, number> = {
        critical: findings.filter(f => f.severity === "critical").length,
        high: findings.filter(f => f.severity === "high").length,
        medium: findings.filter(f => f.severity === "medium").length,
        low: findings.filter(f => f.severity === "low").length,
    };

    if (!selectedScanId && scans.length === 0) {
        return (
            <div className="p-8 text-center glass-card m-8 border-cyber-red/20 border">
                <Shield className="w-12 h-12 text-cyber-red mx-auto mb-4 animate-pulse" />
                <h2 className="text-xl font-bold mb-2">No Security Findings</h2>
                <p className="text-cyber-text-dim mb-6">Security assessments have not generated any findings yet.</p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-cyber-red" />
                        <h1 className="text-2xl font-bold">
                            Findings <span className="neon-text-cyan">Board</span>
                        </h1>
                    </div>
                    <p className="text-cyber-text-secondary text-sm">
                        Verified vulnerabilities and security findings from AI analysis
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

            {/* Severity Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["critical", "high", "medium", "low"] as const).map((sev) => (
                    <motion.button
                        key={sev}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSeverityFilter(severityFilter === sev ? "all" : sev)}
                        className={cn(
                            "glass-card p-4 text-center transition-all border",
                            severityFilter === sev ? "border-cyber-cyan/50 shadow-cyber-cyan bg-cyber-cyan/5" : "border-cyber-border"
                        )}
                    >
                        <p className={cn("text-2xl font-bold font-mono", severityColor(sev))}>
                            {severityCounts[sev]}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-cyber-text-dim mt-1 font-medium">{sev}</p>
                    </motion.button>
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
                        placeholder="Search findings or routes..."
                        className="cyber-input w-full pl-10 py-2 text-xs text-cyber-text-primary"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="cyber-input py-2 text-xs text-cyber-text-primary"
                >
                    <option value="all">All Statuses</option>
                    <option value="verified">Verified</option>
                    <option value="suspicious">Suspicious</option>
                    <option value="hypothesis">Hypothesis</option>
                </select>
            </div>

            {/* Findings List */}
            <div className="space-y-3 min-h-[100px]">
                {filteredFindings.length === 0 && (
                    <div className="glass-card p-12 text-center text-cyber-text-dim italic">
                        No findings match your current filter criteria.
                    </div>
                )}

                {filteredFindings.map((finding, i) => (
                    <motion.div
                        key={finding.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card overflow-hidden transition-all hover:bg-white/[0.01]"
                    >
                        {/* Card Header */}
                        <div
                            onClick={() => setExpandedId(expandedId === finding.id ? null : finding.id)}
                            className="p-4 flex items-start gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors group"
                        >
                            <div className="flex-shrink-0 mt-1">
                                <SeverityBadge severity={finding.severity} size="md" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="text-sm font-semibold group-hover:text-cyber-cyan transition-colors">
                                        {finding.title}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <StatusBadge status={finding.status} />
                                    <ConfidenceBadge confidence={finding.confidence} />
                                    <span className="text-[10px] font-mono text-cyber-text-dim bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                                        {finding.category}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-xs text-cyber-text-dim">
                                    <Globe className="w-3 h-3" />
                                    <span className="font-mono truncate block max-w-sm">{finding.affected_route}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="hidden sm:block text-right">
                                    <p className="text-[10px] text-cyber-text-dim font-mono">{finding.evidence_count} evidence items</p>
                                    <p className="text-[9px] text-cyber-text-dim/60 font-mono mt-0.5">{timeAgo(finding.created_at)}</p>
                                </div>
                                <Link
                                    href={`/findings/${finding.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-cyber-cyan hover:underline text-xs flex items-center gap-1 bg-cyber-cyan/5 px-2 py-1 rounded border border-cyber-cyan/10"
                                >
                                    Report <ArrowRight className="w-3 h-3" />
                                </Link>
                                {expandedId === finding.id ? (
                                    <ChevronUp className="w-4 h-4 text-cyber-text-dim" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-cyber-text-dim" />
                                )}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                            {expandedId === finding.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 border-t border-cyber-border pt-4 space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-bold text-cyber-text-dim uppercase tracking-wider mb-2">Description</h4>
                                            <p className="text-sm text-cyber-text-secondary leading-relaxed">{finding.description}</p>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-[10px] font-bold text-cyber-text-dim uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                    <Brain className="w-3 h-3 text-cyber-purple" /> AI Reasoning
                                                </h4>
                                                <div className="text-xs text-cyber-text-secondary bg-cyber-purple/5 p-3 rounded-lg border border-cyber-purple/20">
                                                    {finding.ai_reasoning}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-bold text-cyber-text-dim uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                    <CheckCircle className="w-3 h-3 text-cyber-green" /> Remediation
                                                </h4>
                                                <div className="text-xs text-cyber-text-secondary bg-cyber-green/5 p-3 rounded-lg border border-cyber-green/20">
                                                    {finding.remediation}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
