"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Mode = "customer" | "driver";

interface ModeContextType {
    mode: Mode;
    toggleMode: () => void;
    setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeState] = useState<Mode>("customer");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load from local storage
        const savedMode = localStorage.getItem("antigravity_mode") as Mode;
        if (savedMode) {
            setModeState(savedMode);
        }
        setMounted(true);
    }, []);

    const setMode = (newMode: Mode) => {
        setModeState(newMode);
        localStorage.setItem("antigravity_mode", newMode);
    };

    const toggleMode = () => {
        const newMode = mode === "customer" ? "driver" : "customer";
        setMode(newMode);
    };

    // Prevent hydration mismatch (optional: could just return null if essential, but here we just render)
    // We intentionally removed the check that returns <>{children}</> without Provider, 
    // because that causes useMode to fail in children during first render.

    return (
        <ModeContext.Provider value={{ mode, toggleMode, setMode }}>
            <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
                {children}
            </div>
        </ModeContext.Provider>
    );
}

export function useMode() {
    const context = useContext(ModeContext);
    if (context === undefined) {
        throw new Error("useMode must be used within a ModeProvider");
    }
    return context;
}
