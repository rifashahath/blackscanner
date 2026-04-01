import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // New cyberpunk palette
                hud: {
                    bg: "#05090F",
                    surface: "#0A1020",
                    panel: "#0D1525",
                    accent: "#00D1FF",      // Secondary teal glow
                    secondary: "#00FFB2",   // Primary neon green
                    red: "#FF3D5A",
                    purple: "#BD00FF",
                    text: "#E6F1FF",
                    dim: "#9FB3C8",
                    muted: "#4A6080",
                    border: "rgba(0, 209, 255, 0.15)",
                },
                cyber: {
                    bg: "#05090F",
                    card: "#0A1020",
                    border: "#0F1E35",
                    cyan: "#00D1FF",
                    green: "#00FFB2",
                    red: "#FF3D5A",
                    yellow: "#FFD600",
                    purple: "#BD00FF",
                    "text-primary": "#E6F1FF",
                    "text-secondary": "#9FB3C8",
                    "text-dim": "#4A6080",
                },
            },
            fontFamily: {
                orbitron: ["var(--font-orbitron)", "sans-serif"],
                rajdhani: ["var(--font-rajdhani)", "sans-serif"],
                exo: ["var(--font-exo)", "sans-serif"],
            },
            animation: {
                "hud-scan": "hudScan 8s linear infinite",
                "hud-pulse": "pulseGlow 4s ease-in-out infinite",
                "spin-slow": "spin 20s linear infinite",
                "flicker": "flicker 5s step-end infinite",
                "float": "float 6s ease-in-out infinite",
                "data-flow": "dataFlow 3s linear infinite",
                "border-pulse": "borderPulse 2s ease-in-out infinite",
                "scanline": "scanline 6s linear infinite",
            },
            keyframes: {
                hudScan: {
                    "0%": { transform: "translateY(-100%)" },
                    "100%": { transform: "translateY(100%)" },
                },
                pulseGlow: {
                    "0%, 100%": { opacity: "1", filter: "brightness(1)" },
                    "50%": { opacity: "0.7", filter: "brightness(1.3)" },
                },
                flicker: {
                    "0%, 95%, 100%": { opacity: "1" },
                    "97%": { opacity: "0.6" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                dataFlow: {
                    "0%": { strokeDashoffset: "100" },
                    "100%": { strokeDashoffset: "0" },
                },
                borderPulse: {
                    "0%, 100%": { borderColor: "rgba(0,255,178,0.4)" },
                    "50%": { borderColor: "rgba(0,255,178,0.1)" },
                },
                scanline: {
                    "0%": { transform: "translateY(-5%)", opacity: "0" },
                    "10%": { opacity: "1" },
                    "90%": { opacity: "1" },
                    "100%": { transform: "translateY(105%)", opacity: "0" },
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "cyber-grid": "linear-gradient(to right, rgba(0,255,178,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,255,178,0.03) 1px, transparent 1px)",
                "cyber-grid-lg": "linear-gradient(to right, rgba(0,209,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,209,255,0.03) 1px, transparent 1px)",
                "neon-glow": "radial-gradient(circle, rgba(0,255,178,0.15) 0%, transparent 70%)",
                "teal-glow": "radial-gradient(circle, rgba(0,209,255,0.15) 0%, transparent 70%)",
            },
            boxShadow: {
                "neon-green": "0 0 20px rgba(0,255,178,0.5), 0 0 40px rgba(0,255,178,0.2)",
                "neon-teal": "0 0 20px rgba(0,209,255,0.5), 0 0 40px rgba(0,209,255,0.2)",
                "neon-sm-green": "0 0 8px rgba(0,255,178,0.4)",
                "neon-sm-teal": "0 0 8px rgba(0,209,255,0.4)",
                "panel": "0 0 40px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(0,255,178,0.05)",
            },
            dropShadow: {
                "neon-green": "0 0 8px rgba(0,255,178,0.8)",
                "neon-teal": "0 0 8px rgba(0,209,255,0.8)",
            },
        },
    },
    plugins: [],
};
export default config;
