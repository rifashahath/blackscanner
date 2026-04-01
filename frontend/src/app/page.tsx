"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Shield, AlertTriangle, Globe,
    Clock, ArrowRight, Lock, Eye, Zap,
    Activity, Target, BarChart3, Search,
    Cpu, Server, Database, Radio, Wifi,
    ChevronRight, TrendingUp, CheckCircle
} from "lucide-react";
import { useScanStore } from "@/store/useScanStore";
import { cn, timeAgo } from "@/lib/utils";
import { ScanMode } from "@/types";

// ── Stat Card ──────────────────────────────────────────────
function CyberStatCard({ icon: Icon, label, value, accent = "green", subtitle }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    accent?: "green" | "teal" | "red" | "yellow" | "purple";
    subtitle?: string;
}) {
    const colors = {
        green: { color: "#00FFB2", bg: "rgba(0,255,178,0.06)", border: "rgba(0,255,178,0.2)", glow: "rgba(0,255,178,0.3)" },
        teal: { color: "#00D1FF", bg: "rgba(0,209,255,0.06)", border: "rgba(0,209,255,0.2)", glow: "rgba(0,209,255,0.3)" },
        red: { color: "#FF3D5A", bg: "rgba(255,61,90,0.06)", border: "rgba(255,61,90,0.2)", glow: "rgba(255,61,90,0.3)" },
        yellow: { color: "#FFD600", bg: "rgba(255,214,0,0.06)", border: "rgba(255,214,0,0.2)", glow: "rgba(255,214,0,0.3)" },
        purple: { color: "#BD00FF", bg: "rgba(189,0,255,0.06)", border: "rgba(189,0,255,0.2)", glow: "rgba(189,0,255,0.3)" },
    };
    const c = colors[accent];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative p-5 overflow-hidden"
            style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
            }}
        >
            {/* Top line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, ${c.color}, transparent)` }} />
            {/* Corner dot */}
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: c.color, boxShadow: `0 0 6px ${c.glow}` }} />

            <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 flex items-center justify-center" style={{ background: `rgba(5,9,15,0.6)`, border: `1px solid ${c.border}` }}>
                    <Icon className="w-4 h-4" style={{ color: c.color }} />
                </div>
            </div>
            <div className="text-3xl font-black font-orbitron italic tracking-tight" style={{ color: c.color, textShadow: `0 0 20px ${c.glow}` }}>
                {value}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] font-orbitron mt-1.5" style={{ color: "#9FB3C8" }}>
                {label}
            </div>
            {subtitle && <div className="text-[10px] font-rajdhani mt-1" style={{ color: "#4A6080" }}>{subtitle}</div>}
        </motion.div>
    );
}

// ── Scan Mode Button ───────────────────────────────────────
function ModeButton({ mode, active, onClick }: { mode: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="px-5 py-2.5 font-orbitron text-[10px] font-bold uppercase tracking-widest transition-all duration-200 relative"
            style={{
                background: active ? "rgba(0,255,178,0.12)" : "transparent",
                color: active ? "#00FFB2" : "#4A6080",
                border: active ? "1px solid rgba(0,255,178,0.4)" : "1px solid transparent",
                boxShadow: active ? "0 0 15px rgba(0,255,178,0.2), inset 0 0 15px rgba(0,255,178,0.05)" : "none",
                clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
            }}
        >
            {active && (
                <span className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: "#00FFB2", boxShadow: "0 0 6px #00FFB2" }} />
            )}
            {mode}
        </button>
    );
}

