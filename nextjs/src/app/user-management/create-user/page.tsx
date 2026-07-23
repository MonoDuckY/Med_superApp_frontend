"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  FlaskConical,
  FileText,
  Settings,
  UserPlus,
  Bell,
  Plus,
  X,
  Info,
  CheckCircle2,
  ChevronDown,
  Loader2,
  ShieldAlert
} from "lucide-react";

// Types
type RoleType = "" | "clinical" | "research" | "administration" | "super_admin";
type StatusType = "" | "active" | "pending" | "suspended";

interface UserFormState {
  fullName: string;
  phoneNumber: string;
  email: string;
  role: RoleType;
  status: StatusType;
}

export default function CreateUserPage() {
  const router = useRouter();

  // Form State
  const [form, setForm] = useState<UserFormState>({
    fullName: "",
    phoneNumber: "",
    email: "",
    role: "",
    status: "",
  });

  // Flow & State handling
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<{
    staffId: string;
    fullName: string;
    phoneNumber: string;
    roleName: string;
    tempPass: string;
  } | null>(null);

  // Dropdown UI toggle states
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Field validation and submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Empty Validation Checks
    if (!form.fullName.trim()) {
      setError("Full Name is a required field.");
      return;
    }
    if (!form.phoneNumber.trim()) {
      setError("Phone Number is a required field.");
      return;
    }
    if (!form.role) {
      setError("Please select an Account Role.");
      return;
    }
    if (!form.status) {
      setError("Please select an Account Status.");
      return;
    }

    // Phone Number Regex format checking (starts with 0 or +84 followed by 9 digits)
    const phoneRegex = /^(\+84|0)\d{9}$/;
    if (!phoneRegex.test(form.phoneNumber.trim())) {
      setError("Phone Number must be a valid format (e.g. 0912345678 or +84912345678).");
      return;
    }

    // Email pattern verification (if filled)
    if (form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        setError("Please enter a valid Email Address format.");
        return;
      }
    }

    // Submit Simulation
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      // Calculate a mockup Staff ID
      const prefix = 
        form.role === "clinical" ? "CLN" : 
        form.role === "research" ? "RES" : 
        form.role === "administration" ? "ADM" : "SA";
      const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
      const generatedStaffId = `${prefix}-${randomDigits}`;

      // Mock random temporary password
      const generatedTempPass = Math.random().toString(36).slice(-8).toUpperCase() + "@2026";

      // Map display role
      const roleMap: Record<RoleType, string> = {
        "": "",
        clinical: "Clinical Practitioner",
        research: "AI Researcher",
        administration: "Hospital Administrator",
        super_admin: "Super Operations Administrator"
      };

      setCreatedUser({
        staffId: generatedStaffId,
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        roleName: roleMap[form.role],
        tempPass: generatedTempPass
      });

      setSuccess(true);
    }, 1500);
  };

  const handleResetForm = () => {
    setForm({
      fullName: "",
      phoneNumber: "",
      email: "",
      role: "",
      status: "",
    });
    setCreatedUser(null);
    setSuccess(false);
    setError(null);
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel user registration? Unsaved details will be lost.")) {
      router.push("/");
    }
  };

  const selectRole = (role: RoleType) => {
    setForm({ ...form, role });
    setShowRoleDropdown(false);
    if (error) setError(null);
  };

  const selectStatus = (status: StatusType) => {
    setForm({ ...form, status });
    setShowStatusDropdown(false);
    if (error) setError(null);
  };

  return (
    <div className="flex min-h-screen w-full select-none bg-surface font-inter text-neutral-500">
      
      {/* SIDEBAR NAVIGATION PANE */}
      <aside className="relative hidden w-64 shrink-0 flex-col justify-between bg-[#0B1528] p-6 text-white md:flex border-r border-slate-900">
        <div className="flex flex-col gap-8">
          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-hms bg-primary shadow-md shadow-primary/20">
              <Plus className="h-5.5 w-5.5 text-white stroke-[3px]" />
            </div>
            <div>
              <h2 className="font-mono text-[15px] font-bold leading-none tracking-tight">HMS</h2>
              <p className="text-[9px] tracking-wider text-slate-400 font-semibold font-mono mt-0.5">Admin Console</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <button className="flex w-full items-center gap-3 py-2 px-3 text-sm font-semibold rounded-hms text-slate-400 hover:bg-slate-900 hover:text-white transition-all text-left">
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Dashboard</span>
            </button>

            {/* User Management Expanded Block */}
            <div className="flex flex-col gap-1">
              <button className="flex w-full items-center justify-between py-2 px-3 text-sm font-semibold rounded-hms text-white bg-slate-900 transition-all text-left">
                <div className="flex items-center gap-3">
                  <Users className="h-4.5 w-4.5 text-primary" />
                  <span>User Management</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              
              <div className="flex flex-col pl-9 border-l border-slate-800 ml-5 my-1 gap-1">
                <button className="w-full text-left py-1.5 text-xs text-slate-400 hover:text-white font-medium">
                  All Users
                </button>
                <button className="w-full text-left py-1.5 text-xs text-primary font-bold flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Create User
                </button>
                <button className="w-full text-left py-1.5 text-xs text-slate-400 hover:text-white font-medium">
                  Roles & Permissions
                </button>
              </div>
            </div>

            {/* Clinical (With notification badge) */}
            <button className="flex w-full items-center justify-between py-2 px-3 text-sm font-semibold rounded-hms text-slate-400 hover:bg-slate-900 hover:text-white transition-all text-left">
              <div className="flex items-center gap-3">
                <Activity className="h-4.5 w-4.5" />
                <span>Clinical</span>
              </div>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-critical px-1 text-[10px] font-bold text-white">
                3
              </span>
            </button>

            <button className="flex w-full items-center gap-3 py-2 px-3 text-sm font-semibold rounded-hms text-slate-400 hover:bg-slate-900 hover:text-white transition-all text-left">
              <FlaskConical className="h-4.5 w-4.5" />
              <span>Research</span>
            </button>

            <button className="flex w-full items-center gap-3 py-2 px-3 text-sm font-semibold rounded-hms text-slate-400 hover:bg-slate-900 hover:text-white transition-all text-left">
              <FileText className="h-4.5 w-4.5" />
              <span>Reports</span>
            </button>

            <button className="flex w-full items-center gap-3 py-2 px-3 text-sm font-semibold rounded-hms text-slate-400 hover:bg-slate-900 hover:text-white transition-all text-left">
              <Settings className="h-4.5 w-4.5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Profile footer */}
        <div className="flex items-center gap-3 border-t border-slate-900 pt-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold text-white text-xs">
            SA
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">Super Admin</h4>
            <p className="text-[10px] font-semibold text-slate-400 font-mono mt-0.5">ADM-20241105</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex flex-1 flex-col justify-between bg-surface p-6 sm:p-10">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400 hover:text-slate-600 cursor-pointer">User Management</span>
            <span className="text-slate-300">/</span>
            <span className="text-neutral-900 font-bold">Create User</span>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-4">
            {/* Notification bell badge */}
            <button className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
              <Bell className="h-4 w-4 text-slate-600" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-critical px-1 text-[9px] font-bold text-white border border-white">
                3
              </span>
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-sm shadow-primary/20">
              SA
            </div>
          </div>
        </div>

        {/* Form Body Wrap */}
        <div className="my-auto mx-auto w-full max-w-[800px] py-6">
          
          {/* Title Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-hms bg-primary/10 text-primary">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight sm:text-2xl">
                  Create New User Account
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Add a new staff member to the HMS system. Required fields are marked with <span className="text-critical">*</span>
                </p>
              </div>
            </div>

            
          </div>

          {success && createdUser ? (
            /* SUCCESS STATE DISPLAY CARD */
            <div className="rounded-hms-lg border border-slate-200 bg-white p-6 shadow-md shadow-slate-100/50 animate-[fadeIn_0.4s_ease-out]">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">User Account Registered Successfully</h3>
                  <p className="text-xs text-neutral-500">Security audits logged. Credentials queued for dispatch.</p>
                </div>
              </div>

              {/* Review Details Table layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 border border-slate-100 rounded-hms p-5 mb-5 font-medium">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Staff Name</span>
                  <span className="text-sm font-semibold text-neutral-900 mt-1 block">{createdUser.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Phone Number</span>
                  <span className="text-sm font-semibold text-neutral-900 mt-1 block">{createdUser.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Role Assigned</span>
                  <span className="text-sm font-semibold text-neutral-900 mt-1 block">{createdUser.roleName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">System Generated ID</span>
                  <span className="text-sm font-bold text-primary font-mono mt-1 block">{createdUser.staffId}</span>
                </div>
                <div className="md:col-span-2 border-t border-slate-200/60 pt-3 mt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Temporary Password</span>
                  <span className="text-xs font-bold font-mono text-slate-700 bg-white border border-slate-200 rounded px-2.5 py-1 w-fit mt-1 block select-text">
                    {createdUser.tempPass}
                  </span>
                </div>
              </div>

              {/* Notification Banner info */}
              <div className="flex gap-2.5 rounded-hms bg-sky-50 border border-sky-100 p-4 text-xs text-slate-600 leading-relaxed mb-6 font-medium">
                <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                <span>
                  The credentials listed above (Staff ID and temporary password) have been compiled and sent via automated SMS to <strong>{createdUser.phoneNumber}</strong>. The user must verify the temporary password and complete their secure password configuration upon first login.
                </span>
              </div>

              {/* Success Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleResetForm}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-hms bg-primary font-semibold text-white px-5 shadow-sm shadow-primary/10 hover:bg-primary/95 transition-all text-xs"
                >
                  Create Another User
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE FORM STATE */
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Account Information Card */}
              <div className="rounded-hms-lg border border-slate-200 bg-white shadow-md shadow-slate-100/50 overflow-visible">
                
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1.5 rounded-full bg-primary" />
                    <span className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                      Account Information
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    HMS Admin Console · v2.4.1
                  </span>
                </div>

                {/* Card Content Form Fields */}
                <div className="p-6 flex flex-col gap-5">
                  
                  {/* Row 1: Full Name and Phone Number */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="fullName" className="text-xs font-bold text-neutral-900">
                        Full Name <span className="text-critical font-bold">*</span>
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        disabled={loading}
                        value={form.fullName}
                        onChange={(e) => {
                          setForm({ ...form, fullName: e.target.value });
                          if (error) setError(null);
                        }}
                        placeholder="e.g. Nguyễn Thị Lan"
                        className={`w-full h-11 px-3.5 rounded-hms text-sm bg-slate-50 border text-neutral-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 ${
                          error && !form.fullName.trim()
                            ? "border-critical ring-2 ring-critical/10"
                            : "border-slate-200 focus:border-primary"
                        }`}
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phoneNumber" className="text-xs font-bold text-neutral-900">
                        Phone Number <span className="text-critical font-bold">*</span>
                      </label>
                      <input
                        id="phoneNumber"
                        type="text"
                        disabled={loading}
                        value={form.phoneNumber}
                        onChange={(e) => {
                          setForm({ ...form, phoneNumber: e.target.value });
                          if (error) setError(null);
                        }}
                        placeholder="e.g. 0912345678"
                        className={`w-full h-11 px-3.5 rounded-hms text-sm bg-slate-50 border text-neutral-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 ${
                          error && (!form.phoneNumber.trim() || !/^(\+84|0)\d{9}$/.test(form.phoneNumber.trim()))
                            ? "border-critical ring-2 ring-critical/10"
                            : "border-slate-200 focus:border-primary"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Row 2: Email Address */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <label htmlFor="email" className="text-xs font-bold text-neutral-900">
                        Email Address
                      </label>
                      <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 font-semibold">
                        Optional
                      </span>
                    </div>
                    <input
                      id="email"
                      type="text"
                      disabled={loading}
                      value={form.email}
                      onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        if (error) setError(null);
                      }}
                      placeholder="e.g. name@hospital.com"
                      className={`w-full h-11 px-3.5 rounded-hms text-sm bg-slate-50 border text-neutral-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 ${
                        error && form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
                          ? "border-critical ring-2 ring-critical/10"
                          : "border-slate-200 focus:border-primary"
                      }`}
                    />
                  </div>

                  {/* Row 3: Role and Account Status (Dropdown select elements) */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 overflow-visible">
                    
                    {/* Role Dropdown */}
                    <div className="flex flex-col gap-1.5 relative overflow-visible">
                      <label className="text-xs font-bold text-neutral-900">
                        Role <span className="text-critical font-bold">*</span>
                      </label>
                      
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setShowRoleDropdown(!showRoleDropdown);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full h-11 px-3.5 rounded-hms text-sm bg-slate-50 border text-neutral-900 flex items-center justify-between outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 ${
                          error && !form.role
                            ? "border-critical ring-2 ring-critical/10"
                            : "border-slate-200 focus:border-primary"
                        }`}
                      >
                        <span className={form.role ? "text-neutral-900 font-medium" : "text-slate-400"}>
                          {form.role === "clinical" ? "Clinical Staff" :
                           form.role === "research" ? "Researcher" :
                           form.role === "administration" ? "Administrator" :
                           form.role === "super_admin" ? "Super Admin" : "Select account role"}
                        </span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </button>

                      {showRoleDropdown && (
                        <div className="absolute top-[4.5rem] inset-x-0 bg-white border border-slate-200 rounded-hms shadow-lg z-50 overflow-hidden py-1 animate-[fadeIn_0.15s_ease-out]">
                          <button
                            type="button"
                            onClick={() => selectRole("clinical")}
                            className="w-full text-left px-4 py-2.5 text-sm text-neutral-900 hover:bg-slate-50 font-medium transition-colors"
                          >
                            Clinical Staff
                          </button>
                          <button
                            type="button"
                            onClick={() => selectRole("research")}
                            className="w-full text-left px-4 py-2.5 text-sm text-neutral-900 hover:bg-slate-50 font-medium transition-colors"
                          >
                            Researcher
                          </button>
                          <button
                            type="button"
                            onClick={() => selectRole("administration")}
                            className="w-full text-left px-4 py-2.5 text-sm text-neutral-900 hover:bg-slate-50 font-medium transition-colors"
                          >
                            Administrator
                          </button>
                          <button
                            type="button"
                            onClick={() => selectRole("super_admin")}
                            className="w-full text-left px-4 py-2.5 text-sm text-neutral-900 hover:bg-slate-50 font-medium transition-colors"
                          >
                            Super Admin
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Account Status Dropdown */}
                    <div className="flex flex-col gap-1.5 relative overflow-visible">
                      <label className="text-xs font-bold text-neutral-900">
                        Account Status <span className="text-critical font-bold">*</span>
                      </label>
                      
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setShowStatusDropdown(!showStatusDropdown);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full h-11 px-3.5 rounded-hms text-sm bg-slate-50 border text-neutral-900 flex items-center justify-between outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 ${
                          error && !form.status
                            ? "border-critical ring-2 ring-critical/10"
                            : "border-slate-200 focus:border-primary"
                        }`}
                      >
                        <span className={form.status ? "text-neutral-900 font-medium" : "text-slate-400"}>
                          {form.status === "active" ? "Active" :
                           form.status === "pending" ? "Pending SMS Activation" :
                           form.status === "suspended" ? "Suspended" : "Select account status"}
                        </span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </button>

                      {showStatusDropdown && (
                        <div className="absolute top-[4.5rem] inset-x-0 bg-white border border-slate-200 rounded-hms shadow-lg z-50 overflow-hidden py-1 animate-[fadeIn_0.15s_ease-out]">
                          <button
                            type="button"
                            onClick={() => selectStatus("active")}
                            className="w-full text-left px-4 py-2.5 text-sm text-neutral-900 hover:bg-slate-50 font-medium transition-colors"
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            onClick={() => selectStatus("pending")}
                            className="w-full text-left px-4 py-2.5 text-sm text-neutral-900 hover:bg-slate-50 font-medium transition-colors"
                          >
                            Pending SMS Activation
                          </button>
                          <button
                            type="button"
                            onClick={() => selectStatus("suspended")}
                            className="w-full text-left px-4 py-2.5 text-sm text-neutral-900 hover:bg-slate-50 font-medium transition-colors"
                          >
                            Suspended
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warning Info Box */}
                  <div className="flex gap-2.5 rounded-hms bg-sky-50 border border-sky-100 p-4 text-xs text-slate-600 leading-relaxed font-medium mt-2">
                    <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      A system-generated Staff ID and temporary password will be sent to the user's phone number via SMS. The user must change their password on first login.
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Validation Alert Box */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-hms bg-critical/5 p-3 border border-critical/10 text-xs text-critical font-medium animate-[fadeIn_0.2s_ease-out]">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Footer Layout buttons row */}
              <div className="flex flex-col gap-4 justify-between pt-2 border-t border-slate-200 sm:flex-row sm:items-center">
                <span className="text-[11px] font-medium text-slate-400">
                  All user creation events are logged and audited.
                </span>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {/* Cancel Button */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleCancel}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-hms border border-slate-200 bg-white font-semibold text-slate-600 px-4 transition-all hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:pointer-events-none text-xs"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>

                  {/* Create Account Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-hms bg-primary font-semibold text-white px-5 shadow-sm shadow-primary/20 transition-all hover:bg-primary/95 disabled:opacity-60 disabled:pointer-events-none text-xs"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Bottom audit notes */}
        <div className="text-[11px] text-slate-400 font-medium text-center sm:text-left mt-6 border-t border-slate-100 pt-4">
          © 2026 HMS NextGen Operations Admin Portal · Secure Audit Active
        </div>
      </main>
    </div>
  );
}
