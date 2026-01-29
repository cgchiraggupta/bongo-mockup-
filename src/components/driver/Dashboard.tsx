"use client";

import React, { useState } from "react";
import { DollarSign, Power, Star } from "lucide-react";
import JobBoard from "./JobBoard";
import ActiveJob from "./ActiveJob";

export default function DriverDashboard() {
    const [isOnline, setIsOnline] = useState(false);
    const [activeJob, setActiveJob] = useState(false);

    const toggleOnline = () => setIsOnline(!isOnline);

    if (activeJob) {
        return <ActiveJob onComplete={() => setActiveJob(false)} />;
    }

    return (
        <div className="animate-enter" style={{ padding: '1.5rem' }}>
            {/* Earnings Overview */}
            <div style={{
                background: '#111827',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '1.5rem',
                position: 'relative',
                marginBottom: '1.5rem'
            }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#9CA3AF' }}>Today's Earnings</span>
                    <span style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#4ADE80',
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        borderRadius: 999,
                        display: 'flex', alignItems: 'center', gap: 4
                    }}>
                        <Star size={10} /> 4.98
                    </span>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, display: 'flex', alignItems: 'center' }}>
                    <DollarSign size={32} color="#6B7280" />
                    142.50
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>7 jobs completed today</div>

                {/* Online Toggle */}
                <button
                    onClick={toggleOnline}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isOnline ? 'var(--color-primary)' : '#374151',
                        color: isOnline ? 'white' : '#6B7280',
                        transition: 'all 0.3s',
                        boxShadow: isOnline ? 'var(--shadow-glow)' : 'none'
                    }}
                >
                    <Power size={20} />
                </button>
            </div>

            {/* Online/Offline State */}
            {isOnline ? (
                <JobBoard onAccept={() => setActiveJob(true)} />
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.5 }}>
                    <div style={{
                        width: 80, height: 80,
                        background: '#E5E7EB',
                        borderRadius: '50%',
                        margin: '0 auto 1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Power size={32} color="#9CA3AF" />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#9CA3AF' }}>You are offline</h3>
                    <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Go online to start receiving delivery requests.</p>
                </div>
            )}
        </div>
    );
}
