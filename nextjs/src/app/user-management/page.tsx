"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  UserCheck, 
  Lock, 
  Unlock, 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Download, 
  Plus, 
  LayoutDashboard, 
  Stethoscope, 
  FlaskConical, 
  FileText, 
  Settings, 
  LogOut,
  AlertCircle,
  CheckCircle,
  Loader2,
  Award,
  X
} from "lucide-react";
import { fetchWithAuth, logoutApiCall } from "@/lib/auth";
import Logo from "@/components/Logo";

// Types
type UserRoleType = "ADMIN" | "DOCTOR" | "STAFF" | "RESEARCHER" | "PATIENT";
type AccountStatusType = "ACTIVE" | "INACTIVE";

interface UserAccount {
  id: string;
  role: UserRoleType;
  status: AccountStatusType;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  citizenIdentificationCode?: string;
  healthInsuranceCode?: string;
  hasCertificate: boolean;
  certificateUrl?: string;
  medicalHistory?: string;
  currentSickness?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  createdAt?: string;
}

const ROLE_CFG: Record<UserRoleType, { label: string; bg: string; text: string }> = {
  ADMIN:      { label: "Quản trị",  bg: "rgba(239,68,68,0.08)",  text: "#DC2626" },
  DOCTOR:     { label: "Bác sĩ",    bg: "rgba(14,165,233,0.08)", text: "#0284C7" },
  STAFF:      { label: "Nhân viên", bg: "rgba(16,185,129,0.08)", text: "#059669" },
  RESEARCHER: { label: "Nghiên cứu",bg: "rgba(139,92,246,0.08)", text: "#7C3AED" },
  PATIENT:    { label: "Bệnh nhân", bg: "rgba(245,158,11,0.08)",  text: "#D97706" },
};

const STATUS_CFG: Record<AccountStatusType, { label: string; bg: string; text: string }> = {
  ACTIVE:   { label: "Đang hoạt động", bg: "rgba(16,185,129,0.10)", text: "#15803D" },
  INACTIVE: { label: "Tạm khóa",       bg: "rgba(239,68,68,0.10)",  text: "#B91C1C" },
};

