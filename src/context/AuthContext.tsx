"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: "customer" | "driver" | "both";
    created_at: string;
}

interface AuthContextType {
    user: any | null;
    profile: UserProfile | null;
    session: any | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string, role: "customer" | "driver" | "both") => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile from database (handles missing table gracefully)
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (data && !error) {
                setProfile(data);
            } else {
                // If table doesn't exist or no profile, create a mock profile from user metadata
                setProfile(null);
            }
            return { data, error };
        } catch (err) {
            console.log("Profile fetch failed (table may not exist yet):", err);
            return { data: null, error: err };
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }: any) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: any, session: any) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Sign up new user
    const signUp = async (
        email: string,
        password: string,
        fullName: string,
        role: "customer" | "driver" | "both"
    ) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    },
                },
            });

            if (error) throw error;

            // Try to create profile in database (ignore if table doesn't exist)
            if (data.user) {
                try {
                    await supabase.from("profiles").insert({
                        id: data.user.id,
                        email: email,
                        full_name: fullName,
                        role: role,
                    });
                } catch (profileErr) {
                    console.log("Profile creation skipped (table may not exist):", profileErr);
                    // Continue anyway - user can still use the app
                }
            }

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    // Sign in existing user
    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    // Sign out
    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    // Update profile
    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!user) return { error: new Error("Not authenticated") };

        try {
            const { error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", user.id);

            if (error) throw error;

            // Refresh profile
            await fetchProfile(user.id);
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                loading,
                signUp,
                signIn,
                signOut,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
