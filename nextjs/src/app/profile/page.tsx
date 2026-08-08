"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Ico, ic } from "@/components/common/Icons";
import StaffCard from "@/components/profile/StaffCard";
import GeneralInfoForm from "@/components/profile/GeneralInfoForm";
import CertsForm from "@/components/profile/CertsForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";

const TABS = [
  { key: "info",     label: "Thông tin chung" },
  { key: "certs",   label: "Chứng chỉ & Chuyên môn" },
  { key: "security",label: "Bảo mật & Đổi mật khẩu" },
];

function Sidebar({ user, userRoles, onBack }: { user: any; userRoles: string[]; onBack: () => void }) {
  const getInitials = (name?: string) => {
    if (!name) return "US";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "US";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleLabel = () => {
    if (userRoles.includes("ADMIN")) return "Trang Quản trị";
    if (userRoles.includes("DOCTOR")) return "Phân hệ Bác sĩ";
    if (userRoles.includes("STAFF")) return "Phân hệ Nhân viên";
    if (userRoles.includes("RESEARCHER")) return "Phân hệ Nghiên cứu";
    return "Phân hệ HMS";
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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [tab, setTab] = useState("info");

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
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="flex gap-6 h-full" style={{ minHeight: 0 }}>
            <div style={{ width: "30%", minWidth: 240 }} className="shrink-0">
              <StaffCard user={user} userRoles={userRoles} />
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col">
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
                  {tab === "info"      && <GeneralInfoForm user={user} />}
                  {tab === "certs"     && <CertsForm user={user} />}
                  {tab === "security"  && <ChangePasswordForm />}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
