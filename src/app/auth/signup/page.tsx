"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Package, Truck } from "lucide-react";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState<"customer" | "driver" | "both">("customer");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        const { error } = await signUp(email, password, fullName, role);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Show success message or redirect
            router.push("/auth/login?message=Check your email to confirm your account");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Header */}
                <div className="auth-header">
                    <h1>Create account</h1>
                    <p>Join Antigravity today</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Full Name</label>
                        <div className="input-wrapper">
                            <User size={20} className="input-icon" />
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

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
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock size={20} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 6 characters"
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

                    {/* Role Selection */}
                    <div className="input-group">
                        <label>I want to...</label>
                        <div className="role-selector">
                            <button
                                type="button"
                                className={`role-option ${role === "customer" ? "selected" : ""}`}
                                onClick={() => setRole("customer")}
                            >
                                <Package size={24} />
                                <span>Send Packages</span>
                            </button>
                            <button
                                type="button"
                                className={`role-option ${role === "driver" ? "selected" : ""}`}
                                onClick={() => setRole("driver")}
                            >
                                <Truck size={24} />
                                <span>Deliver Packages</span>
                            </button>
                            <button
                                type="button"
                                className={`role-option both ${role === "both" ? "selected" : ""}`}
                                onClick={() => setRole("both")}
                            >
                                <span>Both</span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                        <ArrowRight size={18} />
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <a href="/auth/login">Sign in</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
