import type { Metadata } from "next";
import "../styles/globals.css";
import { ModeProvider } from "@/context/ModeContext";

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
                <ModeProvider>
                    <div className="container">
                        {children}
                    </div>
                </ModeProvider>
            </body>
        </html>
    );
}
