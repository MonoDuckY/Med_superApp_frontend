"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Users, ChevronDown, ChevronRight, X, Loader2, ArrowLeft, Calendar, 
  Eye, EyeOff, Upload, Trash2, CheckCircle2, AlertCircle, Shield, Award, LogOut, HeartPulse, Settings, Bell, ShieldCheck
} from "lucide-react";
import { fetchWithAuth, logoutApiCall } from "@/lib/auth";
import Logo from "@/components/Logo";

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

function EditUserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://47.131.58.207:8080";

  // Sidebar navigation status
  const [expandedNav, setExpandedNav] = useState("Quản lý người dùng");

  // Form states
  const [fullName, setFullName]         = useState("");
  const [phone, setPhone]               = useState("");
  const [dob, setDob]                   = useState("");
  const [gender, setGender]             = useState("");
  const [address, setAddress]           = useState("");
  const [cccd, setCccd]                 = useState("");
  const [bhyt, setBhyt]                 = useState("");
  const [role, setRole]                 = useState("");
  const [status, setStatus]             = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Patient states
  const [height, setHeight]             = useState("");
  const [weight, setWeight]             = useState("");
  const [bloodType, setBloodType]       = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [currentSickness, setCurrentSickness] = useState("");

  // Doctor certificate states
  const [existingCertUrl, setExistingCertUrl] = useState("");
  const [newLicenseFile, setNewLicenseFile]   = useState<File | null>(null);
  const [dragOver, setDragOver]         = useState(false);

  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [loadingUser, setLoadingUser]   = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [currentUser, setCurrentUser]   = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load Super Admin info
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch target user data on mount
  useEffect(() => {
    if (!userId) {
      setLoadingUser(false);
      return;
    }
    setLoadingUser(true);
    fetchWithAuth(`${apiUrl}/api/admin/users/${userId}`)
      .then(async (res) => {
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            const u = result.data;
            setFullName(u.fullName || "");
            setPhone(u.phoneNumber || "");
            setDob(u.dateOfBirth || "");
            setGender(u.gender || "");
            setAddress(u.address || "");
            setCccd(u.citizenIdentificationCode || "");
            setBhyt(u.healthInsuranceCode || "");
            setRole(u.role ? u.role.toUpperCase() : "");
            setStatus(u.status === "ACTIVE" ? "Active" : "Inactive");
            setExistingCertUrl(u.certificateUrl || "");

            // Patient fields
            setHeight(u.height ? String(u.height) : "");
            setWeight(u.weight ? String(u.weight) : "");
            setBloodType(u.bloodType || "");
            setMedicalHistory(u.medicalHistory || "");
            setCurrentSickness(u.currentSickness || "");
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingUser(false));
  }, [userId, apiUrl]);

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
    if (!role) e.role = "Vui lòng chọn vai trò.";
    if (!status) e.status = "Vui lòng chọn trạng thái tài khoản.";
    if (!dob)    e.dob    = "Ngày sinh là bắt buộc.";
    if (!gender) e.gender = "Vui lòng chọn giới tính.";
    if (!address.trim()) e.address = "Địa chỉ thường trú là bắt buộc.";
    if (role === "DOCTOR" && !existingCertUrl && !newLicenseFile)
      e.license = "Bác sĩ bắt buộc phải có chứng chỉ hành nghề.";
    if (password.trim() && password.length < 6)
      e.password = "Mật khẩu phải dài ít nhất 6 ký tự.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setIsSubmitting(true);

    const payload = {
      ...(password.trim() ? { password: password.trim() } : {}),
      role: role,
      status: status === "Active" ? "ACTIVE" : "INACTIVE",
      fullName: fullName.trim(),
      gender: gender,
      dateOfBirth: dob,
      phoneNumber: phone.replace(/\s/g, ""),
      address: address.trim(),
      citizenIdentificationCode: cccd || null,
      healthInsuranceCode: bhyt || null,
      medicalHistory: role === "PATIENT" ? (medicalHistory.trim() || null) : null,
      currentSickness: role === "PATIENT" ? (currentSickness.trim() || null) : null,
      height: (role === "PATIENT" && height) ? parseFloat(height) : null,
      weight: (role === "PATIENT" && weight) ? parseFloat(weight) : null,
      bloodType: (role === "PATIENT" && bloodType) ? bloodType : null,
    };

    const formData = new FormData();
    const userBlob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    formData.append("user", userBlob);

    if (role === "DOCTOR" && newLicenseFile) {
      formData.append("certificate", newLicenseFile);
    }

    fetchWithAuth(`${apiUrl}/api/admin/users/${userId}`, {
      method: "PATCH",
      body: formData
    })
      .then(async (res) => {
        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            setSubmitted(true);
            setTimeout(() => {
              router.push("/user-management");
            }, 1500);
          } else {
            throw new Error(result.message || "Cập nhật tài khoản người dùng thất bại.");
          }
        } else {
          const text = await res.text();
          throw new Error(text || "Không thể kết nối đến máy chủ.");
        }
      })
      .catch((err: any) => {
        setErrors({ general: err.message || "Không thể kết nối đến máy chủ quản lý người dùng." });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleCancel = () => {
    router.push("/user-management");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((p) => ({ ...p, license: "Kích thước chứng chỉ không được vượt quá 5MB." }));
        setNewLicenseFile(null);
      } else {
        setNewLicenseFile(file);
        setErrors((p) => ({ ...p, license: "" }));
      }
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((p) => ({ ...p, license: "Kích thước chứng chỉ không được vượt quá 5MB." }));
        setNewLicenseFile(null);
      } else {
        setNewLicenseFile(file);
        setErrors((p) => ({ ...p, license: "" }));
      }
    }
  };

  if (loadingUser) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-7 w-7 text-[#0EA5E9]" />
          <p className="text-slate-400 text-xs font-semibold">Đang tải thông tin tài khoản người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      
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
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left cursor-pointer bg-[#0EA5E9]/15 text-[#38BDF8] border-none"
            >
              <Users size={15} strokeWidth={1.75} />
              <span className="text-xs font-medium flex-1 truncate">Quản lý người dùng</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${expandedNav === "Quản lý người dùng" ? "rotate-180" : ""}`} />
            </button>
            {expandedNav === "Quản lý người dùng" && (
              <div className="ml-4 mt-0.5 flex flex-col gap-0.5 pl-3 border-l border-white/8">
                <button 
                  onClick={() => router.push("/user-management")}
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-left transition-all text-[#64748B] hover:text-[#94A3B8] hover:bg-white/5 border-none bg-transparent cursor-pointer"
                >
                  <span className="rounded-full shrink-0 w-1 h-1 bg-[#334155]" />
                  <span className="text-[11px]">Tất cả người dùng</span>
                </button>
                <button 
                  onClick={() => router.push("/user-management/create-user")}
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-left transition-all text-[#64748B] hover:text-[#94A3B8] hover:bg-white/5 border-none bg-transparent cursor-pointer"
                >
                  <span className="rounded-full shrink-0 w-1 h-1 bg-[#334155]" />
                  <span className="text-[11px]">Tạo người dùng mới</span>
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
              className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0 ml-1 border-none bg-transparent"
              title="Đăng xuất"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* ─── Header ─── */}
        <header className="shrink-0 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-1.5 text-xs text-left">
            <span className="text-slate-400">Quản lý người dùng</span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="font-semibold text-[#0F172A]">Chỉnh sửa người dùng</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-[#64748B] cursor-pointer border-none bg-transparent">
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
                  <div className="px-4 py-2 border-b border-[#F1F5F9] text-left">
                    <p className="text-[12px] font-semibold text-[#0F172A] truncate">{currentUser?.fullName || "Super Admin"}</p>
                    <p className="text-[10px] text-[#64748B] truncate mt-0.5">{currentUser?.phoneNumber || "ADM-20241105"}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-[12px] text-[#EF4444] hover:bg-[#FFF1F2] transition-colors cursor-pointer border-none outline-none bg-transparent"
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
          <div className="mb-6 text-left">
            <div className="flex items-center gap-2.5 mb-1 text-[#0F172A]">
              <Settings size={19} className="text-[#0EA5E9]" />
              <h1 className="text-xl font-bold">Chỉnh Sửa Tài Khoản Người Dùng</h1>
            </div>
            <p className="text-xs text-[#64748B]">
              Cập nhật vai trò, trạng thái, mật khẩu và thông tin cá nhân của thành viên. Các trường có dấu <span className="text-rose-500">*</span> là bắt buộc.
            </p>
          </div>

          {submitted ? (
            /* ─── Success Panel ─── */
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-12 flex flex-col items-center text-center max-w-[520px] mx-auto mt-8">
              <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-5">
                <CheckCircle2 size={32} strokeWidth={1.5} className="text-[#10B981]" />
              </div>
              <h2 className="text-[#0F172A] font-bold text-xl mb-2">Cập Nhật Thành Công</h2>
              <p className="text-[#64748B] text-sm leading-relaxed mb-6">
                Thông tin của thành viên <span className="font-semibold text-[#0F172A]">{fullName}</span> đã được cập nhật thành công trên hệ thống.
              </p>
              <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-5 py-4 mb-6">
                <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-1.5">Mã định danh người dùng</p>
                <p className="font-mono font-bold text-[#0EA5E9] text-base tracking-widest">
                  {userId}
                </p>
              </div>
              <button 
                onClick={() => router.push("/user-management")}
                className="w-full h-10 rounded-lg bg-[#0EA5E9] text-white text-[13px] font-semibold hover:bg-[#0284C7] transition-colors shadow-sm shadow-sky-100 cursor-pointer border-none"
              >
                Quay Lại Danh Sách Người Dùng
              </button>
            </div>
          ) : (
            /* ─── Form Card ─── */
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden text-left">
              
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-3">
                  <span className="w-1 h-5 rounded-full shrink-0 bg-[#0EA5E9]" />
                  <span className="font-bold text-sm text-[#0F172A]">Thông tin tài khoản chỉnh sửa</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">ID: {userId}</span>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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
                        type="text" 
                        value={phone}
                        disabled
                        className={`${INPUT_CLASS} bg-slate-50 text-slate-400 font-medium cursor-not-allowed border-slate-200`}
                      />
                      <p className="text-[10px] text-[#94A3B8] mt-1">Số điện thoại là duy nhất của tài khoản và không thể chỉnh sửa.</p>
                    </div>

                    <div>
                      <Label required>Vai trò</Label>
                      <div className="relative">
                        <select 
                          value={role}
                          onChange={(e) => {
                            setRole(e.target.value);
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
                          onChange={(e) => { setStatus(e.target.value); setErrors(p => ({ ...p, status: "" })); }}
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

                    <div className="col-span-1 md:col-span-2">
                      <Label>Mật khẩu mới (Bỏ trống nếu giữ nguyên)</Label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                          placeholder="Nhập mật khẩu mới..."
                          className="w-full h-9 pl-3 pr-10 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all bg-white"
                          style={{ borderColor: errors.password ? "#EF4444" : undefined }} 
                        />
                        <button type="button" onClick={() => setShowPassword(s => !s)}
                          className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-none outline-none">
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <p className="text-xs mt-1.5 text-[#94A3B8]">Chỉ nhập khi cần thiết đặt lại mật khẩu cho thành viên. Mật khẩu mới tối thiểu 6 ký tự.</p>
                      {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
                    </div>
                  </div>
                </section>

                <Divider />

                {/* ── Section 02: Thông tin cá nhân ── */}
                <section>
                  <SectionHeading num="02" title="Thông tin cá nhân"
                    sub="Chi tiết nhân khẩu học phục vụ liên kết hồ sơ bệnh nhân" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <Label required>Ngày sinh</Label>
                      <input 
                        type="date" 
                        value={dob}
                        max={new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" })}
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
                          onChange={(e) => { setGender(e.target.value); setErrors(p => ({ ...p, gender: "" })); }}
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
                    <div className="col-span-1 md:col-span-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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

                {/* ── Section 04: Chứng chỉ hành nghề Bác sĩ ── */}
                {role === "DOCTOR" && (
                  <>
                    <Divider />
                    <section>
                      <SectionHeading num="04" title="Chứng chỉ hành nghề"
                        sub="Chứng chỉ y khoa bắt buộc đối với tài khoản vai trò Bác sĩ" />
                      
                      {existingCertUrl && !newLicenseFile && (
                        <div className="flex items-center gap-4 p-4 border border-[#E2E8F0] rounded-xl bg-slate-50 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                            <Award className="text-sky-500" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-slate-700 truncate">Chứng chỉ hành nghề hiện tại</p>
                            <a href={existingCertUrl} target="_blank" rel="noreferrer" className="text-[10px] text-[#0EA5E9] hover:underline truncate block">
                              Mở xem chi tiết tài liệu chứng chỉ đã tải lên ↗
                            </a>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => fileRef.current?.click()}
                            className="h-8 px-3 text-[11px] font-bold text-sky-600 bg-sky-50 border border-sky-100 hover:bg-sky-100 rounded-lg cursor-pointer transition-colors"
                          >
                            Thay đổi tệp
                          </button>
                        </div>
                      )}

                      <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFilePick} />

                      {(!existingCertUrl || newLicenseFile) && (
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
                              {newLicenseFile ? `Đã chọn: ${newLicenseFile.name}` : dragOver ? "Thả tệp để tải lên" : "Tải lên chứng chỉ hành nghề Bác sĩ mới"}
                            </p>
                            <p className="text-[11px] text-[#94A3B8] mt-1">
                              {newLicenseFile ? `${(newLicenseFile.size / 1024 / 1024).toFixed(2)} MB` : "Kéo & thả hoặc chọn tệp · PDF, JPG, PNG tối đa 5 MB"}
                            </p>
                          </div>
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

                {/* ── Section 05: Thông tin Y khoa & Lâm sinh ── */}
                {role === "PATIENT" && (
                  <>
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-5 mb-5">
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
                          <input 
                            type="text"
                            value={bloodType}
                            onChange={(e) => setBloodType(e.target.value.toUpperCase())}
                            placeholder="ví dụ: O+"
                            className={INPUT_CLASS}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-y-5">
                        <div>
                          <Label>Tiền sử bệnh lý (Medical History)</Label>
                          <textarea 
                            rows={3}
                            value={medicalHistory}
                            onChange={(e) => setMedicalHistory(e.target.value)}
                            placeholder="Nhập tiền sử bệnh nền, dị ứng, phẫu thuật trước đây..."
                            className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 resize-none transition-all bg-white"
                          />
                        </div>
                        <div>
                          <Label>Tình trạng bệnh hiện tại (Current Sickness)</Label>
                          <textarea 
                            rows={3}
                            value={currentSickness}
                            onChange={(e) => setCurrentSickness(e.target.value)}
                            placeholder="Nhập tình trạng bệnh đang điều trị lâm sàng..."
                            className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 resize-none transition-all bg-white"
                          />
                        </div>
                      </div>
                    </section>
                  </>
                )}

              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-7 py-4 border-t border-[#F1F5F9] bg-[#F8FAFC]">
                <p className="text-[11px] text-[#CBD5E1]">Hệ thống Quản trị HMS · v2.4.1 · Mọi sự kiện chỉnh sửa đều được kiểm toán</p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={handleCancel}
                    className="h-9 px-5 text-sm font-semibold border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors text-[#64748B] cursor-pointer bg-white">
                    Hủy
                  </button>
                  <button type="button" onClick={handleSave} disabled={isSubmitting}
                    className="h-9 px-5 text-sm font-bold text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer bg-[#0091FF] disabled:opacity-75 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        Lưu thay đổi
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

export default function EditUserPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs text-slate-400">
        Đang tải trang chỉnh sửa...
      </div>
    }>
      <EditUserContent />
    </Suspense>
  );
}
