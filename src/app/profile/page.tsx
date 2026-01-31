"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Camera, Package, Truck, User, LogOut, ChevronRight, Bell, CreditCard, HelpCircle, Edit3 } from "lucide-react";
import BottomNav from "@/components/shared/BottomNav";

export default function ProfilePage() {
    const { user, profile, signOut, updateProfile } = useAuth();
    const router = useRouter();
    const [currentRole, setCurrentRole] = useState<"customer" | "driver" | "both">("customer");
    const [isUpdating, setIsUpdating] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");

    // Get role from profile or user metadata
    useEffect(() => {
        if (profile?.role) {
            setCurrentRole(profile.role);
        } else if (user?.user_metadata?.role) {
            setCurrentRole(user.user_metadata.role);
        }

        // Set edit values
        setEditName(profile?.full_name || user?.user_metadata?.full_name || "");
        setEditPhone(profile?.phone || "");
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

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        try {
            await updateProfile({
                full_name: editName,
                phone: editPhone,
            });
            setShowEditModal(false);
        } catch (err) {
            console.error("Failed to update profile:", err);
        }
        setIsUpdating(false);
    };

    const showComingSoon = (feature: string) => {
        alert(`${feature} - Coming Soon! 🚀`);
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
                    <button
                        onClick={() => showComingSoon("Profile Photo")}
                        style={{
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
                        }}
                    >
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
                <MenuItem
                    icon={<Edit3 size={18} />}
                    label="Edit Profile"
                    onClick={() => setShowEditModal(true)}
                />
                <MenuItem
                    icon={<Bell size={18} />}
                    label="Notification Settings"
                    onClick={() => showComingSoon("Notifications")}
                />
                <MenuItem
                    icon={<CreditCard size={18} />}
                    label="Payment Methods"
                    onClick={() => showComingSoon("Payments")}
                />
                <MenuItem
                    icon={<HelpCircle size={18} />}
                    label="Help & Support"
                    onClick={() => showComingSoon("Support")}
                    isLast
                />
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

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: "white",
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        width: "100%",
                        maxWidth: 430,
                        padding: "1.5rem",
                        paddingBottom: "2rem",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Edit Profile</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 8,
                                    fontSize: 24,
                                    color: "#6B7280",
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Enter your name"
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: 12,
                                        fontSize: 14,
                                        fontFamily: "inherit",
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    placeholder="Enter your phone number"
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: 12,
                                        fontSize: 14,
                                        fontFamily: "inherit",
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: 12,
                                        fontSize: 14,
                                        fontFamily: "inherit",
                                        background: "#F9FAFB",
                                        color: "#6B7280",
                                    }}
                                />
                                <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>Email cannot be changed</p>
                            </div>

                            <button
                                onClick={handleUpdateProfile}
                                disabled={isUpdating}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    background: "var(--color-primary)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 14,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: isUpdating ? "not-allowed" : "pointer",
                                    marginTop: 8,
                                    opacity: isUpdating ? 0.7 : 1,
                                }}
                            >
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}

function MenuItem({
    icon,
    label,
    onClick,
    isLast
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isLast?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.875rem 1rem",
                background: "none",
                border: "none",
                borderBottom: isLast ? "none" : "1px solid var(--color-border)",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--color-text-main)",
                textAlign: "left",
                gap: 12,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "#6B7280" }}>{icon}</span>
                {label}
            </div>
            <ChevronRight size={18} color="#9CA3AF" />
        </button>
    );
}
