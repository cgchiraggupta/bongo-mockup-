"use client";

import { useMode } from "@/context/ModeContext";
import { useAuth } from "@/context/AuthContext";
import { Package, Truck } from "lucide-react";
import { useEffect } from "react";

export default function ModeSwitcher() {
    const { mode, setMode, toggleMode } = useMode();
    const { profile, user } = useAuth();

    // Get user's role
    const userRole = profile?.role || user?.user_metadata?.role || "customer";

    // Set mode based on user's role on mount
    useEffect(() => {
        if (userRole === "customer") {
            setMode("customer");
        } else if (userRole === "driver") {
            setMode("driver");
        }
        // If 'both', keep the current mode or default
    }, [userRole, setMode]);

    // Only show mode switcher if user has "both" role
    if (userRole !== "both") {
        return null;
    }

    return (
        <div className="mode-switch-container">
            <button
                onClick={toggleMode}
                className="mode-switch"
                data-mode={mode}
            >
                {/* Sliding Pill */}
                <div className="mode-switch-pill" />

                {/* Customer Option */}
                <div className={`mode-option ${mode === 'customer' ? 'active' : ''}`}>
                    <Package size={18} />
                    <span>Send</span>
                </div>

                {/* Driver Option */}
                <div className={`mode-option ${mode === 'driver' ? 'active' : ''}`}>
                    <Truck size={18} />
                    <span>Drive</span>
                </div>
            </button>
        </div>
    );
}
