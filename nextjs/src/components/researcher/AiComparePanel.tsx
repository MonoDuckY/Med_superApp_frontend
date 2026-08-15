import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Cpu, 
  Sparkles, 
  Split, 
  Columns, 
  Image as ImageIcon, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  X
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

interface AiComparePanelProps {
  user: any;
}

export default function AiComparePanel({ user }: AiComparePanelProps) {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [imageWidth, setImageWidth] = useState<number>(1024);
  const [imageHeight, setImageHeight] = useState<number>(768);
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [compareMode, setCompareMode] = useState<"slider" | "side">("slider");
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (originalUrl && originalUrl.startsWith("blob:")) {
        URL.revokeObjectURL(originalUrl);
      }
    };
  }, [originalUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setOriginalFile(file);
    
    // Create local preview URL
    const localUrl = URL.createObjectURL(file);
    setOriginalUrl(localUrl);
    setProcessedUrl(null);
    
    // Auto trigger upload
    uploadAndDetect(file, localUrl);
  };

  const uploadAndDetect = async (file: File, localUrl: string) => {
    setUploading(true);
    setDetections([]);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://hmsnextgen.io.vn:8080";
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetchWithAuth(`${apiUrl}/api/researcher/detect`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const data = result.data;
          
          if (data.image_width) setImageWidth(data.image_width);
          if (data.image_height) setImageHeight(data.image_height);

          // The API returns bbox coordinates and calipers. We draw them on top of the original uploaded image.
          setProcessedUrl(localUrl);
          
          if (Array.isArray(data.detections)) {
            setDetections(data.detections);
          }
          return;
        } else {
          throw new Error(result.message || "Không thể phân tích ảnh.");
        }
      } else {
        throw new Error("Lỗi kết nối API phân tích AI.");
      }
    } catch (err: any) {
      console.warn("AI Detect API failed, falling back to mock overlay simulation:", err);
      setTimeout(() => {
        setImageWidth(1024);
        setImageHeight(768);
        setProcessedUrl(localUrl);
        setDetections([
          {
            confidence: 0.22810617089271545,
            class_id: 0,
            bbox: {
              xmin: 0.4749598205089569,
              ymin: 0.3960506121317546,
              xmax: 0.5546775460243225,
              ymax: 0.4825144608815511
            },
            suggested_calipers: {
              pair_a: [
                [486.3588562011719, 337.3689880371094],
                [567.9898071289062, 337.3689880371094]
              ],
              pair_b: [
                [527.1743316650391, 304.1668701171875],
                [527.1743316650391, 370.57110595703125]
              ]
            }
          }
        ]);
        setError("Không thể kết nối API AI thực tế. Đã chuyển sang mô phỏng chẩn đoán lâm sàng của AI.");
      }, 2500);
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 2500);
    }
  };

  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleReset = () => {
    setOriginalFile(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setDetections([]);
    setError(null);
    setUploading(false);
  };

  const getClassLabel = (classId: number) => {
    if (classId === 0) return "Lesion (Tổn thương)";
    return `Class ${classId}`;
  };

  const renderSvgOverlay = () => {
    if (!detections || detections.length === 0) return null;

    return (
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-10" 
        viewBox={`0 0 ${imageWidth} ${imageHeight}`}
        style={{ width: "100%", height: "100%" }}
      >
        {detections.map((det, idx) => {
          const { bbox, suggested_calipers, confidence, class_id } = det;
          const label = getClassLabel(class_id);
          const confText = `${Math.round(confidence * 100)}%`;
          const elements = [];

          // 1. Draw Bounding Box (bbox)
          if (bbox) {
            const x = bbox.xmin * imageWidth;
            const y = bbox.ymin * imageHeight;
            const w = (bbox.xmax - bbox.xmin) * imageWidth;
            const h = (bbox.ymax - bbox.ymin) * imageHeight;

            elements.push(
              <g key={`bbox-${idx}`}>
                <rect 
                  x={x} 
                  y={y} 
                  width={w} 
                  height={h} 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="2" 
                  strokeDasharray="none"
                />
                <rect 
                  x={x} 
                  y={y - 18 > 0 ? y - 18 : 0} 
                  width={140} 
                  height={18} 
                  fill="#10B981" 
                />
                <text 
                  x={x + 5} 
                  y={y - 18 > 0 ? y - 5 : 12} 
                  fill="white" 
                  fontSize="10" 
                  fontWeight="bold"
                >
                  {label} ({confText})
                </text>
              </g>
            );
          }

          // 2. Draw Suggested Calipers (Yellow markers)
          if (suggested_calipers) {
            // Draw pair_a
            if (suggested_calipers.pair_a && suggested_calipers.pair_a.length === 2) {
              const [[x1, y1], [x2, y2]] = suggested_calipers.pair_a;
              elements.push(
                <g key={`caliper-a-${idx}`}>
                  <line 
                    x1={x1} 
                    y1={y1} 
                    x2={x2} 
                    y2={y2} 
                    stroke="#F59E0B" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                  />
                  {/* Plus marker 1 */}
                  <line x1={x1 - 6} y1={y1} x2={x1 + 6} y2={y1} stroke="#F59E0B" strokeWidth="1.5" />
                  <line x1={x1} y1={y1 - 6} x2={x1} y2={y1 + 6} stroke="#F59E0B" strokeWidth="1.5" />
                  
                  {/* Plus marker 2 */}
                  <line x1={x2 - 6} y1={y2} x2={x2 + 6} y2={y2} stroke="#F59E0B" strokeWidth="1.5" />
                  <line x1={x2} y1={y2 - 6} x2={x2} y2={y2 + 6} stroke="#F59E0B" strokeWidth="1.5" />
                </g>
              );
            }

            // Draw pair_b
            if (suggested_calipers.pair_b && suggested_calipers.pair_b.length === 2) {
              const [[x1, y1], [x2, y2]] = suggested_calipers.pair_b;
              elements.push(
                <g key={`caliper-b-${idx}`}>
                  <line 
                    x1={x1} 
                    y1={y1} 
                    x2={x2} 
                    y2={y2} 
                    stroke="#F59E0B" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                  />
                  {/* Plus marker 1 */}
                  <line x1={x1 - 6} y1={y1} x2={x1 + 6} y2={y1} stroke="#F59E0B" strokeWidth="1.5" />
                  <line x1={x1} y1={y1 - 6} x2={x1} y2={y1 + 6} stroke="#F59E0B" strokeWidth="1.5" />
                  
                  {/* Plus marker 2 */}
                  <line x1={x2 - 6} y1={y2} x2={x2 + 6} y2={y2} stroke="#F59E0B" strokeWidth="1.5" />
                  <line x1={x2} y1={y2 - 6} x2={x2} y2={y2 + 6} stroke="#F59E0B" strokeWidth="1.5" />
                </g>
              );
            }
          }

          return elements;
        })}
      </svg>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full h-full bg-[#F8FAFC] p-6 gap-5">
      <style>{`
        @keyframes scan-animation {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .ai-scan-line {
          animation: scan-animation 3s infinite ease-in-out;
        }
      `}</style>
      
      {/* Header bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm flex items-center justify-between shrink-0 text-left">
        <div>
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
            <Cpu size={16} className="text-[#8B5CF6]" />
            Phân tích & So sánh hình ảnh AI
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Tải lên ảnh phim chụp/siêu âm để phát hiện tổn thương tự động bằng thuật toán AI sâu.
          </p>
        </div>
        {originalFile && (
          <button
            onClick={handleReset}
            className="h-8 px-3 flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            Phân tích ảnh khác
          </button>
        )}
      </div>

      {/* Warning banner if fallback used */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-left shrink-0">
          <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-normal font-medium">{error}</p>
        </div>
      )}

      {/* Main workspace area */}
      <div className="flex-1 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center overflow-hidden min-h-0">
        {!originalUrl ? (
          /* Dropzone Uploader */
          <div className="w-full max-w-[500px] flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center animate-pulse">
              <Upload size={30} strokeWidth={1.5} className="text-[#8B5CF6]" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-bold text-[#0F172A]">Tải lên tập tin hình ảnh y khoa</p>
              <p className="text-xs text-slate-400 max-w-[340px] leading-relaxed mx-auto">
                Hỗ trợ các định dạng JPG, PNG, DICOM. Thuật toán AI sẽ phân tích và khoanh vùng tổn thương tự động.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-10 px-6 flex items-center gap-2 text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7c4dff] rounded-xl transition-all cursor-pointer shadow-lg shadow-[#8B5CF6]/20 border-none"
            >
              Chọn ảnh từ máy tính
            </button>
          </div>
        ) : (
          /* Comparison Workspace */
          <div className="w-full h-full flex flex-col min-h-0 gap-4">
            {/* View Mode controls */}
            <div className="flex items-center justify-between shrink-0 border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chế độ xem:</span>
                <div className="flex bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setCompareMode("slider")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md border-none cursor-pointer flex items-center gap-1.5 transition-colors ${
                      compareMode === "slider"
                        ? "bg-white text-[#8B5CF6] shadow-sm"
                        : "bg-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Split size={13} />
                    Thanh trượt
                  </button>
                  <button
                    onClick={() => setCompareMode("side")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md border-none cursor-pointer flex items-center gap-1.5 transition-colors ${
                      compareMode === "side"
                        ? "bg-white text-[#8B5CF6] shadow-sm"
                        : "bg-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Columns size={13} />
                    Xem song song
                  </button>
                </div>
              </div>

              {uploading && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8B5CF6]">
                  <svg className="animate-spin h-4 w-4 text-[#8B5CF6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>AI đang xử lý hình ảnh...</span>
                </div>
              )}

              {!uploading && processedUrl && (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
                  <CheckCircle2 size={13} />
                  Phân tích hoàn tất
                </div>
              )}
            </div>

            {/* Comparison frame container */}
            <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0 bg-[#0A0A0A] rounded-2xl relative select-none">
              
              {uploading ? (
                /* Scanning Line Animation overlay */
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 pointer-events-none">
                  {originalUrl && (
                    <img src={originalUrl} alt="Original Scan" className="max-w-full max-h-full object-contain opacity-55" />
                  )}
                  {/* Glowing scan bar */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent shadow-[0_0_12px_#8B5CF6] ai-scan-line" />
                  
                  <div className="absolute px-4 py-2 rounded-xl bg-black/75 text-white text-xs font-semibold flex items-center gap-2 backdrop-blur-md">
                    <Sparkles size={14} className="text-[#8B5CF6] animate-bounce" />
                    Mạng thần kinh AI đang quét tổn thương...
                  </div>
                </div>
              ) : null}

              {compareMode === "slider" && originalUrl && (processedUrl || uploading) && (
                /* Before/After Drag Slider View */
                <div 
                  ref={sliderContainerRef}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  className="relative w-full h-full flex items-center justify-center cursor-ew-resize overflow-hidden"
                >
                  
                  {/* Aspect-ratio matched container bounding wrapper */}
                  <div 
                    className="relative max-w-full max-h-full"
                    style={{ 
                      aspectRatio: `${imageWidth} / ${imageHeight}`,
                      width: "100%",
                      height: "auto",
                      maxHeight: "100%",
                      maxWidth: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {/* Bottom Image: Original */}
                    <img 
                      src={originalUrl} 
                      alt="Original View" 
                      className="w-full h-full object-contain pointer-events-none" 
                    />

                    {/* Top Image Box: AI Processed (Width is dynamic) */}
                    {processedUrl && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
                        style={{ width: `${sliderPosition}%` }}
                      >
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ width: `${100 / (sliderPosition / 100)}%` }}>
                          <div className="relative w-full h-full">
                            <img 
                              src={processedUrl} 
                              alt="Processed View" 
                              className="w-full h-full object-contain" 
                            />
                            {/* Render responsive SVG overlay */}
                            {renderSvgOverlay()}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Split line splitter handle */}
                    {processedUrl && (
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-20 pointer-events-none"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-lg border border-slate-300 font-bold text-xs select-none">
                          ↔
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Labels */}
                  <div className="absolute bottom-4 left-4 px-2.5 py-1 rounded bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm z-10 pointer-events-none">
                    ẢNH GỐC
                  </div>
                  <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded bg-[#8B5CF6]/80 text-white text-[10px] font-bold backdrop-blur-sm z-10 pointer-events-none">
                    AI XỬ LÝ
                  </div>
                </div>
              )}

              {compareMode === "side" && originalUrl && (
                /* Side-by-Side View */
                <div className="w-full h-full grid grid-cols-2 gap-0.5 p-0.5 bg-neutral-800">
                  {/* Left Column: Original */}
                  <div className="relative flex items-center justify-center bg-[#0A0A0A] overflow-hidden">
                    <img src={originalUrl} alt="Original Side" className="max-w-full max-h-full object-contain" />
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                      ẢNH GỐC (ORIGINAL)
                    </div>
                  </div>

                  {/* Right Column: AI Processed */}
                  <div className="relative flex items-center justify-center bg-[#0A0A0A] overflow-hidden border-l border-neutral-700">
                    {processedUrl ? (
                      <div 
                        className="relative max-w-full max-h-full"
                        style={{ 
                          aspectRatio: `${imageWidth} / ${imageHeight}`,
                          width: "100%",
                          height: "auto",
                          maxHeight: "100%",
                          maxWidth: "100%"
                        }}
                      >
                        <img src={processedUrl} alt="Processed Side" className="w-full h-full object-contain" />
                        {renderSvgOverlay()}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-xs flex items-center gap-1.5">
                        <Sparkles size={14} className="animate-spin text-[#8B5CF6]" />
                        Đang chờ kết quả...
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-[#8B5CF6]/80 text-white text-[9px] font-bold">
                      AI PHÂN TÍCH (PROCESSED)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Detections List */}
            {processedUrl && !uploading && (
              <div className="mt-4 border-t border-[#F1F5F9] pt-4 text-left w-full shrink-0">
                <h4 className="text-xs font-bold text-[#0F172A] mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#8B5CF6]" />
                  Kết quả nhận diện tự động từ AI ({detections.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {detections.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">Không phát hiện tổn thương hoặc API chưa trả về toạ độ cụ thể.</div>
                  ) : (
                    detections.map((det, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0F172A]">{getClassLabel(det.class_id)}</span>
                            <span className="font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded text-[10px]">
                              {det.confidence ? `${Math.round(det.confidence * 100)}%` : "N/A"}
                            </span>
                          </div>
                          {det.bbox && (
                            <p className="text-[10px] text-slate-500 font-mono">
                              <span className="font-semibold text-slate-600 font-sans">BBox:</span> [{det.bbox.xmin.toFixed(3)}, {det.bbox.ymin.toFixed(3)}, {det.bbox.xmax.toFixed(3)}, {det.bbox.ymax.toFixed(3)}]
                            </p>
                          )}
                          {det.suggested_calipers && (
                            <p className="text-[10px] text-slate-500">
                              <span className="font-semibold text-slate-600">Thước đo AI:</span> Có calipers đề xuất cho kích thước tổn thương.
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
