"use client";

import { useState, useRef } from "react";
import { AiService, DiagnosticResponse } from "@/services/ai.service";

export default function DiagnosticsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DiagnosticResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // Reset result when new file is chosen
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    try {
      const response = await AiService.analyzeUltrasound(selectedFile, "Patient-123");
      setResult(response);
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi phân tích ảnh!");
    } finally {
      setIsProcessing(false);
    }
  };

  // Hàm render viền đỏ đè lên ảnh
  const renderPolygons = () => {
    if (!result?.data?.annotations || result.data.annotations.length === 0) return null;
    
    const { width, height } = result.data.image;
    
    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {result.data.annotations.map((polygon, index) => {
          // polygon = [[x1, y1], [x2, y2], ...]
          const pointsStr = polygon.map((point: number[]) => `${point[0]},${point[1]}`).join(" ");
          return (
            <polygon
              key={index}
              points={pointsStr}
              fill="rgba(255, 0, 0, 0.2)"
              stroke="red"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">AI Diagnostic Support</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cột trái: Upload và thông tin */}
          <div className="flex-1 space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-blue-100 transition"
              >
                Chọn ảnh siêu âm
              </label>
              <p className="mt-2 text-sm text-gray-500">
                {selectedFile ? selectedFile.name : "Hoặc kéo thả file vào đây"}
              </p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isProcessing}
              className={`w-full py-3 rounded-lg font-bold text-white transition ${
                !selectedFile || isProcessing 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isProcessing ? "Đang xử lý AI..." : "Chẩn đoán ngay"}
            </button>

            {result && (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                <h3 className="font-bold">Kết quả chẩn đoán:</h3>
                <p>{result.message}</p>
                <ul className="list-disc ml-5 mt-2 text-sm">
                  <li>Model: {result.data?.info?.model}</li>
                  <li>Số vùng phát hiện: {result.data?.annotations?.length || 0}</li>
                </ul>
              </div>
            )}
          </div>

          {/* Cột phải: Preview ảnh */}
          <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center min-h-[400px] p-4">
            {result?.data?.image?.processed_image_base64 ? (
              // Hiện ảnh sau khi xử lý (kèm SVG đè lên)
              <div className="relative inline-block">
                <img
                  src={result.data.image.processed_image_base64}
                  alt="Processed Ultrasound"
                  className="max-w-full rounded-md shadow-md"
                />
                {renderPolygons()}
              </div>
            ) : previewUrl ? (
              // Hiện ảnh preview gốc
              <img
                src={previewUrl}
                alt="Original Preview"
                className="max-w-full rounded-md shadow-md"
              />
            ) : (
              <p className="text-gray-400">Chưa có ảnh</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
