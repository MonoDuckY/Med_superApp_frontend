import { useState, useRef, useEffect } from "react";
import { fetchWithAuth } from "@/lib/auth";

function Ico({ d, cls = "", style }: { d: string | string[]; cls?: string; style?: React.CSSProperties }) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}

const ic = {
  plus:        "M12 5v14M5 12h14",
  search:      "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  logout:      "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  heart:       "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  thermo:      ["M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"],
  ruler:       "M2 12h6M6 9l3 3-3 3M22 12h-6M18 9l-3 3 3 3M12 2v4M12 22v-4",
  activity:    "M22 12h-4l-3 9L9 3l-3 9H2",
  check:       "M20 6 9 17l-5-5",
  checkCircle: ["M22 11.08V12a10 10 0 1 1-5.93-9.14", "m9 11 3 3L22 4"],
  x:           "M18 6 6 18M6 6l12 12",
  xCircle:     ["M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z", "M15 9l-6 6M9 9l6 6"],
  sparkle:     ["M12 3l1.9 5.8H19l-4.9 3.6 1.9 5.8L12 15l-4.9 3.2 1.9-5.8L4 9h5.1z"],
  trash:       ["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"],
  pill:        "M10.5 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7.5M16 20h6M19 17v6",
  chevRight:   "m9 18 6-6-6-6",
  chevDown:    "m6 9 6 6 6-6",
  lock:        ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 10 0v4"],
  fileCheck:   ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "m9 15 2 2 4-4"],
  alertTri:    ["M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4M12 17h.01"],
  loader:      "M21 12a9 9 0 1 1-6.219-8.56",
  scan:        ["M3 7V5a2 2 0 0 1 2-2h2", "M17 3h2a2 2 0 0 1 2 2v2", "M21 17v2a2 2 0 0 1-2 2h-2", "M7 21H5a2 2 0 0 1-2-2v-2"],
}

function UltrasoundViewer({ locked }: { locked: boolean }) {
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: "#0A0A0A", aspectRatio: "4/3" }}>
      <svg viewBox="0 0 400 300" className="w-full h-full" style={{ display: "block" }}>
        <defs>
          <radialGradient id="usGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1a4060" />
            <stop offset="60%" stopColor="#0a1520" />
            <stop offset="100%" stopColor="#050a0f" />
          </radialGradient>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="screen" result="blend" />
            <feComponentTransfer in="blend">
              <feFuncA type="linear" slope="0.18" />
            </feComponentTransfer>
          </filter>
          <radialGradient id="organGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#3a7ab8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1a3a5c" stopOpacity="0.2" />
          </radialGradient>
          <radialGradient id="lesionGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e8a02a" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#b06010" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        <rect width="400" height="300" fill="url(#usGlow)" />
        <path d="M200 20 Q50 80 30 260 Q200 290 370 260 Q350 80 200 20 Z" fill="#0d2035" opacity="0.9" />
        <rect width="400" height="300" filter="url(#noise)" opacity="0.4" fill="#4a9ad4" />
        <ellipse cx="200" cy="155" rx="110" ry="75" fill="url(#organGrad)" />
        <ellipse cx="200" cy="155" rx="108" ry="73" fill="none" stroke="#3a7ab8" strokeWidth="0.8" opacity="0.5" />

        {[0,1,2,3,4].map(i => (
          <ellipse key={i} cx={160 + i * 20} cy={140 + (i % 2) * 24} rx={18 - i * 1.5} ry={12 - i}
            fill="none" stroke="#5a9acd" strokeWidth="0.5" opacity={0.3 - i * 0.04} />
        ))}

        <ellipse cx="235" cy="148" rx="22" ry="16" fill="url(#lesionGrad)" />
        <ellipse cx="235" cy="148" rx="21" ry="15" fill="none" stroke="#f0b040" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />

        {Array.from({ length: 18 }).map((_, i) => (
          <line key={i} x1={30 + i * 19} y1="20" x2={20 + i * 20} y2="270"
            stroke="#4a9ad4" strokeWidth="0.3" opacity={0.08 + (i % 3) * 0.04} />
        ))}

        {[1,2,3,4,5].map(d => (
          <g key={d}>
            <line x1="18" y1={40 + d * 44} x2="28" y2={40 + d * 44} stroke="#3a7ab8" strokeWidth="0.8" opacity="0.6" />
            <text x="6" y={44 + d * 44} fontSize="7" fill="#5a9acd" fontFamily="monospace" opacity="0.7">{d}cm</text>
          </g>
        ))}

        <rect x="0" y="0" width="400" height="18" fill="black" opacity="0.4" />
        <text x="8" y="12" fontSize="7" fill="#5ab4d4" fontFamily="monospace">BN-9856 · Tạ Hoàng Minh · 32T</text>
        <text x="300" y="12" fontSize="7" fill="#5ab4d4" fontFamily="monospace">11/08/2026 09:15</text>

        <line x1="214" y1="148" x2="255" y2="148" stroke="#f0b040" strokeWidth="0.9" opacity="0.9" strokeDasharray="2 2" />
        <text x="220" y="143" fontSize="7" fill="#f0c060" fontFamily="monospace">⌀ 2.4cm</text>
      </svg>

      <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
        <Ico d={ic.scan} cls="w-3.5 h-3.5" style={{ color: "#5ab4d4" }} />
        <span className="text-xs font-mono" style={{ color: "#5ab4d4", fontSize: 10 }}>SIÊU ÂM GAN</span>
      </div>

      {locked && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(1px)" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(0,0,0,0.6)" }}>
            <Ico d={ic.lock} cls="w-4 h-4" style={{ color: "#94A3B8" }} />
            <span className="text-xs text-[#94A3B8]">Hồ sơ đã khóa</span>
          </div>
        </div>
      )}
    </div>
  )
}

