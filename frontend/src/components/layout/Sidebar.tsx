"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Shield,
    Activity,
    ChevronLeft,
    ChevronRight,
    Cpu,
    Globe,
    FileBarChart2,
    Wifi,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, description: "Command center" },
    { href: "/surface", label: "Intelligence", icon: Activity, description: "Attack surface" },
    { href: "/findings", label: "Findings", icon: Shield, description: "Vulnerability board" },
    { href: "/reports", label: "Reports", icon: FileBarChart2, description: "Analysis output" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="h-screen flex flex-col relative z-50 overflow-hidden flex-shrink-0"
            style={{
                background: "rgba(5, 9, 15, 0.92)",
                backdropFilter: "blur(24px)",
                borderRight: "1px solid rgba(0,255,178,0.08)",
                boxShadow: "4px 0 30px rgba(0,0,0,0.6)",
            }}
        >
            {/* Top glow line */}
            <div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,178,0.5), transparent)" }}
            />

            {/* Vertical accent line */}
            <div
                className="absolute top-0 right-0 bottom-0 w-px pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(0,255,178,0.4), transparent 30%, transparent 70%, rgba(0,209,255,0.2))" }}
            />

            {/* Logo Section */}
            <div className="p-5 pb-6 border-b" style={{ borderColor: "rgba(0,255,178,0.06)" }}>
                <div className="flex items-center gap-3">
                    {/* Logo icon */}
                    <div className="relative flex-shrink-0">
                        <div
                            className="w-10 h-10 flex items-center justify-center relative"
                            style={{
                                background: "rgba(0,255,178,0.08)",
                                border: "1px solid rgba(0,255,178,0.3)",
                                clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
                            }}
                        >
                            <motion.div
                                animate={{ opacity: [0.6, 1, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Cpu className="w-5 h-5" style={{ color: "#00FFB2" }} />
                            </motion.div>
                            {/* Corner accent */}
                            <div className="absolute top-0 right-0 w-1.5 h-1.5" style={{ borderTop: "1px solid #00FFB2", borderRight: "1px solid #00FFB2" }} />
                        </div>
                        {/* Active dot */}
                        <motion.div
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                            style={{ background: "#00FFB2", boxShadow: "0 0 6px #00FFB2" }}
                        />
                    </div>

                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="font-orbitron font-black text-sm tracking-wider leading-none" style={{ color: "#E6F1FF" }}>
                                    BLACK<span style={{ color: "#00FFB2" }}>SCANNER</span>
                                </div>
                                <div className="text-[9px] font-bold tracking-[0.3em] uppercase mt-1.5 font-orbitron" style={{ color: "#00FFB2", opacity: 0.6 }}>
                                    AI SECURITY INTEL
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Nav label */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-5 pt-5 pb-2"
                    >
                        <span className="text-[9px] font-bold tracking-[0.4em] uppercase font-orbitron" style={{ color: "#4A6080" }}>
                            NAVIGATION
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <nav className="flex-1 px-3 pt-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileTap={{ scale: 0.97 }}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 relative transition-all duration-200 group cursor-pointer",
                                    "overflow-hidden"
                                )}
                                style={{
                                    background: isActive ? "rgba(0,255,178,0.07)" : "transparent",
                                    border: isActive ? "1px solid rgba(0,255,178,0.2)" : "1px solid transparent",
                                    clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = "rgba(0,255,178,0.04)";
                                        e.currentTarget.style.borderColor = "rgba(0,255,178,0.1)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = "transparent";
                                        e.currentTarget.style.borderColor = "transparent";
                                    }
                                }}
                            >
                                {/* Active glow */}
                                {isActive && (
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-0.5"
                                        style={{ background: "#00FFB2", boxShadow: "0 0 8px #00FFB2, 0 0 16px rgba(0,255,178,0.5)" }}
                                    />
                                )}

                                <item.icon
                                    className="w-4 h-4 flex-shrink-0 transition-all duration-200"
                                    style={{
                                        color: isActive ? "#00FFB2" : "#4A6080",
                                        filter: isActive ? "drop-shadow(0 0 6px rgba(0,255,178,0.8))" : "none",
                                    }}
                                />

                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -8 }}
                                            transition={{ duration: 0.15 }}
                                            className="flex-1 min-w-0"
                                        >
                                            <div
                                                className="text-xs font-bold tracking-[0.15em] uppercase font-orbitron truncate"
                                                style={{ color: isActive ? "#00FFB2" : "#9FB3C8" }}
                                            >
                                                {item.label}
                                            </div>
                                            <div
                                                className="text-[10px] font-rajdhani truncate mt-0.5"
                                                style={{ color: "#4A6080" }}
                                            >
                                                {item.description}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {isActive && !collapsed && (
                                    <div
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                                        style={{ background: "#00FFB2", boxShadow: "0 0 4px #00FFB2" }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* System status */}
            <div className="p-4 border-t" style={{ borderColor: "rgba(0,255,178,0.06)" }}>
                <div
                    className="p-3 relative overflow-hidden"
                    style={{
                        background: "rgba(0,255,178,0.03)",
                        border: "1px solid rgba(0,255,178,0.08)",
                        clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
                    }}
                >
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: "#00FFB2", boxShadow: "0 0 8px rgba(0,255,178,0.8)" }}
                        />
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="text-[9px] font-bold tracking-[0.2em] uppercase font-orbitron" style={{ color: "#00FFB2" }}>
                                        SYSTEM ONLINE
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Wifi className="w-2.5 h-2.5" style={{ color: "#4A6080" }} />
                                        <span className="text-[8px] font-mono" style={{ color: "#4A6080" }}>NEURAL LINK ACTIVE</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 w-7 h-7 flex items-center justify-center transition-all duration-200"
                style={{
                    background: "#05090F",
                    border: "1px solid rgba(0,255,178,0.3)",
                    clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
                    color: "#00FFB2",
                    boxShadow: "0 0 10px rgba(0,0,0,0.8)",
                }}
            >
                {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
        </motion.aside>
    );
}
