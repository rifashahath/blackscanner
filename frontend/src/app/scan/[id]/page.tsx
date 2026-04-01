"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Radio, Globe, FileText, Code, Shield, Activity,
    ArrowLeft, Brain, Network, StopCircle,
    CheckCircle, Route, FormInput, Target,
    Zap, Binary, ChevronRight, AlertTriangle
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { TerminalPanel } from "@/components/shared/TerminalPanel";
import { PhaseProgress, ProgressBar } from "@/components/shared/ProgressBar";
import { SeverityBadge } from "@/components/shared/Badges";
import { AttackSurfaceGraph } from "@/components/scan/AttackSurfaceGraph";
import { useScanStore } from "@/store/useScanStore";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function LiveScanView({ params }: { params: { id: string } }) {
    const {
        currentScan: scan,
        currentEvents: events,
        currentSurface: surface,
        currentHypotheses: hypotheses,
        currentFindings: findings,
        fetchScanDetails,
        fetchScanEvents,
        fetchSurface,
        fetchHypotheses,
        fetchFindings,
        cancelScan,
        isLoadingCurrent
    } = useScanStore();

    const [activeTab, setActiveTab] = useState<"events" | "ai" | "graph">("events");

    useEffect(() => {
        const fetchAll = () => {
            fetchScanDetails(params.id);
            fetchScanEvents(params.id);
            fetchSurface(params.id);
            fetchHypotheses(params.id);
            fetchFindings(params.id);
        };

        fetchAll();

        const interval = setInterval(() => {
            if (scan?.status !== "completed" && scan?.status !== "failed" && scan?.status !== "cancelled") {
                fetchAll();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [params.id, fetchScanDetails, fetchScanEvents, fetchSurface, fetchHypotheses, fetchFindings, scan?.status]);

    const getPhaseStatus = (phase: string): "completed" | "active" | "pending" => {
        if (!scan) return "pending";
        const phaseOrder = ["init", "infra", "crawl", "parse", "analyze", "verify", "report"];
        const statusMap: Record<string, number> = {
            pending: 0, infra_scanning: 1, crawling: 2, parsing: 3, analyzing: 4, verifying: 5,
            generating_report: 6, completed: 7, failed: 7, cancelled: 7,
        };
        const currentIdx = statusMap[scan.status] ?? 0;
        const phaseIdx = phaseOrder.indexOf(phase);
        if (phaseIdx < currentIdx) return "completed";
        if (phaseIdx === currentIdx) return "active";
        return "pending";
    };

    const phases = [
        { name: "Init", status: getPhaseStatus("init") },
        { name: "Infra Scan", status: getPhaseStatus("infra") },
        { name: "Crawl", status: getPhaseStatus("crawl") },
        { name: "Parse", status: getPhaseStatus("parse") },
        { name: "Analyze", status: getPhaseStatus("analyze") },
        { name: "Verify", status: getPhaseStatus("verify") },
        { name: "Report", status: getPhaseStatus("report") },
    ];

    const aiEvents = events.filter((e) => e.type === "ai" || e.phase === "analyze" || e.phase === "verify");

    if (!scan && isLoadingCurrent) {
        return (
            <div className="flex items-center justify-center h-full bg-[#0B1220]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-20 h-20">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-hud-accent/40 rounded-full" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Binary className="w-8 h-8 text-hud-accent animate-pulse" />
                        </div>
                    </div>
                    <p className="text-hud-accent font-orbitron font-bold text-xs uppercase tracking-[0.4em] animate-pulse">Establishing Data Stream...</p>
                </div>
            </div>
        );
    }

    if (!scan) return null;

    return (
        <div className="p-6 lg:p-12 max-w-[1800px] mx-auto space-y-10">
            {/* HUD Navigation Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-hud-accent/10 pb-8">
                <div className="space-y-4">
                    <Link href="/" className="group flex items-center gap-2 text-[10px] font-bold text-hud-dim hover:text-hud-accent transition-colors uppercase tracking-widest font-orbitron">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        Back to Primary Hub
                    </Link>
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 skew-x-[-12deg] bg-hud-accent/10 border border-hud-accent/30 flex items-center justify-center">
                            {scan.status !== "completed" ? (
                                <Radio className="w-6 h-6 text-hud-accent animate-pulse skew-x-[12deg]" />
                            ) : (
                                <CheckCircle className="w-6 h-6 text-hud-secondary skew-x-[12deg]" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tighter text-white font-orbitron">
                                LIVE <span className="text-hud-accent">OPS</span> MONITORING
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-mono text-hud-accent opacity-60 px-2 py-0.5 border border-hud-accent/20 bg-hud-accent/5">{scan.id}</span>
                                <span className="text-[10px] text-hud-dim font-bold tracking-widest uppercase">{scan.target_url}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-[9px] text-hud-dim font-bold uppercase tracking-widest mb-1">OPERATION_STATUS</span>
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px]", scan.status === 'completed' ? "bg-hud-secondary shadow-hud-secondary" : "bg-hud-accent shadow-hud-accent animate-ping")} />
                            <span className={cn("text-xs font-black uppercase font-orbitron italic", scan.status === 'completed' ? "text-hud-secondary" : "text-hud-accent")}>{scan.status}</span>
                        </div>
                    </div>
                    {scan.status !== "completed" && scan.status !== "failed" && scan.status !== "cancelled" && (
                        <button
                            onClick={() => cancelScan(scan.id)}
                            className="hud-btn bg-hud-red/10 border-hud-red text-white hover:bg-hud-red/20 px-8 py-3"
                        >
                            <StopCircle className="w-4 h-4" /> ABORT_SCAN
                        </button>
                    )}
                    {scan.status === "completed" && (
                        <GenerateReportButton scanId={scan.id} />
                    )}
                </div>
            </div>

            {/* Operational Pipeline HUD */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 bg-hud-surface/20"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Target className="w-4 h-4 text-hud-accent" />
                        <span className="text-xs font-bold font-orbitron tracking-widest">MISSION_PIPELINE [ID: {scan.mode.toUpperCase()}]</span>
                    </div>
                    <div className="h-[2px] w-48 bg-hud-accent/10" />
                    <span className="text-[10px] font-bold text-hud-dim tracking-[0.2em] font-orbitron uppercase">
                        Current: <span className="text-hud-accent">{scan.current_phase || scan.status}</span>
                    </span>
                </div>
                <PhaseProgress phases={phases} />
                <div className="flex items-center gap-6 mt-10">
                    <div className="flex-1">
                        <ProgressBar value={scan.progress} label="Neural Convergence" />
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black italic text-hud-accent font-orbitron">{scan.progress}%</span>
                    </div>
                </div>
            </motion.div>

            {/* HUD Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <StatCard icon={Route} label="Surfaces" value={scan.routes_found} accentColor="cyan" />
                <StatCard icon={FormInput} label="Active_Forms" value={scan.forms_found} accentColor="green" />
                <StatCard icon={Code} label="Params" value={scan.params_found} accentColor="purple" />
                <StatCard icon={FileText} label="Binaries" value={scan.js_files_found} accentColor="yellow" />
                <StatCard icon={Globe} label="Endpoints" value={scan.api_calls_found} accentColor="cyan" />
                <StatCard icon={Shield} label="Anomalies" value={scan.findings_count} accentColor="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Data Feed Panels */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex gap-2">
                        {[
                            { key: "events", label: "LOG_STREAM", icon: Activity },
                            { key: "ai", label: "AI_COGNITION", icon: Brain },
                            { key: "graph", label: "SURFACE_LAYOUT", icon: Network },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                className={cn(
                                    "flex items-center gap-3 px-6 py-3 border skew-x-[-12deg] transition-all duration-300",
                                    activeTab === tab.key
                                        ? "bg-hud-accent text-hud-bg border-hud-accent shadow-[0_0_15px_rgba(0,229,255,0.4)] font-black"
                                        : "bg-transparent border-hud-accent/20 text-hud-dim hover:bg-hud-accent/5 hover:border-hud-accent/40 font-bold"
                                )}
                            >
                                <tab.icon className="w-4 h-4 skew-x-[12deg]" />
                                <span className="text-[10px] skew-x-[12deg] font-orbitron tracking-widest">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1">
                        {activeTab === "events" && <TerminalPanel events={events} maxHeight="620px" />}
                        {activeTab === "ai" && <TerminalPanel events={aiEvents} title="Neural Intelligence Output" maxHeight="620px" />}
                        {activeTab === "graph" && (
                            <div className="h-[620px] glass-card bg-hud-surface/40">
                                <AttackSurfaceGraph surface={surface} targetUrl={scan.target_url} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Discovery Panels */}
                <div className="lg:col-span-4 space-y-6">
                    {/* AI Hypotheses HUD */}
                    <div className="glass-card bg-hud-surface/10">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-hud-accent/10">
                            <div className="flex items-center gap-3">
                                <Brain className="w-4 h-4 text-hud-purple" />
                                <span className="text-[10px] font-black italic font-orbitron text-hud-purple tracking-widest">COGNITIVE_HYPOTHESES</span>
                            </div>
                            <span className="text-xs font-bold text-hud-dim font-mono">[{hypotheses.length}]</span>
                        </div>
                        <div className="divide-y divide-hud-accent/5 max-h-[350px] overflow-y-auto">
                            {hypotheses.length === 0 && (
                                <div className="p-12 text-center">
                                    <Zap className="w-8 h-8 text-hud-dim opacity-20 mx-auto mb-3 animate-pulse" />
                                    <p className="text-[9px] text-hud-dim font-bold uppercase tracking-[0.3em]">Neural analysis initialization...</p>
                                </div>
                            )}
                            {hypotheses.map((hyp) => (
                                <div key={hyp.id} className="p-4 hover:bg-white/[0.02] transition-colors group cursor-default">
                                    <div className="flex items-start justify-between mb-2">
                                        <SeverityBadge severity={hyp.severity} />
                                        <span className={cn(
                                            "text-[8px] font-bold px-1.5 py-0.5 border skew-x-[-12deg]",
                                            hyp.status === "verified" ? "text-hud-secondary border-hud-secondary/20 bg-hud-secondary/5" : "text-hud-purple border-hud-purple/20 bg-hud-purple/5"
                                        )}>
                                            <span className="skew-x-[12deg] inline-block uppercase font-orbitron font-black">{hyp.status}</span>
                                        </span>
                                    </div>
                                    <p className="text-xs font-black italic tracking-tight font-orbitron mt-2 group-hover:text-hud-accent transition-colors">{'>> '}{hyp.title}</p>
                                    <p className="text-[9px] text-hud-dim mt-1 font-bold tracking-widest uppercase opacity-60">CAT: {hyp.category}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Verified Anomalies Panel */}
                    <div className="glass-card bg-hud-red/5">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-hud-accent/10">
                            <div className="flex items-center gap-3">
                                <Shield className="w-4 h-4 text-cyber-red" />
                                <span className="text-[10px] font-black italic font-orbitron text-cyber-red tracking-widest">VERIFIED_ANOMALIES</span>
                            </div>
                            <span className="text-xs font-bold text-cyber-red font-mono">[{findings.filter(f => f.status === 'verified').length}]</span>
                        </div>
                        <div className="divide-y divide-hud-accent/5 max-h-[350px] overflow-y-auto">
                            {findings.filter(f => f.status === 'verified').length === 0 && (
                                <div className="p-12 text-center">
                                    <Shield className="w-8 h-8 text-hud-dim opacity-10 mx-auto mb-3" />
                                    <p className="text-[9px] text-hud-dim font-bold uppercase tracking-[0.3em]">No critical breaches confirmed.</p>
                                </div>
                            )}
                            {findings.filter(f => f.status === 'verified').map((finding) => (
                                <Link key={finding.id} href={`/findings/${finding.id}`}>
                                    <div className="p-4 hover:bg-cyber-red/10 transition-colors cursor-pointer group">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 bg-cyber-red/10 flex items-center justify-center shrink-0 border border-cyber-red/20 skew-x-[-12deg]">
                                                <AlertTriangle className="w-4 h-4 text-cyber-red skew-x-[12deg]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black italic font-orbitron tracking-tight leading-tight group-hover:text-cyber-red transition-colors">
                                                    {finding.title}
                                                </p>
                                                <p className="text-[9px] text-hud-dim mt-1 font-mono truncate opacity-60">
                                                    ADDR: {finding.affected_route}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-3 h-3 text-hud-dim group-hover:text-cyber-red" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GenerateReportButton({ scanId }: { scanId: string }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await api.generateReport(scanId, "json");
            // Small delay to ensure DB commit is visible to next page
            setTimeout(() => {
                window.location.href = "/reports";
            }, 500);
        } catch (err) {
            console.error(err);
            alert("Failed to generate report. Check console for details.");
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn(
                "hud-btn bg-hud-accent/10 border-hud-accent text-white hover:bg-hud-accent/20 px-8 py-3",
                isGenerating && "opacity-70 cursor-wait"
            )}
        >
            {isGenerating ? (
                <>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 rounded-full border-2 border-hud-accent/30 border-t-hud-accent"
                    />
                    GENERATING...
                </>
            ) : (
                <>
                    <FileText className="w-4 h-4" /> GENERATE_REPORT
                </>
            )}
        </button>
    );
}
