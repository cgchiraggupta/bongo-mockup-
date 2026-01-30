"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Camera, Package, Truck, User, LogOut, ChevronRight } from "lucide-react";
import BottomNav from "@/components/shared/BottomNav";

export default function ProfilePage() {
    const { user, profile, signOut, updateProfile } = useAuth();
    const router = useRouter();
    const [currentRole, setCurrentRole] = useState<"customer" | "driver" | "both">("customer");
    const [isUpdating, setIsUpdating] = useState(false);

    // Get role from profile or user metadata
    useEffect(() => {
        if (profile?.role) {
            setCurrentRole(profile.role);
        } else if (user?.user_metadata?.role) {
            setCurrentRole(user.user_metadata.role);
        }
    }, [profile, user]);

    const displayName = profile?.full_name || user?.user_metadata?.full_name || "User";
    const email = user?.email || "No email";
    const initial = (displayName[0] || "U").toUpperCase();

    const handleRoleChange = async (role: "customer" | "driver" | "both") => {
        if (role === currentRole) return;
        setIsUpdating(true);
        setCurrentRole(role);

        try {
            await updateProfile({ role });
        } catch (err) {
            console.error("Failed to update role:", err);
        }
        setIsUpdating(false);
    };

    const handleSignOut = async () => {
        await signOut();
        router.push("/auth/login");
    };

    if (!user) {
        return null;
    }

    return (
        <div className="responsive-page" style={{ padding: "1.25rem", paddingBottom: 100 }}>
            <style jsx>{`
        @media (min-width: 768px) {
          .responsive-page {
            padding: 1.5rem 2rem !important;
          }
        }
        @media (min-width: 1024px) {
          .responsive-page {
            padding: 1.25rem !important;
          }
        }
      `}</style>

            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>Profile</h1>

            {/* Avatar & Info */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "2rem",
            }}>
                <div style={{ position: "relative", marginBottom: "0.75rem" }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--color-primary), #F472B6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "2rem",
                        fontWeight: 700,
                    }}>
                        {initial}
                    </div>
                    <button style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "white",
                        border: "2px solid var(--color-bg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}>
                        <Camera size={14} color="var(--color-text-secondary)" />
                    </button>
                </div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>{displayName}</h2>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>{email}</p>
            </div>

            {/* Role Selection */}
            <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                    I want to...
                </h3>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                }}>
                    <button
                        onClick={() => handleRoleChange("customer")}
                        className={`role-option ${currentRole === "customer" ? "selected" : ""}`}
                    >
                        <Package size={22} />
                        <span>Send Packages</span>
                    </button>
                    <button
                        onClick={() => handleRoleChange("driver")}
                        className={`role-option ${currentRole === "driver" ? "selected" : ""}`}
                    >
                        <Truck size={22} />
                        <span>Deliver Packages</span>
                    </button>
                    <button
                        onClick={() => handleRoleChange("both")}
                        className={`role-option both ${currentRole === "both" ? "selected" : ""}`}
                    >
                        <User size={22} />
                        <span>Do Both</span>
                    </button>
                </div>
                {isUpdating && (
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.5rem", textAlign: "center" }}>
                        Updating...
                    </p>
                )}
            </div>

            {/* Menu Items */}
            <div style={{
                background: "white",
                borderRadius: 16,
                border: "1px solid var(--color-border)",
                overflow: "hidden",
                marginBottom: "1.5rem",
            }}>
                <MenuItem label="Edit Profile" />
                <MenuItem label="Notification Settings" />
                <MenuItem label="Payment Methods" />
                <MenuItem label="Help & Support" />
            </div>

            {/* Sign Out */}
            <button
                onClick={handleSignOut}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "0.875rem",
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: 14,
                    color: "#DC2626",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                }}
            >
                <LogOut size={18} />
                Sign Out
            </button>

            <BottomNav />
        </div>
    );
}

function MenuItem({ label }: { label: string }) {
    return (
        <button style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.875rem 1rem",
            background: "none",
            border: "none",
            borderBottom: "1px solid var(--color-border)",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--color-text-main)",
            textAlign: "left",
        }}>
            {label}
            <ChevronRight size={18} color="#9CA3AF" />
        </button>
    );
}
