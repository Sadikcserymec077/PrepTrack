import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";

const Signup = () => {
    const { signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirm) {
            return setError("Passwords do not match.");
        }
        if (form.password.length < 6) {
            return setError("Password must be at least 6 characters.");
        }
        setLoading(true);
        try {
            await signup(form.email, form.password, form.name);
            navigate("/dashboard");
        } catch (err) {
            if (err.code === "auth/email-already-in-use") {
                setError("This email is already registered. Please log in.");
            } else {
                setError("Failed to create account. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError("");
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate("/dashboard");
        } catch (err) {
            setError("Google sign-in failed.");
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { key: "name", label: "Full Name", type: "text", placeholder: "John Doe", icon: User },
        { key: "email", label: "Email", type: "email", placeholder: "you@example.com", icon: Mail },
        { key: "password", label: "Password", type: showPassword ? "text" : "password", placeholder: "••••••••", icon: Lock },
        { key: "confirm", label: "Confirm Password", type: showPassword ? "text" : "password", placeholder: "••••••••", icon: Lock },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                        <GraduationCap size={20} className="text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">PrepTrack</span>
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">Create account 🚀</h2>
                <p className="text-gray-400 mb-8">Start your placement preparation journey today</p>

                {error && (
                    <div className="flex items-center gap-2 bg-red-900/30 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map(({ key, label, type, placeholder, icon: Icon }) => (
                        <div key={key}>
                            <label className="label text-gray-400">{label}</label>
                            <div className="relative">
                                <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type={type} placeholder={placeholder} required value={form[key]}
                                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                                    className="input pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:ring-brand-500" />
                                {(key === "password") && (
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <button type="submit" disabled={loading}
                        className="w-full btn-primary py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-3 text-gray-500 bg-gray-950">or</span></div>
                </div>

                <button onClick={handleGoogle} disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium py-3 rounded-xl transition-all duration-200">
                    <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
                    Continue with Google
                </button>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
