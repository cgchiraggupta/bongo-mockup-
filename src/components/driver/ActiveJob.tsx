"use client";

import React, { useState } from "react";
import { Navigation, Phone, MessageSquare, CheckCircle } from "lucide-react";

export default function ActiveJob({ onComplete }: { onComplete: () => void }) {
    const [status, setStatus] = useState<"pickup" | "dropoff">("pickup");

    const handleAction = () => {
        if (status === "pickup") {
            setStatus("dropoff");
        } else {
            onComplete();
        }
    };

    return (
        <div className="animate-enter">
            {/* Header */}
            <div style={{
                background: 'var(--color-primary)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '0 0 1.5rem 1.5rem',
                marginBottom: '1.5rem'
            }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: 4 }}>Current Job</div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>12 mins</h1>
                        <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>to destination</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 12 }}>
                        <Navigation size={24} />
                    </div>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: '66%', height: '100%', background: 'white' }} />
                </div>
            </div>

            {/* Customer Info Card */}
            <div className="driver-card" style={{ margin: '0 1.5rem', flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div className="avatar">
                        <span style={{ fontWeight: 700, color: '#6B7280' }}>JD</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 700, margin: 0 }}>John Doe</h3>
                        <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Customer • 4.8 ★</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: '#F3F4F6', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <MessageSquare size={18} color="#6B7280" />
                        </button>
                        <button style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: '#F3F4F6', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Phone size={18} color="#6B7280" />
                        </button>
                    </div>
                </div>

                {/* Route */}
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 16 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 8, height: 8, background: '#D1D5DB', borderRadius: '50%' }} />
                            <div style={{ width: 2, height: 32, background: '#E5E7EB' }} />
                            <div style={{ width: 8, height: 8, background: 'var(--color-primary)', borderRadius: '50%' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: '0.625rem', color: '#9CA3AF' }}>Pickup</div>
                                <div style={{ fontSize: '0.875rem', color: '#6B7280', textDecoration: 'line-through' }}>2210 Coral Way</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.625rem', color: '#9CA3AF' }}>Dropoff</div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>1024 Ocean Dr</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div style={{
                position: 'fixed',
                bottom: 100,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 48px)',
                maxWidth: 432
            }}>
                <button
                    className="btn btn-primary"
                    style={{ height: 56, fontSize: '1rem' }}
                    onClick={handleAction}
                >
                    {status === "pickup" ? "Slide to Pick Up" : "Slide to Complete"}
                    <CheckCircle size={20} />
                </button>
            </div>
        </div>
    );
}
