"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Calendar,
  Check,
  XCircle,
  Clock,
  Search,
  ChevronDown,
  ChevronRight,
  Bell,
  LogOut,
  RefreshCw,
  X,
  MessageSquare,
  LayoutDashboard,
  Stethoscope,
  ClipboardList,
  FileText,
  Settings,
  Shield,
  FlaskConical,
  Loader2,
  User
} from "lucide-react";

import { fetchWithAuth, logoutApiCall } from "@/lib/auth";
import Logo from "@/components/Logo";

import AppointmentTable, { Appointment } from "@/components/staff/AppointmentTable";
import BookingDrawer from "@/components/staff/BookingDrawer";
import ScheduleApprovals from "@/components/staff/ScheduleApprovals";

type Status = "Confirmed" | "Cancelled" | "No-show" | "Completed" | "Chờ xác nhận" | "In-progress";

interface DoctorSchedule {
  id: string;
  doctorName: string;
  workDate: string;
  shift: string;
  roomName: string;
  status: string;
  rejectionReason?: string;
}

export default function StaffDashboard() {
  const router = useRouter();
  
  // Authentication & Session States
  const [user, setUser] = useState<{ fullName?: string; phoneNumber?: string; roles?: string[]; role?: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Profile Menu States & Ref
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<string>("appointments");

  // Core Data States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [rawSubmissions, setRawSubmissions] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UI Control States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isRescheduleDrawerOpen, setIsRescheduleDrawerOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRejectScheduleModalOpen, setIsRejectScheduleModalOpen] = useState(false);

  // Selected Item for Actions
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Toast status for SMS simulation
  const [smsToast, setSmsToast] = useState<{
    visible: boolean;
    title: string;
    message: string;
    progress: number;
  }>({
    visible: false,
    title: "SMS Gateway — Đang xử lý",
    message: "Mô phỏng SMS Gateway: Đang gửi tin nhắn tiếng Việt bất đồng bộ...",
    progress: 0
  });

  const toastInterval = useRef<NodeJS.Timeout | null>(null);

  // SMS Simulator Toast trigger
  const triggerSmsToast = (title: string, message: string) => {
    if (toastInterval.current) {
      clearInterval(toastInterval.current);
    }
    setSmsToast({
      visible: true,
      title,
      message,
      progress: 0
    });

    toastInterval.current = setInterval(() => {
      setSmsToast((prev) => {
        if (prev.progress >= 100) {
          if (toastInterval.current) clearInterval(toastInterval.current);
          return { ...prev, visible: false, progress: 0 };
        }
        return { ...prev, progress: prev.progress + 25 };
      });
    }, 750);
  };

  const getVietnameseHeaderDate = () => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const parts = formatter.formatToParts(new Date());
    const year = parseInt(parts.find(p => p.type === "year")!.value, 10);
    const month = parseInt(parts.find(p => p.type === "month")!.value, 10) - 1;
    const dateVal = parseInt(parts.find(p => p.type === "day")!.value, 10);
    
    const localToday = new Date(year, month, dateVal);
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const dayName = days[localToday.getDay()];
    const dateStr = String(dateVal).padStart(2, "0");
    const monthStr = String(month + 1).padStart(2, "0");
    return `${dayName}, ${dateStr}/${monthStr}/${year}`;
  };

  const getInitials = (name?: string) => {
    if (!name) return "TB";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "TB";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      confirmed: appointments.filter((a) => a.status === "Confirmed" || a.status === "Completed").length,
      cancelled: appointments.filter((a) => a.status === "Cancelled").length,
      noShow: appointments.filter((a) => a.status === "No-show").length,
    };
  }, [appointments]);

  // Fetch Doctors List
  const fetchDoctors = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/doctors`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setDoctorsList(result.data || []);
          return result.data || [];
        }
      }
    } catch (e) {
      console.warn("Failed to fetch doctors:", e);
    }
    return [];
  };

  // Fetch Doctor Schedules for Approvals and booking slots picker
  const fetchDoctorSchedules = async (docsParam?: any[]) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const docs = docsParam || doctorsList;
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-schedules`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setRawSubmissions(result.data || []);
          const mapped: DoctorSchedule[] = result.data.map((item: any) => {
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
      console.warn("Failed to fetch doctor schedules:", e);
    }
  };

  // Fetch Appointments
  const fetchAppointments = async () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/appointments`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const mapped: Appointment[] = result.data.map((a: any) => {
            const start = a.slot?.startTime?.slice(0, 5) || "";
            const end = a.slot?.endTime?.slice(0, 5) || "";
            const timeStr = start && end ? `${start}–${end}` : "08:00–08:30";
            
            let displayStatus: Status = "Chờ xác nhận";
            const apiStatus = a.status ? a.status.toUpperCase() : "PENDING";
            if (apiStatus.includes("CONFIRM")) displayStatus = "Confirmed";
            else if (apiStatus.includes("CANCEL")) displayStatus = "Cancelled";
            else if (apiStatus.includes("COMPLET")) displayStatus = "Completed";
            else if (apiStatus.includes("NO_SHOW")) displayStatus = "No-show";
            else if (apiStatus.includes("PROGRESS")) displayStatus = "In-progress";

            let formattedDate = "";
            if (a.doctorWorkSlot?.workDate) {
              const [y, m, d] = a.doctorWorkSlot.workDate.split("-");
              if (y && m && d) {
                formattedDate = `${d}/${m}/${y}`;
              } else {
                formattedDate = a.doctorWorkSlot.workDate;
              }
            }

            return {
              id: a.appointmentCode || `#APT-${a.id.slice(-4)}`,
              patient: a.patient?.fullName || "Bệnh nhân",
              phone: a.patient?.phoneNumber || "N/A",
              doctor: a.doctor?.fullName ? `BS. ${a.doctor.fullName}` : "Bác sĩ",
              room: a.room?.roomCode || "Phòng khám",
              date: formattedDate,
              time: timeStr,
              status: displayStatus,
              type: "Standard"
            };
          });
          setAppointments(mapped);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch appointments:", e);
    }
    
    // Fallback Mock Data
    const mockAppointments: Appointment[] = [
      {
        id: "#APT-9863",
        patient: "Nguyễn Văn An",
        phone: "+84 987 654 321",
        doctor: "BS. Lê Mạnh Hùng",
        room: "Phòng 102",
        date: "03/08/2026",
        time: "09:00–09:30",
        status: "Confirmed",
        type: "Standard"
      },
      {
        id: "#APT-8921",
        patient: "Phạm Minh Thư",
        phone: "+84 912 345 679",
        doctor: "BS. Nguyễn Thị Mai",
        room: "Phòng 204",
        date: "03/08/2026",
        time: "18:00–18:30",
        status: "Cancelled",
        type: "Tái khám"
      },
      {
        id: "#APT-7724",
        patient: "Lê Hoàng Nam",
        phone: "+84 934 567 890",
        doctor: "BS. Trần Quốc Tuấn",
        room: "Phòng 105",
        date: "03/08/2026",
        time: "10:00–10:30",
        status: "Chờ xác nhận",
        type: "Standard"
      },
      {
        id: "#APT-6152",
        patient: "Trần Thị Hương",
        phone: "+84 901 234 567",
        doctor: "BS. Phạm Thanh Hằng",
        room: "Phòng 301",
        date: "02/08/2026",
        time: "14:00–14:30",
        status: "No-show",
        type: "Standard"
      }
    ];
    setAppointments(mockAppointments);
    setLoading(false);
  };

  // Automated Scanning No-show
  const handleAutoScanNoShow = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/appointments/scan-no-show`, {
        method: "POST"
      });
      const result = await res.json();
      if (res.ok && result.success) {
        triggerSmsToast(
          "Hệ thống Quét tự động",
          "Đang tiến hành tự động quét lịch hẹn quá hạn và gửi SMS thông báo..."
        );
        fetchAppointments();
      } else {
        alert(result.message || "Quét lịch hẹn quá hạn thất bại.");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối đến máy chủ.");
    }
  };

  // Submit Cancel Appointment
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !cancelReason.trim()) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/appointments/${selectedAppointment.id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: cancelReason.trim(),
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        triggerSmsToast(
          "SMS Gateway — Đang xử lý",
          `Mô phỏng gửi SMS: Đã hủy lịch hẹn ${selectedAppointment.id} của bệnh nhân ${selectedAppointment.patient} thành công!`
        );
        setIsCancelModalOpen(false);
        setCancelReason("");
        fetchAppointments();
      } else {
        alert(result.message || "Hủy lịch hẹn thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối đến máy chủ.");
    }
  };

  const handleLogout = async () => {
    await logoutApiCall();
    router.push("/");
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
      
      if (!upperRoles.includes("STAFF")) {
        if (upperRoles.includes("ADMIN")) {
          router.push("/user-management/create-user");
        } else if (upperRoles.includes("DOCTOR")) {
          router.push("/doctor");
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
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;
    const initData = async () => {
      const loadedDocs = await fetchDoctors();
      fetchAppointments();
      fetchDoctorSchedules(loadedDocs);
    };
    initData();
  }, [checkingAuth]);

  if (checkingAuth || !user) {
    return (
      <div className="min-h-screen bg-[#0C1A2E] flex flex-col items-center justify-center gap-3">
        <svg className="animate-spin h-8 w-8 text-[#0EA5E9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-400 text-xs font-medium">Đang kiểm tra bảo mật phân hệ nhân viên...</p>
      </div>
    );
  }

  const rawRoles = user?.roles || (user?.role ? [user.role] : []);
  const userRoles = rawRoles.filter((r): r is string => !!r).map(r => r.toUpperCase());

  const sidebarItems = [
    { label: "Quản lý Lịch hẹn",     icon: Calendar,    id: "appointments"  },
    { label: "Phê duyệt Lịch Bác sĩ",icon: ClipboardList,   id: "schedules" },
    { label: "Báo cáo",              icon: FileText,    id: "reports" },
    { label: "Cấu hình",             icon: Settings,    id: "settings" },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-600 overflow-hidden font-sans antialiased select-none">
      
      {/* Sidebar Component */}
      <aside className="w-[240px] shrink-0 h-full bg-[#0C1A2E] flex flex-col justify-between py-6">
        <div className="space-y-6">
          <div className="px-6 flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <p className="text-white font-bold leading-none text-[13px] tracking-tight">HMS Nhân viên</p>
              <p className="text-[#0EA5E9] text-[10px] font-semibold mt-1 uppercase tracking-wider">Bảng điều khiển</p>
            </div>
          </div>

          <nav className="px-3 space-y-1">
            {sidebarItems.map((item) => {
              const active = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-xs font-semibold transition-all border-none bg-transparent cursor-pointer outline-none
                    ${active ? "bg-[#0EA5E9]/15 text-[#38BDF8] shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                >
                  <IconComp size={15} className={active ? "text-[#38BDF8]" : "text-slate-400"} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="px-6 border-t border-slate-800 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/15 border border-[#0EA5E9]/20 flex items-center justify-center font-bold text-[#38BDF8] text-xs">
              {getInitials(user?.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-300 truncate leading-none">{user?.fullName || "Staff"}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-1.5 truncate">{user?.phoneNumber || "N/A"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Dashboard body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="h-16 shrink-0 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-[#64748B]">Bảng làm việc</span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-[#0F172A]">
              {activeTab === "appointments"
                ? "Quản lý Lịch hẹn"
                : activeTab === "schedules"
                ? "Phê duyệt Lịch Bác sĩ"
                : activeTab === "reports"
                ? "Báo cáo"
                : "Cấu hình"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-400">{getVietnameseHeaderDate()}</span>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors cursor-pointer outline-none border-none bg-transparent">
                <Bell size={14} strokeWidth={1.75} />
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold" style={{ fontSize: 9 }}>3</span>
              </button>

              <div ref={profileRef} className="relative">
                <div
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-8 h-8 rounded-full bg-[#0EA5E9] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <span className="text-white text-[11px] font-bold">{getInitials(user?.fullName)}</span>
                </div>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-50 py-1.5 animate-[fadeIn_0.15s_ease-out] text-left">
                    <div className="px-4 py-2 border-b border-[#F1F5F9]">
                      <p className="text-[12px] font-semibold text-[#0F172A] truncate">{user?.fullName || "Trần Thị B"}</p>
                      <p className="text-[10px] text-[#64748B] truncate mt-0.5">{user?.phoneNumber || "0912345678"}</p>
                    </div>
                    
                    <div className="px-1.5 py-1.5 border-b border-[#F1F5F9]">
                      <button
                        onClick={() => router.push("/profile")}
                        className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none bg-transparent"
                      >
                        <User size={13} className="shrink-0 text-slate-400" />
                        <span>Hồ sơ cá nhân</span>
                      </button>
                    </div>
                    
                    {userRoles.length > 1 && (
                      <div className="px-1.5 py-1.5 border-b border-[#F1F5F9]">
                        <p className="px-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chuyển vai trò</p>
                        <div className="flex flex-col gap-0.5">
                          {userRoles.includes("ADMIN") && (
                            <button
                              onClick={() => router.push("/user-management/create-user")}
                              className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none bg-transparent"
                            >
                              <Shield size={13} className="shrink-0 text-slate-400" />
                              <span>Quản trị viên</span>
                            </button>
                          )}
                          {userRoles.includes("DOCTOR") && (
                            <button
                              onClick={() => router.push("/doctor")}
                              className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none bg-transparent"
                            >
                              <Stethoscope size={13} className="shrink-0 text-slate-400" />
                              <span>Bác sĩ</span>
                            </button>
                          )}
                          {userRoles.includes("STAFF") && (
                            <button
                              onClick={() => router.push("/staff")}
                              className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-[#0EA5E9] bg-sky-50/60 font-semibold cursor-pointer border-none outline-none"
                            >
                              <ClipboardList size={13} className="shrink-0 text-[#0EA5E9]" />
                              <span className="flex-1">Nhân viên y tế</span>
                              <Check size={11} className="text-[#0EA5E9] ml-auto" />
                            </button>
                          )}
                          {userRoles.includes("RESEARCHER") && (
                            <button
                              onClick={() => router.push("/researcher")}
                              className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none bg-transparent"
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
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-[12px] text-[#EF4444] hover:bg-[#FFF1F2] transition-colors cursor-pointer outline-none font-bold border-none bg-transparent"
                    >
                      <LogOut size={13} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Tabs */}
        <main className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          {loading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-2.5">
              <Loader2 className="animate-spin text-[#0EA5E9] h-8 w-8" />
              <p className="text-slate-400 text-xs font-semibold">Đang đồng bộ dữ liệu hệ thống...</p>
            </div>
          ) : (
            <>
              {activeTab === "appointments" && (
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
              )}

              {activeTab === "schedules" && (
                <ScheduleApprovals
                  schedules={schedules}
                  onRefresh={fetchDoctorSchedules}
                />
              )}

              {activeTab !== "appointments" && activeTab !== "schedules" && (
                <div className="min-h-[400px] bg-white border border-[#E2E8F0] rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-[#64748B]">
                    <ClipboardList size={24} className="text-slate-400" />
                  </div>
                  <h3 className="text-slate-800 font-bold text-sm">Chuyên mục đang phát triển</h3>
                  <p className="text-slate-400 text-xs mt-1.5 max-w-sm leading-relaxed">
                    Tính năng này đang được thiết lập. Hãy truy cập &quot;Quản lý Lịch hẹn&quot; hoặc &quot;Phê duyệt Lịch Bác sĩ&quot; để thao tác.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

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

    </div>
  );
}
