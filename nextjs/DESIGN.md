# 🏥 Hospital Management System (HMS) - Design Skill & Specification

## 📑 Project Overview
- **Project Name:** HMS - NextGen Healthcare Ecosystem
- **Focus:** Medical Accuracy, High-Density Information, AI Research Integration.
- **Design Philosophy:** Anti-slop, Minimalist, Function-over-Form, Clinical Trust.

---

## 🎨 1. Core Visual Identity (Design Tokens)

### 🔵 Color Palette (Clinical Standards)
- **Primary:** `#0EA5E9` (Sky Blue) - Trust & Professionalism.
- **Success:** `#10B981` (Emerald) - Recovery & Good Results.
- **Warning:** `#F59E0B` (Amber) - Attention required.
- **Critical:** `#EF4444` (Rose) - Emergencies & Danger.
- **Neutral:** `#0F172A` (Slate 900) for Headings; `#64748B` (Slate 500) for Body.
- **Background:** `#F8FAFC` (Off-white) - Minimalist canvas.

### ✍️ Typography
- **Primary Font:** `Inter` or `Public Sans` (Google Fonts).
- **Scale:**
  - **Heading 1:** 32px (Mobile) / 48px (Web) - Bold.
  - **Heading 2:** 24px (Mobile) / 32px (Web) - Semibold.
  - **Body:** 16px (Mobile) / 14px (Web) - Regular (Line height: 1.6).
  - **Monospace:** `JetBrains Mono` (Dùng cho dữ liệu AI/Mã bệnh án).

### 📐 Grid & Spacing
- **System:** 8pt Grid System (All spacing = multiples of 4 or 8).
- **Web Layout:** 12 Columns, Gutter 24px, Margin 80px.
- **Mobile Layout:** 4 Columns, Gutter 16px, Margin 20px.
- **Radius:** `8px` for buttons/inputs, `16px` for cards.

---

## 🛠 2. Module Specific Skills

### 📱 Patient Portal (UX Focus: Empathy & Speed)
- **Accessibility:** High contrast for elderly users.
- **Touch Targets:** Minimum 44x44px.
- **Key Skill:** **Timeline Visualization.** Phải hiển thị được lịch sử bệnh án theo trục thời gian tuyến tính để bệnh nhân dễ theo dõi.

### 🩺 Clinical Management (UX Focus: Efficiency & Density)
- **High Information Density:** Bác sĩ cần thấy nhiều dữ liệu cùng lúc mà không bị rối.
- **Skill:** **Dynamic Forms.** Form nhập liệu thông minh, tự động gợi ý tên thuốc (Auto-complete) và mã bệnh ICD-10.
- **Image Handling:** Tích hợp trình xem ảnh y tế (PACS/DICOM style) sạch sẽ.

### 🤖 AI Research & Dataset (UX Focus: Technical & Logic)
- **Data Visualization:** Biểu đồ huấn luyện AI (Loss, Accuracy) phải chính xác, không dùng hình vẽ minh họa màu mè.
- **Complex Filtering:** Kỹ năng thiết kế bộ lọc đa tầng (Multi-layered filtering) cho dữ liệu lớn.

---

## 🚫 3. Anti-Slop Manifesto (Quy tắc chống rác thiết kế)

1. **No Generic Content:** Tuyệt đối không dùng "Lorem Ipsum". Dùng dữ liệu y tế thực tế.
2. **No Excessive Gradients:** Không dùng màu chuyển sắc lòe loẹt. Ưu tiên Flat Design hoặc Soft Shadows.
3. **Consistency over Novelty:** Sự đồng nhất quan trọng hơn sự sáng tạo kỳ quái. Mọi nút "Hủy" phải giống nhau ở mọi màn hình.
4. **Meaningful Icons:** Chỉ dùng icon khi cần thiết. Sử dụng bộ icon Stroke (đường nét) đồng nhất (vd: Lucide, Phosphor).
5. **Real States:** Phải luôn thiết kế 3 trạng thái: *Empty State* (Khi chưa có dữ liệu), *Loading State*, và *Error State*.

---

## 💻 4. Technical Implementation (Figma Best Practices)
- **Auto Layout (Required):** 100% components phải dùng Auto Layout.
- **Variables:** Sử dụng Figma Variables cho Colors và Spacing để dễ dàng chuyển đổi Dark/Light Mode.
- **Components & Variants:** Tạo Master Component cho Button, Input, Card. Sử dụng Variants cho các trạng thái (Hover, Active, Disabled).
- **Atomic Design:** Xây dựng từ Atom (nút) -> Molecule (thanh tìm kiếm) -> Organism (header) -> Template -> Page.

---

## 📅 5. Project Roadmap
1. **Phase 1:** Core Design System & Authentication.
2. **Phase 2:** Patient Mobile App (Clinical records & Scheduling).
3. **Phase 3:** Doctor Web Dashboard (Diagnosis & Prescriptions).
4. **Phase 4:** AI Research Module & Dataset Management.

---