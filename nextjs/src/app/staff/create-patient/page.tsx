"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Phone,
  ChevronDown,
  Check,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

// Custom Toast
function Toast({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [visible, onClose]);

  return (
    <div
      className="fixed top-5 right-5 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all duration-300 z-50 bg-white border border-[#D1FAE5]"
      style={{
        boxShadow: "0 8px 24px rgba(16,185,129,0.15)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-12px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#10B981]">
        <Check className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">Tạo thành công</p>
        <p className="text-xs text-slate-500">Tạo tài khoản bệnh nhân thành công!</p>
      </div>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer outline-none border-none bg-transparent">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Section Header
function SectionHeading({ n, title, subtitle }: { n: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-4 pb-4 mb-6 border-b border-[#F1F5F9]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs text-white bg-[#0EA5E9]">
        {n}
      </div>
      <div>
        <p className="font-bold text-sm text-slate-900">{title}</p>
        <p className="text-xs mt-0.5 text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

export default function CreatePatientPage() {
  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "">("");
  const [cccd, setCccd] = useState("");
  const [bhyt, setBhyt] = useState("");
  const [address, setAddress] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [history, setHistory] = useState("");
  const [currentSick, setCurrentSick] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhone = (v: string) => {
    if (!v) {
      setPhoneError("Số điện thoại là bắt buộc.");
      return false;
    }
    const cleanPhone = v.replace(/\s/g, "");
    if (!/^(0[3-9]\d{8})$/.test(cleanPhone)) {
      setPhoneError("Số điện thoại không hợp lệ (Ví dụ: 0987654321).");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleDobChange = (val: string) => {
    const isDeleting = val.length < dob.length;
    let clean = val.replace(/[^0-9/]/g, "");
    if (!isDeleting) {
      if (clean.length === 2 && !clean.includes("/")) {
        clean = clean + "/";
      } else if (clean.length === 5 && (clean.match(/\//g) || []).length === 1) {
        clean = clean + "/";
      }
    }
    if (clean.length > 10) {
      clean = clean.substring(0, 10);
    }
    setDob(clean);
    setErrors((prev) => ({ ...prev, dob: "" }));
  };

  const validateDob = (dobStr: string) => {
    if (!dobStr) {
      return "Ngày sinh là bắt buộc.";
    }
    const parts = dobStr.split("/");
    if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
      return "Định dạng ngày sinh phải là DD/MM/YYYY (Ví dụ: 14/08/1995).";
    }
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return "Ngày sinh không hợp lệ.";
    }
    if (month < 1 || month > 12) {
      return "Tháng sinh phải từ 01 đến 12.";
    }
    const maxDays = new Date(year, month, 0).getDate();
    if (day < 1 || day > maxDays) {
      return `Tháng ${month} chỉ có tối đa ${maxDays} ngày.`;
    }
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    if (inputDate > today) {
      return "Ngày sinh không được ở tương lai.";
    }
    if (year < 1900) {
      return "Năm sinh không được nhỏ hơn 1900.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error states
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Họ và tên là bắt buộc.";
    if (!phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc.";
    } else {
      const cleanPhone = phone.replace(/\s/g, "");
      if (!/^(0[3-9]\d{8})$/.test(cleanPhone)) {
        newErrors.phone = "Số điện thoại không hợp lệ (Ví dụ: 0987654321).";
      }
    }
    
    const dobErrorMsg = validateDob(dob);
    if (dobErrorMsg) {
      newErrors.dob = dobErrorMsg;
    }
    
    if (!gender) newErrors.gender = "Vui lòng chọn giới tính.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/staff/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          gender: gender,
          dateOfBirth: (() => {
            const [d, m, y] = dob.split("/");
            return `${y}-${m}-${d}`;
          })(),
          phoneNumber: phone.replace(/\s/g, ""),
          address: address.trim() || null,
          citizenIdentificationCode: cccd.trim() || null,
          healthInsuranceCode: bhyt.trim() || null,
          medicalHistory: history.trim() || null,
          currentSickness: currentSick.trim() || null,
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
          bloodType: bloodType || null,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setToast(true);
        handleReset();
      } else {
        alert(result.message || "Tạo hồ sơ bệnh nhân thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFullName("");
    setPhone("");
    setPhoneError("");
    setDob("");
    setGender("");
    setCccd("");
    setBhyt("");
    setAddress("");
    setBloodType("");
    setHeight("");
    setWeight("");
    setHistory("");
    setCurrentSick("");
    setErrors({});
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
      <Toast visible={toast} onClose={() => setToast(false)} />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-xs text-slate-400 mb-1">
            Nhân viên tiếp đón &rsaquo; Quản lý bệnh nhân &rsaquo; Tạo hồ sơ &amp; tài khoản bệnh nhân mới
          </p>
          <h1 className="font-bold text-2xl text-slate-900 tracking-tight">
            Tạo hồ sơ bệnh nhân mới
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-12">
          {/* Section 1: Administrative Info */}
          <div className="p-8 border-b border-[#F1F5F9]">
            <SectionHeading
              n="01"
              title="Thông tin hành chính"
              subtitle="Administrative Information — Thông tin định danh và liên lạc của bệnh nhân"
            />
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {/* Full Name */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên bệnh nhân"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrors((prev) => ({ ...prev, fullName: "" }));
                  }}
                  className={`w-full h-10 px-3 text-sm border rounded-lg outline-none focus:ring-2 transition-all bg-white text-slate-900
                    ${errors.fullName ? "border-rose-400 focus:ring-rose-100" : "border-[#E2E8F0] focus:border-sky-400 focus:ring-sky-100"}`}
                />
                {errors.fullName && (
                  <div className="flex items-center gap-1 mt-1.5 text-rose-500 text-xs">
                    <AlertCircle size={13} />
                    <span>{errors.fullName}</span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="tel"
                    placeholder="Ví dụ: 0987654321"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    onBlur={() => validatePhone(phone)}
                    className={`w-full h-10 pl-3 pr-10 text-sm border rounded-lg outline-none focus:ring-2 transition-all bg-white text-slate-900
                      ${errors.phone || phoneError ? "border-rose-400 focus:ring-rose-100" : "border-[#E2E8F0] focus:border-sky-400 focus:ring-sky-100"}`}
                  />
                  <Phone size={14} className="absolute right-3 text-slate-400 pointer-events-none" />
                </div>
                {(errors.phone || phoneError) && (
                  <div className="flex items-center gap-1 mt-1.5 text-rose-500 text-xs">
                    <AlertCircle size={13} />
                    <span>{errors.phone || phoneError}</span>
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ngày sinh <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={dob}
                    onChange={(e) => handleDobChange(e.target.value)}
                    className={`w-full h-10 px-3 text-sm border rounded-lg outline-none focus:ring-2 transition-all bg-white text-slate-900
                      ${errors.dob ? "border-rose-400 focus:ring-rose-100" : "border-[#E2E8F0] focus:border-sky-400 focus:ring-sky-100"}`}
                  />
                </div>
                {errors.dob && (
                  <div className="flex items-center gap-1 mt-1.5 text-rose-500 text-xs">
                    <AlertCircle size={13} />
                    <span>{errors.dob}</span>
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Giới tính <span className="text-rose-500">*</span>
                </label>
                <div className={`flex gap-0 rounded-lg overflow-hidden border ${errors.gender ? "border-rose-400" : "border-[#E2E8F0]"}`} style={{ height: 40 }}>
                  {([
                    { label: "Nam", value: "Male" },
                    { label: "Nữ", value: "Female" },
                  ] as const).map((g, idx) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => {
                        setGender(g.value);
                        setErrors((prev) => ({ ...prev, gender: "" }));
                      }}
                      className={`flex-1 text-xs font-semibold transition-colors cursor-pointer border-none outline-none ${idx > 0 ? "border-l border-[#E2E8F0]" : ""}`}
                      style={
                        gender === g.value
                          ? { background: "#0EA5E9", color: "white" }
                          : { background: "white", color: "#64748B" }
                      }
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                {errors.gender && (
                  <div className="flex items-center gap-1 mt-1.5 text-rose-500 text-xs">
                    <AlertCircle size={13} />
                    <span>{errors.gender}</span>
                  </div>
                )}
              </div>

              {/* CCCD */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Số CCCD/CMND</label>
                <input
                  type="text"
                  placeholder="Nhập 12 số căn cước công dân"
                  value={cccd}
                  onChange={(e) => setCccd(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white text-slate-900"
                />
              </div>

              {/* BHYT */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mã thẻ BHYT</label>
                <input
                  type="text"
                  placeholder="Nhập 15 ký tự trên thẻ bảo hiểm y tế"
                  value={bhyt}
                  onChange={(e) => setBhyt(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white text-slate-900"
                />
              </div>

              {/* Address */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Địa chỉ thường trú</label>
                <input
                  type="text"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Physiological Metrics */}
          <div className="p-8 border-b border-[#F1F5F9]">
            <SectionHeading
              n="02"
              title="Chỉ số sinh lý lâm sàng"
              subtitle="Clinical Physiological Metrics — Thông số thể chất cơ bản"
            />
            <div className="grid grid-cols-3 gap-6">
              {/* Blood Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nhóm máu</label>
                <div className="relative">
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full h-10 pl-3 pr-10 text-sm border border-[#E2E8F0] rounded-lg outline-none appearance-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer bg-white text-slate-900"
                  >
                    <option value="" disabled>Chọn nhóm máu</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="other">Khác / Chưa xác định</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Chiều cao</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    placeholder="170"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full h-10 pl-3 pr-10 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white text-slate-900"
                  />
                  <span className="absolute right-3 text-xs font-semibold text-slate-400 pointer-events-none">cm</span>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Cân nặng</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="65.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full h-10 pl-3 pr-10 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white text-slate-900"
                  />
                  <span className="absolute right-3 text-xs font-semibold text-slate-400 pointer-events-none">kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: History & Current Status */}
          <div className="p-8">
            <SectionHeading
              n="03"
              title="Tiền sử y khoa & Triệu chứng hiện tại"
              subtitle="Medical History & Clinical Status — Ghi nhận bệnh sử và tình trạng tiếp đón"
            />
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tiền sử bệnh lý</label>
                <textarea
                  rows={4}
                  placeholder="Ghi nhận các bệnh lý nền, dị ứng thuốc, dị ứng thức ăn hoặc các phẫu thuật trước đây..."
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  className="w-full p-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all resize-none leading-relaxed bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tình trạng hiện tại</label>
                <textarea
                  rows={3}
                  placeholder="Triệu chứng lâm sinh ban đầu khi tiếp đón bệnh nhân..."
                  value={currentSick}
                  onChange={(e) => setCurrentSick(e.target.value)}
                  className="w-full p-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-300 transition-all resize-none leading-relaxed bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-[#F1F5F9] bg-[#FAFAFA]">
            <button
              type="button"
              onClick={handleReset}
              className="h-9 px-5 text-sm font-semibold border border-[#D1D5DB] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer bg-white text-slate-500 outline-none"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-6 text-sm font-bold text-white rounded-lg transition-all cursor-pointer flex items-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] disabled:opacity-70 border-none outline-none"
              style={{ boxShadow: loading ? "none" : "0 4px 10px rgba(14,165,233,0.25)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Tạo tài khoản &amp; Hồ sơ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
