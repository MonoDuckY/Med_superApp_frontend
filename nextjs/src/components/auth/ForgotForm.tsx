import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { requestForgotPasswordApiCall, verifyForgotPasswordOtpApiCall } from "@/lib/auth";

const ROLE_CODES = ["ADMIN", "DOCTOR", "STAFF", "RESEARCHER"];

interface ForgotFormProps {
  initialPhone: string;
  initialRoleIndex: number;
  onBack: () => void;
  onSuccess: (token: string, phone: string, roleCode: string) => void;
}

export default function ForgotForm({ initialPhone, initialRoleIndex, onBack, onSuccess }: ForgotFormProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [roleIndex, setRoleIndex] = useState(initialRoleIndex);
  
  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Automatically trigger code request if phone is provided
    if (initialPhone && !otpSent) {
      handleRequestOtp();
    }
  }, [initialPhone]);

  useEffect(() => {
    if (!otpSent) return;
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleRequestOtp = async () => {
    setError(null);
    if (!phone.trim()) {
      setError("Số điện thoại là bắt buộc.");
      return;
    }
    if (!/^(\+?84|0)\d{9}$/.test(phone.replace(/\s/g, ""))) {
      setError("Số điện thoại không đúng định dạng Việt Nam.");
      return;
    }

    setLoading(true);
    try {
      const selectedRole = ROLE_CODES[roleIndex];
      await requestForgotPasswordApiCall(phone.trim(), selectedRole);
      setOtpSent(true);
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || "Không thể gửi mã OTP khôi phục mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Vui lòng nhập đầy đủ mã OTP 6 chữ số.");
      return;
    }

    setLoading(true);
    try {
      const selectedRole = ROLE_CODES[roleIndex];
      const data = await verifyForgotPasswordOtpApiCall(phone.trim(), otpCode, selectedRole);
      onSuccess(data.resetToken, phone.trim(), selectedRole);
    } catch (err: any) {
      setError(err.message || "Xác minh mã OTP thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center gap-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] px-3.5 py-2 text-[#1D4ED8] text-xs font-semibold">
        <MessageSquare className="h-4.5 w-4.5 shrink-0 text-[#0EA5E9]" />
        <span className="uppercase tracking-wider">Xác minh bảo mật</span>
      </div>

      <div>
        <h2 className="font-bold text-neutral-900 text-2xl tracking-tight">
          Nhập mã xác minh
        </h2>
        <p className="mt-2 text-xs text-[#64748B] leading-relaxed">
          Mã xác minh OTP đã được gửi đến số điện thoại <strong className="text-neutral-900">{phone}</strong>.
        </p>
      </div>

      {/* OTP Input Fields */}
      <div className="flex justify-between gap-2.5 my-2">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, idx)}
            onKeyDown={(e) => handleOtpKeyDown(e, idx)}
            ref={(el) => { otpRefs.current[idx] = el; }}
            className="w-12 h-12 text-center text-lg font-bold border border-[#E2E8F0] rounded-xl outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white text-neutral-900"
          />
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 border border-red-100 text-xs text-red-600 font-medium">
          <AlertCircle size={16} className="mt-0.5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Verify Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full font-bold text-sm text-white rounded-lg transition-all cursor-pointer hover:opacity-90 active:scale-[0.99] border-none bg-[#0EA5E9] flex items-center justify-center"
        style={{ height: 44, boxShadow: "0 2px 8px rgba(14,165,233,0.35)", marginTop: 4 }}
      >
        {loading ? <Loader2 className="animate-spin h-5 w-5 text-white" /> : "Xác nhận mã xác minh"}
      </button>

      {/* Resend status */}
      <div className="text-center">
        {timer > 0 ? (
          <p className="text-xs text-slate-400 font-medium">
            Gửi lại mã OTP sau <strong className="text-neutral-900">{timer}s</strong>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleRequestOtp}
            className="text-xs text-[#0EA5E9] font-bold hover:underline bg-transparent border-none outline-none cursor-pointer"
          >
            Gửi lại mã xác minh OTP
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="flex w-full h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition-all bg-white cursor-pointer"
      >
        <ArrowLeft size={13} /> Thay đổi Số điện thoại
      </button>
    </form>
  );
}
