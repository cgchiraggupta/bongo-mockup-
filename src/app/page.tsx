"use client";

import { useMode } from "@/context/ModeContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ModeSwitcher from "@/components/shared/ModeSwitcher";
import BottomNav from "@/components/shared/BottomNav";
import BookingFlow from "@/components/customer/BookingFlow";
import DriverDashboard from "@/components/driver/Dashboard";

export default function Home() {
    const { mode } = useMode();
    const { user, loading, profile } = useAuth();
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
            {/* Header with user greeting */}
            <div style={{
                padding: '1rem 1.5rem 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Welcome back</p>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        {profile?.full_name || user.email?.split('@')[0] || 'User'}
                    </h1>
                </div>
                <button
                    onClick={() => router.push('/profile')}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), #F472B6)',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem'
                    }}
                >
                    {(profile?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </button>
            </div>

            {/* Mode Switcher */}
            <ModeSwitcher />

            {/* Main Content Area */}
            <div>
                {mode === "customer" ? (
                    <BookingFlow />
                ) : (
                    <DriverDashboard />
                )}
            </div>

            {/* Navigation */}
            <BottomNav />
        </main>
    );
}