function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#E2E8F0] rounded-xl overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-3.5 font-bold text-sm border-b border-[#F1F5F9] text-[#0F172A]">
          {title}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold mb-1.5 text-[#0F172A]">
      {children}{required && <span className="ml-0.5 text-[#EF4444]">*</span>}
    </label>
  )
}

function TA({
  placeholder, rows = 3, value, onChange, locked
}: {
  placeholder: string; rows?: number; value: string
  onChange: (v: string) => void; locked: boolean
}) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      readOnly={locked}
      onChange={e => onChange(e.target.value)}
      className="w-full p-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300 transition-all resize-none leading-relaxed text-[#0F172A]"
      style={{ background: locked ? "#FAFAFA" : "white" }}
    />
  )
}

function QueueSidebar({ 
  activeId, 
  setActiveId, 
  qSearch, 
  setQSearch, 
  appointments 
}: {
  activeId: string | null; 
  setActiveId: (id: string) => void;
  qSearch: string; 
  setQSearch: (s: string) => void;
  appointments: any[];
}) {
  const filtered = appointments.filter(a => {
    const patientName = a.patient?.fullName || "Bác sĩ";
    const patientId = a.patientId || "";
    return !qSearch || patientName.toLowerCase().includes(qSearch.toLowerCase()) || patientId.includes(qSearch);
  });

  return (
    <div className="flex flex-col h-full bg-white border border-[#E2E8F0] rounded-xl overflow-hidden text-left">
      <div className="px-4 py-3.5 font-bold text-sm border-b border-[#F1F5F9] text-[#0F172A] flex justify-between items-center">
        <span>Hàng chờ khám</span>
        <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB]">
          {filtered.length}
        </span>
      </div>

      <div className="px-3 py-2.5 border-b border-[#F1F5F9]">
        <div className="relative">
          <Ico d={ic.search} cls="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
          <input
            value={qSearch}
            onChange={e => setQSearch(e.target.value)}
            placeholder="Tìm bệnh nhân..."
            className="w-full h-8 pl-8 pr-2 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300 transition-all bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(a => {
          const isActive = a.id === activeId;
          const patientName = a.patient?.fullName || "Bác sĩ";
          const patientId = a.patientId || "";
          
          let statusBg = "rgba(148,163,184,0.1)";
          let statusText = "#64748B";
          let statusLabel = "Chờ khám";

          if (a.status === "IN_PROGRESS") {
            statusBg = "rgba(245,158,11,0.1)";
            statusText = "#D97706";
            statusLabel = "Đang khám";
          } else if (a.status === "COMPLETED") {
            statusBg = "rgba(16,185,129,0.1)";
            statusText = "#059669";
            statusLabel = "Đã khám";
          } else if (a.status === "CANCELLED") {
            statusBg = "rgba(239,68,68,0.1)";
            statusText = "#DC2626";
            statusLabel = "Đã hủy";
          } else if (a.status === "NO_SHOW") {
            statusBg = "rgba(100,116,139,0.1)";
            statusText = "#475569";
            statusLabel = "Quá hạn";
          }

          return (
            <button
              key={a.id}
              onClick={() => setActiveId(a.id)}
              className="w-full text-left px-4 py-3.5 transition-colors cursor-pointer border-none bg-transparent border-b border-[#F8FAFC] hover:bg-[#F8FAFC]"
              style={isActive ? { borderLeft: "3px solid #0284C7", background: "#EFF6FF", paddingLeft: 13 } : {}}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: isActive ? "#0284C7" : "#94A3B8", fontSize: 10 }}>
                  {patientName.split(" ").slice(-2).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: isActive ? "#0284C7" : "#0F172A" }}>{patientName}</p>
                  <p className="text-[10px] font-mono truncate text-slate-400">#{patientId.slice(0, 8)}...</p>
                </div>
              </div>
              <div className="mt-1.5 ml-10">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                  style={{ background: statusBg, color: statusText }}>
                  {statusLabel}
                </span>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-8">Không tìm thấy ca khám nào.</p>
        )}
      </div>
    </div>
  );
}

