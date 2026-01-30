"use client";

import React, { useState, useRef } from "react";
import { ChevronRight } from "lucide-react";

interface SlideButtonProps {
    text: string;
    onComplete: () => void;
    color?: string;
}

export default function SlideButton({ text, onComplete, color = "#F472B6" }: SlideButtonProps) {
    const [sliding, setSliding] = useState(false);
    const [position, setPosition] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const maxPosition = 220; // Approximate slide distance

    const handleTouchStart = () => {
        setSliding(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!sliding || !containerRef.current) return;
        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        const newPos = Math.max(0, Math.min(touch.clientX - rect.left - 28, maxPosition));
        setPosition(newPos);
    };

    const handleTouchEnd = () => {
        if (position > maxPosition * 0.8) {
            onComplete();
        }
        setPosition(0);
        setSliding(false);
    };

    const handleMouseDown = () => {
        setSliding(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!sliding || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const newPos = Math.max(0, Math.min(e.clientX - rect.left - 28, maxPosition));
        setPosition(newPos);
    };

    const handleMouseUp = () => {
        if (position > maxPosition * 0.8) {
            onComplete();
        }
        setPosition(0);
        setSliding(false);
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                height: 56,
                background: `linear-gradient(90deg, ${color}20 0%, ${color}10 100%)`,
                borderRadius: 28,
                overflow: "hidden",
                userSelect: "none",
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Text */}
            <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: color,
                fontWeight: 600,
                fontSize: "0.875rem",
                opacity: 1 - (position / maxPosition) * 0.5,
            }}>
                {text}
            </div>

            {/* Slider Handle */}
            <div
                style={{
                    position: "absolute",
                    left: position + 4,
                    top: 4,
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    background: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "grab",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    transition: sliding ? "none" : "left 0.3s ease",
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <ChevronRight size={24} color="white" />
                <ChevronRight size={24} color="white" style={{ marginLeft: -16, opacity: 0.5 }} />
            </div>
        </div>
    );
}
