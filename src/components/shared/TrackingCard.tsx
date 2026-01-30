import React from "react";
import Package3D from "./Package3D";
import { CheckCircle, Clock, Truck } from "lucide-react";

interface TrackingCardProps {
    trackingId: string;
    status: "pending" | "looking" | "in_delivery" | "delivered";
    packageColor?: "green" | "pink" | "yellow" | "blue";
    arrivalTime?: string;
    onClick?: () => void;
    variant?: "default" | "compact";
}

export default function TrackingCard({
    trackingId,
    status,
    packageColor = "green",
    arrivalTime,
    onClick,
    variant = "default",
}: TrackingCardProps) {
    const statusConfig = {
        pending: { label: "Pending", color: "#F59E0B", bg: "#FEF3C7", icon: Clock },
        looking: { label: "Looking for Courier", color: "#10B981", bg: "#ECFDF5", icon: Truck },
        in_delivery: { label: "In Delivery", color: "#EC4899", bg: "#FCE7F3", icon: Truck },
        delivered: { label: "Received", color: "#22C55E", bg: "#DCFCE7", icon: CheckCircle },
    };

    // Background colors matching reference
    const cardBgColors = {
        green: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
        pink: "linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)",
        yellow: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
        blue: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
        <div
            className="tracking-card"
            onClick={onClick}
            style={{
                background: cardBgColors[packageColor],
                borderRadius: 20,
                padding: variant === "compact" ? "0.875rem" : "1rem",
                display: "flex",
                alignItems: "center",
                gap: variant === "compact" ? "0.75rem" : "1rem",
                cursor: onClick ? "pointer" : "default",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                border: "1px solid rgba(255,255,255,0.5)",
                transition: "transform 0.2s, box-shadow 0.2s",
                minWidth: variant === "compact" ? "auto" : 260,
            }}
        >
            {/* 3D Package */}
            <div style={{
                background: "rgba(255,255,255,0.6)",
                borderRadius: 14,
                padding: variant === "compact" ? "0.5rem" : "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
            }}>
                <Package3D color={packageColor} size={variant === "compact" ? "small" : "medium"} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                    fontWeight: 800,
                    fontSize: variant === "compact" ? "1rem" : "1.125rem",
                    letterSpacing: "-0.02em",
                    margin: 0,
                    marginBottom: 4,
                    color: "#111827",
                }}>
                    #{trackingId}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ fontSize: "0.625rem", color: "#6B7280", fontWeight: 500 }}>Status</div>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.6875rem",
                        color: config.color,
                        fontWeight: 600,
                    }}>
                        <StatusIcon size={12} />
                        {config.label}
                    </div>
                </div>
            </div>

            {/* Arrival */}
            {arrivalTime && (
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.625rem", color: "#6B7280", fontWeight: 500, marginBottom: 2 }}>Arrival</div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#111827" }}>{arrivalTime}</div>
                </div>
            )}
        </div>
    );
}
