import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios-Instance";
import useAuth from "../hooks/useAuth";

const InputField = ({ label, type, placeholder, value, onChange, required }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {label}
        </label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
        />
    </div>
);

const Auth = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [showPassword, setShowPassword] =
        useState(false);

    const [tab, setTab] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setError("");
    };

    const handleTabSwitch = (newTab) => {
        setTab(newTab);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            const endpoint = tab === "login" ? "/auth/login" : "/auth/register";
            const payload =
                tab === "login"
                    ? { email, password }
                    : { name, email, password };

            const response = await api.post(endpoint, payload);
            const data = response.data.data;

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            setUser(data.user);
            navigate("/dashboard");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                (tab === "login" ? "Login failed" : "Registration failed")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen  flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-100 rounded-full opacity-60" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-100 rounded-full opacity-60" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full opacity-40" />
            </div>

            <div className="relative w-full max-w-md">

                {/* Top brand bar */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">
                        Secure Notes
                    </span>
                </div>

                {/* Card */}
                <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden">

                    {/* Tab switcher */}
                    <div className="px-8 pt-7 pb-0">
                        <div className="flex bg-slate-100 rounded-2xl p-1">
                            <button
                                type="button"
                                onClick={() => handleTabSwitch("login")}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${tab === "login"
                                    ? "bg-white text-indigo-600 shadow-sm shadow-slate-200"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTabSwitch("register")}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${tab === "register"
                                    ? "bg-white text-indigo-600 shadow-sm shadow-slate-200"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                Register
                            </button>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="px-8 pt-6 pb-8">
                        {/* Heading */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                                {tab === "login" ? "Welcome back" : "Get started"}
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                {tab === "login"
                                    ? "Sign in to access your notes"
                                    : "Create your account in seconds"}
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {tab === "register" && (
                                <InputField
                                    label="Full Name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            )}

                            <InputField
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                        Password
                                    </label>
                                    {tab === "login" && (
                                        <Link
                                            to="/forgot-password"
                                            className="text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>


                                <div className="relative">
                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(
                                                e.target.value
                                            )
                                        }
                                        required
                                        className="
      w-full
      bg-white
      border
      border-slate-200
      rounded-xl
      px-4
      py-3
      pr-12
      text-sm
      text-slate-800
      placeholder-slate-400
      outline-none
      focus:border-indigo-500
      focus:ring-2
      focus:ring-indigo-500/20
      transition-all
      duration-200
    "
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="
      absolute
      right-4
      top-1/2
      -translate-y-1/2
      text-slate-500
      hover:text-slate-700
    "
                                    >
                                        {showPassword ? (
                                            /* Eye Off SVG */
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.8}
                                                stroke="currentColor"
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 3l18 18"
                                                />

                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M10.584 10.587a2.25 2.25 0 003.182 3.182"
                                                />

                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9.88 5.09A9.953 9.953 0 0112 4.875c4.478 0 8.268 2.943 9.543 7.125a9.97 9.97 0 01-4.132 5.411M6.228 6.228A9.956 9.956 0 002.457 12c1.274 4.182 5.064 7.125 9.543 7.125 1.61 0 3.13-.38 4.478-1.057"
                                                />
                                            </svg>
                                        ) : (
                                            /* Eye SVG */
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.8}
                                                stroke="currentColor"
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M2.25 12s3.75-7.125 9.75-7.125S21.75 12 21.75 12 18 19.125 12 19.125 2.25 12 2.25 12z"
                                                />

                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 15.375A3.375 3.375 0 1012 8.625a3.375 3.375 0 000 6.75z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Please wait...
                                    </>
                                ) : tab === "login" ? (
                                    <>
                                        Sign in
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px bg-slate-100" />
                            <span className="text-xs text-slate-400 font-medium">or</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        {/* Footer switch */}
                        <p className="text-center text-sm text-slate-500">
                            {tab === "login" ? (
                                <>
                                    Don&apos;t have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => handleTabSwitch("register")}
                                        className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                                    >
                                        Register for free
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => handleTabSwitch("login")}
                                        className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Bottom trust badge */}
                <div className="flex items-center justify-center gap-1.5 mt-5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <p className="text-xs text-slate-400">
                        Protected with end-to-end encryption
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Auth;