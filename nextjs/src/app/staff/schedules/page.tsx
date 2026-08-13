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
      // 1. Fetch doctors first to get names
      const docsRes = await fetchWithAuth(`${apiUrl}/api/staff/doctors`);
      let docs: any[] = [];
      if (docsRes.ok) {
        const docsResult = await docsRes.json();
        if (docsResult.success) {
          docs = docsResult.data || [];
        }
      }

      // 2. Fetch schedules
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-schedules`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const rawData = result.data || [];

          // --- AUTO REJECT PENDING EXPIRED SLOTS ---
          const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }); // "YYYY-MM-DD"
          const expiredPending = rawData.filter((item: any) => {
            const isPending = item.status === "PENDING";
            const isExpired = item.workDate && item.workDate <= todayStr;
            return isPending && isExpired;
          });

          if (expiredPending.length > 0) {
            console.log(`Auto-rejecting ${expiredPending.length} expired pending schedule submissions...`);
            // Run rejections in parallel
            await Promise.all(
              expiredPending.map(async (item: any) => {
                try {
                  await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-schedules/${item.submissionId}/decision`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      decision: "REJECT",
                      rejectionReason: "Hệ thống tự động từ chối do quá hạn phê duyệt (đến ngày trực nhưng chưa duyệt)."
                    })
                  });
                } catch (err) {
                  console.error(`Failed to auto-reject submission ${item.submissionId}:`, err);
                }
              })
            );
            // Re-fetch schedules after auto-rejecting to get updated status
            const refetchRes = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-schedules`);
            if (refetchRes.ok) {
              const refetchResult = await refetchRes.json();
              if (refetchResult.success) {
                rawData.length = 0;
                rawData.push(...(refetchResult.data || []));
              }
            }
          }
          // ------------------------------------------

          const mapped = rawData.map((item: any) => {
            const slots = item.slots || [];
            let timeRange = "Chưa thiết lập";
            if (slots.length > 0) {
              const start = slots[0].slot?.startTime ? slots[0].slot.startTime.slice(0, 5) : "08:00";
              const end = slots[slots.length - 1].slot?.endTime ? slots[slots.length - 1].slot.endTime.slice(0, 5) : "12:00";
              timeRange = `${start}–${end}`;
            }

            const matchedDoc = docs.find((d: any) => d.id === item.doctorId);
            const docName = matchedDoc ? matchedDoc.fullName : (item.doctorName || `Bác sĩ ID: ${item.doctorId}`);

            const slotObjs = slots.filter((s: any) => s.slot).map((s: any) => s.slot);
            let shiftDisplay = "Ca làm việc";
            if (slotObjs.length > 0) {
              let minStart = "23:59";
              let maxEnd = "00:00";
              slotObjs.forEach((s: any) => {
                if (s.startTime && s.startTime < minStart) minStart = s.startTime;
                if (s.endTime && s.endTime > maxEnd) maxEnd = s.endTime;
              });

              const startHour = parseInt(minStart.slice(0, 2), 10);
              const endHour = parseInt(maxEnd.slice(0, 2), 10);

              if (startHour >= 8 && endHour <= 12) {
                shiftDisplay = "Ca sáng";
              } else if (startHour >= 13 && endHour <= 17) {
                shiftDisplay = "Ca chiều";
              } else if (startHour >= 17 || endHour <= 8) {
                shiftDisplay = "Ca tối (đêm)";
              } else if (startHour >= 8 && endHour >= 17) {
                shiftDisplay = "Cả ngày";
              }
            }

            return {
              id: item.submissionId,
              doctorName: docName,
              workDate: item.workDate,
              shift: shiftDisplay,
              roomName: item.roomId || (slots[0]?.roomId || "N/A"),
              status: item.status,
              rejectionReason: item.rejectionReason
            };
          });
          setSchedules(mapped);
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
