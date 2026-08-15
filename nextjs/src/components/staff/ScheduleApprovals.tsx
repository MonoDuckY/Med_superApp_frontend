import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

interface ScheduleApprovalsProps {
  schedules: any[];
  onRefresh: () => void;
}

export default function ScheduleApprovals({ schedules, onRefresh }: ScheduleApprovalsProps) {
  const [rooms, setRooms] = useState<any[]>([]);

  // Approve states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approveRoomId, setApproveRoomId] = useState("");

  // Reject states
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Edit states (Modify Approved Schedule)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editScheduleId, setEditScheduleId] = useState<string | null>(null);
  const [editWorkDate, setEditWorkDate] = useState("");
  const [editSession, setEditSession] = useState("MORNING");
  const [editRoomId, setEditRoomId] = useState("");
  const [editNote, setEditNote] = useState("");

  // Details & Block Slot states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailSchedule, setDetailSchedule] = useState<any | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockSlotId, setBlockSlotId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Rooms
  const fetchRooms = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/clinic-rooms`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setRooms(result.data || []);
        }
      }
    } catch (e) {
      console.error("Failed to fetch clinic rooms:", e);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Reactive updates for details panel
  useEffect(() => {
    if (detailSchedule) {
      const updated = schedules.find(s => s.id === detailSchedule.id);
      if (updated) {
        setDetailSchedule(updated);
      }
    }
  }, [schedules, detailSchedule]);

  const handleOpenApprove = (id: string) => {
    setSelectedScheduleId(id);
    setApproveRoomId(rooms[0]?.id || "");
    setIsApproveModalOpen(true);
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId) return;

    setIsSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-schedules/${selectedScheduleId}/decision`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          decision: "APPROVE",
          roomId: approveRoomId || null,
          rejectionReason: ""
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setIsApproveModalOpen(false);
        onRefresh();
      } else {
        alert(result.message || "Phê duyệt thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi phê duyệt.");
    } finally {
      setIsSubmitting(false);
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
          roomId: null,
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

  const handleOpenEdit = (sch: any) => {
    setEditScheduleId(sch.id);
    setEditWorkDate(sch.workDate || "");
    setEditSession(sch.session || "MORNING");
    setEditRoomId(sch.roomId || "");
    setEditNote(sch.note || "");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editScheduleId) return;

    setIsSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-schedules/${editScheduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workDate: editWorkDate,
          session: editSession,
          roomId: editRoomId || null,
          note: editNote.trim() || null
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setIsEditModalOpen(false);
        onRefresh();
      } else {
        alert(result.message || "Cập nhật lịch trực thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi cập nhật lịch trực.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenBlock = (slotId: string) => {
    setBlockSlotId(slotId);
    setBlockReason("");
    setIsBlockModalOpen(true);
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockSlotId || !blockReason.trim()) return;

    setIsSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/work-slots/${blockSlotId}/block`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reason: blockReason.trim()
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setIsBlockModalOpen(false);
        onRefresh();
      } else {
        alert(result.message || "Chặn ca trực thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi chặn ca trực.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoomName = (rId: string) => {
    const match = rooms.find(r => r.id === rId);
    return match ? match.name : rId;
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
                    <td className="px-6 py-4">{getRoomName(sch.roomName)}</td>
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
                            onClick={() => handleOpenApprove(sch.id)}
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
                      ) : (sch.status === "APPROVED" ||
                           sch.status === "AVAILABLE" ||
                           sch.status === "SCHEDULING" ||
                           sch.status === "BOOKED" ||
                           sch.status === "IN_PROGRESS" ||
                           sch.status === "CLOSED") ? (
                        <div className="flex items-center justify-center gap-2">
                          {(() => {
                            const hasNonAvailableSlots = sch.slots && sch.slots.some((s: any) => s.status !== "AVAILABLE");
                            return (
                              <button
                                disabled={hasNonAvailableSlots}
                                onClick={() => handleOpenEdit(sch)}
                                title={hasNonAvailableSlots ? "Không thể chỉnh sửa lịch trực vì có khung giờ trực đã bị chặn hoặc đã được đặt lịch hẹn" : "Chỉnh sửa lịch trực"}
                                className={`h-7 px-3 rounded-md text-[11px] font-bold transition-all outline-none border-none ${
                                  hasNonAvailableSlots 
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                    : "bg-[#E0F2FE] text-[#0369A1] hover:bg-[#B9E6FE] active:scale-[0.98] cursor-pointer"
                                }`}
                              >
                                Chỉnh sửa
                              </button>
                            );
                          })()}
                          <button
                            onClick={() => { setDetailSchedule(sch); setIsDetailsModalOpen(true); }}
                            className="h-7 px-3 border border-slate-200 text-slate-600 rounded-md text-[11px] font-bold hover:bg-slate-50 active:scale-[0.98] transition-all outline-none bg-transparent cursor-pointer"
                          >
                            Chi tiết & Chặn ca
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

      {/* Approve Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setIsApproveModalOpen(false)} />
          <form onSubmit={handleApproveSubmit} className="relative bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-[360px] p-6 shadow-2xl text-left animate-[scaleIn_0.15s_ease-out]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#0F172A]">Phê duyệt ca trực & Phân phòng</h3>
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Chọn Phòng khám <span className="text-rose-500">*</span></label>
                <select
                  value={approveRoomId}
                  onChange={(e) => setApproveRoomId(e.target.value)}
                  required
                  className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-[#0EA5E9]/10 bg-white"
                >
                  <option value="">Chọn phòng khám...</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} {r.note ? `(${r.note})` : ""}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="flex-1 h-9 text-xs font-semibold border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer bg-transparent outline-none"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-9 text-xs font-bold text-white bg-[#0EA5E9] hover:bg-[#0284C7] rounded-lg transition-colors border-none cursor-pointer flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Xác nhận Duyệt"}
              </button>
            </div>
          </form>
        </div>
      )}

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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setIsEditModalOpen(false)} />
          <form onSubmit={handleEditSubmit} className="relative bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-[380px] p-6 shadow-2xl text-left animate-[scaleIn_0.15s_ease-out]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#0F172A]">Chỉnh sửa lịch trực đã duyệt</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date selection */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Ngày làm việc <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={editWorkDate}
                  onChange={(e) => setEditWorkDate(e.target.value)}
                  required
                  className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-[#0EA5E9]/10 bg-white"
                />
              </div>

              {/* Session / Shift Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Ca làm việc <span className="text-rose-500">*</span></label>
                <select
                  value={editSession}
                  onChange={(e) => setEditSession(e.target.value)}
                  required
                  className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-[#0EA5E9]/10 bg-white"
                >
                  <option value="MORNING">Ca sáng (8h-12h)</option>
                  <option value="AFTERNOON">Ca chiều (13h-17h)</option>
                  <option value="NIGHT">Ca tối (17h-8h)</option>
                  <option value="FULL_TIME">Cả ngày (8h-17h)</option>
                </select>
              </div>

              {/* Room Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Phòng khám <span className="text-rose-500">*</span></label>
                <select
                  value={editRoomId}
                  onChange={(e) => setEditRoomId(e.target.value)}
                  required
                  className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-[#0EA5E9]/10 bg-white"
                >
                  <option value="">Chọn phòng khám...</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} {r.note ? `(${r.note})` : ""}</option>
                  ))}
                </select>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Ghi chú</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú chỉnh sửa..."
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-[#0EA5E9]/10 resize-none bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 h-9 text-xs font-semibold border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer bg-transparent outline-none"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-9 text-xs font-bold text-white bg-[#0EA5E9] hover:bg-[#0284C7] rounded-lg transition-colors border-none cursor-pointer flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Details & Block Slots Modal */}
      {isDetailsModalOpen && detailSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setIsDetailsModalOpen(false)} />
          <div className="relative bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-[500px] p-6 shadow-2xl text-left animate-[scaleIn_0.15s_ease-out] flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-4 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-[#0F172A]">Chi tiết ca trực</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Bác sĩ: {detailSchedule.doctorName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Slots list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <p className="text-xs font-bold text-slate-700">Các khung giờ khám bệnh (Slots):</p>
              
              {(!detailSchedule.slots || detailSchedule.slots.length === 0) ? (
                <p className="text-xs text-slate-400 italic">Không tìm thấy danh sách khung giờ.</p>
              ) : (
                <div className="space-y-2.5">
                  {detailSchedule.slots.map((s: any) => {
                    const isBlocked = s.status === "REJECTED" || s.status === "CANCELLED" || !!s.rejectionReason;
                    
                    return (
                      <div key={s.id} className="p-3 border border-[#E2E8F0] rounded-xl flex items-center justify-between bg-slate-50/50">
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {s.slot?.name || "Khung giờ"} ({s.slot?.startTime?.slice(0,5)} - {s.slot?.endTime?.slice(0,5)})
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            Phòng khám: {getRoomName(s.roomId)}
                          </p>
                          {s.rejectionReason && (
                            <p className="text-[10px] text-rose-500 italic mt-1 font-medium">Lý do chặn: {s.rejectionReason}</p>
                          )}
                        </div>
                        <div>
                          {isBlocked ? (
                            <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold select-none">
                              Bị chặn
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenBlock(s.id)}
                              className="h-6 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              Chặn ca
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end mt-5 pt-3 border-t border-[#F1F5F9] shrink-0">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="h-9 px-5 text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none outline-none"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Slot Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setIsBlockModalOpen(false)} />
          <form onSubmit={handleBlockSubmit} className="relative bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-[340px] p-6 shadow-2xl text-left animate-[scaleIn_0.15s_ease-out]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#C5221F]">Chặn khung giờ trực</h3>
              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Lý do chặn khung giờ <span className="text-rose-500">*</span></label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Nhập lý do chặn khung giờ khám bệnh này của bác sĩ..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                className="flex-1 h-9 text-xs font-semibold border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer bg-transparent outline-none"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-9 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors border-none cursor-pointer flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Xác nhận Chặn"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
