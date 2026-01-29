import type { Metadata } from "next";
import "../styles/globals.css";
import { ModeProvider } from "@/context/ModeContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
    title: "Antigravity - Logistics Marketplace",
    description: "Unified on-demand logistics for everyone.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <ModeProvider>
                        <div className="app-container">
                            {children}
                        </div>
                    </ModeProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
