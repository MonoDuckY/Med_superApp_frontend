"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateLoginForm } from "@/lib/validation";
import { loginApiCall } from "@/lib/auth";
import { 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Headphones,
  Plus,
  Loader2,
  Shield,
  ArrowLeft,
  KeyRound,
  Lock,
  Check,
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

  // Forgot Password Flow States
  const [view, setView] = useState<"login" | "forgot-verify" | "forgot-reset">("login");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(31);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (view === "forgot-verify") {
      setTimer(31);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } else if (view === "forgot-reset") {
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [view]);

  useEffect(() => {
    if (view !== "forgot-verify") return;
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [view, timer]);

  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[idx] = digit;
    setOtp(newOtp);

    if (digit !== "" && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      if (otp[idx] === "" && idx > 0) {
        const newOtp = [...otp];
        newOtp[idx - 1] = "";
        setOtp(newOtp);
        otpRefs.current[idx - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
      }
    }
  };

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

          {view !== "login" && (
            <div className="flex gap-4.5 rounded-hms-lg border border-primary/20 bg-primary/5 p-4.5 backdrop-blur-md animate-[fadeIn_0.25s_ease-out] mt-2">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[12px] font-bold text-white tracking-wide">Xác thực Hai Yếu tố (2FA)</span>
                <span className="text-[11px] leading-relaxed text-slate-300">
                  Tài khoản của bạn được bảo vệ bằng 2 lớp bảo mật. Mã xác thực OTP gửi qua SMS sẽ hết hạn sau 5 phút và chỉ sử dụng được 1 lần.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer (Left) */}
        <div className="relative z-10 text-xs text-slate-500 font-medium">
          © 2026 HMS — Hệ sinh thái Chăm sóc Sức khỏe NextGen. Bảo lưu mọi quyền.
        </div>
      </div>

      {/* RIGHT PANE - INTERACTIVE LOGIN FORM */}
      <div className="flex w-full flex-col justify-between bg-white px-6 py-12 sm:px-12 md:px-20 lg:w-1/2 overflow-y-auto">
        {/* Small Brand Header for Mobile views */}
        <div className="flex items-center gap-2 lg:hidden mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-hms bg-primary">
            <Plus className="h-5 w-5 text-white stroke-[3px]" />
          </div>
          <span className="font-mono text-md font-bold text-neutral-900 leading-none">HMS NextGen</span>
        </div>

        {/* Top Header progress indicator & secure SLA (Only shown for Forgot Password flow) */}
        {view !== "login" && (
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              {/* Step 1: Request */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#10B981]">
                <div className="w-4 h-4 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-[#10B981]" strokeWidth={3} />
                </div>
                <span>Yêu cầu</span>
              </div>
              <div className="w-6 h-px bg-slate-200" />
              {/* Step 2: Verify */}
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                view === "forgot-verify" ? "text-[#0EA5E9]" : "text-[#10B981]"
              }`}>
                {view === "forgot-verify" ? (
                  <div className="w-4 h-4 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white text-[9px] font-bold">2</div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-[#10B981]" strokeWidth={3} />
                  </div>
                )}
                <span>Xác minh</span>
              </div>
              <div className="w-6 h-px bg-slate-200" />
              {/* Step 3: Reset */}
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                view === "forgot-reset" ? "text-[#0EA5E9]" : "text-slate-400"
              }`}>
                {view === "forgot-reset" ? (
                  <div className="w-4 h-4 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white text-[9px] font-bold">3</div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 text-[9px] font-bold">3</div>
                )}
                <span>Đặt lại</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Bảo mật · TLS 1.3</span>
            </div>
          </div>
        )}

        {/* Centered Content Container */}
        <div className="my-auto mx-auto w-full max-w-[420px] py-8">
          {view === "login" && (
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
                {/* Username / Phone Input */}
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
                        setView("forgot-verify");
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
          )}

          {view === "forgot-verify" && (
            <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
             

              <div className="text-left">
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight sm:text-3xl">
                  Quên mật khẩu
                </h1>
                <p className="text-[#64748B] text-xs mt-2 leading-relaxed">
                  Để đảm bảo an toàn, chúng tôi đã gửi mã xác minh gồm 6 chữ số đến số điện thoại đã đăng ký của bạn <span className="font-semibold text-neutral-900">+84 ••• ••• 5678</span>
                </p>
              </div>

              {/* 6-Digit OTP Inputs */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className="w-11 h-12 text-center text-md font-bold text-neutral-900 bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-[#94A3B8] text-center mt-1">Nhập mã số được gửi đến số điện thoại của bạn</p>
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => setView("forgot-reset")}
                className="flex w-full h-11 items-center justify-center rounded-hms bg-[#0EA5E9] font-semibold text-white shadow-md shadow-sky-100 transition-all hover:bg-[#0284C7] active:scale-[0.98] focus:outline-none"
              >
                Xác minh mã
              </button>

              {/* Timer / Resend */}
              <div className="text-center text-xs">
                <p className="text-[#64748B]">
                  Gửi lại mã sau <span className="font-semibold text-neutral-900">{`00:${timer.toString().padStart(2, "0")}`}</span>
                </p>
                <p className="text-[10px] text-[#94A3B8] mt-1.5 leading-relaxed">
                  Bạn không nhận được mã? Hãy kiểm tra Hộp thư SMS hoặc liên hệ bộ phận hỗ trợ IT.
                </p>
              </div>

              {/* OR Separator */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-[9px] text-slate-300 font-semibold tracking-wider uppercase">Hoặc</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => setView("login")}
                className="flex w-full h-11 items-center justify-center gap-2 rounded-hms border border-slate-200 text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition-all"
              >
                <ArrowLeft size={13} /> Quay lại Đăng nhập
              </button>
            </div>
          )}

          {view === "forgot-reset" && (
            <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
              {/* Key Notice Badge */}
              <div className="flex items-center gap-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] px-3.5 py-2 text-[#1D4ED8] text-xs font-semibold">
                <KeyRound className="h-4.5 w-4.5 shrink-0 text-primary" />
                <span className="uppercase tracking-wider">Khôi phục mật khẩu · Bước 3/3 · Đặt lại</span>
              </div>

              <div className="text-left">
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight sm:text-3xl">
                  Đặt mật khẩu mới
                </h1>
                <p className="text-[#64748B] text-xs mt-2 leading-relaxed">
                  Mật khẩu mới phải khác với các mật khẩu đã sử dụng trước đó.
                </p>
              </div>

              <div className="flex flex-col gap-4 text-left">
                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-password" className="text-xs font-bold text-neutral-900">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới của bạn"
                      className="w-full h-11 pl-3.5 pr-10 rounded-hms text-sm bg-slate-50 border border-slate-200 text-neutral-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Criteria Grid */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-2.5 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    {newPassword.length >= 8 ? (
                      <div className="w-4 h-4 rounded-full bg-[#10B981]/15 flex items-center justify-center">
                        <Check className="h-3 w-3 text-[#10B981]" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                    )}
                    <span className={newPassword.length >= 8 ? "text-neutral-900 font-semibold" : ""}>Tối thiểu 8 ký tự</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword) ? (
                      <div className="w-4 h-4 rounded-full bg-[#10B981]/15 flex items-center justify-center">
                        <Check className="h-3 w-3 text-[#10B981]" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                    )}
                    <span className={/[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword) ? "text-neutral-900 font-semibold" : ""}>Chứa ít nhất 1 chữ cái hoặc chữ số</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? (
                      <div className="w-4 h-4 rounded-full bg-[#10B981]/15 flex items-center justify-center">
                        <Check className="h-3 w-3 text-[#10B981]" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                    )}
                    <span className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-neutral-900 font-semibold" : ""}>Chứa ít nhất 1 ký tự đặc biệt (@#$%^&*)</span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm-password" className="text-xs font-bold text-neutral-900">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full h-11 pl-3.5 pr-10 rounded-hms text-sm bg-slate-50 border border-slate-200 text-neutral-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Safety Info notice */}
                <div className="flex gap-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] p-3 text-[#166534] text-[10px] leading-relaxed">
                  <Lock className="h-4 w-4 shrink-0 text-[#22C55E] mt-0.5" />
                  <span>
                    Sau khi cập nhật thành công, bạn sẽ bị đăng xuất khỏi tất cả các thiết bị khác đang hoạt động. Vui lòng đăng nhập lại bằng mật khẩu mới của bạn.
                  </span>
                </div>
              </div>

              {/* Submit / Save Password */}
              <button
                type="button"
                onClick={() => {
                  alert("Mật khẩu của bạn đã được cập nhật thành công!");
                  setView("login");
                }}
                className="flex w-full h-11 items-center justify-center rounded-hms bg-[#0EA5E9] font-semibold text-white shadow-md shadow-sky-100 hover:bg-[#0284C7] active:scale-[0.98] transition-all"
              >
                Cập nhật mật khẩu
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => setView("login")}
                className="flex w-full h-11 items-center justify-center gap-2 rounded-hms border border-slate-200 text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition-all"
              >
                <ArrowLeft size={13} /> Quay lại Đăng nhập
              </button>
            </div>
          )}
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
