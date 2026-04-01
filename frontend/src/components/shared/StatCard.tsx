"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    subtitle?: string;
    accentColor?: "cyan" | "green" | "red" | "yellow" | "purple";
    trend?: { value: string; positive: boolean };
    className?: string;
}

const palette = {
    cyan: { color: "#00D1FF", bg: "rgba(0,209,255,0.06)", border: "rgba(0,209,255,0.2)", glow: "rgba(0,209,255,0.3)" },
    green: { color: "#00FFB2", bg: "rgba(0,255,178,0.06)", border: "rgba(0,255,178,0.2)", glow: "rgba(0,255,178,0.3)" },
    red: { color: "#FF3D5A", bg: "rgba(255,61,90,0.06)", border: "rgba(255,61,90,0.2)", glow: "rgba(255,61,90,0.3)" },
    yellow: { color: "#FFD600", bg: "rgba(255,214,0,0.06)", border: "rgba(255,214,0,0.2)", glow: "rgba(255,214,0,0.3)" },
    purple: { color: "#BD00FF", bg: "rgba(189,0,255,0.06)", border: "rgba(189,0,255,0.2)", glow: "rgba(189,0,255,0.3)" },
};

export function StatCard({ icon: Icon, label, value, subtitle, accentColor = "cyan", trend, className }: StatCardProps) {
    const c = palette[accentColor];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -3, scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className={cn("relative overflow-hidden p-5", className)}
            style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
            }}
        >
            {/* Top accent line */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, ${c.color}, transparent)` }}
            />

            {/* Corner dot */}
            <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full"
                style={{ background: c.color, boxShadow: `0 0 6px ${c.glow}` }}
            />

            {/* Icon */}
            <div
                className="w-9 h-9 flex items-center justify-center mb-3"
                style={{
                    background: "rgba(5,9,15,0.6)",
                    border: `1px solid ${c.border}`,
                }}
            >
                <Icon className="w-4 h-4" style={{ color: c.color }} />
            </div>

            {/* Value */}
            <div
                className="text-3xl font-black font-orbitron italic tracking-tight leading-none"
                style={{ color: c.color, textShadow: `0 0 20px ${c.glow}` }}
            >
                {value}
            </div>

            {/* Trend */}
            {trend && (
                <div
                    className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 mt-1.5 font-orbitron"
                    style={{
                        background: trend.positive ? "rgba(0,255,178,0.08)" : "rgba(255,61,90,0.08)",
                        border: `1px solid ${trend.positive ? "rgba(0,255,178,0.2)" : "rgba(255,61,90,0.2)"}`,
                        color: trend.positive ? "#00FFB2" : "#FF3D5A",
                    }}
                >
                    {trend.positive ? "▲" : "▼"} {trend.value}%
                </div>
            )}

            {/* Label */}
            <div
                className="text-[10px] font-bold uppercase tracking-[0.25em] font-orbitron mt-2"
                style={{ color: "#9FB3C8" }}
            >
                {label}
            </div>
            {subtitle && (
                <div className="text-[10px] mt-0.5 font-rajdhani" style={{ color: "#4A6080" }}>
                    {subtitle}
                </div>
            )}

            {/* Bottom-left corner accent */}
            <div className="absolute bottom-0 left-0 w-2 h-2" style={{ borderBottom: `1px solid ${c.color}40`, borderLeft: `1px solid ${c.color}40` }} />
        </motion.div>
    );
}
