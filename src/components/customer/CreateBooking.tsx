"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
    MapPin,
    ArrowRight,
    X,
    Sofa,
    Refrigerator,
    Boxes
} from "lucide-react";

interface CreateBookingProps {
    onClose: () => void;
}

const categories = [
    { id: "furniture", label: "Furniture", icon: Sofa, desc: "Sofa, Bed, Wardrobe" },
    { id: "appliances", label: "Appliances", icon: Refrigerator, desc: "Fridge, Washing Machine" },
    { id: "bulk_items", label: "Bulk Items", icon: Boxes, desc: "20+ boxes, bulk goods" },
];

export default function CreateBooking({ onClose }: CreateBookingProps) {
    const { user } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form data
    const [category, setCategory] = useState("");
    const [pickupAddress, setPickupAddress] = useState("");
    const [dropoffAddress, setDropoffAddress] = useState("");
    const [itemDescription, setItemDescription] = useState("");
    const [weightEstimate, setWeightEstimate] = useState("");
    const [dimensions, setDimensions] = useState("");
    const [floorPickup, setFloorPickup] = useState(0);
    const [floorDropoff, setFloorDropoff] = useState(0);
    const [elevatorPickup, setElevatorPickup] = useState(false);
    const [elevatorDropoff, setElevatorDropoff] = useState(false);
    const [helpWithLoading, setHelpWithLoading] = useState(true);
    const [flexibleTiming, setFlexibleTiming] = useState(true);

    // Estimated price (simple calculation)
    const estimatedPrice = (() => {
        let base = 200;
        const categoryMultiplier = category === "appliances" ? 1.3 : category === "fragile" ? 1.5 : 1;
        const floorCharge = (floorPickup + floorDropoff) * 50;
        const loadingCharge = helpWithLoading ? 100 : 0;
        return Math.round((base + floorCharge + loadingCharge) * categoryMultiplier / 10) * 10;
    })();

    const handleSubmit = async () => {
        if (!user?.id) {
            setError("Please login first");
            return;
        }

        if (!category || !pickupAddress || !dropoffAddress || !itemDescription) {
            setError("Please fill all required fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Calculate bidding end time (5 minutes from now)
            const biddingEndsAt = new Date();
            biddingEndsAt.setMinutes(biddingEndsAt.getMinutes() + 5);

            const { data, error: insertError } = await supabase
                .from("bookings")
                .insert({
                    customer_id: user.id,
                    category,
                    pickup_address: pickupAddress,
                    dropoff_address: dropoffAddress,
                    item_description: itemDescription,
                    floor_pickup: floorPickup,
                    floor_dropoff: floorDropoff,
                    elevator_pickup: elevatorPickup,
                    elevator_dropoff: elevatorDropoff,
                    help_with_loading: helpWithLoading,
                    suggested_price: estimatedPrice,
                    bidding_ends_at: biddingEndsAt.toISOString(),
                    status: "accepting_bids",
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Navigate to bidding room
            router.push(`/bidding/${data.id}`);
            onClose();
        } catch (err) {
            console.error("Error creating booking:", err);
            setError("Failed to create booking. Please try again.");
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
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 16,
        }}>
            <div style={{
                background: "white",
                borderRadius: 24,
                width: "100%",
                maxWidth: 500,
                maxHeight: "90vh",
                overflow: "auto",
                position: "relative",
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
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                        {step === 1 && "What are you moving?"}
                        {step === 2 && "Pickup & Dropoff"}
                        {step === 3 && "Item Details"}
                    </h2>
                    <button onClick={onClose} style={{
                        background: "#F3F4F6",
                        border: "none",
                        borderRadius: "50%",
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Step Indicator */}
                <div style={{
                    display: "flex",
                    gap: 8,
                    padding: "16px 24px",
                    background: "#F9FAFB",
                }}>
                    {[1, 2, 3].map((s) => (
                        <div key={s} style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            background: s <= step ? "#E16595" : "#E5E7EB",
                            transition: "background 0.3s",
                        }} />
                    ))}
                </div>

                {/* Form Content */}
                <div style={{ padding: "24px" }}>
                    {error && (
                        <div style={{
                            background: "#FEE2E2",
                            color: "#DC2626",
                            padding: "12px 16px",
                            borderRadius: 12,
                            marginBottom: 16,
                            fontSize: 14,
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Step 1: Category */}
                    {step === 1 && (
                        <div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 16,
                                            padding: 16,
                                            border: category === cat.id ? "2px solid #E16595" : "2px solid #E5E7EB",
                                            borderRadius: 16,
                                            background: category === cat.id ? "#FDF2F8" : "white",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        <div style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 12,
                                            background: category === cat.id ? "#E16595" : "#F3F4F6",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}>
                                            <cat.icon size={24} color={category === cat.id ? "white" : "#6B7280"} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 16 }}>{cat.label}</div>
                                            <div style={{ color: "#6B7280", fontSize: 14 }}>{cat.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Locations */}
                    {step === 2 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div>
                                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                                    <MapPin size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
                                    Pickup Address
                                </label>
                                <input
                                    type="text"
                                    value={pickupAddress}
                                    onChange={(e) => setPickupAddress(e.target.value)}
                                    placeholder="e.g., Sector 22, Gurugram"
                                    style={{
                                        width: "100%",
                                        padding: "14px 16px",
                                        border: "2px solid #E5E7EB",
                                        borderRadius: 12,
                                        fontSize: 16,
                                        outline: "none",
                                    }}
                                />
                                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 14, color: "#6B7280" }}>Floor</label>
                                        <input
                                            type="number"
                                            value={floorPickup}
                                            onChange={(e) => setFloorPickup(parseInt(e.target.value) || 0)}
                                            min={0}
                                            style={{
                                                width: "100%",
                                                padding: "10px 12px",
                                                border: "2px solid #E5E7EB",
                                                borderRadius: 8,
                                                fontSize: 14,
                                            }}
                                        />
                                    </div>
                                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            checked={elevatorPickup}
                                            onChange={(e) => setElevatorPickup(e.target.checked)}
                                            style={{ width: 20, height: 20, accentColor: "#E16595" }}
                                        />
                                        <span style={{ fontSize: 14 }}>Elevator</span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ textAlign: "center", color: "#9CA3AF" }}>
                                <ArrowRight size={24} style={{ transform: "rotate(90deg)" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                                    <MapPin size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
                                    Dropoff Address
                                </label>
                                <input
                                    type="text"
                                    value={dropoffAddress}
                                    onChange={(e) => setDropoffAddress(e.target.value)}
                                    placeholder="e.g., Sector 44, Noida"
                                    style={{
                                        width: "100%",
                                        padding: "14px 16px",
                                        border: "2px solid #E5E7EB",
                                        borderRadius: 12,
                                        fontSize: 16,
                                        outline: "none",
                                    }}
                                />
                                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 14, color: "#6B7280" }}>Floor</label>
                                        <input
                                            type="number"
                                            value={floorDropoff}
                                            onChange={(e) => setFloorDropoff(parseInt(e.target.value) || 0)}
                                            min={0}
                                            style={{
                                                width: "100%",
                                                padding: "10px 12px",
                                                border: "2px solid #E5E7EB",
                                                borderRadius: 8,
                                                fontSize: 14,
                                            }}
                                        />
                                    </div>
                                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            checked={elevatorDropoff}
                                            onChange={(e) => setElevatorDropoff(e.target.checked)}
                                            style={{ width: 20, height: 20, accentColor: "#E16595" }}
                                        />
                                        <span style={{ fontSize: 14 }}>Elevator</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Item Details */}
                    {step === 3 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div>
                                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                                    What are you moving?
                                </label>
                                <textarea
                                    value={itemDescription}
                                    onChange={(e) => setItemDescription(e.target.value)}
                                    placeholder="e.g., 3-seater leather sofa, needs careful handling"
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        padding: "14px 16px",
                                        border: "2px solid #E5E7EB",
                                        borderRadius: 12,
                                        fontSize: 16,
                                        outline: "none",
                                        resize: "none",
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "#6B7280" }}>
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        value={weightEstimate}
                                        onChange={(e) => setWeightEstimate(e.target.value)}
                                        placeholder="~50"
                                        style={{
                                            width: "100%",
                                            padding: "12px 14px",
                                            border: "2px solid #E5E7EB",
                                            borderRadius: 10,
                                            fontSize: 14,
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "#6B7280" }}>
                                        Dimensions
                                    </label>
                                    <input
                                        type="text"
                                        value={dimensions}
                                        onChange={(e) => setDimensions(e.target.value)}
                                        placeholder="6×3×3 ft"
                                        style={{
                                            width: "100%",
                                            padding: "12px 14px",
                                            border: "2px solid #E5E7EB",
                                            borderRadius: 10,
                                            fontSize: 14,
                                        }}
                                    />
                                </div>
                            </div>

                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: 16,
                                background: helpWithLoading ? "#FDF2F8" : "#F9FAFB",
                                borderRadius: 12,
                                cursor: "pointer",
                                border: helpWithLoading ? "2px solid #E16595" : "2px solid transparent",
                            }}>
                                <input
                                    type="checkbox"
                                    checked={helpWithLoading}
                                    onChange={(e) => setHelpWithLoading(e.target.checked)}
                                    style={{ width: 20, height: 20, accentColor: "#E16595" }}
                                />
                                <div>
                                    <div style={{ fontWeight: 500 }}>Need help with loading?</div>
                                    <div style={{ fontSize: 13, color: "#6B7280" }}>Driver provides 1-2 helpers (+₹100)</div>
                                </div>
                            </label>

                            {/* Price Estimate */}
                            <div style={{
                                background: "linear-gradient(135deg, #E16595 0%, #c04d7a 100%)",
                                color: "white",
                                padding: 20,
                                borderRadius: 16,
                                marginTop: 8,
                            }}>
                                <div style={{ fontSize: 14, opacity: 0.9 }}>Estimated Price Range</div>
                                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                                    ₹{Math.round(estimatedPrice * 0.8)} - ₹{Math.round(estimatedPrice * 1.2)}
                                </div>
                                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                                    Get 3-5 bids from verified drivers in 5 minutes
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: "16px 24px 24px",
                    display: "flex",
                    gap: 12,
                    position: "sticky",
                    bottom: 0,
                    background: "white",
                    borderTop: "1px solid #E5E7EB",
                }}>
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            style={{
                                flex: 1,
                                padding: "16px",
                                border: "2px solid #E5E7EB",
                                borderRadius: 12,
                                background: "white",
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            onClick={() => {
                                if (step === 1 && !category) {
                                    setError("Please select a category");
                                    return;
                                }
                                if (step === 2 && (!pickupAddress || !dropoffAddress)) {
                                    setError("Please enter both addresses");
                                    return;
                                }
                                setError("");
                                setStep(step + 1);
                            }}
                            disabled={step === 1 && !category}
                            style={{
                                flex: 2,
                                padding: "16px",
                                border: "none",
                                borderRadius: 12,
                                background: "#E16595",
                                color: "white",
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: "pointer",
                                opacity: step === 1 && !category ? 0.5 : 1,
                            }}
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !itemDescription}
                            style={{
                                flex: 2,
                                padding: "16px",
                                border: "none",
                                borderRadius: 12,
                                background: "#E16595",
                                color: "white",
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: loading ? "wait" : "pointer",
                                opacity: loading || !itemDescription ? 0.5 : 1,
                            }}
                        >
                            {loading ? "Creating..." : "Post Job & Get Bids"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
