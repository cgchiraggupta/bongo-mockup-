"use client";

import { useMode } from "@/context/ModeContext";
import { Package, Truck } from "lucide-react";

export default function ModeSwitcher() {
    const { mode, toggleMode } = useMode();

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
