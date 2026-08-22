"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Calendar,
  ClipboardList,
  UserPlus,
  LogOut,
  ChevronRight,
  Bell,
  Loader2,
  Newspaper,
  MessageSquare,
  User
} from "lucide-react";
import Logo from "@/components/Logo";
import { logoutApiCall } from "@/lib/auth";

interface User {
  fullName: string;
  phoneNumber: string;
  roles?: string[];
  role?: string;
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Auth check
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

      if (!upperRoles.includes("STAFF")) {
        if (upperRoles.includes("ADMIN")) {
          router.push("/user-management/create-user");
        } else if (upperRoles.includes("DOCTOR")) {
          router.push("/doctor");
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

  const getInitials = (name?: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (checkingAuth || !user) {
    return (
      <div className="min-h-screen bg-[#0C1A2E] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin h-8 w-8 text-[#0EA5E9]" />
        <p className="text-slate-400 text-xs font-medium">Đang kiểm tra bảo mật phân hệ nhân viên...</p>
      </div>
    );
  }

  const sidebarItems = [
    { label: "Quản lý Lịch hẹn", icon: Calendar, path: "/staff/appointments", id: "appointments" },
    { label: "Phê duyệt Lịch Bác sĩ", icon: ClipboardList, path: "/staff/schedules", id: "schedules" },
    { label: "Tạo hồ sơ bệnh nhân", icon: UserPlus, path: "/staff/create-patient", id: "create-patient" },
    { label: "Tin tức y khoa", icon: Newspaper, path: "/staff/news", id: "news" },
    { label: "Phản hồi & Ý kiến", icon: MessageSquare, path: "/staff/feedback", id: "feedback" },
  ];

  const activeItem = sidebarItems.find(item => pathname.startsWith(item.path)) || sidebarItems[0];

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-600 overflow-hidden font-sans antialiased select-none">
      
      {/* Sidebar Component */}
      <aside className="w-[240px] shrink-0 h-full bg-[#0C1A2E] flex flex-col justify-between py-6">
        <div className="space-y-6">
          <div className="px-6 flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <p className="text-white font-bold leading-none text-[13px] tracking-tight">HMS Nhân viên</p>
              <p className="text-[#0EA5E9] text-[10px] font-semibold mt-1 uppercase tracking-wider">Tiếp đón bệnh nhân</p>
            </div>
          </div>

          <nav className="px-3 space-y-1">
            {sidebarItems.map((item) => {
              const active = pathname.startsWith(item.path);
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-xs font-semibold transition-all border-none bg-transparent cursor-pointer outline-none
                    ${active ? "bg-[#0EA5E9]/15 text-[#38BDF8] shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                >
                  <IconComp size={15} className={active ? "text-[#38BDF8]" : "text-slate-400"} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="px-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all border-none cursor-pointer outline-none"
          >
            <LogOut size={13} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 shrink-0 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-[#64748B]">Bảng làm việc</span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-[#0F172A]">{activeItem.label}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors cursor-pointer outline-none border-none bg-transparent">
                <Bell size={14} strokeWidth={1.75} />
              </button>
            </div>

            <div className="h-8 w-px bg-[#E2E8F0] hidden sm:block" />

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-[#0F172A]">{user?.fullName || "Nhân viên"}</p>
                <p className="text-[10px] font-mono text-[#64748B]">{user?.phoneNumber || "N/A"}</p>
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
                      <p className="text-[12px] font-semibold text-[#0F172A] truncate">{user?.fullName || "Nhân viên"}</p>
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
          </div>
        </header>

        {/* Child Pages Content */}
        {children}
      </div>
    </div>
  );
}
