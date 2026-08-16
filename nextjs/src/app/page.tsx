"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Headphones, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

import BrandPanel from "@/components/auth/BrandPanel";
import LoginForm from "@/components/auth/LoginForm";
import ForgotForm from "@/components/auth/ForgotForm";
import ResetForm from "@/components/auth/ResetForm";

export default function LoginPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Flow State: "login" | "forgot" | "reset"
  const [view, setView] = useState<"login" | "forgot" | "reset">("login");
  
  // State variables for routing forgot -> reset password flow
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotRole, setForgotRole] = useState("");
  const [forgotRoleIndex, setForgotRoleIndex] = useState(0);
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const roles = parsedUser.roles || (parsedUser.role ? [parsedUser.role] : []);
        const upperRoles = roles.map((r: string) => r.toUpperCase());
        
        if (upperRoles.includes("ADMIN")) {
          router.replace("/user-management/create-user");
          return;
        } else if (upperRoles.includes("DOCTOR")) {
          router.replace("/doctor");
          return;
        } else if (upperRoles.includes("STAFF")) {
          router.replace("/staff");
          return;
        } else if (upperRoles.includes("RESEARCHER")) {
          router.replace("/researcher");
          return;
        }
      } catch (e) {
        console.error("Error parsing saved user from session", e);
      }
    }
    setCheckingAuth(false);
  }, [router]);

  const handleForgotPassword = (phone: string, roleIndex: number) => {
    setForgotPhone(phone);
    setForgotRoleIndex(roleIndex);
    setView("forgot");
  };

  const handleForgotSuccess = (token: string, phone: string, roleCode: string) => {
    setResetToken(token);
    setForgotPhone(phone);
    setForgotRole(roleCode);
    setView("reset");
  };

  const handleResetSuccess = (phone: string) => {
    setView("login");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0C1A2E] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin h-8 w-8 text-[#0EA5E9]" />
        <p className="text-slate-400 text-xs font-medium">Đang xác thực phiên đăng nhập bảo mật...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <BrandPanel />

      {/* ─── Right Auth Panel ─── */}
      <div className="flex flex-col items-center justify-between w-full lg:w-1/2 p-6 md:p-12 overflow-y-auto bg-white">
        
        {/* Mobile Header */}
        <div className="flex items-center gap-2 lg:hidden w-full max-w-[420px] self-center">
          <Logo size="sm" showGlow={false} />
          <span className="font-bold text-neutral-900 leading-none">HMS NextGen</span>
        </div>

        {/* Form area */}
        <div className="my-auto mx-auto w-full max-w-[420px] py-8">
          {view === "login" && (
            <LoginForm onForgotPassword={handleForgotPassword} />
          )}

          {view === "forgot" && (
            <ForgotForm
              initialPhone={forgotPhone}
              initialRoleIndex={forgotRoleIndex}
              onBack={() => setView("login")}
              onSuccess={handleForgotSuccess}
            />
          )}

          {view === "reset" && (
            <ResetForm
              resetToken={resetToken}
              phone={forgotPhone}
              roleCode={forgotRole}
              onBackToLogin={handleResetSuccess}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 justify-between border-t border-slate-100 pt-6 text-[11px] font-medium text-slate-400 sm:flex-row sm:items-center w-full max-w-[420px] self-center">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <p className="leading-snug text-slate-400 max-w-[280px]">
              Chỉ dành cho nhân viên được ủy quyền — Nghiêm cấm mọi truy cập trái phép.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => alert("Liên hệ hỗ trợ qua helpdesk@nextgen-hms.org hoặc gọi số máy lẻ nội bộ: 8899.")}
            className="flex items-center gap-1.5 shrink-0 hover:opacity-70 transition-opacity cursor-pointer border-none bg-transparent outline-none"
          >
            <Headphones className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-semibold">Hỗ trợ kỹ thuật</span>
          </button>
        </div>

      </div>
    </div>
  );
}
