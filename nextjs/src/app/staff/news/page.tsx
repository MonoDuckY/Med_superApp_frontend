"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

// Icons & Helpers
function Ico({ d, cls = "", style }: { d: string | string[]; cls?: string; style?: React.CSSProperties }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

const ic = {
  plus:        "M12 5v14M5 12h14",
  search:      "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  chevDown:    "M6 9l6 6 6-6",
  chevRight:   "M9 18l6-6-6-6",
  pencil:      ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  eyeSlash:    ["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 1.75-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24", "M1 1l22 22"],
  trash:       ["M3 6h18", "M19 6v14a2 2 0 0 0-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"],
  arrowLeft:   "M19 12H5M12 5l-7 7 7 7",
  upload:      ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  checkCircle: ["M22 11.08V12a10 10 0 1 1-5.93-9.14", "m9 11 3 3L22 4"],
  bold:        "M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6zM6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z",
  italic:      "M19 4h-9M14 20H5M15 4 9 20",
  underline:   ["M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3", "M4 21h16"],
  list:        ["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"],
  listOl:      ["M10 6h11", "M10 12h11", "M10 18h11", "M4 6h1v4", "M4 10H3", "M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"],
  link:        ["M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"],
  image:       ["M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z", "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
};

type Status = "published" | "draft" | "hidden";

interface Article {
  id: number;
  title: string;
  body: string;
  uploadBy: string;
  status: Status;
  updated: string;
  thumb: string;
}

const SAMPLE: Article[] = [
  {
    id: 1,
    title: "Phát hiện sớm ung thư gan qua siêu âm định kỳ: Những điều cần biết",
    body: "<p>Nội dung bài viết về Ung thư gan. Siêu âm định kỳ đóng vai trò cực kỳ quan trọng...</p>",
    uploadBy: "BS. Nguyễn Văn A",
    status: "published",
    updated: "18/08/2026 15:30",
    thumb: "liver",
  },
  {
    id: 2,
    title: "Vai trò của trí tuệ nhân tạo trong chẩn đoán hình ảnh y tế",
    body: "<p>Nội dung bài viết về Trí tuệ nhân tạo (AI) trong Y tế. Chẩn đoán hình ảnh đang thay đổi mạnh mẽ...</p>",
    uploadBy: "TS. Trần Minh Khoa",
    status: "published",
    updated: "17/08/2026 09:15",
    thumb: "brain",
  },
  {
    id: 3,
    title: "Hướng dẫn phòng ngừa đột quỵ cho người cao tuổi",
    body: "<p>Nội dung bài viết phòng ngừa đột quỵ...</p>",
    uploadBy: "BS.CK2 Lê Thị Hương",
    status: "draft",
    updated: "16/08/2026 14:00",
    thumb: "heart",
  },
];

const STATUS_CFG: Record<Status, { label: string; bg: string; color: string }> = {
  published: { label: "Đã xuất bản", bg: "rgba(16,185,129,0.1)",  color: "#10B981" },
  draft:     { label: "Bản nháp",    bg: "#F1F5F9",                color: "#64748B" },
  hidden:    { label: "Tạm ẩn",      bg: "#FEF3C7",                color: "#D97706" },
};

function Thumb({ kind, size = 40 }: { kind: string; size?: number }) {
  const colors: Record<string, [string, string]> = {
    liver:   ["#FEE2E2", "#EF4444"],
    brain:   ["#EDE9FE", "#8B5CF6"],
    heart:   ["#FCE7F3", "#EC4899"],
    vaccine: ["#D1FAE5", "#10B981"],
    diabetes: ["#FEF3C7", "#F59E0B"],
  };
  const [bg, fg] = colors[kind] ?? ["#DBEAFE", "#2563EB"];
  return (
    <div className="rounded-lg shrink-0 flex items-center justify-center"
      style={{ width: size, height: size, background: bg }}>
      <Ico d={ic.image} cls="w-4 h-4" style={{ color: fg }} />
    </div>
  );
}

function FLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div className="mb-1.5 font-semibold text-left" style={{ fontSize: 12, color: "#374151" }}>
      {children}{required && <span className="ml-0.5" style={{ color: "#EF4444" }}>*</span>}
    </div>
  );
}

// Image Insert Dialog Component
interface ImageInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

