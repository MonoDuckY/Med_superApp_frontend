import React from "react";
import { FlaskConical, User, Phone, Shield, CheckCircle2 } from "lucide-react";

interface DatasetPanelProps {
  user: any;
}

export default function DatasetPanel({ user }: DatasetPanelProps) {
  return (
    <div className="w-full max-w-[500px] bg-white border border-[#E2E8F0] rounded-2xl p-10 shadow-sm flex flex-col items-center text-center">
      {/* Badge icon */}
      <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center mb-6">
        <FlaskConical size={32} strokeWidth={1.5} className="text-[#8B5CF6]" />
      </div>

      {/* Heading */}
      <h2 className="text-[#8B5CF6] font-bold text-xl mb-2">
        Đây là trang của Nghiên cứu sinh
      </h2>
      <p className="text-[#64748B] text-[13px] max-w-[360px] leading-relaxed mb-6">
        Hệ thống phân tích nghiên cứu, truy vấn tập dữ liệu y sinh học và quản lý mẫu thử.
      </p>

      {/* User profile card details */}
      <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 text-left mb-6 flex flex-col gap-3">
        <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold border-b border-[#E2E8F0] pb-2">
          Thông tin phiên làm việc
        </p>
        <div className="flex items-center gap-3 text-[13px]">
          <User size={14} className="text-[#94A3B8] flex-shrink-0" />
          <span className="text-[#64748B]">Nghiên cứu sinh:</span>
          <span className="font-semibold text-[#0F172A]">{user?.fullName || "N/A"}</span>
        </div>
        <div className="flex items-center gap-3 text-[13px]">
          <Phone size={14} className="text-[#94A3B8] flex-shrink-0" />
          <span className="text-[#64748B]">Điện thoại:</span>
          <span className="font-mono text-[#0F172A]">{user?.phoneNumber || "N/A"}</span>
        </div>
        <div className="flex items-center gap-3 text-[13px]">
          <Shield size={14} className="text-[#94A3B8] flex-shrink-0" />
          <span className="text-[#64748B]">Vai trò:</span>
          <span className="font-medium text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded text-[11px]">RESEARCHER</span>
        </div>
      </div>

      {/* Verification indicator */}
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#10B981]">
        <CheckCircle2 size={13} />
        <span>Môi trường nghiên cứu an toàn</span>
      </div>
    </div>
  );
}
