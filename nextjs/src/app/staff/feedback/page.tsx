"use client";

import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/auth";
import { 
  Check, 
  MessageCircle, 
  User, 
  Phone, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  ChevronDown, 
  Send,
  Loader2 
} from "lucide-react";

interface Feedback {
  feedbackId: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: string; // "SUBMITTED" or "RESPONDED"
  rating: number;
  serviceType: string;
  response: string;
}

const STAR_OPTS = ["Tất cả sao", "5 sao", "4 sao", "3 sao", "Dưới 3 sao"];
const STATUS_OPTS = ["Tất cả", "Chưa phản hồi", "Đã phản hồi"];

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < rating ? "#F59E0B" : "#E2E8F0"}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, size = 36, color = "#2563EB" }: { name: string; size?: number; color?: string }) {
  const cleanName = name.replace(/BN-/i, "").trim();
  const initials = cleanName.length > 2 ? cleanName.substring(0, 2).toUpperCase() : cleanName.toUpperCase() || "BN";
  return (
    <div className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, background: color + "18", color, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

function MiniSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[]
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="flex items-center gap-2 h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors whitespace-nowrap outline-none"
        style={{ color: "#374151" }}>
        {value}
        <ChevronDown size={14} className="text-slate-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-30 overflow-hidden py-1" style={{ minWidth: 160 }}>
          {options.map(o => (
            <button key={o} onMouseDown={() => { onChange(o); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-blue-50 transition-colors flex items-center justify-between border-none bg-transparent cursor-pointer"
              style={{ color: o === value ? "#2563EB" : "#374151" }}>
              {o}
              {o === value && <Check size={12} className="text-[#2563EB]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [starFilter, setStarFilter] = useState("Tất cả sao");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetchWithAuth(`${apiUrl}/api/staff/feedback`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setFeedbacks(result.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSend = async () => {
    if (!replyText.trim() || !selectedId) return;
    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetchWithAuth(`${apiUrl}/api/staff/feedback/${selectedId}/response`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: replyText.trim() })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setToastMessage("Gửi phản hồi cho ý kiến đóng góp thành công!");
          setReplyText("");
          await fetchFeedbacks();
          setTimeout(() => setToastMessage(null), 3000);
        } else {
          alert(result.message || "Gửi phản hồi thất bại.");
        }
      } else {
        alert("Lỗi kết nối máy chủ khi gửi phản hồi.");
      }
    } catch (error) {
      console.error("Failed to respond to feedback:", error);
      alert("Đã xảy ra lỗi khi phản hồi ý kiến.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = feedbacks.filter(f => {
    const starMatch = starFilter === "Tất cả sao"
      ? true
      : starFilter === "Dưới 3 sao" ? f.rating < 3
      : f.rating === parseInt(starFilter);
    const statusMatch = statusFilter === "Tất cả"
      ? true
      : statusFilter === "Chưa phản hồi" ? f.status === "SUBMITTED" : f.status === "RESPONDED";
    return starMatch && statusMatch;
  });

  const selected = feedbacks.find(f => f.feedbackId === selectedId) ?? null;

  const stCfg: Record<string, { label: string; bg: string; color: string }> = {
    SUBMITTED: { label: "Chưa phản hồi", bg: "#FEF3C7", color: "#D97706" },
    RESPONDED: { label: "Đã phản hồi",   bg: "#D1FAE5", color: "#10B981" },
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <Loader2 className="animate-spin h-8 w-8 text-[#0EA5E9] mb-3" />
        <p className="text-slate-400 text-xs font-semibold">Đang tải danh sách ý kiến đóng góp...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white text-left">

      {/* ── Page header ── */}
      <div className="shrink-0 px-8 py-5 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-1.5 mb-2">
          {["Nhân viên", "Chăm sóc khách hàng", "Phản hồi & Ý kiến đóng góp"].map((c, i, arr) => (
            <span key={i} className="flex items-center gap-1.5">
              <span style={{ fontSize: 12, color: i === arr.length - 1 ? "#0F172A" : "#94A3B8", fontWeight: i === arr.length - 1 ? 600 : 400 }}>{c}</span>
              {i < arr.length - 1 && <ChevronRight size={12} className="text-slate-300" />}
            </span>
          ))}
        </div>
        <h1 className="font-bold text-2xl" style={{ color: "#0F172A" }}>
          Tiếp nhận &amp; Phản hồi ý kiến đóng góp
        </h1>
      </div>

      {/* ── Split body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left 40% ── */}
        <div className="flex flex-col border-r border-[#E2E8F0] overflow-hidden shrink-0" style={{ width: "40%" }}>

          {/* Filter bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F1F5F9] shrink-0" style={{ background: "#FAFAFA" }}>
            <MiniSelect value={starFilter} onChange={setStarFilter} options={STAR_OPTS} />
            <MiniSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTS} />
            <span className="ml-auto text-xs font-semibold text-slate-400">{filtered.length} ý kiến</span>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {filtered.length === 0 && (
              <div className="flex-1 flex items-center justify-center py-16">
                <p style={{ fontSize: 13, color: "#94A3B8" }}>Không có ý kiến nào phù hợp.</p>
              </div>
            )}
            {filtered.map(fb => {
              const active = selectedId === fb.feedbackId;
              const st = stCfg[fb.status] || { label: fb.status, bg: "#F1F5F9", color: "#64748B" };
              const patientDisplay = fb.senderId || "Bệnh nhân";
              return (
                <button key={fb.feedbackId} type="button" onClick={() => { setSelectedId(fb.feedbackId); setReplyText(""); }}
                  className="w-full text-left rounded-2xl border p-4 transition-all cursor-pointer outline-none bg-white"
                  style={{
                    borderColor: active ? "#2563EB" : "#E2E8F0",
                    background: active ? "rgba(37,99,235,0.04)" : "white",
                  }}>
                  {/* Row 1: name */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={patientDisplay} size={30} color={active ? "#2563EB" : "#64748B"} />
                      <p className="font-bold text-xs" style={{ color: "#0F172A" }}>{patientDisplay}</p>
                    </div>
                  </div>
                  {/* Row 2: stars */}
                  <div className="mb-1.5">
                    <Stars rating={fb.rating} size={13} />
                  </div>
                  {/* Row 3: service */}
                  {fb.serviceType && (
                    <p style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>
                      Dịch vụ: {fb.serviceType}
                    </p>
                  )}
                  {/* Row 4: excerpt */}
                  <p className="line-clamp-2 leading-relaxed" style={{ fontSize: 12, color: "#374151" }}>
                    "{fb.content}"
                  </p>
                  {/* Row 5: status badge */}
                  <div className="flex justify-end mt-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right 60% ── */}
        <div className="flex-1 overflow-hidden flex flex-col" style={{ background: "#F8FAFC" }}>

          {/* Toast */}
          {toastMessage && (
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border border-green-200" style={{ background: "#ECFDF5" }}>
                <CheckCircle size={16} className="text-emerald-500" />
                <p className="text-sm font-semibold" style={{ color: "#065F46" }}>{toastMessage}</p>
              </div>
            </div>
          )}

          {/* State A — empty */}
          {!selected && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-blue-50/80">
                <MessageCircle size={36} className="text-blue-400" />
              </div>
              <div className="text-center" style={{ maxWidth: 320 }}>
                <p className="font-bold mb-1.5" style={{ fontSize: 15, color: "#0F172A" }}>
                  Chưa có ý kiến nào được chọn
                </p>
                <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>
                  Chọn một ý kiến đóng góp từ danh sách bên trái để xem chi tiết và soạn phản hồi.
                </p>
              </div>
            </div>
          )}

          {/* State B — detail */}
          {selected && (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

              {/* Card 1: Patient feedback (read-only) */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0]"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)" }}>

                {/* Patient info row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={selected.senderId || "Bệnh nhân"} size={44} />
                    <div>
                      <p className="font-bold text-sm" style={{ color: "#0F172A" }}>{selected.senderId || "Bệnh nhân"}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#64748B" }}>
                          <User size={12} className="text-slate-400" />
                          Mã tài khoản: {selected.senderId}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: (stCfg[selected.status] || {bg: "#F1F5F9"}).bg, color: (stCfg[selected.status] || {color: "#64748B"}).color }}>
                    {(stCfg[selected.status] || {label: selected.status}).label}
                  </span>
                </div>

                {/* Service type */}
                {selected.serviceType && (
                  <div className="flex items-start gap-2 mb-4 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
                      Dịch vụ: <span className="font-semibold">{selected.serviceType}</span>
                    </p>
                  </div>
                )}

                {/* Stars */}
                <div className="mb-3">
                  <Stars rating={selected.rating} size={22} />
                </div>

                {/* Comment */}
                <p className="leading-relaxed mb-4 text-sm text-slate-700" style={{ lineHeight: 1.7 }}>
                  "{selected.content}"
                </p>
              </div>

              {/* Card 2: Reply form / read-only reply */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0]"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)" }}>

                {selected.status === "SUBMITTED" ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-xs text-slate-700">
                        Nội dung phản hồi chính thức
                        <span className="ml-0.5 text-rose-500">*</span>
                      </p>
                    </div>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Nhập nội dung phản hồi chính thức gửi đến bệnh nhân qua ứng dụng di động..."
                      className="w-full outline-none border border-[#E2E8F0] rounded-xl p-4 resize-none transition-all focus:border-blue-400 mb-4 focus:ring-1 focus:ring-blue-100"
                      style={{ fontSize: 13, color: "#0F172A", lineHeight: 1.7, minHeight: 140 }}
                    />
                    <div className="flex items-center justify-end gap-3">
                      <button type="button" onClick={() => setReplyText("")}
                        className="h-10 px-5 text-sm font-semibold rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors bg-white text-slate-600"
                        disabled={isSubmitting}>
                        Hủy
                      </button>
                      <button type="button" onClick={handleSend}
                        disabled={!replyText.trim() || isSubmitting}
                        className="flex items-center gap-2 h-10 px-5 text-sm font-bold text-white rounded-xl cursor-pointer transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 border-none"
                        style={{ background: "#2563EB", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
                        {isSubmitting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        Gửi phản hồi
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-xs text-slate-700 mb-3">
                      Nội dung đã phản hồi
                    </p>
                    <div className="rounded-xl p-4 leading-relaxed mb-4 bg-emerald-50/50 border border-emerald-200">
                      <p style={{ fontSize: 13, color: "#15803D", lineHeight: 1.7 }}>
                        {selected.response}
                      </p>
                    </div>
                    {selected.receiverId && (
                      <div className="flex items-center gap-1.5 border-t border-[#F1F5F9] pt-3 text-[11px] text-slate-400 font-semibold">
                        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                        <p>
                          Người phản hồi: <span className="text-slate-600 font-bold">{selected.receiverId}</span>
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
