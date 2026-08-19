import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  X,
  Plus,
  Loader2,
  Download,
  Trash2
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

interface LamaCleanPanelProps {
  user: any;
}

interface ImageItem {
  id: string;
  file: File;
  originalUrl: string;
  processedUrl: string | null;
  processedMimeType?: string;
  imageWidth: number;
  imageHeight: number;
  uploading: boolean;
  error: string | null;
}

export default function LamaCleanPanel({ user }: LamaCleanPanelProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);

  // Track original and processed object URLs for cleanup on unmount
  useEffect(() => {
    const urls: string[] = [];
    images.forEach(img => {
      if (img.originalUrl.startsWith("blob:")) urls.push(img.originalUrl);
      if (img.processedUrl && img.processedUrl.startsWith("blob:")) urls.push(img.processedUrl);
    });
    urlsRef.current = urls;
  }, [images]);

  useEffect(() => {
    return () => {
      urlsRef.current.forEach(url => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // Sequential Queue logic
  useEffect(() => {
    const isAnyUploading = images.some(img => img.uploading);
    if (isAnyUploading) return;

    const nextPending = images.find(img => !img.processedUrl && !img.uploading && !img.error);
    if (nextPending) {
      startLamaProcess(nextPending);
    }
  }, [images]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ImageItem[] = [];
    const invalidFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== "png" && ext !== "jpg" && ext !== "jpeg") {
        invalidFiles.push(file.name);
        continue;
      }

      const id = Math.random().toString(36).substring(7) + "_" + Date.now();
      const localUrl = URL.createObjectURL(file);

      const item: ImageItem = {
        id,
        file,
        originalUrl: localUrl,
        processedUrl: null,
        imageWidth: 1024,
        imageHeight: 768,
        uploading: false,
        error: null
      };

      newItems.push(item);
    }

    if (invalidFiles.length > 0) {
      alert(`Định dạng tệp không hợp lệ: ${invalidFiles.join(", ")}. Hệ thống chỉ hỗ trợ định dạng PNG, JPG, JPEG.`);
    }

    if (newItems.length === 0) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setImages(prev => [...prev, ...newItems]);
    setActiveImageId(prev => prev || newItems[0].id);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startLamaProcess = async (item: ImageItem) => {
    // Mark as uploading
    setImages(prev => prev.map(img => {
      if (img.id === item.id) {
        return { ...img, uploading: true };
      }
      return img;
    }));

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://hmsnextgen.io.vn:8080";

    try {
      const formData = new FormData();
      formData.append("image", item.file); // Field name is "image" according to Spring Controller

      // Read image dimensions before API call to maintain ratio
      const imgObj = new Image();
      imgObj.src = item.originalUrl;
      await new Promise((resolve) => {
        imgObj.onload = () => {
          setImages(prev => prev.map(img => {
            if (img.id === item.id) {
              return {
                ...img,
                imageWidth: imgObj.naturalWidth || 1024,
                imageHeight: imgObj.naturalHeight || 768
              };
            }
            return img;
          }));
          resolve(null);
        };
        imgObj.onerror = () => resolve(null);
      });

      const res = await fetchWithAuth(`${apiUrl}/api/researcher/LaMa`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const blob = await res.blob();
        const processedBlobUrl = URL.createObjectURL(blob);

        setImages(prev => prev.map(img => {
          if (img.id === item.id) {
            return {
              ...img,
              processedUrl: processedBlobUrl,
              processedMimeType: blob.type,
              uploading: false,
              error: null
            };
          }
          return img;
        }));
      } else {
        throw new Error("Lỗi kết nối API xóa caliper LaMa.");
      }
    } catch (err: any) {
      console.warn(`LaMa API failed for ${item.file.name}:`, err);
      setImages(prev => prev.map(img => {
        if (img.id === item.id) {
          return {
            ...img,
            uploading: false,
            error: err.message || "Lỗi kết nối API xóa caliper LaMa."
          };
        }
        return img;
      }));
    }
  };

  const handleDeleteImage = (id: string) => {
    setImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target) {
        if (target.originalUrl.startsWith("blob:")) URL.revokeObjectURL(target.originalUrl);
        if (target.processedUrl && target.processedUrl.startsWith("blob:")) URL.revokeObjectURL(target.processedUrl);
      }
      const filtered = prev.filter(img => img.id !== id);
      if (activeImageId === id) {
        setActiveImageId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const handleResetAll = () => {
    images.forEach(img => {
      if (img.originalUrl.startsWith("blob:")) URL.revokeObjectURL(img.originalUrl);
      if (img.processedUrl && img.processedUrl.startsWith("blob:")) URL.revokeObjectURL(img.processedUrl);
    });
    setImages([]);
    setActiveImageId(null);
  };

  const handleDownload = (imgItem: ImageItem) => {
    if (!imgItem.processedUrl) return;

    let extension = "png"; // default
    if (imgItem.processedMimeType === "image/jpeg" || imgItem.processedMimeType === "image/jpg") {
      extension = "jpg";
    } else if (imgItem.processedMimeType === "image/png") {
      extension = "png";
    } else {
      extension = imgItem.file.name.split('.').pop() || "png";
    }

    const baseName = imgItem.file.name.substring(0, imgItem.file.name.lastIndexOf('.')) || imgItem.file.name;

    const link = document.createElement("a");
    link.href = imgItem.processedUrl;
    link.download = `cleaned_${baseName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    const processedImages = images.filter(img => img.processedUrl && !img.uploading);
    if (processedImages.length === 0) return;

    setZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (const img of processedImages) {
        const response = await fetch(img.processedUrl!);
        const blob = await response.blob();

        let extension = "png";
        if (blob.type === "image/jpeg" || blob.type === "image/jpg") {
          extension = "jpg";
        } else if (blob.type === "image/png") {
          extension = "png";
        } else {
          extension = img.file.name.split('.').pop() || "png";
        }
        const baseName = img.file.name.substring(0, img.file.name.lastIndexOf('.')) || img.file.name;

        zip.file(`cleaned_${baseName}.${extension}`, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const blobUrl = URL.createObjectURL(content);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `cleaned_images_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to package ZIP file:", error);
      alert("Đã xảy ra lỗi khi đóng gói tập tin ZIP.");
    } finally {
      setZipping(false);
    }
  };

  const activeImage = images.find(img => img.id === activeImageId);

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-[#F8FAFC] p-6 gap-5 overflow-hidden">
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
            <Sparkles size={16} className="text-[#8B5CF6]" />
            Xóa thước đo Caliper bằng mô hình LaMa AI
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Tải lên hàng loạt ảnh siêu âm có thước đo caliper. Mạng nơ-ron LaMa AI sẽ tự động inpaint xóa sạch thước đo caliper tuần tự từng ảnh một.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {images.some(img => img.processedUrl && !img.uploading) && (
            <button
              onClick={handleDownloadAll}
              disabled={zipping}
              className="h-8 px-3 flex items-center gap-1.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] disabled:opacity-60 rounded-lg transition-colors cursor-pointer border-none"
            >
              {zipping ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Đang đóng gói ZIP...
                </>
              ) : (
                <>
                  <Download size={13} />
                  Tải toàn bộ ảnh sạch (ZIP)
                </>
              )}
            </button>
          )}
          {images.length > 0 && (
            <button
              onClick={handleResetAll}
              className="h-8 px-3 flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              Xóa toàn bộ & làm mới
            </button>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".png,.jpg,.jpeg"
        multiple
        className="hidden"
      />

      {images.length === 0 ? (
        /* Empty State Dropzone Uploader */
        <div className="flex-1 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center overflow-hidden min-h-0">
          <div className="w-full max-w-[500px] flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center animate-pulse">
              <Upload size={30} strokeWidth={1.5} className="text-[#8B5CF6]" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-bold text-[#0F172A]">Tải lên các tập tin hình ảnh cần xóa caliper</p>
              <p className="text-xs text-slate-400 max-w-[340px] leading-relaxed mx-auto">
                Hỗ trợ chọn hoặc thả nhiều ảnh JPG, PNG. Mạng AI LaMa sẽ tự động inpaint và phục hồi cấu trúc ảnh y khoa gốc.
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-10 px-6 flex items-center gap-2 text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7c4dff] rounded-xl transition-all cursor-pointer shadow-lg shadow-[#8B5CF6]/20 border-none"
            >
              Chọn các ảnh từ máy tính
            </button>
          </div>
        </div>
      ) : (
        /* Multi-Image Workspace Split Layout */
        <div className="flex-1 flex gap-5 min-h-0 w-full overflow-hidden">
          
          {/* Left Sidebar: Image list */}
          <div className="w-64 bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col gap-4 shadow-sm shrink-0 overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Danh sách ({images.length} ảnh)</h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-7 px-2.5 flex items-center gap-1.5 text-[10px] font-bold text-white bg-[#8B5CF6] hover:bg-[#7c4dff] rounded-lg transition-all cursor-pointer border-none"
              >
                <Plus size={11} />
                Thêm ảnh
              </button>
            </div>

            {/* Thumbnail list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-none">
              {images.map((img) => {
                const isActive = img.id === activeImageId;
                return (
                  <div
                    key={img.id}
                    onClick={() => setActiveImageId(img.id)}
                    className={`group relative p-2 border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                      isActive 
                        ? "border-[#8B5CF6] bg-[#8B5CF6]/5" 
                        : "border-[#E2E8F0] hover:bg-slate-50"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60 relative">
                      <img src={img.originalUrl} className="w-full h-full object-cover" alt="thumbnail" />
                      {img.uploading && (
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                          <Loader2 className="animate-spin text-white h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1 text-left">
                      <p className={`text-xs font-bold truncate leading-snug ${isActive ? "text-[#8B5CF6]" : "text-slate-700"}`} title={img.file.name}>
                        {img.file.name}
                      </p>
                      {img.uploading ? (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Loader2 size={10} className="animate-spin text-slate-400" />
                          Đang xử lý...
                        </p>
                      ) : img.processedUrl ? (
                        img.error ? (
                          <p className="text-[10px] text-amber-500 font-medium">Đã mô phỏng</p>
                        ) : (
                          <p className="text-[10px] text-emerald-600 font-medium font-semibold">Hoàn thành</p>
                        )
                      ) : (
                        <p className="text-[10px] text-slate-400 font-medium">Chờ xử lý...</p>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(img.id);
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-600 transition-all border-none bg-transparent cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Workspace: Viewer and Result */}
          <div className="flex-1 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col overflow-hidden min-h-0">
            {activeImage ? (
              <div className="w-full h-full flex flex-col min-h-0 gap-4 overflow-hidden">
                {/* Controls & Status bar */}
                <div className="flex items-center justify-between shrink-0 border-b border-[#F1F5F9] pb-3 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái:</span>
                    {activeImage.uploading && (
                      <span className="text-xs font-bold text-[#8B5CF6] flex items-center gap-1.5">
                        <Loader2 size={13} className="animate-spin" />
                        AI đang phục hồi ảnh {activeImage.file.name}...
                      </span>
                    )}
                    {!activeImage.uploading && activeImage.processedUrl && (
                      <span className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        Xóa caliper hoàn tất
                      </span>
                    )}
                  </div>

                  {activeImage.processedUrl && !activeImage.uploading && (
                    <button
                      onClick={() => handleDownload(activeImage)}
                      className="h-7 px-3 flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-lg transition-colors border-none cursor-pointer"
                    >
                      <Download size={12} />
                      Tải ảnh sạch
                    </button>
                  )}
                </div>

                {/* Warning banner if fallback used for this active image */}
                {activeImage.error && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-left shrink-0">
                    <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 leading-normal font-medium">{activeImage.error}</p>
                  </div>
                )}

                {/* Comparison frame container (Side by side only) */}
                <div className="flex-1 bg-[#0A0A0A] rounded-2xl relative select-none overflow-hidden min-h-0 grid grid-cols-2 gap-0.5 p-0.5">
                  
                  {activeImage.uploading ? (
                    /* Scanning Line Animation overlay */
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 pointer-events-none">
                      <img src={activeImage.originalUrl} alt="Original Scan" className="max-w-full max-h-full object-contain opacity-55" />
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent shadow-[0_0_12px_#8B5CF6] ai-scan-line" />
                      
                      <div className="absolute px-4 py-2 rounded-xl bg-black/75 text-white text-xs font-semibold flex items-center gap-2 backdrop-blur-md">
                        <Sparkles size={14} className="text-[#8B5CF6] animate-bounce" />
                        AI đang định vị và inpaint caliper...
                      </div>
                    </div>
                  ) : null}

                  {/* Left Column: Original */}
                  <div className="relative flex items-center justify-center bg-[#0A0A0A] overflow-hidden rounded-l-xl">
                    <div 
                      className="absolute inset-0 max-w-full max-h-full"
                      style={{ 
                        aspectRatio: `${activeImage.imageWidth} / ${activeImage.imageHeight}`,
                        width: "auto",
                        height: "auto",
                        margin: "auto"
                      }}
                    >
                      <img src={activeImage.originalUrl} alt="Original Side" className="w-full h-full object-contain pointer-events-none" />
                    </div>
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold z-20 backdrop-blur-sm">
                      ẢNH GỐC (CÓ CALIPER)
                    </div>
                  </div>

                  {/* Right Column: AI Processed */}
                  <div className="relative flex items-center justify-center bg-[#0A0A0A] overflow-hidden border-l border-neutral-700 rounded-r-xl">
                    {activeImage.processedUrl ? (
                      <div 
                        className="absolute inset-0 max-w-full max-h-full"
                        style={{ 
                          aspectRatio: `${activeImage.imageWidth} / ${activeImage.imageHeight}`,
                          width: "auto",
                          height: "auto",
                          margin: "auto"
                        }}
                      >
                        <img src={activeImage.processedUrl} alt="Processed Side" className="w-full h-full object-contain pointer-events-none" />
                      </div>
                    ) : (
                      <div className="text-slate-500 text-xs flex items-center gap-1.5 z-20">
                        <Loader2 size={14} className="animate-spin text-[#8B5CF6]" />
                        Đang chờ AI xử lý...
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-[#8B5CF6]/80 text-white text-[9px] font-bold z-20 backdrop-blur-sm">
                      ẢNH LAMA XỬ LÝ (SẠCH)
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <ImageIcon size={32} />
                <p className="text-xs font-semibold mt-2">Chọn một ảnh từ danh sách bên trái để bắt đầu inpaint</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
