import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

const WEEKDAY_NAMES = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

const STATUS_STYLE: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  PENDING: {
    bg: "#FFF9E6",
    border: "#FFEBA3",
    text: "#B27B00",
    dot: "#F59E0B"
  },
  APPROVED: {
    bg: "#E6F4EA",
    border: "#CEEAD6",
    text: "#137333",
    dot: "#10B981"
  },
  REJECTED: {
    bg: "#FCE8E6",
    border: "#FAD2CF",
    text: "#C5221F",
    dot: "#EF4444"
  },
  CANCELLED: {
    bg: "#F1F3F4",
    border: "#DADCE0",
    text: "#5F6368",
    dot: "#9CA3AF"
  }
};

export default function ScheduleRegister() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [allSlots, setAllSlots] = useState<any[]>([]);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Form registration states
  const [date, setDate] = useState("");
  const [shift, setShift] = useState("MORNING");
  const [roomId, setRoomId] = useState("");
  const [note, setNote] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Get date range labels for current week
  const getWeekDates = (offset: number) => {
    const today = new Date();
    const day = today.getDay(); // 0 for Sunday, 1 for Monday...
    const diff = today.getDate() - (day === 0 ? 6 : day - 1) + (offset * 7);
    const startOfWeek = new Date(today.setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const currentWeekDates = getWeekDates(weekOffset);

  const formatDateISO = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateDM = (d: Date) => {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${dd}/${mm}`;
  };

  const weekLabel = `Tuần: ${formatDateDM(currentWeekDates[0])} – ${formatDateDM(currentWeekDates[6])}`;

  const mapStatus = (status: string) => {
    const upper = status.toUpperCase();
    if (upper.includes("PENDING")) return "PENDING";
    if (upper.includes("APPROVED") || upper.includes("AVAILABLE")) return "APPROVED";
    if (upper.includes("REJECTED")) return "REJECTED";
    return "CANCELLED";
  };

  const getSubmissionTimeRange = (subSlots?: any[]) => {
    if (!subSlots || subSlots.length === 0) return "Chưa rõ";
    const slotDetails = subSlots.map(s => {
      const match = allSlots.find(sl => sl.id === s.slotId);
      return match ? { start: match.startTime, end: match.endTime } : null;
    }).filter(Boolean) as { start: string; end: string }[];
    
    if (slotDetails.length === 0) return "Chưa rõ";
    
    slotDetails.sort((a, b) => a.start.localeCompare(b.start));
    const start = slotDetails[0].start.slice(0, 5);
    
    slotDetails.sort((a, b) => b.end.localeCompare(a.end));
    const end = slotDetails[0].end.slice(0, 5);
    
    return `${start} – ${end}`;
  };

  const getRoomName = (rId: string) => {
    const match = allRooms.find(r => r.id === rId);
    return match ? match.name : rId;
  };

  const fetchOptions = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/work-schedules/options`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const slots = result.data.slots || [];
          const rooms = result.data.rooms || [];
          setAllSlots(slots);
          setAllRooms(rooms);
        }
      }
    } catch (e) {
      console.error("Failed to fetch scheduling options:", e);
    }
  };

  const fetchSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const fromStr = formatDateISO(currentWeekDates[0]);
      const nextDayOfEnd = new Date(currentWeekDates[6]);
      nextDayOfEnd.setDate(nextDayOfEnd.getDate() + 1);
      const toStr = formatDateISO(nextDayOfEnd);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/work-schedules?from=${fromStr}&to=${toStr}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setSubmissions(result.data || []);
        }
      }
    } catch (e) {
      console.error("Failed to fetch doctor work schedules:", e);
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [weekOffset]);

  const handleCancelPending = async (submissionId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy yêu cầu đăng ký lịch này?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/work-schedules/${submissionId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert("Đã hủy yêu cầu đăng ký lịch thành công.");
        fetchSchedules();
      } else {
        alert(result.message || "Hủy yêu cầu đăng ký thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi khi hủy yêu cầu.");
    }
  };

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!date) {
      setErrorMsg("Vui lòng chọn ngày làm việc.");
      return;
    }
    if (!roomId) {
      setErrorMsg("Vui lòng chọn phòng khám.");
      return;
    }

    setFormLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/work-schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workDate: date,
          session: shift,
          roomId,
          note: note.trim() || null,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg("Gửi đăng ký lịch thành công! Đang chờ duyệt.");
        setDate("");
        setNote("");
        setRoomId("");
        fetchSchedules();
      } else {
        let msg = result.message || "Gửi đăng ký lịch thất bại.";
        if (msg.includes("conflicts with existing slots")) {
          msg = "Lịch làm việc này bị trùng với ca trực đã được duyệt hoặc đang chờ duyệt khác của bạn. Vui lòng chọn ngày, ca hoặc phòng khám khác.";
        }
        setErrorMsg(msg);
      }
    } catch (err: any) {
      let msg = err.message || "Đã xảy ra lỗi khi gửi đăng ký.";
      if (msg.includes("conflicts with existing slots")) {
        msg = "Lịch làm việc này bị trùng với ca trực đã được duyệt hoặc đang chờ duyệt khác của bạn. Vui lòng chọn ngày, ca hoặc phòng khám khác.";
      }
      setErrorMsg(msg);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="flex gap-6 h-full min-h-0">
      
      {/* Left Column — Weekly Schedule Panel */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col h-full shadow-sm">
          
          {/* Week Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9] shrink-0">
            <h2 className="font-bold text-base text-[#0F172A]">Lịch làm việc tuần này</h2>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset(w => w - 1)}
                className="h-8 px-3 text-xs font-medium border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 text-[#64748B]"
              >
                <ChevronLeft size={14} />
                Tuần trước
              </button>
              <span className="h-8 px-3 text-xs font-semibold rounded-lg flex items-center bg-[#F0F9FF] text-[#0369A1]">
                {weekLabel}
              </span>
              <button
                onClick={() => setWeekOffset(w => w + 1)}
                className="h-8 px-3 text-xs font-medium border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 text-[#64748B]"
              >
                Tuần sau
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Week Panel Grid */}
          <div className="flex-1 overflow-x-auto relative min-h-[200px]">
            {loadingSchedules && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#0EA5E9] h-8 w-8" />
              </div>
            )}
            
            <div className="grid h-full min-w-[980px]" style={{ gridTemplateColumns: `repeat(${WEEKDAY_NAMES.length}, minmax(130px, 1fr))` }}>
              {currentWeekDates.map((dayDate, i) => {
                const dayName = WEEKDAY_NAMES[i];
                const dateStr = formatDateISO(dayDate);
                const dateLabel = formatDateDM(dayDate);
                const daySubmissions = submissions.filter(s => s.workDate === dateStr);
                const isToday = formatDateISO(new Date()) === dateStr;
                
                return (
                  <div key={dateStr} className="flex flex-col border-r border-[#F1F5F9] last:border-r-0 h-full">
                    
                    {/* Day column header */}
                    <div
                      className="px-3 py-2.5 text-center border-b border-[#F1F5F9] shrink-0"
                      style={{ background: isToday ? "#F0F9FF" : "#FAFAFA" }}
                    >
                      <p className="text-xs font-bold" style={{ color: isToday ? "#0EA5E9" : "#0F172A" }}>{dayName}</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: isToday ? "#38BDF8" : "#64748B" }}>{dateLabel}</p>
                      {isToday && <span className="inline-block mt-1 w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />}
                    </div>

                    {/* Day column slots list */}
                    <div className="p-2.5 flex-1 flex flex-col gap-2.5 bg-slate-50/20 overflow-y-auto">
                      {daySubmissions.length > 0 ? (
                        daySubmissions.map(sub => {
                          const statusType = mapStatus(sub.status);
                          const style = STATUS_STYLE[statusType];
                          const timeRange = getSubmissionTimeRange(sub.slots);
                          const roomName = sub.slots && sub.slots[0] ? getRoomName(sub.slots[0].roomId) : "N/A";
                          
                          return (
                            <div
                              key={sub.submissionId}
                              className="rounded-lg px-2.5 py-2 flex flex-col gap-1 border relative group transition-all duration-200 hover:shadow-sm"
                              style={{ background: style.bg, borderColor: style.border }}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: style.dot }} />
                                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: style.text }}>
                                    {sub.session === "MORNING" ? "Sáng" : "Chiều"}
                                  </span>
                                </div>

                                {statusType === "PENDING" && (
                                  <button
                                    onClick={() => handleCancelPending(sub.submissionId)}
                                    title="Hủy đăng ký"
                                    className="hidden group-hover:block text-[10px] text-red-500 hover:underline font-bold border-none bg-transparent outline-none cursor-pointer"
                                  >
                                    Hủy
                                  </button>
                                )}
                              </div>

                              <p className="text-[11px] font-bold mt-0.5 text-slate-800">{timeRange}</p>
                              <p className="text-[10px] font-medium text-slate-500 truncate" title={roomName}>{roomName}</p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-[10px] text-slate-300 font-medium italic">Không có lịch</p>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Right Column — Register Schedule Form */}
      <div style={{ width: 280 }} className="shrink-0">
        <form onSubmit={handleSubmitSchedule} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col h-full shadow-sm">
          
          <div className="px-6 py-4 border-b border-[#F1F5F9] shrink-0">
            <h2 className="font-bold text-base text-[#0F172A]">Đăng ký ca làm việc</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-1 leading-snug">Gửi yêu cầu đăng ký ca làm việc mới của bạn cho nhân viên điều phối phê duyệt.</p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5">
            
            {errorMsg && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-red-600 text-xs font-semibold leading-relaxed animate-[fadeIn_0.15s_ease-out]">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-emerald-700 text-xs font-semibold leading-relaxed animate-[fadeIn_0.15s_ease-out]">
                {successMsg}
              </div>
            )}

            {/* Date Input */}
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5 uppercase tracking-wider">Ngày làm việc</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => { setDate(e.target.value); setErrorMsg(null); setSuccessMsg(null); }}
                className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 bg-white font-medium text-[#0F172A]"
              />
            </div>

            {/* Session Segmented Control */}
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5 uppercase tracking-wider">Ca làm việc</label>
              <div className="flex gap-1 p-1 rounded-lg bg-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => { setShift("MORNING"); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer border-none ${shift === "MORNING" ? "bg-white text-[#0EA5E9] shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  Sáng (8h-12h)
                </button>
                <button
                  type="button"
                  onClick={() => { setShift("AFTERNOON"); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer border-none ${shift === "AFTERNOON" ? "bg-white text-[#0EA5E9] shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  Chiều (13h-17h)
                </button>
              </div>
            </div>

            {/* Clinic Room Selector */}
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5 uppercase tracking-wider">Phòng khám</label>
              <div className="relative">
                <select
                  required
                  value={roomId}
                  onChange={e => { setRoomId(e.target.value); setErrorMsg(null); setSuccessMsg(null); }}
                  className="w-full h-9 pl-3 pr-8 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 bg-white appearance-none cursor-pointer transition-all font-medium text-[#0F172A]"
                >
                  <option value="">Chọn phòng khám đăng ký...</option>
                  {allRooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* Optional Note Textarea */}
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5 uppercase tracking-wider">Ghi chú</label>
              <textarea
                value={note}
                onChange={e => { setNote(e.target.value); setErrorMsg(null); setSuccessMsg(null); }}
                rows={3}
                placeholder="Nhập ghi chú thêm cho nhân viên điều phối (tùy chọn)..."
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 resize-none transition-all text-[#0F172A] font-medium"
              />
            </div>

          </div>

          {/* Footer submit/reset buttons */}
          <div className="px-6 py-4 border-t border-[#F1F5F9] flex gap-3 shrink-0 bg-[#FAFAFA]">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 h-10 text-xs font-bold text-white rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 select-none bg-[#0EA5E9] hover:bg-[#0284C7]"
            >
              {formLoading ? (
                <>
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  Đang gửi...
                </>
              ) : (
                "Gửi đăng ký lịch"
              )}
            </button>
            <button
              type="button"
              onClick={() => { setShift("MORNING"); setRoomId(""); setDate(""); setNote(""); setErrorMsg(null); setSuccessMsg(null); }}
              className="h-10 px-5 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-[#64748B] select-none"
            >
              Hủy bỏ
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
