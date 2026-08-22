# Med SuperApp — Frontend Monorepo

Ứng dụng chẩn đoán hình ảnh y tế. Repository này chứa **hai nền tảng Frontend** trong một Monorepo.

---

## Cấu Trúc Repo

```
Med_superApp_frontend/
├── mobile/        ← Flutter App (Android / iOS)
└── nextjs/        ← Next.js Web App (Desktop Dashboard)
```

---

## Mobile — Flutter

### Yêu Cầu
- Flutter SDK >= 3.10.4
- Android Studio / Xcode
- Java JDK 17+ (cho Android build)

### Cấu Hình Biến Môi Trường (`mobile/.env`)
Tạo file `.env` tại thư mục `mobile/` (nếu chưa có):
```properties
API_URL=http://10.0.2.2:8080
```
> **Lưu ý địa chỉ IP kết nối Backend:**
> - **Android Emulator:** Dùng `http://10.0.2.2:8080` (trỏ về localhost máy host).
> - **iOS Simulator:** Dùng `http://localhost:8080`.
> - **Thiết bị thật (Android / iOS):** Dùng IP mạng LAN của máy chạy backend, ví dụ `http://192.168.1.x:8080`.

### Chạy Development
```bash
cd mobile
flutter pub get
flutter run
```

### Kiểm Tra Code & Test
```bash
# Kiểm tra lint / static analysis
flutter analyze

# Chạy unit & widget test
flutter test
```

### Cấu Trúc `mobile/lib/`
```
lib/
├── core/          ← constants, theme, config, utils
├── models/        ← Data models & DTOs
├── services/
│   ├── abstract/  ← Service interfaces
│   ├── mock/      ← Mock implementations (dùng khi chưa có API)
│   └── remote/    ← Real API implementations (Dio)
├── view_models/   ← MVVM ViewModels (Provider)
└── views/         ← UI Screens
```

---

## Web — Next.js

### Yêu Cầu
- Node.js >= 18.x
- npm / yarn / pnpm

### Cấu Hình Biến Môi Trường (`nextjs/.env.local`)
Tạo file `.env.local` tại thư mục `nextjs/`:
```properties
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Chạy Development
```bash
cd nextjs
npm install
npm run dev
# Mở http://localhost:3000
```

### Build & Lint
```bash
# Kiểm tra lint
npm run lint

# Build production
npm run build
```

### Cấu Trúc `nextjs/src/`
```
src/
├── app/           ← App Router pages
│   ├── (auth)/    ← Auth routes (login, register)
│   ├── dashboard/ ← Main dashboard
│   ├── diagnosis/ ← Diagnosis features
│   └── admin/     ← Admin panel
├── components/    ← Reusable UI components (shadcn/ui)
├── lib/
│   ├── api/       ← API clients (Axios)
│   └── hooks/     ← Custom React hooks
└── types/         ← TypeScript interfaces
```

---

## Quy Ước Nhánh Git

| Nhánh | Mục đích |
|---|---|
| `main` | Production-ready code |
| `develop` | Integration branch |
| `feature/mobile/*` | Flutter features |
| `feature/web/*` | Next.js features |

---

## API Communication

Mọi API giao tiếp với Backend đều tuân theo format chuẩn:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null,
  "errorCode": string | null
}
```
