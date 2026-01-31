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
    ArrowUpDown,
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
    floor_pickup: number;
    floor_dropoff: number;
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
            const { data, error } = await supabase
                .from("bookings")
                .select("*")
                .eq("status", "accepting_bids")
                .gt("bidding_ends_at", new Date().toISOString())
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Fetch bid counts for each job
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
            case "furniture":
                return Sofa;
            case "appliances":
                return Refrigerator;
            case "bulk_items":
                return Boxes;
            default:
                return Package;
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
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
            }}>
                <RefreshCw size={24} className="animate-spin" color="#E16595" />
            </div>
        );
    }

    return (
        <div style={{ padding: 16 }}>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
            }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                    Available Jobs
                </h2>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    style={{
                        background: "#F3F4F6",
                        border: "none",
                        borderRadius: 8,
                        padding: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                    }}
                >
                    <RefreshCw
                        size={16}
                        color="#6B7280"
                        style={{
                            animation: refreshing ? "spin 1s linear infinite" : "none",
                        }}
                    />
                </button>
            </div>

            {/* Sort Options */}
            <div style={{
                display: "flex",
                gap: 8,
                marginBottom: 16,
                overflowX: "auto",
            }}>
                {[
                    { value: "newest", label: "Newest" },
                    { value: "highest_price", label: "Highest Price" },
                    { value: "lowest_competition", label: "Low Competition" },
                ].map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as SortOption)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 20,
                            border: "none",
                            background: sortBy === option.value ? "#E16595" : "#F3F4F6",
                            color: sortBy === option.value ? "white" : "#374151",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Jobs List */}
            {sortedJobs.length === 0 ? (
                <div style={{
                    textAlign: "center",
                    padding: 40,
                    color: "#9CA3AF",
                }}>
                    <Package size={48} strokeWidth={1} />
                    <p style={{ marginTop: 12 }}>No jobs available right now</p>
                    <p style={{ fontSize: 14 }}>Check back in a few minutes!</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {sortedJobs.map((job) => {
                        const CategoryIcon = getCategoryIcon(job.category);
                        const timeRemaining = getTimeRemaining(job.bidding_ends_at);
                        const isUrgent = timeRemaining.startsWith("0:") || timeRemaining.startsWith("1:");

                        return (
                            <div
                                key={job.id}
                                onClick={() => setSelectedJob(job)}
                                style={{
                                    background: "white",
                                    borderRadius: 16,
                                    padding: 16,
                                    cursor: "pointer",
                                    border: isUrgent ? "2px solid #EF4444" : "2px solid transparent",
                                    transition: "all 0.2s",
                                }}
                            >
                                {/* Category & Time */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 12,
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}>
                                        <div style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            background: "#FDF2F8",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}>
                                            <CategoryIcon size={18} color="#E16595" />
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                                textTransform: "capitalize",
                                            }}>
                                                {job.category?.replace(/_/g, " ")}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#6B7280" }}>
                                                {job.item_description?.slice(0, 30)}...
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "4px 8px",
                                        borderRadius: 6,
                                        background: isUrgent ? "#FEE2E2" : "#F3F4F6",
                                        color: isUrgent ? "#DC2626" : "#6B7280",
                                        fontSize: 12,
                                        fontWeight: 600,
                                    }}>
                                        <Clock size={12} />
                                        {timeRemaining}
                                    </div>
                                </div>

                                {/* Locations */}
                                <div style={{ marginBottom: 12 }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 8,
                                        fontSize: 13,
                                    }}>
                                        <MapPin size={14} color="#10B981" style={{ marginTop: 2 }} />
                                        <span>{job.pickup_address}</span>
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 8,
                                        fontSize: 13,
                                        marginTop: 6,
                                    }}>
                                        <MapPin size={14} color="#EF4444" style={{ marginTop: 2 }} />
                                        <span>{job.dropoff_address}</span>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    paddingTop: 12,
                                    borderTop: "1px solid #E5E7EB",
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                    }}>
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4,
                                            fontSize: 12,
                                            color: "#6B7280",
                                        }}>
                                            <Users size={14} />
                                            {job.bid_count || 0} bids
                                        </div>
                                        {job.lowest_bid && (
                                            <div style={{
                                                fontSize: 12,
                                                color: "#6B7280",
                                            }}>
                                                Lowest: ₹{job.lowest_bid}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        color: "#E16595",
                                    }}>
                                        ₹{job.suggested_price}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Place Bid Modal */}
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

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
