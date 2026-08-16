import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

interface BookingDrawerProps {
  isOpen: boolean;
  mode: "ADD" | "RESCHEDULE";
  selectedAppointment: any | null;
  doctorsList: any[];
  rawSubmissions: any[];
  onClose: () => void;
  onRefresh: () => void;
  triggerSmsToast: (title: string, message: string) => void;
}

export default function BookingDrawer({
  isOpen,
  mode,
  selectedAppointment,
  doctorsList,
  rawSubmissions,
  onClose,
  onRefresh,
  triggerSmsToast
}: BookingDrawerProps) {
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

  // Common states
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [formDate, setFormDate] = useState(todayStr);
  const [formTimeSlot, setFormTimeSlot] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formDeposit, setFormDeposit] = useState(false);
  const [formFollowUp, setFormFollowUp] = useState(false);
  const [formOriginRecordId, setFormOriginRecordId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add specific states
  const [formPatientName, setFormPatientName] = useState("");
  const [formPatientPhone, setFormPatientPhone] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);

  // Reschedule specific states
  const [rescheduleReason, setRescheduleReason] = useState("");

  // Initialize values when drawer opens or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "ADD") {
        setSelectedDoctorId("");
        setFormDate(todayStr);
        setFormTimeSlot("");
        setFormReason("");
        setFormDeposit(false);
        setFormFollowUp(false);
        setFormOriginRecordId("");
        setFormPatientName("");
        setFormPatientPhone("");
        setSelectedPatientId("");
        setPatientSearchResults([]);
      } else if (mode === "RESCHEDULE" && selectedAppointment) {
        // Find doctor id
        const docMatch = doctorsList.find(d => d.fullName === selectedAppointment.doctor);
        setSelectedDoctorId(docMatch ? docMatch.id : "");
        setFormDate(todayStr);
        setFormTimeSlot("");
        setRescheduleReason("");
      }
    }
  }, [isOpen, mode, selectedAppointment, doctorsList, todayStr]);

  // Compute available slots
  const availableSlotsForBooking = useMemo(() => {
    if (!selectedDoctorId || !formDate) return [];
    const matchedSubmissions = rawSubmissions.filter((sub: any) => {
      const isApprovedOrAvailable = sub.status === "APPROVED" || sub.status === "AVAILABLE";
      return sub.doctorId === selectedDoctorId && sub.workDate === formDate && isApprovedOrAvailable;
    });
    
    const slotsList: any[] = [];
    matchedSubmissions.forEach((sub: any) => {
      (sub.slots || []).forEach((slot: any) => {
        if (slot.status === "AVAILABLE") {
          slotsList.push(slot);
        }
      });
    });
    return slotsList;
  }, [selectedDoctorId, formDate, rawSubmissions]);

  // Search Patients handler
  const handlePatientSearch = async (query: string) => {
    setFormPatientName(query);
    if (!query.trim()) {
      setPatientSearchResults([]);
      setSelectedPatientId("");
      return;
    }
    setSearchingPatients(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    let params = "";
    const cleanQuery = query.trim().replace(/\s+/g, "");
    const isNumeric = /^[+0-9]+$/.test(cleanQuery);
    if (isNumeric) {
      if (cleanQuery.startsWith("+") || (cleanQuery.startsWith("0") && cleanQuery.length <= 11 && cleanQuery.length >= 9)) {
        params = `phoneNumber=${encodeURIComponent(cleanQuery)}`;
      } else if (cleanQuery.length === 9 || cleanQuery.length === 12) {
        params = `citizenIdentificationCode=${encodeURIComponent(cleanQuery)}`;
      } else {
        params = `phoneNumber=${encodeURIComponent(cleanQuery)}`;
      }
    } else {
      params = `name=${encodeURIComponent(query)}`;
    }

    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/patients/search?${params}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setPatientSearchResults(result.data);
        }
      }
    } catch (e) {
      console.warn("Failed to search patients:", e);
    } finally {
      setSearchingPatients(false);
    }
  };

  // Submit Add Booking
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert("Vui lòng tìm và chọn một bệnh nhân.");
      return;
    }
    if (!selectedDoctorId) {
      alert("Vui lòng chọn bác sĩ phụ trách.");
      return;
    }
    if (!formTimeSlot) {
      alert("Vui lòng chọn khung giờ hẹn khám.");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: selectedPatientId,
          doctorWorkSlotId: formTimeSlot,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        triggerSmsToast(
          "SMS Gateway — Đang xử lý",
          `Đăng ký thành công lịch khám cho bệnh nhân ${formPatientName} vào lúc ${formDate}!`
        );
        onRefresh();
        onClose();
      } else {
        alert(result.message || "Đăng ký lịch hẹn thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối đến máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Reschedule Booking
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    if (!formTimeSlot) {
      alert("Vui lòng chọn khung giờ trực mới của Bác sĩ.");
      return;
    }
    if (!rescheduleReason.trim()) {
      alert("Vui lòng nhập lý do dời lịch hẹn.");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetchWithAuth(`${apiUrl}/api/staff/scheduling/appointments/${selectedAppointment.id}/reschedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newDoctorWorkSlotId: formTimeSlot,
          reason: rescheduleReason.trim(),
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        triggerSmsToast(
          "SMS Gateway — Đang xử lý",
          `Dời lịch hẹn ${selectedAppointment.id} của bệnh nhân ${selectedAppointment.patient} sang ${formDate} thành công!`
        );
        onRefresh();
        onClose();
      } else {
        alert(result.message || "Dời lịch hẹn thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối đến máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      
      {/* Drawer Container */}
      <div className="relative z-10 flex flex-col bg-white shadow-2xl overflow-hidden h-full animate-[slideInRight_0.2s_ease-out]" style={{ width: 420 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] shrink-0">
          <div className="text-left">
            <h2 className="text-sm font-semibold text-[#0F172A]">
              {mode === "ADD" ? "Thêm lịch hẹn mới" : `Dời lịch hẹn ${selectedAppointment?.id}`}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {mode === "ADD" ? "Tạo và liên kết thông tin lịch hẹn bệnh nhân." : `Chọn khung giờ mới để cập nhật lịch hẹn cho bệnh nhân.`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors cursor-pointer border-none bg-transparent outline-none"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body Form */}
        <form
          onSubmit={mode === "ADD" ? handleAddSubmit : handleRescheduleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-left"
        >
          {mode === "ADD" ? (
            <>
              {/* Patient Name */}
              <div className="relative">
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Họ và tên bệnh nhân <span className="text-rose-500">*</span>
                </label>
                <input
                  value={formPatientName}
                  required
                  onChange={(e) => handlePatientSearch(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all bg-white"
                  placeholder="Tìm kiếm bằng tên, SĐT hoặc CCCD..."
                  autoComplete="off"
                />
                {searchingPatients && (
                  <span className="absolute right-3 top-[34px]">
                    <Loader2 className="animate-spin text-sky-500 h-4 w-4" />
                  </span>
                )}
                {patientSearchResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {patientSearchResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatientId(p.id);
                          setFormPatientName(p.fullName);
                          setFormPatientPhone(p.phoneNumber || "Không có số điện thoại");
                          setPatientSearchResults([]);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <p className="font-semibold text-slate-800">{p.fullName}</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {p.phoneNumber && <span>SĐT: {p.phoneNumber}</span>}
                          {p.citizenIdentificationCode && <span className="ml-3">CCCD: {p.citizenIdentificationCode}</span>}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone number (Display only) */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Số điện thoại và Liên kết liên hệ
                </label>
                <input
                  value={formPatientPhone}
                  disabled
                  placeholder="Hệ thống tự động điền khi liên kết bệnh nhân..."
                  className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-slate-50 text-slate-500 outline-none cursor-not-allowed"
                />
              </div>
            </>
          ) : (
            /* Patient Info Display for Reschedule */
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs space-y-2 text-[#475569]">
              <p><strong>Bệnh nhân:</strong> <span className="text-[#0F172A] font-semibold">{selectedAppointment?.patient}</span></p>
              <p><strong>Bác sĩ hiện tại:</strong> {selectedAppointment?.doctor} ({selectedAppointment?.room})</p>
              <p><strong>Giờ khám cũ:</strong> {selectedAppointment?.time} ngày {selectedAppointment?.date}</p>
            </div>
          )}

          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Bác sĩ phụ trách <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedDoctorId}
              required
              onChange={(e) => { setSelectedDoctorId(e.target.value); setFormTimeSlot(""); }}
              className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-white cursor-pointer"
            >
              <option value="">Chọn bác sĩ điều trị...</option>
              {doctorsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Ngày hẹn khám <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formDate}
              min={todayStr}
              required
              onChange={(e) => { setFormDate(e.target.value); setFormTimeSlot(""); }}
              className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-white"
            />
          </div>

          {/* Available Slots Grid */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-2.5">
              Khung giờ hẹn có sẵn <span className="text-rose-500">*</span>
            </label>
            {availableSlotsForBooking.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-3 text-center italic">
                {selectedDoctorId ? "Bác sĩ không có lịch trực khả dụng vào ngày này." : "Vui lòng chọn bác sĩ phụ trách trước."}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {availableSlotsForBooking.map((slotObj: any) => {
                  const slotLabel = slotObj.slot 
                    ? `${slotObj.slot.startTime.slice(0, 5)}-${slotObj.slot.endTime.slice(0, 5)}`
                    : "Khung giờ";
                  const isActive = formTimeSlot === slotObj.id;
                  return (
                    <button
                      key={slotObj.id}
                      type="button"
                      onClick={() => setFormTimeSlot(slotObj.id)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all cursor-pointer outline-none text-center
                        ${isActive ? "bg-sky-500 border-sky-500 text-white shadow-sm font-semibold" :
                                     "bg-white border-[#E2E8F0] text-[#0F172A] hover:border-sky-300 hover:bg-sky-50"}`}
                    >
                      {slotLabel} {slotObj.roomId ? `(${slotObj.roomId})` : ""}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {mode === "ADD" ? (
            /* Extra fields for Add */
            <>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Lý do khám bệnh</label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Triệu chứng lâm sàng sơ bộ (ví dụ: đau bụng âm ỉ, ho sốt...)"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 resize-none transition-all bg-white"
                />
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-[#0F172A] font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formFollowUp}
                    onChange={(e) => setFormFollowUp(e.target.checked)}
                    className="w-3.5 h-3.5 text-sky-500 border-slate-300 rounded focus:ring-sky-400"
                  />
                  Lịch hẹn tái khám
                </label>
              </div>
            </>
          ) : (
            /* Reason for Reschedule */
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Lý do dời lịch hẹn <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rescheduleReason}
                required
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Nhập lý do thay đổi thời gian khám bệnh..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 resize-none transition-all bg-white"
              />
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#F1F5F9] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 text-xs font-semibold border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer outline-none bg-transparent"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-9 text-xs font-bold text-white rounded-lg transition-all cursor-pointer bg-[#0EA5E9] hover:bg-sky-600 outline-none flex items-center justify-center border-none"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                mode === "ADD" ? "Xác nhận Đặt lịch" : "Cập nhật Lịch hẹn"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
