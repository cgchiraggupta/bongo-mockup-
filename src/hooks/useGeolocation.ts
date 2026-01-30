"use client";

import { useState, useEffect, useCallback } from "react";

interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    error: string | null;
    loading: boolean;
    permission: "granted" | "denied" | "prompt" | "unknown";
}

interface UseGeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    watch?: boolean;
}

const defaultOptions: UseGeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    watch: false,
};

export function useGeolocation(options: UseGeolocationOptions = {}) {
    const opts = { ...defaultOptions, ...options };

    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: null,
        loading: true,
        permission: "unknown",
    });

    const handleSuccess = useCallback((position: GeolocationPosition) => {
        setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            error: null,
            loading: false,
            permission: "granted",
        });
    }, []);

    const handleError = useCallback((error: GeolocationPositionError) => {
        let errorMessage = "Failed to get location";
        let permission: "granted" | "denied" | "prompt" | "unknown" = "unknown";

        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied";
                permission = "denied";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Location unavailable";
                break;
            case error.TIMEOUT:
                errorMessage = "Location request timed out";
                break;
        }

        setState((prev) => ({
            ...prev,
            error: errorMessage,
            loading: false,
            permission,
        }));
    }, []);

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setState((prev) => ({
                ...prev,
                error: "Geolocation not supported",
                loading: false,
            }));
            return;
        }

        setState((prev) => ({ ...prev, loading: true, error: null }));

        if (opts.watch) {
            const watchId = navigator.geolocation.watchPosition(
                handleSuccess,
                handleError,
                {
                    enableHighAccuracy: opts.enableHighAccuracy,
                    timeout: opts.timeout,
                    maximumAge: opts.maximumAge,
                }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
                enableHighAccuracy: opts.enableHighAccuracy,
                timeout: opts.timeout,
                maximumAge: opts.maximumAge,
            });
        }
    }, [handleSuccess, handleError, opts.watch, opts.enableHighAccuracy, opts.timeout, opts.maximumAge]);

    useEffect(() => {
        const cleanup = requestLocation();
        return () => {
            if (cleanup) cleanup();
        };
    }, []);

    return {
        ...state,
        refresh: requestLocation,
    };
}

// Helper to format coordinates for display
export function formatLocation(lat: number, lng: number): string {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// Default location (fallback if permission denied)
export const DEFAULT_LOCATION = {
    lat: 19.076,  // Mumbai, India
    lng: 72.8777,
};
