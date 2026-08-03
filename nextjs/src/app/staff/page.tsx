"use client";

import React, { useEffect, useState, useRef } from "react";
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
  FlaskConical
} from "lucide-react";

import { fetchWithAuth, logoutApiCall } from "@/lib/auth";

// ─── Data Types ───────────────────────────────────────────────────────────────

type Status = "Confirmed" | "Cancelled" | "No-show" | "Completed" | "Chờ xác nhận";

interface Appointment {
  id: string;
  patient: string;
  phone: string;
  doctor: string;
  room: string;
  date: string;
  time: string;
  status: Status;
  type: string;
}

interface DoctorSchedule {
  id: string;
  doctorName: string;
  workDate: string;
  shift: string;
  roomName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

const statusMap: Record<Status, { bg: string; text: string }> = {
  Confirmed:     { bg: "bg-sky-50",     text: "text-sky-600" },
  Cancelled:     { bg: "bg-rose-50",    text: "text-rose-600" },
  "No-show":     { bg: "bg-slate-100",  text: "text-slate-500" }, // standard grey badge
  "Chờ xác nhận": { bg: "bg-amber-50",   text: "text-amber-600" },
  Completed:     { bg: "bg-emerald-50", text: "text-emerald-600" },
};

export default function StaffDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("appointments");
  const [user, setUser] = useState<{ fullName?: string; phoneNumber?: string; roles?: string[]; role?: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Profile Menu States & Ref
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const getInitials = (name?: string) => {
    if (!name) return "TB";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "TB";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Core Data States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals Visibility
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isRescheduleDrawerOpen, setIsRescheduleDrawerOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRejectScheduleModalOpen, setIsRejectScheduleModalOpen] = useState(false);

  // Selected Item for Actions
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  // Input states for forms
  const [formPatientName, setFormPatientName] = useState("");
  const [formPatientPhone, setFormPatientPhone] = useState("");
  const [formDoctor, setFormDoctor] = useState("");
  const [formDate, setFormDate] = useState("2026-08-03");
  const [formTimeSlot, setFormTimeSlot] = useState("08:00–08:30");
  const [formReason, setFormReason] = useState("");
  const [formDeposit, setFormDeposit] = useState(false);
  const [formFollowUp, setFormFollowUp] = useState(false);
  const [formOriginRecordId, setFormOriginRecordId] = useState("");

  const [rescheduleSlotId, setRescheduleSlotId] = useState("08:00–08:30");
  const [rescheduleDoctor, setRescheduleDoctor] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("2026-08-03");
  const [rescheduleReason, setRescheduleReason] = useState("");

  const [cancelReason, setCancelReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // Toast status for SMS simulation
  const [smsToast, setSmsToast] = useState<{
    visible: boolean;
    title: string;
    message: string;
    progress: number;
  }>({
    visible: true, // Default active on load matching mockup
    title: "SMS Gateway — Đang xử lý",
    message: "Mô phỏng SMS Gateway: Đang gửi tin nhắn tiếng Việt bất đồng bộ...",
    progress: 65
  });

  const toastInterval = useRef<NodeJS.Timeout | null>(null);

  // Time Slots details
  const timeSlots = [
    "08:00–08:30", "08:30–09:00", "09:00–09:30", "09:30–10:00",
    "10:00–10:30", "10:30–11:00", "13:00–13:30", "13:30–14:00",
    "14:00–14:30", "14:30–15:00", "15:00–15:30", "16:00–16:30",
  ];
  const unavailableSlots = ["09:00–09:30", "14:00–14:30"];

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

    let currentProgress = 0;
    toastInterval.current = setInterval(() => {
      currentProgress += 1;
      setSmsToast((prev) => ({
        ...prev,
        progress: Math.min(currentProgress * 2, 100)
      }));

      if (currentProgress >= 50) {
        if (toastInterval.current) {
          clearInterval(toastInterval.current);
        }
        setTimeout(() => {
          setSmsToast((prev) => ({ ...prev, visible: false }));
        }, 1500);
      }
    }, 60);
  };

  // Auth Guard & Dropdown Click Outside
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

  // Load Data
  useEffect(() => {
    if (checkingAuth) return;
    fetchAppointments();
    fetchDoctorSchedules();
  }, [checkingAuth]);

  // Fetch Appointments
  const fetchAppointments = async () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/appointments`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const mapped: Appointment[] = result.data.map((item: any) => {
            let apiStatus: Status = "Confirmed";
            if (item.status === "CANCELLED") apiStatus = "Cancelled";
            else if (item.status === "NO_SHOW") apiStatus = "No-show";
            else if (item.status === "PENDING_STAFF_CONFIRMATION") apiStatus = "Chờ xác nhận";
            else if (item.status === "COMPLETED") apiStatus = "Completed";

            return {
              id: item.id ? (item.id.startsWith("#") ? item.id : `#${item.id}`) : `#APT-${Math.floor(1000 + Math.random() * 9000)}`,
              patient: item.patient?.fullName || "Bệnh nhân ẩn danh",
              phone: item.patient?.phoneNumber || "N/A",
              doctor: item.doctor?.fullName || "BS. Bệnh Viện",
              room: item.room?.name || "Phòng khám",
              date: item.doctorWorkSlot?.workDate || "03/08/2026",
              time: item.slot ? `${item.slot.startTime?.slice(0, 5)} – ${item.slot.endTime?.slice(0, 5)}` : "09:00 – 09:30",
              status: apiStatus,
              type: item.diagnosis ? "Tái khám" : "Standard"
            };
          });
          setAppointments(mapped);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch appointments from backend, loading mock fallback.", err);
    }

    // Default design mock fallback
    const mockAppointments: Appointment[] = [
      {
        id: "#APT-9863",
        patient: "Nguyễn Văn An",
        phone: "+84 987 654 321",
        doctor: "BS. Lê Mạnh Hùng",
        room: "Phòng 102",
        date: "03/08/2026",
        time: "09:00 – 09:30",
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
        time: "18:00 – 18:30",
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
        time: "10:00 – 10:30",
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
        time: "14:00 – 14:30",
        status: "No-show",
        type: "Standard"
      }
    ];
    setAppointments(mockAppointments);
    setLoading(false);
  };

  // Fetch Doctor Schedules
  const fetchDoctorSchedules = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-schedules`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const mapped: DoctorSchedule[] = result.data.map((item: any) => ({
            id: item.id || `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
            doctorName: item.doctorName || "BS. Bác Sĩ",
            workDate: item.workDate || "04/08/2026",
            shift: item.note || "Ca Sáng (08:00 - 12:00)",
            roomName: item.roomId || "Phòng 102",
            status: item.status || "PENDING"
          }));
          setSchedules(mapped);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch schedules from backend, loading mock fallback.", err);
    }

    const mockSchedules: DoctorSchedule[] = [
      {
        id: "SUB-101",
        doctorName: "BS. Lê Mạnh Hùng",
        workDate: "04/08/2026",
        shift: "Sáng (08:00 - 12:00)",
        roomName: "Phòng 102",
        status: "PENDING"
      },
      {
        id: "SUB-102",
        doctorName: "BS. Nguyễn Thị Mai",
        workDate: "05/08/2026",
        shift: "Chiều (13:30 - 17:30)",
        roomName: "Phòng 204",
        status: "PENDING"
      },
      {
        id: "SUB-103",
        doctorName: "BS. Trần Quốc Tuấn",
        workDate: "04/08/2026",
        shift: "Sáng (08:00 - 12:00)",
        roomName: "Phòng 105",
        status: "APPROVED"
      },
      {
        id: "SUB-104",
        doctorName: "BS. Phạm Thanh Hằng",
        workDate: "04/08/2026",
        shift: "Chiều (13:30 - 17:30)",
        roomName: "Phòng 301",
        status: "REJECTED",
        rejectionReason: "Trùng lịch đăng ký phòng với bác sĩ khác."
      }
    ];
    setSchedules(mockSchedules);
  };

  // Submit Add Appointment
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientName || !formPatientPhone || !formDoctor) return;

    // extract doctor and room
    const doctorPart = formDoctor.split(" (")[0];
    const roomPart = formDoctor.includes(" (") ? formDoctor.split(" (")[1].replace(")", "") : "Phòng khám";

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    const newAppointmentObj: Appointment = {
      id: `#APT-${Math.floor(1000 + Math.random() * 9000)}`,
      patient: formPatientName,
      phone: formPatientPhone,
      doctor: doctorPart,
      room: roomPart,
      date: formDate.split("-").reverse().join("/"),
      time: formTimeSlot,
      status: "Confirmed",
      type: formFollowUp ? "Tái khám" : "Standard"
    };

    try {
      await fetchWithAuth(`${apiUrl}/api/staff/scheduling/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          patientId: "new-patient",
          doctorWorkSlotId: "new-slot"
        })
      });
    } catch (err) {
      console.warn(err);
    }

    setAppointments((prev) => [newAppointmentObj, ...prev]);
    setIsAddDrawerOpen(false);

    // reset fields
    setFormPatientName("");
    setFormPatientPhone("");
    setFormDoctor("");
    setFormReason("");
    setFormDeposit(false);
    setFormFollowUp(false);
    setFormOriginRecordId("");

    triggerSmsToast(
      "SMS Gateway — Đang xử lý",
      `Gửi tin nhắn thông báo đặt lịch mới đến bệnh nhân ${formPatientName} (${formPatientPhone})...`
    );
  };

  // Submit Reschedule Appointment
  const handleRescheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointmentId || !rescheduleDoctor || !rescheduleReason) return;

    const appointmentToModify = appointments.find((a) => a.id === selectedAppointmentId);
    if (!appointmentToModify) return;

    const doctorPart = rescheduleDoctor.split(" (")[0];
    const roomPart = rescheduleDoctor.includes(" (") ? rescheduleDoctor.split(" (")[1].replace(")", "") : "Phòng khám";

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    try {
      await fetchWithAuth(`${apiUrl}/api/staff/scheduling/appointments/${selectedAppointmentId.replace("#", "")}/reschedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          doctorWorkSlotId: rescheduleSlotId,
          reason: rescheduleReason
        })
      });
    } catch (err) {
      console.warn(err);
    }

    setAppointments((prev) =>
      prev.map((app) =>
        app.id === selectedAppointmentId
          ? {
              ...app,
              doctor: doctorPart,
              room: roomPart,
              date: rescheduleDate.split("-").reverse().join("/"),
              time: rescheduleSlotId,
              status: "Confirmed"
            }
          : app
      )
    );

    setIsRescheduleDrawerOpen(false);
    setRescheduleReason("");
    setRescheduleDoctor("");

    triggerSmsToast(
      "SMS Gateway — Đang xử lý",
      `Gửi tin nhắn thay đổi lịch hẹn đến bệnh nhân ${appointmentToModify.patient} (${appointmentToModify.phone})...`
    );
  };

  // Submit Cancel Appointment
  const handleCancelAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointmentId || !cancelReason.trim()) return;

    const appointmentToModify = appointments.find((a) => a.id === selectedAppointmentId);
    if (!appointmentToModify) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    try {
      await fetchWithAuth(`${apiUrl}/api/staff/scheduling/appointments/${selectedAppointmentId.replace("#", "")}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cancellationReason: cancelReason
        })
      });
    } catch (err) {
      console.warn(err);
    }

    setAppointments((prev) =>
      prev.map((app) =>
        app.id === selectedAppointmentId
          ? {
              ...app,
              status: "Cancelled"
            }
          : app
      )
    );

    setIsCancelModalOpen(false);
    setCancelReason("");

    triggerSmsToast(
      "SMS Gateway — Đang xử lý",
      `Gửi tin nhắn thông báo hủy lịch khám đến bệnh nhân ${appointmentToModify.patient} (${appointmentToModify.phone})...`
    );
  };

  // Doctor Schedule Approvals
  const handleApproveSchedule = async (id: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const targetSchedule = schedules.find((s) => s.id === id);
    if (!targetSchedule) return;

    try {
      await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-schedules/${id}/decision`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "APPROVED",
          rejectionReason: ""
        })
      });
    } catch (err) {
      console.warn(err);
    }

    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "APPROVED" } : s))
    );

    triggerSmsToast(
      "SMS Gateway — Đang xử lý",
      `Gửi tin nhắn SMS xác nhận lịch làm việc đến Bác sĩ ${targetSchedule.doctorName}...`
    );
  };

  const handleOpenRejectSchedule = (id: string) => {
    setSelectedScheduleId(id);
    setIsRejectScheduleModalOpen(true);
  };

  const handleRejectSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId || !rejectReason) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const targetSchedule = schedules.find((s) => s.id === selectedScheduleId);
    if (!targetSchedule) return;

    try {
      await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-schedules/${selectedScheduleId}/decision`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "REJECTED",
          rejectionReason: rejectReason
        })
      });
    } catch (err) {
      console.warn(err);
    }

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === selectedScheduleId
          ? { ...s, status: "REJECTED", rejectionReason: rejectReason }
          : s
      )
    );

    setIsRejectScheduleModalOpen(false);
    setRejectReason("");

    triggerSmsToast(
      "SMS Gateway — Đang xử lý",
      `Gửi tin nhắn từ chối duyệt lịch làm việc đến Bác sĩ ${targetSchedule.doctorName}...`
    );
  };



  // Logout Handler
  const handleLogout = async () => {
    await logoutApiCall();
    router.push("/");
  };

  // Filter Logic
  const filteredAppointments = appointments.filter((app) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      app.id.toLowerCase().includes(q) ||
      app.patient.toLowerCase().includes(q) ||
      app.phone.includes(q);

    const matchesDoctor = doctorFilter === "" || app.doctor === doctorFilter;
    const matchesStatus = statusFilter === "" || app.status === statusFilter;

    return matchesSearch && matchesDoctor && matchesStatus;
  });

  const uniqueDoctors = Array.from(new Set(appointments.map((a) => a.doctor)));
  const rawRoles = user?.roles || (user?.role ? [user.role] : []);
  const userRoles = rawRoles.filter((r): r is string => !!r).map(r => r.toUpperCase());

  if (checkingAuth) {
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

  // Sidebar components listing
  const sidebarItems = [
    { label: "Bảng điều khiển",      icon: LayoutDashboard,   id: "dashboard" },
    { label: "Tiếp đón & Lâm sinh",  icon: Stethoscope, id: "intake" },
    { label: "Quản lý Lịch hẹn",     icon: Calendar,    id: "appointments"  },
    { label: "Phê duyệt Lịch Bác sĩ",icon: ClipboardList,   id: "schedules" },
    { label: "Báo cáo",              icon: FileText,    id: "reports" },
    { label: "Cấu hình",             icon: Settings,    id: "settings" },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-600 overflow-hidden font-sans antialiased select-none">
      
      {/* ════════════════ LEFT SIDEBAR ════════════════ */}
      <aside
        className="flex flex-col shrink-0 h-full text-white"
        style={{ width: 220, background: "#0C1A2E" }}
      >
        {/* Logo Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
          <div className="w-8 h-8 rounded-lg bg-[#0EA5E9] flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: "0 0 16px rgba(14,165,233,0.4)" }}>
            <div className="relative w-3.5 h-3.5 flex items-center justify-center">
              <div className="absolute w-3.5 h-[4px] bg-white rounded-sm" />
              <div className="absolute w-[4px] h-3.5 bg-white rounded-sm" />
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-[13px] leading-none tracking-wide">HMS</p>
            <p className="text-[#475569] text-[10px] mt-0.5 tracking-wide">Staff Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {sidebarItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer w-full outline-none"
                style={isActive
                  ? { background: "rgba(14,165,233,0.15)", color: "#38BDF8" }
                  : { color: "#64748B" }
                }
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#94A3B8"; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; } }}
              >
                <Icon size={16} className="shrink-0" />
                <span className={`text-xs ${isActive ? "font-semibold" : ""} truncate`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Profile Card Footer */}
        <div className="border-t border-white/8 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/20 border border-[#0EA5E9]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-[#38BDF8]">{getInitials(user?.fullName)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-[#CBD5E1] truncate">{user?.fullName || "Trần Thị B"}</p>
              <p className="text-[10px] text-[#475569] truncate">{user?.phoneNumber || "0912345678"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ════════════════ MAIN CONTENT AREA ════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header Navigation */}
        <header className="shrink-0 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between" style={{ height: 56 }}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs">
            <span style={{ color: "#64748B" }}>Nhân viên y tế</span>
            <ChevronRight size={12} strokeWidth={2} className="text-slate-300" />
            <span className="font-semibold" style={{ color: "#0F172A" }}>
              {activeTab === "appointments"
                ? "Quản lý lịch hẹn"
                : activeTab === "schedules"
                ? "Phê duyệt Lịch Bác sĩ"
                : activeTab === "dashboard"
                ? "Bảng điều khiển"
                : activeTab === "intake"
                ? "Tiếp đón & Lâm sinh"
                : activeTab === "reports"
                ? "Báo cáo"
                : "Cấu hình"}
            </span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={13} strokeWidth={2} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                className="h-8 pl-8 pr-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all"
                style={{ width: 180, background: "#F8FAFC" }}
                placeholder="Tìm kiếm..."
              />
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors cursor-pointer outline-none">
              <Bell size={14} strokeWidth={1.75} />
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold" style={{ fontSize: 9 }}>3</span>
            </button>

            {/* Avatar circle with Dropdown */}
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
                            className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border-none outline-none"
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
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-[12px] text-[#EF4444] hover:bg-[#FFF1F2] transition-colors cursor-pointer outline-none font-bold"
                  >
                    <LogOut size={13} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Tabs */}
        <main className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          {activeTab === "appointments" && (
            <>
              {/* Title row */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-[#0F172A]">Quản lý Lịch hẹn</h1>
                  <p className="text-xs text-[#64748B] mt-1">UC-03 / UC-35 — Thứ Hai, 03/08/2026</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Online pill */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold" style={{ background: "#F0F9FF", borderColor: "#BAE6FD", color: "#0369A1" }}>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Hệ thống Trực tuyến
                  </div>
                  <button
                    onClick={() => setIsAddDrawerOpen(true)}
                    className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm cursor-pointer outline-none active:scale-[0.98]"
                    style={{ background: "#0EA5E9", boxShadow: "0 1px 4px rgba(14,165,233,0.3)" }}
                  >
                    <Plus size={14} strokeWidth={2} className="text-white" />
                    Thêm lịch hẹn mới
                  </button>
                </div>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-4 gap-5">
                <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar size={18} strokeWidth={1.75} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0F172A]">42</p>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-snug">Tổng lịch hẹn hôm nay</p>
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center shrink-0">
                    <Check size={18} strokeWidth={2} className="text-sky-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0EA5E9]">28</p>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-snug">Đã xác nhận</p>
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                    <XCircle size={18} strokeWidth={1.75} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#EF4444]">4</p>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-snug">Đã hủy</p>
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={18} strokeWidth={1.75} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#F59E0B]">10</p>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-snug">Quá hạn (No-show)</p>
                  </div>
                </div>
              </div>

              {/* Table controls & filter section */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-3 flex-wrap">
                  <div className="relative" style={{ minWidth: 220, flex: 1 }}>
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all bg-white"
                      placeholder="Tìm bệnh nhân, SĐT, mã..."
                    />
                  </div>
                  <div className="relative">
                    <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)} className="h-9 pl-3 pr-8 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 text-[#64748B] bg-white appearance-none cursor-pointer">
                      <option value="">Tất cả Bác sĩ</option>
                      {uniqueDoctors.map(doc => (
                        <option key={doc} value={doc}>{doc}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 pl-3 pr-8 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 text-[#64748B] bg-white appearance-none cursor-pointer">
                      <option value="">Tất cả Trạng thái</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Chờ xác nhận">Chờ xác nhận</option>
                      <option value="No-show">No-show</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                        {["Mã lịch hẹn", "Bệnh nhân", "Bác sĩ & Phòng", "Ngày & Giờ", "Trạng thái", "Loại", "Thao tác"].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9] font-medium">
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">Không tìm thấy lịch hẹn phù hợp.</td>
                        </tr>
                      ) : filteredAppointments.map(a => {
                        const isCancelled = a.status === "Cancelled" || a.status === "No-show";
                        return (
                          <tr key={a.id} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className="mono text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">{a.id}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <p className="font-semibold text-[#0F172A]">{a.patient}</p>
                              <p className="text-xs text-[#64748B] mono mt-0.5">{a.phone}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <p className="text-[#0F172A]">{a.doctor}</p>
                              <p className="text-xs text-[#64748B] mt-0.5">{a.room}</p>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <p className="text-[#0F172A] text-xs">{a.date}</p>
                              <p className="text-xs text-[#64748B] mono mt-0.5">{a.time}</p>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <StatusBadge status={a.status} />
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {a.type === "Tái khám"
                                ? <span className="text-xs font-medium border border-sky-200 text-sky-600 px-2 py-0.5 rounded-full">{a.type}</span>
                                : <span className="text-xs text-[#64748B]">{a.type}</span>}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  disabled={isCancelled}
                                  onClick={() => {
                                    setSelectedAppointmentId(a.id);
                                    setRescheduleDoctor(`${a.doctor} (${a.room})`);
                                    setRescheduleDate(a.date.split("/").reverse().join("-"));
                                    setRescheduleSlotId(a.time.replace(" – ", "–"));
                                    setIsRescheduleDrawerOpen(true);
                                  }}
                                  className={`h-7 px-3 text-xs font-bold rounded-lg border transition-all outline-none
                                    ${isCancelled ? "border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed" : "border-sky-200 text-sky-600 hover:bg-sky-50 hover:border-sky-300 cursor-pointer"}`}
                                >
                                  Dời lịch
                                </button>
                                {!isCancelled && (
                                  <button
                                    onClick={() => {
                                      setSelectedAppointmentId(a.id);
                                      setIsCancelModalOpen(true);
                                    }}
                                    className="h-7 px-3 text-xs font-bold rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer outline-none"
                                  >
                                    Hủy
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "schedules" && (
            <div className="flex flex-col gap-5">
              {/* Title Section */}
              <div>
                <h1 className="text-xl font-bold text-[#0F172A]">Phê duyệt Lịch làm việc</h1>
                <p className="text-xs text-[#64748B] mt-1">
                  Xem và duyệt đăng ký trực của các Bác sĩ khoa phòng
                </p>
              </div>

              {/* Table card */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-3.5">Bác sĩ</th>
                      <th className="px-6 py-3.5">Ngày đăng ký</th>
                      <th className="px-6 py-3.5">Ca làm việc</th>
                      <th className="px-6 py-3.5">Phòng khám</th>
                      <th className="px-6 py-3.5">Trạng thái</th>
                      <th className="px-6 py-3.5 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] font-medium text-slate-700">
                    {schedules.map((sch) => (
                      <tr key={sch.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{sch.doctorName}</td>
                        <td className="px-6 py-4">{sch.workDate}</td>
                        <td className="px-6 py-4">{sch.shift}</td>
                        <td className="px-6 py-4">{sch.roomName}</td>
                        <td className="px-6 py-4">
                          {sch.status === "PENDING" && (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-200">
                              Chờ duyệt
                            </span>
                          )}
                          {sch.status === "APPROVED" && (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200">
                              Đã duyệt
                            </span>
                          )}
                          {sch.status === "REJECTED" && (
                            <div>
                              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-200">
                                Bị từ chối
                              </span>
                              {sch.rejectionReason && (
                                <p className="text-[10px] text-rose-500 mt-1 italic font-normal">
                                  Lý do: {sch.rejectionReason}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {sch.status === "PENDING" ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleApproveSchedule(sch.id)}
                                className="h-7 px-3 bg-[#0EA5E9] text-white rounded-md text-[11px] font-bold hover:bg-[#0284C7] active:scale-[0.98] transition-all outline-none"
                              >
                                Phê duyệt
                              </button>
                              <button
                                onClick={() => handleOpenRejectSchedule(sch.id)}
                                className="h-7 px-3 border border-red-200 text-red-500 rounded-md text-[11px] font-bold hover:bg-red-50 active:scale-[0.98] transition-all outline-none"
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
        </main>
      </div>

      {/* ════════════════ SMS LOG BANNER (Toast) ════════════════ */}
      {smsToast.visible && (
        <div className="fixed bottom-5 right-5 z-40 rounded-xl shadow-2xl overflow-hidden flex items-stretch max-w-xs" style={{ background: "#0F172A" }}>
          <div className="w-1 shrink-0" style={{ background: "#0EA5E9" }} />
          <div className="px-4 py-3 flex items-start gap-3 flex-1">
            <MessageSquare size={16} className="text-sky-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-sky-400 mb-0.5">{smsToast.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>{smsToast.message}</p>
              <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "#1E293B" }}>
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-300"
                  style={{ width: `${smsToast.progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => setSmsToast((prev) => ({ ...prev, visible: false }))}
              className="text-slate-600 hover:text-white transition-colors shrink-0 cursor-pointer mt-0.5"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════ DRAWER: ADD APPOINTMENT (Right Slide) ════════════════ */}
      {isAddDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsAddDrawerOpen(false)}
          />
          {/* Drawer container */}
          <div className="relative z-10 flex flex-col bg-white shadow-2xl overflow-hidden h-full animate-[slideInRight_0.2s_ease-out]" style={{ width: 420 }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div className="text-left">
                <h2 className="text-sm font-semibold text-[#0F172A]">Thêm lịch hẹn mới</h2>
                <p className="text-xs text-[#64748B] mt-0.5">Điền thông tin để tạo lịch hẹn</p>
              </div>
              <button
                onClick={() => setIsAddDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors cursor-pointer outline-none"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleAddAppointment} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-left">
              {/* Patient Name */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Họ và tên bệnh nhân <span className="text-rose-500">*</span>
                </label>
                <input
                  value={formPatientName}
                  required
                  onChange={(e) => setFormPatientName(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all bg-white"
                  placeholder="VD: Nguyễn Văn An"
                />
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  value={formPatientPhone}
                  required
                  onChange={(e) => setFormPatientPhone(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all bg-white"
                  placeholder="+84 9xx xxx xxx"
                />
              </div>

              {/* Doctor select */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Bác sĩ phụ trách <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formDoctor}
                    required
                    onChange={(e) => setFormDoctor(e.target.value)}
                    className="w-full h-9 pl-3 pr-8 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Chọn bác sĩ...</option>
                    <option value="BS. Lê Mạnh Hùng (Phòng 102)">BS. Lê Mạnh Hùng (Phòng 102)</option>
                    <option value="BS. Nguyễn Thị Mai (Phòng 204)">BS. Nguyễn Thị Mai (Phòng 204)</option>
                    <option value="BS. Trần Quốc Tuấn (Phòng 105)">BS. Trần Quốc Tuấn (Phòng 105)</option>
                    <option value="BS. Phạm Thanh Hằng (Phòng 301)">BS. Phạm Thanh Hằng (Phòng 301)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Work Date */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Ngày hẹn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formDate}
                  required
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white"
                />
              </div>

              {/* Time Slots Grid */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-2">Chọn khung giờ hẹn</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {timeSlots.map((slot) => {
                    const isUnavail = unavailableSlots.includes(slot);
                    const isActive = formTimeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isUnavail}
                        onClick={() => setFormTimeSlot(slot)}
                        className={`py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer outline-none
                          ${isUnavail ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed" :
                            isActive ? "bg-sky-500 border-sky-500 text-white shadow-sm font-semibold" :
                                      "bg-white border-[#E2E8F0] text-[#0F172A] hover:border-sky-300 hover:bg-sky-50"}`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Lý do khám bệnh</label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full h-20 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 resize-none transition-all bg-white"
                  placeholder="Mô tả triệu chứng hoặc lý do khám..."
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-1">
                
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formFollowUp}
                    onChange={(e) => setFormFollowUp(e.target.checked)}
                    className="w-4 h-4 accent-sky-500 cursor-pointer"
                  />
                  <span className="text-sm text-[#0F172A] font-medium">Lịch tái khám</span>
                </label>
                {formFollowUp && (
                  <div className="ml-6 animate-[fadeIn_0.15s_ease-out] text-left">
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Mã bệnh án gốc <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={formOriginRecordId}
                      required
                      onChange={(e) => setFormOriginRecordId(e.target.value)}
                      className="mono w-full h-9 px-3 text-sm border border-sky-200 bg-sky-50 rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 transition-all"
                      placeholder="VD: MR-2026-0034"
                    />
                  </div>
                )}
              </div>

              {/* Submit footer buttons */}
              <div className="flex gap-3 pt-6 pb-2">
                <button
                  type="button"
                  onClick={() => setIsAddDrawerOpen(false)}
                  className="flex-1 h-9 text-xs font-semibold border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer outline-none"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 text-xs font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors cursor-pointer outline-none"
                >
                  Lưu lịch hẹn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ DRAWER: RESCHEDULE APPOINTMENT (Right Slide) ════════════════ */}
      {isRescheduleDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsRescheduleDrawerOpen(false)}
          />
          {/* Drawer container */}
          <div className="relative z-10 flex flex-col bg-white shadow-2xl overflow-hidden h-full animate-[slideInRight_0.2s_ease-out]" style={{ width: 420 }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div className="text-left">
                <h2 className="text-sm font-semibold text-[#0F172A]">Dời lịch hẹn {selectedAppointmentId}</h2>
                <p className="text-xs text-[#64748B] mt-0.5">Chọn lịch khám thay thế cho bệnh nhân</p>
              </div>
              <button
                onClick={() => setIsRescheduleDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors cursor-pointer outline-none"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleRescheduleAppointment} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-left">
              {/* Doctor select */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Chọn Bác sĩ & Phòng khám <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={rescheduleDoctor}
                    required
                    onChange={(e) => setRescheduleDoctor(e.target.value)}
                    className="w-full h-9 pl-3 pr-8 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Chọn bác sĩ...</option>
                    <option value="BS. Lê Mạnh Hùng (Phòng 102)">BS. Lê Mạnh Hùng (Phòng 102)</option>
                    <option value="BS. Nguyễn Thị Mai (Phòng 204)">BS. Nguyễn Thị Mai (Phòng 204)</option>
                    <option value="BS. Trần Quốc Tuấn (Phòng 105)">BS. Trần Quốc Tuấn (Phòng 105)</option>
                    <option value="BS. Phạm Thanh Hằng (Phòng 301)">BS. Phạm Thanh Hằng (Phòng 301)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Work Date */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Ngày dời sang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  required
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white"
                />
              </div>

              {/* Time Slots Grid */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-2">Chọn khung giờ mới</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {timeSlots.map((slot) => {
                    const isUnavail = unavailableSlots.includes(slot);
                    const isActive = rescheduleSlotId === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isUnavail}
                        onClick={() => setRescheduleSlotId(slot)}
                        className={`py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer outline-none
                          ${isUnavail ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed" :
                            isActive ? "bg-sky-500 border-sky-500 text-white shadow-sm font-semibold" :
                                      "bg-white border-[#E2E8F0] text-[#0F172A] hover:border-sky-300 hover:bg-sky-50"}`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Lý do dời lịch <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rescheduleReason}
                  required
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full h-24 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 resize-none transition-all bg-white"
                  placeholder="Nhập lý do dời lịch khám bệnh..."
                />
              </div>

              {/* Submit footer buttons */}
              <div className="flex gap-3 pt-6 pb-2">
                <button
                  type="button"
                  onClick={() => setIsRescheduleDrawerOpen(false)}
                  className="flex-1 h-9 text-xs font-semibold border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer outline-none"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 text-xs font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors cursor-pointer outline-none"
                >
                  Xác nhận dời lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: CANCEL APPOINTMENT ════════════════ */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsCancelModalOpen(false)}
          />
          {/* Modal box */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-left animate-[scaleIn_0.15s_ease-out]">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-xl shrink-0">
                <XCircle size={18} className="text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#0F172A]">Xác nhận Hủy lịch hẹn</h2>
                <p className="text-sm text-[#64748B] mt-0.5">
                  <span className="mono font-semibold text-[#0F172A]">{selectedAppointmentId}</span> — Hành động này không thể hoàn tác
                </p>
              </div>
            </div>

            <form onSubmit={handleCancelAppointment}>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Lý do hủy lịch hẹn (Bắt buộc) <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                required
                onChange={e => setCancelReason(e.target.value)}
                className="w-full h-24 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 resize-none transition-all bg-white"
                placeholder="Nhập lý do hủy lịch hẹn..."
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="flex-1 h-9 text-xs font-semibold border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer outline-none"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 text-xs font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors cursor-pointer outline-none"
                >
                  Xác nhận Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: REJECT WORK SCHEDULE ════════════════ */}
      {isRejectScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsRejectScheduleModalOpen(false)}
          />
          {/* Modal box */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-left animate-[scaleIn_0.15s_ease-out]">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-xl shrink-0">
                <XCircle size={18} className="text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#0F172A]">Từ chối lịch làm việc Bác sĩ</h2>
                <p className="text-sm text-[#64748B] mt-0.5">
                  Mã đăng ký: <span className="mono font-semibold text-[#0F172A]">{selectedScheduleId}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleRejectSchedule}>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Lý do từ chối (Bắt buộc) <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                required
                onChange={e => setRejectReason(e.target.value)}
                className="w-full h-24 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 resize-none transition-all bg-white"
                placeholder="Nhập lý do từ chối lịch..."
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsRejectScheduleModalOpen(false)}
                  className="flex-1 h-9 text-xs font-semibold border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer outline-none"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 text-xs font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors cursor-pointer outline-none"
                >
                  Từ chối lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── StatusBadge Helper Component ──────────────────────────────────────────────

function StatusBadge({ status }: { status: Status }) {
  const s = statusMap[status] || { bg: "bg-slate-100", text: "text-slate-500" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {status}
    </span>
  );
}
