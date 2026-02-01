"use client";

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useGeolocation } from "./useGeolocation";

interface UseDriverLocationPushOptions {
    enabled?: boolean;
    intervalMs?: number;
}

/**
 * Hook that pushes driver location to Supabase every N seconds
 * while the driver is on an active delivery.
 */
export function useDriverLocationPush({
    enabled = false,
    intervalMs = 10000, // Default: every 10 seconds
}: UseDriverLocationPushOptions = {}) {
    const { user } = useAuth();
    const { latitude, longitude, error: geoError } = useGeolocation({ watch: enabled });
    const lastPush = useRef<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const pushLocation = useCallback(async () => {
        if (!user?.id || !latitude || !longitude) {
            console.log("Cannot push location: missing user or coordinates");
            return;
        }

        // Throttle to avoid too many updates
        const now = Date.now();
        if (now - lastPush.current < intervalMs * 0.8) {
            return;
        }
        lastPush.current = now;

        try {
            const { error } = await supabase
                .from("driver_locations")
                .upsert({
                    driver_id: user.id,
                    lat: latitude,
                    lng: longitude,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: "driver_id",
                });

            if (error) {
                console.error("Error pushing location:", error);
            } else {
                console.log(`Location pushed: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
        } catch (err) {
            console.error("Failed to push location:", err);
        }
    }, [user?.id, latitude, longitude, intervalMs]);

    useEffect(() => {
        if (!enabled) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Push immediately on enable
        pushLocation();

        // Then push at regular intervals
        intervalRef.current = setInterval(pushLocation, intervalMs);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [enabled, pushLocation, intervalMs]);

    return {
        isTracking: enabled && !geoError && !!latitude,
        latitude,
        longitude,
        error: geoError,
    };
}

export default useDriverLocationPush;
