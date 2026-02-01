"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import BottomNav from "@/components/shared/BottomNav";
import {
    ArrowLeft,
    Clock,
    MapPin,
    Users,
    Star,
    Check,
    Package,
    Truck,
    RefreshCw,
} from "lucide-react";

interface Bid {
    id: string;
    driver_id: string;
    bid_amount: number;
    estimated_time_mins: number;
    driver_message: string | null;
    helpers_included: number;
    created_at: string;
    status: string;
    // Driver profile (joined)
    driver_profile?: {
        full_name: string;
        rating?: number;
        completed_jobs?: number;
    };
}

interface Booking {
    id: string;
    category: string;
    item_description: string;
    pickup_address: string;
    dropoff_address: string;
    suggested_price: number;
    bidding_ends_at: string;
    status: string;
    created_at: string;
}

export default function BiddingRoomPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState("");

    // Fetch booking and bids
    const fetchData = useCallback(async () => {
        try {
            // Fetch booking
            const { data: bookingData } = await supabase
                .from("bookings")
                .select("*")
                .eq("id", bookingId)
                .single();

            if (bookingData) {
                setBooking(bookingData);
            }

            // Fetch bids with driver info
            const { data: bidsData } = await supabase
                .from("bids")
                .select(`
                    *,
                    driver_profile:profiles!driver_id(full_name)
                `)
                .eq("booking_id", bookingId)
                .eq("status", "pending")
                .order("bid_amount", { ascending: true });

            if (bidsData) {
                setBids(bidsData);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }, [bookingId]);

    useEffect(() => {
        fetchData();

        // Subscribe to new bids
        const channel = supabase
            .channel(`bids-${bookingId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "bids",
                    filter: `booking_id=eq.${bookingId}`,
                },
                () => fetchData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [bookingId, fetchData]);

    // Countdown timer
    useEffect(() => {
        if (!booking?.bidding_ends_at) return;

        const interval = setInterval(() => {
            const diff = new Date(booking.bidding_ends_at).getTime() - Date.now();
            if (diff <= 0) {
                setTimeRemaining("Bidding ended");
                clearInterval(interval);
            } else {
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                setTimeRemaining(`${mins}:${secs.toString().padStart(2, "0")}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [booking?.bidding_ends_at]);

    // Accept a bid
    const handleAcceptBid = async (bid: Bid) => {
        if (!user?.id || accepting) return;

        setAccepting(bid.id);

        try {
            // Update booking with accepted bid
            const { error: bookingError } = await supabase
                .from("bookings")
                .update({
                    status: "accepted",
                    driver_id: bid.driver_id,
                    winning_bid_id: bid.id,
                    final_price: bid.bid_amount,
                    bid_selected_at: new Date().toISOString(),
                })
                .eq("id", bookingId);

            if (bookingError) throw bookingError;

            // Update bid status
            const { error: bidError } = await supabase
                .from("bids")
                .update({ status: "accepted" })
                .eq("id", bid.id);

            if (bidError) throw bidError;

            // Reject other bids
            await supabase
                .from("bids")
                .update({ status: "rejected" })
                .eq("booking_id", bookingId)
                .neq("id", bid.id);

            // Navigate to tracking
            router.push("/track");
        } catch (err) {
            console.error("Error accepting bid:", err);
            setAccepting(null);
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <RefreshCw size={32} className="animate-spin" color="#E16595" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div style={{ padding: 24, textAlign: "center" }}>
                <p>Booking not found</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#F3F4F6", paddingBottom: 100 }}>
            {/* Header */}
            <div style={{
                background: "white",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderBottom: "1px solid #E5E7EB",
            }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                    }}
                >
                    <ArrowLeft size={24} color="#374151" />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                        Live Bidding
                    </h1>
                    <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
                        {booking.category} delivery
                    </p>
                </div>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: timeRemaining === "Bidding ended" ? "#FEE2E2" : "#ECFDF5",
                    color: timeRemaining === "Bidding ended" ? "#DC2626" : "#059669",
                    padding: "6px 12px",
                    borderRadius: 20,
                    fontSize: 14,
                    fontWeight: 600,
                }}>
                    <Clock size={14} />
                    {timeRemaining}
                </div>
            </div>

            {/* Booking Summary */}
            <div style={{
                margin: 16,
                background: "white",
                borderRadius: 16,
                padding: 16,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Package size={18} color="#E16595" />
                    <span style={{ fontWeight: 600 }}>{booking.item_description}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <MapPin size={14} color="#10B981" style={{ marginTop: 2 }} />
                        <span>{booking.pickup_address}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <MapPin size={14} color="#EF4444" style={{ marginTop: 2 }} />
                        <span>{booking.dropoff_address}</span>
                    </div>
                </div>
                <div style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid #E5E7EB",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <span style={{ color: "#6B7280", fontSize: 13 }}>Your budget</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#E16595" }}>
                        ₹{booking.suggested_price}
                    </span>
                </div>
            </div>

            {/* Bids Section */}
            <div style={{ padding: "0 16px" }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                        Driver Bids ({bids.length})
                    </h2>
                    <button
                        onClick={fetchData}
                        style={{
                            background: "#F3F4F6",
                            border: "none",
                            borderRadius: 8,
                            padding: 8,
                            cursor: "pointer",
                        }}
                    >
                        <RefreshCw size={16} color="#6B7280" />
                    </button>
                </div>

                {bids.length === 0 ? (
                    <div style={{
                        background: "white",
                        borderRadius: 16,
                        padding: 32,
                        textAlign: "center",
                    }}>
                        <Truck size={48} color="#D1D5DB" />
                        <p style={{ color: "#6B7280", marginTop: 12 }}>
                            Waiting for drivers to bid...
                        </p>
                        <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 4 }}>
                            Drivers in your area will see your request
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {bids.map((bid, index) => (
                            <div
                                key={bid.id}
                                style={{
                                    background: "white",
                                    borderRadius: 16,
                                    padding: 16,
                                    border: index === 0 ? "2px solid #10B981" : "2px solid transparent",
                                }}
                            >
                                {/* Driver Info */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: 12,
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
                                        }}>
                                            {(bid.driver_profile?.full_name?.[0] || "D").toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>
                                                {bid.driver_profile?.full_name || "Driver"}
                                            </div>
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                                fontSize: 12,
                                                color: "#6B7280",
                                            }}>
                                                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                                                4.8 • 127 deliveries
                                            </div>
                                        </div>
                                    </div>
                                    {index === 0 && (
                                        <span style={{
                                            background: "#ECFDF5",
                                            color: "#059669",
                                            fontSize: 11,
                                            fontWeight: 600,
                                            padding: "4px 8px",
                                            borderRadius: 12,
                                        }}>
                                            LOWEST
                                        </span>
                                    )}
                                </div>

                                {/* Bid Details */}
                                <div style={{
                                    display: "flex",
                                    gap: 16,
                                    marginBottom: 12,
                                    fontSize: 13,
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <Clock size={14} color="#6B7280" />
                                        <span>{bid.estimated_time_mins} mins</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <Users size={14} color="#6B7280" />
                                        <span>{bid.helpers_included} helper{bid.helpers_included > 1 ? "s" : ""}</span>
                                    </div>
                                </div>

                                {/* Message */}
                                {bid.driver_message && (
                                    <div style={{
                                        background: "#F9FAFB",
                                        borderRadius: 8,
                                        padding: 10,
                                        fontSize: 13,
                                        color: "#374151",
                                        fontStyle: "italic",
                                        marginBottom: 12,
                                    }}>
                                        &ldquo;{bid.driver_message}&rdquo;
                                    </div>
                                )}

                                {/* Price & Accept */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>
                                        ₹{bid.bid_amount}
                                    </div>
                                    <button
                                        onClick={() => handleAcceptBid(bid)}
                                        disabled={accepting !== null || booking.status !== "accepting_bids"}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            background: accepting === bid.id ? "#9CA3AF" : "#10B981",
                                            color: "white",
                                            border: "none",
                                            borderRadius: 12,
                                            padding: "10px 20px",
                                            fontSize: 14,
                                            fontWeight: 600,
                                            cursor: accepting !== null ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        {accepting === bid.id ? (
                                            <>
                                                <RefreshCw size={16} className="animate-spin" />
                                                Accepting...
                                            </>
                                        ) : (
                                            <>
                                                <Check size={16} />
                                                Accept
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
