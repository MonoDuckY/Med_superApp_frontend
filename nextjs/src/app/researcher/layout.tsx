"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FlaskConical, LogOut, Shield, Check, Stethoscope, ClipboardList, Database, Cpu, Sparkles, Split, User } from "lucide-react";
import { logoutApiCall } from "@/lib/auth";
import Logo from "@/components/Logo";

export default function ResearcherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ fullName?: string; phoneNumber?: string; roles?: string[]; role?: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const getInitials = (name?: string) => {
    if (!name) return "RES";
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
      
      if (!upperRoles.includes("RESEARCHER")) {
        if (upperRoles.includes("ADMIN")) {
          router.push("/user-management/create-user");
        } else if (upperRoles.includes("DOCTOR")) {
          router.push("/doctor");
        } else if (upperRoles.includes("STAFF")) {
          router.push("/staff");
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
        <p className="text-slate-400 text-xs font-medium">Đang kiểm tra bảo mật phân hệ nghiên cứu...</p>
      </div>
    );
  }

  // Determine active tab based on current pathname
  const activeTab = pathname === "/researcher/ai-compare" 
    ? "ai-compare" 
    : pathname === "/researcher/lama-clean" 
      ? "lama-clean" 
      : pathname === "/researcher/lama-compare"
        ? "lama-compare"
        : "dataset";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header Navigation */}
      <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <p className="text-[#0F172A] font-bold text-[14px] leading-none">HMS NextGen</p>
            <p className="text-[#8B5CF6] text-[10px] font-semibold mt-0.5 tracking-wide uppercase">Phân hệ Nghiên cứu</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl">
          <button 
            onClick={() => router.push("/researcher")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${
              activeTab === "dataset" 
                ? "bg-white text-[#8B5CF6] shadow-sm" 
                : "bg-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Database size={13} />
            Kho dữ liệu ảnh
          </button>
          <button 
            onClick={() => router.push("/researcher/ai-compare")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${
              activeTab === "ai-compare" 
                ? "bg-white text-[#8B5CF6] shadow-sm" 
                : "bg-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Cpu size={13} />
            Phân tích & So sánh AI
          </button>
          <button 
            onClick={() => router.push("/researcher/lama-clean")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${
              activeTab === "lama-clean" 
                ? "bg-white text-[#8B5CF6] shadow-sm" 
                : "bg-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Sparkles size={13} />
            Xóa Caliper AI
          </button>
          <button 
            onClick={() => router.push("/researcher/lama-compare")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${
              activeTab === "lama-compare" 
                ? "bg-white text-[#8B5CF6] shadow-sm" 
                : "bg-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Split size={13} />
            Đối chiếu Caliper
          </button>
        </div>

        {/* Avatar circle with Dropdown */}
        <div ref={profileRef} className="relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity animate-[fadeIn_0.15s_ease-out]"
          >
            <span className="text-white text-[11px] font-bold">{getInitials(user?.fullName)}</span>
          </div>
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-50 py-1.5 animate-[fadeIn_0.15s_ease-out] text-left">
              <div className="px-4 py-2 border-b border-[#F1F5F9]">
                <p className="text-[12px] font-semibold text-[#0F172A] truncate">{user?.fullName || "Nghiên cứu sinh"}</p>
                <p className="text-[10px] text-[#64748B] truncate mt-0.5">{user?.phoneNumber || "N/A"}</p>
              </div>
              
              <div className="px-1.5 py-1.5 border-b border-[#F1F5F9]">
                <button
                  onClick={() => { setShowProfileMenu(false); router.push("/profile"); }}
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
                        className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none bg-transparent"
                      >
                        <Stethoscope size={13} className="shrink-0 text-slate-400" />
                        <span>Bác sĩ</span>
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
                        className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-[#8B5CF6] bg-violet-50/60 font-semibold cursor-pointer border-none outline-none"
                      >
                        <FlaskConical size={13} className="shrink-0 text-[#8B5CF6]" />
                        <span className="flex-1">Nghiên cứu sinh</span>
                        <Check size={11} className="text-[#8B5CF6] ml-auto" />
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
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden min-h-0 bg-[#F8FAFC]">
        {children}
      </main>
    </div>
  );
}
