"use client";

import { useMode } from "@/context/ModeContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ModeSwitcher from "@/components/shared/ModeSwitcher";
import BottomNav from "@/components/shared/BottomNav";
import CustomerDashboard from "@/components/customer/CustomerDashboard";
import DriverDashboard from "@/components/driver/Dashboard";

export default function Home() {
    const { mode } = useMode();
    const { user, loading } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login");
        }
    }, [user, loading, router]);

    // Show loading state
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

    // Don't render if not authenticated
    if (!user) {
        return null;
    }

    return (
        <main>
            {/* Mode Switcher */}
            <ModeSwitcher />

            {/* Main Content Area */}
            <div>
                {mode === "customer" ? (
                    <CustomerDashboard />
                ) : (
                    <DriverDashboard />
                )}
            </div>

            {/* Navigation */}
            <BottomNav />
        </main>
    );
}
