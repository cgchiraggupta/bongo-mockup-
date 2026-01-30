"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Search, Package, Calculator, Receipt, Headphones, ChevronRight, Bell, Plus, X } from "lucide-react";
import TrackingCard from "@/components/shared/TrackingCard";
import BottomNav from "@/components/shared/BottomNav";

interface Booking {
    id: string;
    status: "pending" | "accepted" | "picked_up" | "in_transit" | "delivered" | "cancelled";
    pickup_address: string;
    dropoff_address: string;
    created_at: string;
}

export default function CustomerDashboard() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const { latitude, longitude } = useGeolocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Booking form state
    const [pickupAddress, setPickupAddress] = useState("");
    const [dropoffAddress, setDropoffAddress] = useState("");
    const [packageSize, setPackageSize] = useState("small");

    const displayName = profile?.full_name || user?.user_metadata?.full_name || "User";
    const initial = (displayName[0] || 'U').toUpperCase();

    // Fetch user's bookings
    useEffect(() => {
        if (!user) return;

        const fetchBookings = async () => {
            const { data } = await supabase
                .from("bookings")
                .select("*")
                .eq("customer_id", user.id)
                .order("created_at", { ascending: false })
                .limit(10);

            if (data) {
                setBookings(data);
            }
        };

        fetchBookings();

        // Subscribe to booking updates
        const channel = supabase
            .channel("my-bookings")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookings",
                    filter: `customer_id=eq.${user.id}`,
                },
                () => {
                    fetchBookings();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Create new booking
    const handleCreateBooking = async () => {
        if (!user || !pickupAddress || !dropoffAddress) return;

        setIsCreating(true);

        // Use current location or default
        const pickupLat = latitude || 19.076;
        const pickupLng = longitude || 72.8777;

        // For demo, dropoff is slightly offset
        const dropoffLat = pickupLat + 0.01;
        const dropoffLng = pickupLng + 0.01;

        const { error } = await supabase.from("bookings").insert({
            customer_id: user.id,
            pickup_address: pickupAddress,
            pickup_lat: pickupLat,
            pickup_lng: pickupLng,
            dropoff_address: dropoffAddress,
            dropoff_lat: dropoffLat,
            dropoff_lng: dropoffLng,
            package_size: packageSize,
            status: "pending",
        });

        setIsCreating(false);

        if (!error) {
            setShowCreateModal(false);
            setPickupAddress("");
            setDropoffAddress("");
            setPackageSize("small");
        }
    };

    // Split bookings into active and history
    const activeBookings = bookings.filter(b => ["pending", "accepted", "picked_up", "in_transit"].includes(b.status));
    const historyBookings = bookings.filter(b => ["delivered", "cancelled"].includes(b.status));

    // Color mapping for cards
    const colors: Array<"pink" | "yellow" | "blue" | "green"> = ["pink", "yellow", "blue", "green"];

    return (
        <div className="animate-enter" style={{ padding: "1.25rem", paddingBottom: 100 }}>
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
                        <span>📍</span>
                        {latitude && longitude
                            ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                            : "Getting location..."
                        }
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

                {activeBookings.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {activeBookings.map((b, i) => (
                            <TrackingCard
                                key={b.id}
                                trackingId={b.id.slice(0, 8).toUpperCase()}
                                status={b.status === "pending" ? "pending" : "in_delivery"}
                                packageColor={colors[i % colors.length]}
                                arrivalTime={new Date(b.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                onClick={() => router.push("/track")}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{
                        padding: "2rem",
                        textAlign: "center",
                        background: "white",
                        borderRadius: 16,
                        border: "1px solid var(--color-border)",
                    }}>
                        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>No active deliveries</p>
                    </div>
                )}
            </div>

            {/* Services Grid */}
            <div style={{ marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "0.625rem" }}>Services</h2>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 10,
                }}>
                    <ServiceButton
                        icon={<Plus size={22} />}
                        label="Create"
                        onClick={() => setShowCreateModal(true)}
                        highlight
                    />
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

                {historyBookings.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {historyBookings.slice(0, 2).map((b, i) => (
                            <TrackingCard
                                key={b.id}
                                trackingId={b.id.slice(0, 8).toUpperCase()}
                                status="delivered"
                                packageColor={colors[(i + 2) % colors.length]}
                                arrivalTime={new Date(b.created_at).toLocaleDateString()}
                                variant="compact"
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{
                        padding: "1.5rem",
                        textAlign: "center",
                        background: "white",
                        borderRadius: 16,
                        border: "1px solid var(--color-border)",
                    }}>
                        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>No delivery history yet</p>
                    </div>
                )}
            </div>

            {/* Create Booking Modal */}
            {showCreateModal && (
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
                            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>New Delivery</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}
                            >
                                <X size={24} color="#6B7280" />
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                                    Pickup Address
                                </label>
                                <input
                                    type="text"
                                    value={pickupAddress}
                                    onChange={(e) => setPickupAddress(e.target.value)}
                                    placeholder="Enter pickup location"
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
                                    Dropoff Address
                                </label>
                                <input
                                    type="text"
                                    value={dropoffAddress}
                                    onChange={(e) => setDropoffAddress(e.target.value)}
                                    placeholder="Enter delivery destination"
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
                                    Package Size
                                </label>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                                    {["small", "medium", "large", "extra_large"].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setPackageSize(size)}
                                            style={{
                                                padding: "10px",
                                                border: packageSize === size ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                                                borderRadius: 10,
                                                background: packageSize === size ? "#FFF5F9" : "white",
                                                fontSize: 11,
                                                fontWeight: 500,
                                                cursor: "pointer",
                                                textTransform: "capitalize",
                                            }}
                                        >
                                            {size.replace("_", " ")}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleCreateBooking}
                                disabled={isCreating || !pickupAddress || !dropoffAddress}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    background: !pickupAddress || !dropoffAddress ? "#E5E7EB" : "var(--color-primary)",
                                    color: !pickupAddress || !dropoffAddress ? "#9CA3AF" : "white",
                                    border: "none",
                                    borderRadius: 14,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: !pickupAddress || !dropoffAddress ? "not-allowed" : "pointer",
                                    marginTop: 8,
                                }}
                            >
                                {isCreating ? "Creating..." : "Create Delivery"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}

function ServiceButton({
    icon,
    label,
    onClick,
    highlight
}: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    highlight?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "0.875rem 0.5rem",
                background: highlight ? "var(--color-primary)" : "white",
                border: highlight ? "none" : "1px solid var(--color-border)",
                borderRadius: 14,
                cursor: "pointer",
                transition: "all 0.2s",
                minHeight: 72,
            }}
        >
            <div style={{ color: highlight ? "white" : "#374151" }}>{icon}</div>
            <span style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: highlight ? "white" : "#6B7280",
            }}>
                {label}
            </span>
        </button>
    );
}
