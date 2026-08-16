"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  X,
  MessageSquare,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";
import AppointmentTable, { Appointment } from "@/components/staff/AppointmentTable";
import BookingDrawer from "@/components/staff/BookingDrawer";

interface SmsToast {
  visible: boolean;
  title: string;
  message: string;
  progress: number;
}

export default function StaffAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [rawSubmissions, setRawSubmissions] = useState<any[]>([]);

  // Modals & Drawers
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isRescheduleDrawerOpen, setIsRescheduleDrawerOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // SMS simulated toast state
  const [smsToast, setSmsToast] = useState<SmsToast>({
    visible: false,
    title: "",
    message: "",
    progress: 0,
  });

  const triggerSmsToast = (title: string, message: string) => {
    setSmsToast({ visible: true, title, message, progress: 100 });
  };

  useEffect(() => {
    if (!smsToast.visible) return;
    const interval = setInterval(() => {
      setSmsToast((prev) => {
        if (prev.progress <= 0) {
          clearInterval(interval);
          return { ...prev, visible: false };
        }
        return { ...prev, progress: prev.progress - 10 };
      });
    }, 400);
    return () => clearInterval(interval);
  }, [smsToast.visible]);

  const fetchDoctors = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/doctors`);
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          const list = result.data || [];
          setDoctorsList(list);
          return list;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  };

  const fetchDoctorSchedules = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-schedules`);
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setRawSubmissions(result.data || []);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAppointments = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/appointments`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const list = (result.data || []).map((a: any) => ({
            id: a.id,
            patient: a.patient?.fullName || "N/A",
            phone: a.patient?.phoneNumber || "",
            doctor: a.doctor?.fullName || "N/A",
            room: a.room?.name || "Chưa xếp phòng",
            date: a.doctorWorkSlot?.workDate || "N/A",
            time: a.slot ? `${a.slot.startTime.slice(0, 5)}-${a.slot.endTime.slice(0, 5)}` : "N/A",
            status: a.status === "PENDING_STAFF_CONFIRMATION" ? "Chờ xác nhận"
                  : a.status === "CONFIRMED" ? "Confirmed"
                  : a.status === "CANCELLED" ? "Cancelled"
                  : a.status === "NO_SHOW" ? "No-show"
                  : a.status === "IN_PROGRESS" ? "In-progress"
                  : a.status === "COMPLETED" ? "Completed"
                  : a.status,
            type: a.type || "Standard",
          }));
          setAppointments(list);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchDoctors();
      await fetchAppointments();
      await fetchDoctorSchedules();
      setLoading(false);
    };
    initData();
  }, []);

  const handleConfirmAppointment = async (apt: Appointment) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/appointments/${apt.id}/decision`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decision: "APPROVE",
          rejectionReason: "",
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        triggerSmsToast(
          "SMS Gateway — Đã duyệt",
          `Mô phỏng gửi SMS: Phê duyệt lịch hẹn ${apt.id} của bệnh nhân ${apt.patient} thành công!`
        );
        fetchAppointments();
      } else {
        alert(result.message || "Phê duyệt lịch hẹn thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối đến máy chủ.");
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !cancelReason.trim()) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/appointments/${selectedAppointment.id}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancellationReason: cancelReason.trim(),
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        triggerSmsToast(
          "SMS Gateway — Đã hủy",
          `Mô phỏng gửi SMS: Đã hủy lịch hẹn ${selectedAppointment.id} của bệnh nhân ${selectedAppointment.patient} thành công!`
        );
        setIsCancelModalOpen(false);
        setSelectedAppointment(null);
        setCancelReason("");
        fetchAppointments();
      } else {
        alert(result.message || "Hủy lịch hẹn thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối đến máy chủ.");
    }
  };

  const getStats = () => {
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === "Confirmed").length;
    const cancelled = appointments.filter((a) => a.status === "Cancelled").length;
    const noShow = appointments.filter((a) => a.status === "No-show").length;
    return { total, confirmed, cancelled, noShow };
  };

  const stats = getStats();

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-2.5">
          <Loader2 className="animate-spin text-[#0EA5E9] h-8 w-8" />
          <p className="text-slate-400 text-xs font-semibold">Đang đồng bộ dữ liệu hệ thống...</p>
        </div>
      ) : (
        <AppointmentTable
          appointments={appointments}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onAddBooking={() => setIsAddDrawerOpen(true)}
          onReschedule={(apt) => {
            setSelectedAppointment(apt);
            setIsRescheduleDrawerOpen(true);
          }}
          onCancel={(apt) => {
            setSelectedAppointment(apt);
            setIsCancelModalOpen(true);
          }}
          onConfirm={handleConfirmAppointment}
          stats={stats}
        />
      )}

      {/* DRAWER: ADD / RESCHEDULE APPOINTMENT */}
      <BookingDrawer
        isOpen={isAddDrawerOpen || isRescheduleDrawerOpen}
        mode={isAddDrawerOpen ? "ADD" : "RESCHEDULE"}
        selectedAppointment={selectedAppointment}
        doctorsList={doctorsList}
        rawSubmissions={rawSubmissions}
        onClose={() => {
          setIsAddDrawerOpen(false);
          setIsRescheduleDrawerOpen(false);
          setSelectedAppointment(null);
        }}
        onRefresh={() => {
          fetchAppointments();
          fetchDoctorSchedules();
        }}
        triggerSmsToast={triggerSmsToast}
      />

      {/* MODAL: CANCEL APPOINTMENT */}
      {isCancelModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] animate-[fadeIn_0.15s_ease-out]"
            onClick={() => { setIsCancelModalOpen(false); setSelectedAppointment(null); }}
          />
          <form
            onSubmit={handleCancelSubmit}
            className="relative bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-[360px] p-6 shadow-2xl text-left animate-[scaleIn_0.15s_ease-out]"
          >
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#0F172A]">Hủy lịch hẹn {selectedAppointment.id}</h3>
              <button
                type="button"
                onClick={() => { setIsCancelModalOpen(false); setSelectedAppointment(null); }}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-[#64748B] leading-relaxed">
                Bạn đang thực hiện hủy lịch hẹn của bệnh nhân <strong className="text-neutral-900">{selectedAppointment.patient}</strong>. Vui lòng ghi rõ lý do.
              </p>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Lý do hủy lịch <span className="text-rose-500">*</span></label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Bệnh nhân bận đột xuất, yêu cầu hoàn cọc..."
                  required
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 resize-none bg-white text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => { setIsCancelModalOpen(false); setSelectedAppointment(null); }}
                className="flex-1 h-9 text-xs font-semibold border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer bg-transparent outline-none"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex-1 h-9 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors border-none cursor-pointer"
              >
                Xác nhận hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SMS Simulated Floating Toast */}
      {smsToast.visible && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0C1A2E] border border-slate-800 rounded-2xl w-[320px] p-4 text-left shadow-2xl animate-[slideInUp_0.2s_ease-out] flex gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 flex items-center justify-center shrink-0 text-[#38BDF8]">
            <MessageSquare size={16} />
          </div>
          <div className="flex-1 min-w-0 text-slate-400 text-xs">
            <p className="font-bold text-white text-[13px]">{smsToast.title}</p>
            <p className="mt-1 leading-normal text-[11px] font-medium">{smsToast.message}</p>
            
            {/* Progress Bar */}
            <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#0EA5E9] transition-all duration-300 rounded-full" style={{ width: `${smsToast.progress}%` }} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