type Drug = { name: string; dose: string; instruction: string; days: string }

const DRUG_SUGGESTIONS = [
  "Paracetamol 500mg", "Amoxicillin 500mg", "Ibuprofen 400mg",
  "Omeprazole 20mg", "Metformin 500mg", "Atorvastatin 10mg",
  "Ciprofloxacin 500mg", "Cetirizine 10mg",
]

function PrescriptionTab({ drugs, setDrugs, locked }: {
  drugs: Drug[]; setDrugs: React.Dispatch<React.SetStateAction<Drug[]>>; locked: boolean
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [drugSearch, setDrugSearch] = useState("")
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowAdd(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  function addDrug(name: string) {
    setDrugs(prev => [...prev, { name, dose: "2 viên/ngày", instruction: "Uống sau khi ăn no", days: "5 ngày" }])
    setShowAdd(false); setDrugSearch("")
  }

  function removeDrug(i: number) {
    setDrugs(prev => prev.filter((_, idx) => idx !== i))
  }

  const suggestions = DRUG_SUGGESTIONS.filter(d =>
    !drugSearch || d.toLowerCase().includes(drugSearch.toLowerCase()))

  return (
    <div className="flex flex-col gap-3">
      {drugs.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-300">Chưa có thuốc nào trong đơn.</div>
      ) : (
        <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E2E8F0]">
                {["Tên thuốc", "Liều lượng", "Cách dùng", "Ngày", ""].map(h => (
                  <th key={h} className="text-left text-xs font-bold px-3 py-2 text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {drugs.map((d, i) => (
                <tr key={i} className="group hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-3 py-2.5 text-xs font-semibold text-[#0F172A]">{d.name}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{d.dose}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{d.instruction}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{d.days}</td>
                  <td className="px-3 py-2.5 text-right">
                    {!locked && (
                      <button onClick={() => removeDrug(i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none bg-transparent text-[#EF4444]">
                        <Ico d={ic.trash} cls="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!locked && (
        <div className="relative" ref={dropRef}>
          <button
            type="button"
            onClick={() => setShowAdd(s => !s)}
            className="w-full flex items-center justify-center gap-2 h-8 text-xs font-semibold border border-dashed border-[#CBD5E1] rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer text-slate-500 bg-transparent"
          >
            <Ico d={ic.plus} cls="w-3.5 h-3.5" />
            Thêm thuốc vào đơn
          </button>

          {showAdd && (
            <div className="absolute bottom-10 left-0 right-0 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-20 overflow-hidden">
              <div className="p-2 border-b border-[#F1F5F9]">
                <div className="relative">
                  <Ico d={ic.search} cls="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                  <input
                    autoFocus
                    value={drugSearch}
                    onChange={e => setDrugSearch(e.target.value)}
                    placeholder="Tìm tên thuốc..."
                    className="w-full h-8 pl-8 pr-2 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-400 transition-all bg-white"
                  />
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {suggestions.map(s => (
                  <button key={s} onClick={() => addDrug(s)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#EFF6FF] transition-colors cursor-pointer border-none bg-transparent text-[#0F172A]">
                    {s}
                  </button>
                ))}
                {suggestions.length === 0 && (
                  <p className="px-3 py-3 text-xs text-center text-slate-300">Không tìm thấy thuốc.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AITab({ 
  locked, 
  images, 
  onUploadImage, 
  onDeleteImage, 
  uploadingImage 
}: { 
  locked: boolean; 
  images: any[]; 
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  onDeleteImage: (id: string) => void;
  uploadingImage: boolean;
}) {
  const [aiState, setAiState] = useState<"idle" | "loading" | "result" | "approved" | "rejected">("idle")

  function runAI() {
    setAiState("loading")
    setTimeout(() => setAiState("result"), 2200)
  }

  return (
    <div className="flex flex-col gap-3">
      <UltrasoundViewer locked={locked} />

      {!locked && (
        <>
          {(aiState === "idle" || aiState === "loading") && (
            <button
              onClick={runAI}
              disabled={aiState === "loading"}
              className="w-full flex items-center justify-center gap-2 h-9 text-xs font-bold text-white rounded-lg transition-all cursor-pointer disabled:opacity-70 border-none outline-none"
              style={{ background: "#0D9488", boxShadow: aiState === "idle" ? "0 4px 12px rgba(13,148,136,0.3)" : "none" }}
            >
              {aiState === "loading"
                ? <><Ico d={ic.loader} cls="w-4 h-4 animate-spin" />Đang phân tích...</>
                : <><Ico d={ic.sparkle} cls="w-4 h-4" />Phân tích bằng AI</>}
            </button>
          )}

          {(aiState === "result" || aiState === "approved" || aiState === "rejected") && (
            <div className="rounded-xl p-4 border text-left bg-[#F0FDF4] border-[#BBF7D0]">
              <div className="flex items-start gap-2.5 mb-3">
                <Ico d={ic.sparkle} cls="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#0D9488" }} />
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#0F172A]">Kết quả phân tích AI</p>
                  <p className="text-xs mt-0.5 text-slate-500">Phát hiện vùng tổn thương gan</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#0D9488]/10 text-[#0D9488]">
                  94% tin cậy
                </span>
              </div>

              <div className="h-1.5 rounded-full mb-3 bg-[#D1FAE5]">
                <div className="h-full rounded-full transition-all bg-[#0D9488]" style={{ width: "94%" }} />
              </div>

              {aiState === "result" && (
                <div className="flex gap-2">
                  <button onClick={() => setAiState("approved")}
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-bold rounded-lg transition-colors cursor-pointer border-none bg-[#10B981]/10 text-[#047857]">
                    <Ico d={ic.checkCircle} cls="w-3.5 h-3.5" />Duyệt kết quả
                  </button>
                  <button onClick={() => setAiState("rejected")}
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-bold border border-[#FCA5A5] rounded-lg transition-colors cursor-pointer bg-white text-[#B91C1C]">
                    <Ico d={ic.xCircle} cls="w-3.5 h-3.5" />Từ chối
                  </button>
                </div>
              )}

              {aiState === "approved" && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#047857]">
                  <Ico d={ic.checkCircle} cls="w-4 h-4" />
                  Kết quả AI đã được duyệt và ghi nhận vào hồ sơ.
                </div>
              )}
              {aiState === "rejected" && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#B91C1C]">
                  <Ico d={ic.xCircle} cls="w-4 h-4" />
                  Kết quả AI đã bị từ chối. Bác sĩ sẽ tự chẩn đoán.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Medical Images Section */}
      <div className="mt-4 border-t border-[#E2E8F0] pt-4 text-left">
        <h4 className="text-xs font-bold text-[#0F172A] mb-2.5">Hình ảnh bệnh án đã tải lên</h4>
        
        {!locked && (
          <label className="flex items-center justify-center gap-2 h-9 text-xs font-bold border border-dashed border-[#CBD5E1] rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer text-slate-500 bg-white">
            <Ico d={ic.plus} cls="w-4 h-4" />
            {uploadingImage ? "Đang tải lên..." : "Tải lên hình ảnh y khoa"}
            <input 
              type="file" 
              onChange={onUploadImage} 
              disabled={uploadingImage} 
              className="hidden" 
              accept="image/*" 
            />
          </label>
        )}

        <div className="grid grid-cols-3 gap-2 mt-3">
          {images.map((img: any) => (
            <div key={img.imageId} className="relative group">
              <img 
                src={img.url} 
                alt="Medical Record" 
                className="w-full h-16 object-cover rounded-lg border border-[#E2E8F0]" 
              />
              {!locked && (
                <button
                  type="button"
                  onClick={() => onDeleteImage(img.imageId)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white cursor-pointer border-none shadow transition-opacity opacity-0 group-hover:opacity-100"
                >
                  <Ico d={ic.x} cls="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        {images.length === 0 && (
          <p className="text-[10px] text-slate-400 italic text-center py-2">Chưa có hình ảnh nào được tải lên.</p>
        )}
      </div>
    </div>
  )
}

function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ width: 420 }}>
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4 text-left">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#0284C7]/10">
              <Ico d={ic.lock} cls="w-5 h-5 text-[#0284C7]" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#0F172A]">Xác nhận hoàn thành ca khám</p>
              <p className="text-xs mt-1.5 leading-relaxed text-slate-500">
                Hồ sơ sau khi hoàn thành sẽ khóa ở chế độ{" "}
                <strong className="text-[#0F172A]">Chỉ đọc</strong>{" "}
                và không thể sửa đổi. Vui lòng kiểm tra lại toàn bộ thông tin trước khi xác nhận.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg flex items-start gap-2.5 bg-[#FFF7ED] border border-[#FED7AA] text-left">
            <Ico d={ic.alertTri} cls="w-4 h-4 shrink-0 mt-0.5 text-[#F59E0B]" />
            <p className="text-xs text-[#92400E]">
              Thao tác này không thể hoàn tác. Đảm bảo đơn thuốc và chẩn đoán đã đầy đủ.
            </p>
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-[#F1F5F9]">
          <button onClick={onCancel}
            className="flex-1 h-9 text-sm font-medium border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-slate-500 bg-white">
            Kiểm tra lại
          </button>
          <button onClick={onConfirm}
            className="flex-1 h-9 text-sm font-bold text-white rounded-lg transition-opacity hover:opacity-90 cursor-pointer border-none"
            style={{ background: "#0284C7", boxShadow: "0 4px 10px rgba(2,132,199,0.25)" }}>
            Xác nhận &amp; Khóa hồ sơ
          </button>
        </div>
      </div>
    </div>
  )
}

interface MedicalWorkspaceProps {
  onBackToSchedule: () => void;
}

export default function MedicalWorkspace({ onBackToSchedule }: MedicalWorkspaceProps) {
  // Page state
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null);
  const [activeExam, setActiveExam] = useState<any | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [showConfirm, setShowConfirm] = useState(false)
  const [qSearch, setQSearch]       = useState("")
  const [rightTab, setRightTab]     = useState<"ai" | "rx">("ai")

  // Form fields
  const [symptoms, setSymptoms]     = useState("")
  const [examResult, setExamResult] = useState("")
  const [diagnosis, setDiagnosis]   = useState("")
  const [treatment, setTreatment]   = useState("")
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
  const [drugs, setDrugs]           = useState<Drug[]>([])

  // Vitals
  const [bloodPressure, setBloodPressure] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [breathingRate, setBreathingRate] = useState("");
  const [bodyTemperature, setBodyTemperature] = useState("");
  const [bloodLipids, setBloodLipids] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodType, setBloodType] = useState("");

  const patient = activeExam?.patient || {};
  const record = activeExam?.medicalRecord || {};
  const apt = activeExam?.appointment || {};
  const images = record?.medicalImages || [];

  const locked = apt?.status === "COMPLETED" || apt?.status === "CANCELLED" || apt?.status === "NO_SHOW";

  const fetchAppointmentsList = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/appointments`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const list = result.data || [];
          setAppointments(list);
          
          if (list.length > 0 && !activeAppointmentId) {
            const firstApt = list.find((a: any) => a.status === "IN_PROGRESS") || list.find((a: any) => a.status === "CONFIRMED") || list[0];
            setActiveAppointmentId(firstApt.id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch doctor appointments:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchExaminationDetails = async (aptId: string) => {
    setLoadingDetails(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${aptId}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const exam = result.data;
          setActiveExam(exam);
          
          if (exam.appointment?.status === "CONFIRMED") {
            await startExaminationCall(aptId);
          } else {
            populateFormFields(exam);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch examination details:", e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const startExaminationCall = async (aptId: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${aptId}/start`, {
        method: "PATCH"
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setActiveExam(result.data);
          populateFormFields(result.data);
          fetchAppointmentsList();
        }
      }
    } catch (e) {
      console.error("Failed to start examination:", e);
    }
  };

  const populateFormFields = (exam: any) => {
    const r = exam.medicalRecord || {};
    const p = exam.patient || {};
    const firstRx = (exam.prescriptions && exam.prescriptions[0]) || {};

    setSymptoms(p.currentSickness || "");
    setExamResult(r.note || "");
    setDiagnosis(r.diagnosis || "");
    setTreatment(firstRx.content || "");
    
    // Vitals
    setBloodPressure(r.bloodPressure || "");
    setHeartRate(r.heartRate ? String(r.heartRate) : "");
    setBreathingRate(r.breathingRate ? String(r.breathingRate) : "");
    setBodyTemperature(r.bodyTemperature ? String(r.bodyTemperature) : "");
    setBloodLipids(r.bloodLipids ? String(r.bloodLipids) : "");
    setHeight(p.height ? String(p.height) : "");
    setWeight(p.weight ? String(p.weight) : "");
    setBloodType(p.bloodType || "");
    
    setPrescriptionId(firstRx.id || null);

    if (firstRx.medicineSchedules) {
      const mappedDrugs = firstRx.medicineSchedules.map((s: any) => ({
        name: s.medicineName,
        dose: s.dosage,
        instruction: s.note || "",
        days: "5 ngày"
      }));
      setDrugs(mappedDrugs);
    } else {
      setDrugs([]);
    }
  };

  useEffect(() => {
    fetchAppointmentsList();
  }, []);

  useEffect(() => {
    if (activeAppointmentId) {
      fetchExaminationDetails(activeAppointmentId);
    }
  }, [activeAppointmentId]);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeAppointmentId) return;
    
    setUploadingImage(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/medical-images`, {
        method: "POST",
        body: formData
      });
      
      if (res.ok) {
        alert("Tải lên hình ảnh thành công!");
        fetchExaminationDetails(activeAppointmentId);
      } else {
        const result = await res.json();
        alert(result.message || "Tải lên hình ảnh thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi tải ảnh.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!activeAppointmentId || !confirm("Bạn có chắc muốn xóa ảnh này?")) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/medical-images/${imageId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Xóa hình ảnh thành công!");
        fetchExaminationDetails(activeAppointmentId);
      } else {
        alert("Xóa hình ảnh thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi xóa ảnh.");
    }
  };

  const handleSaveDraft = async () => {
    if (!activeAppointmentId) return;
    setSaving(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      // 1. Save clinical info
      const clinicalPayload = {
        currentSickness: symptoms,
        note: examResult,
        bloodPressure: bloodPressure || null,
        heartRate: heartRate ? parseInt(heartRate, 10) : null,
        breathingRate: breathingRate ? parseInt(breathingRate, 10) : null,
        bodyTemperature: bodyTemperature ? parseFloat(bodyTemperature) : null,
        bloodLipids: bloodLipids ? parseFloat(bloodLipids) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        bloodType: bloodType || null
      };

      const clinicalRes = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/clinical-information`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clinicalPayload)
      });

      if (!clinicalRes.ok) {
        throw new Error("Lưu thông tin lâm sàng thất bại.");
      }

      // 2. Save diagnosis
      if (diagnosis.trim()) {
        const diagRes = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/diagnosis`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ diagnosis: diagnosis.trim() })
        });
        if (!diagRes.ok) {
          throw new Error("Lưu chẩn đoán lâm sàng thất bại.");
        }
      }

      // 3. Save prescription
      if (treatment.trim() || drugs.length > 0) {
        const prescriptionPayload = {
          content: treatment.trim(),
          medicineSchedules: drugs.map(d => ({
            medicineName: d.name,
            dosage: d.dose,
            scheduledAt: new Date().toISOString(),
            note: d.instruction
          }))
        };

        const rxMethod = prescriptionId ? "PATCH" : "POST";
        const rxUrl = prescriptionId 
          ? `${apiUrl}/api/doctor/appointments/${activeAppointmentId}/prescription`
          : `${apiUrl}/api/doctor/appointments/${activeAppointmentId}/prescriptions`;

        const rxRes = await fetchWithAuth(rxUrl, {
          method: rxMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prescriptionPayload)
        });

        if (rxRes.ok) {
          const rxResult = await rxRes.json();
          if (rxResult.success && rxResult.data) {
            setPrescriptionId(rxResult.data.id);
          }
        } else {
          throw new Error("Lưu đơn thuốc thất bại.");
        }
      }

      alert("Lưu nháp thành công!");
      fetchExaminationDetails(activeAppointmentId);
    } catch (err: any) {
      alert(err.message || "Lỗi lưu nháp.");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setShowConfirm(false);
    if (!activeAppointmentId) return;
    setSaving(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    try {
      // 1. Save clinical info
      const clinicalPayload = {
        currentSickness: symptoms,
        note: examResult,
        bloodPressure: bloodPressure || null,
        heartRate: heartRate ? parseInt(heartRate, 10) : null,
        breathingRate: breathingRate ? parseInt(breathingRate, 10) : null,
        bodyTemperature: bodyTemperature ? parseFloat(bodyTemperature) : null,
        bloodLipids: bloodLipids ? parseFloat(bloodLipids) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        bloodType: bloodType || null
      };

      await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/clinical-information`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clinicalPayload)
      });

      // 2. Diagnosis is required to complete examination
      if (!diagnosis.trim()) {
        alert("Chẩn đoán lâm sàng là bắt buộc để hoàn thành ca khám!");
        setSaving(false);
        return;
      }

      await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/diagnosis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosis: diagnosis.trim() })
      });

      // 3. Save prescription
      if (treatment.trim() || drugs.length > 0) {
        const prescriptionPayload = {
          content: treatment.trim(),
          medicineSchedules: drugs.map(d => ({
            medicineName: d.name,
            dosage: d.dose,
            scheduledAt: new Date().toISOString(),
            note: d.instruction
          }))
        };

        const rxMethod = prescriptionId ? "PATCH" : "POST";
        const rxUrl = prescriptionId 
          ? `${apiUrl}/api/doctor/appointments/${activeAppointmentId}/prescription`
          : `${apiUrl}/api/doctor/appointments/${activeAppointmentId}/prescriptions`;

        const rxRes = await fetchWithAuth(rxUrl, {
          method: rxMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prescriptionPayload)
        });

        if (rxRes.ok) {
          const rxResult = await rxRes.json();
          if (rxResult.success && rxResult.data) {
            setPrescriptionId(rxResult.data.id);
          }
        }
      }

      // 4. Complete
      const completeRes = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/complete`, {
        method: "PATCH"
      });

      if (completeRes.ok) {
        alert("Hoàn thành ca khám thành công! Bệnh án đã được khóa.");
        fetchAppointmentsList();
        fetchExaminationDetails(activeAppointmentId);
      } else {
        const result = await completeRes.json();
        alert(result.message || "Hoàn thành ca khám thất bại.");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "BN";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} tuổi`;
  };

  const translateGender = (g: string) => {
    if (g === "Male") return "Nam";
    if (g === "Female") return "Nữ";
    return "Khác";
  };


  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[400px]">
        <svg className="animate-spin h-8 w-8 text-[#0EA5E9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-400 text-xs font-medium">Đang tải danh sách ca khám bệnh...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full bg-[#F8FAFC] pb-4">
      {showConfirm && <ConfirmModal onConfirm={handleComplete} onCancel={() => setShowConfirm(false)} />}

      {/* ── Patient strip ── */}
      {activeAppointmentId && activeExam && (
        <div className="px-6 pt-4 pb-3 shrink-0">
          <div className="flex items-center justify-between px-5 py-4 rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            {/* Left: identity */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white shrink-0 bg-[#0284C7] text-[14px]">
                {getInitials(patient.fullName)}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-[#0F172A]">{patient.fullName || "N/A"}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    apt.status === "IN_PROGRESS" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                    apt.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                    "bg-[#0284C7]/10 text-[#0284C7]"
                  }`}>
                    {apt.status === "IN_PROGRESS" ? "Đang khám" :
                     apt.status === "COMPLETED" ? "Đã khám" :
                     apt.status === "CANCELLED" ? "Đã hủy" :
                     apt.status === "NO_SHOW" ? "Quá hạn" : apt.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs text-slate-500">
                    {calculateAge(patient.dateOfBirth)} · {translateGender(patient.gender)}
                  </p>
                  <span className="text-xs font-mono font-medium text-slate-400">#{patient.id ? patient.id.slice(0, 8) : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Right: vitals */}
            <div className="flex items-center gap-6 border-l border-[#F1F5F9] pl-6">
              <div className="flex items-center gap-2 text-left">
                <Ico d={ic.heart} cls="w-4 h-4 text-[#EF4444]" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Huyết áp</p>
                  <p className="text-xs font-bold text-[#0F172A]">{bloodPressure || "N/A"} <span className="font-normal text-slate-400">mmHg</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-left">
                <Ico d={ic.thermo} cls="w-4 h-4 text-[#F59E0B]" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Nhiệt độ</p>
                  <p className="text-xs font-bold text-[#0F172A]">{bodyTemperature || "N/A"} <span className="font-normal text-slate-400">°C</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-left">
                <Ico d={ic.activity} cls="w-4 h-4 text-[#0284C7]" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Chiều cao / Cân nặng</p>
                  <p className="text-xs font-bold text-[#0F172A]">
                    {height && weight ? `${height} cm / ${weight} kg` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Three-column body ── */}
      <div className="flex-1 overflow-hidden px-6 pb-0 flex gap-4">
        {/* Left queue — 23% */}
        <div className="flex flex-col overflow-hidden w-[23%]">
          <QueueSidebar
            activeId={activeAppointmentId}
            setActiveId={setActiveAppointmentId}
            qSearch={qSearch}
            setQSearch={setQSearch}
            appointments={appointments}
          />
        </div>

        {/* Middle clinical */}
        <div className="flex flex-col gap-4 overflow-y-auto pb-4 flex-1">
          {loadingDetails ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-[#E2E8F0] min-h-[300px]">
              <svg className="animate-spin h-6 w-6 text-[#0EA5E9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-slate-400 text-xs font-medium">Đang đồng bộ hồ sơ bệnh án...</p>
            </div>
          ) : activeAppointmentId && activeExam ? (
            <>
              <Card title="Khám lâm sàng">
                <div className="flex flex-col gap-4">
                  {/* Vitals Input Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-[#F1F5F9] pb-4 text-left">
                    <div>
                      <Label>Huyết áp (mmHg)</Label>
                      <input
                        type="text"
                        value={bloodPressure}
                        disabled={locked}
                        onChange={e => setBloodPressure(e.target.value)}
                        placeholder="120/80"
                        className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-[#0F172A] bg-white transition-all font-medium disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label>Nhiệt độ (°C)</Label>
                      <input
                        type="text"
                        value={bodyTemperature}
                        disabled={locked}
                        onChange={e => setBodyTemperature(e.target.value)}
                        placeholder="36.8"
                        className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-[#0F172A] bg-white transition-all font-medium disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label>Nhịp tim (l/p)</Label>
                      <input
                        type="text"
                        value={heartRate}
                        disabled={locked}
                        onChange={e => setHeartRate(e.target.value)}
                        placeholder="80"
                        className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-[#0F172A] bg-white transition-all font-medium disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label>Nhịp thở (l/p)</Label>
                      <input
                        type="text"
                        value={breathingRate}
                        disabled={locked}
                        onChange={e => setBreathingRate(e.target.value)}
                        placeholder="18"
                        className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-[#0F172A] bg-white transition-all font-medium disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label>Chiều cao (cm)</Label>
                      <input
                        type="text"
                        value={height}
                        disabled={locked}
                        onChange={e => setHeight(e.target.value)}
                        placeholder="172"
                        className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-[#0F172A] bg-white transition-all font-medium disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label>Cân nặng (kg)</Label>
                      <input
                        type="text"
                        value={weight}
                        disabled={locked}
                        onChange={e => setWeight(e.target.value)}
                        placeholder="68"
                        className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-[#0F172A] bg-white transition-all font-medium disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label>Nhóm máu</Label>
                      <input
                        type="text"
                        value={bloodType}
                        disabled={locked}
                        onChange={e => setBloodType(e.target.value)}
                        placeholder="O+"
                        className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-[#0F172A] bg-white transition-all font-medium disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label>Mỡ máu (mmol/L)</Label>
                      <input
                        type="text"
                        value={bloodLipids}
                        disabled={locked}
                        onChange={e => setBloodLipids(e.target.value)}
                        placeholder="5.2"
                        className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-[#0F172A] bg-white transition-all font-medium disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <Label>Triệu chứng lâm sàng (Long-term Current Sickness)</Label>
                    <TA placeholder="Nhập triệu chứng lâm sàng của bệnh nhân..." value={symptoms} onChange={setSymptoms} locked={locked} />
                  </div>
                  <div className="text-left">
                    <Label>Kết quả khám lâm sàng (Findings / Medical Record Note)</Label>
                    <TA placeholder="Nhập kết quả khám chi tiết..." value={examResult} onChange={setExamResult} locked={locked} />
                  </div>
                </div>
              </Card>

              <Card title="Chẩn đoán &amp; Điều trị">
                <div className="flex flex-col gap-4">
                  <div className="text-left">
                    <Label required>Chẩn đoán lâm sàng (Diagnosis)</Label>
                    <TA placeholder="Nhập chẩn đoán y khoa chính xác..." value={diagnosis} onChange={setDiagnosis} locked={locked} />
                  </div>
                  <div className="text-left">
                    <Label>Kế hoạch điều trị &amp; Lời khuyên (Prescription Advice Content)</Label>
                    <TA placeholder="Ghi chú về chế độ ăn uống, sinh hoạt, lịch tái khám..." rows={3} value={treatment} onChange={setTreatment} locked={locked} />
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-[#E2E8F0] p-10 min-h-[300px]">
              <p className="text-sm font-semibold">Chưa chọn ca khám</p>
              <p className="text-xs text-slate-400 mt-1">Vui lòng chọn một bệnh nhân ở hàng chờ khám bên trái.</p>
            </div>
          )}
        </div>

        {/* Right AI + Rx — 29% */}
        <div className="flex flex-col overflow-y-auto pb-4 w-[29%]">
          {activeAppointmentId && activeExam && !loadingDetails ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-[#E2E8F0]">
                {([["ai", "Hình ảnh & AI"], ["rx", "Đơn thuốc"]] as const).map(([key, label]) => {
                  const active = rightTab === key
                  return (
                    <button key={key} onClick={() => setRightTab(key)}
                      className="flex-1 py-3 text-xs font-semibold transition-colors cursor-pointer relative border-none bg-transparent outline-none"
                      style={{ color: active ? "#0284C7" : "#64748B" }}>
                      {label}
                      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-[#0284C7]" />}
                    </button>
                  )
                })}
              </div>

              <div className="p-4 flex-1">
                {rightTab === "ai"
                  ? <AITab 
                      locked={locked} 
                      images={images}
                      onUploadImage={handleUploadImage}
                      onDeleteImage={handleDeleteImage}
                      uploadingImage={uploadingImage}
                    />
                  : <PrescriptionTab drugs={drugs} setDrugs={setDrugs} locked={locked} />}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 text-center text-slate-400 text-xs min-h-[150px] flex items-center justify-center">
              Hình ảnh &amp; Đơn thuốc sẽ hiển thị sau khi chọn ca khám.
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky footer ── */}
      {activeAppointmentId && activeExam && !loadingDetails && (
        <footer className="bg-white border-t border-[#E2E8F0] px-6 py-3 flex items-center justify-between shrink-0 mt-4 mx-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: locked ? "#94A3B8" : "#F59E0B" }} />
            <span className="text-xs font-medium text-slate-500">Trạng thái ca khám:</span>
            <span className="text-xs font-bold" style={{ color: locked ? "#94A3B8" : "#F59E0B" }}>
              {locked ? "Đã hoàn thành — Chỉ đọc" : "Đang khám (In Progress)"}
            </span>
          </div>

          {!locked && (
            <div className="flex items-center gap-2">
              <button
                disabled={saving}
                onClick={handleSaveDraft}
                className="h-9 px-4 text-xs font-semibold border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-slate-500 bg-white disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu nháp"}
              </button>
              <button
                disabled={saving}
                onClick={() => setShowConfirm(true)}
                className="h-9 px-5 text-xs font-bold text-white rounded-lg transition-opacity hover:opacity-90 cursor-pointer flex items-center gap-2 border-none disabled:opacity-50"
                style={{ background: "#0284C7", boxShadow: "0 4px 10px rgba(2,132,199,0.25)" }}>
                <Ico d={ic.fileCheck} cls="w-4 h-4" />
                {saving ? "Đang xử lý..." : "Hoàn thành ca khám"}
              </button>
            </div>
          )}

          {locked && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <Ico d={ic.lock} cls="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">Hồ sơ đã khóa — Chỉ đọc</span>
            </div>
          )}
        </footer>
      )}
    </div>
  )
}
