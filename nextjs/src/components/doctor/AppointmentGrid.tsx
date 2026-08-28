import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Search, 
  Calendar,
  Stethoscope,
  ChevronRight,
  Loader2
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

type Status = "inprogress" | "waiting" | "completed" | "absent";

interface Appointment {
  id: string;
  stt: string;
  time: string;
  aptId: string;
  patient: string;
  meta: string;
  symptom: string;
  room: string;
  status: Status;
}

interface AppointmentGridProps {
  onStartExam: (appointmentId: string) => void;
  onBackToSchedule: () => void;
}

const STATUS_CONFIG: Record<Status, {
  label: string; bg: string; text: string;
  actionLabel?: string; actionStyle?: "primary" | "outline"
}> = {
  inprogress: { label: "Đang khám",      bg: "rgba(245,158,11,0.10)", text: "#B45309", actionLabel: "Tiếp tục khám",  actionStyle: "primary"  },
  waiting:    { label: "Chờ khám",       bg: "rgba(59,130,246,0.10)",  text: "#1D4ED8", actionLabel: "Bắt đầu khám",  actionStyle: "primary"  },
  completed:  { label: "Đã hoàn thành",  bg: "rgba(16,185,129,0.10)", text: "#15803D", actionLabel: "Xem bệnh án",   actionStyle: "outline"  },
  absent:     { label: "Vắng mặt",       bg: "rgba(148,163,184,0.10)", text: "#475569" },
};

const COL_HEADERS = ["STT", "Giờ hẹn", "Bệnh nhân", "Triệu chứng ban đầu", "Phòng khám", "Trạng thái", "Hành động"];
const COL_WIDTHS  = [60, 130, 200, 260, 110, 140, 160];

const getTodayDateString = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
};

const formatDobDisplay = (dateStr: string) => {
  if (!dateStr) return "";
  const [yyyy, mm, dd] = dateStr.split("-");
  if (!yyyy || !mm || !dd) return dateStr;
  return `${dd}/${mm}/${yyyy}`;
};

