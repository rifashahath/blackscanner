"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScanEvent } from "@/types";

interface TerminalPanelProps {
    events: ScanEvent[];
    title?: string;
    className?: string;
    maxHeight?: string;
}

const typeColors: Record<string, string> = {
    info: "text-cyber-text-secondary",
    warning: "text-cyber-yellow",
    error: "text-cyber-red",
    success: "text-cyber-green",
    ai: "text-cyber-purple",
};

const typePrefix: Record<string, string> = {
    info: "INF",
    warning: "WRN",
    error: "ERR",
    success: "OK ",
    ai: "AI ",
};

export function TerminalPanel({ events, title = "Scan Event Log", className, maxHeight = "400px" }: TerminalPanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events]);

    return (
        <div className={cn("terminal-panel", className)}>
            <div className="terminal-header">
                <div className="terminal-dot bg-cyber-red" />
                <div className="terminal-dot bg-cyber-yellow" />
                <div className="terminal-dot bg-cyber-green" />
                <Terminal className="w-3.5 h-3.5 text-cyber-text-dim ml-2" />
                <span className="text-xs text-cyber-text-dim font-mono ml-1">{title}</span>
                <span className="ml-auto text-[10px] text-cyber-text-dim font-mono">{events.length} events</span>
            </div>
            <div
                ref={scrollRef}
                className="p-3 overflow-y-auto font-mono text-xs leading-relaxed"
                style={{ maxHeight }}
            >
                {events.map((event, i) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex gap-2 py-0.5 hover:bg-white/[0.02] px-1 rounded"
                    >
                        <span className="text-cyber-text-dim flex-shrink-0 w-[70px]">
                            {new Date(event.timestamp).toLocaleTimeString("en-US", { hour12: false })}
                        </span>
                        <span className={cn("flex-shrink-0 w-[30px] font-bold", typeColors[event.type])}>
                            {typePrefix[event.type]}
                        </span>
                        <span className="text-cyber-text-dim flex-shrink-0">[{event.phase}]</span>
                        <span className={cn(typeColors[event.type])}>{event.message}</span>
                    </motion.div>
                ))}
                <div className="flex items-center gap-1 mt-1 text-cyber-cyan">
                    <span className="animate-pulse">▊</span>
                </div>
            </div>
        </div>
    );
}
