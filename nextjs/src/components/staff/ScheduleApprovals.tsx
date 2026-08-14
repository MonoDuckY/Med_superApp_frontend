import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

interface ScheduleApprovalsProps {
  schedules: any[];
  onRefresh: () => void;
}

export default function ScheduleApprovals({ schedules, onRefresh }: ScheduleApprovalsProps) {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async (id: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-schedules/${id}/decision`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          decision: "APPROVE",
          rejectionReason: ""
        })
      });
      if (res.ok) {
        onRefresh();
      } else {
        alert("Phê duyệt thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi phê duyệt.");
    }
  };

  const handleOpenReject = (id: string) => {
    setSelectedScheduleId(id);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId || !rejectReason.trim()) return;

    setIsSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-schedules/${selectedScheduleId}/decision`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          decision: "REJECT",
          rejectionReason: rejectReason.trim()
        })
      });
      if (res.ok) {
        setIsRejectModalOpen(false);
        onRefresh();
      } else {
        alert("Từ chối ca trực thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi từ chối ca trực.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title section */}
      <div>
        <h1 className="text-xl font-bold text-[#0F172A]">Phê duyệt Lịch làm việc</h1>
        <p className="text-xs text-[#64748B] mt-1">
          Xem và duyệt đăng ký trực của các Bác sĩ khoa phòng
        </p>
      </div>

      {/* Table card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
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
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">Không có lịch đăng ký nào cần phê duyệt.</td>
                </tr>
              ) : (
                schedules.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{sch.doctorName}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        if (!sch.workDate || sch.workDate === "N/A") return sch.workDate;
                        const parts = sch.workDate.split("-");
                        if (parts.length === 3) {
                          const [y, m, d] = parts;
                          return `${d}/${m}/${y}`;
                        }
                        return sch.workDate;
                      })()}
                    </td>
                    <td className="px-6 py-4">{sch.shift}</td>
                    <td className="px-6 py-4">{sch.roomName}</td>
                    <td className="px-6 py-4">
                      {sch.status === "PENDING" && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-200">
                          Chờ duyệt
                        </span>
                      )}
                      {(sch.status === "APPROVED" ||
                        sch.status === "AVAILABLE" ||
                        sch.status === "SCHEDULING" ||
                        sch.status === "BOOKED" ||
                        sch.status === "IN_PROGRESS" ||
                        sch.status === "CLOSED") && (
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
                            onClick={() => handleApprove(sch.id)}
                            className="h-7 px-3 bg-[#0EA5E9] text-white rounded-md text-[11px] font-bold hover:bg-[#0284C7] active:scale-[0.98] transition-all outline-none border-none cursor-pointer"
                          >
                            Phê duyệt
                          </button>
                          <button
                            onClick={() => handleOpenReject(sch.id)}
                            className="h-7 px-3 border border-red-200 text-red-500 rounded-md text-[11px] font-bold hover:bg-red-50 active:scale-[0.98] transition-all outline-none bg-transparent cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setIsRejectModalOpen(false)} />
          <form onSubmit={handleRejectSubmit} className="relative bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-[360px] p-6 shadow-2xl text-left animate-[scaleIn_0.15s_ease-out]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#0F172A]">Từ chối ca đăng ký</h3>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Lý do từ chối <span className="text-rose-500">*</span></label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối phê duyệt ca làm việc này..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-[#0EA5E9]/10 resize-none bg-white text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 h-9 text-xs font-semibold border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer bg-transparent outline-none"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-9 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors border-none cursor-pointer flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Xác nhận Từ chối"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
