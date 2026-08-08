import React from "react";
import Logo from "@/components/Logo";

function EcgWave() {
  return (
    <svg
      viewBox="0 0 700 80"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.18 }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polyline
        filter="url(#glow)"
        stroke="#0EA5E9"
        strokeWidth="2"
        fill="none"
        points="
          0,40 60,40 70,40 80,15 90,65 100,40 110,40
          170,40 180,40 190,8  200,72 210,40 220,40
          280,40 290,40 300,15 310,65 320,40 330,40
          390,40 400,40 410,8  420,72 430,40 440,40
          500,40 510,40 520,15 530,65 540,40 550,40
          610,40 620,40 630,8  640,72 650,40 700,40
        "
      />
    </svg>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="flex-1 rounded-xl px-5 py-4 flex flex-col gap-1"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(8px)",
      }}
    >
      <p className="font-bold text-white text-base tracking-tight">{value}</p>
      <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">{label}</p>
    </div>
  );
}

export default function BrandPanel() {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-between overflow-hidden w-1/2 bg-[#0C1A2E]"
      style={{ padding: "40px 48px" }}
    >
      <div className="absolute pointer-events-none" style={{
        width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
        top: -100, left: -100,
      }} />
      <div className="absolute pointer-events-none" style={{
        width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
        bottom: 80, right: -80,
      }} />

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <div>
            <p className="font-bold text-white leading-none text-sm">HMS</p>
            <p className="leading-none mt-1 tracking-widest font-semibold text-[10px] text-[#475569]">NEXTGEN HEALTHCARE</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-500">Hệ thống Trực tuyến — Hoạt động ổn định</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-8">
        <div>
          <h1 className="font-bold leading-tight text-white text-4xl">
            Trí Tuệ Nhân Tạo<br />
            cho Y Tế{" "}
            <span className="text-[#0EA5E9]">Tốt Hơn</span>
          </h1>
          <p className="mt-4 leading-relaxed text-sm text-[#64748B] max-w-[480px]">
            Tích hợp quy trình lâm sàng, chẩn đoán bằng AI và hợp nhất dữ liệu bệnh nhân
            thời gian thực trên một nền tảng an toàn.
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden h-24">
          <EcgWave />
          <div className="absolute inset-0 flex gap-3 p-3 z-10">
            <StatCard value="48,231"   label="Hồ sơ Bệnh nhân" />
            <StatCard value="99.97%"   label="Thời gian Hoạt động" />
            <StatCard value="ISO 27001" label="Đạt chuẩn Bảo mật" />
          </div>
        </div>
      </div>

      <p className="relative z-10 text-xs text-[#475569]">
        © 2026 HMS — Hệ sinh thái Y tế NextGen. Bảo lưu mọi quyền.
      </p>
    </div>
  );
}
