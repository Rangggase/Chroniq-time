# JustSimple v3 — Every Second Counts

**Versi 3.1.0 (pengembangan Fase 3 — Goals & Insights) | React + TypeScript + Vite | UI berbahasa Indonesia**

Aplikasi produktivitas berbasis web yang dikembangkan dari proyek stopwatch **JustSimple** (proyek awal kuliah), dilanjutkan menjadi JustSimple Pro v2, lalu dimigrasikan ke arsitektur komponen React di v3. Desain dark/light minimalis dan fitur-fitur stopwatch tetap dipertahankan.

## Fitur yang sudah diimplementasikan

| Modul | Fungsi |
| --- | --- |
| Stopwatch | Mulai, jeda, lanjutkan, reset, waktu hingga milidetik |
| Activity History v3.1 | Simpan sesi stopwatch secara eksplisit; Focus/Countdown lengkap dicatat otomatis; sesi yang dihentikan setelah berjalan disimpan sebagai interrupted (minimal 1 detik); IndexedDB + filter, ekspor CSV dan hapus data |
| Productivity Analytics v3.1 | Grafik 7/30/90 hari, statistik waktu fokus kerja selesai, sesi, rata-rata durasi dan jumlah hari aktif |
| Goals & Insights v3.1 | Target harian 15–480 menit, progres harian, pencapaian mingguan dan streak hari dengan sesi Focus selesai |
| Lap tracker | Catat putaran, lap tercepat, lap terlama, rata-rata, lap berjalan |
| Riwayat | Tabel lap dari terbaru, hapus lap tanpa mereset timer, export CSV |
| Persistensi | Stopwatch tersimpan otomatis di `localStorage`, termasuk saat tab dimuat ulang |
| Migrasi data v2 | Jika belum ada sesi v3, membaca `justsimple.session.v1` dari **origin browser yang sama** tanpa menghapus data v2 |
| Focus / Pomodoro | 25 menit fokus, 5 menit istirahat pendek, 15 menit istirahat panjang; penghitung sesi fokus selesai |
| Countdown | Preset 1/5/10/30 menit dan durasi khusus 1–180 menit |
| Desain | Dark/light theme, responsive desktop/mobile, keyboard shortcuts khusus stopwatch |

**Batasan:** Stopwatch mengukur berdasarkan `performance.now()` saat tab aktif dan waktu sistem saat sesi berjalan dipulihkan setelah refresh. Focus dan Countdown belum memulihkan hitungan mundur setelah refresh; ini ruang pengembangan berikutnya. Data tersimpan pada perangkat/browser sendiri, bukan database/cloud. Tidak ada akun atau login.

## 1. Persiapan (Windows + WebStorm)

1. Pasang **WebStorm** dan **Node.js** versi **22.12+** (Node 24 LTS juga sesuai).
2. Ekstrak ZIP ke lokasi bebas, misalnya `D:\new another projectB\JustSimple-v3`.
3. Buka WebStorm → **Open** → pilih folder **JustSimple-v3** (folder yang berisi `package.json`).
4. Buka **Terminal** (`Alt + F12`).
5. Periksa versi:

```powershell
node -v
npm -v
```

Jika `node` atau `npm` tidak dikenali, instal Node.js, kemudian tutup dan buka lagi WebStorm.

## 2. Menjalankan aplikasi

Di terminal WebStorm, dari folder proyek:

```powershell
npm install
npm run dev
```

Buka alamat **Local** yang tampil (biasanya `http://localhost:5173/`). Port dapat berbeda jika 5173 sudah dipakai.

> **Penting:** V3 merupakan proyek React/Vite. Jangan jalankan melalui `python -m http.server` atau membuka `index.html` langsung. Vite harus memproses source TSX terlebih dahulu.

Perintah lain:

```powershell
npm run test        # Tes logika tanpa alat tambahan (Node 22+)
npm run typecheck   # Pemeriksaan TypeScript (perlu npm install)
npm run build       # Build production ke dist/
npm run preview     # Preview hasil build
```

## 3. Struktur proyek

```text
JustSimple-v3/
├── .github/workflows/ci.yml     # CI build + unit tests
├── public/favicon.svg
├── src/
│   ├── components/             # UI / tampilan, dipisahkan per fitur
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── ModeSwitcher.tsx
│   │   ├── StopwatchPanel.tsx
│   │   ├── SessionStats.tsx
│   │   ├── LapHistory.tsx
│   │   ├── FocusPanel.tsx
│   │   ├── CountdownPanel.tsx
│   │   ├── ActivityHistory.tsx
│   │   ├── ProductivityAnalytics.tsx
│   │   └── GoalsInsights.tsx
│   ├── hooks/
│   │   ├── useStopwatch.ts      # State stopwatch + animation frame
│   │   ├── useCountdown.ts      # Countdown berdasarkan deadline waktu
│   │   ├── useTheme.ts
│   │   └── useActivityHistory.ts          # Tema dark/light
│   ├── lib/
│   │   ├── time.ts              # Format, statistik, CSV
│   │   ├── session.ts           # Validasi + migrasi sesi v2
│   │   ├── download.ts
│   │   ├── activity.ts
│   │   ├── activityStore.ts          # IndexedDB riwayat aktivitas
│   │   ├── analytics.ts              # Statistik produktivitas
│   │   └── goals.ts                  # Progres, target, dan streak
│   ├── styles/global.css       # Adaptasi desain CSS JustSimple v2
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/                    # Unit tests logika, aktivitas, analitik, dan goals
├── e2e/                      # Playwright TC01–TC14 (3 browser)
├── index.html
├── package.json
├── tsconfig*.json
└── vite.config.ts
```

