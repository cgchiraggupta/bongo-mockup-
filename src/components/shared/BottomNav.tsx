"use client";

import React from "react";
import { useMode } from "@/context/ModeContext";
import { useRouter, usePathname } from "next/navigation";

// SVG icons inline to avoid any import issues
const HomeIcon = ({ color }: { color: string }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const MapPinIcon = ({ color }: { color: string }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const ClockIcon = ({ color }: { color: string }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const UserIcon = ({ color }: { color: string }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

export default function BottomNav() {
    const { mode } = useMode();
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { Icon: HomeIcon, label: "Home", path: "/" },
        { Icon: MapPinIcon, label: "Track", path: "/track" },
        { Icon: ClockIcon, label: "History", path: "/history" },
        { Icon: UserIcon, label: "Profile", path: "/profile" },
    ];

    const handleNavClick = (path: string) => {
        router.push(path);
    };

    const activeColor = mode === "customer" ? "#E16595" : "#10B981";

    return (
        <nav
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                width: "100%",
                padding: "8px 12px",
                paddingBottom: "max(8px, env(safe-area-inset-bottom))",
                background: "#1F2937",
                zIndex: 9999,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    maxWidth: 500,
                    margin: "0 auto",
                }}
            >
                {navItems.map((item, index) => {
                    const isActive = pathname === item.path;
                    const iconColor = isActive ? "white" : "#9CA3AF";

                    return (
                        <button
                            key={index}
                            onClick={() => handleNavClick(item.path)}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 4,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "6px 16px",
                                minWidth: 60,
                                minHeight: 50,
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: isActive ? activeColor : "transparent",
                                }}
                            >
                                <item.Icon color={iconColor} />
                            </div>
                            <span
                                style={{
                                    fontSize: 10,
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? "white" : "#9CA3AF",
                                }}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
