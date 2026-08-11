"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, UserPlus, Stethoscope, FlaskConical,
  FileText, Settings, Bell, ChevronDown, ChevronRight, X,
  CheckCircle2, Search, Upload, FileCheck, AlertCircle, ShieldCheck, LogOut, Eye, EyeOff, HeartPulse
} from "lucide-react";

import { fetchWithAuth, logoutApiCall } from "@/lib/auth";

/* ─── Types ─── */
type Status = "Active" | "Inactive" | "";
type Gender = "Male" | "Female" | "Other" | "";

/* ─── Shared styling ─── */
const INPUT_CLASS = "w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all bg-white";
const SELECT_CLASS = "w-full h-9 pl-3 pr-8 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-white appearance-none cursor-pointer transition-all";

/* ─── Field Label ─── */
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold mb-1.5 text-[#0F172A]">
      {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  );
}

/* ─── Section Heading ─── */
function SectionHeading({ num, title, sub }: { num: string; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <span className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
        style={{ width: 22, height: 22, fontSize: 11, background: "#0EA5E9", marginTop: 1 }}>
        {num}
      </span>
      <div>
        <p className="font-bold text-sm text-[#0F172A]">{title}</p>
        <p className="text-xs mt-0.5 text-[#64748B]">{sub}</p>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-[#F1F5F9]" />;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [expandedNav, setExpandedNav] = useState("Quản lý người dùng");

  /* Form states */
  const [fullName, setFullName]         = useState("");
  const [phone, setPhone]               = useState("");
  const [role, setRole]                 = useState<string>("");
  const [status, setStatus]             = useState<Status>("");
  const [dob, setDob]                   = useState("");
  const [gender, setGender]             = useState<Gender>("");
  const [address, setAddress]           = useState("");
  const [cccd, setCccd]                 = useState("");
  const [bhyt, setBhyt]                 = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [licenseFile, setLicenseFile]   = useState<File | null>(null);
  const [dragOver, setDragOver]         = useState(false);
  
  /* Section 4 states */
  const [height, setHeight]             = useState<string>("");
  const [weight, setWeight]             = useState<string>("");
  const [bloodType, setBloodType]       = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [currentSickness, setCurrentSickness] = useState("");

  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [createdId, setCreatedId]       = useState("");

  const [currentUser, setCurrentUser] = useState<{ fullName?: string; phoneNumber?: string; role?: string; roles?: string[] } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const profileRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isOnlyPatient = role === "PATIENT";

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing current user", e);
      }
    }
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutApiCall().finally(() => {
      router.push("/");
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "SA";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "SA";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim())  e.fullName = "Họ và tên là bắt buộc.";
    if (!phone.trim())     e.phone = "Số điện thoại là bắt buộc.";
    else if (!/^(\+?84|0)\d{9}$/.test(phone.replace(/\s/g, "")))
      e.phone = "Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912345678).";
    if (!role) e.role = "Vui lòng chọn vai trò.";
    if (!status) e.status = "Vui lòng chọn trạng thái tài khoản.";
    if (!dob)    e.dob    = "Ngày sinh là bắt buộc.";
    if (!gender) e.gender = "Vui lòng chọn giới tính.";
    if (!address.trim()) e.address = "Địa chỉ thường trú là bắt buộc.";
    if (role === "DOCTOR" && !licenseFile)
      e.license = "Bác sĩ bắt buộc phải tải lên chứng chỉ hành nghề.";
    if (role !== "PATIENT" && !password.trim())
      e.password = "Mật khẩu là bắt buộc.";
    else if (role !== "PATIENT" && password.length < 6)
      e.password = "Mật khẩu phải dài ít nhất 6 ký tự.";
    return e;
  };

  const handleCreate = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setIsSubmitting(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    const payload = {
      ...(role === "PATIENT" ? {} : { password: password.trim() }),
      role: role,
      fullName: fullName.trim(),
      gender: gender,
      dateOfBirth: dob,
      phoneNumber: phone.replace(/\s/g, ""),
      address: address.trim(),
      citizenIdentificationCode: cccd || null,
      healthInsuranceCode: bhyt || null,
      certificate: (role === "DOCTOR" && licenseFile) ? licenseFile.name : null,
      medicalHistory: medicalHistory.trim() || null,
      currentSickness: currentSickness.trim() || null,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      bloodType: bloodType || null,
    };

    console.log("HMS Frontend Sending Payload:", JSON.stringify(payload, null, 2));

    const formData = new FormData();
    const userBlob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    formData.append("user", userBlob);
    
    if (role === "DOCTOR" && licenseFile) {
      formData.append("certificate", licenseFile);
    }

    fetchWithAuth(`${apiUrl}/api/admin/users`, {
      method: "POST",
      body: formData
    })
      .then(async (res: Response) => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await res.json();
          if (!result.success) {
            throw new Error(result.message || "Không thể tạo tài khoản người dùng.");
          }
          return result.data;
        } else {
          if (!res.ok) {
            throw new Error(`Lỗi HTTP ${res.status}: Không thể tạo tài khoản người dùng.`);
          }
          throw new Error("Định dạng phản hồi từ máy chủ không hợp lệ.");
        }
      })
      .then((data: any) => {
        if (data && data.id) {
          setCreatedId(data.id);
        }
        setSubmitted(true);
      })
      .catch((err: any) => {
        setErrors({ general: err.message || "Không thể kết nối đến máy chủ quản lý người dùng." });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleReset = () => {
    setFullName(""); setPhone(""); setRole(""); setStatus("");
    setDob(""); setGender(""); setAddress(""); setCccd(""); setBhyt("");
    setPassword(""); setShowPassword(false); setLicenseFile(null);
    setHeight(""); setWeight(""); setBloodType(""); setMedicalHistory(""); setCurrentSickness("");
    setErrors({}); setSubmitted(false); setCreatedId("");
  };

  const handleCancel = () => {
    if (confirm("Bạn có chắc chắn muốn hủy đăng ký người dùng? Mọi thông tin đã nhập sẽ bị mất.")) {
      router.push("/");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((p) => ({ ...p, license: "Kích thước chứng chỉ không được vượt quá 5MB." }));
        setLicenseFile(null);
      } else {
        setLicenseFile(file);
        setErrors((p) => ({ ...p, license: "" }));
      }
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((p) => ({ ...p, license: "Kích thước chứng chỉ không được vượt quá 5MB." }));
        setLicenseFile(null);
      } else {
        setLicenseFile(file);
        setErrors((p) => ({ ...p, license: "" }));
      }
    }
  };

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
          <div className="flex items-center justify-center rounded-lg shrink-0 w-8 h-8 bg-[#0EA5E9]"
            style={{ boxShadow: "0 0 16px rgba(14,165,233,0.4)" }}>
            <span className="text-white text-base font-bold">+</span>
          </div>
          <div>
            <p className="text-white font-bold leading-none text-[13px]">HMS</p>
            <p className="leading-none mt-1 tracking-wide text-[10px] text-[#475569]">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 flex flex-col gap-0.5 overflow-y-auto">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-all text-[#64748B] hover:bg-white/5 hover:text-[#94A3B8] cursor-pointer">
            <LayoutDashboard size={15} strokeWidth={1.75} />
            <span className="text-xs truncate">Bảng điều khiển</span>
          </button>
          
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
                <button className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-left transition-all text-[#64748B] hover:text-[#94A3B8] hover:bg-white/5 cursor-pointer">
                  <span className="rounded-full shrink-0 w-1 h-1 bg-[#334155]" />
                  <span className="text-[11px]">Tất cả người dùng</span>
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-left transition-all text-[#38BDF8] cursor-pointer">
                  <span className="rounded-full shrink-0 w-1.5 h-1.5 bg-[#38BDF8]" />
                  <span className="text-[11px] font-semibold">Tạo người dùng</span>
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-left transition-all text-[#64748B] hover:text-[#94A3B8] hover:bg-white/5 cursor-pointer">
                  <span className="rounded-full shrink-0 w-1 h-1 bg-[#334155]" />
                  <span className="text-[11px]">Vai trò & Quyền hạn</span>
                </button>
              </div>
            )}
          </div>

          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-all text-[#64748B] hover:bg-white/5 hover:text-[#94A3B8] cursor-pointer">
            <Stethoscope size={15} strokeWidth={1.75} />
            <span className="text-xs flex-1 truncate">Lâm sàng</span>
            <span className="font-bold rounded-full flex items-center justify-center shrink-0 text-white bg-[#EF4444]"
              style={{ fontSize: 9, minWidth: 16, height: 16, padding: "0 4px" }}>
              3
            </span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-all text-[#64748B] hover:bg-white/5 hover:text-[#94A3B8] cursor-pointer">
            <FlaskConical size={15} strokeWidth={1.75} />
            <span className="text-xs truncate">Nghiên cứu</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-all text-[#64748B] hover:bg-white/5 hover:text-[#94A3B8] cursor-pointer">
            <FileText size={15} strokeWidth={1.75} />
            <span className="text-xs truncate">Báo cáo</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-all text-[#64748B] hover:bg-white/5 hover:text-[#94A3B8] cursor-pointer">
            <Settings size={15} strokeWidth={1.75} />
            <span className="text-xs truncate">Cấu hình</span>
          </button>
        </nav>

        <div className="px-4 py-4 border-t border-white/8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-full shrink-0 font-bold text-[#38BDF8] bg-[#0EA5E9]/20 border border-[#0EA5E9]/30 text-xs w-8 h-8">
              {getInitials(currentUser?.fullName)}
            </div>
            <div className="min-w-0">
              <p className="font-bold truncate text-[11px] text-[#CBD5E1]">{currentUser?.fullName || "Super Admin"}</p>
              <p className="truncate text-[10px] text-[#475569]">{currentUser?.phoneNumber || "ADM-20241105"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* ─── Header ─── */}
        <header className="shrink-0 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Quản lý người dùng</span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="font-semibold text-[#0F172A]">Tạo người dùng</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-[#64748B] cursor-pointer">
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold" style={{ fontSize: 8 }}>3</span>
            </button>
            <div ref={profileRef} className="relative">
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center justify-center rounded-full font-bold text-white text-xs w-8 h-8 bg-[#0091FF] cursor-pointer"
              >
                {getInitials(currentUser?.fullName)}
              </div>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-50 py-1.5 animate-[fadeIn_0.15s_ease-out]">
                  <div className="px-4 py-2 border-b border-[#F1F5F9]">
                    <p className="text-[12px] font-semibold text-[#0F172A] truncate">{currentUser?.fullName || "Super Admin"}</p>
                    <p className="text-[10px] text-[#64748B] truncate mt-0.5">{currentUser?.phoneNumber || "ADM-20241105"}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-[12px] text-[#EF4444] hover:bg-[#FFF1F2] transition-colors cursor-pointer border-none outline-none"
                  >
                    <LogOut size={13} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── Main Scrollable Area ─── */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          
          {/* Page title */}
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-1 text-[#0F172A]">
              <UserPlus size={19} className="text-[#0EA5E9]" />
              <h1 className="text-xl font-bold">Tạo Tài Khoản Người Dùng Mới</h1>
            </div>
            <p className="text-xs text-[#64748B]">
              Đăng ký thành viên y tế hoặc bệnh nhân mới. Các trường có dấu <span className="text-rose-500">*</span> là bắt buộc.
            </p>
          </div>

          {submitted ? (
            /* ─── Success Panel ─── */
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-12 flex flex-col items-center text-center max-w-[520px] mx-auto mt-8">
              <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-5">
                <CheckCircle2 size={32} strokeWidth={1.5} className="text-[#10B981]" />
              </div>
              <h2 className="text-[#0F172A] font-bold text-xl mb-2">Tạo Tài Khoản Thành Công</h2>
              <p className="text-[#64748B] text-sm leading-relaxed mb-6">
                Thành viên <span className="font-semibold text-[#0F172A]">{fullName}</span> đã được thêm vào hệ thống với vai trò{" "}
                <span className="font-semibold text-[#0EA5E9]">
                  {role === "ADMIN" ? "Quản trị viên" : role === "DOCTOR" ? "Bác sĩ" : role === "RESEARCHER" ? "Nghiên cứu sinh" : role === "PATIENT" ? "Bệnh nhân" : "Nhân viên y tế"}
                </span>.
              </p>
              <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-5 py-4 mb-6 text-left">
                <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-1.5">Mã định danh hệ thống</p>
                <p className="font-mono font-bold text-[#0EA5E9] text-lg tracking-widest">
                  {createdId || (
                    (role === "ADMIN" ? "ADM" : role === "DOCTOR" ? "DR" : role === "RESEARCHER" ? "RES" : role === "PATIENT" ? "PAT" : "STF") +
                    "-" + Date.now().toString().slice(-8)
                  )}
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={handleReset}
                  className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-[13px] font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-all cursor-pointer">
                  Tạo Thêm Tài Khoản
                </button>
                <button onClick={() => router.push("/")}
                  className="flex-1 h-10 rounded-lg bg-[#0EA5E9] text-white text-[13px] font-semibold hover:bg-[#0284C7] transition-colors shadow-sm shadow-sky-100 cursor-pointer">
                  Quay Về Trang Chủ
                </button>
              </div>
            </div>
          ) : (
            /* ─── Form Card ─── */
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
              
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-3">
                  <span className="w-1 h-5 rounded-full shrink-0 bg-[#0EA5E9]" />
                  <span className="font-bold text-sm text-[#0F172A]">Tài khoản nhân sự mới</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">4 phần</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#92400E]">
                  <ShieldCheck size={14} className="text-amber-500" />
                  Chế độ xem Lâm sàng — Giới hạn
                </div>
              </div>

              {/* Form body */}
              <div className="px-7 py-7 space-y-8">
                {errors.general && (
                  <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[13px] rounded-xl flex items-start gap-2.5">
                    <AlertCircle size={16} className="mt-0.5 text-[#EF4444] flex-shrink-0" />
                    <p className="leading-relaxed">{errors.general}</p>
                  </div>
                )}

                {/* ── Section 01: Tài khoản & Vai trò ── */}
                <section>
                  <SectionHeading num="01" title="Tài khoản & Vai trò"
                    sub="Thông tin đăng nhập, vai trò hệ thống và trạng thái truy cập" />
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <Label required>Họ và Tên</Label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: "" })); }}
                        placeholder="ví dụ: Nguyễn Thị Lan" 
                        className={INPUT_CLASS}
                        style={{ borderColor: errors.fullName ? "#EF4444" : undefined }} 
                      />
                      {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <Label required>Số điện thoại</Label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value.replace(/[^\d+\s]/g, "").slice(0, 14)); setErrors(p => ({ ...p, phone: "" })); }}
                        placeholder="ví dụ: 0912345678" 
                        className={INPUT_CLASS}
                        style={{ borderColor: errors.phone ? "#EF4444" : undefined }}
                      />
                      <p className="text-[10px] text-[#94A3B8] mt-1">+84 hoặc 0 + 9 chữ số</p>
                      {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <Label required>Vai trò</Label>
                      <div className="relative">
                        <select 
                          value={role}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRole(val);
                            setErrors(p => ({ ...p, role: "", license: "" }));
                          }}
                          className={SELECT_CLASS}
                          style={{ color: role ? "#0F172A" : "#64748B", borderColor: errors.role ? "#EF4444" : undefined }}
                        >
                          <option value="">Chọn vai trò...</option>
                          <option value="ADMIN">ADMIN (Quản trị viên)</option>
                          <option value="DOCTOR">DOCTOR (Bác sĩ)</option>
                          <option value="STAFF">STAFF (Nhân viên y tế)</option>
                          <option value="RESEARCHER">RESEARCHER (Nghiên cứu sinh)</option>
                          <option value="PATIENT">PATIENT (Bệnh nhân)</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      </div>
                      {errors.role && <p className="text-xs text-rose-500 mt-1">{errors.role}</p>}
                    </div>

                    <div>
                      <Label required>Trạng thái tài khoản</Label>
                      <div className="relative">
                        <select 
                          value={status}
                          onChange={(e) => { setStatus(e.target.value as Status); setErrors(p => ({ ...p, status: "" })); }}
                          className={SELECT_CLASS}
                          style={{ color: status ? "#0F172A" : "#64748B", borderColor: errors.status ? "#EF4444" : undefined }}
                        >
                          <option value="">Chọn trạng thái...</option>
                          <option value="Active">Hoạt động</option>
                          <option value="Inactive">Tạm khóa</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      </div>
                      {errors.status && <p className="text-xs text-rose-500 mt-1">{errors.status}</p>}
                    </div>



                    {!isOnlyPatient && (
                      <div className="col-span-2">
                        <Label required>Mật khẩu</Label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                            placeholder="Nhập mật khẩu..."
                            className="w-full h-9 pl-3 pr-10 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all bg-white"
                            style={{ borderColor: errors.password ? "#EF4444" : undefined }} 
                          />
                          <button type="button" onClick={() => setShowPassword(s => !s)}
                            className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-none outline-none">
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <p className="text-xs mt-1.5 text-[#94A3B8]">Mật khẩu phải dài ít nhất 6 ký tự và sẽ được mã hóa bảo mật.</p>
                        {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
                      </div>
                    )}
                  </div>
                </section>

                <Divider />

                {/* ── Section 02: Thông tin cá nhân ── */}
                <section>
                  <SectionHeading num="02" title="Thông tin cá nhân"
                    sub="Chi tiết nhân khẩu học phục vụ liên kết hồ sơ bệnh nhân" />
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <Label required>Ngày sinh</Label>
                      <input 
                        type="date" 
                        value={dob}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => { setDob(e.target.value); setErrors(p => ({ ...p, dob: "" })); }}
                        className={INPUT_CLASS} 
                        style={{ borderColor: errors.dob ? "#EF4444" : undefined }}
                      />
                      {errors.dob && <p className="text-xs text-rose-500 mt-1">{errors.dob}</p>}
                    </div>
                    <div>
                      <Label required>Giới tính</Label>
                      <div className="relative">
                        <select 
                          value={gender}
                          onChange={(e) => { setGender(e.target.value as Gender); setErrors(p => ({ ...p, gender: "" })); }}
                          className={SELECT_CLASS}
                          style={{ color: gender ? "#0F172A" : "#64748B", borderColor: errors.gender ? "#EF4444" : undefined }}
                        >
                          <option value="">Chọn giới tính...</option>
                          <option value="Male">Nam</option>
                          <option value="Female">Nữ</option>
                          <option value="Other">Khác</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      </div>
                      {errors.gender && <p className="text-xs text-rose-500 mt-1">{errors.gender}</p>}
                    </div>
                    <div className="col-span-2">
                      <Label required>Địa chỉ thường trú</Label>
                      <textarea 
                        rows={3}
                        value={address}
                        onChange={(e) => { setAddress(e.target.value); setErrors(p => ({ ...p, address: "" })); }}
                        placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                        className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 resize-none transition-all bg-white"
                        style={{ borderColor: errors.address ? "#EF4444" : undefined }}
                      />
                      {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address}</p>}
                    </div>
                  </div>
                </section>

                <Divider />

                {/* ── Section 03: Số định danh ── */}
                <section>
                  <SectionHeading num="03" title="Số định danh"
                    sub="Tùy chọn — để trống nếu chưa được cấp" />
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <Label>Số CCCD (Căn cước công dân)</Label>
                      <input 
                        type="text"
                        value={cccd}
                        onChange={(e) => setCccd(e.target.value.replace(/\D/g, "").slice(0, 12))}
                        placeholder="ví dụ: 079085012345"
                        className={INPUT_CLASS}
                        style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}
                      />
                      <p className="text-[10px] text-[#94A3B8] mt-1">Số định danh công dân 12 chữ số — có thể để trống</p>
                    </div>
                    <div>
                      <Label>Mã thẻ BHYT (Bảo hiểm y tế)</Label>
                      <input 
                        type="text"
                        value={bhyt}
                        onChange={(e) => setBhyt(e.target.value.toUpperCase().slice(0, 15))}
                        placeholder="ví dụ: HS4680123456789"
                        className={INPUT_CLASS}
                        style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}
                      />
                      <p className="text-[10px] text-[#94A3B8] mt-1">Mã số thẻ 15 ký tự — có thể để trống</p>
                    </div>
                  </div>
                </section>

                {/* ── Section 04: Thông tin Y khoa & Lâm sinh ── */}
                <Divider />
                <section>
                  <div className="flex items-start gap-3 mb-5">
                    <span className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
                      style={{ width: 22, height: 22, fontSize: 11, background: "#0EA5E9", marginTop: 1 }}>
                      04
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-[#0F172A]">Thông tin Y khoa & Lâm sinh</p>
                        <HeartPulse size={15} className="text-[#EF4444]" />
                      </div>
                      <p className="text-xs mt-0.5 text-[#64748B]">
                        Tùy chọn — Sử dụng phục vụ hồ sơ điều trị lâm sàng
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-x-5 gap-y-5 mb-5">
                    <div>
                      <Label>Chiều cao (cm)</Label>
                      <input 
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="ví dụ: 170"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <Label>Cân nặng (kg)</Label>
                      <input 
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="ví dụ: 65"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <Label>Nhóm máu</Label>
                      <div className="relative">
                        <select 
                          value={bloodType}
                          onChange={(e) => setBloodType(e.target.value)}
                          className={SELECT_CLASS}
                          style={{ color: bloodType ? "#0F172A" : "#64748B" }}
                        >
                          <option value="">Chọn nhóm máu...</option>
                          {["A", "B", "AB", "O", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <Label>Tiền sử bệnh lý</Label>
                      <textarea 
                        rows={4}
                        value={medicalHistory}
                        onChange={(e) => setMedicalHistory(e.target.value)}
                        placeholder="Nhập tiền sử bệnh lý cũ nếu có..."
                        className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 resize-none transition-all bg-white"
                      />
                    </div>
                    <div>
                      <Label>Bệnh lý hiện tại</Label>
                      <textarea 
                        rows={4}
                        value={currentSickness}
                        onChange={(e) => setCurrentSickness(e.target.value)}
                        placeholder="Nhập tình trạng bệnh lý hiện tại..."
                        className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 resize-none transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Info callout */}
                  <div className="mt-5 flex items-start gap-3 px-4 py-4 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF]">
                    <span className="w-4 h-4 rounded-full bg-[#0EA5E9]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#0EA5E9] text-[9px] font-bold">i</span>
                    </span>
                    <p className="text-xs leading-relaxed text-[#0369A1]">
                      Hệ thống sẽ gửi mã số nhân viên và mật khẩu tạm thời qua SMS. Người dùng bắt buộc phải đổi mật khẩu ở lần đăng nhập đầu tiên. Mọi sự kiện đều được ghi nhật ký theo{" "}
                      <strong>Nghị định 13/2023/NĐ-CP</strong>.
                    </p>
                  </div>
                </section>

                {/* ── Section: Chứng chỉ hành nghề (Bác sĩ) ── */}
                {role === "DOCTOR" && (
                  <>
                    <Divider />
                    <section>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-7 h-7 rounded-lg bg-[#0EA5E9]/10 border border-[#BAE6FD] flex items-center justify-center flex-shrink-0">
                          <FileCheck size={14} className="text-[#0EA5E9]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#0F172A] leading-none flex items-center gap-2">
                            Chứng chỉ hành nghề Bác sĩ
                            <span className="text-[10px] font-semibold text-[#EF4444] bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                              BẮT BUỘC
                            </span>
                          </p>
                          <p className="text-[11px] text-[#94A3B8] leading-none mt-0.5">
                            Yêu cầu đối với vai trò Bác sĩ — chứng chỉ hành nghề được cấp bởi Bộ Y tế
                          </p>
                        </div>
                      </div>

                      {licenseFile ? (
                        /* Uploaded state */
                        <div className="flex items-center gap-4 p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                            <FileCheck size={18} className="text-[#10B981]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#0F172A] truncate">{licenseFile.name}</p>
                            <p className="text-[11px] text-[#64748B]">
                              {(licenseFile.size / 1024).toFixed(1)} KB · Tải lên thành công
                            </p>
                          </div>
                          <button type="button" onClick={() => setLicenseFile(null)}
                            className="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:border-[#EF4444] transition-all bg-transparent cursor-pointer">
                            <X size={13} strokeWidth={2} />
                          </button>
                        </div>
                      ) : (
                        /* Drop zone */
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={handleDrop}
                          onClick={() => fileRef.current?.click()}
                          className="flex flex-col items-center justify-center gap-3 py-8 px-6 cursor-pointer transition-all duration-150 rounded-xl"
                          style={{
                            border: `2px dashed ${errors.license ? "#EF4444" : dragOver ? "#0EA5E9" : "#CBD5E1"}`,
                            background: dragOver ? "#F0F9FF" : errors.license ? "#FFF1F2" : "#FAFAFA",
                          }}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                            dragOver ? "bg-[#0EA5E9]/10" : "bg-[#F1F5F9]"
                          }`}>
                            <Upload size={20} className={dragOver ? "text-[#0EA5E9]" : "text-[#94A3B8]"} />
                          </div>
                          <div className="text-center">
                            <p className="text-[13px] font-semibold text-[#0F172A]">
                              {dragOver ? "Thả tệp để tải lên" : "Tải lên chứng chỉ hành nghề Bác sĩ"}
                            </p>
                            <p className="text-[11px] text-[#94A3B8] mt-1">
                              Kéo & thả hoặc <span className="text-[#0EA5E9] font-medium">chọn tệp</span> · PDF, JPG, PNG tối đa 10 MB
                            </p>
                            <p className="text-[10px] text-[#CBD5E1] mt-1.5 italic">Chỉ bắt buộc đối với Bác sĩ</p>
                          </div>
                          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFilePick} />
                        </div>
                      )}

                      {errors.license && (
                        <p className="flex items-center gap-1 text-[11px] text-[#EF4444] mt-1.5">
                          <AlertCircle size={10} strokeWidth={2} />{errors.license}
                        </p>
                      )}
                    </section>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-7 py-4 border-t border-[#F1F5F9] bg-[#F8FAFC]">
                <p className="text-[11px] text-[#CBD5E1]">Hệ thống Quản trị HMS · v2.4.1 · Mọi sự kiện khởi tạo đều được kiểm toán</p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={handleCancel}
                    className="h-9 px-5 text-sm font-semibold border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors text-[#64748B] cursor-pointer bg-white">
                    Hủy
                  </button>
                  <button type="button" onClick={handleCreate} disabled={isSubmitting}
                    className="h-9 px-5 text-sm font-bold text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer bg-[#0091FF] disabled:opacity-75 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        Tạo tài khoản
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
