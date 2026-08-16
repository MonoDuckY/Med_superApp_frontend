"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DoctorIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/doctor/appointments");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 text-[#0EA5E9] animate-spin" />
      <p className="text-slate-400 text-xs font-semibold">Đang chuyển hướng đến phân hệ Bác sĩ...</p>
    </div>
  );
}
