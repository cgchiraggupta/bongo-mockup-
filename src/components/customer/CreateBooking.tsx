"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
    MapPin,
    ArrowRight,
    X,
    Sofa,
    Refrigerator,
    Boxes,
    Camera,
    Loader2
} from "lucide-react";

interface CreateBookingProps {
    onClose: () => void;
}

const categories = [
    { id: "furniture", label: "Furniture", icon: Sofa, desc: "Sofa, Bed, Wardrobe" },
    { id: "appliances", label: "Appliances", icon: Refrigerator, desc: "Fridge, Washing Machine" },
    { id: "bulk_items", label: "Bulk Items", icon: Boxes, desc: "20+ boxes, bulk goods" },
];

export default function CreateBooking({ onClose }: CreateBookingProps) {
    const { user } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form data
    const [category, setCategory] = useState("furniture");
    const [pickupAddress, setPickupAddress] = useState("");
    // Hardcoded coords for demo if not using real geocoding yet
    const [pickupLat, setPickupLat] = useState(28.4595);
    const [pickupLng, setPickupLng] = useState(77.0266);

    const [dropoffAddress, setDropoffAddress] = useState("");
    const [dropoffLat, setDropoffLat] = useState(28.5355);
    const [dropoffLng, setDropoffLng] = useState(77.3910);

    const [itemDescription, setItemDescription] = useState("");
    const [weightEstimate, setWeightEstimate] = useState<number>(0);
    const [dimensions, setDimensions] = useState("");
    const [floorPickup, setFloorPickup] = useState(0);
    const [floorDropoff, setFloorDropoff] = useState(0);
    const [elevatorPickup, setElevatorPickup] = useState(false);
    const [elevatorDropoff, setElevatorDropoff] = useState(false);
    const [helpWithLoading, setHelpWithLoading] = useState(false);

    const [photos, setPhotos] = useState<File[]>([]);
    const [suggestedPrice, setSuggestedPrice] = useState<number>(0);

    // Calculate price when relevant fields change
    useEffect(() => {
        if (pickupAddress && dropoffAddress) {
            calculatePrice();
        }
    }, [
        category,
        floorPickup,
        floorDropoff,
        elevatorPickup,
        elevatorDropoff,
        weightEstimate,
        helpWithLoading,
        pickupAddress,
        dropoffAddress
    ]);

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100) / 100;
    };

    const calculatePrice = async () => {
        const distance = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);

        // Call Supabase RPC
        const { data, error } = await supabase.rpc('calculate_suggested_price', {
            p_distance_km: distance,
            p_category: category,
            p_floor_number: Math.max(floorPickup, floorDropoff), // Simplified: take max floor
            p_elevator_available: elevatorPickup || elevatorDropoff, // Simplified: if either has elevator
            p_weight_kg: weightEstimate
        });

        if (data) {
            let price = data;
            if (helpWithLoading) price += 150; // Add helper cost manually if not in RPC
            setSuggestedPrice(price);
        } else {
            console.error("Pricing error:", error);
            // Fallback
            setSuggestedPrice(200 + (distance * 10));
        }
    };

    const uploadPhotos = async (files: File[]): Promise<string[]> => {
        const urls: string[] = [];
        for (const file of files) {
            const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
            const { data, error } = await supabase.storage
                .from('booking-photos')
                .upload(fileName, file); // User must create this bucket!

            if (data) {
                const { data: { publicUrl } } = supabase.storage
                    .from('booking-photos')
                    .getPublicUrl(fileName);
                urls.push(publicUrl);
            }
        }
        return urls;
    };

    const handleSubmit = async () => {
        if (!user?.id) {
            setError("Please login first");
            return;
        }

        if (!category || !pickupAddress || !dropoffAddress || !itemDescription) {
            setError("Please fill all required fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // 1. Upload photos
            let photoUrls: string[] = [];
            if (photos.length > 0) {
                try {
                    photoUrls = await uploadPhotos(photos);
                } catch (e) {
                    console.warn("Photo upload failed (Bucket might not exist)", e);
                }
            }

            // 2. Calculate final params
            const distance = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
            const biddingEndsAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

            // 3. Insert Booking
            const { data, error: insertError } = await supabase
                .from("bookings")
                .insert({
                    customer_id: user.id,
                    booking_type: 'bidding',
                    category,
                    pickup_address: pickupAddress,
                    pickup_lat: pickupLat,
                    pickup_lng: pickupLng,
                    dropoff_address: dropoffAddress,
                    dropoff_lat: dropoffLat,
                    dropoff_lng: dropoffLng,
                    distance_km: distance,
                    item_description: itemDescription,
                    item_photos: photoUrls,
                    weight_estimate_kg: weightEstimate,
                    dimensions,
                    floor_number: Math.max(floorPickup, floorDropoff), // Store max floor for simplicity matches schema
                    elevator_available: elevatorPickup || elevatorDropoff,
                    help_with_loading: helpWithLoading,
                    suggested_price: suggestedPrice,
                    bidding_ends_at: biddingEndsAt.toISOString(),
                    status: "accepting_bids",
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // 4. Navigate
            router.push(`/bidding/${data.id}`);
            onClose();
        } catch (err: any) {
            console.error("Error creating booking:", err);
            setError(err.message || "Failed to create booking.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col relative">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold">
                        {step === 1 && "What are you moving?"}
                        {step === 2 && "Locations"}
                        {step === 3 && "Item Details"}
                    </h2>
                    <button onClick={onClose} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 px-6 py-4 bg-gray-50">
                    {[1, 2, 3].map((s) => (
                        <div key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-[#E16595]' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* STEP 1: CATEGORY */}
                    {step === 1 && (
                        <div className="space-y-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group
                                        ${category === cat.id ? 'border-[#E16595] bg-pink-50' : 'border-gray-100 hover:border-pink-200'}
                                    `}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                                        ${category === cat.id ? 'bg-[#E16595] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-pink-100'}
                                    `}>
                                        <cat.icon size={24} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-lg">{cat.label}</div>
                                        <div className="text-sm text-gray-500">{cat.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* STEP 2: LOCATION */}
                    {step === 2 && (
                        <div className="space-y-6">
                            {/* Pickup */}
                            <div className="space-y-2">
                                <label className="font-medium flex items-center gap-2 text-gray-700">
                                    <span className="w-2 h-2 rounded-full bg-green-500" /> Pickup
                                </label>
                                <div className="space-y-3">
                                    <input
                                        value={pickupAddress}
                                        onChange={(e) => setPickupAddress(e.target.value)}
                                        placeholder="Enter pickup address"
                                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300"
                                    />
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Floor (0=G)"
                                                value={floorPickup}
                                                onChange={(e) => setFloorPickup(Number(e.target.value))}
                                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                            />
                                        </div>
                                        <label className="flex items-center gap-2 px-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={elevatorPickup}
                                                onChange={(e) => setElevatorPickup(e.target.checked)}
                                                className="w-5 h-5 accent-[#E16595]"
                                            />
                                            <span className="text-sm">Elevator</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Divider arrow */}
                            <div className="flex justify-center -my-2 opacity-30">
                                <ArrowRight className="rotate-90" />
                            </div>

                            {/* Dropoff */}
                            <div className="space-y-2">
                                <label className="font-medium flex items-center gap-2 text-gray-700">
                                    <span className="w-2 h-2 rounded-full bg-red-500" /> Dropoff
                                </label>
                                <div className="space-y-3">
                                    <input
                                        value={dropoffAddress}
                                        onChange={(e) => setDropoffAddress(e.target.value)}
                                        placeholder="Enter dropoff address"
                                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300"
                                    />
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Floor (0=G)"
                                                value={floorDropoff}
                                                onChange={(e) => setFloorDropoff(Number(e.target.value))}
                                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                            />
                                        </div>
                                        <label className="flex items-center gap-2 px-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={elevatorDropoff}
                                                onChange={(e) => setElevatorDropoff(e.target.checked)}
                                                className="w-5 h-5 accent-[#E16595]"
                                            />
                                            <span className="text-sm">Elevator</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DETAILS */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="font-medium text-gray-700">Item Description</label>
                                <textarea
                                    value={itemDescription}
                                    onChange={(e) => setItemDescription(e.target.value)}
                                    placeholder="Describe items (e.g. 3-seater sofa, 2 boxes)..."
                                    rows={3}
                                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300 resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs text-gray-500">Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={weightEstimate || ''}
                                        onChange={(e) => setWeightEstimate(Number(e.target.value))}
                                        placeholder="~50"
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs text-gray-500">Dimensions</label>
                                    <input
                                        value={dimensions}
                                        onChange={(e) => setDimensions(e.target.value)}
                                        placeholder="L x W x H"
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer bg-gray-50 hover:bg-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={helpWithLoading}
                                    onChange={(e) => setHelpWithLoading(e.target.checked)}
                                    className="w-5 h-5 accent-[#E16595]"
                                />
                                <div>
                                    <div className="font-medium">Need Helper? (+₹150)</div>
                                    <div className="text-xs text-gray-500">Driver will bring help for loading/unloading</div>
                                </div>
                            </label>

                            {/* Photo Upload */}
                            <div className="space-y-2">
                                <label className="font-medium text-gray-700">Add Photos</label>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    <label className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-pink-400 hover:text-pink-500 text-gray-400 transition-colors">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files) setPhotos(Array.from(e.target.files));
                                            }}
                                        />
                                        <Camera size={24} />
                                    </label>
                                    {photos.map((p, i) => (
                                        <div key={i} className="flex-shrink-0 w-20 h-20 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-200">
                                            <img src={URL.createObjectURL(p)} alt="preview" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Estimate Card */}
                            <div className="bg-gradient-to-br from-[#E16595] to-[#c04d7a] p-5 rounded-2xl text-white shadow-lg shadow-pink-200 mt-2">
                                <div className="text-sm opacity-90 mb-1">Estimated Market Price</div>
                                <div className="text-3xl font-bold">₹{suggestedPrice}</div>
                                <div className="text-sm mt-1 opacity-80 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    Live Bidding System
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t bg-white flex gap-3">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex-1 py-4 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50"
                        >
                            Back
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => {
                                if (step === 1 && !category) return setError("Select a category");
                                if (step === 2 && (!pickupAddress || !dropoffAddress)) return setError("Address is required");
                                setError("");
                                setStep(step + 1);
                            }}
                            className="flex-[2] py-4 bg-[#E16595] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-200 transition-all"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-[2] py-4 bg-[#E16595] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Post Job for Bidding"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
