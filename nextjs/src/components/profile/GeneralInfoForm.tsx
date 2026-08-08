import React, { useState } from "react";

interface GeneralInfoFormProps {
  user: any;
}

export default function GeneralInfoForm({ user }: GeneralInfoFormProps) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [citizenId, setCitizenId] = useState(user?.citizenIdentificationCode || "");
  const [certificate, setCertificate] = useState(user?.certificate || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = { ...user, fullName, email };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("Cập nhật thông tin cá nhân thành công!");
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi cập nhật thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  const isDoctor = user?.role === "DOCTOR" || user?.roles?.includes("DOCTOR");

  return (
    <form onSubmit={handleSave} className="pt-5 flex flex-col gap-4" style={{ maxWidth: 480 }}>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
          Họ và tên <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-white"
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@hospital.org"
          className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-white"
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

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#F1F5F9]">
        <button
          type="submit"
          disabled={isSaving}
          className="h-9 px-5 text-sm font-bold text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
          style={{ background: "#0EA5E9" }}
        >
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