function ImageInsertModal({ isOpen, onClose, onInsert }: ImageInsertModalProps) {
  const [url, setUrl] = useState("");
  const [tab, setTab] = useState<"url" | "upload">("url");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước hình ảnh tối đa là 5MB!");
      return;
    }

    setIsUploading(true);
    // Simulate image upload to server to get URL
    setTimeout(() => {
      // Convert to ObjectURL as temporary mock server image URL
      const mockUrl = URL.createObjectURL(file);
      onInsert(mockUrl);
      setIsUploading(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 text-left">
        <h3 className="font-bold text-sm text-[#0F172A] mb-4">Chèn hình ảnh vào nội dung</h3>
        
        {/* Tab switch */}
        <div className="flex border-b border-[#E2E8F0] mb-4">
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`flex-1 pb-2 text-xs font-bold transition-all border-none bg-transparent cursor-pointer ${tab === "url" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-400"}`}
          >
            Đường dẫn URL
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`flex-1 pb-2 text-xs font-bold transition-all border-none bg-transparent cursor-pointer ${tab === "upload" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-400"}`}
          >
            Tải lên từ máy tính
          </button>
        </div>

        {tab === "url" ? (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">ĐƯỜNG DẪN ẢNH (URL)</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#E2E8F0] rounded-xl text-center hover:border-blue-300 transition-colors cursor-pointer min-h-[140px]"
            onClick={() => !isUploading && fileInputRef.current?.click()}>
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-xs font-semibold text-slate-600">Đang tải lên máy chủ...</p>
              </div>
            ) : (
              <>
                <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-xs font-semibold text-slate-600">Chọn ảnh từ thiết bị</p>
                <p className="text-[10px] text-slate-400 mt-1">Định dạng JPG, PNG, tối đa 5MB</p>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#F1F5F9]">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-white text-slate-600"
            disabled={isUploading}
          >
            Hủy
          </button>
          {tab === "url" && (
            <button
              type="button"
              onClick={() => {
                if (url.trim()) {
                  onInsert(url.trim());
                  onClose();
                  setUrl("");
                }
              }}
              disabled={!url.trim() || isUploading}
              className="h-9 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg cursor-pointer border-none"
            >
              Chèn ảnh
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Dashboard component
interface DashboardProps {
  rows: Article[];
  setRows: React.Dispatch<React.SetStateAction<Article[]>>;
  onEdit: (a: Article) => void;
  onCreate: () => void;
}

function Dashboard({ rows, setRows, onEdit, onCreate }: DashboardProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = rows.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.uploadBy.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  });

  function toggleHide(id: number) {
    setRows(rs => rs.map(r => r.id === id
      ? { ...r, status: r.status === "hidden" ? "published" : "hidden" as Status }
      : r));
  }

  function softDelete(id: number) {
    setRows(rs => rs.filter(r => r.id !== id));
  }

  const filterLabels: Record<string, string> = {
    all: "Tất cả", published: "Đã xuất bản", draft: "Bản nháp", hidden: "Tạm ẩn",
  };

  return (
    <div className="flex-grow min-h-0 overflow-y-auto text-left" style={{ background: "#F8FAFC" }}>
      <div className="mx-auto py-6 px-8" style={{ maxWidth: 1200 }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-bold" style={{ fontSize: 24, color: "#0F172A" }}>Quản lý tin tức y khoa</h1>
          <button onClick={onCreate}
            className="flex items-center gap-2 h-10 px-5 text-sm font-bold text-white rounded-xl cursor-pointer hover:opacity-90 transition-opacity border-none"
            style={{ background: "#2563EB", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
            <Ico d={ic.plus} cls="w-4 h-4" />
            Tạo bài viết mới
          </button>
        </div>

        {/* Search & filter bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1" style={{ maxWidth: 420 }}>
            <Ico d={ic.search} cls="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#9CA3AF" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề bài viết, người viết..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E8F0] bg-white outline-none text-sm transition-all focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              style={{ color: "#0F172A", fontSize: 13, height: 40 }}
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <button onClick={() => setFilterOpen(o => !o)}
              className="flex items-center gap-2 h-10 px-4 bg-white border border-[#E2E8F0] rounded-xl text-sm cursor-pointer hover:bg-slate-50 transition-colors"
              style={{ color: "#374151", fontSize: 13 }}>
              {filterLabels[filter]}
              <Ico d={ic.chevDown} cls="w-4 h-4" style={{ color: "#9CA3AF" }} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-20 overflow-hidden py-1" style={{ minWidth: 160 }}>
                {(["all", "published", "draft", "hidden"] as const).map(opt => (
                  <button key={opt} onMouseDown={() => { setFilter(opt); setFilterOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-blue-50 transition-colors flex items-center justify-between border-none bg-transparent cursor-pointer"
                    style={{ color: filter === opt ? "#2563EB" : "#374151" }}>
                    {filterLabels[opt]}
                    {filter === opt && <Ico d="M20 6 9 17l-5-5" cls="w-3.5 h-3.5" style={{ color: "#2563EB" }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0]"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)" }}>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" }}>
                {["Tiêu đề bài viết", "Người viết", "Trạng thái", "Ngày cập nhật", "Thao tác"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5" style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16" style={{ color: "#94A3B8", fontSize: 13 }}>
                    Không tìm thấy bài viết nào phù hợp.
                  </td>
                </tr>
              )}
              {filtered.map((row, i) => {
                const st = STATUS_CFG[row.status];
                return (
                  <tr key={row.id}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}
                    className="hover:bg-slate-50 transition-colors group">
                    {/* Title */}
                    <td className="px-5 py-4" style={{ maxWidth: 380 }}>
                      <div className="flex items-center gap-3">
                        <Thumb kind={row.thumb} size={40} />
                        <p className="font-semibold leading-snug line-clamp-2" style={{ fontSize: 13, color: "#0F172A" }}>
                          {row.title || "(Chưa có tiêu đề)"}
                        </p>
                      </div>
                    </td>
                     {/* Author */}
                     <td className="px-5 py-4" style={{ minWidth: 200 }}>
                       <p className="font-medium" style={{ fontSize: 13, color: "#374151" }}>{row.uploadBy}</p>
                     </td>
                    {/* Status badge */}
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-5 py-4 whitespace-nowrap" style={{ fontSize: 13, color: "#64748B" }}>
                      {row.updated}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(row)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-none bg-transparent"
                          title="Chỉnh sửa">
                          <Ico d={ic.pencil} cls="w-3.5 h-3.5" style={{ color: "#2563EB" }} />
                        </button>
                        <button onClick={() => toggleHide(row.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 transition-colors cursor-pointer border-none bg-transparent"
                          title={row.status === "hidden" ? "Hiện bài viết" : "Ẩn bài viết"}>
                          <Ico d={ic.eyeSlash} cls="w-3.5 h-3.5" style={{ color: "#D97706" }} />
                        </button>
                        <button onClick={() => softDelete(row.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
                          title="Xóa bài viết">
                          <Ico d={ic.trash} cls="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#F1F5F9]" style={{ background: "#FAFAFA" }}>
            <p style={{ fontSize: 12, color: "#94A3B8" }}>
              Hiển thị {filtered.length} / {rows.length} bài viết
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Editor component with Tiptap WYSIWYG
interface EditorProps {
  article: Article;
  onBack: () => void;
  onSave: (updated: Article) => void;
}

function Editor({ article, onBack, onSave }: EditorProps) {
  const [title, setTitle] = useState(article.title);
  const [body, setBody] = useState(article.body);
  const [pubStatus, setPubStatus] = useState<"draft" | "publish">(article.status === "published" ? "publish" : "draft");
  const [hasImage, setHasImage] = useState(!!article.thumb);
  const [imgHover, setImgHover] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const titleError = titleTouched && !title.trim() ? "Tiêu đề bài viết không được để trống" : undefined;

  // Initialize Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: article.body || "<p>Nhập nội dung bài viết y khoa tại đây...</p>",
    onUpdate: ({ editor }) => {
      setBody(editor.getHTML());
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  function handleSave() {
    setTitleTouched(true);
    if (!title.trim()) return;
    
    const updated: Article = {
      ...article,
      title: title.trim(),
      body: body,
      uploadBy: article.uploadBy || "StaffA",
      status: pubStatus === "publish" ? "published" : "draft",
      updated: new Date().toLocaleString("vi-VN"),
      thumb: hasImage ? "brain" : "",
    };

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSave(updated);
    }, 1200);
  }

  const toolBtn = (active: boolean, onClick: () => void, icon: string | string[], tip: string) => (
    <button type="button" onClick={onClick} title={tip}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer border-none bg-transparent hover:bg-slate-100"
      style={{ background: active ? "#EFF6FF" : "transparent", color: active ? "#2563EB" : "#64748B" }}>
      <Ico d={icon} cls="w-3.5 h-3.5" />
    </button>
  );

  const insertLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Nhập liên kết (URL):", previousUrl || "https://");
    
    // empty = unset link
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const insertImage = (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="flex-grow flex flex-col min-h-0 overflow-y-auto text-left" style={{ background: "#F8FAFC" }}>
      
      {/* Toast */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300"
        style={{ opacity: saved ? 1 : 0, transform: `translateX(-50%) translateY(${saved ? 0 : -10}px)`, pointerEvents: "none" }}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border border-green-200" style={{ background: "#ECFDF5" }}>
          <Ico d={ic.checkCircle} cls="w-4 h-4" style={{ color: "#10B981" }} />
          <p className="text-sm font-semibold" style={{ color: "#065F46" }}>Bài viết đã được lưu thành công</p>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-grow overflow-y-auto px-8 py-6">
        <div className="mx-auto flex gap-6" style={{ maxWidth: 1200 }}>

          {/* Left 70% — Content form */}
          <div className="flex flex-col gap-5" style={{ flex: "0 0 70%" }}>

            {/* Title input */}
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center justify-between mb-2">
                <FLabel required>Tiêu đề bài viết</FLabel>
                <span style={{ fontSize: 11, color: title.length > 130 ? "#EF4444" : "#94A3B8" }}>
                  {title.length}/150
                </span>
              </div>
              <input
                value={title}
                onChange={e => { if (e.target.value.length <= 150) { setTitle(e.target.value); setTitleTouched(false); } }}
                onBlur={() => setTitleTouched(true)}
                placeholder="Nhập tiêu đề bài viết y khoa..."
                className="w-full outline-none border rounded-xl px-4 py-3 transition-all focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                style={{
                  fontSize: 18, fontWeight: 600, color: "#0F172A",
                  borderColor: titleError ? "#EF4444" : "#E2E8F0",
                  boxShadow: titleError ? "0 0 0 3px rgba(239,68,68,0.1)" : "none",
                }}
              />
              {titleError && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Ico d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01" cls="w-3.5 h-3.5 shrink-0" style={{ color: "#EF4444" }} />
                  <p style={{ fontSize: 11, color: "#EF4444" }}>{titleError}</p>
                </div>
              )}
            </div>

            {/* Rich text editor (Tiptap) */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] flex flex-col"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)" }}>
              
              <div className="px-6 pt-5 pb-2 border-b border-[#F1F5F9] shrink-0">
                <FLabel required>Nội dung bài viết</FLabel>
                {/* Toolbar */}
                {editor && (
                  <div className="flex items-center gap-0.5 mt-3 pb-2 flex-wrap">
                    {toolBtn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), ic.bold, "Đậm")}
                    {toolBtn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), ic.italic, "Nghiêng")}
                    {toolBtn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), ic.underline, "Gạch chân")}
                    <div className="w-px h-5 mx-1 bg-[#E2E8F0]" />
                    {toolBtn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), ic.list, "Danh sách tròn")}
                    {toolBtn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), ic.listOl, "Danh sách số")}
                    <div className="w-px h-5 mx-1 bg-[#E2E8F0]" />
                    {toolBtn(editor.isActive("link"), insertLink, ic.link, "Chèn liên kết")}
                    {toolBtn(false, () => setImageModalOpen(true), ic.image, "Chèn hình ảnh")}
                  </div>
                )}
              </div>

              {/* Editor Workspace */}
              <div className="px-6 pb-6 pt-4 flex-grow min-h-[320px] overflow-y-auto">
                <EditorContent 
                  editor={editor} 
                  className="w-full min-h-[280px] p-4 border border-[#E2E8F0] rounded-xl focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 outline-none" 
                />
                <div className="flex justify-end mt-1 text-[11px] text-slate-400 font-semibold">
                  {body.length}/10,000 ký tự
                </div>
              </div>
            </div>
          </div>

          {/* Right 30% — Settings panel */}
          <div className="flex flex-col gap-4" style={{ flex: "0 0 calc(30% - 24px)" }}>

            {/* Cover image */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <FLabel>Ảnh bìa bài viết</FLabel>
              {!hasImage ? (
                <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-6 flex flex-col items-center gap-3 text-center cursor-pointer hover:border-blue-300 transition-colors"
                  onClick={() => setHasImage(true)}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#F1F5F9" }}>
                    <Ico d={ic.upload} cls="w-4.5 h-4.5" style={{ color: "#94A3B8" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.5 }}>
                    Kéo thả hoặc tải lên ảnh bìa<br />
                    <span style={{ color: "#CBD5E1" }}>(Định dạng JPG, PNG, tối đa 5MB)</span>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden"
                  style={{ aspectRatio: "16/9", background: "#EFF6FF" }}
                  onMouseEnter={() => setImgHover(true)}
                  onMouseLeave={() => setImgHover(false)}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Ico d={ic.image} cls="w-10 h-10" style={{ color: "#93C5FD" }} />
                  </div>
                  {imgHover && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.4)" }}>
                      <button type="button" onClick={() => setHasImage(false)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer border-none bg-transparent"
                        style={{ background: "rgba(239,68,68,0.9)" }}>
                        <Ico d={ic.trash} cls="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Publish status */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)" }}>
              <FLabel>Cài đặt trạng thái</FLabel>
              <div className="flex flex-col gap-2 mt-1">
                {([
                  { val: "draft",   label: "Lưu nháp",            sub: "Bài viết chưa được công khai" },
                  { val: "publish", label: "Xuất bản trực tiếp",  sub: "Bài viết sẽ hiển thị ngay"  },
                ] as const).map(opt => (
                  <label key={opt.val}
                    className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all text-left"
                    style={{
                      borderColor: pubStatus === opt.val ? "#BFDBFE" : "#E2E8F0",
                      background: pubStatus === opt.val ? "#EFF6FF" : "transparent",
                    }}>
                    <input type="radio" name="pubStatus" checked={pubStatus === opt.val}
                      onChange={() => setPubStatus(opt.val)}
                      className="mt-0.5 accent-blue-600 cursor-pointer" />
                    <div>
                      <p className="font-semibold text-xs" style={{ color: pubStatus === opt.val ? "#1D4ED8" : "#374151" }}>
                        {opt.label}
                      </p>
                      <p style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>{opt.sub}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Auto-save indicator */}
              <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-[#F1F5F9]">
                <Ico d={ic.checkCircle} cls="w-3.5 h-3.5 shrink-0" style={{ color: "#10B981" }} />
                <p style={{ fontSize: 11, color: "#94A3B8" }}>Tự động lưu nháp thành công</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="bg-white border-t border-[#E2E8F0] px-8 py-4 flex items-center justify-end gap-3 shrink-0">
        <button type="button" onClick={onBack}
          className="h-10 px-6 text-sm font-semibold rounded-xl border cursor-pointer hover:bg-slate-50 transition-colors bg-white text-slate-600"
          style={{ borderColor: "#E2E8F0" }}>
          Hủy
        </button>
        <button type="button" onClick={handleSave}
          className="h-10 px-6 text-sm font-bold text-white rounded-xl cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all border-none"
          style={{ background: "#2563EB", boxShadow: "0 2px 8px rgba(37,99,235,0.35)" }}>
          Lưu bài viết
        </button>
      </div>

      <ImageInsertModal 
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onInsert={insertImage}
      />
    </div>
  );
}

type Screen = { view: "dashboard" } | { view: "editor"; article: Article };

export default function MedicalNewsPage() {
  const [screen, setScreen] = useState<Screen>({ view: "dashboard" });
  const [rows, setRows] = useState<Article[]>(SAMPLE);

  const handleCreateDraft = () => {
    // Immediately create a record with 'draft' status
    const newDraft: Article = {
      id: rows.length + 1,
      title: "",
      body: "<p>Nhập nội dung bài viết mới tại đây...</p>",
      uploadBy: "BS. Nguyễn Văn A",
      status: "draft",
      updated: new Date().toLocaleString("vi-VN"),
      thumb: "brain",
    };

    setRows(prev => [newDraft, ...prev]);
    setScreen({ view: "editor", article: newDraft });
  };

  const handleSaveArticle = (updatedArticle: Article) => {
    setRows(prev => prev.map(r => r.id === updatedArticle.id ? updatedArticle : r));
    setScreen({ view: "dashboard" });
  };

  if (screen.view === "editor") {
    return (
      <Editor
        article={screen.article}
        onBack={() => setScreen({ view: "dashboard" })}
        onSave={handleSaveArticle}
      />
    );
  }

  return (
    <Dashboard
      rows={rows}
      setRows={setRows}
      onEdit={a => setScreen({ view: "editor", article: a })}
      onCreate={handleCreateDraft}
    />
  );
}
