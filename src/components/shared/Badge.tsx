import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "error" | "purple";
    className?: string;
}

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
    const variants = {
        default: "bg-gray-100 text-gray-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-700",
        purple: "bg-purple-100 text-purple-700",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
