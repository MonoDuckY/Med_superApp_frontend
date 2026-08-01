"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, UserPlus, Stethoscope, FlaskConical,
  FileText, Settings, Bell, ChevronDown, ChevronRight, X,
  CheckCircle2, Search, Upload, FileCheck, AlertCircle, ShieldCheck,
} from "lucide-react";

/* ─── Types ─── */
type Role = "Admin" | "Doctor" | "Staff" | "Researcher" | "Patient" | "";
type Status = "Active" | "Inactive" | "";
type Gender = "Male" | "Female" | "Other" | "";

/* ─── Nav data ─── */
const NAV = [
  { icon: <LayoutDashboard size={15} strokeWidth={1.75} />, label: "Dashboard" },
  {
    icon: <Users size={15} strokeWidth={1.75} />, label: "User Management", active: true,
    children: [{ label: "All Users" }, { label: "Create User", active: true }, { label: "Roles & Permissions" }],
  },
  { icon: <Stethoscope size={15} strokeWidth={1.75} />, label: "Clinical", badge: 3 },
  { icon: <FlaskConical size={15} strokeWidth={1.75} />, label: "Research" },
  { icon: <FileText size={15} strokeWidth={1.75} />, label: "Reports" },
  { icon: <Settings size={15} strokeWidth={1.75} />, label: "Settings" },
];

/* ─── Shared input style ─── */
const INPUT = "w-full h-10 px-3 text-[13px] text-[#0F172A] placeholder:text-[#CBD5E1] bg-white border border-[#E2E8F0] outline-none transition-all duration-150 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/10";
const SELECT = `${INPUT} appearance-none cursor-pointer pr-8`;

