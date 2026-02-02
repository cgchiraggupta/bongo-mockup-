"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Power, CheckCircle, AlertCircle } from "lucide-react";

export default function OnlineToggle() {
    const { user } = useAuth();
    const [isOnline, setIsOnline] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (!user) return;
        checkStatus();
    }, [user]);

    const checkStatus = async () => {
        try {
            const { data, error } = await supabase
                .from("driver_profiles")
                .select("is_online, is_verified, accepting_bids")
                .eq("user_id", user?.id)
                .single();

            if (data) {
                setIsOnline(data.is_online);
                setIsVerified(data.is_verified);
            } else {
                // If no profile exists, create one properly through onboarding or here as basic
                // For now, let's assume onboarding is separate, but we verify if they can go online
            }
        } catch (error) {
            console.error("Error fetching status:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async () => {
        if (!user || !isVerified) return;

        const newState = !isOnline;
        setLoading(true);

        const { error } = await supabase
            .from("driver_profiles")
            .update({
                is_online: newState,
                accepting_bids: newState,
                last_online_at: new Date().toISOString()
            })
            .eq("user_id", user.id);

        if (!error) {
            setIsOnline(newState);
        } else {
            console.error("Error updating status", error);
        }
        setLoading(false);
    };

    if (loading) return <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse" />;

    if (!isVerified) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100">
                <AlertCircle size={14} />
                <span>Verification Pending</span>
            </div>
        );
    }

    return (
        <button
            onClick={toggleStatus}
            className={`flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full transition-all border-2 ${isOnline
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
        >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isOnline ? "bg-green-500 text-white" : "bg-gray-300 text-white"
                }`}>
                <Power size={12} strokeWidth={3} />
            </div>
            <span className="text-sm font-bold">
                {isOnline ? "ONLINE" : "OFFLINE"}
            </span>
        </button>
    );
}
