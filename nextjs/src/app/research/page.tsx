"use client";

import React, { useState } from "react";
import { Upload, Settings, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

export default function ResearchDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState({
    brightness: 0,
    contrast: 1.0,
    sharpness: 0.0,
    enable_safe_area: true,
    enable_text_removal: true,
    enable_srad: true,
    enable_augmentation: true
  });
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleOptionChange = (key: string, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    setMessage("Đang tải lên và xử lý dataset...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("options", JSON.stringify(options));
    // Provide a dummy webhook URL for the local pipeline
    formData.append("webhook_url", "http://localhost:8080/api/webhooks/ai-job-completed");

    try {
      const response = await fetch("http://localhost:8080/api/ai/research/batch", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        const jobId = result.data?.job_id;
        setStatus("processing");
        setMessage(`Đang xử lý dữ liệu... Job ID: ${jobId}`);
        setProgress({ processed: 0, total: 0 });
        
        // Bắt đầu vòng lặp polling
        const intervalId = setInterval(async () => {
          try {
            const res = await fetch(`http://localhost:8080/api/ai/research/batch/${jobId}/status`);
            if (res.ok) {
              const data = await res.json();
              if (data.status === "processing") {
                setProgress({ processed: data.processed || 0, total: data.total || 0 });
              } else if (data.status === "success") {
                clearInterval(intervalId);
                setStatus("success");
                setMessage(`Đã xử lý xong! Job ID: ${jobId}`);
                setDownloadUrl(data.download_url);
                setProgress({ processed: data.processed_count || 0, total: data.processed_count || 0 });
              }
            }
          } catch (e) {
            console.error("Lỗi khi polling tiến độ:", e);
          }
        }, 2000);
        
      } else {
        setStatus("error");
        setMessage(`Lỗi: ${result.message}`);
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(`Lỗi kết nối: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center space-x-4 border-b border-neutral-800 pb-6">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Dataset Preprocessing</h1>
            <p className="text-neutral-400 mt-1">Chuẩn bị và làm sạch dữ liệu siêu âm cho huấn luyện AI (UC-23)</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Cột trái: Upload & Toggles */}
          <div className="space-y-6">
            
            {/* Upload Section */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-white">1. Chọn Dataset (.zip)</h2>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-neutral-700 border-dashed rounded-xl cursor-pointer hover:bg-neutral-800/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-neutral-500" />
                  <p className="mb-2 text-sm text-neutral-400">
                    <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-neutral-500">ZIP file containing ultrasound images</p>
                </div>
                <input type="file" accept=".zip" className="hidden" onChange={handleFileChange} required />
              </label>
              {file && (
                <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300 flex items-center">
                  <CheckCircle size={16} className="mr-2" />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-xl font-semibold mb-2 text-white">2. Quy trình xử lý (Pipeline)</h2>
              
              <ToggleOption 
                title="Lọc vùng siêu âm an toàn (Safe Area)"
                description="Tự động cắt (crop) bỏ các phần viền đen thừa bên ngoài hình quạt siêu âm."
                checked={options.enable_safe_area}
                onChange={(c: boolean) => handleOptionChange("enable_safe_area", c)}
              />
              
              <ToggleOption 
                title="Xóa Caliper và Chữ (Inpaint)"
                description="Xóa bỏ các dấu đo (+) và văn bản trên ảnh để tránh mô hình học sai đặc trưng."
                checked={options.enable_text_removal}
                onChange={(c: boolean) => handleOptionChange("enable_text_removal", c)}
              />
              
              <ToggleOption 
                title="Khử nhiễu đốm SRAD"
                description="Giảm nhiễu hạt (speckle noise) đặc trưng của ảnh siêu âm nhưng vẫn giữ cạnh."
                checked={options.enable_srad}
                onChange={(c: boolean) => handleOptionChange("enable_srad", c)}
              />

              <div className="pt-4 border-t border-neutral-800 mt-4">
                <ToggleOption 
                  title="Làm giàu dữ liệu (Augmentation x4)"
                  description="Sinh thêm ảnh Lật ngang, xoay dọc, và xoay 180 độ. (Cảnh báo: Tốn tài nguyên)"
                  checked={options.enable_augmentation}
                  onChange={(c: boolean) => handleOptionChange("enable_augmentation", c)}
                  warning
                />
              </div>
            </div>
          </div>

          {/* Cột phải: Thanh gạt (Sliders) */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl h-full flex flex-col">
              <h2 className="text-xl font-semibold mb-6 text-white">3. Tinh chỉnh ảnh (Enhancement)</h2>
              
              <div className="space-y-8 flex-1">
                {/* Brightness */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-neutral-300">Độ sáng (Brightness)</label>
                    <span className="text-xs px-2 py-1 bg-neutral-800 rounded text-neutral-400">{options.brightness}</span>
                  </div>
                  <input 
                    type="range" min="-100" max="100" step="1" 
                    value={options.brightness}
                    onChange={(e) => handleOptionChange("brightness", parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-neutral-300">Độ tương phản (Contrast)</label>
                    <span className="text-xs px-2 py-1 bg-neutral-800 rounded text-neutral-400">{options.contrast.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="2.0" step="0.1" 
                    value={options.contrast}
                    onChange={(e) => handleOptionChange("contrast", parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Sharpness */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-neutral-300">Độ sắc nét (Sharpness)</label>
                    <span className="text-xs px-2 py-1 bg-neutral-800 rounded text-neutral-400">{options.sharpness.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" min="0.0" max="2.0" step="0.1" 
                    value={options.sharpness}
                    onChange={(e) => handleOptionChange("sharpness", parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              {/* Trạng thái & Nút Submit */}
              <div className="mt-8 pt-6 border-t border-neutral-800">
                {status !== "idle" && (
                  <div className={`p-4 rounded-xl mb-4 flex items-start space-x-3 text-sm ${
                    (status === "uploading" || status === "processing") ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                    status === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {(status === "uploading" || status === "processing") && <RefreshCw size={18} className="animate-spin mt-0.5 flex-shrink-0" />}
                    {status === "success" && <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />}
                    {status === "error" && <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />}
                    
                    <div className="flex-1">
                      <span className="block mb-1">{message}</span>
                      
                      {/* Thanh Progress Bar */}
                      {status === "processing" && progress.total > 0 && (
                        <div className="w-full bg-neutral-900 rounded-full h-2 mt-3 border border-neutral-800">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                          ></div>
                          <div className="text-xs text-neutral-500 mt-1 text-right">
                            {progress.processed} / {progress.total} ảnh ({(progress.processed/progress.total*100).toFixed(1)}%)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!downloadUrl ? (
                  <button
                    type="submit"
                    disabled={!file || status === "uploading" || status === "processing"}
                    className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl font-semibold transition-colors focus:ring-4 focus:ring-indigo-500/30 outline-none"
                  >
                    {status === "uploading" ? "Đang upload..." : status === "processing" ? "Đang xử lý..." : "Chạy Tiền xử lý (Execute)"}
                  </button>
                ) : (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors focus:ring-4 focus:ring-emerald-500/30 outline-none"
                  >
                    Tải File Kết Quả (.zip)
                  </a>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToggleOption({ title, description, checked, onChange, warning = false }: any) {
  return (
    <div className="flex items-start justify-between space-x-4">
      <div>
        <h3 className={`text-sm font-medium ${warning ? "text-amber-400" : "text-neutral-200"}`}>{title}</h3>
        <p className="text-xs text-neutral-500 mt-1">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
      </label>
    </div>
  );
}