export default function AppointmentGrid({ onStartExam, onBackToSchedule }: AppointmentGridProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  const calculateAge = (dobString?: string) => {
    if (!dobString || dobString === "N/A") return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const mapStatus = (status: string): Status => {
    switch (status) {
      case "IN_PROGRESS":
        return "inprogress";
      case "COMPLETED":
        return "completed";
      case "CANCELLED":
      case "NO_SHOW":
        return "absent";
      case "PENDING":
      case "CONFIRMED":
      default:
        return "waiting";
    }
  };

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/appointments`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data && result.data.length > 0) {
          const selectedAppointments = result.data.filter((item: any) => {
            const itemDate = item.doctorWorkSlot?.workDate;
            const isSelectedDay = itemDate === selectedDate;
            const isInProgress = item.status === "IN_PROGRESS";
            return isSelectedDay || isInProgress;
          });

          const mapped = selectedAppointments.map((item: any, idx: number) => {
            const start = item.slot?.startTime?.slice(0, 5) || "";
            const end = item.slot?.endTime?.slice(0, 5) || "";
            const age = calculateAge(item.patient?.dateOfBirth);
            const genderStr = (item.patient?.gender || "").toUpperCase();
            const gender = genderStr === "MALE" ? "Nam" : genderStr === "FEMALE" ? "Nữ" : "";
            const ageStr = age ? `${age} tuổi` : "";
            const meta = [ageStr, gender].filter(Boolean).join(" · ");
            return {
              id: item.id,
              stt: String(idx + 1).padStart(2, "0"),
              time: start && end ? `${start} – ${end}` : "Chưa xếp",
              aptId: item.id.substring(0, 8).toUpperCase(),
              patient: item.patient?.fullName || "Chưa rõ",
              meta: meta,
              symptom: item.medicalRecord?.note || "Khám lâm sàng định kỳ",
              room: item.room?.name || "Chưa nhận",
              status: mapStatus(item.status),
            };
          });
          setAppointments(mapped);
        } else {
          setAppointments([]);
        }
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Failed to fetch doctor appointments:", error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const handleStartExamAction = async (aptId: string, currentStatus: Status) => {
    if (currentStatus === "waiting") {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${aptId}/start`, {
          method: "PATCH",
        });
      } catch (err) {
        console.error("Failed to call start exam API:", err);
      }
    }
    onStartExam(aptId);
  };

  const kpis = [
    { label: "Tổng số ca khám", value: appointments.length, icon: Users, valColor: "#0F172A", bgColor: "text-[#0F172A] bg-slate-50" },
    { label: "Đang chờ khám", value: appointments.filter(a => a.status === "waiting").length, icon: Clock, valColor: "#3B82F6", bgColor: "text-[#3B82F6] bg-blue-50/50" },
    { label: "Đang trong ca khám", value: appointments.filter(a => a.status === "inprogress").length, icon: Activity, valColor: "#F59E0B", bgColor: "text-[#F59E0B] bg-amber-50/50" },
    { label: "Đã hoàn thành", value: appointments.filter(a => a.status === "completed").length, icon: CheckCircle2, valColor: "#10B981", bgColor: "text-[#10B981] bg-emerald-50/50" },
  ];

  const filtered = appointments.filter(r => {
    const matchFilter = filter === "all" || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.patient.toLowerCase().includes(q) || r.aptId.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const FILTERS = [
    { key: "all",        label: `Tất cả (${appointments.length})` },
    { key: "waiting",    label: `Chờ khám (${appointments.filter(a => a.status === "waiting").length})` },
    { key: "inprogress", label: `Đang khám (${appointments.filter(a => a.status === "inprogress").length})` },
    { key: "completed",  label: `Đã hoàn thành (${appointments.filter(a => a.status === "completed").length})` },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-12">
        <Loader2 className="animate-spin h-8 w-8 text-[#0EA5E9] mb-3" />
        <p className="text-slate-400 text-xs font-medium">Đang đồng bộ danh sách lịch khám của bác sĩ...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      
      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map(k => {
          const IconComponent = k.icon;
          return (
            <div key={k.label} className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm transition-all hover:shadow-md">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${k.bgColor}`}>
                <IconComponent size={18} />
              </div>
              <div>
                <p className="font-bold text-2xl tracking-tight" style={{ color: k.valColor, lineHeight: 1 }}>{k.value}</p>
                <p className="text-[11px] font-semibold text-[#64748B] mt-1.5 uppercase tracking-wide">{k.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Controls Bar ─── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        {/* Search & Date info */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm bệnh nhân theo Tên, Mã số..."
              className="w-full h-9 pl-9 pr-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all font-medium"
            />
          </div>
          <div 
            onClick={() => dateInputRef.current?.showPicker()}
            className="relative flex items-center gap-2 text-xs font-bold text-[#0F172A] bg-slate-50 border border-[#E2E8F0] px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 transition-all select-none"
          >
            <Calendar size={13} className="text-slate-500" />
            <span>{selectedDate === getTodayDateString() ? `Hôm nay, ${formatDobDisplay(selectedDate)}` : formatDobDisplay(selectedDate)}</span>
            <input
              type="date"
              ref={dateInputRef}
              value={selectedDate}
              onChange={e => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                }
              }}
              className="absolute opacity-0 pointer-events-none w-0 h-0"
            />
          </div>

          {selectedDate !== getTodayDateString() && (
            <button
              onClick={() => setSelectedDate(getTodayDateString())}
              className="h-9 px-3 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-lg transition-colors cursor-pointer"
            >
              Về hôm nay
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="flex items-stretch rounded-lg overflow-hidden border border-[#E2E8F0]">
          {FILTERS.map((f, i) => {
            const active = f.key === filter;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer border-none bg-transparent outline-none ${i > 0 ? "border-l border-[#E2E8F0]" : ""}`}
                style={active
                  ? { background: "#0F172A", color: "white" }
                  : { background: "white", color: "#64748B" }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Data Queue Table ─── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm flex-1 min-h-0 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-[#E2E8F0]">
                {COL_HEADERS.map((h, i) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-bold px-5 py-3.5 uppercase tracking-wider"
                    style={{ 
                      color: "#64748B", 
                      width: COL_WIDTHS[i], 
                      whiteSpace: "nowrap",
                      textAlign: i === COL_HEADERS.length - 1 ? "right" : "left" 
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-xs font-semibold text-slate-400">
                    Không tìm thấy ca khám nào phù hợp.
                  </td>
                </tr>
              ) : filtered.map(row => {
                const cfg = STATUS_CONFIG[row.status];
                return (
                  <tr key={row.id} className="hover:bg-[#FAFAFA] transition-colors" style={{ height: 60 }}>
                    {/* STT */}
                    <td className="px-5">
                      <span className="font-mono text-xs font-bold text-[#64748B]">{row.stt}</span>
                    </td>
                    {/* Time */}
                    <td className="px-5">
                      <span className="font-mono text-xs font-bold text-[#0F172A]">{row.time}</span>
                    </td>
                    {/* Patient */}
                    <td className="px-5">
                      <p className="text-xs font-bold text-[#0F172A]">{row.patient}</p>
                      <p className="text-[10px] text-[#94A3B8] font-semibold mt-0.5">{row.meta}</p>
                    </td>
                    {/* Symptom */}
                    <td className="px-5">
                      <p className="text-xs leading-relaxed text-[#64748B] max-w-[240px] truncate" title={row.symptom}>
                        {row.symptom}
                      </p>
                    </td>
                    {/* Room */}
                    <td className="px-5">
                      <span className="text-xs font-bold text-[#0F172A]">{row.room}</span>
                    </td>
                    {/* Status Badge */}
                    <td className="px-5">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
                        style={{ background: cfg.bg, color: cfg.text }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    {/* Action */}
                    <td className="px-5 text-right">
                      {cfg.actionLabel ? (
                        <button
                          onClick={() => handleStartExamAction(row.id, row.status)}
                          className="h-8 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap outline-none flex items-center justify-center gap-1.5 ml-auto active:scale-[0.97]"
                          style={cfg.actionStyle === "primary"
                            ? { background: "#0EA5E9", color: "white", border: "none" }
                            : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}
                          onMouseEnter={e => { if (cfg.actionStyle === "primary") (e.currentTarget as HTMLElement).style.background = "#0284C7" }}
                          onMouseLeave={e => { if (cfg.actionStyle === "primary") (e.currentTarget as HTMLElement).style.background = "#0EA5E9" }}
                        >
                          <Stethoscope size={13} />
                          <span>{cfg.actionLabel}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[#94A3B8] font-semibold">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
