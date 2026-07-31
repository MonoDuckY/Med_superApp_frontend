"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, LogOut, Shield, User, Phone, CheckCircle2 } from "lucide-react";

export default function StaffDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName?: string; phoneNumber?: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header Navigation */}
      <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#10B981] flex items-center justify-center text-white"
            style={{ boxShadow: "0 0 16px rgba(16,185,129,0.3)" }}>
            <ClipboardList size={18} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[#0F172A] font-bold text-[14px] leading-none">HMS NextGen</p>
            <p className="text-[#10B981] text-[10px] font-semibold mt-0.5 tracking-wide uppercase">Staff Portal</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 h-9 px-4 rounded-lg border border-[#E2E8F0] text-[12px] font-semibold text-[#64748B] hover:bg-[#FFF1F2] hover:text-[#EF4444] hover:border-[#FCA5A5] transition-all"
        >
          <LogOut size={13} /> Đăng xuất
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[500px] bg-white border border-[#E2E8F0] rounded-2xl p-10 shadow-sm flex flex-col items-center text-center">
          {/* Badge icon */}
          <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-6">
            <ClipboardList size={32} strokeWidth={1.5} className="text-[#10B981]" />
          </div>

          {/* Heading requested by the user */}
          <h2 className="text-[#10B981] font-bold text-xl mb-2">
            Đây là trang của Nhân viên
          </h2>
          <p className="text-[#64748B] text-[13px] max-w-[360px] leading-relaxed mb-6">
            Hệ thống tiếp đón bệnh nhân, sắp xếp lịch hẹn và quản lý hành chính khoa phòng.
          </p>

          {/* User profile card details */}
          <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 text-left mb-6 flex flex-col gap-3">
            <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold border-b border-[#E2E8F0] pb-2">
              Thông tin phiên làm việc
            </p>
            <div className="flex items-center gap-3 text-[13px]">
              <User size={14} className="text-[#94A3B8] flex-shrink-0" />
              <span className="text-[#64748B]">Nhân viên:</span>
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
              <span className="font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded text-[11px]">STAFF</span>
            </div>
          </div>

          {/* Verification indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#10B981]">
            <CheckCircle2 size={13} />
            <span>Hệ thống phân quyền chuẩn HMS</span>
          </div>
        </div>
      </main>
    </div>
  );
}
