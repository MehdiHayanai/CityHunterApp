"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "../hooks/useTheme";
import Toast from "../components/Toast";
import { authService } from "../services/auth";
import { useAuthStore } from "../../store/useAuthStore";

  export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Determine if we are in "Forgot Password" mode
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        await login({ email, password });
        
        setToastMessage(`Welcome back! Redirecting...`);
        setToastType("success");
        setShowToast(true);

        // Redirect handled by middleware mostly, but good to force push
        router.push('/dashboard');

    } catch (error: any) {
        console.error("Login failed", error);
        setToastMessage(error.message || "Invalid credentials. Please try again.");
        setToastType("error");
        setShowToast(true);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-canvas text-primary font-sans">
      {/* Toast Notification */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
        />
      )}

      {/* Dynamic Background (Hero Style) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-hero-gradient"></div>
        <div className="absolute inset-0 bg-grid opacity-70"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="glass p-8 sm:p-10 rounded-3xl border border-divider/10 shadow-2xl animate-on-scroll is-visible">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-primary text-canvas flex items-center justify-center rounded-lg font-black text-xl tracking-tighter group-hover:bg-accent group-hover:text-black transition-colors">
                CH
              </div>
              <span className="font-bold tracking-tight text-lg">
                CityHunter
              </span>
            </Link>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              {isForgotPassword ? "Recover Account" : "Welcome Back"}
            </h1>
            <p className="text-secondary text-sm">
              {isForgotPassword
                ? "Enter your email to receive a reset link"
                : "Enter your credentials to access your mission"}
            </p>
          </div>

          {!isForgotPassword ? (
            <>
              {/* Google Login */}
              <button className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors mb-6 cursor-pointer">
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-divider/10"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-secondary uppercase tracking-widest">
                  Or continue with email
                </span>
                <div className="flex-grow border-t border-divider/10"></div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold uppercase text-secondary mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-canvas/50 border border-divider/10 focus:border-accent rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm"
                    placeholder="explorer@example.com"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase text-secondary mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-canvas/50 border border-divider/10 focus:border-accent rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs text-secondary hover:text-accent transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-accent text-black font-bold py-3.5 rounded-xl hover:bg-accentHover transition-colors active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <><i className="fa-solid fa-spinner fa-spin"></i> Logging In...</>
                  ) : (
                    <>Log In <i className="fa-solid fa-arrow-right"></i></>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Forgot Password Form */
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-xs font-bold uppercase text-secondary mb-2"
                >
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  className="w-full bg-canvas/50 border border-divider/10 focus:border-accent rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm"
                  placeholder="explorer@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent text-black font-bold py-3.5 rounded-xl hover:bg-accentHover transition-colors active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full text-secondary hover:text-primary text-sm font-bold py-3 cursor-pointer"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* Footer */}
          {!isForgotPassword && (
            <div className="mt-8 text-center text-sm text-secondary">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-bold hover:text-accent transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Theme Toggle (Bottom Right) */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-surface border border-divider/10 text-secondary hover:text-accent hover:border-accent shadow-xl flex items-center justify-center transition-all cursor-pointer z-50 animate-fade-in"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? (
          <i className="fa-solid fa-moon text-lg"></i>
        ) : (
          <i className="fa-solid fa-sun text-lg"></i>
        )}
      </button>
    </div>
  );
}
