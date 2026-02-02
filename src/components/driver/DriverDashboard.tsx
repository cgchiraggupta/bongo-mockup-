"use client";

import React from "react";
import JobBoard from "./JobBoard";
import OnlineToggle from "./OnlineToggle";
import { Bell, User } from "lucide-react";

export default function DriverDashboard() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <header className="bg-white sticky top-0 z-20 border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">B</span>
                    </div>
                    <span className="font-bold text-gray-900 hidden sm:block">Bongo Driver</span>
                </div>

                <div className="flex items-center gap-4">
                    <OnlineToggle />

                    <button className="relative p-2 rounded-full hover:bg-gray-100">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                    </button>

                    <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                        <User size={18} className="text-gray-600" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main>
                <JobBoard />
            </main>
        </div>
    );
}