export default function UserAccountsList() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://47.131.58.207:8080";

  // Auth states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [expandedNav, setExpandedNav] = useState("Quản lý người dùng");

  // Functional states
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Actions states
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [viewingCertificateUrl, setViewingCertificateUrl] = useState<string | null>(null);
  const [viewingDoctorName, setViewingDoctorName] = useState<string | null>(null);

  // Validate Admin Role on load
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
      
      if (!upperRoles.includes("ADMIN")) {
        if (upperRoles.includes("DOCTOR")) router.push("/doctor");
        else if (upperRoles.includes("STAFF")) router.push("/staff");
        else if (upperRoles.includes("RESEARCHER")) router.push("/researcher");
        else router.push("/");
        return;
      }
      
      setCurrentUser(parsedUser);
      setCheckingAuth(false);
      fetchUsers();
    } catch (e) {
      console.error(e);
      router.push("/");
    }
  }, [router]);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/admin/users`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        throw new Error(result.message || "Không thể tải danh sách tài khoản.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (userId: string) => {
    if (togglingId) return;
    setTogglingId(userId);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/admin/users/${userId}/status`, {
        method: "PATCH",
      });
      const result = await res.json();
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
              : u
          )
        );
        setSuccessMsg("Cập nhật trạng thái tài khoản thành công.");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        throw new Error(result.message || "Lỗi thay đổi trạng thái.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Thao tác thất bại.");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setTogglingId(null);
    }
  };

  const handleLogout = async () => {
    await logoutApiCall();
    router.push("/");
  };

  // Helper formatting methods
  const getInitials = (name?: string) => {
    if (!name) return "AD";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (initials: string) => {
    const colors = ["#0EA5E9", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899"];
    let sum = 0;
    for (let i = 0; i < initials.length; i++) {
      sum += initials.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const formatMedicalInfo = (u: UserAccount) => {
    if (u.role !== "PATIENT") return "—";
    const parts = [];
    if (u.bloodType) parts.push(`Nhóm máu: ${u.bloodType}`);
    if (u.height) parts.push(`${u.height}m`);
    if (u.weight) parts.push(`${u.weight}kg`);
    return parts.length > 0 ? parts.join(" · ") : "—";
  };

  const formatCreatedDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "—";
    }
  };

  // Dynamic KPI stats calculations
  const stats = useMemo(() => {
    return {
      total: users.length,
      doctors: users.filter((u) => u.role === "DOCTOR").length,
      staff: users.filter((u) => u.role === "STAFF").length,
      inactive: users.filter((u) => u.status === "INACTIVE").length,
    };
  }, [users]);

  // Real-time filtering
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.fullName?.toLowerCase().includes(q) ||
        u.phoneNumber?.includes(q) ||
        u.citizenIdentificationCode?.includes(q) ||
        u.healthInsuranceCode?.includes(q);

      const matchesRole = selectedRole === "ALL" || u.role === selectedRole;
      const matchesStatus = selectedStatus === "ALL" || u.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, selectedRole, selectedStatus]);

  // Reset pagination if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRole, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0C1A2E] flex flex-col items-center justify-center gap-3">
        <svg className="animate-spin h-8 w-8 text-[#0EA5E9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-400 text-xs font-medium">Đang kiểm tra bảo mật phân hệ quản trị...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ─── Sidebar ─── */}
      <aside className="flex flex-col shrink-0 h-full w-[220px] bg-[#0C1A2E]">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
          <Logo size="sm" />
          <div>
            <p className="text-white font-bold leading-none text-[13px]">HMS</p>
            <p className="leading-none mt-1 tracking-wide text-[10px] text-[#475569]">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 flex flex-col gap-0.5 overflow-y-auto">
          <div>
            <button 
              onClick={() => setExpandedNav(expandedNav === "Quản lý người dùng" ? "" : "Quản lý người dùng")}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left cursor-pointer bg-[#0EA5E9]/15 text-[#38BDF8]"
            >
              <Users size={15} strokeWidth={1.75} />
              <span className="text-xs font-medium flex-1 truncate">Quản lý người dùng</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${expandedNav === "Quản lý người dùng" ? "rotate-180" : ""}`} />
            </button>
            {expandedNav === "Quản lý người dùng" && (
              <div className="ml-4 mt-0.5 flex flex-col gap-0.5 pl-3 border-l border-white/8">
                <button 
                  onClick={() => router.push("/user-management")}
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-left transition-all text-[#38BDF8] cursor-pointer bg-white/5 font-semibold"
                >
                  <span className="rounded-full shrink-0 w-1.5 h-1.5 bg-[#38BDF8]" />
                  <span className="text-[11px]">Tất cả người dùng</span>
                </button>
                <button 
                  onClick={() => router.push("/user-management/create-user")}
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-left transition-all text-[#64748B] hover:text-[#94A3B8] hover:bg-white/5 cursor-pointer"
                >
                  <span className="rounded-full shrink-0 w-1 h-1 bg-[#334155]" />
                  <span className="text-[11px]">Tạo người dùng</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-white/8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center rounded-full shrink-0 font-bold text-[#38BDF8] bg-[#0EA5E9]/20 border border-[#0EA5E9]/30 text-[10px] w-7 h-7">
                {getInitials(currentUser?.fullName)}
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate text-[10px] text-[#CBD5E1]">{currentUser?.fullName || "Super Admin"}</p>
                <p className="truncate text-[9px] text-[#475569]">{currentUser?.phoneNumber || "ADM-20241105"}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0 ml-1"
              title="Đăng xuất"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        
        {/* Page Alert Banners */}
        {successMsg && (
          <div className="fixed top-6 right-6 z-50 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-lg max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle size={16} className="text-[#10B981] shrink-0" />
            <span className="text-xs font-semibold">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="fixed top-6 right-6 z-50 bg-[#FCE8E6] border border-[#FAD2CF] text-[#C5221F] rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-lg max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle size={16} className="text-[#EF4444] shrink-0" />
            <span className="text-xs font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: "#64748B" }}>
              Hệ thống &rsaquo; Quản lý người dùng
            </p>
            <h1 className="font-extrabold text-[24px] tracking-tight" style={{ color: "#0F172A" }}>
              Quản lý Tài khoản &amp; Vai trò
            </h1>
          </div>
          <button
            onClick={() => router.push("/user-management/create-user")}
            className="flex items-center gap-2 text-xs font-bold text-white rounded-lg px-4 cursor-pointer hover:opacity-90 transition-opacity bg-[#0EA5E9]"
            style={{ height: 38, boxShadow: "0 4px 10px rgba(14,165,233,0.2)" }}
          >
            <Plus size={14} />
            Tạo tài khoản mới
          </button>
        </div>

        {/* Dynamic KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-slate-50 text-[#0F172A] rounded-xl flex items-center justify-center shrink-0">
              <Users size={18} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-[#0F172A] leading-none">{stats.total}</p>
              <p className="text-[10px] font-semibold text-[#64748B] mt-1">Tổng số tài khoản</p>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-sky-50 text-[#0EA5E9] rounded-xl flex items-center justify-center shrink-0">
              <Stethoscope size={18} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-[#0EA5E9] leading-none">{stats.doctors}</p>
              <p className="text-[10px] font-semibold text-[#64748B] mt-1">Bác sĩ lâm sàng</p>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-50 text-[#10B981] rounded-xl flex items-center justify-center shrink-0">
              <UserCheck size={18} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-[#10B981] leading-none">{stats.staff}</p>
              <p className="text-[10px] font-semibold text-[#64748B] mt-1">Nhân viên điều phối</p>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-rose-50 text-[#EF4444] rounded-xl flex items-center justify-center shrink-0">
              <Lock size={18} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-[#EF4444] leading-none">{stats.inactive}</p>
              <p className="text-[10px] font-semibold text-[#64748B] mt-1">Tài khoản tạm khóa</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full md:w-[260px]">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-300 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, SĐT, CCCD..."
                className="w-full h-9 pl-9 pr-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all font-medium"
              />
            </div>

            {/* Role dropdown */}
            <div className="relative w-[150px]">
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs font-semibold border border-[#E2E8F0] rounded-lg outline-none appearance-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer text-slate-500 bg-white"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">Quản trị viên</option>
                <option value="DOCTOR">Bác sĩ</option>
                <option value="STAFF">Nhân viên</option>
                <option value="RESEARCHER">Nghiên cứu viên</option>
                <option value="PATIENT">Bệnh nhân</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Status dropdown */}
            <div className="relative w-[160px]">
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs font-semibold border border-[#E2E8F0] rounded-lg outline-none appearance-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer text-slate-500 bg-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Tạm khóa</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Export */}
          <button className="flex items-center justify-center gap-2 h-9 px-4 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-slate-500 bg-white shrink-0">
            <Download size={13} />
            Xuất báo cáo
          </button>
        </div>

        {/* User Accounts Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-slate-50/70">
                  {["Nhân sự / Người dùng", "Số điện thoại", "Vai trò", "Thông tin y tế", "Ngày tạo", "Trạng thái", "Hành động"].map((h, i) => (
                    <th key={h}
                      className="text-left text-xs font-bold px-5 py-3"
                      style={{ 
                        color: "#64748B", 
                        whiteSpace: "nowrap",
                        textAlign: i === 6 ? "center" : "left",
                        width: [260, 140, 120, 180, 120, 140, 100][i] 
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Loader2 size={24} className="animate-spin text-sky-500" />
                        <span className="text-xs font-medium">Đang tải danh sách người dùng...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-xs font-semibold text-slate-300">
                      Không tìm thấy tài khoản phù hợp.
                    </td>
                  </tr>
                ) : paginatedUsers.map((row) => {
                  const initials = getInitials(row.fullName);
                  const avatarBg = getAvatarColor(initials);
                  const roleCfg = ROLE_CFG[row.role] || { label: row.role, bg: "rgba(100,116,139,0.08)", text: "#64748B" };
                  const statusCfg = STATUS_CFG[row.status] || { label: row.status, bg: "rgba(100,116,139,0.08)", text: "#64748B" };
                  
                  return (
                    <tr key={row.id} className="hover:bg-[#FAFAFA] transition-colors" style={{ height: 64 }}>
                      {/* Member Info */}
                      <td className="px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                            style={{ background: avatarBg }}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate text-[#0F172A]" title={row.fullName}>
                              {row.fullName}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              ID: {row.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5">
                        <span className="font-mono text-xs font-medium text-[#334155]">{row.phoneNumber || "—"}</span>
                      </td>

                      {/* Role */}
                      <td className="px-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: roleCfg.bg, color: roleCfg.text }}>
                          {roleCfg.label}
                        </span>
                      </td>

                      {/* Medical info */}
                      <td className="px-5">
                        <span className="text-xs font-medium text-slate-500">{formatMedicalInfo(row)}</span>
                      </td>

                      {/* Created date */}
                      <td className="px-5">
                        <span className="text-xs text-slate-500 font-medium">{formatCreatedDate(row.createdAt)}</span>
                      </td>

                      {/* Status */}
                      <td className="px-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: statusCfg.bg, color: statusCfg.text }}>
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          {row.role === "DOCTOR" && (
                            <button
                              onClick={() => {
                                setViewingCertificateUrl(row.certificateUrl || null);
                                setViewingDoctorName(row.fullName);
                              }}
                              disabled={!row.hasCertificate}
                              className={`w-7 h-7 flex items-center justify-center rounded-lg border border-[#E2E8F0] transition-colors ${
                                row.hasCertificate
                                  ? "hover:bg-sky-50 hover:text-[#0EA5E9] hover:border-sky-200 text-sky-500 cursor-pointer"
                                  : "bg-slate-50 text-slate-300 cursor-not-allowed border-slate-100"
                              }`}
                              title={row.hasCertificate ? "Xem chứng chỉ hành nghề" : "Chưa tải lên chứng chỉ"}
                            >
                              <Award size={13} />
                            </button>
                          )}
                          {row.id !== currentUser?.id ? (
                            <button
                              onClick={() => handleToggleStatus(row.id)}
                              disabled={togglingId === row.id}
                              className={`w-7 h-7 flex items-center justify-center rounded-lg border border-[#E2E8F0] hover:bg-slate-50 transition-colors cursor-pointer text-slate-500 ${
                                row.status === "ACTIVE" ? "hover:text-[#B91C1C] hover:border-red-200" : "hover:text-[#15803D] hover:border-emerald-200"
                              }`}
                              title={row.status === "ACTIVE" ? "Tạm khóa tài khoản" : "Mở khóa tài khoản"}
                            >
                              {togglingId === row.id ? (
                                <Loader2 size={13} className="animate-spin text-slate-400" />
                              ) : row.status === "ACTIVE" ? (
                                <Lock size={13} />
                              ) : (
                                <Unlock size={13} />
                              )}
                            </button>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-300 italic">Bản thân</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {!loading && filteredUsers.length > 0 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#E2E8F0] bg-slate-50/30">
              <p className="text-[11px] font-semibold text-slate-400">
                Hiển thị {Math.min(filteredUsers.length, (currentPage - 1) * itemsPerPage + 1)}–{Math.min(filteredUsers.length, currentPage * itemsPerPage)} trong số {filteredUsers.length} tài khoản
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2.5 text-xs font-semibold rounded-lg border border-[#E2E8F0] bg-white text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft size={13} />
                  Trước
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  if (
                    totalPages > 5 &&
                    pNum !== 1 &&
                    pNum !== totalPages &&
                    Math.abs(pNum - currentPage) > 1
                  ) {
                    if (pNum === 2 && currentPage > 3) return <span key="dots1" className="text-slate-300 px-1 text-xs">...</span>;
                    if (pNum === totalPages - 1 && currentPage < totalPages - 2) return <span key="dots2" className="text-slate-300 px-1 text-xs">...</span>;
                    return null;
                  }
                  
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`h-8 min-w-8 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        currentPage === pNum
                          ? "bg-[#0F172A] text-white"
                          : "border border-[#E2E8F0] bg-white text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-2.5 text-xs font-semibold rounded-lg border border-[#E2E8F0] bg-white text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  Tiếp
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Certificate Viewer Modal */}
      {viewingCertificateUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px]" onClick={() => setViewingCertificateUrl(null)} />
          <div className="relative bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-[640px] p-6 shadow-2xl text-left animate-[scaleIn_0.15s_ease-out] flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-4 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-[#0F172A]">Chứng chỉ hành nghề Bác sĩ</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Họ và tên: {viewingDoctorName}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingCertificateUrl(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Certificate display */}
            <div className="flex-1 overflow-auto flex items-center justify-center min-h-[300px] bg-slate-50 rounded-xl p-4 border border-[#E2E8F0]">
              {(() => {
                const isPdf = viewingCertificateUrl.toLowerCase().includes(".pdf") || viewingCertificateUrl.includes("response-content-type=application%2Fpdf");
                if (isPdf) {
                  return (
                    <iframe
                      src={viewingCertificateUrl}
                      className="w-full h-[450px] border-none rounded-lg bg-white"
                      title="Chứng chỉ PDF"
                    />
                  );
                } else {
                  return (
                    <img
                      src={viewingCertificateUrl}
                      alt="Chứng chỉ Bác sĩ"
                      className="max-w-full max-h-[450px] object-contain rounded-lg shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  );
                }
              })()}
            </div>

            <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#F1F5F9] shrink-0">
              <a
                href={viewingCertificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#0EA5E9] hover:underline"
              >
                Mở trong tab mới ↗
              </a>
              <button
                type="button"
                onClick={() => setViewingCertificateUrl(null)}
                className="h-9 px-5 text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none outline-none"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
