"use client";

import { useMode } from "@/context/ModeContext";
import ModeSwitcher from "@/components/shared/ModeSwitcher";
import BottomNav from "@/components/shared/BottomNav";
import BookingFlow from "@/components/customer/BookingFlow";
import DriverDashboard from "@/components/driver/Dashboard";

export default function Home() {
    const { mode } = useMode();

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* Header / Mode Switcher */}
            <ModeSwitcher />

            {/* Main Content Area */}
            <div className="mt-2">
                {mode === "customer" ? (
                    <BookingFlow />
                ) : (
                    <DriverDashboard />
                )}
            </div>

            {/* Navigation */}
            <BottomNav />
        </main>
    );
}
