import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import { ModeProvider } from "@/context/ModeContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
    title: "Antigravity - Logistics Marketplace",
    description: "Unified on-demand logistics for everyone.",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Antigravity",
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: "#F4F6F9",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
            </head>
            <body suppressHydrationWarning>
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
