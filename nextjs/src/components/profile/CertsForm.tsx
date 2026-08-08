import React from "react";

interface CertsFormProps {
  user: any;
}

export default function CertsForm({ user }: CertsFormProps) {
  const isDoctor = user?.role === "DOCTOR" || user?.roles?.includes("DOCTOR");
  if (!isDoctor) {
    return (
      <div className="pt-10 pb-6 flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium text-slate-500">Chức năng chỉ dành cho Bác sĩ</p>
      </div>
    );
  }
  return (
    <div className="pt-5 flex flex-col gap-4" style={{ maxWidth: 480 }}>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
          Mã chứng chỉ hành nghề y khoa
        </label>
        <input
          type="text"
          value={user?.certificate || "N/A"}
          disabled
          className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
          Cơ quan cấp chứng chỉ
        </label>
        <input
          type="text"
          value="Bộ Y Tế Việt Nam"
          disabled
          className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
        />
      </div>
    </div>
  );
}
