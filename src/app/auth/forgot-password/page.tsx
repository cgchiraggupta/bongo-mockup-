"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setSent(true);
        }
        setLoading(false);
    };

    if (sent) {
        return (
            <div className="auth-page">
                <div className="auth-container" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        background: '#D1FAE5',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <CheckCircle size={32} color="#059669" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Check your email</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                        We sent a password reset link to<br />
                        <strong>{email}</strong>
                    </p>
                    <a href="/auth/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        Back to Sign In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Forgot password?</h1>
                    <p>No worries, we'll send you reset instructions.</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

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

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Sending..." : "Reset Password"}
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div className="auth-footer">
                    <a href="/auth/login" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none'
                    }}>
                        <ArrowLeft size={16} />
                        Back to Sign In
                    </a>
                </div>
            </div>
        </div>
    );
}
