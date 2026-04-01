import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function severityColor(severity: string): string {
    switch (severity) {
        case "critical": return "text-[#FF3D5A]";
        case "high": return "text-[#FF8C00]";
        case "medium": return "text-[#FFD600]";
        case "low": return "text-[#00FFB2]";
        case "info": return "text-[#00D1FF]";
        default: return "text-[#9FB3C8]";
    }
}

export function severityBg(severity: string): string {
    switch (severity) {
        case "critical": return "bg-[#FF3D5A]/10 border-[#FF3D5A]/30";
        case "high": return "bg-[#FF8C00]/10 border-[#FF8C00]/30";
        case "medium": return "bg-[#FFD600]/10 border-[#FFD600]/30";
        case "low": return "bg-[#00FFB2]/10 border-[#00FFB2]/30";
        case "info": return "bg-[#00D1FF]/10 border-[#00D1FF]/30";
        default: return "bg-[#0A1020] border-[#0F1E35]";
    }
}

export function statusColor(status: string): string {
    switch (status) {
        case "completed": return "text-[#00FFB2]";
        case "failed": case "cancelled": return "text-[#FF3D5A]";
        case "pending": return "text-[#4A6080]";
        default: return "text-[#00D1FF]";
    }
}

export function truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen) + "…";
}
