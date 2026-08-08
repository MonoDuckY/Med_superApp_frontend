import React from "react";
import { Plus, Search, ChevronDown, Calendar, Check, XCircle, Clock, RotateCw } from "lucide-react";

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
  onScanNoShow: () => void;
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
  onScanNoShow,
  stats
}: AppointmentTableProps) {
  // Client side filtering for search & status
  const filteredAppointments = appointments.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      a.patient.toLowerCase().includes(q) ||
      a.doctor.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      (a.phone && a.phone.includes(q));

    const matchStatus = statusFilter === "" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
            onClick={onScanNoShow}
            className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100/70 transition-all cursor-pointer outline-none active:scale-[0.98]"
          >
            <RotateCw size={13} className="text-sky-500" />
            Tự động quét No-show
          </button>
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
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 pl-3 pr-8 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 text-[#64748B] bg-white appearance-none cursor-pointer"
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
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Mã lịch hẹn", "Bệnh nhân", "Bác sĩ & Phòng", "Ngày & Giờ", "Trạng thái", "Loại", "Thao tác"].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium text-slate-700">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">Không tìm thấy lịch hẹn phù hợp.</td>
                </tr>
              ) : filteredAppointments.map(a => {
                const isActionDisabled = a.status === "Cancelled" || a.status === "No-show" || a.status === "Completed";
                return (
                  <tr key={a.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="mono text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">{a.id}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div>
                        <p className="font-bold text-slate-900">{a.patient}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{a.phone || "N/A"}</p>
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
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{a.date}</p>
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
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {a.type === "Standard" ? "Khám thường" : a.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onReschedule(a)}
                          disabled={isActionDisabled}
                          className={`h-7 px-3 text-xs font-bold rounded-lg border transition-all outline-none bg-transparent
                            ${isActionDisabled ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-sky-200 text-sky-600 hover:bg-sky-50 hover:border-sky-300 cursor-pointer"}`}
                        >
                          Dời lịch
                        </button>
                        <button
                          onClick={() => onCancel(a)}
                          disabled={isActionDisabled}
                          className={`h-7 px-3 text-xs font-bold rounded-lg border transition-all outline-none bg-transparent
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
      </div>
    </div>
  );
}
