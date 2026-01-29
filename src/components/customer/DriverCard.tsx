import React from "react";
import { Star, Clock, User } from "lucide-react";

export interface DriverProps {
    id: string;
    name: string;
    rating: number;
    trips: number;
    vehicle: string;
    price: string;
    eta: string;
    specialBadge?: string;
    imageUrl?: string;
}

export default function DriverCard({ driver, onSelect }: { driver: DriverProps; onSelect: () => void }) {
    return (
        <div className="driver-card" onClick={onSelect}>
            {/* Driver Avatar */}
            <div className="avatar">
                {driver.imageUrl ? (
                    <img src={driver.imageUrl} alt={driver.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <User size={24} color="#9CA3AF" />
                )}
                <div className="rating-badge">
                    <Star size={10} color="#FBBF24" fill="#FBBF24" />
                    <span>{driver.rating}</span>
                </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex-between">
                    <div>
                        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{driver.name}</h3>
                        <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>{driver.vehicle} • {driver.trips} trips</p>
                    </div>
                    <div className="text-right">
                        <div className="text-primary" style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                            ${driver.price}
                        </div>
                        <div style={{ fontSize: '0.625rem', color: '#9CA3AF' }}>Fixed Price</div>
                    </div>
                </div>

                <div className="flex-between" style={{ marginTop: '0.75rem' }}>
                    {driver.specialBadge && (
                        <span style={{
                            background: '#F3E8FF',
                            color: '#7C3AED',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: 8
                        }}>
                            {driver.specialBadge}
                        </span>
                    )}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#374151',
                        marginLeft: 'auto'
                    }}>
                        <Clock size={12} color="#9CA3AF" />
                        {driver.eta} min away
                    </div>
                </div>
            </div>
        </div>
    );
}
