"use client";

import React, { useState, useEffect } from "react";
import BottomNav from "@/components/shared/BottomNav";

// Simulated delivery tracking data
const MOCK_DELIVERY = {
    id: "CB1AD25",
    status: "in_transit",
    driver: {
        name: "John D.",
        phone: "+1 (555) 123-4567",
        vehicle: "White Toyota Prius",
        rating: 4.9,
    },
    pickup: {
        address: "123 Main St, Miami",
        lat: 25.7617,
        lng: -80.1918,
    },
    dropoff: {
        address: "2210 Coral Way, Apt 3C",
        lat: 25.7489,
        lng: -80.2372,
    },
    currentLocation: {
        lat: 25.7550,
        lng: -80.2100,
    },
    eta: "12 min",
    distance: "2.3 mi",
};

export default function TrackPage() {
    const [activeDelivery, setActiveDelivery] = useState(MOCK_DELIVERY);

    // Simulate driver movement
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveDelivery((prev) => ({
                ...prev,
                currentLocation: {
                    lat: prev.currentLocation.lat - 0.0001,
                    lng: prev.currentLocation.lng - 0.0002,
                },
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Map Container */}
            <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
                {/* OpenStreetMap iframe - works without API key */}
                <iframe
                    title="Delivery Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0, position: "absolute", inset: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeDelivery.currentLocation.lng - 0.03
                        },${activeDelivery.currentLocation.lat - 0.02},${activeDelivery.currentLocation.lng + 0.03
                        },${activeDelivery.currentLocation.lat + 0.02}&layer=mapnik&marker=${activeDelivery.currentLocation.lat
                        },${activeDelivery.currentLocation.lng}`}
                />

                {/* ETA Header */}
                <div
                    style={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        right: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            borderRadius: 16,
                            padding: "12px 16px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <span style={{ fontSize: 20 }}>📍</span>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>
                                {activeDelivery.distance}
                            </div>
                            <div style={{ fontSize: 11, color: "#6B7280" }}>
                                {activeDelivery.dropoff.address}
                            </div>
                        </div>
                    </div>

                    <button
                        style={{
                            background: "#1F2937",
                            color: "white",
                            border: "none",
                            borderRadius: 20,
                            padding: "10px 16px",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                    >
                        Pause shift
                    </button>
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
                {/* Driver Info */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 20,
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #E16595, #F472B6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 700,
                            fontSize: 18,
                        }}
                    >
                        {activeDelivery.driver.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>
                            {activeDelivery.driver.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>
                            {activeDelivery.driver.vehicle} • ⭐ {activeDelivery.driver.rating}
                        </div>
                    </div>
                    <button
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: "#ECFDF5",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 18,
                        }}
                    >
                        📞
                    </button>
                    <button
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: "#EFF6FF",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 18,
                        }}
                    >
                        💬
                    </button>
                </div>

                {/* Stats Row */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-around",
                        padding: "16px",
                        background: "#F9FAFB",
                        borderRadius: 16,
                    }}
                >
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>
                            Distance
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>
                            {activeDelivery.distance}
                        </div>
                    </div>
                    <div
                        style={{ width: 1, background: "#E5E7EB", alignSelf: "stretch" }}
                    />
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>
                            Time
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>
                            {activeDelivery.eta}
                        </div>
                    </div>
                    <div
                        style={{ width: 1, background: "#E5E7EB", alignSelf: "stretch" }}
                    />
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>
                            Arrival
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>12:05 PM</div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
