import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { loginApiCall } from "@/lib/auth";

const ROLES = ["Quản trị", "Bác sĩ", "Nhân viên", "Nghiên cứu"];
const ROLE_CODES = ["ADMIN", "DOCTOR", "STAFF", "RESEARCHER"];

interface LoginFormProps {
  onForgotPassword: (phone: string, roleIndex: number) => void;
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  const router = useRouter();
  const [roleIndex, setRoleIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleForgotClick = () => {
    setError(null);
    if (!username.trim()) {
      setError("Vui lòng nhập số điện thoại trước khi chọn Quên mật khẩu.");
      return;
    }
    if (!/^(\+?84|0)\d{9}$/.test(username.replace(/\s/g, ""))) {
      setError("Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912345678).");
      return;
    }
    onForgotPassword(username.trim(), roleIndex);
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

  return (
    <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
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
            <button
              type="button"
              onClick={handleForgotClick}
              className="text-xs font-medium hover:underline text-[#0EA5E9] bg-transparent border-none outline-none cursor-pointer"
            >
              Quên mật khẩu?
            </button>
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
        {loading ? <Loader2 className="animate-spin h-5 w-5 text-white" /> : "Đăng nhập vào Portal"}
      </button>
    </form>
  );
}
