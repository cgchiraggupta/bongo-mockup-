"use client";

import React from "react";
import { useMode } from "@/context/ModeContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Home, MapPin, Clock, User } from "lucide-react";

export default function BottomNav() {
    const { mode } = useMode();
    const { profile, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: "Home", path: "/" },
        { icon: MapPin, label: "Track", path: "/track" },
        { icon: Clock, label: "History", path: "/history" },
        { icon: User, label: "Profile", path: "/profile" },
    ];

    const handleNavClick = (path: string) => {
        router.push(path);
    };

    return (
        <>
            <style jsx global>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          padding: 0.5rem 0.75rem;
          padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
          background: #1F2937;
          z-index: 100;
        }
        
        /* Mobile */
        @media (max-width: 767px) {
          .bottom-nav {
            border-radius: 0;
            left: 0;
            transform: none;
            max-width: 100%;
          }
        }
        
        /* Tablet */
        @media (min-width: 768px) and (max-width: 1023px) {
          .bottom-nav {
            max-width: 600px;
            border-top-left-radius: 24px;
            border-top-right-radius: 24px;
          }
        }
        
        /* Desktop */
        @media (min-width: 1024px) {
          .bottom-nav {
            max-width: 430px;
            border-radius: 0 0 32px 32px;
            bottom: 1.5rem;
          }
        }
      `}</style>

            <nav className="bottom-nav">
                <div style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                }}>
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path || (item.path === "/" && pathname === "/");

                        return (
                            <button
                                key={index}
                                onClick={() => handleNavClick(item.path)}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 2,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "0.375rem 0.75rem",
                                    borderRadius: 12,
                                    transition: "all 0.2s",
                                }}
                            >
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: isActive
                                        ? (mode === "customer" ? "var(--color-primary)" : "#10B981")
                                        : "transparent",
                                }}>
                                    <Icon
                                        size={20}
                                        color={isActive ? "white" : "#9CA3AF"}
                                    />
                                </div>
                                <span style={{
                                    fontSize: "0.5625rem",
                                    fontWeight: isActive ? 600 : 500,
                                    color: isActive ? "white" : "#9CA3AF",
                                }}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
