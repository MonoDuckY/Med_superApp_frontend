"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, LogOut, Shield, User, Phone, CheckCircle2, Check, ClipboardList, FlaskConical } from "lucide-react";
import { logoutApiCall } from "@/lib/auth";

export default function DoctorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName?: string; phoneNumber?: string; roles?: string[]; role?: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const getInitials = (name?: string) => {
    if (!name) return "DR";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");
    if (!token || !savedUser) {
      router.push("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      const roles = parsedUser.roles || (parsedUser.role ? [parsedUser.role] : []);
      const upperRoles = roles.map((r: string) => r.toUpperCase());
      
      if (!upperRoles.includes("DOCTOR")) {
        if (upperRoles.includes("ADMIN")) {
          router.push("/user-management/create-user");
        } else if (upperRoles.includes("STAFF")) {
          router.push("/staff");
        } else if (upperRoles.includes("RESEARCHER")) {
          router.push("/researcher");
        } else {
          router.push("/");
        }
        return;
      }
      
      setUser(parsedUser);
      setCheckingAuth(false);
    } catch (e) {
      console.error(e);
      router.push("/");
    }

    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [router]);

  const handleLogout = async () => {
    await logoutApiCall();
    router.push("/");
  };

  const rawRoles = user?.roles || (user?.role ? [user.role] : []);
  const userRoles = rawRoles.filter((r): r is string => !!r).map(r => r.toUpperCase());

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0C1A2E] flex flex-col items-center justify-center gap-3">
        <svg className="animate-spin h-8 w-8 text-[#0EA5E9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-400 text-xs font-medium">Đang kiểm tra bảo mật phân hệ bác sĩ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header Navigation */}
      <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0EA5E9] flex items-center justify-center text-white"
            style={{ boxShadow: "0 0 16px rgba(14,165,233,0.3)" }}>
            <Stethoscope size={18} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[#0F172A] font-bold text-[14px] leading-none">HMS NextGen</p>
            <p className="text-[#0EA5E9] text-[10px] font-semibold mt-0.5 tracking-wide uppercase">Clinical Portal</p>
          </div>
        </div>
        {/* Avatar circle with Dropdown */}
        <div ref={profileRef} className="relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full bg-[#0EA5E9] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity animate-[fadeIn_0.15s_ease-out]"
          >
            <span className="text-white text-[11px] font-bold">{getInitials(user?.fullName)}</span>
          </div>
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-50 py-1.5 animate-[fadeIn_0.15s_ease-out] text-left">
              <div className="px-4 py-2 border-b border-[#F1F5F9]">
                <p className="text-[12px] font-semibold text-[#0F172A] truncate">{user?.fullName || "Bác sĩ"}</p>
                <p className="text-[10px] text-[#64748B] truncate mt-0.5">{user?.phoneNumber || "N/A"}</p>
              </div>
              
              {/* Role switcher for multi-role accounts */}
              {userRoles.length > 1 && (
                <div className="px-1.5 py-1.5 border-b border-[#F1F5F9]">
                  <p className="px-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chuyển vai trò</p>
                  <div className="flex flex-col gap-0.5">
                    {userRoles.includes("ADMIN") && (
                      <button
                        onClick={() => router.push("/user-management/create-user")}
                        className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none"
                      >
                        <Shield size={13} className="shrink-0 text-slate-400" />
                        <span>Quản trị viên</span>
                      </button>
                    )}
                    {userRoles.includes("DOCTOR") && (
                      <button
                        onClick={() => router.push("/doctor")}
                        className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-[#0EA5E9] bg-sky-50/60 font-semibold cursor-pointer border-none outline-none"
                      >
                        <Stethoscope size={13} className="shrink-0 text-[#0EA5E9]" />
                        <span className="flex-1">Bác sĩ</span>
                        <Check size={11} className="text-[#0EA5E9] ml-auto" />
                      </button>
                    )}
                    {userRoles.includes("STAFF") && (
                      <button
                        onClick={() => router.push("/staff")}
                        className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none"
                      >
                        <ClipboardList size={13} className="shrink-0 text-slate-400" />
                        <span>Nhân viên y tế</span>
                      </button>
                    )}
                    {userRoles.includes("RESEARCHER") && (
                      <button
                        onClick={() => router.push("/researcher")}
                        className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none"
                      >
                        <FlaskConical size={13} className="shrink-0 text-slate-400" />
                        <span>Nghiên cứu sinh</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-left text-[12px] text-[#EF4444] hover:bg-[#FFF1F2] transition-colors cursor-pointer outline-none font-bold border-none"
              >
                <LogOut size={13} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[500px] bg-white border border-[#E2E8F0] rounded-2xl p-10 shadow-sm flex flex-col items-center text-center">
          {/* Badge icon */}
          <div className="w-16 h-16 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center mb-6">
            <Stethoscope size={32} strokeWidth={1.5} className="text-[#0EA5E9]" />
          </div>

          {/* Heading requested by the user */}
          <h2 className="text-[#0EA5E9] font-bold text-xl mb-2">
            Đây là trang của Bác sĩ
          </h2>
          <p className="text-[#64748B] text-[13px] max-w-[360px] leading-relaxed mb-6">
            Hệ thống quản lý thông tin bệnh án và chẩn đoán lâm sàng. Mọi thao tác truy cập đều được kiểm toán bảo mật.
          </p>

          {/* User profile card details */}
          <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 text-left mb-6 flex flex-col gap-3">
            <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold border-b border-[#E2E8F0] pb-2">
              Thông tin phiên làm việc
            </p>
            <div className="flex items-center gap-3 text-[13px]">
              <User size={14} className="text-[#94A3B8] flex-shrink-0" />
              <span className="text-[#64748B]">Bác sĩ:</span>
              <span className="font-semibold text-[#0F172A]">{user?.fullName || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              <Phone size={14} className="text-[#94A3B8] flex-shrink-0" />
              <span className="text-[#64748B]">Điện thoại:</span>
              <span className="font-mono text-[#0F172A]">{user?.phoneNumber || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              <Shield size={14} className="text-[#94A3B8] flex-shrink-0" />
              <span className="text-[#64748B]">Vai trò:</span>
              <span className="font-medium text-[#0EA5E9] bg-[#0EA5E9]/10 px-2 py-0.5 rounded text-[11px]">DOCTOR</span>
            </div>
          </div>

          {/* Verification indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#10B981]">
            <CheckCircle2 size={13} />
            <span>Môi trường làm việc an toàn</span>
          </div>
        </div>
      </main>
    </div>
  );
}
