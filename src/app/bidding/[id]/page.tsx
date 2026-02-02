"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useBiddingRoom, Bid } from "@/hooks/useBiddingRoom";
import {
    MapPin,
    Clock,
    User,
    Shield,
    Truck,
    CheckCircle,
    Star,
} from "lucide-react";

export default function BiddingRoomPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id as string;

    const { bids, timeLeft, acceptBid, loading: actionLoading, status } = useBiddingRoom(bookingId);
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            const { data } = await supabase
                .from("bookings")
                .select("*")
                .eq("id", bookingId)
                .single();
            setBooking(data);
            setLoading(false);
        };
        fetchBooking();
    }, [bookingId]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAccept = async (bidId: string) => {
        const success = await acceptBid(bidId);
        if (success) {
            router.push(`/track/${bookingId}`); // Redirect to tracking
        } else {
            alert("Failed to accept bid. It may have expired.");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading Bidding Room...</div>;

    if (!booking) return <div className="p-4">Booking not found</div>;

    // If status is already accepted/etc, redirect
    if (status && status !== 'accepting_bids') {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                    <CheckCircle size={48} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Driver Assigned!</h2>
                <p className="text-gray-500 mb-6">Redirecting to tracking...</p>
                <button
                    onClick={() => router.push(`/track/${bookingId}`)}
                    className="px-6 py-3 bg-[#E16595] text-white rounded-xl font-semibold"
                >
                    Go to Tracking
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Map Placeholder */}
            <div className="h-48 bg-[#1f2937] relative overflow-hidden flex items-center justify-center text-white">
                <div className="absolute inset-0 opacity-20 bg-[url('/map-pattern.png')] bg-cover" />
                <div className="text-center z-10">
                    <div className="text-3xl font-bold mb-2">{formatTime(timeLeft)}</div>
                    <div className="text-sm opacity-80 uppercase tracking-widest">Bidding Closing Soon</div>
                </div>
            </div>

            <div className="max-w-xl mx-auto -mt-6 px-4">
                {/* Booking Summary */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <h2 className="font-semibold text-lg mb-3">{booking.item_description}</h2>
                    <div className="space-y-4 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[9px] top-3 bottom-3 w-[2px] bg-gray-100" />

                        <div className="flex gap-3 relative z-10">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 border-2 border-white">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Pickup</div>
                                <div className="text-sm font-medium">{booking.pickup_address}</div>
                            </div>
                        </div>

                        <div className="flex gap-3 relative z-10">
                            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 border-2 border-white">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Dropoff</div>
                                <div className="text-sm font-medium">{booking.dropoff_address}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Live Bids ({bids.length})</h3>
                    <div className="text-sm text-gray-500 text-right">
                        Suggested: <span className="font-medium text-gray-900">₹{booking.suggested_price}</span>
                    </div>
                </div>

                {/* Bids List */}
                <div className="space-y-4">
                    {bids.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="text-gray-400" size={32} />
                            </div>
                            <h3 className="font-medium text-gray-900">Waiting for drivers...</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                We've notified 12 drivers nearby. Hang tight!
                            </p>
                        </div>
                    ) : (
                        bids.map((bid, index) => (
                            <div
                                key={bid.id}
                                className={`bg-white rounded-2xl p-5 border-2 transition-all ${index === 0 ? 'border-[#E16595] shadow-lg shadow-pink-100' : 'border-transparent shadow-sm'
                                    }`}
                            >
                                {index === 0 && (
                                    <div className="bg-[#E16595] text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
                                        LOEWEST BID
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                            <User className="text-gray-500" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">₹{bid.bid_amount}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                                <span>{bid.driver.driver_profile?.rating_avg || '5.0'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">{bid.estimated_time_mins} mins</div>
                                        <div className="text-xs text-gray-500">pickup time</div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                                        {bid.vehicle_type || 'Vehicle'}
                                    </span>
                                    {bid.helpers_included && bid.helpers_included > 0 && (
                                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                                            {bid.helpers_included} Helper
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleAccept(bid.id)}
                                    disabled={actionLoading}
                                    className="w-full py-3 bg-black text-white rounded-xl font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Accept Bid'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
