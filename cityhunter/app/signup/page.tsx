"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "../hooks/useTheme";

import Toast from "../components/Toast";
import ComingSoonWrapper from "../components/dashboard/ComingSoonWrapper";

export default function SignupPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  
  // Steps: 1 = Details, 2 = Verification
  const [step, setStep] = useState(1);
  
  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState({ code: "+1", flag: "🇺🇸" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");

  // Error States
  const [emailError, setEmailError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [passwordComplexityError, setPasswordComplexityError] = useState(false);
  const [otpError, setOtpError] = useState("");
  
  // Toast State
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Password Validation State
  const [pwdValidations, setPwdValidations] = useState({
    length: false,
    uppercase: false,
    special: false,
  });

  // Country Codes Mock Data
  const countryCodes = [
    { code: "+1", flag: "🇺🇸", country: "USA" },
    { code: "+44", flag: "🇬🇧", country: "UK" },
    { code: "+33", flag: "🇫🇷", country: "FR" },
    { code: "+49", flag: "🇩🇪", country: "DE" },
    { code: "+81", flag: "🇯🇵", country: "JP" },
  ];

  // Real-time Password Validation
  useEffect(() => {
    setPwdValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
    // Clear complexity error on change
    if (passwordComplexityError) setPasswordComplexityError(false);
    
    // Check match if confirm password is filled
    if (confirmPassword) {
      const match = password === confirmPassword;
      if (match) setPasswordMatchError(false);
    }
  }, [password, confirmPassword]);

  const areAllFieldsFilled = firstName && lastName && phone && email && password && confirmPassword;

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset Errors
    setEmailError("");
    setPasswordMatchError(false);
    setPasswordComplexityError(false);

    let hasError = false;

    // 1. Check Password Complexity
    const isComplexityValid = Object.values(pwdValidations).every(Boolean);
    if (!isComplexityValid) {
      setPasswordComplexityError(true);
      hasError = true;
    }

    // 2. Check Password Match
    if (password !== confirmPassword) {
      setPasswordMatchError(true);
      hasError = true;
    }

    // 3. Mock Email Check
    if (email.toLowerCase() === "used@example.com") {
      setEmailError("This email is already linked to a Hunter ID.");
      hasError = true;
    }

    if (hasError) return;

    // Proceed to OTP Step
    setStep(2);
    setOtp(""); // Clear OTP
    setOtpError(""); // Clear OTP errors
    console.log("Signup details submitted:", { firstName, lastName, phone: `${countryCode.code} ${phone}`, email });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    
    if (otp === "111111") {
      console.log("OTP Verified! Redirecting...");
      setShowSuccessToast(true);
      // Delay redirect to let toast show
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setOtpError("Invalid code. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-canvas text-primary font-sans">
      {/* Toast Notification */}
      {showSuccessToast && (
        <Toast 
          message="Account successfully created! Redirecting..." 
          type="success" 
          onClose={() => setShowSuccessToast(false)} 
        />
      )}
      {/* Dynamic Background (Hero Style) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-hero-gradient"></div>
        <div className="absolute inset-0 bg-grid opacity-70"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 my-10">
        <div className="glass p-8 sm:p-10 rounded-3xl border border-divider/10 shadow-2xl animate-on-scroll is-visible transition-all duration-500">
          
          
          {/* Header */}
          <ComingSoonWrapper
            active={true}
            title="Access Restricted"
            message="This application is currently available to pre-approved users only."
            icon="fa-lock"
            color="text-red-500"
          >
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
              {step === 1 ? "Join the Hunt" : "Verify Identity"}
            </h1>
            <p className="text-secondary text-sm">
              {step === 1 
                ? "Create your secure explorer profile" 
                : `Enter the code sent to ${email}`}
            </p>
          </div>

          {step === 1 ? (
            /* STEP 1: ACCOUNT DETAILS */
            <>
               {/* Google Signup */}
              <button className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors mb-6 cursor-pointer">
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span>Sign up with Google</span>
              </button>

              <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-divider/10"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-secondary uppercase tracking-widest">
                  Or sign up with email
                </span>
                <div className="flex-grow border-t border-divider/10"></div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                {/* Name Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-secondary mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-canvas/50 border border-divider/10 focus:border-accent rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm"
                      placeholder="Jane"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-secondary mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-canvas/50 border border-divider/10 focus:border-accent rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-2">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="relative w-28">
                      <select
                        value={countryCode.code}
                        onChange={(e) => {
                           const selected = countryCodes.find(c => c.code === e.target.value);
                           if(selected) setCountryCode(selected);
                        }}
                        className="w-full appearance-none bg-canvas/50 border border-divider/10 focus:border-accent rounded-xl pl-3 pr-8 py-3 text-sm focus:outline-none cursor-pointer"
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-secondary">
                        <i className="fa-solid fa-chevron-down text-xs"></i>
                      </div>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 bg-canvas/50 border border-divider/10 focus:border-accent rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm"
                      placeholder="(555) 000-0000"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    className={`w-full bg-canvas/50 border ${emailError ? 'border-red-500' : 'border-divider/10'} focus:border-accent rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm`}
                    placeholder="explorer@example.com"
                    required
                  />
                  {emailError && <p className="text-red-500 text-xs mt-1 font-bold">{emailError}</p>}
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full bg-canvas/50 border ${passwordComplexityError ? 'border-red-500' : 'border-divider/10'} focus:border-accent rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm pr-10`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-secondary hover:text-primary transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <i className="fa-solid fa-eye-slash text-sm"></i>
                      ) : (
                        <i className="fa-solid fa-eye text-sm"></i>
                      )}
                    </button>
                  </div>
                  
                  {/* Validation Indicators */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className={`h-1 rounded-full transition-colors ${pwdValidations.length ? (passwordComplexityError ? 'bg-red-500' : 'bg-green-500') : 'bg-divider/20'}`}></div>
                    <div className={`h-1 rounded-full transition-colors ${pwdValidations.uppercase ? (passwordComplexityError ? 'bg-red-500' : 'bg-green-500') : 'bg-divider/20'}`}></div>
                    <div className={`h-1 rounded-full transition-colors ${pwdValidations.special ? (passwordComplexityError ? 'bg-red-500' : 'bg-green-500') : 'bg-divider/20'}`}></div>
                  </div>
                  {passwordComplexityError && <p className="text-red-500 text-xs mt-1 font-bold">Password requirements not met.</p>}
                  
                  <ul className="mt-2 text-[10px] space-y-1 text-secondary">
                    <li className={`flex items-center gap-1.5 ${pwdValidations.length ? 'text-green-500' : ''}`}>
                      <i className={`fa-solid ${pwdValidations.length ? 'fa-check' : 'fa-circle text-[4px]'}`}></i>
                      At least 8 characters
                    </li>
                    <li className={`flex items-center gap-1.5 ${pwdValidations.uppercase ? 'text-green-500' : ''}`}>
                      <i className={`fa-solid ${pwdValidations.uppercase ? 'fa-check' : 'fa-circle text-[4px]'}`}></i>
                      One uppercase letter
                    </li>
                    <li className={`flex items-center gap-1.5 ${pwdValidations.special ? 'text-green-500' : ''}`}>
                      <i className={`fa-solid ${pwdValidations.special ? 'fa-check' : 'fa-circle text-[4px]'}`}></i>
                      One special character
                    </li>
                  </ul>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold uppercase text-secondary mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full bg-canvas/50 border ${passwordMatchError ? 'border-red-500' : 'border-divider/10'} focus:border-accent rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm`}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  {passwordMatchError && <p className="text-red-500 text-xs mt-1 font-bold">Passwords do not match.</p>}
                </div>

                <button
                  type="submit"
                  disabled={!areAllFieldsFilled}
                  className="w-full bg-accent text-black font-bold py-3.5 rounded-xl hover:bg-accentHover transition-colors active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Account <i className="fa-solid fa-arrow-right"></i>
                </button>
              </form>
            </>
          ) : (
            /* STEP 2: VERIFICATION */
            <form onSubmit={handleVerify} className="space-y-6">
               <div className="flex justify-center gap-3">
                 {[...Array(6)].map((_, i) => (
                   <div key={i} className="w-12 h-14 bg-canvas/50 border border-divider/10 rounded-lg flex items-center justify-center text-xl font-mono font-bold">
                     {otp[i] || ""}
                   </div>
                 ))}
               </div>
               
               <input 
                 type="text" 
                 value={otp}
                 onChange={(e) => { setOtp(e.target.value.slice(0, 6)); setOtpError(""); }}
                 className={`w-full text-center tracking-[1em] font-mono text-xl bg-transparent border-b-2 ${otpError ? 'border-red-500' : 'border-accent'} focus:outline-none py-2`}
                 autoFocus
                 maxLength={6}
                 placeholder="------"
               />
               
               {otpError && <p className="text-center text-red-500 text-sm font-bold">{otpError}</p>}
               
               <button
                  type="submit"
                  className="w-full bg-accent text-black font-bold py-3.5 rounded-xl hover:bg-accentHover transition-colors active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Verify Email <i className="fa-solid fa-check"></i>
                </button>

                <div className="text-center">
                  <button type="button" onClick={() => setStep(1)} className="text-xs text-secondary hover:text-primary transition-colors cursor-pointer">
                    Change Email
                  </button>
                  <span className="text-secondary mx-2">•</span>
                  <button type="button" className="text-xs text-secondary hover:text-primary transition-colors cursor-pointer">
                    Resend Code
                  </button>
                </div>
            </form>
          )}

          {/* Footer */}
          {step === 1 && (
            <div className="mt-8 text-center text-sm text-secondary">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-bold hover:text-accent transition-colors"
              >
                Log In
              </Link>
            </div>
          )}
          </ComingSoonWrapper>
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
