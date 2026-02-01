"use client";

import { useMode } from "@/context/ModeContext";
import { useAuth } from "@/context/AuthContext";
import { Package, Truck } from "lucide-react";
import { useEffect } from "react";

export default function ModeSwitcher() {
    const { mode, setMode, toggleMode } = useMode();
    const { profile, user } = useAuth();

    // Get user's role - default to "both" in demo mode
    const userRole = profile?.role || user?.user_metadata?.role || "both";

    // Set mode based on user's role on mount (only for logged-in users with single role)
    useEffect(() => {
        if (user && userRole === "customer") {
            setMode("customer");
        } else if (user && userRole === "driver") {
            setMode("driver");
        }
        // If 'both' or demo mode, keep the current mode
    }, [userRole, setMode, user]);

    // Show mode switcher if user has "both" role OR is in demo mode (not logged in)
    const showSwitcher = !user || userRole === "both";

    if (!showSwitcher) {
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
