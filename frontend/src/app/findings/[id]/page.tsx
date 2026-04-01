"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft, Shield, Brain, CheckCircle, Globe, FileText,
    Code, Copy, ExternalLink, AlertTriangle, Eye, Loader2
} from "lucide-react";
import { SeverityBadge, StatusBadge, ConfidenceBadge } from "@/components/shared/Badges";
import { useScanStore } from "@/store/useScanStore";
import { cn, severityColor, timeAgo } from "@/lib/utils";

export default function FindingDetail({ params }: { params: { id: string } }) {
    const {
        currentFindingDetail: finding,
        fetchFinding,
        isLoadingCurrent
    } = useScanStore();

    const [activeTab, setActiveTab] = useState<"overview" | "evidence" | "remediation">("overview");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchFinding(params.id);
        }
    }, [params.id, fetchFinding]);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (isLoadingCurrent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-cyber-cyan animate-spin" />
                <p className="text-cyber-text-dim font-mono">Retrieving finding analysis...</p>
            </div>
        );
    }

    if (!finding) {
        return (
            <div className="p-8 text-center glass-card m-8 border-cyber-red/20 border">
                <Shield className="w-12 h-12 text-cyber-red mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-bold mb-2">Finding Not Found</h2>
                <p className="text-cyber-text-dim mb-6">The vulnerability record could not be located in the database.</p>
                <Link href="/findings" className="cyber-button">
                    Return to Findings Board
                </Link>
            </div>
        );
    }

    const evidence = finding.evidence || [];

    return (
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
            {/* Header */}
            <div>
                <Link href="/findings" className="text-xs text-cyber-text-dim hover:text-cyber-cyan flex items-center gap-1 mb-3 transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Back to Findings Board
                </Link>
                <div className="flex items-start gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0",
                        finding.severity === "critical" ? "bg-cyber-red/10 border-cyber-red/30" :
                            finding.severity === "high" ? "bg-orange-500/10 border-orange-500/30" :
                                "bg-cyber-yellow/10 border-cyber-yellow/30"
                    )}>
                        <Shield className={cn("w-6 h-6", severityColor(finding.severity))} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                            <SeverityBadge severity={finding.severity} size="md" />
                            <StatusBadge status={finding.status} />
                            <ConfidenceBadge confidence={finding.confidence} />
                        </div>
                        <h1 className="text-xl font-bold mb-1">{finding.title}</h1>
                        <div className="flex items-center gap-4 text-xs text-cyber-text-dim font-mono">
                            <span className="flex items-center gap-1.5">
                                <Globe className="w-3 h-3" /> {finding.affected_route}
                            </span>
                            <span className="bg-white/5 px-2 py-0.5 rounded">{finding.category}</span>
                            <span>{evidence.length} evidence items</span>
                            <span>{timeAgo(finding.created_at)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-cyber-border">
                {[
                    { key: "overview", label: "Overview", icon: Eye },
                    { key: "evidence", label: "Evidence", icon: FileText },
                    { key: "remediation", label: "Remediation", icon: CheckCircle },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all",
                            activeTab === tab.key
                                ? "border-cyber-cyan text-cyber-cyan"
                                : "border-transparent text-cyber-text-dim hover:text-cyber-text-secondary"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-tight">
                                <AlertTriangle className={cn("w-4 h-4", severityColor(finding.severity))} />
                                Vulnerability Description
                            </h3>
                            <p className="text-sm text-cyber-text-secondary leading-relaxed">{finding.description}</p>
                        </div>

                        <div className="glass-card p-6 border-cyber-purple/20">
                            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-tight text-cyber-purple">
                                <Brain className="w-4 h-4" />
                                AI Analysis & Reasoning
                            </h3>
                            <div className="bg-cyber-purple/5 border border-cyber-purple/10 rounded-lg p-4">
                                <p className="text-sm text-cyber-text-secondary leading-relaxed whitespace-pre-wrap">{finding.ai_reasoning}</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Category", value: finding.category },
                                { label: "Severity", value: finding.severity, color: severityColor(finding.severity) },
                                { label: "Confidence", value: finding.confidence },
                                { label: "Status", value: finding.status },
                            ].map((item) => (
                                <div key={item.label} className="glass-card p-4">
                                    <p className="text-[10px] uppercase tracking-wider text-cyber-text-dim mb-1.5 font-bold">{item.label}</p>
                                    <p className={cn("text-sm font-semibold capitalize font-mono", item.color || "text-cyber-text-primary")}>
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === "evidence" && (
                    <motion.div
                        key="evidence"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {evidence.length === 0 ? (
                            <div className="glass-card p-12 text-center opacity-70">
                                <FileText className="w-12 h-12 text-cyber-text-dim mx-auto mb-3" />
                                <p className="text-cyber-text-dim font-mono">No evidence items collected yet</p>
                            </div>
                        ) : (
                            evidence.map((ev) => (
                                <div key={ev.id} className="glass-card overflow-hidden">
                                    <div className="flex items-center justify-between p-4 border-b border-cyber-border bg-white/[0.01]">
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold",
                                                ev.type === "request" ? "bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan" :
                                                    ev.type === "response" ? "bg-cyber-green/10 border-cyber-green/30 text-cyber-green" :
                                                        ev.type === "diff" ? "bg-cyber-yellow/10 border-cyber-yellow/30 text-cyber-yellow" :
                                                            "bg-white/5 text-cyber-text-dim border-white/10"
                                            )}>
                                                {ev.type}
                                            </span>
                                            <h4 className="text-sm font-semibold">{ev.title}</h4>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(
                                                ev.request_data ? JSON.stringify(ev.request_data, null, 2) :
                                                    ev.response_data ? ev.response_data.body :
                                                        ev.diff_content || "", ev.id
                                            )}
                                            className="text-xs text-cyber-text-dim hover:text-cyber-cyan flex items-center gap-1.5 transition-colors font-mono"
                                        >
                                            <Copy className="w-3 h-3" />
                                            {copiedId === ev.id ? "Copied!" : "Copy Raw"}
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-xs text-cyber-text-secondary mb-4 leading-relaxed">{ev.description}</p>

                                        {/* Request */}
                                        {ev.request_data && (
                                            <div className="bg-cyber-bg rounded-lg border border-cyber-border overflow-hidden">
                                                <div className="px-3 py-2 border-b border-cyber-border flex items-center gap-2 bg-white/5">
                                                    <span className="text-[10px] font-mono font-bold text-cyber-green uppercase">HTTP {ev.request_data.method}</span>
                                                    <span className="text-xs font-mono text-cyber-text-primary truncate">{ev.request_data.url}</span>
                                                </div>
                                                <div className="p-3 font-mono text-[11px] space-y-0.5">
                                                    {Object.entries(ev.request_data.headers).map(([key, val]) => (
                                                        <div key={key} className="flex gap-2">
                                                            <span className="text-cyber-cyan shrink-0">{key}:</span>
                                                            <span className="text-cyber-text-dim break-all">{val}</span>
                                                        </div>
                                                    ))}
                                                    {ev.request_data.body && (
                                                        <div className="mt-2 pt-2 border-t border-cyber-border">
                                                            <span className="text-cyber-yellow block mb-1">Body:</span>
                                                            <pre className="text-cyber-text-secondary whitespace-pre-wrap">{ev.request_data.body}</pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Response */}
                                        {ev.response_data && (
                                            <div className="bg-cyber-bg rounded-lg border border-cyber-border overflow-hidden mt-3">
                                                <div className="px-3 py-2 border-b border-cyber-border flex items-center gap-3 bg-white/5">
                                                    <span className={cn(
                                                        "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                                                        ev.response_data.status_code < 300 ? "bg-cyber-green/10 text-cyber-green" : "bg-cyber-red/10 text-cyber-red"
                                                    )}>
                                                        {ev.response_data.status_code}
                                                    </span>
                                                    <span className="text-[10px] text-cyber-text-dim font-mono">{ev.response_data.response_time_ms}ms response</span>
                                                </div>
                                                <pre className="p-3 font-mono text-[11px] text-cyber-text-secondary overflow-x-auto whitespace-pre-wrap max-h-[400px] overflow-y-auto leading-relaxed">
                                                    {ev.response_data.body}
                                                </pre>
                                            </div>
                                        )}

                                        {/* Diff */}
                                        {ev.diff_content && (
                                            <div className="bg-cyber-bg rounded-lg border border-cyber-border overflow-hidden mt-3">
                                                <pre className="p-3 font-mono text-[11px] overflow-x-auto whitespace-pre max-h-[500px] overflow-y-auto">
                                                    {ev.diff_content.split("\n").map((line, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={cn(
                                                                "px-2 py-0.5",
                                                                line.startsWith("+") ? "bg-cyber-green/5 text-cyber-green" :
                                                                    line.startsWith("-") ? "bg-cyber-red/5 text-cyber-red" :
                                                                        line.startsWith("@@") ? "text-cyber-cyan/50 italic" :
                                                                            "text-cyber-text-dim/80"
                                                            )}
                                                        >
                                                            {line}
                                                        </div>
                                                    ))}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}

                {activeTab === "remediation" && (
                    <motion.div
                        key="remediation"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="glass-card p-6 border-cyber-green/20">
                            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-tight text-cyber-green">
                                <CheckCircle className="w-4 h-4" />
                                Remediation Guidance
                            </h3>
                            <div className="bg-cyber-green/5 border border-cyber-green/10 rounded-lg p-5">
                                <p className="text-sm text-cyber-text-secondary leading-relaxed whitespace-pre-wrap">{finding.remediation}</p>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="text-sm font-bold mb-4 uppercase tracking-tight">Vulnerability Context</h3>
                            <div className="space-y-3">
                                {[
                                    { label: "OWASP API Security Top 10", url: "https://owasp.org/API-Security/", ref: "API-1:2023" },
                                    { label: "CWE Common Weakness Enumeration", url: "https://cwe.mitre.org/data/definitions/284.html", ref: "CWE-284" },
                                    { label: "NIST Security Standards", url: "https://csrc.nist.gov/", ref: "SP 800-53" },
                                ].map((ref) => (
                                    <a key={ref.label} href={ref.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:border-cyber-cyan/30 hover:bg-white/5 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-cyber-bg flex items-center justify-center border border-white/10 group-hover:border-cyber-cyan/20">
                                                <ExternalLink className="w-3.5 h-3.5 text-cyber-text-dim group-hover:text-cyber-cyan" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold">{ref.label}</p>
                                                <p className="text-[10px] text-cyber-text-dim font-mono">{ref.ref}</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-cyber-text-dim group-hover:text-cyber-cyan" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
