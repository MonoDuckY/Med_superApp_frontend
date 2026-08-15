import React, { useState } from "react";
import { KeyRound, Eye, EyeOff, Check, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { resetPasswordApiCall } from "@/lib/auth";

interface ResetFormProps {
  resetToken: string;
  phone: string;
  roleCode: string;
  onBackToLogin: (phone: string) => void;
}

export default function ResetForm({ resetToken, phone, roleCode, onBackToLogin }: ResetFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có tối thiểu 8 ký tự.");
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError("Mật khẩu mới phải chứa ít nhất 1 chữ cái và 1 chữ số.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setError("Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu mới không khớp.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApiCall({
        resetToken,
        newPassword,
        confirmPassword,
      });
      alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      onBackToLogin(phone);
    } catch (err: any) {
      setError(err.message || "Đặt lại mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
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

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 border border-red-100 text-xs text-red-600 font-medium">
          <AlertCircle size={16} className="mt-0.5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Reset Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full font-bold text-sm text-white rounded-lg transition-all cursor-pointer hover:opacity-90 active:scale-[0.99] border-none bg-[#0EA5E9] flex items-center justify-center"
        style={{ height: 44, boxShadow: "0 2px 8px rgba(14,165,233,0.35)", marginTop: 4 }}
      >
        {loading ? <Loader2 className="animate-spin h-5 w-5 text-white" /> : "Cập nhật mật khẩu"}
      </button>

      <button
        type="button"
        onClick={() => onBackToLogin(phone)}
        className="flex w-full h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition-all bg-white cursor-pointer"
      >
        <ArrowLeft size={13} /> Quay lại Đăng nhập
      </button>
    </form>
  );
}