/* ─── Field wrapper ─── */
function Field({
  label, required, optional, hint, error, children, className = "",
}: {
  label: string; required?: boolean; optional?: boolean;
  hint?: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[12px] font-semibold text-[#0F172A] flex items-center gap-1.5 leading-none">
        {label}
        {required && <span className="text-[#EF4444] text-[11px]">*</span>}
        {optional && (
          <span className="text-[10px] font-normal text-[#94A3B8] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
            Optional
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-[#94A3B8] leading-none">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-[#EF4444] leading-none">
          <AlertCircle size={10} strokeWidth={2} />{error}
        </p>
      )}
    </div>
  );
}

/* ─── Section header ─── */
function SectionHeader({ num, title, sub }: { num: string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-lg bg-[#0EA5E9] flex items-center justify-center flex-shrink-0">
        <span className="text-white text-[11px] font-bold">{num}</span>
      </div>
      <div>
        <p className="text-[13px] font-bold text-[#0F172A] leading-none">{title}</p>
        <p className="text-[11px] text-[#94A3B8] leading-none mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

export default function CreateUserPage() {
  const router = useRouter();
  const [expandedNav, setExpandedNav] = useState("User Management");

  /* form state */
  const [fullName, setFullName]     = useState("");
  const [phone, setPhone]           = useState("");
  const [email, setEmail]           = useState("");
  const [roles, setRoles]           = useState<string[]>([]);
  const [isOpen, setIsOpen]         = useState(false);
  const [status, setStatus]         = useState<Status>("");
  const [dob, setDob]               = useState("");
  const [gender, setGender]         = useState<Gender>("");
  const [address, setAddress]       = useState("");
  const [cccd, setCccd]             = useState("");
  const [bhyt, setBhyt]             = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [dragOver, setDragOver]     = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [createdId, setCreatedId]   = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim())  e.fullName = "Full name is required.";
    if (!phone.trim())     e.phone = "Phone number is required.";
    else if (!/^(\+?84|0)\d{9}$/.test(phone.replace(/\s/g, "")))
      e.phone = "Enter a valid Vietnamese phone number.";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address.";
    if (roles.length === 0) e.roles   = "Please select at least one role.";
    if (!status) e.status = "Please select a status.";
    if (!dob)    e.dob    = "Date of birth is required.";
    if (!gender) e.gender = "Please select a gender.";
    if (!address.trim()) e.address = "Permanent address is required.";
    if (roles.includes("DOCTOR") && !licenseFile)
      e.license = "Professional license is required for Doctors.";
    return e;
  };

  const handleCreate = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setIsSubmitting(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const token = localStorage.getItem("authToken");

    // Exclude password if the account only has the PATIENT role (logs in via OTP)
    const isOnlyPatient = roles.length === 1 && roles.includes("PATIENT");
    const generatedPassword = "Hms1234@";

    const payload = {
      ...(isOnlyPatient ? {} : { password: generatedPassword }),
      roles: roles,
      fullName: fullName.trim(),
      gender: gender,
      dateOfBirth: dob,
      phoneNumber: phone.replace(/\s/g, ""),
      address: address.trim(),
      email: email.trim() || null,
      citizenIdentificationCode: cccd || null,
      healthInsuranceCode: bhyt || null,
      certificate: (roles.includes("DOCTOR") && licenseFile) ? licenseFile.name : null
    };

    console.log("HMS Frontend Sending Payload:", JSON.stringify(payload, null, 2));

    fetch(`${apiUrl}/api/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await res.json();
          if (!result.success) {
            throw new Error(result.message || "Failed to create user account.");
          }
          return result.data;
        } else {
          if (!res.ok) {
            throw new Error(`HTTP Error ${res.status}: Could not create user account.`);
          }
          throw new Error("Invalid response format received from server.");
        }
      })
      .then((data) => {
        if (data && data.id) {
          setCreatedId(data.id);
        }
        setSubmitted(true);
      })
      .catch((err) => {
        setErrors({ general: err.message || "Could not connect to the user management API." });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleReset = () => {
    setFullName(""); setPhone(""); setEmail(""); setRoles([]); setIsOpen(false); setStatus("");
    setDob(""); setGender(""); setAddress(""); setCccd(""); setBhyt("");
    setLicenseFile(null); setErrors({}); setSubmitted(false); setCreatedId("");
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel user registration? Unsaved details will be lost.")) {
      router.push("/");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) { setLicenseFile(file); setErrors((p) => ({ ...p, license: "" })); }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setLicenseFile(file); setErrors((p) => ({ ...p, license: "" })); }
  };

  /* ── Sidebar ── */
  const Sidebar = () => (
    <aside className="w-[220px] flex-shrink-0 bg-[#0C1A2E] flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="w-8 h-8 rounded-lg bg-[#0EA5E9] flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: "0 0 16px rgba(14,165,233,0.4)" }}>
          <div className="relative w-3.5 h-3.5 flex items-center justify-center">
            <div className="absolute w-3.5 h-[4px] bg-white rounded-sm" />
            <div className="absolute w-[4px] h-3.5 bg-white rounded-sm" />
          </div>
        </div>
        <div>
          <p className="text-white font-bold text-[13px] leading-none tracking-wide">HMS</p>
          <p className="text-[#475569] text-[10px] mt-0.5 tracking-wide">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV.map((item) => (
          <div key={item.label} className="mb-0.5">
            <button
              onClick={() => setExpandedNav(expandedNav === item.label ? "" : item.label)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all group ${
                item.active ? "bg-[#0EA5E9]/15 text-[#38BDF8]" : "text-[#64748B] hover:bg-white/5 hover:text-[#94A3B8]"
              }`}
            >
              <span className={item.active ? "text-[#38BDF8]" : "text-[#475569] group-hover:text-[#64748B]"}>
                {item.icon}
              </span>
              <span className="text-[12px] font-medium flex-1">{item.label}</span>
              {"badge" in item && item.badge && (
                <span className="w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              {"children" in item && item.children && (
                <ChevronDown size={12} strokeWidth={2}
                  className={`transition-transform ${expandedNav === item.label ? "rotate-180" : ""}`} />
              )}
            </button>
            {"children" in item && item.children && expandedNav === item.label && (
              <div className="ml-8 mt-0.5 flex flex-col gap-0.5">
                {item.children.map((c) => (
                  <button key={c.label}
                    className={`w-full text-left text-[11px] px-3 py-2 rounded-lg transition-all ${
                      c.active ? "text-[#38BDF8] bg-[#0EA5E9]/10 font-semibold" : "text-[#475569] hover:text-[#64748B] hover:bg-white/5"
                    }`}>
                    {c.active && <span className="inline-block w-1 h-1 rounded-full bg-[#0EA5E9] mr-2 mb-0.5" />}
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/8 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/20 border border-[#0EA5E9]/30 flex items-center justify-center">
            <span className="text-[11px] font-bold text-[#38BDF8]">SA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[#CBD5E1] truncate">Super Admin</p>
            <p className="text-[10px] text-[#475569] truncate">ADM-20241105</p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-[#E2E8F0] flex items-center px-8 gap-4">
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-[12px] text-[#64748B] hover:text-[#0EA5E9] cursor-pointer transition-colors" onClick={() => router.push("/")}>User Management</span>
            <ChevronRight size={12} strokeWidth={2} className="text-[#CBD5E1]" />
            <span className="text-[12px] font-semibold text-[#0F172A]">Create User</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden xl:flex items-center">
              <Search size={13} strokeWidth={2} className="absolute left-3 text-[#94A3B8] pointer-events-none" />
              <input type="text" placeholder="Search users…"
                className="h-8 pl-8 pr-4 w-44 text-[12px] text-[#0F172A] placeholder:text-[#CBD5E1] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/10 transition-all" />
            </div>
            <button className="relative w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0EA5E9] hover:border-[#0EA5E9] transition-all">
              <Bell size={14} strokeWidth={1.75} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#EF4444] text-white text-[8px] font-bold flex items-center justify-center">3</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#0EA5E9] flex items-center justify-center cursor-pointer">
              <span className="text-white text-[11px] font-bold">SA</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-[#0F172A] font-bold text-xl flex items-center gap-2.5 mb-1">
                <UserPlus size={19} strokeWidth={2} className="text-[#0EA5E9]" />
                Create New User Account
              </h1>
              <p className="text-[#64748B] text-[13px]">
                Register a new staff member or patient. Fields marked <span className="text-[#EF4444] font-bold">*</span> are required.
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[11px] font-medium text-[#0369A1]">System Online</span>
            </div>
          </div>

          {submitted ? (
            /* Success */
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-12 flex flex-col items-center text-center max-w-[520px] mx-auto mt-8">
              <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-5">
                <CheckCircle2 size={32} strokeWidth={1.5} className="text-[#10B981]" />
              </div>
              <h2 className="text-[#0F172A] font-bold text-xl mb-2">Account Created</h2>
              <p className="text-[#64748B] text-sm leading-relaxed mb-6">
                <span className="font-semibold text-[#0F172A]">{fullName}</span> has been added with roles{" "}
                <span className="font-semibold text-[#0EA5E9]">
                  {roles.map(r => r === "ADMIN" ? "Admin" : r === "DOCTOR" ? "Doctor" : r === "STAFF" ? "Staff" : r === "RESEARCHER" ? "Researcher" : "Patient").join(", ")}
                </span>.
              </p>
              <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-5 py-4 mb-6 text-left">
                <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-1.5">Generated User ID</p>
                <p className="font-mono font-bold text-[#0EA5E9] text-lg tracking-widest">
                  {createdId || (
                    ((roles[0] === "ADMIN" ? "ADM" : roles[0] === "DOCTOR" ? "DR" : roles[0] === "RESEARCHER" ? "RES" : roles[0] === "PATIENT" ? "PAT" : "STF")) +
                    "-" + Date.now().toString().slice(-8)
                  )}
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={handleReset}
                  className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-[13px] font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-all">
                  Create Another
                </button>
                <button onClick={() => router.push("/")}
                  className="flex-1 h-10 rounded-lg bg-[#0EA5E9] text-white text-[13px] font-semibold hover:bg-[#0284C7] transition-colors shadow-sm shadow-sky-100">
                  View All Users
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">

              {/* Card header */}
              <div className="flex items-center justify-between px-7 py-4 border-b border-[#F1F5F9] bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-5 rounded-full bg-[#0EA5E9]" />
                  <span className="text-[13px] font-bold text-[#0F172A]">New Staff Account</span>
                  <span className="text-[11px] text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded">3 sections</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} strokeWidth={2} className="text-[#F59E0B]" />
                  <span className="text-[11px] font-medium text-[#92400E]">Clinical View — Restricted</span>
                </div>
              </div>

              <div className="px-7 py-6 flex flex-col gap-8">
                {errors.general && (
                  <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[13px] rounded-xl flex items-start gap-2.5">
                    <AlertCircle size={16} className="mt-0.5 text-[#EF4444] flex-shrink-0" />
                    <p className="leading-relaxed">{errors.general}</p>
                  </div>
                )}

                {/* ══════ SECTION 1: Account & Role ══════ */}
                <div>
                  <SectionHeader num="01" title="Account & Role" sub="Login credentials, system role, and access status" />
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">

                    <Field label="Full Name" required error={errors.fullName}>
                      <input type="text" value={fullName}
                        onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
                        placeholder="e.g. Nguyễn Thị Lan"
                        className={INPUT} style={{ borderRadius: "8px", borderColor: errors.fullName ? "#EF4444" : undefined }} />
                    </Field>

                    <Field label="Phone Number" required hint="+84 or 0 + 9 digits" error={errors.phone}>
                      <input type="tel" value={phone}
                        onChange={(e) => { setPhone(e.target.value.replace(/[^\d+\s]/g, "").slice(0, 14)); setErrors((p) => ({ ...p, phone: "" })); }}
                        placeholder="e.g. 0912345678 or +84912345678"
                        className={INPUT} style={{ borderRadius: "8px", borderColor: errors.phone ? "#EF4444" : undefined }} />
                    </Field>

                    <Field label="Email Address" optional error={errors.email} className="col-span-2">
                      <input type="email" value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                        placeholder="e.g. name@hospital.com"
                        className={INPUT} style={{ borderRadius: "8px", borderColor: errors.email ? "#EF4444" : undefined }} />
                    </Field>

                    <Field label="Roles" required error={errors.roles}>
                      <div ref={dropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setIsOpen(!isOpen)}
                          className={`${INPUT} flex items-center justify-between text-left pr-3`}
                          style={{ borderRadius: "8px", borderColor: errors.roles ? "#EF4444" : undefined }}
                        >
                          <span className={roles.length === 0 ? "text-[#CBD5E1]" : "text-[#0F172A]"}>
                            {roles.length > 0 
                              ? roles.map(r => r === "ADMIN" ? "Admin" : r === "DOCTOR" ? "Doctor" : r === "STAFF" ? "Staff" : r === "RESEARCHER" ? "Researcher" : "Patient").join(", ")
                              : "Select roles..."}
                          </span>
                          <ChevronDown size={14} className="text-[#94A3B8] transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : undefined }} />
                        </button>
                        
                        {isOpen && (
                          <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-50 py-1.5 max-h-60 overflow-y-auto">
                            {[
                              { value: "ADMIN", label: "Admin", desc: "Full system access.", color: "bg-[#EF4444]" },
                              { value: "DOCTOR", label: "Doctor", desc: "Clinical records & diagnoses.", color: "bg-[#0EA5E9]" },
                              { value: "STAFF", label: "Staff", desc: "Scheduling & patient intake.", color: "bg-[#10B981]" },
                              { value: "RESEARCHER", label: "Researcher", desc: "AI datasets & anonymized records.", color: "bg-[#8B5CF6]" },
                              { value: "PATIENT", label: "Patient", desc: "Patient portal access & medical records.", color: "bg-[#D946EF]" },
                            ].map((opt) => {
                              const isChecked = roles.includes(opt.value);
                              return (
                                <div
                                  key={opt.value}
                                  onClick={() => {
                                    let nextRoles;
                                    if (isChecked) {
                                      nextRoles = roles.filter(r => r !== opt.value);
                                    } else {
                                      nextRoles = [...roles, opt.value];
                                    }
                                    setRoles(nextRoles);
                                    setErrors((p) => ({ ...p, roles: "", license: "" }));
                                  }}
                                  className="flex items-start gap-3 px-3 py-2 hover:bg-[#F8FAFC] cursor-pointer transition-colors select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}} // event is handled by parent div onClick
                                    className="mt-0.5 rounded border-[#E2E8F0] text-[#0EA5E9] focus:ring-[#0EA5E9]/20 pointer-events-none"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <div className={`w-1.5 h-1.5 rounded-full ${opt.color}`} />
                                      <span className="text-[12px] font-semibold text-[#0F172A]">{opt.label}</span>
                                    </div>
                                    <p className="text-[10px] text-[#64748B] mt-0.5 leading-tight">{opt.desc}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </Field>

                    <Field label="Account Status" required error={errors.status}>
                      <div className="relative">
                        <select value={status}
                          onChange={(e) => { setStatus(e.target.value as Status); setErrors((p) => ({ ...p, status: "" })); }}
                          className={SELECT} style={{ borderRadius: "8px", borderColor: errors.status ? "#EF4444" : undefined }}>
                          <option value="">Select status…</option>
                          {["Active", "Inactive"].map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={13} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                      </div>
                      {status && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${status === "Active" ? "bg-[#10B981]" : "bg-[#94A3B8]"}`} />
                          <p className="text-[11px] text-[#64748B]">
                            {status === "Active" ? "User can log in immediately." : "Account disabled until activated."}
                          </p>
                        </div>
                      )}
                    </Field>
                  </div>
                </div>

                <div className="h-px bg-[#F1F5F9]" />

                {/* ══════ SECTION 2: Personal Information ══════ */}
                <div>
                  <SectionHeader num="02" title="Personal Information" sub="Demographic details for patient record linkage" />
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">

                    <Field label="Date of Birth" required error={errors.dob}>
                      <input type="date" value={dob}
                        onChange={(e) => { setDob(e.target.value); setErrors((p) => ({ ...p, dob: "" })); }}
                        max={new Date().toISOString().split("T")[0]}
                        className={INPUT} style={{ borderRadius: "8px", borderColor: errors.dob ? "#EF4444" : undefined }} />
                    </Field>

                    <Field label="Gender" required error={errors.gender}>
                      <div className="relative">
                        <select value={gender}
                          onChange={(e) => { setGender(e.target.value as Gender); setErrors((p) => ({ ...p, gender: "" })); }}
                          className={SELECT} style={{ borderRadius: "8px", borderColor: errors.gender ? "#EF4444" : undefined }}>
                          <option value="">Select gender…</option>
                          {["Male", "Female", "Other"].map((g) => <option key={g}>{g}</option>)}
                        </select>
                        <ChevronDown size={13} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                      </div>
                    </Field>

                    <Field label="Permanent Address" required error={errors.address} className="col-span-2">
                      <textarea value={address}
                        onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: "" })); }}
                        placeholder="Street, Ward, District, Province/City"
                        rows={3}
                        className="w-full px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#CBD5E1] bg-white border border-[#E2E8F0] outline-none resize-none leading-relaxed transition-all focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/10"
                        style={{ borderRadius: "8px", borderColor: errors.address ? "#EF4444" : undefined }} />
                    </Field>
                  </div>
                </div>

                <div className="h-px bg-[#F1F5F9]" />

                {/* ══════ SECTION 3: Identification ══════ */}
                <div>
                  <SectionHeader num="03" title="Identification Numbers" sub="Optional — leave blank if not yet issued" />
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">

                    <Field label="National ID Number (CCCD)" hint="12-digit citizen ID — nullable">
                      <input type="text" value={cccd}
                        onChange={(e) => setCccd(e.target.value.replace(/\D/g, "").slice(0, 12))}
                        placeholder="e.g. 079085012345"
                        className={INPUT}
                        style={{ borderRadius: "8px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }} />
                    </Field>

                    <Field label="Health Insurance Number (Mã BHYT)" hint="15-character code — nullable">
                      <input type="text" value={bhyt}
                        onChange={(e) => setBhyt(e.target.value.toUpperCase().slice(0, 15))}
                        placeholder="e.g. HS4680123456789"
                        className={INPUT}
                        style={{ borderRadius: "8px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }} />
                    </Field>
                  </div>
                </div>

                {/* ══════ CONDITIONAL: Doctor License ══════ */}
                {roles.includes("DOCTOR") && (
                  <>
                    <div className="h-px bg-[#F1F5F9]" />
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-7 h-7 rounded-lg bg-[#0EA5E9]/10 border border-[#BAE6FD] flex items-center justify-center flex-shrink-0">
                          <FileCheck size={14} strokeWidth={1.75} className="text-[#0EA5E9]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#0F172A] leading-none flex items-center gap-2">
                            Doctor Professional License
                            <span className="text-[10px] font-semibold text-[#EF4444] bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                              REQUIRED
                            </span>
                          </p>
                          <p className="text-[11px] text-[#94A3B8] leading-none mt-0.5">
                            Required for Doctor role — Ministry of Health certified license
                          </p>
                        </div>
                      </div>

                      {licenseFile ? (
                        /* Uploaded state */
                        <div className="flex items-center gap-4 p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                            <FileCheck size={18} strokeWidth={1.75} className="text-[#10B981]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#0F172A] truncate">{licenseFile.name}</p>
                            <p className="text-[11px] text-[#64748B]">
                              {(licenseFile.size / 1024).toFixed(1)} KB · Uploaded successfully
                            </p>
                          </div>
                          <button onClick={() => setLicenseFile(null)}
                            className="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:border-[#EF4444] transition-all">
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
                            <Upload size={20} strokeWidth={1.75} className={dragOver ? "text-[#0EA5E9]" : "text-[#94A3B8]"} />
                          </div>
                          <div className="text-center">
                            <p className="text-[13px] font-semibold text-[#0F172A]">
                              {dragOver ? "Drop to upload" : "Upload Doctor Professional License"}
                            </p>
                            <p className="text-[11px] text-[#94A3B8] mt-1">
                              Drag & drop or <span className="text-[#0EA5E9] font-medium">browse files</span> · PDF, JPG, PNG up to 10 MB
                            </p>
                            <p className="text-[10px] text-[#CBD5E1] mt-1.5 italic">Required for Doctors only</p>
                          </div>
                          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFilePick} />
                        </div>
                      )}

                      {errors.license && (
                        <p className="flex items-center gap-1 text-[11px] text-[#EF4444] mt-1.5">
                          <AlertCircle size={10} strokeWidth={2} />{errors.license}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Info notice */}
                <div className="flex items-start gap-2.5 bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg px-4 py-3">
                  <div className="w-4 h-4 rounded-full bg-[#0EA5E9]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#0EA5E9] text-[9px] font-bold">i</span>
                  </div>
                  <p className="text-[12px] text-[#0369A1] leading-relaxed">
                    A system-generated Staff ID and temporary password will be sent via SMS.
                    The user must change their password on first login. All events are logged per{" "}
                    <span className="font-semibold">Decree 13/2023/NĐ-CP</span>.
                  </p>
                </div>
              </div>

              {/* Sticky footer buttons */}
              <div className="sticky bottom-0 flex items-center justify-between px-7 py-4 bg-white border-t border-[#F1F5F9] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
                <p className="text-[11px] text-[#CBD5E1]">HMS Admin Console · v2.4.1 · All creation events are audited</p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={handleCancel}
                    className="flex items-center gap-1.5 h-10 px-5 rounded-lg border border-[#E2E8F0] text-[13px] font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-all">
                    <X size={13} strokeWidth={2} /> Cancel
                  </button>
                  <button type="button" onClick={handleCreate} disabled={isSubmitting}
                    className="flex items-center gap-2 h-10 px-6 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] active:scale-[0.98] text-white text-[13px] font-semibold transition-all shadow-sm shadow-sky-200 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Creating…
                      </>
                    ) : (
                      <><UserPlus size={13} strokeWidth={2} /> Create Account</>
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
