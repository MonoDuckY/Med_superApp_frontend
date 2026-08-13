"use client";

import React, { useEffect, useState } from "react";
import ScheduleApprovals from "@/components/staff/ScheduleApprovals";
import { fetchWithAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function StaffSchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDoctorSchedules = async () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-schedules`);
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setSchedules(result.data || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorSchedules();
  }, []);

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6">
      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-2.5">
          <Loader2 className="animate-spin text-[#0EA5E9] h-8 w-8" />
          <p className="text-slate-400 text-xs font-semibold">Đang tải lịch bác sĩ đăng ký...</p>
        </div>
      ) : (
        <ScheduleApprovals
          schedules={schedules}
          onRefresh={fetchDoctorSchedules}
        />
      )}
    </main>
  );
}
