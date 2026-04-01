"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
    value: number;
    label?: string;
    accentColor?: "cyan" | "green" | "red" | "yellow";
    showPercentage?: boolean;
    animated?: boolean;
    className?: string;
}

const barColors = {
    cyan: "from-cyber-cyan/80 to-cyber-cyan",
    green: "from-cyber-green/80 to-cyber-green",
    red: "from-cyber-red/80 to-cyber-red",
    yellow: "from-cyber-yellow/80 to-cyber-yellow",
};

const glowColors = {
    cyan: "shadow-[0_0_10px_rgba(0,240,255,0.4)]",
    green: "shadow-[0_0_10px_rgba(0,255,136,0.4)]",
    red: "shadow-[0_0_10px_rgba(255,51,102,0.4)]",
    yellow: "shadow-[0_0_10px_rgba(255,170,0,0.4)]",
};

export function ProgressBar({ value, label, accentColor = "cyan", showPercentage = true, animated = true, className }: ProgressBarProps) {
    return (
        <div className={cn("w-full", className)}>
            {(label || showPercentage) && (
                <div className="flex justify-between items-center mb-1.5">
                    {label && <span className="text-xs text-cyber-text-secondary">{label}</span>}
                    {showPercentage && <span className="text-xs font-mono text-cyber-text-dim">{value}%</span>}
                </div>
            )}
            <div className="w-full h-1.5 bg-cyber-border rounded-full overflow-hidden">
                <motion.div
                    className={cn("h-full rounded-full bg-gradient-to-r", barColors[accentColor], glowColors[accentColor])}
                    initial={animated ? { width: 0 } : undefined}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

interface PhaseProgressProps {
    phases: { name: string; status: "completed" | "active" | "pending" }[];
    className?: string;
}

export function PhaseProgress({ phases, className }: PhaseProgressProps) {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {phases.map((phase, i) => (
                <React.Fragment key={phase.name}>
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border transition-all duration-500",
                                phase.status === "completed"
                                    ? "bg-cyber-green/20 border-cyber-green/50 text-cyber-green"
                                    : phase.status === "active"
                                        ? "bg-cyber-cyan/20 border-cyber-cyan/50 text-cyber-cyan animate-pulse-cyan"
                                        : "bg-cyber-border/30 border-cyber-border text-cyber-text-dim"
                            )}
                        >
                            {phase.status === "completed" ? "✓" : i + 1}
                        </div>
                        <span
                            className={cn(
                                "text-xs font-medium hidden sm:block",
                                phase.status === "completed"
                                    ? "text-cyber-green"
                                    : phase.status === "active"
                                        ? "text-cyber-cyan"
                                        : "text-cyber-text-dim"
                            )}
                        >
                            {phase.name}
                        </span>
                    </div>
                    {i < phases.length - 1 && (
                        <div
                            className={cn(
                                "flex-1 h-px min-w-[20px] max-w-[60px]",
                                phase.status === "completed" ? "bg-cyber-green/40" : "bg-cyber-border"
                            )}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
