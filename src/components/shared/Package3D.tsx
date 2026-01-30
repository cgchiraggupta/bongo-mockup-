import React from "react";

interface Package3DProps {
    color?: "green" | "pink" | "yellow" | "blue";
    size?: "small" | "medium" | "large";
}

export default function Package3D({ color = "green", size = "medium" }: Package3DProps) {
    const colors = {
        green: { top: "#A7F3D0", front: "#6EE7B7", side: "#34D399" },
        pink: { top: "#FBCFE8", front: "#F9A8D4", side: "#F472B6" },
        yellow: { top: "#FDE68A", front: "#FCD34D", side: "#FBBF24" },
        blue: { top: "#BFDBFE", front: "#93C5FD", side: "#60A5FA" },
    };

    const sizes = {
        small: 40,
        medium: 60,
        large: 80,
    };

    const s = sizes[size];
    const c = colors[color];

    return (
        <svg
            width={s * 1.5}
            height={s * 1.2}
            viewBox="0 0 90 72"
            fill="none"
            style={{ display: "block" }}
        >
            {/* Side face (right) */}
            <path
                d="M45 20 L85 40 L85 65 L45 45 Z"
                fill={c.side}
            />
            {/* Front face (left) */}
            <path
                d="M5 40 L45 20 L45 45 L5 65 Z"
                fill={c.front}
            />
            {/* Top face */}
            <path
                d="M5 40 L45 20 L85 40 L45 60 Z"
                fill={c.top}
            />
            {/* Top stripe */}
            <path
                d="M20 45 L45 32 L70 45 L45 58 Z"
                fill="rgba(255,255,255,0.3)"
            />
            {/* Cross tape lines */}
            <line x1="45" y1="20" x2="45" y2="60" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
            <line x1="25" y1="40" x2="65" y2="40" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
        </svg>
    );
}
