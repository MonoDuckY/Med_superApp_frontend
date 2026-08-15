"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppointmentGrid from "@/components/doctor/AppointmentGrid";

export default function DoctorAppointmentsPage() {
  const router = useRouter();

  return (
    <main className="flex-1 overflow-hidden px-8 py-5 min-h-0 flex flex-col">
      <AppointmentGrid 
        onStartExam={(id) => { 
          router.push(`/doctor/records?appointmentId=${id}`); 
        }}
        onBackToSchedule={() => {
          router.push("/doctor/schedule");
        }} 
      />
    </main>
  );
}
