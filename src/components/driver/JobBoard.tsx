"use client";

import React from "react";
import { MapPin, Package, Clock } from "lucide-react";

const MOCK_JOBS = [
    {
        id: "j1",
        pickup: "Downtown Market",
        dropoff: "Sunset Blvd, 401",
        price: "18.50",
        distance: "2.4 mi",
        time: "15 min",
        type: "Fragile",
    },
    {
        id: "j2",
        pickup: "Tech Park",
        dropoff: "Residential Area 5",
        price: "12.00",
        distance: "1.1 mi",
        time: "8 min",
        type: "Standard",
    }
];

export default function JobBoard({ onAccept }: { onAccept: () => void }) {
    return (
        <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Available Jobs ({MOCK_JOBS.length})
            </h2>
            {MOCK_JOBS.map((job) => (
                <div key={job.id} className="driver-card" style={{ flexDirection: 'column', alignItems: 'stretch', marginBottom: '1rem' }}>
                    <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                        <span style={{
                            background: '#F3E8FF',
                            color: '#7C3AED',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: 8
                        }}>
                            {job.type}
                        </span>
                        <div className="text-primary" style={{ fontSize: '1.125rem', fontWeight: 700 }}>${job.price}</div>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: '#374151', marginBottom: 4 }}>
                            <MapPin size={14} color="#9CA3AF" />
                            <span>{job.pickup}</span>
                        </div>
                        <div style={{ paddingLeft: 22, fontSize: '0.625rem', color: '#9CA3AF', marginBottom: 4 }}>to</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: '#374151' }}>
                            <MapPin size={14} color="var(--color-primary)" />
                            <span>{job.dropoff}</span>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        fontSize: '0.75rem', color: '#6B7280',
                        borderTop: '1px solid #E5E7EB',
                        paddingTop: '0.75rem',
                        marginBottom: '0.75rem'
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {job.time}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Package size={12} /> {job.distance}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <button className="btn btn-outline" style={{ height: 44 }}>Decline</button>
                        <button className="btn btn-primary" style={{ height: 44 }} onClick={onAccept}>Accept</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
