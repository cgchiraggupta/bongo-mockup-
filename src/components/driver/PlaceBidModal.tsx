"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
    X,
    Clock,
    Minus,
    Plus,
    Truck,
    Users,
    MessageSquare
} from "lucide-react";

interface Job {
    id: string;
    category: string;
    item_description: string;
    pickup_address: string;
    dropoff_address: string;
    suggested_price: number;
    help_with_loading: boolean;
}

interface PlaceBidModalProps {
    job: Job;
    onClose: () => void;
    onBidPlaced: () => void;
}

const quickBidMultipliers = [
    { label: "-20%", multiplier: 0.8 },
    { label: "Suggested", multiplier: 1.0 },
    { label: "+20%", multiplier: 1.2 },
];

const etaOptions = [
    { value: 30, label: "30 mins" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
];

export default function PlaceBidModal({ job, onClose, onBidPlaced }: PlaceBidModalProps) {
    const { user } = useAuth();

    const [bidAmount, setBidAmount] = useState(job.suggested_price);
    const [estimatedTime, setEstimatedTime] = useState(60);
    const [message, setMessage] = useState("");
    const [helpersIncluded, setHelpersIncluded] = useState(job.help_with_loading ? 2 : 1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const platformFee = bidAmount * 0.15;
    const earnings = bidAmount - platformFee;

    const handleSubmitBid = async () => {
        if (!user?.id) {
            setError("Please login first");
            return;
        }

        if (bidAmount < 100) {
            setError("Minimum bid is ₹100");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { error: insertError } = await supabase
                .from("bids")
                .insert({
                    booking_id: job.id,
                    driver_id: user.id,
                    bid_amount: bidAmount,
                    estimated_time_mins: estimatedTime,
                    driver_message: message || null,
                    helpers_included: helpersIncluded,
                    status: "pending",
                });

            if (insertError) {
                if (insertError.message.includes("duplicate")) {
                    setError("You've already placed a bid on this job");
                } else {
                    throw insertError;
                }
                return;
            }

            onBidPlaced();
        } catch (err) {
            console.error("Error placing bid:", err);
            setError("Failed to place bid. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 10000,
        }}>
            <div style={{
                background: "white",
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                width: "100%",
                maxWidth: 500,
                maxHeight: "85vh",
                overflow: "auto",
                animation: "slideUp 0.3s ease-out",
            }}>
                {/* Header */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 24px",
                    borderBottom: "1px solid #E5E7EB",
                    position: "sticky",
                    top: 0,
                    background: "white",
                    zIndex: 1,
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Place Your Bid</h2>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>
                            {job.item_description.slice(0, 40)}...
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: "#F3F4F6",
                        border: "none",
                        borderRadius: "50%",
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: 24 }}>
                    {error && (
                        <div style={{
                            background: "#FEE2E2",
                            color: "#DC2626",
                            padding: "12px 16px",
                            borderRadius: 12,
                            marginBottom: 20,
                            fontSize: 14,
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Bid Amount */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{
                            display: "block",
                            marginBottom: 12,
                            fontWeight: 600,
                            fontSize: 15,
                        }}>
                            Your Bid Amount
                        </label>

                        {/* Amount Input with +/- */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 16,
                            marginBottom: 16,
                        }}>
                            <button
                                onClick={() => setBidAmount(Math.max(100, bidAmount - 50))}
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    border: "2px solid #E5E7EB",
                                    background: "white",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Minus size={20} />
                            </button>
                            <div style={{
                                fontSize: 48,
                                fontWeight: 800,
                                color: "#111827",
                            }}>
                                ₹{bidAmount}
                            </div>
                            <button
                                onClick={() => setBidAmount(bidAmount + 50)}
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    border: "2px solid #E5E7EB",
                                    background: "white",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* Quick Bid Buttons */}
                        <div style={{ display: "flex", gap: 8 }}>
                            {quickBidMultipliers.map((q) => {
                                const price = Math.round(job.suggested_price * q.multiplier / 10) * 10;
                                const isSelected = bidAmount === price;
                                return (
                                    <button
                                        key={q.label}
                                        onClick={() => setBidAmount(price)}
                                        style={{
                                            flex: 1,
                                            padding: "10px 8px",
                                            borderRadius: 10,
                                            border: isSelected ? "2px solid #10B981" : "2px solid #E5E7EB",
                                            background: isSelected ? "#D1FAE5" : "white",
                                            cursor: "pointer",
                                            fontSize: 13,
                                            fontWeight: 500,
                                        }}
                                    >
                                        <div style={{ color: "#6B7280" }}>{q.label}</div>
                                        <div style={{ fontWeight: 700, marginTop: 2 }}>₹{price}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ETA */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 12,
                            fontWeight: 600,
                            fontSize: 15,
                        }}>
                            <Clock size={18} />
                            I can pick up in:
                        </label>
                        <div style={{ display: "flex", gap: 8 }}>
                            {etaOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setEstimatedTime(opt.value)}
                                    style={{
                                        flex: 1,
                                        padding: "12px",
                                        borderRadius: 10,
                                        border: estimatedTime === opt.value
                                            ? "2px solid #10B981"
                                            : "2px solid #E5E7EB",
                                        background: estimatedTime === opt.value ? "#D1FAE5" : "white",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        fontSize: 14,
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Helpers */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 12,
                            fontWeight: 600,
                            fontSize: 15,
                        }}>
                            <Users size={18} />
                            Helpers included:
                        </label>
                        <div style={{ display: "flex", gap: 8 }}>
                            {[1, 2, 3].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setHelpersIncluded(num)}
                                    style={{
                                        flex: 1,
                                        padding: "12px",
                                        borderRadius: 10,
                                        border: helpersIncluded === num
                                            ? "2px solid #10B981"
                                            : "2px solid #E5E7EB",
                                        background: helpersIncluded === num ? "#D1FAE5" : "white",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        fontSize: 14,
                                    }}
                                >
                                    {num} {num === 1 ? "helper" : "helpers"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 12,
                            fontWeight: 600,
                            fontSize: 15,
                        }}>
                            <MessageSquare size={18} />
                            Message to customer (optional)
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="e.g., I have padding blankets for safe furniture transport"
                            maxLength={200}
                            rows={2}
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                border: "2px solid #E5E7EB",
                                borderRadius: 12,
                                fontSize: 14,
                                outline: "none",
                                resize: "none",
                            }}
                        />
                    </div>

                    {/* Earnings Preview */}
                    <div style={{
                        background: "#F9FAFB",
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 24,
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                            fontSize: 14,
                            color: "#6B7280",
                        }}>
                            <span>Your bid:</span>
                            <span>₹{bidAmount}</span>
                        </div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 12,
                            fontSize: 14,
                            color: "#EF4444",
                        }}>
                            <span>Platform fee (15%):</span>
                            <span>-₹{Math.round(platformFee)}</span>
                        </div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            paddingTop: 12,
                            borderTop: "2px dashed #E5E7EB",
                            fontSize: 18,
                            fontWeight: 800,
                            color: "#10B981",
                        }}>
                            <span>You'll earn:</span>
                            <span>₹{Math.round(earnings)}</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmitBid}
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "18px",
                            border: "none",
                            borderRadius: 14,
                            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                            color: "white",
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: loading ? "wait" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
                        }}
                    >
                        {loading ? "Submitting..." : "Submit Bid"}
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
}
