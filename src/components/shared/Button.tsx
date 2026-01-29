import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    isLoading?: boolean;
}

export default function Button({
    children,
    variant = "primary",
    isLoading,
    className = "",
    ...props
}: ButtonProps) {
    const baseStyles = "flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none";

    const variants = {
        primary: "bg-[var(--color-primary)] text-white shadow-lg shadow-pink-200 hover:brightness-105",
        secondary: "bg-gray-900 text-white hover:bg-gray-800",
        outline: "border-2 border-gray-200 text-gray-700 hover:bg-gray-50",
        ghost: "text-gray-600 hover:bg-gray-100",
    };

    const sizes = "h-12 px-6 text-[15px]";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            {children}
        </button>
    );
}
