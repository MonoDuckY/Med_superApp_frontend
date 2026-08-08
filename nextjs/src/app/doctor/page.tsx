"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Stethoscope, 
  LogOut, 
  Shield, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Loader2, 
  AlertCircle, 
  Check, 
  ClipboardList, 
  FlaskConical,
  X
} from "lucide-react";
import { fetchWithAuth, logoutApiCall } from "@/lib/auth";
import Logo from "@/components/Logo";

export default function DoctorDashboard() {
  const router = useRouter();
  
  // Authentication & User States
  const [user, setUser] = useState<{ fullName?: string; phoneNumber?: string; roles?: string[]; role?: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Scheduling States
  const [weekOffset, setWeekOffset] = useState(0);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [allSlots, setAllSlots] = useState<any[]>([]);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");

  // Registration Form States
  const [date, setDate] = useState("");
  const [shift, setShift] = useState<"MORNING" | "AFTERNOON" | "FULL_TIME" | "NIGHT">("MORNING");
  const [roomId, setRoomId] = useState("");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Status Styling Dictionary
  const STATUS_STYLE: Record<string, { bg: string; border: string; text: string; dot: string; label: string }> = {
    approved: { bg: "#F0FDF4", border: "#BBF7D0", text: "#15803D", dot: "#10B981", label: "Đã duyệt" },
    pending:  { bg: "#FFFBEB", border: "#FDE68A", text: "#B45309", dot: "#F59E0B", label: "Chờ duyệt" },
    rejected: { bg: "#FFF1F2", border: "#FECDD3", text: "#BE123C", dot: "#EF4444", label: "Từ chối"  },
  };

  const getInitials = (name?: string) => {
    if (!name) return "DR";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const doctorCode = `DR-${(user?.phoneNumber || "9843").slice(-4)}`;
  const doctorDisplay = `${user?.fullName || "Bác sĩ"} (${doctorCode})`;

  // Date Formatting Helper Utilities
  const formatDateISO = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateDMY = (d: Date) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateDM = (d: Date) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  const getTodayString = () => {
    return formatDateISO(new Date());
  };

  // Get Monday to Sunday date list based on weekOffset
  const getWeekDatesForOffset = (offset: number) => {
    const today = new Date();
    const day = today.getDay();
    // Monday = current date - day + (if Sunday offset by -6, else offset by +1)
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.getFullYear(), today.getMonth(), diff + offset * 7);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const currentWeekDates = getWeekDatesForOffset(weekOffset);
  const weekLabel = `${formatDateDMY(currentWeekDates[0])} – ${formatDateDMY(currentWeekDates[6])}`;

  // Map backend status to UI status groups
  const mapStatus = (statusStr: string): "approved" | "pending" | "rejected" => {
    const upper = (statusStr || "").toUpperCase();
    if (upper === "PENDING") return "pending";
    if (upper === "REJECTED") return "rejected";
    return "approved"; // AVAILABLE, BOOKED, IN_PROGRESS, CLOSED, SCHEDULING
  };

  // Compute time range for a list of slots inside a submission
  const getSubmissionTimeRange = (subSlots: any[]) => {
    if (!subSlots || subSlots.length === 0) return "Chưa rõ";
    
    const times = subSlots.map(s => {
      const match = allSlots.find(slot => slot.id === s.slotId);
      return match ? { start: match.startTime, end: match.endTime } : null;
    }).filter(Boolean) as { start: string; end: string }[];
    
    if (times.length === 0) return "Chưa rõ";
    
    times.sort((a, b) => a.start.localeCompare(b.start));
    const start = times[0].start.slice(0, 5);
    
    times.sort((a, b) => b.end.localeCompare(a.end));
    const end = times[0].end.slice(0, 5);
    
    return `${start} – ${end}`;
  };

  // Look up Room Name
  const getRoomName = (rId: string) => {
    const match = allRooms.find(r => r.id === rId);
    return match ? match.name : rId;
  };

  // Fetch Options & Schedulings
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
          localStorage.setItem("workSlotOptions", JSON.stringify(slots));
          localStorage.setItem("clinicRoomOptions", JSON.stringify(rooms));
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
      // Extend the end date by 1 day to prevent timezone offset boundary issues from omitting Sunday schedules
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

  // On Mount Auth Check
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");
    if (!token || !savedUser) {
      router.push("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      const roles = parsedUser.roles || (parsedUser.role ? [parsedUser.role] : []);
      const upperRoles = roles.map((r: string) => r.toUpperCase());
      
      if (!upperRoles.includes("DOCTOR")) {
        if (upperRoles.includes("ADMIN")) {
          router.push("/user-management/create-user");
        } else if (upperRoles.includes("STAFF")) {
          router.push("/staff");
        } else if (upperRoles.includes("RESEARCHER")) {
          router.push("/researcher");
        } else {
          router.push("/");
        }
        return;
      }
      
      setUser(parsedUser);
      setCheckingAuth(false);
    } catch (e) {
      console.error(e);
      router.push("/");
    }

    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [router]);

  // Load schedules and options once auth finishes
  useEffect(() => {
    if (!checkingAuth) {
      fetchOptions();
    }
  }, [checkingAuth]);

  // Reload schedules on offset change
  useEffect(() => {
    if (!checkingAuth) {
      fetchSchedules();
    }
  }, [weekOffset, checkingAuth]);

  const handleLogout = async () => {
    await logoutApiCall();
    router.push("/");
  };

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

  const rawRoles = user?.roles || (user?.role ? [user.role] : []);
  const userRoles = rawRoles.filter((r): r is string => !!r).map(r => r.toUpperCase());
  const WEEKDAY_NAMES = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0C1A2E] flex flex-col items-center justify-center gap-3">
        <svg className="animate-spin h-8 w-8 text-[#0EA5E9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-400 text-xs font-medium">Đang kiểm tra bảo mật phân hệ bác sĩ...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header Navigation */}
      <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 shrink-0">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Logo size="sm" />
          <div>
            <p className="text-[#0F172A] font-bold text-[14px] leading-none">HMS NextGen</p>
            <p className="text-[#0EA5E9] text-[10px] font-semibold mt-0.5 tracking-wider uppercase">Clinical Portal</p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-stretch h-full gap-1">
          <button
            onClick={() => setActiveTab("list")}
            className={`relative px-5 text-sm font-medium transition-colors cursor-pointer flex items-center ${activeTab === "list" ? "text-[#0EA5E9]" : "text-[#64748B]"}`}
          >
            Danh sách lịch khám
            {activeTab === "list" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-[#0EA5E9]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`relative px-5 text-sm font-medium transition-colors cursor-pointer flex items-center ${activeTab === "schedule" ? "text-[#0EA5E9]" : "text-[#64748B]"}`}
          >
            Đăng ký lịch làm việc
            {activeTab === "schedule" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-[#0EA5E9]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className={`relative px-5 text-sm font-medium transition-colors cursor-pointer flex items-center ${activeTab === "records" ? "text-[#0EA5E9]" : "text-[#64748B]"}`}
          >
            Hồ sơ bệnh nhân
            {activeTab === "records" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-[#0EA5E9]" />
            )}
          </button>
        </nav>

        {/* Right Side: Doctor Profile dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[#0F172A]">{user?.fullName || "Bác sĩ"}</p>
            <p className="text-[10px] font-mono text-[#64748B]">{doctorCode}</p>
          </div>

          <div ref={profileRef} className="relative">
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 flex items-center justify-center cursor-pointer hover:bg-[#0EA5E9]/20 transition-all font-bold text-[#0EA5E9] text-xs"
            >
              {getInitials(user?.fullName)}
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-50 py-1.5 animate-[fadeIn_0.15s_ease-out] text-left">
                <div className="px-4 py-2 border-b border-[#F1F5F9]">
                  <p className="text-[12px] font-semibold text-[#0F172A] truncate">{user?.fullName || "Bác sĩ"}</p>
                  <p className="text-[10px] text-[#64748B] truncate mt-0.5">{user?.phoneNumber || "N/A"}</p>
                </div>
                
                {/* Role switcher for multi-role accounts */}
                {userRoles.length > 1 && (
                  <div className="px-1.5 py-1.5 border-b border-[#F1F5F9]">
                    <p className="px-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chuyển vai trò</p>
                    <div className="flex flex-col gap-0.5">
                      {userRoles.includes("ADMIN") && (
                        <button
                          onClick={() => router.push("/user-management/create-user")}
                          className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none"
                        >
                          <Shield size={13} className="shrink-0 text-slate-400" />
                          <span>Quản trị viên</span>
                        </button>
                      )}
                      {userRoles.includes("DOCTOR") && (
                        <button
                          onClick={() => router.push("/doctor")}
                          className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-[#0EA5E9] bg-sky-50/60 font-semibold cursor-pointer border-none outline-none"
                        >
                          <Stethoscope size={13} className="shrink-0 text-[#0EA5E9]" />
                          <span className="flex-1">Bác sĩ</span>
                          <Check size={11} className="text-[#0EA5E9] ml-auto" />
                        </button>
                      )}
                      {userRoles.includes("STAFF") && (
                        <button
                          onClick={() => router.push("/staff")}
                          className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none"
                        >
                          <ClipboardList size={13} className="shrink-0 text-slate-400" />
                          <span>Nhân viên y tế</span>
                        </button>
                      )}
                      {userRoles.includes("RESEARCHER") && (
                        <button
                          onClick={() => router.push("/researcher")}
                          className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none"
                        >
                          <FlaskConical size={13} className="shrink-0 text-slate-400" />
                          <span>Nghiên cứu sinh</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-[12px] text-[#EF4444] hover:bg-[#FFF1F2] transition-colors cursor-pointer outline-none font-bold border-none"
                >
                  <LogOut size={13} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === "schedule" ? (
        <main className="flex-1 overflow-hidden px-8 py-5">
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
                                          {style.label}
                                        </span>
                                      </div>
                                      
                                      {statusType === "pending" && (
                                        <button
                                          onClick={() => handleCancelPending(sub.submissionId)}
                                          className="hidden group-hover:flex items-center text-slate-400 hover:text-rose-500 text-[10px] font-semibold transition-colors cursor-pointer border-none bg-transparent p-0"
                                          title="Hủy đăng ký ca này"
                                        >
                                          <X size={10} className="mr-0.5" /> Hủy
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-[11px] font-bold font-mono tracking-tight mt-0.5" style={{ color: style.text }}>
                                      {timeRange}
                                    </p>
                                    <p className="text-xs font-medium" style={{ color: style.text, opacity: 0.9 }}>
                                      {roomName}
                                    </p>
                                    {sub.slots && sub.slots[0]?.note && (
                                      <p className="text-[9px] italic mt-0.5 line-clamp-2" style={{ color: style.text, opacity: 0.7 }} title={sub.slots[0].note}>
                                        Note: {sub.slots[0].note}
                                      </p>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="flex-1 flex items-center justify-center py-8">
                                <p className="text-[10px] text-center text-[#CBD5E1] select-none leading-relaxed">
                                  Không có ca<br />đăng ký
                                </p>
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend Footer */}
                <div className="px-6 py-3 border-t border-[#F1F5F9] flex items-center gap-6 shrink-0 bg-[#FAFAFA]">
                  {Object.entries(STATUS_STYLE).map(([key, s]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.dot }} />
                      <span className="text-xs font-medium text-[#64748B]">{s.label}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Right Column — Registration Form */}
            <div className="w-[380px] lg:w-[420px] shrink-0 flex flex-col min-h-0">
              <form onSubmit={handleSubmitSchedule} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col h-full shadow-sm">
                
                {/* Form Header */}
                <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between shrink-0">
                  <h2 className="font-bold text-base text-[#0F172A]">Đăng ký Ca làm việc mới</h2>
                </div>

                {/* Form Inputs Container */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  
                  {/* Status notifications */}
                  {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                      <Check size={14} className="shrink-0 text-emerald-500" />
                      <span className="font-medium">{successMsg}</span>
                    </div>
                  )}
                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                      <AlertCircle size={14} className="shrink-0 text-rose-500 mt-0.5" />
                      <span className="font-medium leading-relaxed">{errorMsg}</span>
                    </div>
                  )}

                  {/* Doctor Info Field (Disabled) */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1.5 uppercase tracking-wider">Bác sĩ</label>
                    <input
                      disabled
                      value={doctorDisplay}
                      className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg bg-slate-50 cursor-not-allowed font-mono text-[#64748B] select-none"
                    />
                    <p className="text-[10px] text-[#94A3B8] mt-1 italic">Tự động xác định theo tài khoản đăng nhập</p>
                  </div>

                  {/* Work Date Picker */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1.5 uppercase tracking-wider">
                      Ngày làm việc <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={date}
                        min={getTodayString()}
                        onChange={e => { setDate(e.target.value); setErrorMsg(null); setSuccessMsg(null); }}
                        className="w-full h-9 pl-3 pr-10 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all font-medium text-[#0F172A]"
                      />
                      <Calendar size={14} className="absolute right-3 top-2.5 text-[#94A3B8] pointer-events-none" />
                    </div>
                  </div>

                  {/* Shift Selection Cards */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1.5 uppercase tracking-wider">
                      Ca làm việc <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: "MORNING", label: "Ca Sáng", time: "08:00 – 12:00" },
                        { key: "AFTERNOON", label: "Ca Chiều", time: "13:30 – 17:30" },
                        { key: "NIGHT", label: "Ca Đêm", time: "17:00 – 05:00" },
                        { key: "FULL_TIME", label: "Cả Ngày", time: "08:00 – 17:30" },
                      ].map(s => {
                        const active = shift === s.key;
                        return (
                          <button
                            key={s.key}
                            type="button"
                            onClick={() => { setShift(s.key as any); setErrorMsg(null); setSuccessMsg(null); }}
                            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all cursor-pointer text-center outline-none select-none"
                            style={active
                              ? { background: "#F0F9FF", borderColor: "#0EA5E9", boxShadow: "0 0 0 2px rgba(14,165,233,0.15)" }
                              : { background: "white", borderColor: "#E2E8F0" }}
                          >
                            <span className="text-[11px] font-bold" style={{ color: active ? "#0EA5E9" : "#0F172A" }}>{s.label}</span>
                            <span className="text-[9px] font-mono font-medium" style={{ color: active ? "#38BDF8" : "#64748B" }}>{s.time}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clinic Room Selection Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1.5 uppercase tracking-wider">
                      Phòng khám <span className="text-rose-500">*</span>
                    </label>
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
        </main>
      ) : (
        <main className="flex-1 flex items-center justify-center p-6 bg-[#F8FAFC]">
          <div className="w-full max-w-[500px] bg-white border border-[#E2E8F0] rounded-2xl p-10 shadow-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center mb-6">
              <Stethoscope size={32} strokeWidth={1.5} className="text-[#0EA5E9]" />
            </div>

            <h2 className="text-[#0EA5E9] font-bold text-xl mb-2">
              Phân hệ {activeTab === "list" ? "Danh sách lịch khám" : "Hồ sơ bệnh nhân"}
            </h2>
            <p className="text-[#64748B] text-[13px] max-w-[360px] leading-relaxed mb-6">
              Tính năng đang được phát triển trong giai đoạn tiếp theo của dự án HMS Clinical Portal.
            </p>

            <button
              onClick={() => setActiveTab("schedule")}
              className="h-9 px-4 text-xs font-bold text-white bg-[#0EA5E9] hover:bg-[#0284C7] rounded-lg transition-colors cursor-pointer"
            >
              Quay lại Đăng ký lịch làm việc
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

