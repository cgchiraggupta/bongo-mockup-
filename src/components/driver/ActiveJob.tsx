"use client";

import React, { useState } from "react";
import { Navigation, Phone, MessageSquare, Clock, MapPin, CreditCard, Package as PackageIcon, User } from "lucide-react";
import Package3D from "@/components/shared/Package3D";
import SlideButton from "@/components/shared/SlideButton";

interface ActiveJobProps {
    onComplete: () => void;
}

export default function ActiveJob({ onComplete }: ActiveJobProps) {
    const [status, setStatus] = useState<"pickup" | "in_transit" | "dropoff">("pickup");

    // Mock job data
    const job = {
        trackingId: "F165G258",
        service: "Express Parcel",
        receiver: "Emily Carter",
        address: "2210 Coral Way, Apt 3C",
        packageType: "Retail Merchandise",
        paymentMethod: "Cash on Delivery",
        notes: "Please ensure the package is handled with care — fragile items inside.",
        distance: "0 mile",
        time: "1 min",
        eta: "10:05 PM",
    };

    const handleSlideComplete = () => {
        if (status === "pickup") {
            setStatus("in_transit");
        } else if (status === "in_transit") {
            setStatus("dropoff");
        } else {
            onComplete();
        }
    };

    const slideText = {
        pickup: "Slide to pick up the order",
        in_transit: "Slide to arrive at destination",
        dropoff: "Slide to complete delivery",
    };

    const statusLabel = {
        pickup: "Looking for Courier",
        in_transit: "In Transit",
        dropoff: "Arriving Soon",
    };

    return (
        <div className="animate-enter" style={{ paddingBottom: 100 }}>
            {/* Header Stats */}
            <div style={{
                display: "flex",
                justifyContent: "space-around",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid var(--color-border)",
                background: "white",
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Distance</div>
                    <div style={{ fontWeight: 700 }}>{job.distance}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Time</div>
                    <div style={{ fontWeight: 700 }}>{job.time}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>ETA</div>
                    <div style={{ fontWeight: 700 }}>{job.eta}</div>
                </div>
            </div>

            {/* Tracking Card */}
            <div style={{ padding: "1.5rem" }}>
                <div style={{
                    background: "white",
                    borderRadius: 24,
                    padding: "1.5rem",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}>
                    {/* Package & ID */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "1rem" }}>
                        <div style={{
                            background: "#ECFDF5",
                            borderRadius: 16,
                            padding: "0.75rem",
                        }}>
                            <Package3D color="green" size="medium" />
                        </div>
                        <div>
                            <h2 style={{ fontWeight: 800, fontSize: "1.25rem", margin: 0, letterSpacing: "-0.02em" }}>
                                #{job.trackingId}
                            </h2>
                            <div style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                marginTop: 4,
                                background: "#ECFDF5",
                                color: "#10B981",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                padding: "4px 10px",
                                borderRadius: 20,
                            }}>
                                <span style={{ width: 6, height: 6, background: "#10B981", borderRadius: "50%" }} />
                                {statusLabel[status]}
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        gap: "0.75rem 1rem",
                        fontSize: "0.875rem",
                        marginBottom: "1.5rem",
                    }}>
                        <span style={{ color: "var(--color-text-secondary)" }}>Service</span>
                        <span style={{ fontWeight: 500 }}>{job.service}</span>

                        <span style={{ color: "var(--color-text-secondary)" }}>Receiver</span>
                        <span style={{ fontWeight: 500 }}>{job.receiver}</span>

                        <span style={{ color: "var(--color-text-secondary)" }}>Address</span>
                        <span style={{ fontWeight: 500 }}>{job.address}</span>

                        <span style={{ color: "var(--color-text-secondary)" }}>Package Type</span>
                        <span style={{ fontWeight: 500 }}>{job.packageType}</span>

                        <span style={{ color: "var(--color-text-secondary)" }}>Payment Method</span>
                        <span style={{ fontWeight: 500 }}>{job.paymentMethod}</span>
                    </div>

                    {/* Notes */}
                    <div style={{
                        background: "#F9FAFB",
                        borderRadius: 12,
                        padding: "0.75rem 1rem",
                        fontSize: "0.8125rem",
                        color: "var(--color-text-secondary)",
                        fontStyle: "italic",
                        marginBottom: "1.5rem",
                    }}>
                        "{job.notes}"
                    </div>

                    {/* Slide Button */}
                    <SlideButton
                        text={slideText[status]}
                        onComplete={handleSlideComplete}
                        color="#F472B6"
                    />
                </div>
            </div>

            {/* Contact Support Footer */}
            <div style={{
                position: "fixed",
                bottom: 80,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                padding: "0 1.5rem",
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#1F2937",
                    borderRadius: 16,
                    padding: "0.75rem 1.25rem",
                }}>
                    <span style={{ color: "white", fontSize: "0.875rem", fontWeight: 500 }}>Contact support</span>
                    <button style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.1)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <MessageSquare size={18} color="white" />
                    </button>
                    <button style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.1)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Phone size={18} color="white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
