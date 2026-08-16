import React, { useState } from "react";
import { fetchWithAuth } from "@/lib/auth";
import { Ico, ic } from "@/components/common/Icons";

function StrengthBar({ strength }: { strength: number }) {
  const colors = ["#EF4444", "#F59E0B", "#F59E0B", "#10B981", "#10B981"];
  const labels = ["", "Rất yếu", "Yếu", "Trung bình", "Mạnh"];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all"
            style={{ background: i < strength ? (colors[strength] ?? "#E2E8F0") : "#E2E8F0" }} />
        ))}
      </div>
      {strength > 0 && (
        <p className="text-xs mt-1.5 font-medium" style={{ color: colors[strength] }}>
          {labels[strength]}. Độ dài tối thiểu 6 ký tự.
        </p>
      )}
    </div>
  );
}

function PwField({ label, placeholder, value, onChange, showStrength }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; showStrength?: boolean
}) {
  const [show, setShow] = useState(false);

  const strength = value.length === 0 ? 0
    : value.length < 4 ? 1
    : value.length < 6 ? 2
    : value.length < 10 ? 3 : 4;

  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
        {label} <span className="text-rose-500">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-3 pr-10 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all bg-white"
          style={{ height: 36 }}
        />
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent">
          <Ico d={show ? ic.eyeOff : ic.eye} cls="w-4 h-4" />
        </button>
      </div>
      {showStrength && <StrengthBar strength={strength} />}
    </div>
  );
}

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!current || !next || !confirm) {
      alert("Vui lòng điền đầy đủ các thông tin.");
      return;
    }
    if (next !== confirm) {
      alert("Mật khẩu mới và Xác nhận mật khẩu mới không trùng khớp.");
      return;
    }
    
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: next,
          confirmPassword: confirm,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        alert("Đổi mật khẩu thành công!");
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        alert(result.message || "Đổi mật khẩu thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-5">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Ico d={ic.lock} cls="w-4 h-4" style={{ color: "#0F172A" }} />
          <h3 className="font-bold text-sm" style={{ color: "#0F172A" }}>Đổi mật khẩu tài khoản</h3>
        </div>
        <p className="text-xs" style={{ color: "#64748B" }}>
          Cập nhật mật khẩu mới định kỳ để bảo vệ tài khoản công tác.
        </p>
      </div>

      <div className="flex flex-col gap-4" style={{ maxWidth: 480 }}>
        <PwField
          label="Mật khẩu hiện tại"
          placeholder="Nhập mật khẩu hiện tại..."
          value={current}
          onChange={setCurrent}
        />
        <PwField
          label="Mật khẩu mới"
          placeholder="Nhập mật khẩu mới..."
          value={next}
          onChange={setNext}
          showStrength
        />
        <PwField
          label="Xác nhận mật khẩu mới"
          placeholder="Nhập lại mật khẩu mới..."
          value={confirm}
          onChange={setConfirm}
        />
      </div>

      <div className="mt-5 flex items-start gap-3 px-4 py-3 rounded-xl border"
        style={{ maxWidth: 480, background: "#FFFBEB", borderColor: "#FEF3C7" }}>
        <Ico d={ic.shieldCheck} cls="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#B45309" }} />
        <p className="text-xs leading-relaxed" style={{ color: "#B45309" }}>
          <strong>Quy định bảo mật bệnh viện:</strong> Không chia sẻ tài khoản. Mật khẩu mới không được trùng với 3 mật khẩu gần nhất. Hệ thống bắt buộc đổi mật khẩu mỗi <strong>90 ngày</strong>.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#F1F5F9]">
        <button
          className="h-9 px-5 text-sm font-semibold border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-[#64748B] bg-transparent outline-none"
          onClick={() => { setCurrent(""); setNext(""); setConfirm("") }}
        >
          Hủy
        </button>
        <button
          onClick={handleUpdatePassword}
          disabled={isLoading}
          className="h-9 px-5 text-sm font-bold text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
          style={{ background: "#0EA5E9" }}
        >
          {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
        </button>
      </div>
    </div>
  );
}
