🏥 Hospital Management System (HMS) - Design Skill & Specification (Updated)
📑 Project Overview
Project Name: HMS - NextGen Healthcare Ecosystem
Focus: Medical Accuracy, High-Density Information, AI Research Integration.
Design Philosophy: Anti-slop, Minimalist, Function-over-Form, Clinical Trust.
🎨 1. Core Visual Identity (Design Tokens)
🔵 Color Palette (Clinical Standards)
Primary: #0EA5E9 (Sky Blue) - Trust & Professionalism.
Success: #10B981 (Emerald) - Recovery & Good Results.
Warning: #F59E0B (Amber) - Attention required.
Critical: #EF4444 (Rose) - Emergencies & Danger.
Neutral: #0F172A (Slate 900) for Headings; #64748B (Slate 500) for Body.
Background: #F8FAFC (Off-white) - Minimalist canvas.
✍️ Typography
Primary Font: Inter (UI) & Public Sans (Content).
Scale:
Heading 1: 32px (Mobile) / 48px (Web) - Bold.
Heading 2: 24px (Mobile) / 28px (Web) - Semibold.
Table Content: 14px - Regular (Line height: 1.4).
Monospace: JetBrains Mono (Dùng cho mã bệnh án/số điện thoại/dữ liệu AI).
📐 2. Navigation & Layout Standards (NEW)
🛠️ Global Sidebar (Web Admin/Staff)
Width: Fixed 260px.
Background: #0F172A (Neutral 900) - Sắc xanh Navy đậm để tách biệt với vùng nội dung.
Menu Taxonomy (Bộ tên gọi chuẩn):
Tổng quan (Dashboard)
Lịch khám (Appointments - Bao gồm Phê duyệt & Điều phối)
Bệnh nhân (Patients - Quản lý tài khoản/hồ sơ)
Hồ sơ bệnh án (Medical Records)
Tin tức y tế (Medical News)
Phản hồi (Feedback)
Cài đặt (Settings)
Rule: Không cho phép AI tự đổi tên menu. Icons phải cùng một bộ (Stroke style).
🖥️ Dashboard Layout Types
Master-Detail View: 60% Table (Trái) | 40% Action Panel (Phải). Dùng cho: Điều phối lịch, Phê duyệt nhanh.
Full-Width Table: 100% Width. Dùng cho: Danh sách bệnh nhân, Nhật ký hệ thống.
📊 3. Data Table Standards (Anti-Wrap & Alignment)
Row Height: 56px (Default) | 48px (Compact).
Cell Padding: 12px ngang, 8px dọc.
Column Rules:
Mã (ID): Fixed width 100px.
Họ tên/Số điện thoại: Fill Container (Min-width: 200px). Tuyệt đối không để Fixed Width quá hẹp gây ngắt dòng.
Trạng thái (Badge): Sử dụng Soft Background (Nền màu nhạt, chữ màu đậm).
Text Wrap: Luôn ưu tiên Truncate (Dấu 3 chấm) hoặc Auto Width cho các trường dữ liệu ngắn như Số điện thoại để tránh bị nhảy dòng.
🚫 4. Anti-Slop Manifesto (Quy tắc chống rác thiết kế)
Consistency over Novelty: Sidebar và Header phải là Master Component. Cấm tạo Sidebar mới cho mỗi màn hình.
Clinical Accuracy: Dùng thuật ngữ y tế chuẩn (vd: dùng "Chẩn đoán" thay vì "Kết quả chung").
No Decorative Gradients: Không dùng màu chuyển sắc trong bảng và menu.
Logic-Driven UI: Badge màu Cam chỉ dùng cho "Chờ duyệt/Cảnh báo", Xanh cho "Đã xác nhận/Bình thường".
💻 5. Technical Implementation (Figma Best Practices)
Auto Layout: 100% cấu trúc bảng phải dùng Auto Layout.
Variables: Sử dụng Figma Variables cho màu sắc và khoảng cách để đổi theme nhanh.
Naming: Layer đặt tên theo tiếng Anh chuyên ngành (vd: Sidebar-Item-Active, Table-Row-Hover).
📅 6. Project Roadmap
Phase 1: Core Design System & Authentication (Completed).
Phase 2: Patient Mobile App (Ongoing).
Phase 3: Staff/Doctor Web Dashboard (Focusing on Consistency).
Phase 4: AI Research & Big Data Module.