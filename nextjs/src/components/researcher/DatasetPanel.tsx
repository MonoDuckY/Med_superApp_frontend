import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Image as ImageIcon, 
  Calendar, 
  User, 
  Phone, 
  Shield, 
  CheckCircle2, 
  Eye, 
  X, 
  ExternalLink, 
  RefreshCw, 
  Database,
  Clock,
  Upload,
  Copy,
  Plus,
  FolderOpen
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

interface DatasetPanelProps {
  user: any;
}

// Expected JSON structure from API mock database
interface MedicalImage {
  imageId: string;
  url: string;
  expiresAt: string;
  description?: string;
}

interface PatientRecord {
  patientId: string;
  patient: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  appointmentId: string;
  appointmentStatus: string;
  appointmentRequestedAt: string;
  medicalRecordId: string;
  medicalImages: MedicalImage[];
}

const MOCK_RESEARCH_RECORDS: PatientRecord[] = [
  {
    patientId: "patient-01",
    patient: { id: "patient-01", fullName: "Vũ Bình Minh", phoneNumber: "+84912345678" },
    appointmentId: "apt-101",
    appointmentStatus: "COMPLETED",
    appointmentRequestedAt: "2026-08-20T12:59:49Z",
    medicalRecordId: "mr-201",
    medicalImages: [
      { 
        imageId: "scan-abdominal-1.jpg", 
        url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop", 
        expiresAt: "2026-08-27T13:59:49Z",
        description: "Siêu âm ổ bụng - Quan sát thấy túi mật căng vừa, thành mỏng dưới 3mm."
      },
      { 
        imageId: "scan-abdominal-2.jpg", 
        url: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?q=80&w=1200&auto=format&fit=crop", 
        expiresAt: "2026-08-27T13:59:49Z",
        description: "Siêu âm gan - Nhu moh gan đều, kích thước thùy phải bình thường." 
      }
    ]
  },
  {
    patientId: "patient-02",
    patient: { id: "patient-02", fullName: "Phạm Việt Đức", phoneNumber: "+84988776655" },
    appointmentId: "apt-102",
    appointmentStatus: "COMPLETED",
    appointmentRequestedAt: "2026-08-19T09:15:30Z",
    medicalRecordId: "mr-202",
    medicalImages: [
      { 
        imageId: "xray-chest-1.jpg", 
        url: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop", 
        expiresAt: "2026-08-26T10:15:30Z",
        description: "Phim chụp X-quang phổi thẳng - Vòm hoành hai bên đều, nhu mô phổi sáng bình thường."
      }
    ]
  },
  {
    patientId: "patient-03",
    patient: { id: "patient-03", fullName: "Nguyễn Thị Mai", phoneNumber: "+84933445566" },
    appointmentId: "apt-103",
    appointmentStatus: "COMPLETED",
    appointmentRequestedAt: "2026-08-18T14:40:00Z",
    medicalRecordId: "mr-203",
    medicalImages: [
      { 
        imageId: "mri-brain-1.jpg", 
        url: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=1200&auto=format&fit=crop", 
        expiresAt: "2026-08-25T15:40:00Z",
        description: "Hình ảnh cộng hưởng từ MRI não bộ - Không thấy ổ tổn thương khu trú." 
      },
      { 
        imageId: "mri-brain-2.jpg", 
        url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop", 
        expiresAt: "2026-08-25T15:40:00Z",
        description: "Hệ thống não thất không giãn, đường giữa không lệch." 
      }
    ]
  },
  {
    patientId: "patient-04",
    patient: { id: "patient-04", fullName: "Trần Hoàng Nam", phoneNumber: "+84944556677" },
    appointmentId: "apt-104",
    appointmentStatus: "COMPLETED",
    appointmentRequestedAt: "2026-08-15T11:20:10Z",
    medicalRecordId: "mr-204",
    medicalImages: []
  }
];

