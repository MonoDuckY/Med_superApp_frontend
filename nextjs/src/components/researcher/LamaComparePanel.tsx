import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  RefreshCw, 
  Loader2, 
  Download, 
  X,
  Split,
  Eye
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

interface LamaComparePanelProps {
  user: any;
}

export default function LamaComparePanel({ user }: LamaComparePanelProps) {
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [img1Url, setImg1Url] = useState<string>("");
  const [img2Url, setImg2Url] = useState<string>("");
  
  const [comparedUrl, setComparedUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  // Lightbox zoom states
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState("");
  const [lightboxTitle, setLightboxTitle] = useState("");

  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    const urls: string[] = [];
    if (img1Url) urls.push(img1Url);
    if (img2Url) urls.push(img2Url);
    if (comparedUrl) urls.push(comparedUrl);
    urlsRef.current = urls;
  }, [img1Url, img2Url, comparedUrl]);

  useEffect(() => {
    return () => {
      urlsRef.current.forEach(url => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const handleImage1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (img1Url.startsWith("blob:")) URL.revokeObjectURL(img1Url);
    setImage1(file);
    setImg1Url(URL.createObjectURL(file));
    setComparedUrl(""); // Reset previous comparison
  };

  const handleImage2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (img2Url.startsWith("blob:")) URL.revokeObjectURL(img2Url);
    setImage2(file);
    setImg2Url(URL.createObjectURL(file));
    setComparedUrl(""); // Reset previous comparison
  };

  const handleCompare = async () => {
    if (!image1 || !image2) return;
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://hmsnextgen.io.vn:8080";
    
    try {
      const formData = new FormData();
      formData.append("image1", image1);
      formData.append("image2", image2);
      
      const res = await fetchWithAuth(`${apiUrl}/api/researcher/compare`, {
        method: "POST",
        body: formData
      });
      
      if (res.ok) {
        const blob = await res.blob();
        if (comparedUrl.startsWith("blob:")) URL.revokeObjectURL(comparedUrl);
        const blobUrl = URL.createObjectURL(blob);
        setComparedUrl(blobUrl);
      } else {
        const text = await res.text();
        alert(`Lỗi đối chiếu từ server: ${text || res.statusText}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Đã xảy ra lỗi kết nối: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage1(null);
    setImage2(null);
    if (img1Url.startsWith("blob:")) URL.revokeObjectURL(img1Url);
    if (img2Url.startsWith("blob:")) URL.revokeObjectURL(img2Url);
    if (comparedUrl.startsWith("blob:")) URL.revokeObjectURL(comparedUrl);
    setImg1Url("");
    setImg2Url("");
    setComparedUrl("");
    if (fileInputRef1.current) fileInputRef1.current.value = "";
    if (fileInputRef2.current) fileInputRef2.current.value = "";
  };

  const handleDownloadDiff = () => {
    if (!comparedUrl) return;
    const link = document.createElement("a");
    link.href = comparedUrl;
    link.download = `caliper_diff_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openZoom = (url: string, title: string) => {
    setLightboxUrl(url);
    setLightboxTitle(title);
    setShowLightbox(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] p-6 gap-6 overflow-y-auto">
      
      {/* Lightbox zoom modal */}
      {showLightbox && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors p-2 bg-slate-800/80 rounded-full border-none cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="text-white text-xs font-bold mb-3 uppercase tracking-widest">{lightboxTitle}</div>
          <div className="max-w-4xl max-h-[80vh] overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
            <img src={lightboxUrl} alt={lightboxTitle} className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm flex items-center justify-between shrink-0 text-left">
        <div>
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
            <Split size={16} className="text-[#8B5CF6]" />
            So sánh đối chiếu & Phát hiện sai biệt Caliper (Lama Diff Map)
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Tải lên hai phiên bản ảnh siêu âm (Ảnh gốc chưa xử lý và Ảnh sạch sau khi xóa caliper) để phân tích lập bản đồ sai khác, định vị tọa độ và kiểm tra vùng inpaint.
          </p>
        </div>
        {(image1 || image2) && (
          <button
            onClick={handleReset}
            className="h-8 px-3 flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            Làm mới uploader
          </button>
        )}
      </div>

      {/* Uploader Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
        
        {/* Box 1: Original Image */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              1. Ảnh gốc (Chưa xử lý)
            </h3>
            {image1 && (
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {(image1.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef1} 
            onChange={handleImage1Change} 
            accept="image/*" 
            className="hidden" 
          />

          {!img1Url ? (
            <div 
              onClick={() => fileInputRef1.current?.click()}
              className="border-2 border-dashed border-[#E2E8F0] hover:border-[#8B5CF6] rounded-xl py-12 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group bg-slate-50/30"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#8B5CF6]/10 flex items-center justify-center text-slate-400 group-hover:text-[#8B5CF6] transition-colors">
                <Upload size={18} />
              </div>
              <p className="text-xs font-bold text-slate-700 mt-1">Chọn ảnh siêu âm gốc</p>
              <p className="text-[10px] text-slate-400">Hỗ trợ tệp PNG, JPG, JPEG</p>
            </div>
          ) : (
            <div className="relative rounded-xl border border-slate-100 overflow-hidden bg-slate-950 flex items-center justify-center" style={{ aspectRatio: "4/3" }}>
              <img src={img1Url} alt="Original Preview" className="max-w-full max-h-full object-contain" />
              
              {/* Controls overlay */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button 
                  onClick={() => openZoom(img1Url, "Ảnh gốc chưa xử lý")}
                  className="w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 flex items-center justify-center text-white border-none cursor-pointer transition-colors"
                  title="Phóng to"
                >
                  <Eye size={14} />
                </button>
                <button 
                  onClick={() => { setImage1(null); setImg1Url(""); setComparedUrl(""); }}
                  className="w-8 h-8 rounded-lg bg-red-600/80 hover:bg-red-600 flex items-center justify-center text-white border-none cursor-pointer transition-colors"
                  title="Xóa ảnh"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Box 2: Cleaned Image */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              2. Ảnh sạch (Đã xử lý caliper)
            </h3>
            {image2 && (
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {(image2.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef2} 
            onChange={handleImage2Change} 
            accept="image/*" 
            className="hidden" 
          />

          {!img2Url ? (
            <div 
              onClick={() => fileInputRef2.current?.click()}
              className="border-2 border-dashed border-[#E2E8F0] hover:border-[#8B5CF6] rounded-xl py-12 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group bg-slate-50/30"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#8B5CF6]/10 flex items-center justify-center text-slate-400 group-hover:text-[#8B5CF6] transition-colors">
                <Upload size={18} />
              </div>
              <p className="text-xs font-bold text-slate-700 mt-1">Chọn ảnh sau khi xóa thước đo</p>
              <p className="text-[10px] text-slate-400">Hỗ trợ tệp PNG, JPG, JPEG</p>
            </div>
          ) : (
            <div className="relative rounded-xl border border-slate-100 overflow-hidden bg-slate-950 flex items-center justify-center" style={{ aspectRatio: "4/3" }}>
              <img src={img2Url} alt="Processed Preview" className="max-w-full max-h-full object-contain" />
              
              {/* Controls overlay */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button 
                  onClick={() => openZoom(img2Url, "Ảnh sạch đã xử lý caliper")}
                  className="w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 flex items-center justify-center text-white border-none cursor-pointer transition-colors"
                  title="Phóng to"
                >
                  <Eye size={14} />
                </button>
                <button 
                  onClick={() => { setImage2(null); setImg2Url(""); setComparedUrl(""); }}
                  className="w-8 h-8 rounded-lg bg-red-600/80 hover:bg-red-600 flex items-center justify-center text-white border-none cursor-pointer transition-colors"
                  title="Xóa ảnh"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compare Action Button */}
      {image1 && image2 && !comparedUrl && (
        <div className="flex justify-center shrink-0">
          <button
            onClick={handleCompare}
            disabled={loading}
            className="px-6 h-10 text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7c4dff] disabled:opacity-50 rounded-xl transition-all border-none cursor-pointer flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Đang xử lý đối chiếu sai biệt...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Phân tích đối chiếu sai biệt (Lama Compare)
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading scanner animation */}
      {loading && (
        <div className="flex-1 min-h-[250px] bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col items-center justify-center p-8 text-center shrink-0">
          <Loader2 size={36} className="text-[#8B5CF6] animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-700">Đang quét phân tích sự khác nhau giữa hai ảnh...</p>
          <p className="text-[10px] text-slate-400 mt-1">Mạng nơ-ron đang so sánh từng pixel để nhận diện các thay đổi inpaint.</p>
        </div>
      )}

      {/* Results Section */}
      {comparedUrl && !loading && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col gap-5 text-left shrink-0">
          
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Kết quả đối chiếu sai biệt
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Bản đồ sai biệt làm nổi bật tọa độ các caliper thước đo và vùng nét vẽ đã bị xóa bỏ.</p>
            </div>
            <button
              onClick={handleDownloadDiff}
              className="h-8 px-3 flex items-center gap-1.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-lg transition-colors border-none cursor-pointer shadow-sm"
            >
              <Download size={13} />
              Tải ảnh sai biệt
            </button>
          </div>

          <div className="flex justify-center">
            <div className="flex flex-col gap-2 w-full max-w-xl">
              <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} />
                Bản đồ sai biệt (Diff Map)
              </span>
              <div className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-violet-100 shadow-sm" style={{ aspectRatio: "4/3" }}>
                <img src={comparedUrl} alt="Caliper Difference Map" className="max-w-full max-h-full object-contain" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold text-white bg-violet-600 shadow-sm">
                  LAMA DIFF
                </div>
                <button 
                  onClick={() => openZoom(comparedUrl, "Bản đồ sai biệt (Diff Map)")}
                  className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 flex items-center justify-center text-white border-none cursor-pointer transition-colors"
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
