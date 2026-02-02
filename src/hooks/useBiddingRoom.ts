import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Bid {
    id: string;
    bid_amount: number;
    estimated_time_mins: number;
    driver_message?: string;
    vehicle_type?: string;
    helpers_included?: number;
    driver: {
        id: string;
        full_name?: string; // from profiles or auth meta usually, but let's assume joined
        // Note: Supabase join returns an object or array. 
        // We'll trust the join query structure.
    };
    created_at: string;
}

export function useBiddingRoom(bookingId: string) {
    const [bids, setBids] = useState<Bid[]>([]);
    const [timeLeft, setTimeLeft] = useState<number>(300); // Default 5 mins
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>('accepting_bids');

    useEffect(() => {
        let channel: RealtimeChannel;
        let timer: NodeJS.Timeout;

        const initialize = async () => {
            // 1. Get booking details for end time and status
            const { data: booking } = await supabase
                .from('bookings')
                .select('bidding_ends_at, status')
                .eq('id', bookingId)
                .single();

            if (booking) {
                setStatus(booking.status);
                const endTime = new Date(booking.bidding_ends_at).getTime();
                const now = Date.now();
                setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));
            }

            // 2. Fetch existing bids
            // We need to join with driver info. 
            // Since users table is auth.schema, we usually join with a public 'profiles' table.
            // Assuming 'profiles' table key is user_id.
            const { data: existingBids } = await supabase
                .from('bids')
                .select(`
                    *,
                    driver_profile:driver_profiles!driver_id(
                        vehicle_type,
                        rating_avg,
                        total_deliveries
                    )
                `)
                .eq('booking_id', bookingId)
                .eq('status', 'pending')
                .order('bid_amount', { ascending: true });

            // Note: If we need driver name, we might need a 'profiles' table join if not in driver_profiles
            // For now mapping raw data.
            setBids((existingBids as any) || []);

            // 3. Subscribe to new bids
            channel = supabase
                .channel(`bidding-room:${bookingId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'bids',
                        filter: `booking_id=eq.${bookingId}`
                    },
                    async (payload) => {
                        // Fetch the full bid object with joins provided by ID
                        const { data: newBid } = await supabase
                            .from('bids')
                            .select(`
                                *,
                                driver_profile:driver_profiles!driver_id(
                                    vehicle_type,
                                    rating_avg,
                                    total_deliveries
                                )
                            `)
                            .eq('id', payload.new.id)
                            .single();

                        if (newBid) {
                            setBids(prev => {
                                const exists = prev.find(b => b.id === newBid.id);
                                if (exists) return prev;
                                return [...prev, newBid as any].sort((a, b) => a.bid_amount - b.bid_amount);
                            });
                        }
                    }
                )
                .subscribe();

            // 4. Countdown
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0) return 0;
                    return prev - 1;
                });
            }, 1000);
        };

        initialize();

        return () => {
            if (channel) supabase.removeChannel(channel);
            if (timer) clearInterval(timer);
        };
    }, [bookingId]);

    const acceptBid = async (bidId: string): Promise<boolean> => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('accept_bid', {
                p_bid_id: bidId,
                p_booking_id: bookingId
            });

            if (error) {
                console.error('Accept Bid Error:', error);
                throw error;
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { bids, timeLeft, acceptBid, loading, status };
}
