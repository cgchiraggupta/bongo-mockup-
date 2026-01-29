"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User, LogOut, Package, Truck, ChevronRight, Star, Shield } from "lucide-react";

export default function ProfilePage() {
    const { user, profile, signOut, updateProfile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        await signOut();
        router.push("/auth/login");
    };

    const handleRoleChange = async (newRole: "customer" | "driver" | "both") => {
        await updateProfile({ role: newRole });
    };

    if (!user || !profile) {
        return null;
    }

    return (
        <div className="animate-enter" style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2rem' }}>
                <button
                    onClick={() => router.push('/')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
                >
                    <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} color="#9CA3AF" />
                </button>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Profile</h1>
            </div>

            {/* Profile Card */}
            <div className="driver-card" style={{ flexDirection: 'column', alignItems: 'center', padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary), #F472B6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                }}>
                    <span style={{ color: 'white', fontSize: '2rem', fontWeight: 700 }}>
                        {(profile.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{profile.full_name || 'User'}</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{user.email}</p>
                <div style={{
                    marginTop: '0.5rem',
                    background: '#F0FDF4',
                    color: '#16A34A',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                }}>
                    <Shield size={12} />
                    Verified Account
                </div>
            </div>

            {/* Role Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Account Type
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button
                        onClick={() => handleRoleChange("customer")}
                        className={`role-option ${profile.role === "customer" ? "selected" : ""}`}
                    >
                        <Package size={24} />
                        <span>Send Packages</span>
                    </button>
                    <button
                        onClick={() => handleRoleChange("driver")}
                        className={`role-option ${profile.role === "driver" ? "selected" : ""}`}
                    >
                        <Truck size={24} />
                        <span>Deliver</span>
                    </button>
                    <button
                        onClick={() => handleRoleChange("both")}
                        className={`role-option both ${profile.role === "both" ? "selected" : ""}`}
                        style={{ gridColumn: '1 / -1' }}
                    >
                        <span>Both - Send & Deliver</span>
                    </button>
                </div>
            </div>

            {/* Menu Items */}
            <div className="driver-card" style={{ flexDirection: 'column', alignItems: 'stretch', padding: 0, overflow: 'hidden' }}>
                <MenuItem icon={<User size={20} />} label="Edit Profile" />
                <MenuItem icon={<Star size={20} />} label="My Reviews" />
            </div>

            {/* Sign Out Button */}
            <button
                onClick={handleSignOut}
                disabled={loading}
                style={{
                    width: '100%',
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-lg)',
                    color: '#DC2626',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                }}
            >
                <LogOut size={18} />
                {loading ? "Signing out..." : "Sign Out"}
            </button>
        </div>
    );
}

function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '1rem',
            background: 'none',
            border: 'none',
            borderBottom: '1px solid var(--color-border)',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left'
        }}>
            <div style={{ color: 'var(--color-text-secondary)' }}>{icon}</div>
            <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
            <ChevronRight size={18} color="#9CA3AF" />
        </button>
    );
}