// ── Scan Row ───────────────────────────────────────────────
function ScanRow({ scan, index }: { scan: any; index: number }) {
    const isLive = !["completed", "failed", "cancelled"].includes(scan.status);
    const statusColor = scan.status === "completed" ? "#00FFB2" : scan.status === "failed" ? "#FF3D5A" : "#00D1FF";

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link href={`/scan/${scan.id}`}>
                <div
                    className="group flex items-center gap-5 p-4 transition-all duration-200 cursor-pointer relative overflow-hidden"
                    style={{
                        border: "1px solid rgba(0,255,178,0.06)",
                        background: "rgba(10,16,32,0.4)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0,255,178,0.03)";
                        e.currentTarget.style.borderColor = "rgba(0,255,178,0.15)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(10,16,32,0.4)";
                        e.currentTarget.style.borderColor = "rgba(0,255,178,0.06)";
                    }}
                >
                    {/* Left status stripe */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />

                    {/* Index badge */}
                    <div
                        className="w-9 h-9 flex items-center justify-center font-orbitron font-black text-sm flex-shrink-0"
                        style={{
                            background: "rgba(5,9,15,0.8)",
                            border: `1px solid ${statusColor}30`,
                            color: statusColor,
                        }}
                    >
                        {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-bold font-rajdhani truncate" style={{ color: "#E6F1FF" }}>
                                {scan.target_url}
                            </span>
                            <span
                                className="text-[9px] font-orbitron font-black uppercase px-2 py-0.5 flex-shrink-0"
                                style={{
                                    background: "rgba(0,255,178,0.05)",
                                    border: "1px solid rgba(0,255,178,0.15)",
                                    color: "#00FFB2",
                                }}
                            >
                                {scan.mode}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-mono">
                            <span className="flex items-center gap-1.5" style={{ color: statusColor }}>
                                {isLive && (
                                    <motion.span
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="w-1.5 h-1.5 rounded-full inline-block"
                                        style={{ background: statusColor, boxShadow: `0 0 4px ${statusColor}` }}
                                    />
                                )}
                                {scan.status.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1" style={{ color: "#4A6080" }}>
                                <Globe className="w-3 h-3" />
                                {scan.routes_found} routes
                            </span>
                            <span style={{ color: "#4A6080" }}>{timeAgo(scan.created_at)}</span>
                        </div>
                    </div>

                    {/* Findings count */}
                    <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-black font-orbitron" style={{ color: scan.findings_count > 0 ? "#FF3D5A" : "#4A6080" }}>
                            {scan.findings_count}
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#4A6080" }}>FINDINGS</div>
                    </div>

                    <ChevronRight className="w-4 h-4 flex-shrink-0 transition-all duration-200 group-hover:translate-x-1" style={{ color: "#4A6080" }} />
                </div>
            </Link>
        </motion.div>
    );
}

// ── Main Page ──────────────────────────────────────────────
export default function CommandCenter() {
    const [targetUrl, setTargetUrl] = useState("");
    const [scanMode, setScanMode] = useState<ScanMode>("passive");
    const [showAuth, setShowAuth] = useState(false);
    const [authCookie, setAuthCookie] = useState("");
    const [authHeader, setAuthHeader] = useState("");
    const [isLaunching, setIsLaunching] = useState(false);

    const { stats, scans, fetchStats, fetchScans, launchScan, lastFetchStats } = useScanStore();

    useEffect(() => {
        fetchStats();
        fetchScans();
        const interval = setInterval(() => {
            fetchStats();
            fetchScans();
        }, 8000);
        return () => clearInterval(interval);
    }, [fetchStats, fetchScans]);

    const isInitialLoading = !stats && lastFetchStats === 0;

    const handleLaunchScan = async () => {
        if (!targetUrl) return;
        setIsLaunching(true);
        try {
            await launchScan(targetUrl, scanMode, authCookie, authHeader);
            setTargetUrl("");
        } finally {
            setIsLaunching(false);
        }
    };

    if (isInitialLoading) {
        return (
            <div className="flex items-center justify-center h-full" style={{ background: "#05090F" }}>
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-20 h-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full"
                            style={{ border: "1px solid rgba(0,255,178,0.3)", borderTopColor: "#00FFB2" }}
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-3 rounded-full"
                            style={{ border: "1px solid rgba(0,209,255,0.2)", borderBottomColor: "#00D1FF" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Cpu className="w-7 h-7" style={{ color: "#00FFB2" }} />
                        </div>
                    </div>
                    <p className="font-orbitron font-bold text-xs uppercase tracking-[0.4em]" style={{ color: "#00FFB2" }}>
                        INITIALIZING SYSTEMS
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 max-w-[1800px] mx-auto space-y-8">

            {/* ── Hero Header ──────────────────────────────── */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative pt-4"
            >
                {/* Top technical tag */}
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="px-3 py-1 text-[9px] font-black uppercase tracking-[0.4em] font-orbitron flex items-center gap-2"
                        style={{
                            background: "rgba(0,255,178,0.05)",
                            border: "1px solid rgba(0,255,178,0.2)",
                            color: "#00FFB2",
                        }}
                    >
                        <Radio className="w-2.5 h-2.5" />
                        BLACKSCANNER // NEURAL IDS v2.0
                    </div>
                    <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(0,255,178,0.3), transparent)" }} />
                    <span className="text-[9px] font-mono" style={{ color: "#4A6080" }}>
                        {new Date().toLocaleTimeString("en", { hour12: false })} UTC+0
                    </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <h1
                            className="text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none font-orbitron"
                            style={{ color: "#E6F1FF" }}
                        >
                            COMMAND <br />
                            <span style={{ color: "#00FFB2", textShadow: "0 0 30px rgba(0,255,178,0.5), 0 0 60px rgba(0,255,178,0.2)" }}>
                                CENTER
                            </span>
                        </h1>
                        <p className="font-rajdhani text-sm mt-3" style={{ color: "#9FB3C8" }}>
                            AI-powered web vulnerability intelligence — authorized security assessment platform
                        </p>
                    </div>

                    {/* Live metrics strip */}
                    <div className="flex gap-4 flex-wrap">
                        {[
                            { label: "LATENCY", value: "14ms", color: "#00FFB2" },
                            { label: "UPTIME", value: "99.9%", color: "#00D1FF" },
                            { label: "THREATS", value: String(stats?.critical_findings ?? 0), color: "#FF3D5A" },
                        ].map((m) => (
                            <div
                                key={m.label}
                                className="px-4 py-2.5"
                                style={{
                                    background: "rgba(10,16,32,0.7)",
                                    border: "1px solid rgba(0,255,178,0.08)",
                                }}
                            >
                                <div className="text-[9px] font-bold tracking-[0.25em] uppercase font-orbitron mb-0.5" style={{ color: "#4A6080" }}>{m.label}</div>
                                <div className="text-lg font-black font-orbitron" style={{ color: m.color, textShadow: `0 0 10px ${m.color}80` }}>{m.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.header>

            {/* ── Stats Grid ───────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <CyberStatCard icon={Cpu} label="Total Scans" value={stats?.total_scans ?? 0} accent="teal" />
                <CyberStatCard icon={Activity} label="Active Scans" value={stats?.active_scans ?? 0} accent="green" />
                <CyberStatCard icon={Database} label="Total Findings" value={stats?.total_findings ?? 0} accent="yellow" />
                <CyberStatCard icon={AlertTriangle} label="Critical Threats" value={stats?.critical_findings ?? 0} accent="red" />
                <CyberStatCard icon={Clock} label="Today's Scans" value={stats?.scans_today ?? 0} accent="purple" />
            </div>

            {/* ── Main Panel ───────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Launch Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-12 relative overflow-hidden"
                    style={{
                        background: "rgba(10,16,32,0.6)",
                        border: "1px solid rgba(0,255,178,0.1)",
                        clipPath: "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)",
                    }}
                >
                    {/* Top glow line */}
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, rgba(0,255,178,0.8), rgba(0,209,255,0.4), transparent)" }} />
                    <div className="scan-line" />

                    <div className="p-8 lg:p-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div
                                className="w-12 h-12 flex items-center justify-center"
                                style={{
                                    background: "rgba(0,255,178,0.06)",
                                    border: "1px solid rgba(0,255,178,0.3)",
                                }}
                            >
                                <Target className="w-6 h-6" style={{ color: "#00FFB2" }} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-wider font-orbitron" style={{ color: "#E6F1FF" }}>
                                    Mission Launch
                                </h2>
                                <p className="text-[11px] font-mono" style={{ color: "#4A6080" }}>
                                    INIT PROTOCOL 0xFF // AUTHORIZED TARGETS ONLY
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                            {/* URL Input */}
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Search className="w-4 h-4" style={{ color: "#4A6080" }} />
                                </div>
                                <input
                                    type="url"
                                    value={targetUrl}
                                    onChange={(e) => setTargetUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleLaunchScan()}
                                    placeholder="TARGET URL (HTTPS://...)"
                                    className="hud-input pl-12 text-sm h-full min-h-[48px]"
                                    style={{ fontFamily: "var(--font-orbitron)", fontSize: "12px", letterSpacing: "0.1em" }}
                                />
                            </div>

                            {/* Mode selector */}
                            <div className="flex" style={{ gap: "2px" }}>
                                {(["passive", "active", "authenticated"] as ScanMode[]).map((mode) => (
                                    <ModeButton
                                        key={mode}
                                        mode={mode}
                                        active={scanMode === mode}
                                        onClick={() => {
                                            setScanMode(mode);
                                            setShowAuth(mode === "authenticated");
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Launch button */}
                            <motion.button
                                onClick={handleLaunchScan}
                                disabled={!targetUrl || isLaunching}
                                whileTap={{ scale: 0.97 }}
                                className="hud-btn px-10 min-h-[48px] text-sm font-black"
                                style={{ fontSize: "12px" }}
                            >
                                {isLaunching ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 rounded-full"
                                            style={{ border: "2px solid rgba(0,255,178,0.3)", borderTopColor: "#00FFB2" }}
                                        />
                                        ENGAGING
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        LAUNCH SCAN
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* Auth fields */}
                        <AnimatePresence>
                            {showAuth && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-5 pt-5 grid grid-cols-1 lg:grid-cols-2 gap-4"
                                    style={{ borderTop: "1px solid rgba(0,255,178,0.08)" }}
                                >
                                    <div>
                                        <label className="hud-label flex items-center gap-2 mb-2">
                                            <Lock className="w-3 h-3" style={{ color: "#00FFB2" }} /> SESSION KEY (COOKIE)
                                        </label>
                                        <input
                                            type="text"
                                            value={authCookie}
                                            onChange={(e) => setAuthCookie(e.target.value)}
                                            placeholder="auth_token=..."
                                            className="hud-input text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="hud-label flex items-center gap-2 mb-2">
                                            <Eye className="w-3 h-3" style={{ color: "#00D1FF" }} /> BEARER TOKEN (HEADER)
                                        </label>
                                        <input
                                            type="text"
                                            value={authHeader}
                                            onChange={(e) => setAuthHeader(e.target.value)}
                                            placeholder="Bearer eyJ..."
                                            className="hud-input text-xs"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Scan Feed */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 rounded-full"
                                style={{ background: "#00FFB2", boxShadow: "0 0 8px #00FFB2" }}
                            />
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] font-orbitron" style={{ color: "#E6F1FF" }}>
                                OPERATIONAL DATA STREAM
                            </h2>
                        </div>
                        <div className="flex gap-2 text-[9px] font-mono" style={{ color: "#4A6080" }}>
                            <span className="px-2 py-1" style={{ background: "rgba(0,255,178,0.04)", border: "1px solid rgba(0,255,178,0.08)" }}>
                                LIVE:{" "}<span style={{ color: "#00FFB2" }}>{scans.filter(s => !["completed", "failed", "cancelled"].includes(s.status)).length}</span>
                            </span>
                            <span className="px-2 py-1" style={{ background: "rgba(0,255,178,0.04)", border: "1px solid rgba(0,255,178,0.08)" }}>
                                TOTAL:{" "}<span style={{ color: "#00D1FF" }}>{scans.length}</span>
                            </span>
                        </div>
                    </div>

                    <div
                        className="overflow-hidden"
                        style={{
                            border: "1px solid rgba(0,255,178,0.08)",
                            background: "rgba(5,9,15,0.6)",
                        }}
                    >
                        {scans.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <motion.div
                                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <Radio className="w-10 h-10 mb-4" style={{ color: "#4A6080" }} />
                                </motion.div>
                                <p className="font-orbitron text-[10px] uppercase tracking-[0.3em]" style={{ color: "#4A6080" }}>
                                    Awaiting mission initialization...
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y" style={{ borderColor: "rgba(0,255,178,0.04)" }}>
                                <AnimatePresence>
                                    {scans.map((scan, i) => (
                                        <ScanRow key={scan.id} scan={scan} index={i} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Infra Vitals */}
                    <div
                        className="p-5 relative overflow-hidden"
                        style={{
                            background: "rgba(10,16,32,0.7)",
                            border: "1px solid rgba(0,255,178,0.08)",
                        }}
                    >
                        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, rgba(0,255,178,0.5), transparent)" }} />
                        <div className="flex items-center gap-2 mb-5">
                            <Server className="w-3.5 h-3.5" style={{ color: "#00D1FF" }} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] font-orbitron" style={{ color: "#00D1FF" }}>
                                INFRA VITALS
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: "CORE_MEMORY", val: 34, color: "#00FFB2" },
                                { label: "NET_IO", val: 68, color: "#00D1FF" },
                                { label: "NEURAL_SYNC", val: 89, color: "#BD00FF" },
                                { label: "DISK_IO", val: 22, color: "#FFD600" },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-[10px] font-mono mb-1.5" style={{ color: "#4A6080" }}>
                                        <span style={{ color: item.color, opacity: 0.9 }}>{item.label}</span>
                                        <span>{item.val}%</span>
                                    </div>
                                    <div className="h-1 w-full" style={{ background: "rgba(255,255,255,0.04)" }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.val}%` }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                            style={{ height: "100%", background: item.color, boxShadow: `0 0 6px ${item.color}80` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Intel Terminal */}
                    <div
                        className="p-5 relative overflow-hidden"
                        style={{
                            background: "rgba(5,9,15,0.8)",
                            border: "1px solid rgba(0,255,178,0.06)",
                            fontFamily: "var(--font-rajdhani)",
                        }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Cpu className="w-3.5 h-3.5" style={{ color: "#00FFB2" }} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] font-orbitron" style={{ color: "#00FFB2" }}>
                                INTEL TERMINAL
                            </h3>
                            <motion.div
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-1.5 h-3 ml-auto"
                                style={{ background: "#00FFB2" }}
                            />
                        </div>
                        <div className="space-y-2 text-[11px] font-mono">
                            {[
                                { t: "info", m: "> CONNECTING TO CLUSTER..." },
                                { t: "ok", m: "> IDENTITY: SEC_OPS_99" },
                                { t: "dim", m: "> [STATUS] ALL SYSTEMS NOMINAL" },
                                { t: "dim", m: "> [SYNC] NEURAL_LINK ESTABLISHED" },
                                { t: "dim", m: "> PREVIEW_ID: 0x88F722A" },
                            ].map((line, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.15 }}
                                    style={{
                                        color: line.t === "info" ? "#00FFB2" : line.t === "ok" ? "#00D1FF" : "#4A6080",
                                    }}
                                >
                                    {line.m}
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(0,255,178,0.06)" }}>
                            <span className="text-[9px] font-orbitron font-bold uppercase" style={{ color: "#00FFB2", opacity: 0.5 }}>ENCRYPTED_LINE</span>
                            <motion.div
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 rounded-full"
                                style={{ background: "#00FFB2", boxShadow: "0 0 6px #00FFB2" }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