const MOCK_FOLDERS = ["Dataset_Cancer_V1", "Dataset_Thyroid_Ultrasound", "Dataset_Liver_Scan"];
const MOCK_FOLDER_IMAGES: Record<string, { imageId: string; url: string; expiresAt: string }[]> = {
  "Dataset_Cancer_V1": [
    { imageId: "img-001.png", url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop", expiresAt: "2026-08-27T13:59:49Z" },
    { imageId: "img-002.png", url: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?q=80&w=1200&auto=format&fit=crop", expiresAt: "2026-08-27T13:59:49Z" }
  ],
  "Dataset_Thyroid_Ultrasound": [
    { imageId: "thyroid-01.png", url: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop", expiresAt: "2026-08-26T10:15:30Z" }
  ],
  "Dataset_Liver_Scan": [
    { imageId: "liver-01.png", url: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=1200&auto=format&fit=crop", expiresAt: "2026-08-25T15:40:00Z" }
  ]
};

export default function DatasetPanel({ user }: DatasetPanelProps) {
  const [viewMode, setViewMode] = useState<"patients" | "folders">("patients");
  
  // Patient records states
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Folder states
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(null);
  const [folderImages, setFolderImages] = useState<{ imageId: string; url: string; expiresAt: string }[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [folderSearchTerm, setFolderSearchTerm] = useState("");
  
  // Upload and Clone state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cloningFolder, setCloningFolder] = useState(false);
  
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ imageId: string; url: string }[]>([]);

  const folderFileInputRef = useRef<HTMLInputElement>(null);

  const fetchRecords = async () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://hmsnextgen.io.vn:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/researcher/medical-records/images`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setRecords(result.data);
          return;
        }
      }
      setRecords(MOCK_RESEARCH_RECORDS);
    } catch (e) {
      console.error("Failed to fetch researcher records, using mock data:", e);
      setRecords(MOCK_RESEARCH_RECORDS);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    setLoadingFolders(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://hmsnextgen.io.vn:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/researcher/medical-images/folders`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setFolders(result.data);
          return;
        }
      }
      setFolders(MOCK_FOLDERS);
    } catch (e) {
      console.error("Failed to fetch folders, using mock:", e);
      setFolders(MOCK_FOLDERS);
    } finally {
      setLoadingFolders(false);
    }
  };

  const fetchFolderImages = async (folderName: string) => {
    setLoadingImages(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://hmsnextgen.io.vn:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/researcher/medical-images/folders/${folderName}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setFolderImages(result.data);
          return;
        }
      }
      setFolderImages(MOCK_FOLDER_IMAGES[folderName] || []);
    } catch (e) {
      console.error(`Failed to fetch images for folder ${folderName}, using mock:`, e);
      setFolderImages(MOCK_FOLDER_IMAGES[folderName] || []);
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    if (viewMode === "patients") {
      fetchRecords();
    } else {
      fetchFolders();
    }
  }, [viewMode]);

  useEffect(() => {
    if (selectedFolderName) {
      fetchFolderImages(selectedFolderName);
    }
  }, [selectedFolderName]);

  const handleUploadFolderImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFolderName) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== "png" && ext !== "jpg" && ext !== "jpeg") {
      alert(`Định dạng tệp không hợp lệ: ${file.name}. Hệ thống chỉ hỗ trợ định dạng PNG, JPG, JPEG.`);
      if (folderFileInputRef.current) folderFileInputRef.current.value = "";
      return;
    }

    setUploadingImage(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://hmsnextgen.io.vn:8080";
    try {
      const formData = new FormData();
      formData.append("file", file); // Field name is "file" in Swagger multipart

      const res = await fetchWithAuth(`${apiUrl}/api/researcher/medical-images/folders/${selectedFolderName}/images`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          alert("Tải lên hình ảnh thành công!");
          fetchFolderImages(selectedFolderName);
          if (folderFileInputRef.current) folderFileInputRef.current.value = "";
          return;
        }
      }
      throw new Error("Không thể upload ảnh.");
    } catch (err: any) {
      alert(`Lỗi upload ảnh: ${err.message || err}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCloneFolder = async () => {
    if (!selectedFolderName) return;
    const targetFolderName = prompt(`Nhập tên thư mục mới để sao bản (clone) từ "${selectedFolderName}":`);
    if (!targetFolderName || targetFolderName.trim() === "") return;

    setCloningFolder(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://hmsnextgen.io.vn:8080";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/researcher/medical-images/folders/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceFolderName: selectedFolderName,
          targetFolderName: targetFolderName.trim()
        })
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          alert(`Đã clone thư mục thành công thành "${targetFolderName}"!`);
          fetchFolders();
          setSelectedFolderName(targetFolderName.trim());
          return;
        }
      }
      throw new Error("Không thể clone thư mục.");
    } catch (err: any) {
      alert(`Lỗi clone thư mục: ${err.message || err}`);
    } finally {
      setCloningFolder(false);
    }
  };

  const handleCreateNewFolder = () => {
    const newFolderName = prompt("Nhập tên thư mục Dataset mới muốn tạo:");
    if (!newFolderName || newFolderName.trim() === "") return;
    
    const formattedName = newFolderName.trim();
    setFolders(prev => {
      if (prev.includes(formattedName)) return prev;
      return [...prev, formattedName];
    });
    setSelectedFolderName(formattedName);
    setFolderImages([]);
    
    setTimeout(() => {
      folderFileInputRef.current?.click();
    }, 100);
  };

  // Filter records
  const filteredRecords = records.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      r.patient.fullName.toLowerCase().includes(term) ||
      r.patient.phoneNumber.includes(term) ||
      r.patientId.toLowerCase().includes(term)
    );
  });

  // Filter folders
  const filteredFolders = folders.filter(f => 
    f.toLowerCase().includes(folderSearchTerm.toLowerCase())
  );

  const selectedRecord = records.find(r => r.appointmentId === selectedRecordId);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="flex-1 flex overflow-hidden w-full h-full">
      {/* Hidden input for folder upload */}
      <input 
        type="file"
        ref={folderFileInputRef}
        onChange={handleUploadFolderImage}
        accept=".png,.jpg,.jpeg"
        className="hidden"
      />

      {/* ── Left Sidebar (32% width): Switcher, Search & List ── */}
      <div className="w-[32%] border-r border-[#E2E8F0] bg-white flex flex-col min-h-0 shrink-0">
        {/* Header Title */}
        <div className="p-4 pb-2 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5 text-left">
            <Database size={15} className="text-[#8B5CF6]" />
            Kho ảnh nghiên cứu
          </h3>
        </div>

        {/* Toggle Mode Switcher */}
        <div className="px-4 pb-3 border-b border-[#F1F5F9] flex gap-2 shrink-0">
          <button
            onClick={() => setViewMode("patients")}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
              viewMode === "patients"
                ? "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20"
                : "bg-white text-slate-500 border-[#E2E8F0] hover:bg-slate-50"
            }`}
          >
            Hồ sơ bệnh nhân
          </button>
          <button
            onClick={() => setViewMode("folders")}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
              viewMode === "folders"
                ? "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20"
                : "bg-white text-slate-500 border-[#E2E8F0] hover:bg-slate-50"
            }`}
          >
            Thư mục Dataset
          </button>
        </div>

        {/* Search header & Actions */}
        <div className="p-4 border-b border-[#F1F5F9] flex flex-col gap-3 shrink-0">
          {viewMode === "patients" ? (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm tên, số điện thoại, mã bệnh nhân..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#E2E8F0] rounded-xl outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/10 bg-[#F8FAFC] text-[#0F172A] placeholder:text-slate-400 transition-all"
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm tên thư mục dataset..."
                  value={folderSearchTerm}
                  onChange={e => setFolderSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-[#E2E8F0] rounded-xl outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/10 bg-[#F8FAFC] text-[#0F172A] placeholder:text-slate-400 transition-all"
                />
              </div>
              <button
                onClick={handleCreateNewFolder}
                className="h-9 px-3 text-[10px] font-bold text-white bg-[#8B5CF6] hover:bg-[#7c4dff] rounded-xl transition-all border-none cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus size={12} />
                Tạo mới
              </button>
            </div>
          )}
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-[#F8FAFC]">
          {viewMode === "patients" ? (
            loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
                <svg className="animate-spin h-5 w-5 text-[#8B5CF6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-[10px]">Đang tải dữ liệu ảnh...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Không tìm thấy hồ sơ nào phù hợp.
              </div>
            ) : (
              filteredRecords.map((r) => {
                const isSelected = r.appointmentId === selectedRecordId;
                const imageCount = r.medicalImages.length;
                return (
                  <button
                    key={r.appointmentId}
                    onClick={() => {
                      setSelectedRecordId(r.appointmentId);
                      setActiveImageIndex(null);
                    }}
                    className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-2.5 outline-none ${
                      isSelected
                        ? "bg-[#8B5CF6]/5 border-[#8B5CF6] shadow-sm"
                        : "bg-white border-[#E2E8F0] hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#0F172A]">{r.patient.fullName}</p>
                        <p className="text-[10px] text-[#64748B] font-mono mt-0.5">{r.patient.phoneNumber}</p>
                      </div>
                      <span className="text-[9px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                        {r.appointmentStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-2 mt-0.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate(r.appointmentRequestedAt)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[#8B5CF6] bg-[#8B5CF6]/5 px-1.5 py-0.5 rounded">
                        <ImageIcon size={11} />
                        {imageCount} ảnh
                      </span>
                    </div>
                  </button>
                );
              })
            )
          ) : (
            loadingFolders ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
                <svg className="animate-spin h-5 w-5 text-[#8B5CF6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-[10px]">Đang tải thư mục...</p>
              </div>
            ) : filteredFolders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Không tìm thấy thư mục nào.
              </div>
            ) : (
              filteredFolders.map((folderName) => {
                const isSelected = folderName === selectedFolderName;
                return (
                  <button
                    key={folderName}
                    onClick={() => {
                      setSelectedFolderName(folderName);
                      setActiveImageIndex(null);
                    }}
                    className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between outline-none ${
                      isSelected
                        ? "bg-[#8B5CF6]/5 border-[#8B5CF6] shadow-sm"
                        : "bg-white border-[#E2E8F0] hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FolderOpen size={16} className={isSelected ? "text-[#8B5CF6]" : "text-slate-400"} />
                      <span className={`text-xs font-bold truncate ${isSelected ? "text-[#8B5CF6]" : "text-slate-700"}`}>
                        {folderName}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 shrink-0">
                      Dataset
                    </span>
                  </button>
                );
              })
            )
          )}
        </div>
      </div>

      {/* ── Right Content Panel (68% width): Images Grid & Details ── */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
        {viewMode === "patients" ? (
          !selectedRecord ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center animate-pulse">
                <Database size={32} strokeWidth={1.5} className="text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Chọn hồ sơ bệnh nhân</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed mx-auto">
                  Chọn một bệnh nhân từ danh sách bên trái để xem đầy đủ hồ sơ hình ảnh y khoa phục vụ nghiên cứu.
                </p>
              </div>
            </div>
          ) : (
            /* Selected Details & Images Grid */
            <div className="flex-1 flex flex-col min-h-0 p-6 gap-5 overflow-y-auto">
              {/* Patient Info Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm shrink-0 flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">
                    Chi tiết hồ sơ nghiên cứu
                  </span>
                  <div className="flex items-center gap-1.5 text-[#10B981] text-[11px] font-semibold">
                    <CheckCircle2 size={13} />
                    Môi trường an toàn
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Bệnh nhân</span>
                    <div className="flex items-center gap-2 text-xs">
                      <User size={13} className="text-[#8B5CF6]" />
                      <span className="font-semibold text-[#0F172A]">{selectedRecord.patient.fullName}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Liên hệ</span>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <Phone size={13} className="text-slate-400" />
                      <span className="text-[#0F172A]">{selectedRecord.patient.phoneNumber}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Mã bệnh nhân (Patient ID)</span>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#0F172A]">
                      <Shield size={13} className="text-slate-400" />
                      <span>{selectedRecord.patientId}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#F8FAFC]">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Mã ca khám (Appointment ID)</span>
                    <span className="text-xs font-mono text-[#0F172A]">{selectedRecord.appointmentId}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Mã bệnh án (Record ID)</span>
                    <span className="text-xs font-mono text-[#0F172A]">{selectedRecord.medicalRecordId}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Thời gian yêu cầu</span>
                    <div className="flex items-center gap-1.5 text-xs text-[#0F172A]">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{formatDate(selectedRecord.appointmentRequestedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Images Grid */}
              <div className="flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <ImageIcon size={15} className="text-[#8B5CF6]" />
                  Hình ảnh lâm sàng ({selectedRecord.medicalImages.length})
                </span>
              </div>

              {selectedRecord.medicalImages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white border border-dashed border-[#E2E8F0] rounded-2xl text-center gap-2">
                  <ImageIcon size={28} className="text-slate-300" />
                  <p className="text-xs text-slate-400 font-semibold">Không tìm thấy ảnh lâm sàng nào</p>
                  <p className="text-[10px] text-slate-400 max-w-[240px]">Ca khám này không chứa tệp hình ảnh y khoa siêu âm hay chụp chiếu.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 shrink-0">
                  {selectedRecord.medicalImages.map((img, i) => (
                    <div 
                      key={img.imageId} 
                      className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:border-[#8B5CF6] hover:shadow-md transition-all flex flex-col"
                    >
                      <div 
                        onClick={() => {
                          setLightboxImages(selectedRecord.medicalImages);
                          setActiveImageIndex(i);
                          setShowLightbox(true);
                        }}
                        className="relative cursor-zoom-in group/item flex items-center justify-center bg-black animate-[fadeIn_0.2s_ease-out]"
                        style={{ aspectRatio: "4/3" }}
                      >
                        <img src={img.url} alt={img.imageId} className="w-full h-full object-contain transition-transform duration-300 group-hover/item:scale-[1.03]" />
                        <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 text-[9px] font-mono font-bold text-white uppercase tracking-wider backdrop-blur-md">
                          {img.imageId}
                        </div>
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="px-3 py-1.5 rounded-lg bg-black/75 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                            <Eye size={13} />
                            Nhập để xem chi tiết
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col gap-2 text-left border-t border-[#F1F5F9]">
                        <p className="text-[11px] text-[#0F172A] leading-relaxed min-h-[32px]">
                          {img.description || "Không có mô tả chi tiết."}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-[#94A3B8] border-t border-[#F8FAFC] pt-2 mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock size={10} />
                            Hạn link: {formatDate(img.expiresAt)}
                          </span>
                          <a
                            href={img.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-0.5 text-[#8B5CF6] font-semibold hover:underline"
                          >
                            Tải ảnh <ExternalLink size={9} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          /* Folder Mode content */
          !selectedFolderName ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center animate-pulse">
                <FolderOpen size={32} strokeWidth={1.5} className="text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Chọn thư mục Dataset</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed mx-auto">
                  Chọn một thư mục dataset bên trái để quản lý và xem toàn bộ hình ảnh. Bạn cũng có thể clone hoặc tải lên ảnh mới.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 p-6 gap-5 overflow-y-auto">
              {/* Folder Details & Action bar */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm shrink-0 flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider flex items-center gap-1.5">
                    <FolderOpen size={14} />
                    Dataset: {selectedFolderName}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCloneFolder}
                      disabled={cloningFolder}
                      className="h-8 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 rounded-xl transition-all border-none cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy size={13} />
                      {cloningFolder ? "Đang sao bản..." : "Sao bản thư mục"}
                    </button>
                    <button
                      onClick={() => folderFileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="h-8 px-4 text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7c4dff] disabled:opacity-60 rounded-xl transition-all border-none cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload size={13} />
                      {uploadingImage ? "Đang tải lên..." : "Tải ảnh lên thư mục"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs text-[#0F172A] font-semibold">Tên thư mục nguồn:</p>
                  <p className="text-[11px] text-[#64748B] font-mono leading-none">{selectedFolderName}</p>
                </div>
              </div>

              {/* Images Grid */}
              <div className="flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <ImageIcon size={15} className="text-[#8B5CF6]" />
                  Danh sách tệp hình ảnh ({folderImages.length})
                </span>
              </div>

              {loadingImages ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
                  <svg className="animate-spin h-5 w-5 text-[#8B5CF6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-[10px]">Đang tải danh sách ảnh trong thư mục...</p>
                </div>
              ) : folderImages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white border border-dashed border-[#E2E8F0] rounded-2xl text-center gap-2">
                  <ImageIcon size={28} className="text-slate-300" />
                  <p className="text-xs text-slate-400 font-semibold">Thư mục trống</p>
                  <p className="text-[10px] text-slate-400 max-w-[240px]">Nhấp nút "Tải ảnh lên thư mục" để thêm hình ảnh đầu tiên.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 shrink-0">
                  {folderImages.map((img, i) => (
                    <div 
                      key={img.imageId} 
                      className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:border-[#8B5CF6] hover:shadow-md transition-all flex flex-col"
                    >
                      <div 
                        onClick={() => {
                          setLightboxImages(folderImages);
                          setActiveImageIndex(i);
                          setShowLightbox(true);
                        }}
                        className="relative cursor-zoom-in group/item flex items-center justify-center bg-black animate-[fadeIn_0.2s_ease-out]"
                        style={{ aspectRatio: "4/3" }}
                      >
                        <img src={img.url} alt={img.imageId} className="w-full h-full object-contain transition-transform duration-300 group-hover/item:scale-[1.03]" />
                        <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 text-[9px] font-mono font-bold text-white uppercase tracking-wider backdrop-blur-md">
                          {img.imageId}
                        </div>
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="px-3 py-1.5 rounded-lg bg-black/75 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                            <Eye size={13} />
                            Nhập để xem chi tiết
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col gap-2 text-left border-t border-[#F1F5F9]">
                        <div className="flex items-center justify-between text-[9px] text-[#94A3B8] pt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock size={10} />
                            Hạn link: {formatDate(img.expiresAt)}
                          </span>
                          <a
                            href={img.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-0.5 text-[#8B5CF6] font-semibold hover:underline"
                          >
                            Tải ảnh <ExternalLink size={9} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Lightbox Modal Overlay */}
      {showLightbox && lightboxImages.length > 0 && activeImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md cursor-zoom-out select-none"
          onClick={() => setShowLightbox(false)}
        >
          <button 
            type="button"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer border-none transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setShowLightbox(false);
            }}
          >
            <X size={24} />
          </button>
          
          <img 
            src={lightboxImages[activeImageIndex].url} 
            alt="Medical Scan Full Size" 
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl transition-transform duration-300 ease-out cursor-default animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-3 shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-mono text-slate-300">
              {lightboxImages[activeImageIndex].imageId.toUpperCase()}
            </span>
            <span className="text-white/20">|</span>
            <a 
              href={lightboxImages[activeImageIndex].url} 
              target="_blank" 
              rel="noreferrer" 
              className="text-[#a78bfa] hover:text-[#c084fc] hover:underline flex items-center gap-1"
            >
              Mở trong tab mới <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
