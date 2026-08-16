"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function StaffIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/staff/appointments");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0C1A2E] flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin h-8 w-8 text-[#0EA5E9]" />
      <p className="text-slate-400 text-xs font-medium">Đang chuyển hướng đến phân hệ nhân viên...</p>
    </div>
  );
}
