# Med SuperApp — Frontend Monorepo

Ứng dụng chẩn đoán hình ảnh y tế. Repository này chứa **hai nền tảng Frontend** trong một Monorepo.

---

## Cấu Trúc Repo

```
Med_superApp_frontend/
├── mobile/        ← Flutter App (Android / iOS)
├── nextjs/        ← Next.js Web App (Desktop Dashboard)
└── shared/        ← Tài nguyên dùng chung (API contracts, design tokens)
```

---

## Mobile — Flutter

### Yêu Cầu
- Flutter SDK >= 3.10.4
- Android Studio / Xcode

### Chạy Development
```bash
cd mobile
flutter pub get
flutter run
```

### Cấu Trúc `mobile/lib/`
```
lib/
├── core/          ← constants, theme, utils
├── models/        ← Data models
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
- Node.js >= 18
- npm / yarn / pnpm

### Chạy Development
```bash
cd nextjs
npm install
npm run dev
# Mở http://localhost:3000
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

## Shared

```
shared/
├── api-contracts/
│   └── openapi.yaml    ← OpenAPI spec từ Backend team (source of truth)
└── design-tokens/
    └── tokens.json     ← Colors, typography dùng chung cho cả hai platform
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

Mọi API đều tuân theo format chuẩn:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null,
  "errorCode": string | null
}
```

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
