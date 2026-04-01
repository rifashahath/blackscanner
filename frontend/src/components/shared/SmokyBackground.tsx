"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const SmokyBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: { x: number; y: number; size: number; speedY: number; drift: number; opacity: number; color: string }[] = [];
        const colors = ["#00FFB2", "#00D1FF", "#BD00FF"];

        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5 + 0.5,
                speedY: Math.random() * 0.4 + 0.1,
                drift: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.1,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }

        let animFrame: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.shadowBlur = 6;
                ctx.shadowColor = p.color;
                ctx.fill();

                p.y -= p.speedY;
                p.x += p.drift;
                p.opacity += (Math.random() - 0.5) * 0.01;
                p.opacity = Math.max(0.05, Math.min(0.7, p.opacity));

                if (p.y < -10) {
                    p.y = canvas.height + 10;
                    p.x = Math.random() * canvas.width;
                }
            });

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            animFrame = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animFrame);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden" style={{ backgroundColor: "#05090F" }}>

            {/* City background image */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: "url(/cyberpunk-bg.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center bottom",
                    backgroundRepeat: "no-repeat",
                    opacity: 0.18,
                }}
            />

            {/* Deep dark overlay above city */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(to bottom, #05090F 0%, transparent 30%, transparent 60%, #05090F 100%)",
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background: "radial-gradient(ellipse at 50% 100%, rgba(0,255,178,0.04) 0%, transparent 70%)",
                }}
            />

            {/* Fine grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(rgba(0,255,178,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,178,0.025) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                    animation: "gridPulse 8s ease-in-out infinite",
                }}
            />

            {/* Larger grid */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(rgba(0,209,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,0.02) 1px, transparent 1px)",
                    backgroundSize: "200px 200px",
                }}
            />

            {/* Particle canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: 0.6 }}
            />

            {/* Atmospheric corner glows */}
            <motion.div
                animate={{ opacity: [0.04, 0.1, 0.04], scale: [1, 1.15, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-1/4 -left-1/4 pointer-events-none"
                style={{
                    width: "80vw",
                    height: "80vw",
                    background: "radial-gradient(circle, rgba(0,255,178,0.12) 0%, transparent 60%)",
                    borderRadius: "50%",
                    filter: "blur(60px)",
                }}
            />
            <motion.div
                animate={{ opacity: [0.03, 0.07, 0.03], scale: [1.1, 1, 1.1] }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-1/4 -right-1/4 pointer-events-none"
                style={{
                    width: "70vw",
                    height: "70vw",
                    background: "radial-gradient(circle, rgba(0,209,255,0.10) 0%, transparent 60%)",
                    borderRadius: "50%",
                    filter: "blur(60px)",
                }}
            />

            {/* Horizontal scan line */}
            <motion.div
                animate={{ y: ["-5%", "105%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                className="absolute left-0 w-full pointer-events-none"
                style={{
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, rgba(0,255,178,0.5) 20%, rgba(0,255,178,0.8) 50%, rgba(0,255,178,0.5) 80%, transparent)",
                    boxShadow: "0 0 15px rgba(0,255,178,0.6), 0 0 40px rgba(0,255,178,0.2)",
                }}
            />

            {/* CRT scanlines */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
                    opacity: 0.3,
                }}
            />

            {/* Vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 50%, rgba(5,9,15,0.85) 100%)",
                }}
            />
        </div>
    );
};
