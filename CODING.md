💻 HMS NextGen - Coding Specification & Technical Skill Set
📑 Technical Overview
Project Goal: High-performance Medical System.
Frontend Stack: React (Web), React Native (Mobile).
Styling: Tailwind CSS (for 1:1 Design Token mapping).
Core Principle: Type-safety, Performance-first, Scalable Component Architecture.
🏗 1. Architecture & Core Skills
⚛️ Component-Driven Development (Atomic Design)
Lập trình viên phải triển khai mã nguồn theo cấu trúc tương ứng với Figma:
Atoms: Button, Input, Badge, Spinner, Avatar.
Molecules: SearchBar, FormInputGroup, TableCell.
Organisms: Navbar, Sidebar, UserTable, PrescriptionForm.
Skill Required: Thành thạo React Components và Props Validation (TypeScript).
🛠 Design Token Implementation (Tailwind Config)
Mọi thông số từ file Design phải được cấu hình vào tailwind.config.js:
code
JavaScript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0EA5E9',
        success: '#10B981',
        warning: '#F59E0B',
        critical: '#EF4444',
        neutral: { 900: '#0F172A', 500: '#64748B' },
        surface: '#F8FAFC',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: { '8pt': '8px' }, // Tuân thủ 8pt Grid System
      borderRadius: { 'hms': '8px', 'hms-lg': '16px' }
    }
  }
}
🛠 2. Module Engineering Skills
📱 Patient Mobile Portal (Performance & UX)
Timeline Logic: Kỹ thuật xử lý FlatList/SectionList để render trục thời gian bệnh án mượt mà.
OTP Logic: Tự động focus vào ô tiếp theo khi nhập mã OTP, tích hợp SMS Auto-fill API.
Skill Required: React Native, Gesture Handler, Reanimated (cho các hiệu ứng chuyển cảnh nhẹ nhàng).
🩺 Clinical Management (Data & Accuracy)
Dynamic Forms: Sử dụng React Hook Form + Zod/Yup để validate dữ liệu y tế (Ví dụ: Mã BHYT phải đúng định dạng).
OCR Integration: Tích hợp Cloud Vision API hoặc Tesseract.js để trích xuất dữ liệu từ ảnh chụp CCCD.
DICOM Imaging: Kỹ năng tích hợp thư viện CornerstoneJS hoặc OHIF Viewers để hiển thị ảnh X-Quang/MRI trên trình duyệt.
🤖 AI Research & Dataset (Big Data)
High-performance Tables: Sử dụng TanStack Table (React Table) hoặc AG Grid để render hàng ngàn dòng dữ liệu nghiên cứu mà không bị lag.
Visualization: Triển khai biểu đồ Training AI bằng Recharts hoặc D3.js, đảm bảo tính chính xác tuyệt đối của tọa độ dữ liệu.
Advanced Filtering: Kỹ thuật lọc dữ liệu phía Server (Server-side filtering & pagination).
🚫 3. Anti-Slop Coding Rules (Quy tắc Code sạch)
Strict TypeScript: Cấm sử dụng any. Mọi thực thể bệnh nhân, bác sĩ, đơn thuốc phải có Interface rõ ràng.
State Management: Sử dụng TanStack Query (React Query) để quản lý trạng thái Server (Loading, Error, Success) một cách tự động, thay vì dùng useEffect thủ công.
Z-Index Management: Quy định rõ thứ tự lớp (Modal > Popover > Sidebar > Content) để tránh lỗi đè layer như trong thiết kế.
Skeleton Screens: Phải luôn code màn hình chờ (Skeleton) khớp với Layout thật trong lúc đợi API, thay vì để màn hình trắng.
🔒 4. Security & Compliance (Tiêu chuẩn Y tế)
Data Encryption: Mã hóa thông tin nhạy cảm (CCCD, BHYT) trước khi gửi lên Server.
Role-based Access Control (RBAC): Kiểm tra quyền truy cập ở cấp độ Component (Ví dụ: Nút "Edit" chỉ hiển thị với Role Admin).
Session Timeout: Tự động đăng xuất sau X phút không hoạt động để bảo vệ dữ liệu bệnh viện.
🚀 5. Workflow (DevOps)
Linting: Sử dụng ESLint + Prettier theo bộ quy tắc của dự án để code luôn sạch.
Unit Test: Viết test cho các hàm tính toán liều lượng thuốc hoặc logic lọc Dataset.
Storybook: Xây dựng thư viện Component độc lập để Designer và Dev có thể kiểm tra định dạng (Format) nhanh chóng.