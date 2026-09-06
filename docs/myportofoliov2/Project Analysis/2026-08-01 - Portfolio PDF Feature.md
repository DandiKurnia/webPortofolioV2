# 2026-08-01 — Portfolio PDF Feature

> Daily changelog for the Web Portfolio project.

---

## Changes Made

### 1. New Feature: Portfolio PDF (Separate from CV)

**Problem:** Navbar hanya punya tombol "View CV" untuk resume. Butuh slot terpisah untuk dokumen portfolio PDF — beda file dari CV.

**Solution:** Model baru `Portfolio` + API route + upload support + admin manager + navbar button.

---

### 2. Database

- **New model** `Portfolio` di `prisma/schema.prisma`:
  - Fields: `id`, `url`, `filename`, `sizeBytes`, `createdAt`, `updatedAt`
  - Table: `portfolios`
  - Singleton pattern (identik dengan `Resume`)
- `prisma generate` ✅ — Client sudah punya model Portfolio
- ⚠️ **Migration belum dijalankan** — Docker DB offline saat development. Run `npx prisma migrate dev` saat DB tersedia.

---

### 3. API Routes

| Route | Method | Auth | Purpose |
| --- | --- | --- | --- |
| `/api/portfolio` | GET | Public | Ambil portfolio terbaru |
| `/api/portfolio` | POST | Admin | Upload baru, hapus yang lama + object MinIO |
| `/api/portfolio` | DELETE | Admin | Hapus semua row + object MinIO |

- File: `app/api/portfolio/route.ts` — salinan pola `/api/resume/route.ts`

---

### 4. Upload (`/api/upload`)

- Tambah `portfolio: "portfolio"` ke `FOLDER_BY_KIND`
- Validasi: portfolio harus PDF (sama kayak resume)
- Upload path di MinIO: `portfolio/{uuid}.pdf`

---

### 5. Navbar (`components/Navbar.tsx`)

**Layout baru (CV prioritas tinggi):**
```
[DanBilDad]  Home  Skills  Projects  Certs   | VIEW CV | Show Portfolio |
```

- CV button: kuning (`bg-primary-container`), ukuran penuh — tetap seperti sebelumnya
- Portfolio button: pink (`bg-neon-pink`), padding sedikit lebih kecil — visual hierarchy CV > Portfolio
- Kedua tombol wrapped dalam flex container `gap-2 md:gap-3`
- Masing-masing fetch endpoint sendiri (`/api/resume`, `/api/portfolio`)
- Klik = `window.open(url, '_blank')` — buka PDF di tab baru
- Disabled state + tooltip kalau belum ada file

---

### 6. Admin Dashboard (`app/admin/(dashboard)/overview/page.tsx`)

**Refactored** — extracted reusable `DocumentManager` component:
- File baru: `components/admin/DocumentManager.tsx`
- Props: `windowTitle`, `title`, `description`, `doc`, `isUploading`, `onFileSelected`, `onRemove`
- Menampilkan OS-window card (neubrutalism style) dengan:
  - Upload button (replace jika sudah ada)
  - File info card (filename, size, date) + Open/Remove actions
  - Empty state: dashed upload area

**Dashboard sekarang punya dua card:**
- **Resume_Vault.exe** — upload/manage CV
- **Portfolio_Vault.exe** — upload/manage portfolio

---

### 7. Files Changed

| File | Action |
| --- | --- |
| `prisma/schema.prisma` | Added `Portfolio` model |
| `app/api/portfolio/route.ts` | **New** — GET/POST/DELETE |
| `app/api/upload/route.ts` | Added `portfolio` kind + validation |
| `components/Navbar.tsx` | Portfolio state, fetch, button, layout refactor |
| `components/admin/DocumentManager.tsx` | **New** — reusable upload/manage card |
| `app/admin/(dashboard)/overview/page.tsx` | Refactored to use DocumentManager for both Resume + Portfolio |

---

### 8. TypeScript

- `npx tsc --noEmit` — ✅ No errors
- All types clean

---

### 9. Pending

- [ ] Run `npx prisma migrate dev` saat Docker DB nyala
- [ ] Test upload portfolio PDF via admin dashboard
- [ ] Verify navbar "Show Portfolio" button di production
