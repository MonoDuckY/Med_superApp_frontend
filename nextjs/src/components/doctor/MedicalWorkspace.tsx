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
  plus:       "M12 5v14M5 12h14",
  search:     "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  logout:     "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  heart:      "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  thermo:     "M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z",
  activity:   "M22 12h-4l-3 9L9 3l-3 9H2",
  chevRight:  "m9 18 6-6-6-6",
  trash:      ["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"],
  lock:       ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 10 0v4"],
  fileCheck:  ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "m9 15 2 2 4-4"],
  alertTri:   ["M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4M12 17h.01"],
  upload:     ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  image:      ["M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z", "M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z", "M21 15l-5-5L5 21"],
  scan:       ["M3 7V5a2 2 0 0 1 2-2h2", "M17 3h2a2 2 0 0 1 2 2v2", "M21 17v2a2 2 0 0 1-2 2h-2", "M7 21H5a2 2 0 0 1-2-2v-2"],
  loader:     "M21 12a9 9 0 1 1-6.219-8.56",
  x:          "M18 6 6 18M6 6l12 12",
  calendar:   ["M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z", "M16 2v4", "M8 2v4", "M3 10h18"]
}

// ─── Date Formatter Helper ───────────────────────────────────────────────────
function formatDateTimeDDMMYYYY_HHMM(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${d}/${m}/${y} ${h}:${min}`
}

function parseDateTimeDDMMYYYY_HHMM(str: string): Date | null {
  const match = str.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/)
  if (!match) return null
  const day = parseInt(match[1], 10)
  const month = parseInt(match[2], 10) - 1
  const year = parseInt(match[3], 10)
  const hour = parseInt(match[4], 10)
  const minute = parseInt(match[5], 10)
  if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hour) || isNaN(minute)) return null
  
  if (day < 1 || day > 31) return null
  if (month < 0 || month > 11) return null
  if (year < 1900 || year > 2100) return null
  if (hour < 0 || hour > 23) return null
  if (minute < 0 || minute > 59) return null
  
  return new Date(year, month, day, hour, minute, 0)
}

function localToDatetimeValue(str: string): string {
  const parsed = parseDateTimeDDMMYYYY_HHMM(str)
  if (!parsed || isNaN(parsed.getTime())) return ""
  const offset = parsed.getTimezoneOffset() * 60000
  const localDate = new Date(parsed.getTime() - offset)
  return localDate.toISOString().slice(0, 16)
}

// ─── Ultrasound SVG scenes ────────────────────────────────────────────────────
function UsSvg({ variant, patientName = "Tạ Hoàng Minh" }: { variant: number; patientName?: string }) {
  const configs = [
    { organ: "GAN", cx: 200, cy: 155, rx: 110, ry: 75, lesX: 235, lesY: 148, lesRx: 22, lesRy: 16, lesColor: "#f0b040" },
    { organ: "THẬN", cx: 195, cy: 160, rx: 70, ry: 95, lesX: 210, lesY: 135, lesRx: 14, lesRy: 10, lesColor: "#7dd3fc" },
    { organ: "MẬT", cx: 200, cy: 150, rx: 55, ry: 65, lesX: 215, lesY: 142, lesRx: 10, lesRy: 8, lesColor: "#86efac" },
  ]
  const c = configs[variant % configs.length]

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" style={{ display: "block" }}>
      <defs>
        <radialGradient id={`bg${variant}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1a4060" />
          <stop offset="100%" stopColor="#050a0f" />
        </radialGradient>
        <radialGradient id={`org${variant}`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#3a7ab8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1a3a5c" stopOpacity="0.15" />
        </radialGradient>
        <radialGradient id={`les${variant}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.lesColor} stopOpacity="0.85" />
          <stop offset="100%" stopColor={c.lesColor} stopOpacity="0.2" />
        </radialGradient>
        <filter id={`ns${variant}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
          <feBlend in="SourceGraphic" in2="gray" mode="screen" result="blend" />
          <feComponentTransfer in="blend"><feFuncA type="linear" slope="0.15" /></feComponentTransfer>
        </filter>
      </defs>
      <rect width="400" height="300" fill={`url(#bg${variant})`} />
      <path d="M200 20 Q50 80 30 260 Q200 290 370 260 Q350 80 200 20 Z" fill="#0d2035" opacity="0.9" />
      <rect width="400" height="300" filter={`url(#ns${variant})`} opacity="0.35" fill="#4a9ad4" />
      <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill={`url(#org${variant})`} />
      <ellipse cx={c.cx} cy={c.cy} rx={c.rx - 2} ry={c.ry - 2} fill="none" stroke="#3a7ab8" strokeWidth="0.7" opacity="0.4" />
      <ellipse cx={c.lesX} cy={c.lesY} rx={c.lesRx} ry={c.lesRy} fill={`url(#les${variant})`} />
      <ellipse cx={c.lesX} cy={c.lesY} rx={c.lesRx - 1} ry={c.lesRy - 1} fill="none" stroke={c.lesColor} strokeWidth="1.1" strokeDasharray="3 2" opacity="0.8" />
      {Array.from({ length: 16 }).map((_, i) => (
        <line key={i} x1={30 + i * 21} y1="20" x2={20 + i * 22} y2="270" stroke="#4a9ad4" strokeWidth="0.3" opacity={0.07 + (i % 3) * 0.03} />
      ))}
      {[1, 2, 3, 4, 5].map(d => (
        <g key={d}>
          <line x1="18" y1={40 + d * 44} x2="28" y2={40 + d * 44} stroke="#3a7ab8" strokeWidth="0.8" opacity="0.6" />
          <text x="6" y={44 + d * 44} fontSize="7" fill="#5a9acd" fontFamily="monospace" opacity="0.7">{d}cm</text>
        </g>
      ))}
      <rect x="0" y="0" width="400" height="18" fill="black" opacity="0.4" />
      <text x="8" y="12" fontSize="7" fill="#5ab4d4" fontFamily="monospace">BN-9856 · {patientName}</text>
      <text x="310" y="12" fontSize="7" fill="#5ab4d4" fontFamily="monospace">11/08/2026</text>
      <text x="320" y="294" fontSize="7" fill="#5ab4d4" fontFamily="monospace" opacity="0.6">SIÊU ÂM {c.organ}</text>
    </svg>
  )
}

function Thumb({ variant, active, onClick }: { variant: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg overflow-hidden transition-all cursor-pointer shrink-0"
      style={{
        width: 72, height: 56,
        background: "#0A0A0A",
        border: active ? "2px solid #0284C7" : "2px solid transparent",
        boxShadow: active ? "0 0 0 1px rgba(2,132,199,0.3)" : "none",
      }}
    >
      <UsSvg variant={variant} />
    </button>
  )
}

function ImageTab({ 
  locked, 
  images, 
  onUploadImage, 
  onDeleteImage, 
  uploadingImage,
  patientName
}: { 
  locked: boolean; 
  images: any[]; 
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  onDeleteImage: (id: string) => void;
  uploadingImage: boolean;
  patientName?: string;
}) {
  const [activeImg, setActiveImg] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const combinedImages = [
    { type: "mock", variant: 0, label: "Gan", caption: "Siêu âm gan — Phát hiện vùng tổn thương 2.4cm", url: "" },
    { type: "mock", variant: 1, label: "Thận", caption: "Siêu âm thận — Theo dõi kết cấu nhu mô", url: "" },
    { type: "mock", variant: 2, label: "Mật", caption: "Siêu âm túi mật — Kiểm tra dịch mật", url: "" },
    ...images.map((img: any, idx: number) => ({
      type: "real",
      variant: idx + 3,
      label: `Ảnh #${idx + 1}`,
      caption: `Hình ảnh y khoa tải lên ngày ${new Date().toLocaleDateString("vi-VN")}`,
      url: img.url,
      imageId: img.imageId
    }))
  ]

  const currentImg = combinedImages[activeImg] || combinedImages[0]

  return (
    <div className="flex flex-col gap-3">
      {/* Main viewer */}
      <div className="relative rounded-xl overflow-hidden" style={{ background: "#0A0A0A", aspectRatio: "4/3" }}>
        {currentImg.type === "mock" ? (
          <UsSvg variant={currentImg.variant} patientName={patientName} />
        ) : (
          <img src={currentImg.url} alt="Medical Record Scan" className="w-full h-full object-contain" />
        )}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <Ico d={ic.scan} cls="w-3 h-3" style={{ color: "#5ab4d4" }} />
          <span className="font-mono text-white" style={{ color: "#5ab4d4", fontSize: 10 }}>
            {currentImg.label.toUpperCase()}
          </span>
        </div>
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(0,0,0,0.6)" }}>
              <Ico d={ic.lock} cls="w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
              <span className="text-xs" style={{ color: "#94A3B8" }}>Hồ sơ đã khóa</span>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {combinedImages.map((img, i) => {
          const isActive = activeImg === i
          if (img.type === "mock") {
            return (
              <Thumb key={i} variant={img.variant} active={isActive} onClick={() => setActiveImg(i)} />
            )
          } else {
            return (
              <div key={i} className="relative group shrink-0">
                <button
                  onClick={() => setActiveImg(i)}
                  className="rounded-lg overflow-hidden transition-all cursor-pointer block p-0"
                  style={{
                    width: 72, height: 56,
                    background: "#0A0A0A",
                    border: isActive ? "2px solid #0284C7" : "2px solid transparent",
                    boxShadow: isActive ? "0 0 0 1px rgba(2,132,199,0.3)" : "none",
                  }}
                >
                  <img src={img.url} alt="Medical record thumbnail" className="w-full h-full object-cover" />
                </button>
                {!locked && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteImage((img as any).imageId)
                      if (activeImg >= combinedImages.length - 1) {
                        setActiveImg(0)
                      }
                    }}
                    className="absolute -top-1 -right-1 p-0.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white cursor-pointer border-none shadow transition-opacity opacity-0 group-hover:opacity-100"
                  >
                    <Ico d={ic.x} cls="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            )
          }
        })}

        {/* Add image card */}
        {!locked && (
          <>
            <input 
              ref={fileRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={onUploadImage} 
              disabled={uploadingImage} 
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingImage}
              className="rounded-lg flex flex-col items-center justify-center gap-1 shrink-0 transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50"
              style={{
                width: 72, height: 56,
                border: "2px dashed #CBD5E1",
                color: "#94A3B8",
                background: "transparent"
              }}
            >
              {uploadingImage ? (
                <Ico d={ic.loader} cls="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Ico d={ic.plus} cls="w-4 h-4" />
                  <span style={{ fontSize: 9, fontWeight: 600 }}>Thêm</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Caption */}
      <p className="text-xs italic text-left" style={{ color: "#94A3B8" }}>
        {currentImg.caption}
      </p>
    </div>
  )
}

type Drug = { name: string; dose: string; scheduledAt: string; note: string }

function PrescriptionTab({ 
  drugs, 
  setDrugs, 
  locked 
}: {
  drugs: Drug[]; 
  setDrugs: React.Dispatch<React.SetStateAction<Drug[]>>; 
  locked: boolean 
}) {
  function addRow() {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrowStr = formatDateTimeDDMMYYYY_HHMM(tomorrow)
    setDrugs(prev => [...prev, { name: "", dose: "", scheduledAt: tomorrowStr, note: "" }])
  }

  function removeRow(idx: number) {
    setDrugs(prev => prev.filter((_, i) => i !== idx))
  }

  function updateRow(idx: number, key: keyof Drug, val: string) {
    setDrugs(prev => prev.map((d, i) => i === idx ? { ...d, [key]: val } : d))
  }

  return (
    <div className="flex flex-col gap-3 text-left">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">Chi tiết đơn thuốc</label>
        {!locked && (
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#025a87] rounded-lg transition-colors border-none cursor-pointer"
          >
            <Ico d={ic.plus} cls="w-3 h-3" />
            Thêm dòng
          </button>
        )}
      </div>

      {drugs.length === 0 ? (
        <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-[#E2E8F0] rounded-xl bg-white">
          Chưa có thuốc nào. Nhấp "Thêm dòng" để bắt đầu nhập.
        </div>
      ) : (
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "#FAFAFA", borderBottom: "1px solid #E2E8F0" }}>
                {["Tên thuốc *", "Liều lượng", "Thời gian uống *", "Note", ""].map(h => (
                  <th key={h} className="text-left text-xs font-bold px-3 py-2 text-slate-500" style={{ color: "#64748B" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {drugs.map((d, idx) => (
                <tr key={idx} className="group hover:bg-[#FAFAFA] transition-colors">
                  <td className="p-1">
                    <input
                      type="text"
                      placeholder="vd: Paracetamol"
                      value={d.name}
                      readOnly={locked}
                      onChange={e => updateRow(idx, "name", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#E2E8F0] rounded-md outline-none focus:border-sky-400 bg-white text-[#0F172A] disabled:bg-slate-50 disabled:text-slate-400"
                      disabled={locked}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      placeholder="vd: 2 viên/ngày"
                      value={d.dose}
                      readOnly={locked}
                      onChange={e => updateRow(idx, "dose", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#E2E8F0] rounded-md outline-none focus:border-sky-400 bg-white text-[#0F172A] disabled:bg-slate-50 disabled:text-slate-400"
                      disabled={locked}
                    />
                  </td>
                  <td className="p-1">
                    <div className="relative w-full h-7">
                      <div className="absolute inset-0 flex items-center justify-between px-2.5 py-1 text-xs border border-[#E2E8F0] rounded-md bg-white text-[#0F172A] pointer-events-none group-hover:border-sky-300">
                        <span className="truncate">{d.scheduledAt}</span>
                        <Ico d={ic.calendar} cls="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                      </div>
                      <input
                        type="datetime-local"
                        disabled={locked}
                        value={localToDatetimeValue(d.scheduledAt)}
                        onChange={e => {
                          const val = e.target.value
                          if (!val) return
                          const picked = new Date(val)
                          const formatted = formatDateTimeDDMMYYYY_HHMM(picked)
                          updateRow(idx, "scheduledAt", formatted)
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      placeholder="vd: Uống sau ăn"
                      value={d.note}
                      readOnly={locked}
                      onChange={e => updateRow(idx, "note", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#E2E8F0] rounded-md outline-none focus:border-sky-400 bg-white text-[#0F172A] disabled:bg-slate-50 disabled:text-slate-400"
                      disabled={locked}
                    />
                  </td>
                  <td className="p-1 text-center w-6">
                    {!locked && (
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="cursor-pointer border-none bg-transparent text-rose-500 hover:text-rose-700 transition-colors p-1"
                      >
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
    </div>
  )
}

type Dish = {
  dishName: string;
  quantity: number;
  unit: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
}

type Meal = {
  mealName: string;
  scheduledAt: string;
  note: string;
  dishes: Dish[];
}

function MealTab({
  meals,
  setMeals,
  locked
}: {
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  locked: boolean;
}) {
  function addMeal() {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrowStr = formatDateTimeDDMMYYYY_HHMM(tomorrow);
    setMeals(prev => [...prev, {
      mealName: "",
      scheduledAt: tomorrowStr,
      note: "",
      dishes: []
    }]);
  }

  function removeMeal(mealIdx: number) {
    setMeals(prev => prev.filter((_, i) => i !== mealIdx));
  }

  function updateMealField(mealIdx: number, key: keyof Meal, val: any) {
    setMeals(prev => prev.map((m, i) => i === mealIdx ? { ...m, [key]: val } : m));
  }

  function addDish(mealIdx: number) {
    setMeals(prev => prev.map((m, i) => {
      if (i === mealIdx) {
        return {
          ...m,
          dishes: [...m.dishes, {
            dishName: "",
            quantity: 1,
            unit: "phần",
            totalCalories: 0,
            totalProtein: 0,
            totalCarbohydrates: 0,
            totalFat: 0
          }]
        };
      }
      return m;
    }));
  }

  // Define dynamic updates safely for nested key properties
  function removeDish(mealIdx: number, dishIdx: number) {
    setMeals(prev => prev.map((m, i) => {
      if (i === mealIdx) {
        return {
          ...m,
          dishes: m.dishes.filter((_, j) => j !== dishIdx)
        };
      }
      return m;
    }));
  }

  function updateDishField(mealIdx: number, dishIdx: number, key: keyof Dish, val: any) {
    setMeals(prev => prev.map((m, i) => {
      if (i === mealIdx) {
        const newDishes = m.dishes.map((d, j) => j === dishIdx ? { ...d, [key]: val } : d);
        return { ...m, dishes: newDishes };
      }
      return m;
    }));
  }

  return (
    <div className="flex flex-col gap-4 text-left">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">Thực đơn ăn uống (Meals)</label>
        {!locked && (
          <button
            type="button"
            onClick={addMeal}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#025a87] rounded-lg transition-colors border-none cursor-pointer"
          >
            <Ico d={ic.plus} cls="w-3 h-3" />
            Thêm bữa ăn
          </button>
        )}
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-[#E2E8F0] rounded-xl bg-white">
          Chưa có bữa ăn nào. Nhấp "Thêm bữa ăn" để bắt đầu thiết lập.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {meals.map((m, mealIdx) => (
            <div key={mealIdx} className="p-4 border border-[#E2E8F0] rounded-xl bg-white shadow-sm flex flex-col gap-3 relative">
              {!locked && (
                <button
                  type="button"
                  onClick={() => removeMeal(mealIdx)}
                  className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <Ico d={ic.trash} cls="w-4 h-4" />
                </button>
              )}

              {/* Meal header fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Tên bữa ăn *</label>
                  <input
                    type="text"
                    placeholder="vd: Bữa sáng, Bữa trưa..."
                    value={m.mealName}
                    disabled={locked}
                    onChange={e => updateMealField(mealIdx, "mealName", e.target.value)}
                    className="w-full h-8 px-2.5 text-xs border border-[#E2E8F0] rounded-md outline-none focus:border-sky-400 disabled:bg-slate-50 disabled:text-slate-400 bg-white text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Thời gian ăn *</label>
                  <div className="relative w-full h-8">
                    <div className="absolute inset-0 flex items-center justify-between px-2.5 py-1 text-xs border border-[#E2E8F0] rounded-md bg-white text-[#0F172A] pointer-events-none group-hover:border-sky-300">
                      <span className="truncate">{m.scheduledAt}</span>
                      <Ico d={ic.calendar} cls="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                    </div>
                    <input
                      type="datetime-local"
                      disabled={locked}
                      value={localToDatetimeValue(m.scheduledAt)}
                      onChange={e => {
                        const val = e.target.value
                        if (!val) return
                        const picked = new Date(val)
                        const formatted = formatDateTimeDDMMYYYY_HHMM(picked)
                        updateMealField(mealIdx, "scheduledAt", formatted)
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Ghi chú bữa ăn</label>
                <input
                  type="text"
                  placeholder="vd: Ăn ít tinh bột, nhiều rau..."
                  value={m.note}
                  disabled={locked}
                  onChange={e => updateMealField(mealIdx, "note", e.target.value)}
                  className="w-full h-8 px-2.5 text-xs border border-[#E2E8F0] rounded-md outline-none focus:border-sky-400 disabled:bg-slate-50 disabled:text-slate-400 bg-white text-[#0F172A]"
                />
              </div>

              {/* Dishes list */}
              <div className="mt-2">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-1.5 mb-2">
                  <span className="text-[11px] font-bold text-slate-600">Danh sách món ăn</span>
                  {!locked && (
                    <button
                      type="button"
                      onClick={() => addDish(mealIdx)}
                      className="flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border-none cursor-pointer"
                    >
                      <Ico d={ic.plus} cls="w-2.5 h-2.5" />
                      Thêm món
                    </button>
                  )}
                </div>

                {m.dishes.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic text-center py-2">Chưa ghi món ăn nào.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {m.dishes.map((dish, dishIdx) => (
                      <div key={dishIdx} className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {/* Row 1: Basic dish info */}
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Tên món"
                            value={dish.dishName}
                            disabled={locked}
                            onChange={e => updateDishField(mealIdx, dishIdx, "dishName", e.target.value)}
                            className="flex-1 h-7 px-2 text-[11px] border border-[#E2E8F0] rounded outline-none focus:border-sky-400 bg-white text-[#0F172A]"
                          />
                          <input
                            type="number"
                            placeholder="SL"
                            value={dish.quantity || ""}
                            disabled={locked}
                            onChange={e => updateDishField(mealIdx, dishIdx, "quantity", parseFloat(e.target.value))}
                            className="w-10 h-7 px-1.5 text-[11px] border border-[#E2E8F0] rounded outline-none focus:border-sky-400 bg-white text-center text-[#0F172A]"
                          />
                          <input
                            type="text"
                            placeholder="Đơn vị"
                            value={dish.unit}
                            disabled={locked}
                            onChange={e => updateDishField(mealIdx, dishIdx, "unit", e.target.value)}
                            className="w-12 h-7 px-1.5 text-[11px] border border-[#E2E8F0] rounded outline-none focus:border-sky-400 bg-white text-center text-[#0F172A]"
                          />
                          <input
                            type="number"
                            placeholder="Kcal"
                            value={dish.totalCalories || ""}
                            disabled={locked}
                            onChange={e => updateDishField(mealIdx, dishIdx, "totalCalories", parseFloat(e.target.value))}
                            className="w-14 h-7 px-1.5 text-[11px] border border-[#E2E8F0] rounded outline-none focus:border-sky-400 bg-white text-center text-[#0F172A]"
                          />
                          {!locked && (
                            <button
                              type="button"
                              onClick={() => removeDish(mealIdx, dishIdx)}
                              className="text-rose-500 hover:text-rose-700 transition-colors border-none bg-transparent cursor-pointer p-0.5"
                            >
                              <Ico d={ic.x} cls="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        
                        {/* Row 2: Macros (Protein, Carbohydrates, Fat) */}
                        <div className="flex gap-2 items-center pl-1">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex items-center gap-1 flex-1">
                              <span className="text-[9px] text-slate-500 font-semibold shrink-0">Đạm (g):</span>
                              <input
                                type="number"
                                placeholder="Protein"
                                value={dish.totalProtein || ""}
                                disabled={locked}
                                onChange={e => updateDishField(mealIdx, dishIdx, "totalProtein", parseFloat(e.target.value))}
                                className="w-full h-6 px-1 text-[10px] border border-[#E2E8F0] rounded outline-none focus:border-sky-400 bg-white text-center text-[#0F172A]"
                              />
                            </div>
                            <div className="flex items-center gap-1 flex-1">
                              <span className="text-[9px] text-slate-500 font-semibold shrink-0">Đường (g):</span>
                              <input
                                type="number"
                                placeholder="Carbs"
                                value={dish.totalCarbohydrates || ""}
                                disabled={locked}
                                onChange={e => updateDishField(mealIdx, dishIdx, "totalCarbohydrates", parseFloat(e.target.value))}
                                className="w-full h-6 px-1 text-[10px] border border-[#E2E8F0] rounded outline-none focus:border-sky-400 bg-white text-center text-[#0F172A]"
                              />
                            </div>
                            <div className="flex items-center gap-1 flex-1">
                              <span className="text-[9px] text-slate-500 font-semibold shrink-0">Béo (g):</span>
                              <input
                                type="number"
                                placeholder="Fats"
                                value={dish.totalFat || ""}
                                disabled={locked}
                                onChange={e => updateDishField(mealIdx, dishIdx, "totalFat", parseFloat(e.target.value))}
                                className="w-full h-6 px-1 text-[10px] border border-[#E2E8F0] rounded outline-none focus:border-sky-400 bg-white text-center text-[#0F172A]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type Workout = {
  workoutName: string;
  content: string;
  scheduledAt: string;
  note: string;
}

function WorkoutTab({
  workouts,
  setWorkouts,
  locked
}: {
  workouts: Workout[];
  setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
  locked: boolean;
}) {
  function addWorkout() {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrowStr = formatDateTimeDDMMYYYY_HHMM(tomorrow);
    setWorkouts(prev => [...prev, {
      workoutName: "",
      content: "",
      scheduledAt: tomorrowStr,
      note: ""
    }]);
  }

  function removeWorkout(idx: number) {
    setWorkouts(prev => prev.filter((_, i) => i !== idx));
  }

  function updateWorkout(idx: number, key: keyof Workout, val: string) {
    setWorkouts(prev => prev.map((w, i) => i === idx ? { ...w, [key]: val } : w));
  }

  return (
    <div className="flex flex-col gap-3 text-left">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">Chế độ tập luyện (Workouts)</label>
        {!locked && (
          <button
            type="button"
            onClick={addWorkout}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#025a87] rounded-lg transition-colors border-none cursor-pointer"
          >
            <Ico d={ic.plus} cls="w-3 h-3" />
            Thêm bài tập
          </button>
        )}
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-[#E2E8F0] rounded-xl bg-white">
          Chưa có chế độ tập luyện nào. Nhấp "Thêm bài tập" để bắt đầu thiết lập.
        </div>
      ) : (
        <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "#FAFAFA", borderBottom: "1px solid #E2E8F0" }}>
                {["Tên bài tập *", "Nội dung", "Thời gian tập *", "Note", ""].map(h => (
                  <th key={h} className="text-left text-xs font-bold px-3 py-2 text-slate-500" style={{ color: "#64748B" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {workouts.map((w, idx) => (
                <tr key={idx} className="group hover:bg-[#FAFAFA] transition-colors">
                  <td className="p-1">
                    <input
                      type="text"
                      placeholder="vd: Đi bộ nhẹ"
                      value={w.workoutName}
                      disabled={locked}
                      onChange={e => updateWorkout(idx, "workoutName", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#E2E8F0] rounded-md outline-none focus:border-sky-400 bg-white text-[#0F172A] disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      placeholder="vd: 30 phút buổi chiều"
                      value={w.content}
                      disabled={locked}
                      onChange={e => updateWorkout(idx, "content", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#E2E8F0] rounded-md outline-none focus:border-sky-400 bg-white text-[#0F172A] disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </td>
                  <td className="p-1">
                    <div className="relative w-full h-7">
                      <div className="absolute inset-0 flex items-center justify-between px-2.5 py-1 text-xs border border-[#E2E8F0] rounded-md bg-white text-[#0F172A] pointer-events-none group-hover:border-sky-300">
                        <span className="truncate">{w.scheduledAt}</span>
                        <Ico d={ic.calendar} cls="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                      </div>
                      <input
                        type="datetime-local"
                        disabled={locked}
                        value={localToDatetimeValue(w.scheduledAt)}
                        onChange={e => {
                          const val = e.target.value
                          if (!val) return
                          const picked = new Date(val)
                          const formatted = formatDateTimeDDMMYYYY_HHMM(picked)
                          updateWorkout(idx, "scheduledAt", formatted)
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      placeholder="vd: Không vận động nặng"
                      value={w.note}
                      disabled={locked}
                      onChange={e => updateWorkout(idx, "note", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-[#E2E8F0] rounded-md outline-none focus:border-sky-400 bg-white text-[#0F172A] disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </td>
                  <td className="p-1 text-center w-6">
                    {!locked && (
                      <button
                        type="button"
                        onClick={() => removeWorkout(idx)}
                        className="cursor-pointer border-none bg-transparent text-rose-500 hover:text-rose-700 transition-colors p-1"
                      >
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
    </div>
  );
}

function QueuePanel({ 
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
      <div className="px-4 py-3 font-bold text-xs border-b border-[#F1F5F9] flex items-center justify-between" style={{ color: "#0F172A" }}>
        Hàng chờ khám
        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#0284C7" }}>
          {filtered.length}
        </span>
      </div>

      <div className="px-3 py-2.5 border-b border-[#F1F5F9]">
        <div className="relative">
          <Ico d={ic.search} cls="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
          <input value={qSearch} onChange={e => setQSearch(e.target.value)} placeholder="Tìm bệnh nhân..."
            className="w-full h-8 pl-8 pr-2 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300 transition-all bg-white" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(a => {
          const active = a.id === activeId
          const patientName = a.patient?.fullName || "Bác sĩ"
          const patientId = a.patientId || ""
          
          let statusBg = "rgba(148,163,184,0.1)"
          let statusText = "#64748B"
          let statusLabel = "Chờ khám"

          if (a.status === "IN_PROGRESS") {
            statusBg = "rgba(2,132,199,0.1)"
            statusText = "#0284C7"
            statusLabel = "Đang khám"
          } else if (a.status === "COMPLETED") {
            statusBg = "rgba(16,185,129,0.1)"
            statusText = "#059669"
            statusLabel = "Đã khám"
          } else if (a.status === "CANCELLED") {
            statusBg = "rgba(239,68,68,0.1)"
            statusText = "#DC2626"
            statusLabel = "Đã hủy"
          } else if (a.status === "NO_SHOW") {
            statusBg = "rgba(100,116,139,0.1)"
            statusText = "#475569"
            statusLabel = "Quá hạn"
          }

          return (
            <button key={a.id} onClick={() => setActiveId(a.id)}
              className="w-full text-left px-4 py-3.5 border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors cursor-pointer border-none bg-transparent"
              style={active ? { borderLeft: "3px solid #0284C7", background: "#EFF6FF", paddingLeft: 13 } : {}}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: active ? "#0284C7" : "#94A3B8", fontSize: 10 }}>
                  {patientName.split(" ").slice(-2).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: active ? "#0284C7" : "#0F172A" }}>{patientName}</p>
                  <p className="text-xs mono truncate text-slate-400" style={{ fontSize: 10 }}>#{patientId.slice(0, 8)}...</p>
                </div>
              </div>
              <div className="mt-1.5 ml-10">
                <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase"
                  style={{ background: statusBg, color: statusText }}>
                  {statusLabel}
                </span>
              </div>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-8">Không tìm thấy ca khám nào.</p>
        )}
      </div>
    </div>
  )
}

function VitalInput({ label, placeholder, unit, value, onChange, locked }: {
  label: string; placeholder: string; unit: string
  value: string; onChange: (v: string) => void; locked: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="text-left">
      <label className="block text-xs font-semibold mb-1" style={{ color: focused ? "#0284C7" : "#64748B" }}>{label}</label>
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          readOnly={locked}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full h-9 pl-3 text-sm border rounded-lg outline-none transition-all bg-white"
          style={{
            paddingRight: unit.length > 3 ? 64 : 48,
            borderColor: focused ? "#0284C7" : "#E2E8F0",
            boxShadow: focused ? "0 0 0 3px rgba(2,132,199,0.1)" : "none",
            color: "#0F172A",
            background: locked ? "#FAFAFA" : "white",
          }}
          disabled={locked}
        />
        <span className="absolute right-2.5 text-xs font-semibold pointer-events-none whitespace-nowrap"
          style={{ color: "#94A3B8" }}>
          {unit}
        </span>
      </div>
    </div>
  )
}

function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]" style={{ width: 420 }}>
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4 text-left">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(2,132,199,0.1)" }}>
              <Ico d={ic.lock} cls="w-5 h-5" style={{ color: "#0284C7" }} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#0F172A" }}>Xác nhận hoàn thành ca khám</p>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#64748B" }}>
                Hồ sơ sau khi hoàn thành sẽ khóa ở chế độ <strong style={{ color: "#0F172A" }}>Chỉ đọc</strong> và không thể sửa đổi. Vui lòng kiểm tra lại toàn bộ thông tin trước khi xác nhận.
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg flex items-start gap-2.5 text-left" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
            <Ico d={ic.alertTri} cls="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
            <p className="text-xs" style={{ color: "#92400E" }}>Thao tác này không thể hoàn tác. Đảm bảo đơn thuốc và chẩn đoán đã đầy đủ.</p>
          </div>
        </div>
        <div className="flex gap-2 px-6 py-4 border-t border-[#F1F5F9]">
          <button onClick={onCancel}
            className="flex-1 h-9 text-sm font-medium border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-slate-500 bg-white">
            Kiểm tra lại
          </button>
          <button onClick={onConfirm}
            className="flex-1 h-9 text-sm font-bold text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
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
  const [appointments, setAppointments] = useState<any[]>([])
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null)
  const [activeExam, setActiveExam] = useState<any | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const [showConfirm, setShowConfirm] = useState(false)
  const [qSearch, setQSearch]       = useState("")
  const [rightTab, setRightTab]     = useState<"img" | "rx" | "meal" | "workout">("img")

  // Form fields
  const [diagnosis, setDiagnosis]   = useState("")
  const [notes, setNotes]           = useState("")
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null)
  const [drugs, setDrugs]           = useState<Drug[]>([])
  const [meals, setMeals]           = useState<Meal[]>([])
  const [workouts, setWorkouts]     = useState<Workout[]>([])

  // Vitals
  const [bloodPressure, setBloodPressure] = useState("")
  const [heartRate, setHeartRate]         = useState("")
  const [breathingRate, setBreathingRate] = useState("")
  const [bodyTemperature, setBodyTemperature] = useState("")
  const [bloodLipids, setBloodLipids]     = useState("")
  const [height, setHeight]               = useState("")
  const [weight, setWeight]               = useState("")
  const [bloodType, setBloodType]         = useState("")
  const [medicalHistory, setMedicalHistory] = useState("")

  const patient = activeExam?.patient || {}
  const record = activeExam?.medicalRecord || {}
  const apt = activeExam?.appointment || {}
  const images = record?.medicalImages || []

  const locked = apt?.status === "COMPLETED" || apt?.status === "CANCELLED" || apt?.status === "NO_SHOW"

  const fetchAppointmentsList = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/appointments`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          const list = result.data || []
          setAppointments(list)
          
          if (list.length > 0 && !activeAppointmentId) {
            const firstApt = list.find((a: any) => a.status === "IN_PROGRESS") || list.find((a: any) => a.status === "CONFIRMED") || list[0]
            setActiveAppointmentId(firstApt.id)
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch doctor appointments:", e)
    } finally {
      setLoading(false)
    }
  }

  const fetchExaminationDetails = async (aptId: string) => {
    setLoadingDetails(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${aptId}`)
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          const exam = result.data
          setActiveExam(exam)
          
          if (exam.appointment?.status === "CONFIRMED") {
            await startExaminationCall(aptId)
          } else {
            populateFormFields(exam)
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch examination details:", e)
    } finally {
      setLoadingDetails(false)
    }
  }

  const startExaminationCall = async (aptId: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${aptId}/start`, {
        method: "PATCH"
      })
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          setActiveExam(result.data)
          populateFormFields(result.data)
          fetchAppointmentsList()
        }
      }
    } catch (e) {
      console.error("Failed to start examination:", e)
    }
  }

  const populateFormFields = (exam: any) => {
    const r = exam.medicalRecord || {}
    const p = exam.patient || {}
    const firstRx = (exam.prescriptions && exam.prescriptions[0]) || {}

    setMedicalHistory(p.medicalHistory || "")
    setDiagnosis(r.diagnosis || "")
    setNotes(r.note || "")
    
    // Vitals
    setBloodPressure(r.bloodPressure || "")
    setHeartRate(r.heartRate ? String(r.heartRate) : "")
    setBreathingRate(r.breathingRate ? String(r.breathingRate) : "")
    setBodyTemperature(r.bodyTemperature ? String(r.bodyTemperature) : "")
    setBloodLipids(r.bloodLipids ? String(r.bloodLipids) : "")
    setHeight(p.height ? String(p.height) : "")
    setWeight(p.weight ? String(p.weight) : "")
    setBloodType(p.bloodType || "")
    
    setPrescriptionId(firstRx.id || null)

    if (firstRx.medicineSchedules) {
      const mappedDrugs = firstRx.medicineSchedules.map((s: any) => {
        const d = s.scheduledAt ? new Date(s.scheduledAt) : new Date(Date.now() + 24 * 60 * 60 * 1000)
        return {
          name: s.medicineName || "",
          dose: s.dosage || "",
          scheduledAt: formatDateTimeDDMMYYYY_HHMM(d),
          note: s.note || ""
        }
      })
      setDrugs(mappedDrugs)
    } else {
      setDrugs([])
    }

    if (firstRx.meals) {
      const mappedMeals = firstRx.meals.map((m: any) => {
        const d = m.scheduledAt ? new Date(m.scheduledAt) : new Date(Date.now() + 24 * 60 * 60 * 1000)
        return {
          mealName: m.mealName || "",
          scheduledAt: formatDateTimeDDMMYYYY_HHMM(d),
          note: m.note || "",
          dishes: (m.dishes || []).map((dish: any) => ({
            dishName: dish.dishName || "",
            quantity: dish.quantity || 0,
            unit: dish.unit || "",
            totalCalories: dish.totalCalories || 0,
            totalProtein: dish.totalProtein || 0,
            totalCarbohydrates: dish.totalCarbohydrates || 0,
            totalFat: dish.totalFat || 0
          }))
        }
      })
      setMeals(mappedMeals)
    } else {
      setMeals([])
    }

    if (firstRx.workouts) {
      const mappedWorkouts = firstRx.workouts.map((w: any) => {
        const d = w.scheduledAt ? new Date(w.scheduledAt) : new Date(Date.now() + 24 * 60 * 60 * 1000)
        return {
          workoutName: w.workoutName || "",
          content: w.content || "",
          scheduledAt: formatDateTimeDDMMYYYY_HHMM(d),
          note: w.note || ""
        }
      })
      setWorkouts(mappedWorkouts)
    } else {
      setWorkouts([])
    }
  }

  useEffect(() => {
    fetchAppointmentsList()
  }, [])

  useEffect(() => {
    if (activeAppointmentId) {
      fetchExaminationDetails(activeAppointmentId)
    }
  }, [activeAppointmentId])

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeAppointmentId) return
    
    setUploadingImage(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    try {
      const formData = new FormData()
      formData.append("image", file)
      
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/medical-images`, {
        method: "POST",
        body: formData
      })
      
      if (res.ok) {
        alert("Tải lên hình ảnh thành công!")
        fetchExaminationDetails(activeAppointmentId)
      } else {
        const result = await res.json()
        alert(result.message || "Tải lên hình ảnh thất bại.")
      }
    } catch (err: any) {
      alert(err.message || "Lỗi tải ảnh.")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!activeAppointmentId || !confirm("Bạn có chắc muốn xóa ảnh này?")) return
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/medical-images/${imageId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        alert("Xóa hình ảnh thành công!")
        fetchExaminationDetails(activeAppointmentId)
      } else {
        alert("Xóa hình ảnh thất bại.")
      }
    } catch (err: any) {
      alert(err.message || "Lỗi xóa ảnh.")
    }
  }

  const handleSaveDraft = async () => {
    if (!activeAppointmentId) return
    setSaving(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    try {
      // 1. Save clinical info
      const clinicalPayload = {
        medicalHistory: medicalHistory || null,
        note: notes.trim() || null,
        bloodPressure: bloodPressure || null,
        heartRate: heartRate ? parseInt(heartRate, 10) : null,
        breathingRate: breathingRate ? parseInt(breathingRate, 10) : null,
        bodyTemperature: bodyTemperature ? parseFloat(bodyTemperature) : null,
        bloodLipids: bloodLipids ? parseFloat(bloodLipids) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        bloodType: bloodType || null
      }

      const clinicalRes = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/clinical-information`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clinicalPayload)
      })

      if (!clinicalRes.ok) {
        throw new Error("Lưu thông tin sinh hiệu thất bại.")
      }

      // 2. Save diagnosis
      if (diagnosis.trim()) {
        const diagRes = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/diagnosis`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ diagnosis: diagnosis.trim() })
        })
        if (!diagRes.ok) {
          throw new Error("Lưu chẩn đoán lâm sàng thất bại.")
        }
      }

      // 3. Save prescription
      const validDrugs = drugs.filter(d => d.name.trim() !== "")
      const validMeals = meals.filter(m => m.mealName.trim() !== "")
      const validWorkouts = workouts.filter(w => w.workoutName.trim() !== "")

      if (validDrugs.length > 0 || validMeals.length > 0 || validWorkouts.length > 0 || notes.trim()) {
        // Validate drug dates
        for (const d of validDrugs) {
          const parsed = parseDateTimeDDMMYYYY_HHMM(d.scheduledAt)
          if (!parsed || isNaN(parsed.getTime())) {
            alert(`Thời gian uống "${d.scheduledAt}" không đúng định dạng dd/mm/yyyy HH:mm!`)
            setSaving(false)
            return
          }
          if (parsed.getTime() <= Date.now()) {
            alert(`Thời gian uống "${d.scheduledAt}" phải là thời gian trong tương lai!`)
            setSaving(false)
            return
          }
        }

        // Validate meal dates
        for (const m of validMeals) {
          const parsed = parseDateTimeDDMMYYYY_HHMM(m.scheduledAt)
          if (!parsed || isNaN(parsed.getTime())) {
            alert(`Thời gian ăn bữa "${m.mealName}" không đúng định dạng dd/mm/yyyy HH:mm!`)
            setSaving(false)
            return
          }
          if (parsed.getTime() <= Date.now()) {
            alert(`Thời gian ăn bữa "${m.mealName}" phải là thời gian trong tương lai!`)
            setSaving(false)
            return
          }
        }

        // Validate workout dates
        for (const w of validWorkouts) {
          const parsed = parseDateTimeDDMMYYYY_HHMM(w.scheduledAt)
          if (!parsed || isNaN(parsed.getTime())) {
            alert(`Thời gian tập bài "${w.workoutName}" không đúng định dạng dd/mm/yyyy HH:mm!`)
            setSaving(false)
            return
          }
          if (parsed.getTime() <= Date.now()) {
            alert(`Thời gian tập bài "${w.workoutName}" phải là thời gian trong tương lai!`)
            setSaving(false)
            return
          }
        }

        const prescriptionPayload = {
          content: "Đơn thuốc khám bệnh",
          medicineSchedules: validDrugs.length > 0 
            ? validDrugs.map((d) => {
                const parsedDate = parseDateTimeDDMMYYYY_HHMM(d.scheduledAt)!
                return {
                  medicineName: d.name.trim(),
                  dosage: d.dose.trim() || "Theo hướng dẫn",
                  scheduledAt: parsedDate.toISOString(),
                  note: d.note.trim() || "Uống đúng giờ"
                }
              })
            : [{
                medicineName: "Theo chỉ định ăn uống & tập luyện",
                dosage: "Không có thuốc uống",
                scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                note: "Kiểm tra chế độ dinh dưỡng và bài tập luyện tương ứng"
              }],
          meals: validMeals.map((m) => {
            const parsedDate = parseDateTimeDDMMYYYY_HHMM(m.scheduledAt)!
            return {
              mealName: m.mealName.trim(),
              scheduledAt: parsedDate.toISOString(),
              note: m.note.trim(),
              dishes: m.dishes.filter(dish => dish.dishName.trim() !== "").map((dish) => ({
                dishName: dish.dishName.trim(),
                quantity: Number(dish.quantity) || 1,
                unit: dish.unit.trim() || "phần",
                totalCalories: Number(dish.totalCalories) || 0,
                totalProtein: Number(dish.totalProtein) || 0,
                totalCarbohydrates: Number(dish.totalCarbohydrates) || 0,
                totalFat: Number(dish.totalFat) || 0
              }))
            }
          }),
          workouts: validWorkouts.map((w) => {
            const parsedDate = parseDateTimeDDMMYYYY_HHMM(w.scheduledAt)!
            return {
              workoutName: w.workoutName.trim(),
              content: w.content.trim() || "Tập luyện theo hướng dẫn",
              scheduledAt: parsedDate.toISOString(),
              note: w.note.trim()
            }
          })
        }

        const rxMethod = prescriptionId ? "PATCH" : "POST"
        const rxUrl = prescriptionId 
          ? `${apiUrl}/api/doctor/appointments/${activeAppointmentId}/prescription`
          : `${apiUrl}/api/doctor/appointments/${activeAppointmentId}/prescriptions`

        const rxRes = await fetchWithAuth(rxUrl, {
          method: rxMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prescriptionPayload)
        })

        if (rxRes.ok) {
          const rxResult = await rxRes.json()
          if (rxResult.success && rxResult.data) {
            setPrescriptionId(rxResult.data.id)
          }
        } else {
          throw new Error("Lưu đơn thuốc thất bại.")
        }
      }

      alert("Lưu nháp thành công!")
      fetchExaminationDetails(activeAppointmentId)
    } catch (err: any) {
      alert(err.message || "Lỗi lưu nháp.")
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    setShowConfirm(false)
    if (!activeAppointmentId) return
    setSaving(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    try {
      // 1. Save clinical info
      const clinicalPayload = {
        medicalHistory: medicalHistory || null,
        note: notes.trim() || null,
        bloodPressure: bloodPressure || null,
        heartRate: heartRate ? parseInt(heartRate, 10) : null,
        breathingRate: breathingRate ? parseInt(breathingRate, 10) : null,
        bodyTemperature: bodyTemperature ? parseFloat(bodyTemperature) : null,
        bloodLipids: bloodLipids ? parseFloat(bloodLipids) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        bloodType: bloodType || null
      }

      await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/clinical-information`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clinicalPayload)
      })

      // 2. Diagnosis is required
      if (!diagnosis.trim()) {
        alert("Chẩn đoán lâm sàng là bắt buộc để hoàn thành ca khám!")
        setSaving(false)
        return
      }

      await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/diagnosis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosis: diagnosis.trim() })
      })

      // 3. Save prescription
      const validDrugs = drugs.filter(d => d.name.trim() !== "")
      const validMeals = meals.filter(m => m.mealName.trim() !== "")
      const validWorkouts = workouts.filter(w => w.workoutName.trim() !== "")

      if (validDrugs.length > 0 || validMeals.length > 0 || validWorkouts.length > 0) {
        // Validate drug dates
        for (const d of validDrugs) {
          const parsed = parseDateTimeDDMMYYYY_HHMM(d.scheduledAt)
          if (!parsed || isNaN(parsed.getTime())) {
            alert(`Thời gian uống "${d.scheduledAt}" không đúng định dạng dd/mm/yyyy HH:mm!`)
            setSaving(false)
            return
          }
          if (parsed.getTime() <= Date.now()) {
            alert(`Thời gian uống "${d.scheduledAt}" phải là thời gian trong tương lai!`)
            setSaving(false)
            return
          }
        }

        // Validate meal dates
        for (const m of validMeals) {
          const parsed = parseDateTimeDDMMYYYY_HHMM(m.scheduledAt)
          if (!parsed || isNaN(parsed.getTime())) {
            alert(`Thời gian ăn bữa "${m.mealName}" không đúng định dạng dd/mm/yyyy HH:mm!`)
            setSaving(false)
            return
          }
          if (parsed.getTime() <= Date.now()) {
            alert(`Thời gian ăn bữa "${m.mealName}" phải là thời gian trong tương lai!`)
            setSaving(false)
            return
          }
        }

        // Validate workout dates
        for (const w of validWorkouts) {
          const parsed = parseDateTimeDDMMYYYY_HHMM(w.scheduledAt)
          if (!parsed || isNaN(parsed.getTime())) {
            alert(`Thời gian tập bài "${w.workoutName}" không đúng định dạng dd/mm/yyyy HH:mm!`)
            setSaving(false)
            return
          }
          if (parsed.getTime() <= Date.now()) {
            alert(`Thời gian tập bài "${w.workoutName}" phải là thời gian trong tương lai!`)
            setSaving(false)
            return
          }
        }

        const prescriptionPayload = {
          content: "Đơn thuốc khám bệnh",
          medicineSchedules: validDrugs.length > 0 
            ? validDrugs.map((d) => {
                const parsedDate = parseDateTimeDDMMYYYY_HHMM(d.scheduledAt)!
                return {
                  medicineName: d.name.trim(),
                  dosage: d.dose.trim() || "Theo hướng dẫn",
                  scheduledAt: parsedDate.toISOString(),
                  note: d.note.trim() || "Uống đúng giờ"
                }
              })
            : [{
                medicineName: "Theo chỉ định ăn uống & tập luyện",
                dosage: "Không có thuốc uống",
                scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                note: "Kiểm tra chế độ dinh dưỡng và bài tập luyện tương ứng"
              }],
          meals: validMeals.map((m) => {
            const parsedDate = parseDateTimeDDMMYYYY_HHMM(m.scheduledAt)!
            return {
              mealName: m.mealName.trim(),
              scheduledAt: parsedDate.toISOString(),
              note: m.note.trim(),
              dishes: m.dishes.filter(dish => dish.dishName.trim() !== "").map((dish) => ({
                dishName: dish.dishName.trim(),
                quantity: Number(dish.quantity) || 1,
                unit: dish.unit.trim() || "phần",
                totalCalories: Number(dish.totalCalories) || 0,
                totalProtein: Number(dish.totalProtein) || 0,
                totalCarbohydrates: Number(dish.totalCarbohydrates) || 0,
                totalFat: Number(dish.totalFat) || 0
              }))
            }
          }),
          workouts: validWorkouts.map((w) => {
            const parsedDate = parseDateTimeDDMMYYYY_HHMM(w.scheduledAt)!
            return {
              workoutName: w.workoutName.trim(),
              content: w.content.trim() || "Tập luyện theo hướng dẫn",
              scheduledAt: parsedDate.toISOString(),
              note: w.note.trim()
            }
          })
        }

        const rxMethod = prescriptionId ? "PATCH" : "POST"
        const rxUrl = prescriptionId 
          ? `${apiUrl}/api/doctor/appointments/${activeAppointmentId}/prescription`
          : `${apiUrl}/api/doctor/appointments/${activeAppointmentId}/prescriptions`

        const rxRes = await fetchWithAuth(rxUrl, {
          method: rxMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prescriptionPayload)
        })

        if (rxRes.ok) {
          const rxResult = await rxRes.json()
          if (rxResult.success && rxResult.data) {
            setPrescriptionId(rxResult.data.id)
          }
        }
      }

      // 4. Complete
      const completeRes = await fetchWithAuth(`${apiUrl}/api/doctor/appointments/${activeAppointmentId}/complete`, {
        method: "PATCH"
      })

      if (completeRes.ok) {
        alert("Hoàn thành ca khám thành công! Bệnh án đã được khóa.")
        fetchAppointmentsList()
        fetchExaminationDetails(activeAppointmentId)
      } else {
        const result = await completeRes.json()
        alert(result.message || "Hoàn thành ca khám thất bại.")
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối máy chủ.")
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "BN"
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const calculateAge = (dob: string) => {
    if (!dob) return ""
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return `${age} tuổi`
  }

  const translateGender = (g: string) => {
    if (g === "Male") return "Nam"
    if (g === "Female") return "Nữ"
    return "Khác"
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[400px]">
        <svg className="animate-spin h-8 w-8 text-[#0EA5E9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-400 text-xs font-medium">Đang tải danh sách ca khám bệnh...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full bg-[#F8FAFC]">
      {showConfirm && <ConfirmModal onConfirm={handleComplete} onCancel={() => setShowConfirm(false)} />}

      {/* ── Patient strip ── */}
      {activeAppointmentId && activeExam && (
        <div className="px-6 pt-3 pb-2 shrink-0">
          <div className="flex items-center justify-between px-5 py-3.5 rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            {/* Identity */}
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 text-sm" style={{ background: "#0284C7" }}>
                {getInitials(patient.fullName)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm" style={{ color: "#0F172A" }}>{patient.fullName || "N/A"}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    apt.status === "IN_PROGRESS" ? "bg-sky-50 text-[#0284C7] border border-sky-100" :
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
                  <p className="text-xs" style={{ color: "#64748B" }}>
                    {calculateAge(patient.dateOfBirth)} · {translateGender(patient.gender)}
                  </p>
                  <span className="text-xs font-mono font-medium text-slate-400">#{patient.id ? patient.id.slice(0, 8) : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Vitals from reception */}
            <div className="flex items-center gap-5 pl-5" style={{ borderLeft: "1px solid #F1F5F9" }}>
              <div className="flex items-center gap-2 text-left">
                <Ico d={ic.heart} cls="w-4 h-4 shrink-0" style={{ color: "#EF4444" }} />
                <div>
                  <p className="text-xs text-slate-400" style={{ color: "#94A3B8" }}>Huyết áp</p>
                  <p className="text-xs font-bold" style={{ color: "#0F172A" }}>{bloodPressure || "N/A"} <span className="font-normal text-slate-400">mmHg</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-left">
                <Ico d={ic.thermo} cls="w-4 h-4 shrink-0" style={{ color: "#F59E0B" }} />
                <div>
                  <p className="text-xs text-slate-400" style={{ color: "#94A3B8" }}>Nhiệt độ</p>
                  <p className="text-xs font-bold" style={{ color: "#0F172A" }}>{bodyTemperature || "N/A"} <span className="font-normal text-slate-400">°C</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-left">
                <Ico d={ic.activity} cls="w-4 h-4 shrink-0" style={{ color: "#0284C7" }} />
                <div>
                  <p className="text-xs text-slate-400" style={{ color: "#94A3B8" }}>Chiều cao / Cân nặng</p>
                  <p className="text-xs font-bold" style={{ color: "#0F172A" }}>
                    {height && weight ? `${height} cm / ${weight} kg` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Three-column body ── */}
      <div className="flex-1 overflow-hidden px-6 pb-0 flex gap-4 min-h-0">
        
        {/* Left queue — 20% */}
        <div style={{ width: "20%" }} className="flex flex-col min-h-0">
          <QueuePanel
            activeId={activeAppointmentId}
            setActiveId={setActiveAppointmentId}
            qSearch={qSearch}
            setQSearch={setQSearch}
            appointments={appointments}
          />
        </div>

        {/* Middle — 50% */}
        <div className="flex flex-col gap-4 overflow-y-auto pb-4 h-full min-h-0" style={{ flex: 1 }}>
          {loadingDetails ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-[#E2E8F0] min-h-[300px]">
              <svg className="animate-spin h-6 w-6 text-[#0EA5E9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-slate-400 text-xs font-medium">Đang tải bệnh án...</p>
            </div>
          ) : activeAppointmentId && activeExam ? (
            <>
              {/* Section 1: Vital signs */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm shrink-0">
                <div className="px-5 py-3 font-bold text-sm border-b border-[#F1F5F9] text-left" style={{ color: "#0F172A" }}>
                  Chỉ số sinh hiệu
                </div>
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <VitalInput label="Huyết áp" placeholder="120/80" unit="mmHg" value={bloodPressure} onChange={setBloodPressure} locked={locked} />
                  <VitalInput label="Nhịp tim" placeholder="72" unit="bpm" value={heartRate} onChange={setHeartRate} locked={locked} />
                  <VitalInput label="Thân nhiệt" placeholder="36.8" unit="°C" value={bodyTemperature} onChange={setBodyTemperature} locked={locked} />
                  <VitalInput label="Nhịp thở" placeholder="18" unit="lần/phút" value={breathingRate} onChange={setBreathingRate} locked={locked} />
                  <VitalInput label="Mỡ máu" placeholder="185" unit="mg/dL" value={bloodLipids} onChange={setBloodLipids} locked={locked} />
                  <VitalInput label="Chiều cao" placeholder="172" unit="cm" value={height} onChange={setHeight} locked={locked} />
                  <VitalInput label="Cân nặng" placeholder="68" unit="kg" value={weight} onChange={setWeight} locked={locked} />
                  <VitalInput label="Nhóm máu" placeholder="O+" unit="hệ ABO" value={bloodType} onChange={setBloodType} locked={locked} />
                </div>
              </div>

              {/* Section 2: Diagnosis & notes */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm shrink-0">
                <div className="px-5 py-3 font-bold text-sm border-b border-[#F1F5F9] text-left" style={{ color: "#0F172A" }}>
                  Chẩn đoán &amp; Ghi chú
                </div>
                <div className="p-5 flex flex-col gap-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>Tiểu sử bệnh lý (Medical History)</label>
                    <textarea
                      rows={3}
                      placeholder="Nhập tiểu sử bệnh lý của bệnh nhân..."
                      value={medicalHistory}
                      readOnly={locked}
                      onChange={e => setMedicalHistory(e.target.value)}
                      className="w-full p-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300 transition-all resize-none leading-relaxed bg-white"
                      style={{ color: "#0F172A", background: locked ? "#FAFAFA" : "white" }}
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>
                      Chẩn đoán lâm sàng (Diagnosis)<span className="ml-0.5" style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Nhập chẩn đoán y khoa chính xác của bác sĩ..."
                      value={diagnosis}
                      readOnly={locked}
                      onChange={e => setDiagnosis(e.target.value)}
                      className="w-full p-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300 transition-all resize-none leading-relaxed bg-white"
                      style={{ color: "#0F172A", background: locked ? "#FAFAFA" : "white" }}
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0F172A" }}>Ghi chú dặn dò &amp; Kế hoạch điều trị (Prescription Advice)</label>
                    <textarea
                      rows={3}
                      placeholder="Ghi chú thêm về điều trị, dặn dò uống thuốc hoặc lịch hẹn..."
                      value={notes}
                      readOnly={locked}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full p-3 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300 transition-all resize-none leading-relaxed bg-white"
                      style={{ color: "#0F172A", background: locked ? "#FAFAFA" : "white" }}
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-[#E2E8F0] p-10 min-h-[300px]">
              <p className="text-sm font-semibold">Chưa chọn ca khám</p>
              <p className="text-xs text-slate-400 mt-1">Vui lòng chọn một bệnh nhân ở hàng chờ khám bên trái.</p>
            </div>
          )}
        </div>

        {/* Right — 30% */}
        <div style={{ width: "29%" }} className="flex flex-col min-h-0 overflow-y-auto pb-4 h-full">
          {activeAppointmentId && activeExam && !loadingDetails ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-[#E2E8F0] shrink-0">
                {([["img", "Hình ảnh"], ["rx", "Đơn thuốc"], ["meal", "Ăn uống"], ["workout", "Tập luyện"]] as const).map(([key, label]) => {
                  const active = rightTab === key
                  return (
                    <button key={key} onClick={() => setRightTab(key)}
                      className="flex-1 py-3 text-xs font-semibold transition-colors cursor-pointer relative border-none bg-transparent outline-none truncate px-1"
                      style={{ color: active ? "#0284C7" : "#64748B" }}>
                      {label}
                      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: "#0284C7" }} />}
                    </button>
                  )
                })}
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                {rightTab === "img" && (
                  <ImageTab 
                    locked={locked} 
                    images={images}
                    onUploadImage={handleUploadImage}
                    onDeleteImage={handleDeleteImage}
                    uploadingImage={uploadingImage}
                    patientName={patient.fullName}
                  />
                )}
                {rightTab === "rx" && (
                  <PrescriptionTab 
                    drugs={drugs} 
                    setDrugs={setDrugs} 
                    locked={locked} 
                  />
                )}
                {rightTab === "meal" && (
                  <MealTab 
                    meals={meals} 
                    setMeals={setMeals} 
                    locked={locked} 
                  />
                )}
                {rightTab === "workout" && (
                  <WorkoutTab 
                    workouts={workouts} 
                    setWorkouts={setWorkouts} 
                    locked={locked} 
                  />
                )}
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
        <footer className="bg-white border-t border-[#E2E8F0] px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: locked ? "#94A3B8" : "#F59E0B" }} />
            <span className="text-xs font-medium text-slate-500" style={{ color: "#64748B" }}>Trạng thái ca khám:</span>
            <span className="text-xs font-bold" style={{ color: locked ? "#94A3B8" : "#F59E0B" }}>
              {locked ? "Đã hoàn thành — Chỉ đọc" : "Đang diễn ra"}
            </span>
          </div>

          {!locked ? (
            <div className="flex items-center gap-2">
              <button 
                disabled={saving}
                onClick={handleSaveDraft}
                className="h-9 px-4 text-xs font-semibold border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-slate-500 bg-white disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu nháp"}
              </button>
              <button onClick={() => setShowConfirm(true)}
                disabled={saving}
                className="h-9 px-5 text-xs font-bold text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2 border-none disabled:opacity-50"
                style={{ background: "#0284C7", boxShadow: "0 4px 10px rgba(2,132,199,0.25)" }}>
                <Ico d={ic.fileCheck} cls="w-4 h-4" />
                {saving ? "Đang xử lý..." : "Hoàn thành ca khám"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <Ico d={ic.lock} cls="w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
              <span className="text-xs text-slate-400" style={{ color: "#94A3B8" }}>Hồ sơ đã khóa — Chỉ đọc</span>
            </div>
          )}
        </footer>
      )}
    </div>
  )
}
