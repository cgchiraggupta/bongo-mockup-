"use client";

import React from "react";
import BottomNav from "@/components/shared/BottomNav";
import { MapPin } from "lucide-react";

export default function TrackPage() {
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

            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
                Track Shipment
            </h1>

            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 1rem",
                textAlign: "center",
                background: "white",
                borderRadius: 20,
                border: "1px solid var(--color-border)",
            }}>
                <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "#F3F4F6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                }}>
                    <MapPin size={28} color="#9CA3AF" />
                </div>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    No Active Tracking
                </h2>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", maxWidth: 240 }}>
                    Your active deliveries will appear here with real-time location updates.
                </p>
            </div>

            <BottomNav />
        </div>
    );
}
