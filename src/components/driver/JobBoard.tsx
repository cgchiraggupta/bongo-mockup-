"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import PlaceBidModal from "./PlaceBidModal";
import {
    Package,
    Clock,
    MapPin,
    Users,
    Sofa,
    Refrigerator,
    Boxes,
    RefreshCw,
} from "lucide-react";

interface Job {
    id: string;
    category: string;
    item_description: string;
    pickup_address: string;
    dropoff_address: string;
    suggested_price: number;
    help_with_loading: boolean;
    floor_number?: number; // Schema has floor_number, not floor_pickup/dropoff
    bidding_ends_at: string;
    created_at: string;
    bid_count?: number;
    lowest_bid?: number;
}

type SortOption = "newest" | "highest_price" | "lowest_competition";

export default function JobBoard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch available jobs
    const fetchJobs = async () => {
        try {
            // Using get_nearby_jobs RPC might be better if we had driver location, 
            // but for now simple query is fine.
            const { data, error } = await supabase
                .from("bookings")
                .select("*")
                .eq("status", "accepting_bids")
                .gt("bidding_ends_at", new Date().toISOString()) // Only active jobs
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Fetch bid counts for each job
            // Note: This N+1 query pattern is okay for small scale MVP, 
            // but ideally we'd use a view or the RPC 'get_nearby_jobs' which joins this data.
            const jobsWithBids = await Promise.all(
                (data || []).map(async (job) => {
                    const { count } = await supabase
                        .from("bids")
                        .select("*", { count: "exact", head: true })
                        .eq("booking_id", job.id)
                        .eq("status", "pending");

                    const { data: minBid } = await supabase
                        .from("bids")
                        .select("bid_amount")
                        .eq("booking_id", job.id)
                        .eq("status", "pending")
                        .order("bid_amount", { ascending: true })
                        .limit(1)
                        .single();

                    return {
                        ...job,
                        bid_count: count || 0,
                        lowest_bid: minBid?.bid_amount,
                    };
                })
            );

            setJobs(jobsWithBids);

        } catch (err) {
            console.error("Error fetching jobs:", err);
            setJobs([]); // No demo jobs fallback to avoid confusion, just empty
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();

        // Subscribe to new jobs
        const channel = supabase
            .channel("job-board")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "bookings",
                    filter: "status=eq.accepting_bids",
                },
                () => fetchJobs()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    // Sort jobs
    const sortedJobs = [...jobs].sort((a, b) => {
        switch (sortBy) {
            case "highest_price":
                return (b.suggested_price || 0) - (a.suggested_price || 0);
            case "lowest_competition":
                return (a.bid_count || 0) - (b.bid_count || 0);
            default:
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
    });

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "furniture": return Sofa;
            case "appliances": return Refrigerator;
            case "bulk_items": return Boxes;
            default: return Package;
        }
    };

    const getTimeRemaining = (endTime: string) => {
        const diff = new Date(endTime).getTime() - Date.now();
        if (diff <= 0) return "Expired";
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className="h-48 flex items-center justify-center">
                <RefreshCw size={24} className="animate-spin text-[#E16595]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Job Board</h2>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw
                            size={18}
                            className={`text-gray-600 ${refreshing ? "animate-spin" : ""}`}
                        />
                    </button>
                </div>

                {/* Sort Options */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { value: "newest", label: "Newest" },
                        { value: "highest_price", label: "Highest Price" },
                        { value: "lowest_competition", label: "Low Competition" },
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setSortBy(option.value as SortOption)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${sortBy === option.value
                                    ? "bg-[#E16595] text-white shadow-md shadow-pink-200"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Jobs List */}
            <div className="p-4 space-y-4">
                {sortedJobs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Package size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No live jobs right now</p>
                        <p className="text-sm">Keep your app open to get notified</p>
                    </div>
                ) : (
                    sortedJobs.map((job) => {
                        const CategoryIcon = getCategoryIcon(job.category);
                        const timeRemaining = getTimeRemaining(job.bidding_ends_at);
                        const isUrgent = timeRemaining.startsWith("0:");

                        return (
                            <div
                                key={job.id}
                                onClick={() => setSelectedJob(job)}
                                className={`bg-white rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98] border-2 ${isUrgent ? "border-red-100 shadow-sm" : "border-transparent shadow-sm"
                                    }`}
                            >
                                {/* Top Row */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-[#E16595]">
                                            <CategoryIcon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 capitalize">
                                                {job.category.replace(/_/g, " ")}
                                            </h3>
                                            <p className="text-xs text-gray-500 line-clamp-1 w-40">
                                                {job.item_description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${isUrgent ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-600"
                                        }`}>
                                        <Clock size={12} />
                                        {timeRemaining}
                                    </div>
                                </div>

                                {/* Locations - simplified */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <div className="truncate">{job.pickup_address}</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <div className="truncate">{job.dropoff_address}</div>
                                    </div>
                                </div>

                                {/* Footer Stats */}
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Users size={14} />
                                            {job.bid_count} bids
                                        </div>
                                        {job.lowest_bid && (
                                            <div className="text-[#E16595]">
                                                Lowest: ₹{job.lowest_bid}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">
                                        ₹{job.suggested_price}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            {selectedJob && (
                <PlaceBidModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    onBidPlaced={() => {
                        setSelectedJob(null);
                        fetchJobs();
                    }}
                />
            )}
        </div>
    );
}
