import React from "react";
import { Ico, ic } from "@/components/common/Icons";

interface StaffCardProps {
  user: any;
  userRoles: string[];
}

export default function StaffCard({ user, userRoles }: StaffCardProps) {
  const getInitials = (name?: string) => {
    if (!name) return "US";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "US";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleBadgeLabel = () => {
    if (userRoles.includes("ADMIN")) return "Quản trị viên";
    if (userRoles.includes("DOCTOR")) return "Bác sĩ điều trị";
    if (userRoles.includes("STAFF")) return "Nhân viên điều phối";
    if (userRoles.includes("RESEARCHER")) return "Nghiên cứu viên";
    return "Thành viên";
  };

  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "01/08/2026";

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col items-center text-center">
      <div className="relative mb-4">
        <div
          className="flex items-center justify-center rounded-full font-bold text-white bg-[#0EA5E9] border-[3px] border-[#0EA5E9] shadow-[0_0_0_4px_rgba(14,165,233,0.12)]"
          style={{ width: 96, height: 96, fontSize: 32 }}
        >
          {getInitials(user?.fullName)}
        </div>
        <div
          className="absolute bottom-0 right-0 flex items-center justify-center rounded-full border-2 border-white w-6 h-6 bg-[#10B981]"
        >
          <Ico d={ic.checkCircle} cls="w-3 h-3 text-white" />
        </div>
      </div>

      <h3 className="font-bold mt-2 text-[#0F172A] text-lg">{user?.fullName || "Người dùng"}</h3>

      <span className="mono text-xs px-2 py-1 rounded mt-2 inline-block bg-[#F1F5F9] text-[#64748B]">
        {getRoleBadgeLabel()}
      </span>

      <div className="w-full mt-6 pt-5 flex flex-col gap-3 text-left border-t border-[#F1F5F9]">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Ico d={ic.calendar} cls="w-3.5 h-3.5 shrink-0 text-[#94A3B8]" />
            Ngày tham gia
          </div>
          <span className="text-xs font-bold text-[#0F172A]">{joinDate}</span>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Ico d={ic.clock} cls="w-3.5 h-3.5 shrink-0 text-[#94A3B8]" />
            Số điện thoại
          </div>
          <span className="text-xs font-bold mono text-[#0F172A]">{user?.phoneNumber || "N/A"}</span>
        </div>
      </div>
    </div>
  );
}
