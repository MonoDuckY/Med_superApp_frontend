import React, { useState } from "react";
import { Plus, Search, ChevronDown, Calendar, Check, XCircle, Clock } from "lucide-react";

export interface Appointment {
  id: string;
  patient: string;
  phone: string;
  doctor: string;
  room: string;
  date: string;
  time: string;
  status: string;
  type: string;
}

interface AppointmentTableProps {
  appointments: Appointment[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  onAddBooking: () => void;
  onReschedule: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onConfirm: (appointment: Appointment) => void;
  stats: { total: number; confirmed: number; cancelled: number; noShow: number };
}

export default function AppointmentTable({
  appointments,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onAddBooking,
  onReschedule,
  onCancel,
  onConfirm,
  stats
}: AppointmentTableProps) {
  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const handleStartDateChange = (val: string) => {
    const isDeleting = val.length < startDate.length;
    let clean = val.replace(/[^0-9/]/g, "");
    if (!isDeleting) {
      if (clean.length === 2 && !clean.includes("/")) {
        clean = clean + "/";
      } else if (clean.length === 5 && (clean.match(/\//g) || []).length === 1) {
        clean = clean + "/";
      }
    }
    if (clean.length > 10) {
      clean = clean.substring(0, 10);
    }
    setStartDate(clean);
    setCurrentPage(1);
  };

  const handleEndDateChange = (val: string) => {
    const isDeleting = val.length < endDate.length;
    let clean = val.replace(/[^0-9/]/g, "");
    if (!isDeleting) {
      if (clean.length === 2 && !clean.includes("/")) {
        clean = clean + "/";
      } else if (clean.length === 5 && (clean.match(/\//g) || []).length === 1) {
        clean = clean + "/";
      }
    }
    if (clean.length > 10) {
      clean = clean.substring(0, 10);
    }
    setEndDate(clean);
    setCurrentPage(1);
  };

  const convertToISODate = (dStr: string) => {
    if (!dStr) return "";
    const parts = dStr.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts;
      if (d.length === 2 && m.length === 2 && y.length === 4) {
        return `${y}-${m}-${d}`;
      }
    }
    return "";
  };

  // Client side filtering for search, status, & date range
  const filteredAppointments = appointments.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      a.patient.toLowerCase().includes(q) ||
      a.doctor.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      (a.phone && a.phone.includes(q));

    const matchStatus = statusFilter === "" || a.status === statusFilter;

    const isoStart = convertToISODate(startDate);
    const isoEnd = convertToISODate(endDate);

    let matchDate = true;
    if (isoStart && a.date < isoStart) matchDate = false;
    if (isoEnd && a.date > isoEnd) matchDate = false;

    return matchSearch && matchStatus && matchDate;
  });

  // Paginated subset
  const totalPages = Math.ceil(filteredAppointments.length / pageSize);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-5">
      {/* Action Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 shrink-0">
        <div className="text-left">
          <h1 className="text-xl font-bold text-[#0F172A]">Quản lý Lịch hẹn</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Đặt lịch khám mới, thay đổi thời gian hoặc hủy lịch hẹn của bệnh nhân.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddBooking}
            className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm cursor-pointer outline-none active:scale-[0.98] border-none"
            style={{ background: "#0EA5E9", boxShadow: "0 1px 4px rgba(14,165,233,0.3)" }}
          >
            <Plus size={14} strokeWidth={2} className="text-white" />
            Thêm lịch hẹn mới
          </button>
        </div>
      </div>

      {/* KPI Stats cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center shrink-0">
            <Calendar size={18} strokeWidth={1.75} className="text-sky-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0F172A]">{stats.total}</p>
            <p className="text-xs text-[#64748B] mt-0.5 leading-snug">Lịch khám hôm nay</p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <Check size={18} strokeWidth={1.75} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#10B981]">{stats.confirmed}</p>
            <p className="text-xs text-[#64748B] mt-0.5 leading-snug">Đã xác nhận</p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
            <XCircle size={18} strokeWidth={1.75} className="text-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#EF4444]">{stats.cancelled}</p>
            <p className="text-xs text-[#64748B] mt-0.5 leading-snug">Đã hủy</p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={18} strokeWidth={1.75} className="text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#F59E0B]">{stats.noShow}</p>
            <p className="text-xs text-[#64748B] mt-0.5 leading-snug">Quá hạn (No-show)</p>
          </div>
        </div>
      </div>

      {/* Table controls & filter section */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-3 flex-wrap">
          {/* Text search */}
          <div className="relative" style={{ minWidth: 220, flex: 1 }}>
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full h-9 pl-9 pr-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all bg-white font-medium text-[#0F172A]"
              placeholder="Tìm bệnh nhân, SĐT, mã..."
            />
          </div>

          {/* Date range picker */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
            <span>Từ:</span>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={startDate}
              onChange={e => handleStartDateChange(e.target.value)}
              className="h-9 w-24 px-2 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-[#0F172A] bg-white transition-all font-medium text-center"
            />
            <span>Đến:</span>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={endDate}
              onChange={e => handleEndDateChange(e.target.value)}
              className="h-9 w-24 px-2 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-[#0F172A] bg-white transition-all font-medium text-center"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => { setStartDate(""); setEndDate(""); setCurrentPage(1); }}
                className="h-9 px-3 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-lg transition-all cursor-pointer"
              >
                Xóa lọc ngày
              </button>
            )}
          </div>

          {/* Status select */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="h-9 pl-3 pr-8 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 text-[#0F172A] bg-white appearance-none cursor-pointer font-medium"
            >
              <option value="">Tất cả Trạng thái</option>
              <option value="Confirmed">Đã xác nhận</option>
              <option value="Cancelled">Đã hủy</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="No-show">Quá hạn (No-show)</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Mã lịch hẹn", "Bệnh nhân", "Bác sĩ & Phòng", "Ngày & Giờ", "Trạng thái", "Loại", "Thao tác"].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium text-slate-700">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">Không tìm thấy lịch hẹn phù hợp.</td>
                </tr>
              ) : paginatedAppointments.map(a => {
                const isActionDisabled = a.status === "Cancelled" || a.status === "No-show" || a.status === "Completed" || a.status === "In-progress";
                let isPast = false;
                try {
                  const [startTimeStr] = a.time.split("-");
                  isPast = new Date(`${a.date}T${startTimeStr}:00`).getTime() < new Date().getTime();
                } catch (e) {}
                return (
                  <tr key={a.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="mono text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">{a.id}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div>
                        <p className="font-bold text-slate-900">{a.patient}</p>
                        <p className="text-[10px] mt-0.5">
                          {a.phone ? (
                            <a href={`tel:${a.phone}`} className="text-sky-600 hover:underline font-semibold">
                              {a.phone}
                            </a>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-slate-800">{a.doctor}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{a.room}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div>
                        <p className="text-slate-800 font-bold">{a.time}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          {(() => {
                            if (!a.date || a.date === "N/A") return a.date;
                            const parts = a.date.split("-");
                            if (parts.length === 3) {
                              const [y, m, d] = parts;
                              return `${d}/${m}/${y}`;
                            }
                            return a.date;
                          })()}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {a.status === "Confirmed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <Check size={11} strokeWidth={2.5} />
                          Đã xác nhận
                        </span>
                      )}
                      {a.status === "Cancelled" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-500 border border-rose-200">
                          <XCircle size={11} strokeWidth={2.5} />
                          Đã hủy
                        </span>
                      )}
                      {a.status === "Chờ xác nhận" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                          <Clock size={11} strokeWidth={2.5} />
                          Chờ xác nhận
                        </span>
                      )}
                      {a.status === "No-show" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-400 border border-slate-200">
                          <Clock size={11} strokeWidth={2.5} />
                          Quá hạn (No-show)
                        </span>
                      )}
                      {a.status === "Completed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-200">
                          <Check size={11} strokeWidth={2.5} />
                          Đã hoàn thành
                        </span>
                      )}
                      {a.status === "In-progress" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-600 border border-violet-200">
                          <Clock size={11} strokeWidth={2.5} />
                          Đang khám
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {a.type === "Standard" ? "Khám thường" : a.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {a.status === "Chờ xác nhận" && (
                          <button
                            onClick={() => !isPast && onConfirm(a)}
                            disabled={isPast}
                            title={isPast ? "Không thể phê duyệt lịch hẹn trong quá khứ" : ""}
                            className={`h-7 px-3 text-[11px] font-bold rounded-lg border-none transition-all outline-none 
                              ${isPast 
                                ? "bg-slate-100 text-slate-300 cursor-not-allowed" 
                                : "bg-[#0EA5E9] hover:bg-[#0284C7] text-white cursor-pointer active:scale-[0.98]"}`}
                          >
                            Duyệt
                          </button>
                        )}
                        <button
                          onClick={() => onReschedule(a)}
                          disabled={isActionDisabled}
                          className={`h-7 px-3 text-[11px] font-bold rounded-lg border transition-all outline-none bg-transparent
                            ${isActionDisabled ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-sky-200 text-sky-600 hover:bg-sky-50 hover:border-sky-300 cursor-pointer"}`}
                        >
                          Dời lịch
                        </button>
                        <button
                          onClick={() => onCancel(a)}
                          disabled={isActionDisabled}
                          className={`h-7 px-3 text-[11px] font-bold rounded-lg border transition-all outline-none bg-transparent
                            ${isActionDisabled ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 cursor-pointer"}`}
                        >
                          Hủy
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between flex-wrap gap-4 bg-slate-50/50">
            <span className="text-xs font-semibold text-[#64748B]">
              Hiển thị {Math.min(filteredAppointments.length, (currentPage - 1) * pageSize + 1)} - {Math.min(filteredAppointments.length, currentPage * pageSize)} trong số {filteredAppointments.length} kết quả
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="h-8 px-3 border border-[#E2E8F0] rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none bg-white text-[#475569] cursor-pointer"
              >
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => {
                const isActive = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all select-none cursor-pointer
                      ${isActive 
                        ? "bg-[#0EA5E9] text-white shadow-sm border-none" 
                        : "border border-[#E2E8F0] hover:bg-slate-50 bg-white text-[#475569]"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="h-8 px-3 border border-[#E2E8F0] rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none bg-white text-[#475569] cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
