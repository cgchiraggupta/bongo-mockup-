"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import BottomNav from "@/components/shared/BottomNav";
import CreateBooking from "./CreateBooking";
import {
    Package,
    Bell,
    Search,
    Plus,
    Calculator,
    Receipt,
    Headphones,
    MapPin,
    ChevronRight,
} from "lucide-react";

interface Booking {
    id: string;
    pickup_address: string;
    dropoff_address: string;
    status: string;
    created_at: string;
    category?: string;
    suggested_price?: number;
}

export default function CustomerDashboard() {
    const { user, profile } = useAuth();
    const { latitude, longitude } = useGeolocation();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Fetch user's bookings
    useEffect(() => {
        if (!user?.id) return;

        const fetchBookings = async () => {
            const { data } = await supabase
                .from("bookings")
                .select("*")
                .eq("customer_id", user.id)
                .order("created_at", { ascending: false });

            if (data) setBookings(data);
        };

        fetchBookings();

        // Subscribe to changes
        const channel = supabase
            .channel("customer-bookings")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookings",
                    filter: `customer_id=eq.${user.id}`,
                },
                () => fetchBookings()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    const activeBookings = bookings.filter((b) =>
        ["pending", "accepting_bids", "driver_assigned", "picked_up", "in_transit"].includes(b.status)
    );

    // Demo history for when user has no real bookings (matches /history page)
    const DEMO_HISTORY: Booking[] = [
        { id: "CA18WS8", pickup_address: "Sector 62, Noida", dropoff_address: "Connaught Place, Delhi", status: "delivered", created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: "F165G258", pickup_address: "Lajpat Nagar", dropoff_address: "Greater Noida", status: "delivered", created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
        { id: "X789K123", pickup_address: "Cyber City, Gurugram", dropoff_address: "Sector 18, Noida", status: "delivered", created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
    ];

    const dbHistory = bookings.filter((b) =>
        ["delivered", "cancelled", "completed"].includes(b.status)
    );
    // Use demo data if no database history
    const historyBookings = dbHistory.length > 0 ? dbHistory : DEMO_HISTORY;

    const services = [
        { icon: Plus, label: "Create", action: () => setShowCreateModal(true), primary: true },
        { icon: Calculator, label: "Calculate", action: () => { } },
        { icon: Receipt, label: "Receipts", action: () => { } },
        { icon: Headphones, label: "Support", action: () => { } },
    ];

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "#F59E0B",
            accepting_bids: "#8B5CF6",
            driver_assigned: "#3B82F6",
            picked_up: "#10B981",
            in_transit: "#06B6D4",
            delivered: "#22C55E",
            cancelled: "#EF4444",
        };
        return colors[status] || "#6B7280";
    };

    return (
        <div style={{ minHeight: "100vh", background: "#F3F4F6", paddingBottom: 100 }}>
            {/* Header */}
            <div style={{
                background: "white",
                padding: "20px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "#E16595",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 18,
                    }}>
                        {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "C"}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>
                            {profile?.full_name || "chirag"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}>
                            <MapPin size={12} color="#E16595" />
                            {latitude?.toFixed(4) || "28.6124"}, {longitude?.toFixed(4) || "77.0607"}
                        </div>
                    </div>
                </div>
                <button style={{
                    background: "#F3F4F6",
                    border: "none",
                    borderRadius: 12,
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                }}>
                    <Bell size={20} color="#374151" />
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ padding: "12px 16px", background: "white" }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 16px",
                    background: "#F3F4F6",
                    borderRadius: 12,
                }}>
                    <Search size={18} color="#9CA3AF" />
                    <input
                        placeholder="Track your shipment..."
                        style={{
                            border: "none",
                            background: "transparent",
                            outline: "none",
                            width: "100%",
                            fontSize: 14,
                        }}
                    />
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: 16 }}>
                {/* Active Deliveries */}
                <div style={{
                    background: "white",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                }}>
                    <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>
                        Current Deliveries
                    </h3>
                    {activeBookings.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "20px",
                            color: "#9CA3AF",
                            fontSize: 14,
                        }}>
                            No active deliveries
                        </div>
                    ) : (
                        activeBookings.slice(0, 3).map((booking) => (
                            <div
                                key={booking.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "12px 0",
                                    borderBottom: "1px solid #E5E7EB",
                                }}
                            >
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: "#FDF2F8",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    <Package size={20} color="#E16595" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                                        {booking.pickup_address?.slice(0, 25)}...
                                    </div>
                                    <div style={{ fontSize: 12, color: "#6B7280" }}>
                                        →  {booking.dropoff_address?.slice(0, 20)}...
                                    </div>
                                </div>
                                <div style={{
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    background: getStatusColor(booking.status) + "20",
                                    color: getStatusColor(booking.status),
                                    fontSize: 11,
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                }}>
                                    {booking.status.replace(/_/g, " ")}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Services Grid */}
                <div style={{
                    background: "white",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                }}>
                    <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>
                        Services
                    </h3>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 12,
                    }}>
                        {services.map((service, index) => (
                            <button
                                key={index}
                                onClick={service.action}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: 12,
                                    border: "none",
                                    borderRadius: 12,
                                    background: service.primary ? "#E16595" : "#F3F4F6",
                                    cursor: "pointer",
                                }}
                            >
                                <service.icon
                                    size={22}
                                    color={service.primary ? "white" : "#374151"}
                                />
                                <span style={{
                                    fontSize: 11,
                                    fontWeight: 500,
                                    color: service.primary ? "white" : "#374151",
                                }}>
                                    {service.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* History */}
                <div style={{
                    background: "white",
                    borderRadius: 16,
                    padding: 16,
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                    }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                            Delivery History
                        </h3>
                        <button style={{
                            background: "none",
                            border: "none",
                            color: "#E16595",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}>
                            See all <ChevronRight size={14} />
                        </button>
                    </div>
                    {historyBookings.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "20px",
                            color: "#9CA3AF",
                            fontSize: 14,
                        }}>
                            No delivery history yet
                        </div>
                    ) : (
                        historyBookings.slice(0, 3).map((booking) => (
                            <div
                                key={booking.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "12px 0",
                                    borderBottom: "1px solid #E5E7EB",
                                }}
                            >
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: "#F3F4F6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    <Package size={20} color="#6B7280" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                                        {booking.dropoff_address?.slice(0, 25)}...
                                    </div>
                                    <div style={{ fontSize: 12, color: "#6B7280" }}>
                                        {new Date(booking.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{
                                    fontWeight: 600,
                                    color: "#374151",
                                }}>
                                    ₹{booking.suggested_price || 0}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNav />

            {/* Create Booking Modal */}
            {showCreateModal && (
                <CreateBooking onClose={() => setShowCreateModal(false)} />
            )}
        </div>
    );
}
