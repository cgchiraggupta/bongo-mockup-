"use client";

import { useMode } from "@/context/ModeContext";
import { useAuth } from "@/context/AuthContext";
import ModeSwitcher from "@/components/shared/ModeSwitcher";
import CustomerDashboard from "@/components/customer/CustomerDashboard";
import DriverDashboard from "@/components/driver/DriverDashboard";

export default function Home() {
    const { mode } = useMode();
    const { loading } = useAuth();

    // Show brief loading state (max 2 seconds)
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        border: '3px solid var(--color-border)',
                        borderTopColor: 'var(--color-primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }} />
                    <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
                </div>
                <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    return (
        <main>
            {/* Mode Switcher */}
            <ModeSwitcher />

            {/* Main Content Area - BottomNav is included in each dashboard */}
            <div>
                {mode === "customer" ? (
                    <CustomerDashboard />
                ) : (
                    <DriverDashboard />
                )}
            </div>
        </main>
    );
}
