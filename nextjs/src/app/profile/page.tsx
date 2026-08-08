"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { fetchWithAuth } from "@/lib/auth";

function Ico({ d, cls = "", style }: { d: string | string[]; cls?: string; style?: React.CSSProperties }) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}

const ic = {
  plus:         "M12 5v14M5 12h14",
  chevRight:    "m9 18 6-6-6-6",
  chevDown:     "m6 9 6 6 6-6",
  dashboard:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  users:        ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75", "M9 7m-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0"],
  settings:     ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
  user:         ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8"],
  eye:          ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6"],
  eyeOff:       ["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24", "M1 1l22 22"],
  shieldCheck:  ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "m9 12 2 2 4-4"],
  award:        ["M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M8.21 13.89 7 23l5-3 5 3-1.21-9.12"],
  lock:         ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 10 0v4"],
  checkCircle:  ["M22 11.08V12a10 10 0 1 1-5.93-9.14", "m9 11 3 3L22 4"],
  calendar:     "M3 4h18v18H3V4zM3 10h18M8 2v4M16 2v4",
  clock:        "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2",
  building:     ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
}

function Sidebar({ user, userRoles, onBack }: { user: any; userRoles: string[]; onBack: () => void }) {
  const getInitials = (name?: string) => {
    if (!name) return "US";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "US";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleLabel = () => {
    if (userRoles.includes("ADMIN")) return "Admin Console";
    if (userRoles.includes("DOCTOR")) return "Doctor Portal";
    if (userRoles.includes("STAFF")) return "Staff Portal";
    if (userRoles.includes("RESEARCHER")) return "Research Portal";
    return "HMS Portal";
  };

  return (
    <aside className="flex flex-col shrink-0 h-full" style={{ width: 220, background: "#0C1A2E" }}>
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Logo size="sm" />
        <div>
          <p className="text-white font-bold leading-none text-[13px]">HMS</p>
          <p className="leading-none mt-1 tracking-wide text-[10px] text-[#475569]">{getRoleLabel()}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-all cursor-pointer text-[#64748B] hover:bg-white/5 hover:text-slate-300 border-none outline-none bg-transparent"
        >
          <Ico d={ic.dashboard} cls="w-4 h-4 shrink-0" />
          <span className="text-xs truncate">Quay lại Trang chủ</span>
        </button>
        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-all cursor-pointer border-none outline-none text-[#38BDF8] bg-sky-500/15"
        >
          <Ico d={ic.user} cls="w-4 h-4 shrink-0" />
          <span className="text-xs truncate">Hồ sơ cá nhân</span>
        </button>
      </nav>

      <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-full shrink-0 font-bold text-xs"
            style={{ width: 32, height: 32, background: "rgba(14,165,233,0.2)", border: "1px solid rgba(14,165,233,0.3)", color: "#38BDF8" }}>
            {getInitials(user?.fullName)}
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate text-[11px] text-[#CBD5E1]">{user?.fullName || "Người dùng"}</p>
            <p className="truncate mono text-[10px] text-[#475569]">{user?.phoneNumber || "N/A"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StaffCard({ user, userRoles }: { user: any; userRoles: string[] }) {
  const getInitials = (name?: string) => {
    if (!name) return "US";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "US";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleBadgeLabel = () => {
    if (userRoles.includes("ADMIN")) return "Quản trị viên";
    if (userRoles.includes("DOCTOR")) return "Bác sĩ điều trị";
    if (userRoles.includes("STAFF")) return "Nhân viên điều phối";
    if (userRoles.includes("RESEARCHER")) return "Nghiên cứu viên";
    return "Thành viên";
  };

  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "01/08/2026";

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col items-center text-center">
      <div className="relative mb-4">
        <div
          className="flex items-center justify-center rounded-full font-bold text-white bg-[#0EA5E9] border-[3px] border-[#0EA5E9] shadow-[0_0_0_4px_rgba(14,165,233,0.12)]"
          style={{ width: 96, height: 96, fontSize: 32 }}
        >
          {getInitials(user?.fullName)}
        </div>
        <div
          className="absolute bottom-0 right-0 flex items-center justify-center rounded-full border-2 border-white w-6 h-6 bg-[#10B981]"
        >
          <Ico d={ic.checkCircle} cls="w-3 h-3 text-white" />
        </div>
      </div>

      <h3 className="font-bold mt-2 text-[#0F172A] text-lg">{user?.fullName || "Người dùng"}</h3>

      <span className="mono text-xs px-2 py-1 rounded mt-2 inline-block bg-[#F1F5F9] text-[#64748B]">
        {getRoleBadgeLabel()}
      </span>

      <div className="w-full mt-6 pt-5 flex flex-col gap-3 text-left border-t border-[#F1F5F9]">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Ico d={ic.calendar} cls="w-3.5 h-3.5 shrink-0 text-[#94A3B8]" />
            Ngày tham gia
          </div>
          <span className="text-xs font-bold text-[#0F172A]">{joinDate}</span>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Ico d={ic.clock} cls="w-3.5 h-3.5 shrink-0 text-[#94A3B8]" />
            Số điện thoại
          </div>
          <span className="text-xs font-bold mono text-[#0F172A]">{user?.phoneNumber || "N/A"}</span>
        </div>
      </div>
    </div>
  );
}

function StrengthBar({ strength }: { strength: number }) {
  const colors = ["#EF4444", "#F59E0B", "#F59E0B", "#10B981", "#10B981"]
  const labels = ["", "Rất yếu", "Yếu", "Trung bình", "Mạnh"]
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
  )
}

function PwField({ label, placeholder, value, onChange, showStrength }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; showStrength?: boolean
}) {
  const [show, setShow] = useState(false)

  const strength = value.length === 0 ? 0
    : value.length < 4 ? 1
    : value.length < 6 ? 2
    : value.length < 10 ? 3 : 4

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
  )
}

function ChangePasswordTab() {
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
  )
}

function GeneralInfoTab({ user }: { user: any }) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [citizenId, setCitizenId] = useState(user?.citizenIdentificationCode || "");
  const [certificate, setCertificate] = useState(user?.certificate || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = { ...user, fullName, email };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("Cập nhật thông tin cá nhân thành công!");
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi cập nhật thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  const isDoctor = user?.role === "DOCTOR" || user?.roles?.includes("DOCTOR");

  return (
    <form onSubmit={handleSave} className="pt-5 flex flex-col gap-4" style={{ maxWidth: 480 }}>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
          Họ và tên <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
          Số điện thoại (Tên đăng nhập)
        </label>
        <input
          type="text"
          value={phone}
          disabled
          className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@hospital.org"
          className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-white"
        />
      </div>

      {citizenId && (
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
            Số CCCD / CMND
          </label>
          <input
            type="text"
            value={citizenId}
            disabled
            className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
          />
        </div>
      )}

      {isDoctor && certificate && (
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
            Mã chứng chỉ hành nghề
          </label>
          <input
            type="text"
            value={certificate}
            disabled
            className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#F1F5F9]">
        <button
          type="submit"
          disabled={isSaving}
          className="h-9 px-5 text-sm font-bold text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
          style={{ background: "#0EA5E9" }}
        >
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}

function CertsTab({ user }: { user: any }) {
  const isDoctor = user?.role === "DOCTOR" || user?.roles?.includes("DOCTOR");
  if (!isDoctor) {
    return (
      <div className="pt-10 pb-6 flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium text-slate-500">Chức năng chỉ dành cho Bác sĩ</p>
      </div>
    );
  }
  return (
    <div className="pt-5 flex flex-col gap-4" style={{ maxWidth: 480 }}>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
          Mã chứng chỉ hành nghề y khoa
        </label>
        <input
          type="text"
          value={user?.certificate || "N/A"}
          disabled
          className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
          Cơ quan cấp chứng chỉ
        </label>
        <input
          type="text"
          value="Bộ Y Tế Việt Nam"
          disabled
          className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
        />
      </div>
    </div>
  );
}

const TABS = [
  { key: "info",     label: "Thông tin chung" },
  { key: "certs",   label: "Chứng chỉ & Chuyên môn" },
  { key: "security",label: "Bảo mật & Đổi mật khẩu" },
]

function SettingsCard({ user }: { user: any }) {
  const [tab, setTab] = useState("info");

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex-1">
      <div className="flex items-stretch gap-0 px-6 border-b border-[#F1F5F9]">
        {TABS.map(t => {
          const active = t.key === tab
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="relative py-4 mr-6 text-sm font-medium transition-colors cursor-pointer border-none bg-transparent outline-none"
              style={{ color: active ? "#0EA5E9" : "#64748B" }}
            >
              {active && <span className="font-bold">{t.label}</span>}
              {!active && t.label}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ background: "#0EA5E9" }} />
              )}
            </button>
          )
        })}
      </div>

      <div className="px-6 pb-6">
        {tab === "info"      && <GeneralInfoTab user={user} />}
        {tab === "certs"     && <CertsTab user={user} />}
        {tab === "security"  && <ChangePasswordTab />}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");
    if (!token || !savedUser) {
      router.push("/");
      return;
    }
    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    } catch (e) {
      console.error("Failed to parse user:", e);
      router.push("/");
    } finally {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth || !user) {
    return (
      <div className="min-h-screen bg-[#0C1A2E] flex flex-col items-center justify-center gap-3">
        <svg className="animate-spin h-8 w-8 text-[#0EA5E9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-400 text-xs font-medium">Đang kiểm tra bảo mật phân hệ hồ sơ...</p>
      </div>
    );
  }

  const rawRoles = user?.roles || (user?.role ? [user.role] : []);
  const userRoles = rawRoles.filter((r: any): r is string => !!r).map((r: string) => r.toUpperCase());

  const handleBackToDashboard = () => {
    if (userRoles.includes("ADMIN")) router.push("/user-management/create-user");
    else if (userRoles.includes("DOCTOR")) router.push("/doctor");
    else if (userRoles.includes("STAFF")) router.push("/staff");
    else if (userRoles.includes("RESEARCHER")) router.push("/researcher");
    else router.push("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] select-none text-slate-600 font-sans antialiased">
      <Sidebar user={user} userRoles={userRoles} onBack={handleBackToDashboard} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between" style={{ height: 56 }}>
          <div className="flex items-center gap-1.5 text-xs">
            <span style={{ color: "#64748B" }}>Cấu hình</span>
            <Ico d={ic.chevRight} cls="w-3 h-3 text-slate-300" />
            <span className="font-semibold" style={{ color: "#0F172A" }}>Hồ sơ cá nhân</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium bg-[#E6F4EA] border-[#CEEAD6] color-[#10B981] text-[#10B981]">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Hệ thống Trực tuyến
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="flex gap-6 h-full" style={{ minHeight: 0 }}>
            <div style={{ width: "30%", minWidth: 240 }} className="shrink-0">
              <StaffCard user={user} userRoles={userRoles} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <SettingsCard user={user} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
