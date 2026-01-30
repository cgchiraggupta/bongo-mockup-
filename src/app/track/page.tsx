"use client";

import React, { useState, useEffect } from "react";
import BottomNav from "@/components/shared/BottomNav";
import { useGeolocation, DEFAULT_LOCATION } from "@/hooks/useGeolocation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Booking {
    id: string;
    status: string;
    pickup_address: string;
    dropoff_address: string;
    pickup_lat: number;
    pickup_lng: number;
    dropoff_lat: number;
    dropoff_lng: number;
    driver_id: string | null;
}

export default function TrackPage() {
    const { user } = useAuth();
    const { latitude, longitude, loading: locationLoading, error: locationError } = useGeolocation({ watch: true });
    const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
    const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Use real location or fallback
    const userLat = latitude || DEFAULT_LOCATION.lat;
    const userLng = longitude || DEFAULT_LOCATION.lng;

    // Fetch active booking
    useEffect(() => {
        if (!user) return;

        const fetchActiveBooking = async () => {
            const { data } = await supabase
                .from("bookings")
                .select("*")
                .eq("customer_id", user.id)
                .in("status", ["accepted", "picked_up", "in_transit"])
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setActiveBooking(data);
            }
        };

        fetchActiveBooking();

        // Subscribe to booking updates
        const channel = supabase
            .channel("booking-updates")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "bookings",
                    filter: `customer_id=eq.${user.id}`,
                },
                (payload) => {
                    setActiveBooking(payload.new as Booking);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Subscribe to driver location updates
    useEffect(() => {
        if (!activeBooking?.driver_id) return;

        const channel = supabase
            .channel("driver-location")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "driver_locations",
                    filter: `driver_id=eq.${activeBooking.driver_id}`,
                },
                (payload) => {
                    const loc = payload.new as { lat: number; lng: number };
                    setDriverLocation({ lat: loc.lat, lng: loc.lng });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeBooking?.driver_id]);

    // Map center - use driver location if available, else user location
    const mapLat = driverLocation?.lat || userLat;
    const mapLng = driverLocation?.lng || userLng;

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Map Container */}
            <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
                {/* OpenStreetMap iframe with real location */}
                <iframe
                    title="Delivery Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0, position: "absolute", inset: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLng - 0.02
                        },${mapLat - 0.015},${mapLng + 0.02},${mapLat + 0.015
                        }&layer=mapnik&marker=${mapLat},${mapLng}`}
                />

                {/* Location Status */}
                <div
                    style={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        right: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        zIndex: 10,
                        gap: 8,
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            borderRadius: 16,
                            padding: "12px 16px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            maxWidth: "70%",
                        }}
                    >
                        {locationLoading ? (
                            <div style={{ fontSize: 12, color: "#6B7280" }}>📍 Getting your location...</div>
                        ) : locationError ? (
                            <div style={{ fontSize: 12, color: "#EF4444" }}>⚠️ {locationError}</div>
                        ) : (
                            <>
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>📍 Your Location</div>
                                <div style={{ fontSize: 11, color: "#6B7280" }}>
                                    {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
                                </div>
                            </>
                        )}
                    </div>

                    {activeBooking && (
                        <div
                            style={{
                                background: "#10B981",
                                color: "white",
                                borderRadius: 20,
                                padding: "8px 14px",
                                fontSize: 11,
                                fontWeight: 600,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            }}
                        >
                            {activeBooking.status.replace("_", " ").toUpperCase()}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Card */}
            <div
                style={{
                    background: "white",
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    padding: "20px",
                    paddingBottom: 100,
                    boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
                }}
            >
                {activeBooking ? (
                    <>
                        {/* Active Booking Info */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>TRACKING</div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>#{activeBooking.id.slice(0, 8).toUpperCase()}</div>
                        </div>

                        {/* Route Info */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                                padding: 16,
                                background: "#F9FAFB",
                                borderRadius: 16,
                            }}
                        >
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                <div style={{ fontSize: 16 }}>📦</div>
                                <div>
                                    <div style={{ fontSize: 11, color: "#6B7280" }}>Pickup</div>
                                    <div style={{ fontSize: 13, fontWeight: 500 }}>{activeBooking.pickup_address}</div>
                                </div>
                            </div>
                            <div style={{ width: 1, height: 20, background: "#E5E7EB", marginLeft: 7 }} />
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                <div style={{ fontSize: 16 }}>📍</div>
                                <div>
                                    <div style={{ fontSize: 11, color: "#6B7280" }}>Dropoff</div>
                                    <div style={{ fontSize: 13, fontWeight: 500 }}>{activeBooking.dropoff_address}</div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* No Active Booking */
                    <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                background: "#F3F4F6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 1rem",
                                fontSize: 28,
                            }}
                        >
                            📦
                        </div>
                        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No Active Delivery</h2>
                        <p style={{ fontSize: 13, color: "#6B7280" }}>
                            Create a new delivery to start tracking your package in real-time.
                        </p>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
