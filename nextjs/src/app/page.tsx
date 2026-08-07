"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  EyeOff, 
  Plus, 
  Loader2, 
  Lock, 
  Check, 
  Headphones, 
  AlertCircle, 
  KeyRound, 
  ArrowLeft 
} from "lucide-react";

import { 
  loginApiCall, 
  requestForgotPasswordApiCall, 
  resetPasswordApiCall, 
  verifyForgotPasswordOtpApiCall 
} from "@/lib/auth";

/* ─── ECG wave SVG ───────────────────────────────────────────────────────────── */
function EcgWave() {
  return (
    <svg
      viewBox="0 0 700 80"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.18 }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polyline
        filter="url(#glow)"
        stroke="#0EA5E9"
        strokeWidth="2"
        fill="none"
        points="
          0,40 60,40 70,40 80,15 90,65 100,40 110,40
          170,40 180,40 190,8  200,72 210,40 220,40
          280,40 290,40 300,15 310,65 320,40 330,40
          390,40 400,40 410,8  420,72 430,40 440,40
          500,40 510,40 520,15 530,65 540,40 550,40
          610,40 620,40 630,8  640,72 650,40 700,40
        "
      />
    </svg>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────────────── */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="flex-1 rounded-xl px-5 py-4 flex flex-col gap-1"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(8px)",
      }}
    >
      <p className="font-bold text-white text-base tracking-tight">{value}</p>
      <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">{label}</p>
    </div>
  );
}

