"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Activity, 
  FlaskConical, 
  LayoutDashboard, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Headphones,
  Plus,
  Loader2,
  CheckCircle2
} from "lucide-react";

// Strict Types
type DepartmentType = "clinical" | "research" | "administration";

interface DepartmentDetails {
  id: DepartmentType;
  name: string;
  subtext: string;
  placeholder: string;
  pattern: RegExp;
  patternDescription: string;
}

const DEPARTMENTS: Record<DepartmentType, DepartmentDetails> = {
  clinical: {
    id: "clinical",
    name: "Clinical",
    subtext: "Doctor / Staff",
    placeholder: "e.g. 0123456789 or +84123456789",
    pattern: /^(\+84|0)\d{9}$/,
    patternDescription: "Must be a valid phone number starting with 0 or +84 (e.g. 0123456789 or +84123456789).",
  },
  research: {
    id: "research",
    name: "Research",
    subtext: "Lab / Science",
    placeholder: "e.g. 0123456789 or +84123456789",
    pattern: /^(\+84|0)\d{9}$/,
    patternDescription: "Must be a valid phone number starting with 0 or +84 (e.g. 0123456789 or +84123456789).",
  },
  administration: {
    id: "administration",
    name: "Administration",
    subtext: "Management",
    placeholder: "e.g. 0123456789 or +84123456789",
    pattern: /^(\+84|0)\d{9}$/,
    patternDescription: "Must be a valid phone number starting with 0 or +84 (e.g. 0123456789 or +84123456789).",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [activeDept, setActiveDept] = useState<DepartmentType>("administration");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation & Loading States
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Empty State Check
    if (!username.trim() || !password.trim()) {
      setError("Please fill in both Phonenumber and Password.");
      return;
    }

    // Pattern format check for active department
    const deptInfo = DEPARTMENTS[activeDept];
    if (!deptInfo.pattern.test(username.trim())) {
      setError(deptInfo.patternDescription);
      return;
    }

    // Passwords must be at least 6 characters
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Real API login call to the backend
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    
    fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: username.trim(),
        password: password,
      }),
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await res.json();
          if (!result.success) {
            throw new Error(result.message || "Login failed. Please check your credentials.");
          }
          return result.data;
        } else {
          if (!res.ok) {
            throw new Error("HTTP connection error. Server returned " + res.status);
          }
          throw new Error("Invalid response format from server.");
        }
      })
      .then((data) => {
        if (data && data.token) {
          localStorage.setItem("authToken", data.token);
        }
        if (data && data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        router.push("/user-management/create-user");
      })
      .catch((err) => {
        setError(err.message || "Could not connect to the authentication server.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex min-h-screen w-full select-none bg-surface font-inter text-neutral-500">
      {/* LEFT PANE - CLINICAL BRANDING (Hidden on mobile, flex on web) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-[#0B1528] p-16 text-white overflow-hidden lg:flex">
        {/* Decorative Grid / Radial Blur Background Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-primary/15 via-transparent to-transparent pointer-events-none opacity-60" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Branding Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-hms bg-primary shadow-lg shadow-primary/30">
            <Plus className="h-6 w-6 text-white stroke-[3px]" />
          </div>
          <div>
            <h2 className="font-mono text-lg font-bold leading-none tracking-tight">HMS</h2>
            <p className="text-[10px] tracking-wider text-primary/80 font-semibold font-mono">NEXTGEN HEALTHCARE</p>
          </div>
        </div>

        {/* Hero Message & Stats */}
        <div className="relative z-10 my-auto flex flex-col gap-8 max-w-lg">
          {/* Status Badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-900/60 px-4 py-1.5 border border-slate-800 text-xs font-medium text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            System Online · All Services Operational
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
            Advanced Intelligence <br />
            <span className="text-primary font-extrabold">for Better</span> Healthcare
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-sm leading-relaxed">
            Integrated clinical workflows, AI-powered diagnostics, and real-time patient data — unified in one secure platform.
          </p>

          {/* Core Metrics & SVG ECG Heartbeat Wave */}
          <div className="relative mt-8">
            {/* ECG Heartbeat SVG Wave - Renders behind cards */}
            <div className="absolute inset-x-0 -bottom-4 h-24 overflow-hidden pointer-events-none z-0 opacity-40">
              <svg className="w-full h-full stroke-primary" viewBox="0 0 400 100" fill="none">
                <path
                  d="M 0 60 L 80 60 L 90 55 L 98 65 L 105 60 L 140 60 L 152 20 L 165 90 L 178 60 L 210 60 L 220 55 L 228 65 L 235 60 L 280 60 L 292 20 L 305 90 L 318 60 L 400 60"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Statistics Cards */}
            <div className="relative z-10 grid grid-cols-3 gap-4">
              <div className="flex flex-col justify-center rounded-hms-lg border border-slate-800 bg-[#0F1D36]/80 p-4 backdrop-blur-md transition-all duration-300 hover:translate-y-[-4px] hover:border-primary/50 hover:bg-[#122442]/80">
                <span className="text-xl font-bold text-white tracking-tight">48,231</span>
                <span className="text-[11px] font-medium text-slate-400 mt-1">Patient Records</span>
              </div>
              <div className="flex flex-col justify-center rounded-hms-lg border border-slate-800 bg-[#0F1D36]/80 p-4 backdrop-blur-md transition-all duration-300 hover:translate-y-[-4px] hover:border-primary/50 hover:bg-[#122442]/80">
                <span className="text-xl font-bold text-white tracking-tight">99.97%</span>
                <span className="text-[11px] font-medium text-slate-400 mt-1">Uptime SLA</span>
              </div>
              <div className="flex flex-col justify-center rounded-hms-lg border border-slate-800 bg-[#0F1D36]/80 p-4 backdrop-blur-md transition-all duration-300 hover:translate-y-[-4px] hover:border-primary/50 hover:bg-[#122442]/80">
                <span className="text-xl font-bold text-white tracking-tight">ISO 27001</span>
                <span className="text-[11px] font-medium text-slate-400 mt-1">Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Left) */}
        <div className="relative z-10 text-xs text-slate-500 font-medium">
          © 2026 HMS — NextGen Healthcare Ecosystem. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANE - INTERACTIVE LOGIN FORM */}
      <div className="flex w-full flex-col justify-between bg-white px-6 py-12 sm:px-12 md:px-20 lg:w-1/2">
        {/* Small Brand Header for Mobile views */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-hms bg-primary">
            <Plus className="h-5 w-5 text-white stroke-[3px]" />
          </div>
          <span className="font-mono text-md font-bold text-neutral-900 leading-none">HMS NextGen</span>
        </div>

        {/* Centered Login Content Container */}
        <div className="my-auto mx-auto w-full max-w-[420px] py-8">
        
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight sm:text-3xl">
                  Staff Portal Access
                </h1>
                <p className="text-sm text-neutral-500 mt-2">
                  Please select your department to login.
                </p>
              </div>

              {/* Segmented Control / Department Tabs */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Department
                </span>
                
                <div className="grid grid-cols-3 rounded-hms border border-slate-200 bg-slate-50 p-1">
                  {/* Tab 1: Clinical */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDept("clinical");
                      setError(null);
                    }}
                    className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-hms transition-all ${
                      activeDept === "clinical"
                        ? "bg-primary text-white shadow-sm shadow-primary/10"
                        : "text-neutral-500 hover:bg-slate-100 hover:text-neutral-900"
                    }`}
                  >
                    <Activity className={`h-4 w-4 ${activeDept === "clinical" ? "text-white" : "text-slate-400"}`} />
                    <span className="text-xs font-bold leading-none">Clinical</span>
                    <span className={`text-[9px] ${activeDept === "clinical" ? "text-sky-100/90" : "text-slate-400"}`}>Doctor / Staff</span>
                  </button>

                  {/* Tab 2: Research */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDept("research");
                      setError(null);
                    }}
                    className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-hms transition-all ${
                      activeDept === "research"
                        ? "bg-primary text-white shadow-sm shadow-primary/10"
                        : "text-neutral-500 hover:bg-slate-100 hover:text-neutral-900"
                    }`}
                  >
                    <FlaskConical className={`h-4 w-4 ${activeDept === "research" ? "text-white" : "text-slate-400"}`} />
                    <span className="text-xs font-bold leading-none">Research</span>
                    <span className={`text-[9px] ${activeDept === "research" ? "text-sky-100/90" : "text-slate-400"}`}>Lab / Science</span>
                  </button>

                  {/* Tab 3: Administration */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDept("administration");
                      setError(null);
                    }}
                    className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-hms transition-all ${
                      activeDept === "administration"
                        ? "bg-primary text-white shadow-sm shadow-primary/10"
                        : "text-neutral-500 hover:bg-slate-100 hover:text-neutral-900"
                    }`}
                  >
                    <LayoutDashboard className={`h-4 w-4 ${activeDept === "administration" ? "text-white" : "text-slate-400"}`} />
                    <span className="text-xs font-bold leading-none">Administration</span>
                    <span className={`text-[9px] ${activeDept === "administration" ? "text-sky-100/90" : "text-slate-400"}`}>Management</span>
                  </button>
                </div>
              </div>

              {/* Form Fields container */}
              <div className="flex flex-col gap-4">
                {/* Username / Staff ID Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone-number" className="text-xs font-bold text-neutral-900">
                    Phonenumber
                  </label>
                  <input
                    id="phone-number"
                    type="text"
                    disabled={loading}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={DEPARTMENTS[activeDept].placeholder}
                    className={`w-full h-11 px-3.5 rounded-hms text-sm bg-slate-50 border text-neutral-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 ${
                      error && !DEPARTMENTS[activeDept].pattern.test(username.trim())
                        ? "border-critical ring-2 ring-critical/10"
                        : "border-slate-200 focus:border-primary"
                    }`}
                  />
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-xs font-bold text-neutral-900">
                      Password
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Password recovery coordinates must be handled by hospital IT operations.");
                      }}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      disabled={loading}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter your password"
                      className={`w-full h-11 pl-3.5 pr-10 rounded-hms text-sm bg-slate-50 border text-neutral-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 ${
                        error && password.length < 6
                          ? "border-critical ring-2 ring-critical/10"
                          : "border-slate-200 focus:border-primary"
                      }`}
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Validation Warning Alert (Error State) */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-hms bg-critical/5 p-3 border border-critical/10 text-xs text-critical font-medium animate-[fadeIn_0.2s_ease-out]">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full h-11 items-center justify-center rounded-hms bg-primary font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/95 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>
 
        </div>

        {/* Footer (Right) */}
        <div className="flex flex-col gap-3 justify-between border-t border-slate-100 pt-6 text-[11px] font-medium text-slate-400 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-warning shrink-0" />
            <span>Authorized Personnel Only — Unauthorized access is prohibited.</span>
          </div>
          <a
            href="#support"
            onClick={(e) => {
              e.preventDefault();
              alert("Contact support at helpdesk@nextgen-hms.org or dial ext: 8899.");
            }}
            className="flex items-center gap-1.5 text-primary hover:underline self-start sm:self-auto"
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>IT Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
