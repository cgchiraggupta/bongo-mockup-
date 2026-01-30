"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Search, Package, Calculator, Receipt, Headphones, ChevronRight, Bell } from "lucide-react";
import TrackingCard from "@/components/shared/TrackingCard";

// Mock data for current deliveries
const MOCK_DELIVERIES = [
    { id: "CB1AD25", status: "in_delivery" as const, color: "pink" as const, arrival: "12:05 PM" },
    { id: "A856K005", status: "delivered" as const, color: "yellow" as const, arrival: "08:22 AM" },
];

const MOCK_HISTORY = [
    { id: "CA18WS8", status: "delivered" as const, color: "blue" as const, arrival: "Yesterday" },
    { id: "F165G258", status: "delivered" as const, color: "green" as const, arrival: "Jan 28" },
];

export default function CustomerDashboard() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const displayName = profile?.full_name || user?.user_metadata?.full_name || "User";
    const initial = (displayName[0] || 'U').toUpperCase();

    return (
        <div className="animate-enter responsive-container" style={{ paddingBottom: 100 }}>
            <style jsx>{`
        .responsive-container {
          padding: 1.25rem;
        }
        
        @media (min-width: 768px) {
          .responsive-container {
            padding: 1.5rem 2rem;
          }
        }
        
        @media (min-width: 1024px) {
          .responsive-container {
            padding: 1.25rem;
          }
        }
      `}</style>

            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: "1.25rem",
            }}>
                <button
                    onClick={() => router.push("/profile")}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--color-primary), #F472B6)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "1rem",
                        flexShrink: 0,
                    }}
                >
                    {initial}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}>
                        {displayName}
                    </h1>
                    <p style={{
                        fontSize: "0.6875rem",
                        color: "var(--color-text-secondary)",
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                    }}>
                        <span>📍</span> 2210 Coral Way, Apt 3C
                    </p>
                </div>
                <button style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "white",
                    border: "1px solid var(--color-border)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}>
                    <Bell size={18} color="#6B7280" />
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: "1.25rem" }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "white",
                    borderRadius: 14,
                    padding: "0 14px",
                    height: 48,
                    border: "1px solid var(--color-border)",
                }}>
                    <Search size={18} color="#9CA3AF" />
                    <input
                        type="text"
                        placeholder="Track your shipment..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            background: "none",
                            border: "none",
                            outline: "none",
                            fontSize: "0.8125rem",
                            fontFamily: "inherit",
                            color: "var(--color-text-main)",
                        }}
                    />
                </div>
            </div>

            {/* Current Deliveries */}
            <div style={{ marginBottom: "1.25rem" }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.625rem",
                }}>
                    <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, margin: 0 }}>Current Deliveries</h2>
                </div>

                {/* Horizontal scroll for deliveries - but stack on larger screens */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                }}>
                    {MOCK_DELIVERIES.map((d) => (
                        <TrackingCard
                            key={d.id}
                            trackingId={d.id}
                            status={d.status}
                            packageColor={d.color}
                            arrivalTime={d.arrival}
                            onClick={() => { }}
                        />
                    ))}
                </div>
            </div>

            {/* Services Grid */}
            <div style={{ marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "0.625rem" }}>Services</h2>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 10,
                }}>
                    <ServiceButton icon={<Package size={22} />} label="Create" />
                    <ServiceButton icon={<Calculator size={22} />} label="Calculate" />
                    <ServiceButton icon={<Receipt size={22} />} label="Receipts" />
                    <ServiceButton icon={<Headphones size={22} />} label="Support" />
                </div>
            </div>

            {/* Delivery History */}
            <div>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.625rem",
                }}>
                    <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, margin: 0 }}>Delivery History</h2>
                    <button
                        onClick={() => router.push("/history")}
                        style={{
                            background: "none",
                            border: "none",
                            color: "var(--color-primary)",
                            fontWeight: 600,
                            fontSize: "0.6875rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            padding: 0,
                        }}>
                        See all <ChevronRight size={12} />
                    </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {MOCK_HISTORY.map((d) => (
                        <TrackingCard
                            key={d.id}
                            trackingId={d.id}
                            status={d.status}
                            packageColor={d.color}
                            arrivalTime={d.arrival}
                            variant="compact"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ServiceButton({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <button style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "0.875rem 0.5rem",
            background: "white",
            border: "1px solid var(--color-border)",
            borderRadius: 14,
            cursor: "pointer",
            transition: "all 0.2s",
            minHeight: 72,
        }}>
            <div style={{ color: "#374151" }}>{icon}</div>
            <span style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: "#6B7280",
            }}>
                {label}
            </span>
        </button>
    );
}
