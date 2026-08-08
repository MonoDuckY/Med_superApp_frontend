import React from "react";

interface GeneralInfoFormProps {
  user: any;
}

export default function GeneralInfoForm({ user }: GeneralInfoFormProps) {
  const fullName = user?.fullName || "";
  const email = user?.email || "";
  const phone = user?.phoneNumber || "";
  const citizenId = user?.citizenIdentificationCode || "";
  const certificate = user?.certificate || "";

  const isDoctor = user?.role === "DOCTOR" || user?.roles?.includes("DOCTOR");

  return (
    <div className="pt-5 flex flex-col gap-4" style={{ maxWidth: 480 }}>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
          Họ và tên
        </label>
        <input
          type="text"
          value={fullName}
          disabled
          className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
          Số điện thoại (Tên đăng nhập)
        </label>
        <input
          type="text"
          value={phone}
          disabled
          className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
          Email
        </label>
        <input
          type="email"
          value={email || "Chưa thiết lập"}
          disabled
          className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
        />
      </div>

      {citizenId && (
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
            Số CCCD / CMND
          </label>
          <input
            type="text"
            value={citizenId}
            disabled
            className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
          />
        </div>
      )}

      {isDoctor && certificate && (
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
            Mã chứng chỉ hành nghề
          </label>
          <input
            type="text"
            value={certificate}
            disabled
            className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
          />
        </div>
      )}
    </div>
  );
}
