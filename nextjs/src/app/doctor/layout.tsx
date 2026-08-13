"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Stethoscope, 
  LogOut, 
  Shield, 
  Calendar, 
  ClipboardList, 
  FlaskConical,
  User,
  Check,
  Loader2
} from "lucide-react";
import { fetchWithAuth, logoutApiCall } from "@/lib/auth";
import Logo from "@/components/Logo";

interface UserType {
  fullName?: string;
  phoneNumber?: string;
  roles?: string[];
  role?: string;
}

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<UserType | null>(null);
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

  const doctorCode = `DR-${(user?.phoneNumber || "9843").slice(-4)}`;

  const handleLogout = async () => {
    await logoutApiCall();
    router.push("/");
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

  if (checkingAuth || !user) {
    return (
      <div className="min-h-screen bg-[#0C1A2E] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin h-8 w-8 text-[#0EA5E9]" />
        <p className="text-slate-400 text-xs font-medium">Đang kiểm tra bảo mật phân hệ bác sĩ...</p>
      </div>
    );
  }

  const rawRoles = user?.roles || (user?.role ? [user.role] : []);
  const userRoles = rawRoles.filter((r): r is string => !!r).map(r => r.toUpperCase());

  // Determine active tab based on pathname
  const activeTab = pathname.startsWith("/doctor/schedule") 
    ? "schedule" 
    : pathname.startsWith("/doctor/records") 
    ? "records" 
    : "appointments";

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden select-none text-slate-600 font-sans antialiased">
      {/* Top Header Navigation */}
      <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 shrink-0">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Logo size="sm" />
          <div>
            <p className="text-[#0F172A] font-bold text-[14px] leading-none">HMS NextGen</p>
            <p className="text-[#0EA5E9] text-[10px] font-semibold mt-0.5 tracking-wider uppercase">Phân hệ Bác sĩ</p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-stretch h-full gap-1">
          <button
            onClick={() => router.push("/doctor/appointments")}
            className={`relative px-5 text-sm font-medium transition-colors cursor-pointer border-none bg-transparent outline-none flex items-center ${activeTab === "appointments" ? "text-[#0EA5E9]" : "text-[#64748B]"}`}
          >
            Danh sách lịch khám
            {activeTab === "appointments" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-[#0EA5E9]" />
            )}
          </button>
          <button
            onClick={() => router.push("/doctor/schedule")}
            className={`relative px-5 text-sm font-medium transition-colors cursor-pointer border-none bg-transparent outline-none flex items-center ${activeTab === "schedule" ? "text-[#0EA5E9]" : "text-[#64748B]"}`}
          >
            Đăng ký lịch làm việc
            {activeTab === "schedule" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-[#0EA5E9]" />
            )}
          </button>
          <button
            onClick={() => router.push("/doctor/records")}
            className={`relative px-5 text-sm font-medium transition-colors cursor-pointer border-none bg-transparent outline-none flex items-center ${activeTab === "records" ? "text-[#0EA5E9]" : "text-[#64748B]"}`}
          >
            Hồ sơ bệnh nhân
            {activeTab === "records" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-[#0EA5E9]" />
            )}
          </button>
        </nav>

        {/* Right Side: Doctor Profile dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[#0F172A]">{user?.fullName || "Bác sĩ"}</p>
            <p className="text-[10px] font-mono text-[#64748B]">{doctorCode}</p>
          </div>

          <div ref={profileRef} className="relative">
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 flex items-center justify-center cursor-pointer hover:bg-[#0EA5E9]/20 transition-all font-bold text-[#0EA5E9] text-xs"
            >
              {getInitials(user?.fullName)}
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-50 py-1.5 animate-[fadeIn_0.15s_ease-out] text-left">
                <div className="px-4 py-2 border-b border-[#F1F5F9]">
                  <p className="text-[12px] font-semibold text-[#0F172A] truncate">{user?.fullName || "Bác sĩ"}</p>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5">{user?.phoneNumber || "N/A"}</p>
                </div>
                
                <div className="px-1.5 py-1.5 border-b border-[#F1F5F9]">
                  <button
                    onClick={() => router.push("/profile")}
                    className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none bg-transparent"
                  >
                    <User size={13} className="shrink-0 text-slate-400" />
                    <span>Hồ sơ cá nhân</span>
                  </button>
                </div>
                
                {/* Role switcher for multi-role accounts */}
                {userRoles.length > 1 && (
                  <div className="px-1.5 py-1.5 border-b border-[#F1F5F9]">
                    <p className="px-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chuyển vai trò</p>
                    <div className="flex flex-col gap-0.5">
                      {userRoles.includes("ADMIN") && (
                        <button
                          onClick={() => router.push("/user-management/create-user")}
                          className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none bg-transparent"
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
                          className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none bg-transparent"
                        >
                          <ClipboardList size={13} className="shrink-0 text-slate-400" />
                          <span>Nhân viên y tế</span>
                        </button>
                      )}
                      {userRoles.includes("RESEARCHER") && (
                        <button
                          onClick={() => router.push("/researcher")}
                          className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none bg-transparent"
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
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-[12px] text-[#EF4444] hover:bg-[#FFF1F2] transition-colors cursor-pointer outline-none font-bold border-none bg-transparent"
                >
                  <LogOut size={13} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {children}
    </div>
  );
}
