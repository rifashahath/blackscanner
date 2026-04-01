"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FileText, Download, Globe, Shield, AlertTriangle,
    Calendar, BarChart3, FileJson, FileCode, Printer,
    Loader2
} from "lucide-react";
import { SeverityBadge } from "@/components/shared/Badges";
import { api } from "@/lib/api";
import { cn, formatDate, severityColor } from "@/lib/utils";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Report } from "@/types";

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await api.getReports();
                setReports(data.reports);
            } catch (err) {
                console.error("Failed to fetch reports:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const handleDownload = (reportId: string, format: string) => {
        // Trigger download using the export endpoint
        const exportUrl = api.exportReport(reportId, format);
        window.open(exportUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-cyber-cyan animate-spin" />
                <p className="text-cyber-text-dim font-mono text-sm animate-pulse">
                    FETCHING SECURITY INTEL...
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-cyber-cyan" />
                    <h1 className="text-2xl font-bold">
                        Security <span className="neon-text-cyan">Reports</span>
                    </h1>
                </div>
                <p className="text-cyber-text-secondary text-sm">
                    Generated security assessment reports and export options
                </p>
            </motion.div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reports.length === 0 ? (
                    <div className="col-span-full py-20 text-center glass-card">
                        <FileText className="w-12 h-12 text-cyber-text-dim mx-auto mb-4 opacity-20" />
                        <h3 className="text-cyber-text-secondary font-semibold">No reports found</h3>
                        <p className="text-cyber-text-dim text-xs mt-1">Generate a report from the Scan View to see it here.</p>
                    </div>
                ) : (
                    reports.map((report, i) => (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "glass-card overflow-hidden transition-all duration-300 cursor-pointer",
                                selectedReport === report.id ? "border-cyber-cyan/40 shadow-cyber-cyan" : ""
                            )}
                            onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-cyber-cyan" />
                                        </div>
                                        <div className="max-w-[180px] sm:max-w-xs overflow-hidden">
                                            <h3 className="text-sm font-semibold truncate">{report.title}</h3>
                                            <div className="flex items-center gap-2 text-xs text-cyber-text-dim mt-0.5">
                                                <Globe className="w-3 h-3 flex-shrink-0" />
                                                <span className="font-mono truncate">{report.target_url}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono text-cyber-text-dim flex items-center gap-1 flex-shrink-0">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(report.generated_at)}
                                    </span>
                                </div>

                                <p className="text-xs text-cyber-text-secondary mb-4 line-clamp-2">{report.summary}</p>

                                {/* Severity bars */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-cyber-red w-16">CRITICAL</span>
                                        <ProgressBar value={report.total_findings > 0 ? (report.critical_count / report.total_findings) * 100 : 0} accentColor="red" showPercentage={false} className="flex-1" />
                                        <span className="text-xs font-mono text-cyber-red w-4 text-right">{report.critical_count}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-orange-400 w-16">HIGH</span>
                                        <ProgressBar value={report.total_findings > 0 ? (report.high_count / report.total_findings) * 100 : 0} accentColor="yellow" showPercentage={false} className="flex-1" />
                                        <span className="text-xs font-mono text-orange-400 w-4 text-right">{report.high_count}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-cyber-yellow w-16">MEDIUM</span>
                                        <ProgressBar value={report.total_findings > 0 ? (report.medium_count / report.total_findings) * 100 : 0} accentColor="yellow" showPercentage={false} className="flex-1" />
                                        <span className="text-xs font-mono text-cyber-yellow w-4 text-right">{report.medium_count}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-cyber-cyan w-16">LOW</span>
                                        <ProgressBar value={report.total_findings > 0 ? (report.low_count / report.total_findings) * 100 : 0} accentColor="cyan" showPercentage={false} className="flex-1" />
                                        <span className="text-xs font-mono text-cyber-cyan w-4 text-right">{report.low_count}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-cyber-text-dim" />
                                        <span className="text-xs text-cyber-text-dim">
                                            <span className="text-cyber-text-primary font-semibold">{report.total_findings}</span> total findings
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Export Actions */}
                            {selectedReport === report.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className="border-t border-cyber-border p-4"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <p className="text-xs text-cyber-text-dim mb-3 uppercase tracking-wider font-medium">Export Options</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <button
                                            onClick={() => handleDownload(report.id, 'json')}
                                            className="cyber-btn-primary text-xs py-2 flex items-center justify-center gap-2"
                                        >
                                            <FileJson className="w-3.5 h-3.5" /> JSON
                                        </button>
                                        <button
                                            onClick={() => handleDownload(report.id, 'html')}
                                            className="cyber-btn-primary text-xs py-2 flex items-center justify-center gap-2"
                                        >
                                            <FileCode className="w-3.5 h-3.5" /> HTML
                                        </button>
                                        <button
                                            onClick={() => handleDownload(report.id, 'pdf')}
                                            className="cyber-btn-primary text-xs py-2 flex items-center justify-center gap-2"
                                        >
                                            <Printer className="w-3.5 h-3.5" /> PDF
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )
                    ))}
            </div>

            {/* Stats Area */}
            {reports.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-cyber-cyan" />
                        Cumulative Findings (Across All Reports)
                    </h3>
                    <div className="flex items-end justify-center gap-4 sm:gap-8 h-48">
                        {[
                            { label: "Critical", count: reports.reduce((acc, r) => acc + r.critical_count, 0), color: "bg-cyber-red", textColor: "text-cyber-red" },
                            { label: "High", count: reports.reduce((acc, r) => acc + r.high_count, 0), color: "bg-orange-500", textColor: "text-orange-400" },
                            { label: "Medium", count: reports.reduce((acc, r) => acc + r.medium_count, 0), color: "bg-cyber-yellow", textColor: "text-cyber-yellow" },
                            { label: "Low", count: reports.reduce((acc, r) => acc + r.low_count, 0), color: "bg-cyber-cyan", textColor: "text-cyber-cyan" },
                            { label: "Info", count: reports.reduce((acc, r) => acc + r.info_count, 0), color: "bg-cyber-purple", textColor: "text-cyber-purple" },
                        ].map((item, i) => {
                            const counts = [
                                reports.reduce((acc, r) => acc + r.critical_count, 0),
                                reports.reduce((acc, r) => acc + r.high_count, 0),
                                reports.reduce((acc, r) => acc + r.medium_count, 0),
                                reports.reduce((acc, r) => acc + r.low_count, 0),
                                reports.reduce((acc, r) => acc + r.info_count, 0)
                            ];
                            const maxCount = Math.max(...counts, 1);
                            const heightPercent = (item.count / maxCount) * 100;
                            return (
                                <div key={item.label} className="flex flex-col items-center gap-2 flex-1 max-w-[80px]">
                                    <span className={cn("text-xs font-mono font-bold", item.textColor)}>{item.count}</span>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(heightPercent, 4)}%` }}
                                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                                        className={cn("w-full rounded-t-md", item.color, "opacity-60")}
                                        style={{ minHeight: 4 }}
                                    />
                                    <span className="text-[10px] text-cyber-text-dim text-center">{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
