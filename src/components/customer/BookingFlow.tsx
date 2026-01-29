"use client";

import React, { useState } from "react";
import DriverCard, { DriverProps } from "./DriverCard";
import { MapPin, Navigation, ArrowRight, ArrowLeft } from "lucide-react";

const MOCK_DRIVERS: DriverProps[] = [
    {
        id: "d1",
        name: "Emily Carter",
        rating: 4.9,
        trips: 142,
        vehicle: "Toyota Prius",
        price: "12.50",
        eta: "5",
        specialBadge: "Fragile Expert",
    },
    {
        id: "d2",
        name: "Michael Chen",
        rating: 4.8,
        trips: 89,
        vehicle: "Ford Transit",
        price: "15.00",
        eta: "8",
    },
    {
        id: "d3",
        name: "Sarah Jones",
        rating: 5.0,
        trips: 312,
        vehicle: "Cargo Van",
        price: "24.00",
        eta: "12",
        specialBadge: "Heavy Lifting",
    }
];

export default function BookingFlow() {
    const [step, setStep] = useState<"location" | "drivers" | "active">("location");
    const [selectedSize, setSelectedSize] = useState<string>("Medium");

    const handleSearch = () => {
        setStep("drivers");
    };

    const handleSelectDriver = (id: string) => {
        setTimeout(() => setStep("active"), 300);
    };

    if (step === "active") {
        return (
            <div className="animate-enter" style={{ padding: '1.5rem' }}>
                <div style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '2rem',
                    borderRadius: '1.5rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: 64, height: 64,
                        background: '#D1FAE5',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <Navigation size={28} color="#059669" />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Driver is on the way!</h2>
                    <p style={{ color: '#6B7280' }}>Your package will be picked up in 5 mins.</p>
                    <div style={{
                        marginTop: '1.5rem', background: '#D1FAE5', height: 6, borderRadius: 3, overflow: 'hidden'
                    }}>
                        <div style={{ width: '40%', height: '100%', background: '#10B981' }} />
                    </div>
                </div>
                <button
                    className="btn btn-outline"
                    style={{ marginTop: '1.5rem' }}
                    onClick={() => setStep("location")}
                >
                    Book Another
                </button>
            </div>
        );
    }

    return (
        <div className="animate-enter">
            {step === "location" && (
                <>
                    <div className="booking-header">
                        <h1>Where are you sending?</h1>
                        <p>Fast, reliable delivery for anything.</p>
                    </div>

                    <div className="input-card">
                        <div className="input-connector">
                            <div className="connector-line" />

                            <div className="custom-input-group" style={{ marginBottom: '1rem' }}>
                                <div className="input-icon">
                                    <MapPin size={20} color="var(--color-primary)" />
                                </div>
                                <input
                                    className="custom-input"
                                    placeholder="Pickup Location"
                                    defaultValue="2210 Coral Way, Apt 3C"
                                />
                            </div>

                            <div className="custom-input-group">
                                <div className="input-icon">
                                    <Navigation size={20} color="var(--color-primary)" />
                                </div>
                                <input
                                    className="custom-input"
                                    placeholder="Dropoff Destination"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="package-size-selector">
                        <h2>Package Size</h2>
                        <div className="size-grid">
                            {["Small", "Medium", "Large"].map((s) => (
                                <button
                                    key={s}
                                    className={`size-btn ${selectedSize === s ? 'selected' : ''}`}
                                    onClick={() => setSelectedSize(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={handleSearch}>
                            Find Drivers <ArrowRight size={18} />
                        </button>
                    </div>
                </>
            )}

            {step === "drivers" && (
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => setStep("location")}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Select a Driver</h1>
                    </div>

                    <div>
                        {MOCK_DRIVERS.map(driver => (
                            <DriverCard
                                key={driver.id}
                                driver={driver}
                                onSelect={() => handleSelectDriver(driver.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
