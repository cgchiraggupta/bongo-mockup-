"use client";

import { useMode } from "@/context/ModeContext";
import { Home, Clock, User, DollarSign, MapPin } from "lucide-react";

export default function BottomNav() {
    const { mode } = useMode();

    return (
        <nav className="bottom-nav">
            {mode === "customer" ? (
                <>
                    <NavItem icon={<Home size={22} />} label="Home" active />
                    <NavItem icon={<Clock size={22} />} label="Activity" />
                    <NavItem icon={<User size={22} />} label="Account" />
                </>
            ) : (
                <>
                    <NavItem icon={<MapPin size={22} />} label="Jobs" active />
                    <NavItem icon={<DollarSign size={22} />} label="Earnings" />
                    <NavItem icon={<User size={22} />} label="Profile" />
                </>
            )}
        </nav>
    );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <button className={`nav-item ${active ? "active" : ""}`}>
            {icon}
            <span className="nav-label">{label}</span>
        </button>
    );
}
