import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { SmokyBackground } from "@/components/shared/SmokyBackground";

export const metadata: Metadata = {
    title: "BlackScanner — AI Vulnerability Intelligence",
    description: "Advanced AI-powered web vulnerability scanner for authorized security assessment",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body style={{ background: "#05090F", color: "#E6F1FF" }}>
                <div className="flex h-screen overflow-hidden relative">
                    <SmokyBackground />
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto relative z-10">
                        <div className="min-h-full">
                            {children}
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
}
