import React from "react";
import { ClipboardList } from "lucide-react";

interface AppointmentGridProps {
  onBackToSchedule: () => void;
}

export default function AppointmentGrid({ onBackToSchedule }: AppointmentGridProps) {
  return (
    <div className="w-full max-w-[500px] bg-white border border-[#E2E8F0] rounded-2xl p-10 shadow-sm flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center mb-6">
        <ClipboardList size={32} strokeWidth={1.5} className="text-[#0EA5E9]" />
      </div>

      <h2 className="text-[#0EA5E9] font-bold text-xl mb-2">
        Danh sách lịch khám
      </h2>
      <p className="text-[#64748B] text-[13px] max-w-[360px] leading-relaxed mb-6">
        Tính năng đang được phát triển trong giai đoạn tiếp theo của dự án Phân hệ Lâm sàng HMS.
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
