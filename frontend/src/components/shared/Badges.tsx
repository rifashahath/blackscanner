"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Severity, FindingStatus, ConfidenceLevel } from "@/types";

// ── Severity Badge ──────────────────────────────────────────
interface SeverityBadgeProps {
    severity: Severity;
    size?: "sm" | "md";
}

const severityPalette: Record<Severity, { color: string; bg: string; border: string }> = {
    critical: { color: "#FF3D5A", bg: "rgba(255,61,90,0.08)", border: "rgba(255,61,90,0.3)" },
    high: { color: "#FF8C00", bg: "rgba(255,140,0,0.08)", border: "rgba(255,140,0,0.3)" },
    medium: { color: "#FFD600", bg: "rgba(255,214,0,0.08)", border: "rgba(255,214,0,0.3)" },
    low: { color: "#00FFB2", bg: "rgba(0,255,178,0.08)", border: "rgba(0,255,178,0.3)" },
    info: { color: "#00D1FF", bg: "rgba(0,209,255,0.08)", border: "rgba(0,209,255,0.3)" },
};

export function SeverityBadge({ severity, size = "sm" }: SeverityBadgeProps) {
    const c = severityPalette[severity] ?? severityPalette.info;
    return (
        <span
            className={cn(
                "inline-flex items-center font-orbitron font-bold uppercase tracking-wider",
                size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[10px]"
            )}
            style={{
                color: c.color,
                background: c.bg,
                border: `1px solid ${c.border}`,
                clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
                textShadow: `0 0 8px ${c.color}60`,
            }}
        >
            {severity}
        </span>
    );
}

// ── Status Badge ───────────────────────────────────────────
interface StatusBadgeProps {
    status: FindingStatus;
}

const statusPalette: Record<FindingStatus, { color: string; bg: string; border: string; label: string; dot: string }> = {
    hypothesis: { color: "#BD00FF", bg: "rgba(189,0,255,0.08)", border: "rgba(189,0,255,0.3)", label: "Hypothesis", dot: "#BD00FF" },
    suspicious: { color: "#FFD600", bg: "rgba(255,214,0,0.08)", border: "rgba(255,214,0,0.3)", label: "Suspicious", dot: "#FFD600" },
    verified: { color: "#00FFB2", bg: "rgba(0,255,178,0.08)", border: "rgba(0,255,178,0.3)", label: "Verified", dot: "#00FFB2" },
    false_positive: { color: "#4A6080", bg: "rgba(74,96,128,0.08)", border: "rgba(74,96,128,0.3)", label: "False Positive", dot: "#4A6080" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const c = statusPalette[status];
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-orbitron font-bold uppercase tracking-wider"
            style={{
                color: c.color,
                background: c.bg,
                border: `1px solid ${c.border}`,
                clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
            }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: c.dot, boxShadow: `0 0 4px ${c.dot}` }}
            />
            {c.label}
        </span>
    );
}

// ── Confidence Badge ───────────────────────────────────────
interface ConfidenceBadgeProps {
    confidence: ConfidenceLevel;
}

const confidencePalette: Record<ConfidenceLevel, { color: string; bg: string; border: string }> = {
    high: { color: "#00FFB2", bg: "rgba(0,255,178,0.06)", border: "rgba(0,255,178,0.25)" },
    medium: { color: "#FFD600", bg: "rgba(255,214,0,0.06)", border: "rgba(255,214,0,0.25)" },
    low: { color: "#4A6080", bg: "rgba(74,96,128,0.06)", border: "rgba(74,96,128,0.25)" },
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
    const c = confidencePalette[confidence];
    return (
        <span
            className="inline-flex items-center px-2 py-0.5 text-[9px] font-orbitron font-bold uppercase tracking-wider"
            style={{
                color: c.color,
                background: c.bg,
                border: `1px solid ${c.border}`,
                clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
            }}
        >
            {confidence} confidence
        </span>
    );
}
