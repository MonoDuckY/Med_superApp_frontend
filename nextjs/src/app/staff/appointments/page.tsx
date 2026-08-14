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
  const [roomsList, setRoomsList] = useState<any[]>([]);

  // View mode and overview selections
  const [activeView, setActiveView] = useState<"list" | "overview">("list");
  const [selectedOverviewDate, setSelectedOverviewDate] = useState<string | null>(null);

  const getOccupancyData = () => {
    const data: Record<string, { date: Date; dateStr: string; slots: any[] }> = {};
    
    // Initialize next 14 days in Vietnam timezone
    const today = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const parts = formatter.formatToParts(today);
    const year = parseInt(parts.find(p => p.type === "year")!.value, 10);
    const month = parseInt(parts.find(p => p.type === "month")!.value, 10) - 1;
    const dateVal = parseInt(parts.find(p => p.type === "day")!.value, 10);
    
    const localToday = new Date(year, month, dateVal);
    
    for (let i = 0; i < 14; i++) {
      const d = new Date(localToday);
      d.setDate(d.getDate() + i);
      const isoStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }); // "YYYY-MM-DD"
      data[isoStr] = {
        date: d,
        dateStr: isoStr,
        slots: []
      };
    }

    // Distribute slots from rawSubmissions
    rawSubmissions.forEach(sub => {
      const sDate = sub.workDate; // "YYYY-MM-DD"
      if (data[sDate]) {
        const slots = sub.slots || [];
        slots.forEach((s: any) => {
          const matchedRoom = roomsList.find((r: any) => r.id === s.roomId);
          const rName = matchedRoom ? matchedRoom.name : `Phòng ID: ${s.roomId || "N/A"}`;
          
          data[sDate].slots.push({
            ...s,
            doctorId: sub.doctorId,
            doctorName: sub.doctor?.fullName || "Bác sĩ",
            roomName: rName
          });
        });
      }
    });

    return Object.values(data).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  };

  // Modals & Drawers
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isRescheduleDrawerOpen, setIsRescheduleDrawerOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
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

  const fetchRooms = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/clinic-rooms`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setRoomsList(result.data || []);
          return result.data || [];
        }
      }
    } catch (e) {
      console.warn("Failed to fetch clinic rooms:", e);
    }
    return [];
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchRooms();
      await fetchDoctors();
      await fetchAppointments();
      await fetchDoctorSchedules();
      setLoading(false);
    };
    initData();
  }, []);

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
      {/* View Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 shrink-0">
        <button
          onClick={() => setActiveView("list")}
          className={`px-4 py-2 text-xs font-bold transition-all border-none bg-transparent cursor-pointer rounded-lg
            ${activeView === "list" ? "bg-[#0EA5E9]/15 text-[#0EA5E9]" : "text-slate-400 hover:text-slate-600"}`}
        >
          Danh sách lịch hẹn
        </button>
        <button
          onClick={() => setActiveView("overview")}
          className={`px-4 py-2 text-xs font-bold transition-all border-none bg-transparent cursor-pointer rounded-lg
            ${activeView === "overview" ? "bg-[#0EA5E9]/15 text-[#0EA5E9]" : "text-slate-400 hover:text-slate-600"}`}
        >
          Lịch xem tổng thể (Occupancy Calendar)
        </button>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-2.5">
          <Loader2 className="animate-spin text-[#0EA5E9] h-8 w-8" />
          <p className="text-slate-400 text-xs font-semibold">Đang đồng bộ dữ liệu hệ thống...</p>
        </div>
      ) : activeView === "list" ? (
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
          stats={stats}
        />
      ) : (
        <div className="space-y-6">
          <div className="text-left">
            <h2 className="text-lg font-bold text-[#0F172A]">Lịch xem tổng thể ca trực &amp; lịch khám</h2>
            <p className="text-xs text-slate-400 mt-1">Giúp kiểm tra mật độ lịch hẹn trong 14 ngày tới để điều phối và sắp xếp lịch tối ưu.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {getOccupancyData().map(day => {
              const total = day.slots.length;
              const booked = day.slots.filter(s => s.status === "BOOKED").length;
              const available = day.slots.filter(s => s.status === "AVAILABLE").length;
              const percent = total > 0 ? (booked / total) * 100 : 0;

              // Format date: e.g. "Thứ Bảy, 15/08"
              const dayName = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][day.date.getDay()];
              const dateDM = `${String(day.date.getDate()).padStart(2, "0")}/${String(day.date.getMonth() + 1).padStart(2, "0")}`;

              // Determine visual color of progress bar & status badge
              let statusLabel = "Trống ca";
              let colorClass = "bg-emerald-500";
              let bgClass = "bg-emerald-50";
              let textClass = "text-emerald-700";
              let borderClass = "border-emerald-200";

              if (total > 0) {
                if (percent >= 90) {
                  statusLabel = "Rất bận (Đầy)";
                  colorClass = "bg-rose-500";
                  bgClass = "bg-rose-50";
                  textClass = "text-rose-700";
                  borderClass = "border-rose-200";
                } else if (percent >= 50) {
                  statusLabel = "Vừa phải";
                  colorClass = "bg-amber-500";
                  bgClass = "bg-amber-50";
                  textClass = "text-amber-700";
                  borderClass = "border-amber-200";
                } else {
                  statusLabel = "Còn nhiều ca trống";
                  colorClass = "bg-emerald-500";
                  bgClass = "bg-emerald-50";
                  textClass = "text-emerald-700";
                  borderClass = "border-emerald-200";
                }
              } else {
                statusLabel = "Không có ca trực";
                colorClass = "bg-slate-300";
                bgClass = "bg-slate-50";
                textClass = "text-slate-500";
                borderClass = "border-slate-200";
              }

              const isSelected = selectedOverviewDate === day.dateStr;

              return (
                <div
                  key={day.dateStr}
                  onClick={() => {
                    if (total > 0) {
                      setSelectedOverviewDate(isSelected ? null : day.dateStr);
                    }
                  }}
                  className={`bg-white border rounded-2xl p-5 shadow-sm transition-all select-none text-left
                    ${total > 0 ? "cursor-pointer hover:shadow-md hover:border-[#0EA5E9]" : "opacity-60 cursor-not-allowed"}
                    ${isSelected ? "border-[#0EA5E9] ring-2 ring-sky-100" : "border-[#E2E8F0]"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0F172A] text-sm">{dayName}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{dateDM}/{day.date.getFullYear()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${bgClass} ${textClass} ${borderClass}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {total > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${colorClass} transition-all duration-300`} style={{ width: `${percent}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Đã đặt: {booked}/{total}</span>
                        <span>Trống: {available} ca</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Details Section for Selected Date */}
          {selectedOverviewDate && (() => {
            const dayData = getOccupancyData().find(d => d.dateStr === selectedOverviewDate);
            if (!dayData || dayData.slots.length === 0) return null;

            const dayName = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][dayData.date.getDay()];
            const [y, m, d] = selectedOverviewDate.split("-");
            const dateDMY = `${d}/${m}/${y}`;

            return (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <div className="text-left">
                    <h3 className="font-bold text-[#0F172A] text-base">Chi tiết ca trực &amp; Lịch trống</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{dayName}, ngày {dateDMY}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOverviewDate(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayData.slots.map((slotObj: any, index: number) => {
                    const timeRange = slotObj.slot ? `${slotObj.slot.startTime.slice(0, 5)} - ${slotObj.slot.endTime.slice(0, 5)}` : "N/A";
                    
                    let bg = "bg-slate-50 border-slate-200 text-slate-700";
                    let statusLabel = "Khóa";
                    let isAvailable = slotObj.status === "AVAILABLE";

                    if (slotObj.status === "AVAILABLE") {
                      bg = "bg-emerald-50 border-emerald-100 text-emerald-700";
                      statusLabel = "Trống ca";
                    } else if (slotObj.status === "BOOKED") {
                      bg = "bg-sky-50 border-sky-100 text-sky-700";
                      statusLabel = "Đã đặt";
                    } else if (slotObj.status === "PENDING") {
                      bg = "bg-amber-50 border-amber-100 text-amber-700";
                      statusLabel = "Chờ duyệt";
                    }

                    return (
                      <div key={index} className={`border rounded-xl p-4 flex flex-col justify-between gap-3 ${bg}`}>
                        <div className="space-y-1.5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono">{timeRange}</span>
                            <span className="text-[10px] font-bold uppercase">{statusLabel}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-900">{slotObj.doctorName}</p>
                          <p className="text-[10px] opacity-75 font-medium">{slotObj.roomName}</p>
                        </div>

                        {isAvailable && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAppointment({
                                doctorId: slotObj.doctorId,
                                date: selectedOverviewDate,
                                slotId: slotObj.id
                              });
                              setIsAddDrawerOpen(true);
                            }}
                            className="w-full py-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-lg border-none cursor-pointer transition-all active:scale-[0.98] mt-1 shadow-sm"
                          >
                            Đặt lịch hẹn tại đây
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
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
