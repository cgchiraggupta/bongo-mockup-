import React from "react";
import { Search } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    containerClassName?: string;
}

export default function Input({ label, icon, containerClassName = "", className = "", ...props }: InputProps) {
    return (
        <div className={`space-y-1 ${containerClassName}`}>
            {label && <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>}
            <div className="relative">
                <input
                    className={`
            w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 
            focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all
            ${icon ? "pl-11" : ""}
            ${className}
          `}
                    {...props}
                />
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
