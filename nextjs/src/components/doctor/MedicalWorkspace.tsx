import React from "react";
import { Stethoscope } from "lucide-react";

interface MedicalWorkspaceProps {
  appointmentId?: string | null;
  onBackToSchedule: () => void;
}

export default function MedicalWorkspace({ appointmentId, onBackToSchedule }: MedicalWorkspaceProps) {
  return (
    <div className="w-full max-w-[500px] bg-white border border-[#E2E8F0] rounded-2xl p-10 shadow-sm flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center mb-6">
        <Stethoscope size={32} strokeWidth={1.5} className="text-[#0EA5E9]" />
      </div>

      <h2 className="text-[#0EA5E9] font-bold text-xl mb-2">
        Hồ sơ bệnh nhân & Khám bệnh
      </h2>
      {appointmentId && (
        <p className="text-xs font-mono text-[#0EA5E9] bg-sky-50 px-2.5 py-1.5 rounded-lg mb-4 font-bold border border-sky-100">
          Đang điều trị ca: {appointmentId.substring(0, 8).toUpperCase()}
        </p>
      )}
      <p className="text-[#64748B] text-[13px] max-w-[360px] leading-relaxed mb-6">
        Tính năng khám bệnh chi tiết, xem chỉ số sinh tồn đồng bộ và kê đơn thuốc đang được tích hợp cùng API phòng khám bệnh.
      </p>

      <button
        onClick={onBackToSchedule}
        className="h-9 px-4 text-xs font-bold text-white bg-[#0EA5E9] hover:bg-[#0284C7] rounded-lg transition-colors cursor-pointer border-none"
      >
        Quay lại Đăng ký lịch làm việc
      </button>
    </div>
  );
}
