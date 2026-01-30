"use client";

import React from "react";
import BottomNav from "@/components/shared/BottomNav";
import TrackingCard from "@/components/shared/TrackingCard";

const MOCK_HISTORY = [
    { id: "CA18WS8", status: "delivered" as const, color: "blue" as const, arrival: "Yesterday" },
    { id: "F165G258", status: "delivered" as const, color: "green" as const, arrival: "Jan 28" },
    { id: "X789K123", status: "delivered" as const, color: "yellow" as const, arrival: "Jan 27" },
    { id: "P456Q789", status: "delivered" as const, color: "pink" as const, arrival: "Jan 26" },
];

export default function HistoryPage() {
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
                Delivery History
            </h1>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

            <BottomNav />
        </div>
    );
}