## 4. Keyboard shortcuts

Shortcut aktif **hanya jika tab Stopwatch dipilih**, dan tidak saat fokus pada input / tombol:

- `Space` — mulai / jeda
- `L` — catat lap
- `Shift + R` — reset stopwatch beserta seluruh lap

## 5. Migrasi v2 ke v3

V2 dan V3 menggunakan key data berbeda:

- V2: `justsimple.session.v1`
- V3: `justsimple.session.v3`
- Tema: `justsimple.theme.v1` (dipakai bersama)

Pada kunjungan pertama, V3 mencoba membaca data stopwatch V2 jika berasal dari **origin yang sama**. Browser mengisolasi `localStorage` antar-origin/port. Misalnya data v2 di `http://localhost:8000` **tidak otomatis dapat dibaca** oleh v3 di `http://localhost:5173`. Ini normal, bukan bug. V2 asli tetap aman di folder terpisah. Jika butuh pemindahan lintas-port, ekspor lap CSV dari v2 terlebih dahulu; CSV hanya arsip, bukan impor sesi otomatis.

## 6. Pengujian dan pemeriksaan

- Tes perhitungan jam, CSV, statistik lap, snapshot dan validasi sesi berada di `tests/logic.test.mjs`.
- Workflow GitHub Actions menjalankan `npm ci`, `npm run test`, lalu `npm run build` setelah proyek diunggah ke GitHub.
- Sebelum publikasi, jalankan `npm install`, `npm run test`, dan `npm run build` di komputer sendiri. GitHub Actions baru aktif setelah push repo.

## 7. Activity History v3.1 — cara menguji

- Stopwatch: tekan **Mulai**, catat lap (opsional), lalu **Simpan sesi**. Stopwatch di-reset **hanya jika penyimpanan berhasil**. Menekan **Reset** biasa tidak menyimpan riwayat.
- Focus/Countdown: sesi yang mencapai nol dicatat sebagai **Selesai**. Jika dihentikan melalui **Reset** atau mengganti preset setelah minimal 1 detik, dicatat sebagai **Dihentikan**.
- Pilih **Lihat riwayat** di bawah dashboard untuk filter, ekspor CSV atau hapus aktivitas.
- Data baru hanya tersimpan pada browser/origin yang sama via **IndexedDB**. Data lap v3.0 di localStorage tetap dipertahankan.
- Catatan: Focus/Countdown yang sedang berjalan belum dipulihkan jika tab ditutup/refresh. Riwayat sesi tersebut hanya dicatat ketika selesai atau dihentikan saat tab masih terbuka.
- Sesi stopwatch lama v3.0 tanpa timestamp mulai menggunakan perkiraan `waktu selesai − durasi aktif` saat disimpan ke riwayat. Sesi baru mencatat waktu mulai pertama.
- Uji: `npm run test`, `npm run build`, lalu `npx playwright test --workers=1`. Target pengujian E2E baru: 30 eksekusi (10 skenario x 3 browser), setelah kedua test baru benar-benar dijalankan.

## 8. Ide roadmap

- [x] Pengujian browser Playwright (24 tes v3.0 berhasil menurut hasil pengguna, dua skenario v3.1 ditambahkan)
- [ ] Menyimpan Focus / Countdown lintas-refresh dan notifikasi akhir sesi
- [x] Grafik dan ringkasan produktivitas 7/30/90 hari (Fase 2)
- [x] Goals & Insights: target harian, progres, streak (Fase 3, masih perlu verifikasi browser lokal)
- [ ] PWA offline support
- [ ] Deployment ke Vercel / Netlify dan CI/CD berbasis `npm ci` setelah `package-lock.json` dibuat
- [ ] Desktop Windows melalui Tauri jika sudah siap belajar Rust

## Lisensi dan asal

Pengujian browser Playwright dan audit tampilan telah dilakukan untuk v3.0; perubahan v3.1 harus diuji kembali sebelum rilis.

Source proyek merupakan pengembangan dari JustSimple milik pemilik proyek. Versi v3 mempertahankan arah visual v2. Logo/favicon dan CSS dari proyek v2 diadaptasi. Pengembangan bertahap ini cocok ditunjukkan sebagai progres portofolio frontend.

## v3.1 Fase 2 — Productivity Analytics

Dashboard statistik lokal berdasarkan Activity History (IndexedDB): filter 7/30/90 hari,
tren menit fokus, jumlah sesi fokus selesai, rata-rata, hari aktif, serta durasi per mode.
Data fokus hanya menghitung preset Focus yang selesai, bukan istirahat atau sesi terhenti.
Lihat `README_PHASE2_ANALYTICS.md` untuk definisi metrik, pemasangan patch, dan pengujian.

## v3.1 Fase 3 — Goals & Insights

Target fokus harian yang dapat dipilih (15–480 menit, kelipatan 15), progres harian,
pencapaian Senin–Minggu, serta streak hari fokus aktif berdasarkan Activity History.
Pengaturan target disimpan di `localStorage`; durasi sesi tetap berasal dari IndexedDB.
Sesi istirahat, sesi terhenti, Stopwatch, dan Countdown tidak menambah waktu fokus.
Lihat `README_PHASE3_GOALS.md` untuk definisi metrik dan langkah pengujian.