/* ─── Left branding panel ────────────────────────────────────────────────────── */
function BrandPanel() {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-between overflow-hidden w-1/2 bg-[#0C1A2E]"
      style={{ padding: "40px 48px" }}
    >
      {/* Ambient glow */}
      <div className="absolute pointer-events-none" style={{
        width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
        top: -100, left: -100,
      }} />
      <div className="absolute pointer-events-none" style={{
        width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
        bottom: 80, right: -80,
      }} />

      {/* Top: logo + status */}
      <div className="relative z-10 flex flex-col gap-5">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-lg shrink-0 w-9 h-9 bg-[#0EA5E9]"
            style={{ boxShadow: "0 0 16px rgba(14,165,233,0.4)" }}
          >
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white leading-none text-sm">HMS</p>
            <p className="leading-none mt-1 tracking-widest font-semibold text-[10px] text-[#475569]">NEXTGEN HEALTHCARE</p>
          </div>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-500">Hệ thống Trực tuyến — Hoạt động ổn định</span>
        </div>
      </div>

      {/* Center: hero copy */}
      <div className="relative z-10 flex flex-col gap-8">
        <div>
          <h1 className="font-bold leading-tight text-white text-4xl">
            Trí Tuệ Nhân Tạo<br />
            cho Y Tế{" "}
            <span className="text-[#0EA5E9]">Tốt Hơn</span>
          </h1>
          <p className="mt-4 leading-relaxed text-sm text-[#64748B] max-w-[480px]">
            Tích hợp quy trình lâm sàng, chẩn đoán bằng AI và hợp nhất dữ liệu bệnh nhân
            thời gian thực trên một nền tảng an toàn.
          </p>
        </div>

        {/* Stat cards with ECG background */}
        <div className="relative rounded-2xl overflow-hidden h-24">
          <EcgWave />
          <div className="absolute inset-0 flex gap-3 p-3 z-10">
            <StatCard value="48,231"   label="Hồ sơ Bệnh nhân" />
            <StatCard value="99.97%"   label="Thời gian Hoạt động" />
            <StatCard value="ISO 27001" label="Đạt chuẩn Bảo mật" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 text-xs text-[#475569]">
        © 2026 HMS — Hệ sinh thái Y tế NextGen. Bảo lưu mọi quyền.
      </p>
    </div>
  );
}

const ROLES = ["Quản trị", "Bác sĩ", "Nhân viên", "Nghiên cứu"];
const ROLE_CODES = ["ADMIN", "DOCTOR", "STAFF", "RESEARCHER"];

export default function LoginPage() {
  const router = useRouter();
  const [roleIndex, setRoleIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Forgot password flow
  const [view, setView] = useState<"login" | "forgot-verify" | "forgot-reset">("login");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(61);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotRole, setForgotRole] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const roles = parsedUser.roles || (parsedUser.role ? [parsedUser.role] : []);
        const upperRoles = roles.map((r: string) => r.toUpperCase());
        
        if (upperRoles.includes("ADMIN")) {
          router.replace("/user-management/create-user");
          return;
        } else if (upperRoles.includes("DOCTOR")) {
          router.replace("/doctor");
          return;
        } else if (upperRoles.includes("STAFF")) {
          router.replace("/staff");
          return;
        } else if (upperRoles.includes("RESEARCHER")) {
          router.replace("/researcher");
          return;
        }
      } catch (e) {
        console.error("Error parsing saved user from session", e);
      }
    }
    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (view === "forgot-verify") {
      setTimer(61);
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Số điện thoại là bắt buộc.");
      return;
    }
    if (!/^(\+?84|0)\d{9}$/.test(username.replace(/\s/g, ""))) {
      setError("Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912345678).");
      return;
    }
    if (!password.trim()) {
      setError("Mật khẩu là bắt buộc.");
      return;
    }

    setLoading(true);
    try {
      const selectedRole = ROLE_CODES[roleIndex];
      const data = await loginApiCall(username.trim(), password, selectedRole);

      if (data.accessToken) {
        localStorage.setItem("authToken", data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      const upperRole = selectedRole.toUpperCase();
      if (upperRole === "ADMIN") {
        router.push("/user-management/create-user");
      } else if (upperRole === "DOCTOR") {
        router.push("/doctor");
      } else if (upperRole === "STAFF") {
        router.push("/staff");
      } else if (upperRole === "RESEARCHER") {
        router.push("/researcher");
      } else {
        router.push("/user-management/create-user");
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

  const handleForgotPasswordRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setForgotError(null);

    if (!username.trim()) {
      setError("Vui lòng nhập số điện thoại vào ô Số điện thoại trước.");
      return;
    }
    if (!/^(\+?84|0)\d{9}$/.test(username.replace(/\s/g, ""))) {
      setError("Vui lòng nhập số điện thoại hợp lệ ở trên trước khi yêu cầu cấp lại mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const selectedRole = ROLE_CODES[roleIndex];
      await requestForgotPasswordApiCall(username.trim(), selectedRole);
      setForgotPhone(username.trim());
      setForgotRole(selectedRole);
      setForgotError(null);
      setTimer(60);
      setView("forgot-verify");
    } catch (err) {
      const errorVal = err as Error;
      setError(errorVal.message || "Không thể gửi mã OTP khôi phục mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setForgotError(null);
    setForgotLoading(true);
    try {
      await requestForgotPasswordApiCall(forgotPhone, forgotRole);
      setTimer(60);
      alert("Đã gửi lại mã OTP mới đến số điện thoại của bạn.");
    } catch (err) {
      const errorVal = err as Error;
      setForgotError(errorVal.message || "Gửi lại OTP thất bại.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setForgotError(null);
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setForgotError("Vui lòng nhập đầy đủ mã OTP 6 chữ số.");
      return;
    }

    setForgotLoading(true);
    try {
      const data = await verifyForgotPasswordOtpApiCall(forgotPhone, otpCode, forgotRole);
      setResetToken(data.resetToken);
      setView("forgot-reset");
    } catch (err) {
      const errorVal = err as Error;
      setForgotError(errorVal.message || "Xác minh mã OTP thất bại.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (newPassword.length < 8) {
      setForgotError("Mật khẩu mới phải có tối thiểu 8 ký tự.");
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setForgotError("Mật khẩu mới phải chứa ít nhất 1 chữ cái và 1 chữ số.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setForgotError("Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("Xác nhận mật khẩu mới không khớp.");
      return;
    }

    setForgotLoading(true);
    try {
      await resetPasswordApiCall({
        resetToken,
        newPassword,
        confirmPassword,
      });
      alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      setUsername(forgotPhone);
      setPassword("");
      setForgotPhone("");
      setResetToken("");
      setOtp(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      setView("login");
    } catch (err) {
      const errorVal = err as Error;
      setForgotError(errorVal.message || "Đặt lại mật khẩu thất bại.");
    } finally {
      setForgotLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0C1A2E] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin h-8 w-8 text-[#0EA5E9]" />
        <p className="text-slate-400 text-xs font-medium">Đang xác thực phiên đăng nhập bảo mật...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <BrandPanel />

      {/* ─── Right Auth Panel ─── */}
      <div className="flex flex-col items-center justify-between w-full lg:w-1/2 p-6 md:p-12 overflow-y-auto bg-white">
        
        {/* Mobile Header */}
        <div className="flex items-center gap-2 lg:hidden w-full max-w-[420px] self-center">
          <div className="flex w-8 h-8 items-center justify-center rounded-lg bg-[#0EA5E9]">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-neutral-900 leading-none">HMS NextGen</span>
        </div>

        {/* Form area */}
        <div className="my-auto mx-auto w-full max-w-[420px] py-8">
          
          {view === "login" && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
              
              {/* Heading */}
              <div>
                <h2 className="font-bold text-neutral-900 text-2xl tracking-tight">
                  Đăng Nhập Hệ Thống
                </h2>
                <p className="mt-2 text-xs text-[#64748B] leading-relaxed">
                  Vui lòng chọn vai trò công tác và điền thông tin để truy cập.
                </p>
              </div>

              {/* Role segmented control */}
              <div className="flex gap-1 p-1 rounded-xl bg-[#F1F5F9]">
                {ROLES.map((r, i) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRoleIndex(i)}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer border-none bg-transparent"
                    style={i === roleIndex
                      ? { background: "white", color: "#0EA5E9", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                      : { color: "#64748B" }}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-4">
                {/* Phone */}
                <div>
                  <label htmlFor="phone-number" className="block text-xs font-semibold mb-1.5 text-[#0F172A]">
                    Số điện thoại
                  </label>
                  <input
                    id="phone-number"
                    type="tel"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); if (error) setError(null); }}
                    placeholder="ví dụ: 0912345678"
                    className="w-full px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all bg-white"
                    style={{ height: 40 }}
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="text-xs font-semibold text-[#0F172A]">Mật khẩu</label>
                    <a href="#forgot" onClick={handleForgotPasswordRequest} className="text-xs font-medium hover:underline text-[#0EA5E9]">
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                      placeholder="Nhập mật khẩu..."
                      className="w-full pl-3 pr-10 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all bg-white"
                      style={{ height: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-none outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 border border-red-100 text-xs text-red-600 font-medium animate-[fadeIn_0.2s_ease-out]">
                  <AlertCircle size={16} className="mt-0.5 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full font-bold text-sm text-white rounded-lg transition-all cursor-pointer hover:opacity-90 active:scale-[0.99] border-none bg-[#0EA5E9] flex items-center justify-center"
                style={{ height: 44, boxShadow: "0 2px 8px rgba(14,165,233,0.35)", marginTop: 4 }}
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 text-white" /> : "Đăng nhập"}
              </button>

            </form>
          )}

          {view === "forgot-verify" && (
            <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
              <div>
                <h2 className="font-bold text-neutral-900 text-2xl tracking-tight">
                  Quên mật khẩu
                </h2>
                <p className="mt-2 text-xs text-[#64748B] leading-relaxed">
                  Để đảm bảo an toàn, chúng tôi đã gửi mã xác minh gồm 6 chữ số đến số điện thoại đã đăng ký của bạn <span className="font-semibold text-neutral-900">{forgotPhone}</span>
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

              {/* OTP Error alert */}
              {forgotError && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 border border-red-100 text-xs text-red-600 font-medium animate-[fadeIn_0.2s_ease-out]">
                  <AlertCircle size={16} className="mt-0.5 text-red-500 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {/* Verify OTP Button */}
              <button
                type="button"
                disabled={forgotLoading}
                onClick={handleVerifyOtp}
                className="w-full font-bold text-sm text-white rounded-lg transition-all cursor-pointer hover:opacity-90 active:scale-[0.99] border-none bg-[#0EA5E9] flex items-center justify-center"
                style={{ height: 44, boxShadow: "0 2px 8px rgba(14,165,233,0.35)", marginTop: 4 }}
              >
                {forgotLoading ? <Loader2 className="animate-spin h-5 w-5 text-white" /> : "Xác minh mã"}
              </button>

              {/* Timer / Resend */}
              <div className="text-center text-xs">
                {timer > 0 ? (
                  <p className="text-[#64748B]">
                    Gửi lại mã sau <span className="font-semibold text-neutral-900">{`00:${timer.toString().padStart(2, "0")}`}</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    disabled={forgotLoading}
                    onClick={handleResendOtp}
                    className="text-xs font-semibold text-[#0EA5E9] hover:underline cursor-pointer border-none bg-transparent outline-none"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
                <p className="text-[10px] text-[#94A3B8] mt-2 leading-relaxed">
                  Bạn không nhận được mã? Hãy kiểm tra Hộp thư SMS hoặc liên hệ bộ phận hỗ trợ IT.
                </p>
              </div>

              {/* Separator */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-100" />
                <span className="flex-shrink mx-4 text-[9px] text-slate-300 font-semibold tracking-wider uppercase">Hoặc</span>
                <div className="flex-grow border-t border-slate-100" />
              </div>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => setView("login")}
                className="flex w-full h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition-all bg-white cursor-pointer"
              >
                <ArrowLeft size={13} /> Quay lại Đăng nhập
              </button>
            </div>
          )}

          {view === "forgot-reset" && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
              
              {/* Badge info */}
              <div className="flex items-center gap-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] px-3.5 py-2 text-[#1D4ED8] text-xs font-semibold">
                <KeyRound className="h-4.5 w-4.5 shrink-0 text-[#0EA5E9]" />
                <span className="uppercase tracking-wider">Đặt lại mật khẩu</span>
              </div>

              <div>
                <h2 className="font-bold text-neutral-900 text-2xl tracking-tight">
                  Đặt mật khẩu mới
                </h2>
                <p className="mt-2 text-xs text-[#64748B] leading-relaxed">
                  Mật khẩu mới phải khác với các mật khẩu đã sử dụng trước đó.
                </p>
              </div>

              <div className="flex flex-col gap-4 text-left">
                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="block text-xs font-semibold mb-1.5 text-[#0F172A]">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới của bạn"
                      className="w-full pl-3 pr-10 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all bg-white"
                      style={{ height: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-none outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Criteria checklist */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-2.5 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    {newPassword.length >= 8 ? (
                      <div className="w-4 h-4 rounded-full bg-[#10B981]/15 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-[#10B981]" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-white shrink-0" />
                    )}
                    <span className={newPassword.length >= 8 ? "text-neutral-900 font-semibold" : ""}>Tối thiểu 8 ký tự</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword) ? (
                      <div className="w-4 h-4 rounded-full bg-[#10B981]/15 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-[#10B981]" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-white shrink-0" />
                    )}
                    <span className={/[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword) ? "text-neutral-900 font-semibold" : ""}>Chứa ít nhất 1 chữ cái và 1 chữ số</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? (
                      <div className="w-4 h-4 rounded-full bg-[#10B981]/15 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-[#10B981]" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-white shrink-0" />
                    )}
                    <span className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-neutral-900 font-semibold" : ""}>Chứa ít nhất 1 ký tự đặc biệt (@#$%^&*)</span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-semibold mb-1.5 text-[#0F172A]">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full pl-3 pr-10 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all bg-white"
                      style={{ height: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-none outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Reset password Error Alert */}
              {forgotError && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 border border-red-100 text-xs text-red-600 font-medium animate-[fadeIn_0.2s_ease-out]">
                  <AlertCircle size={16} className="mt-0.5 text-red-500 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {/* Submit Reset Button */}
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full font-bold text-sm text-white rounded-lg transition-all cursor-pointer hover:opacity-90 active:scale-[0.99] border-none bg-[#0EA5E9] flex items-center justify-center"
                style={{ height: 44, boxShadow: "0 2px 8px rgba(14,165,233,0.35)", marginTop: 4 }}
              >
                {forgotLoading ? <Loader2 className="animate-spin h-5 w-5 text-white" /> : "Cập nhật mật khẩu"}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => setView("login")}
                className="flex w-full h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition-all bg-white cursor-pointer"
              >
                <ArrowLeft size={13} /> Quay lại Đăng nhập
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 justify-between border-t border-slate-100 pt-6 text-[11px] font-medium text-slate-400 sm:flex-row sm:items-center w-full max-w-[420px] self-center">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <p className="leading-snug text-slate-400 max-w-[280px]">
              Chỉ dành cho nhân viên được ủy quyền — Nghiêm cấm mọi truy cập trái phép.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => alert("Liên hệ hỗ trợ qua helpdesk@nextgen-hms.org hoặc gọi số máy lẻ nội bộ: 8899.")}
            className="flex items-center gap-1.5 shrink-0 hover:opacity-70 transition-opacity cursor-pointer border-none bg-transparent outline-none"
          >
            <Headphones className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-semibold">Hỗ trợ kỹ thuật</span>
          </button>
        </div>

      </div>

    </div>
  );
}
