"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateLoginForm } from "@/lib/validation";
import { loginApiCall } from "@/lib/auth";
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
    name: "Lâm sàng",
    subtext: "Bác sĩ / Nhân viên",
    placeholder: "ví dụ: 0912345678",
    pattern: /^(\+84|0)\d{9}$/,
    patternDescription: "Số điện thoại lâm sàng không hợp lệ (phải bắt đầu bằng 0 hoặc +84 và gồm 9 chữ số tiếp theo).",
  },
  research: {
    id: "research",
    name: "Nghiên cứu",
    subtext: "Phòng Lab / Khoa học",
    placeholder: "ví dụ: 0912345678",
    pattern: /^(\+84|0)\d{9}$/,
    patternDescription: "Số điện thoại nghiên cứu không hợp lệ (phải bắt đầu bằng 0 hoặc +84 và gồm 9 chữ số tiếp theo).",
  },
  administration: {
    id: "administration",
    name: "Quản trị",
    subtext: "Quản lý Hệ thống",
    placeholder: "ví dụ: 0912345678",
    pattern: /^(\+84|0)\d{9}$/,
    patternDescription: "Số điện thoại quản trị không hợp lệ (phải bắt đầu bằng 0 hoặc +84 và gồm 9 chữ số tiếp theo).",
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
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const primaryRole = parsedUser.role || (parsedUser.roles && parsedUser.roles[0]) || "";
        const upperRole = primaryRole.toUpperCase();
        if (upperRole === "ADMIN") {
          router.push("/user-management/create-user");
          return;
        } else if (upperRole === "DOCTOR") {
          router.push("/doctor");
          return;
        } else if (upperRole === "STAFF") {
          router.push("/staff");
          return;
        } else if (upperRole === "RESEARCHER") {
          router.push("/researcher");
          return;
        }
      } catch (e) {
        console.error("Error parsing saved user from session", e);
      }
    }
    setCheckingAuth(false);
  }, [router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const deptInfo = DEPARTMENTS[activeDept];
    const validationError = validateLoginForm(username, password, deptInfo.pattern, deptInfo.patternDescription);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const data = await loginApiCall(username.trim(), password);
      if (data.accessToken) {
        localStorage.setItem("authToken", data.accessToken);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      // Redirect based on role
      const primaryRole = data.user.role || (data.user.roles && data.user.roles[0]) || "";
      const upperRole = primaryRole.toUpperCase();
      if (upperRole === "ADMIN") {
        router.push("/user-management/create-user");
      } else if (upperRole === "DOCTOR") {
        router.push("/doctor");
      } else if (upperRole === "STAFF") {
        router.push("/staff");
      } else if (upperRole === "RESEARCHER") {
        router.push("/researcher");
      } else {
        router.push("/user-management/create-user"); // Admin is the default safe fallback
      }
    } catch (err) {
      const errorVal = err as Error;
      let errMsg = errorVal.message || "Không thể kết nối đến máy chủ xác thực.";
      const lowerMsg = errMsg.toLowerCase();
      if (
        lowerMsg.includes("disabled") ||
        lowerMsg.includes("inactive") ||
        lowerMsg.includes("locked")
      ) {
        errMsg = "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ Quản trị viên.";
      } else if (
        lowerMsg.includes("login failed") ||
        lowerMsg.includes("credentials") ||
        lowerMsg.includes("unauthorized") ||
        lowerMsg.includes("bad credentials")
      ) {
        errMsg = "Số điện thoại hoặc mật khẩu không chính xác.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0B1528] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#0EA5E9] h-8 w-8" />
        <p className="text-slate-400 text-xs font-medium">Đang xác thực phiên đăng nhập bảo mật...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full select-none bg-surface font-inter text-neutral-500">
      {/* LEFT PANE - CLINICAL BRANDING (Hidden on mobile, flex on web) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-[#0B1528] p-16 text-white overflow-hidden lg:flex">
        {/* Decorative Grid / Radial Blur Background Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-primary/15 via-transparent to-transparent pointer-events-none opacity-60" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Branding Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0EA5E9] flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: "0 0 16px rgba(14,165,233,0.4)" }}>
            <div className="relative w-4.5 h-4.5 flex items-center justify-center">
              <div className="absolute w-4.5 h-[5px] bg-white rounded-sm" />
              <div className="absolute w-[5px] h-4.5 bg-white rounded-sm" />
            </div>
          </div>
          <div>
            <h2 className="text-white font-bold text-[15px] leading-none tracking-wide">HMS</h2>
            <p className="text-[#38BDF8] text-[9px] mt-1 tracking-wider font-bold uppercase">NextGen Healthcare</p>
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
            Hệ thống Trực tuyến · Đang hoạt động
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
            Trí tuệ Nhân tạo <br />
            <span className="text-primary font-extrabold">Vì Sức khỏe</span> Việt
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-sm leading-relaxed">
            Quy trình lâm sàng tích hợp, chẩn đoán bằng trí tuệ nhân tạo và dữ liệu bệnh nhân thời gian thực — tất cả trên một nền tảng bảo mật.
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
                <span className="text-xl font-bold text-white tracking-tight">48.231</span>
                <span className="text-[11px] font-medium text-slate-400 mt-1">Hồ sơ Bệnh nhân</span>
              </div>
              <div className="flex flex-col justify-center rounded-hms-lg border border-slate-800 bg-[#0F1D36]/80 p-4 backdrop-blur-md transition-all duration-300 hover:translate-y-[-4px] hover:border-primary/50 hover:bg-[#122442]/80">
                <span className="text-xl font-bold text-white tracking-tight">99,97%</span>
                <span className="text-[11px] font-medium text-slate-400 mt-1">Cam kết Hoạt động</span>
              </div>
              <div className="flex flex-col justify-center rounded-hms-lg border border-slate-800 bg-[#0F1D36]/80 p-4 backdrop-blur-md transition-all duration-300 hover:translate-y-[-4px] hover:border-primary/50 hover:bg-[#122442]/80">
                <span className="text-xl font-bold text-white tracking-tight">ISO 27001</span>
                <span className="text-[11px] font-medium text-slate-400 mt-1">Đã kiểm định</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Left) */}
        <div className="relative z-10 text-xs text-slate-500 font-medium">
          © 2026 HMS — Hệ sinh thái Chăm sóc Sức khỏe NextGen. Bảo lưu mọi quyền.
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
                  Cổng Đăng Nhập Nhân Viên
                </h1>
                <p className="text-[#64748B] text-xs mt-1">
                  Vui lòng chọn phân hệ và nhập số điện thoại để tiếp tục.
                </p>
              </div>
            
              {/* Form Fields container */}
              <div className="flex flex-col gap-4">
                {/* Username / Staff ID Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone-number" className="text-xs font-bold text-neutral-900">
                    Số điện thoại
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
                      Mật khẩu
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Yêu cầu khôi phục mật khẩu cần được liên hệ và xử lý bởi bộ phận IT bệnh viện.");
                      }}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Quên mật khẩu?
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
                      placeholder="Nhập mật khẩu của bạn"
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
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
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
                    Đang đăng nhập...
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>
 
        </div>

        {/* Footer (Right) */}
        <div className="flex flex-col gap-3 justify-between border-t border-slate-100 pt-6 text-[11px] font-medium text-slate-400 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-warning shrink-0" />
            <span>Chỉ dành cho nhân sự được ủy quyền — Nghiêm cấm truy cập trái phép.</span>
          </div>
          <a
            href="#support"
            onClick={(e) => {
              e.preventDefault();
              alert("Liên hệ hỗ trợ qua helpdesk@nextgen-hms.org hoặc gọi số máy lẻ nội bộ: 8899.");
            }}
            className="flex items-center gap-1.5 text-primary hover:underline self-start sm:self-auto"
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>Hỗ trợ kỹ thuật (IT)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
