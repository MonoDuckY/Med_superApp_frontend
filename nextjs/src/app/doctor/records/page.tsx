"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MedicalWorkspace from "@/components/doctor/MedicalWorkspace";

function RecordsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  return (
    <main className="flex-1 flex flex-col p-6 bg-[#F8FAFC] min-h-0 overflow-hidden">
      <MedicalWorkspace 
        appointmentId={appointmentId}
        onBackToSchedule={() => {
          router.push("/doctor/schedule");
        }} 
      />
    </main>
  );
}

export default function DoctorRecordsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
        Đang tải dữ liệu hồ sơ...
      </div>
    }>
      <RecordsContent />
    </Suspense>
  );
}
