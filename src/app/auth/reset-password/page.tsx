"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
            setTimeout(() => router.push("/auth/login"), 2000);
        }
        setLoading(false);
    };

    if (success) {
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
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Password Reset!</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Redirecting you to sign in...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Set new password</h1>
                    <p>Must be at least 6 characters.</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>New Password</label>
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

                    <div className="input-group">
                        <label>Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock size={20} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Updating..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
