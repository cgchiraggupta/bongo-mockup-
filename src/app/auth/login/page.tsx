"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [needsConfirmation, setNeedsConfirmation] = useState(false);
    const [resending, setResending] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message.includes("Email not confirmed")) {
                setNeedsConfirmation(true);
                setError("Please confirm your email before signing in.");
            } else {
                setError(error.message);
            }
            setLoading(false);
        } else {
            router.push("/");
        }
    };

    const handleResendConfirmation = async () => {
        setResending(true);
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage("Confirmation email sent! Check your inbox.");
            setNeedsConfirmation(false);
        }
        setResending(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Header */}
                <div className="auth-header">
                    <h1>Welcome back</h1>
                    <p>Sign in to continue with Antigravity</p>
                </div>

                {/* Success Message */}
                {message && (
                    <div style={{
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        color: '#166534',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem'
                    }}>
                        {message}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="auth-error">
                        {error}
                        {needsConfirmation && (
                            <button
                                onClick={handleResendConfirmation}
                                disabled={resending}
                                style={{
                                    display: 'block',
                                    marginTop: '0.75rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#DC2626',
                                    fontWeight: 600,
                                    textDecoration: 'underline',
                                    cursor: 'pointer'
                                }}
                            >
                                {resending ? "Sending..." : "Resend confirmation email"}
                            </button>
                        )}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Email</label>
                        <div className="input-wrapper">
                            <Mail size={20} className="input-icon" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Password</label>
                            <a
                                href="/auth/forgot-password"
                                style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--color-primary)',
                                    textDecoration: 'none',
                                    fontWeight: 500
                                }}
                            >
                                Forgot password?
                            </a>
                        </div>
                        <div className="input-wrapper">
                            <Lock size={20} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                        <ArrowRight size={18} />
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <p>
                        Don't have an account?{" "}
                        <a href="/auth/signup">Sign up</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
