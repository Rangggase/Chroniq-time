# Chroniq — Every Second Counts

**Stopwatch, Focus Timer, Countdown, Activity History, Productivity Analytics, dan Goals & Insights dalam satu aplikasi web.**

Chroniq dikembangkan dari proyek stopwatch awal perkuliahan yang sebelumnya bernama **JustSimple**. Proyek ini kemudian dikembangkan dengan antarmuka yang lebih matang dan dimigrasikan ke **React + TypeScript + Vite**, dengan fitur pencatatan sesi, analitik aktivitas, serta target fokus harian. Antarmuka berbahasa Indonesia, responsif, dan menyediakan tema gelap/terang.

> **Status:** `v3.1.0` telah dirilis di GitHub dan dideploy ke GitHub Pages. Perubahan branding `v3.1.1` merupakan pembaruan kecil yang **belum dirilis** dan harus melewati CI serta pengujian publik sebelum dibuat tag baru.

**Website:** https://rangggase.github.io/Chroniq-time/
**Repository:** https://github.com/Rangggase/Chroniq-time
**Release v3.1.0:** https://github.com/Rangggase/Chroniq-time/releases/tag/v3.1.0

## Fitur utama

| Modul | Kemampuan |
| --- | --- |
| **Stopwatch** | Mulai, jeda, lanjutkan, reset, catat lap, statistik lap, dan ekspor CSV. |
| **Focus / Pomodoro** | Preset fokus 25 menit, istirahat pendek 5 menit, dan istirahat panjang 15 menit. |
| **Countdown** | Preset 1/5/10/30 menit serta durasi khusus 1–180 menit. |
| **Activity History** | Mencatat sesi Stopwatch, Focus, dan Countdown menggunakan IndexedDB; filter, ekspor CSV, hapus entri, dan hapus seluruh riwayat. |
| **Productivity Analytics** | Grafik tren fokus untuk 7/30/90 hari, jumlah sesi, rata-rata durasi, hari fokus aktif, dan ringkasan durasi per mode. |
| **Goals & Insights** | Target fokus harian, progres, pencapaian mingguan, streak aktif, dan streak terpanjang. |
| **Pengalaman pengguna** | Dark/light mode, tampilan responsif, penyimpanan lokal, dan shortcut keyboard pada Stopwatch. |

### Aturan perhitungan statistik

- **Waktu fokus** hanya menghitung sesi *Focus kerja* yang selesai. Waktu istirahat, sesi yang terhenti, Stopwatch, dan Countdown **tidak** menambah menit fokus.
- Tren analitik menggunakan **tanggal lokal pada saat sesi berakhir**. Pilihan periode: 7, 30, atau 90 hari.
- Target harian dapat diatur **15–480 menit** dalam kelipatan 15 menit, dengan nilai awal **120 menit**. Progres dibatasi 100% pada indikator, sedangkan durasi sebenarnya tetap dicatat.
- **Streak** menghitung hari berturut-turut dengan sedikitnya satu sesi Focus kerja selesai, bukan jumlah menit yang mencapai target. Hari kemarin masih dapat mempertahankan streak jika hari ini belum memiliki sesi.
- Ringkasan mingguan menggunakan rentang **Senin–Minggu** menurut waktu lokal browser. Mengubah target akan menghitung ulang pencapaian hari sebelumnya berdasarkan target yang baru.

## Teknologi

- **Frontend:** React 19, TypeScript, Vite 8, HTML, CSS.
- **Penyimpanan:** IndexedDB untuk riwayat aktivitas; `localStorage` untuk sesi stopwatch dan preferensi.
- **Pengujian:** Node.js Test Runner untuk unit test dan Playwright untuk pengujian E2E pada Chromium, Firefox, serta WebKit.
- **CI:** GitHub Actions untuk unit test/build dan pengujian Playwright.
- **Development IDE:** WebStorm; proyek juga dapat dibuka menggunakan editor kode lainnya.

Aplikasi tidak membutuhkan server backend, akun pengguna, maupun database eksternal.

## Menjalankan secara lokal

### Prasyarat

- Node.js **22.12+** yang kompatibel dengan versi Vite proyek.
- npm, yang tersedia bersama Node.js.

```powershell
# Jalankan di folder yang berisi package.json
npm ci
npm run dev
```

Buka URL lokal yang ditampilkan oleh Vite (biasanya `http://localhost:5173/`). Gunakan `npm ci` untuk instalasi yang mengikuti `package-lock.json`; `npm install` dapat digunakan bila sedang mengubah dependensi secara sengaja.

> Proyek React/TypeScript ini tidak dijalankan dengan membuka `index.html` secara langsung atau menggunakan `python -m http.server`.

### Build dan preview produksi

```powershell
npm run typecheck
npm run build
npm run preview
```

`npm run build` menghasilkan folder `dist/`. Perintah `npm run preview` menjalankan build produksi secara lokal, biasanya di `http://localhost:4173/`.

## Pengujian

```powershell
npm run test                    # Unit test
npm run build                   # TypeScript + build produksi
npx playwright test --workers=1 # E2E di tiga browser
npx playwright show-report      # Membuka hasil Playwright terakhir
npm audit --audit-level=high    # Audit dependensi lokal
```

Untuk menyiapkan browser Playwright di perangkat baru:

```powershell
npx playwright install
```

### Rekap validasi rilis v3.1.0

| Pemeriksaan | Hasil | Keterangan |
| --- | --- | --- |
| Unit test | **28/28 lulus** | Stopwatch/sesi, riwayat, analitik, target dan streak. |
| E2E Playwright | **42/42 lulus** | TC01–TC14 pada Chromium, Firefox, dan WebKit. |
| Manual acceptance | **6/6 lulus** | Pemeriksaan fitur, penyimpanan, statistik, tema, dan responsivitas oleh pengembang. |
| Production build | **Lulus** | `tsc -b && vite build`. |

Hasil tersebut adalah baseline pengujian `v3.1.0`, termasuk pengujian GitHub Actions yang telah dilaporkan berhasil. Patch branding `v3.1.1` menambah satu skenario E2E per browser; jalankan ulang seluruh tes sebelum merilis patch.

### Audit PageSpeed Insights website publik (8 November 2026)

Audit dilakukan pada website publik Chroniq setelah deployment GitHub Pages. Skor merupakan hasil satu pengukuran dan dapat berubah bergantung perangkat serta kondisi jaringan.

| Kategori | Mobile | Desktop |
| --- | ---: | ---: |
| Performance | **97** | **100** |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |

Skor PageSpeed Insights berasal dari laporan halaman publik yang diperiksa setelah deployment. Skor Accessibility 100 tidak otomatis menjamin pemenuhan seluruh kriteria WCAG.

## Struktur proyek

```text
JustSimple-v3/  # Nama folder lokal historis; tidak harus diganti
├── .github/workflows/
│   ├── ci.yml                  # Unit test + build
│   ├── playwright.yml          # Cross-browser E2E
│   └── deploy.yml              # GitHub Pages
├── e2e/                       # TC01–TC14 (Playwright)
├── public/
│   └── favicon.svg
├── src/
│   ├── components/            # Panel dan komponen UI
│   │   ├── StopwatchPanel.tsx
│   │   ├── FocusPanel.tsx
│   │   ├── CountdownPanel.tsx
│   │   ├── ActivityHistory.tsx
│   │   ├── ProductivityAnalytics.tsx
│   │   └── GoalsInsights.tsx
│   ├── hooks/                 # State dan logika antarmuka/timer
│   ├── lib/                   # Validasi, penyimpanan, analitik, goals
│   ├── styles/global.css
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── tests/                     # Unit test berbasis Node.js
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.ts
└── vite.config.ts
```

Dokumentasi teknis tiap fase tersedia di `README_PATCH_V31.md`, `README_PHASE2_ANALYTICS.md`, dan `README_PHASE3_GOALS.md`. Dokumen tersebut menjelaskan riwayat penerapan fitur serta definisi metrik.

## Penyimpanan data dan privasi

- **IndexedDB** menyimpan riwayat aktivitas di browser/perangkat yang digunakan.
- **`localStorage`** menyimpan sesi Stopwatch (`justsimple.session.v3`), preferensi tema (`justsimple.theme.v1`), serta target fokus (`justsimple.daily-focus-goal.v1`). Key lama sengaja dipertahankan setelah rebranding agar data pengguna tetap kompatibel.
- Pada origin yang sama, aplikasi dapat membaca format sesi Stopwatch v2 (`justsimple.session.v1`) ketika belum ada sesi v3.
- **Tidak ada login dan sinkronisasi cloud.** Data aktivitas tidak dikirim ke backend aplikasi.
- Penyimpanan browser dibatasi oleh **origin**. Data di `localhost:5173` tidak otomatis tersedia di `localhost:4173` atau domain deployment.
- Membersihkan data browser, memakai private browsing, atau mengganti perangkat dapat menyebabkan riwayat lokal tidak tersedia. Ekspor CSV sebelum menghapus data atau berpindah lingkungan jika membutuhkan arsip.
- Penghapusan riwayat dapat mengubah statistik analitik dan progres target, karena keduanya dihitung dari data aktivitas yang tersimpan.
- Tampilan menggunakan Google Fonts melalui jaringan; hal ini merupakan permintaan resource eksternal, bukan pengiriman riwayat aktivitas ke server aplikasi.

## Perilaku dan keterbatasan

- Stopwatch menyimpan sesi aktif dan dapat dipulihkan setelah refresh. Pengukuran menggunakan jam monotonic browser saat aktif dan referensi waktu sistem ketika sesi berjalan dipulihkan.
- **Focus dan Countdown yang sedang berjalan belum dipulihkan setelah tab ditutup atau halaman dimuat ulang.** Riwayat sesi lengkap/terhenti dicatat melalui alur aplikasi saat tab masih aktif.
- Stopwatch memiliki aksi **Simpan sesi** yang terpisah dari Reset. Sesi Focus/Countdown disimpan otomatis ketika selesai, atau dicatat terhenti sesuai alur reset/pergantian preset setelah berjalan minimal satu detik.
- Ekspor CSV berfungsi sebagai arsip; aplikasi belum memiliki fitur impor CSV kembali ke IndexedDB.
- Statistik menunjukkan durasi dan frekuensi penggunaan yang terekam; bukan pengukuran ilmiah atas kualitas atau efektivitas kerja pengguna.

## Shortcut Stopwatch

Shortcut hanya berlaku saat mode Stopwatch aktif dan fokus tidak berada pada kolom input atau tombol:

| Tombol | Fungsi |
| --- | --- |
| `Space` | Mulai / jeda |
| `L` | Catat lap |
| `Shift + R` | Reset Stopwatch beserta lap |

## Continuous Integration dan deployment

Repository menyertakan workflow GitHub Actions:

1. `.github/workflows/ci.yml` — `npm ci`, `npm run test`, dan `npm run build`.
2. `.github/workflows/playwright.yml` — memasang browser dan menjalankan Playwright E2E.
3. `.github/workflows/deploy.yml` — build dan deployment ke GitHub Pages setelah perubahan digabungkan ke `main`.

Workflow test dikonfigurasi untuk event `push` dan `pull_request`; deployment berjalan dari branch `main`. Rilis `v3.1.0` sudah diterbitkan dan situs publik telah diverifikasi. Untuk final polish `v3.1.1`, gunakan branch tersendiri, Pull Request, pengujian ulang, baru tag rilis setelah hasilnya lulus.

## Riwayat versi

| Versi | Perkembangan |
| --- | --- |
| **v2** | Perombakan antarmuka stopwatch dari proyek awal. |
| **v3.0.0** | Migrasi React/TypeScript, Focus/Countdown, pengujian dasar. |
| **v3.1 Fase 1** | Activity History di IndexedDB. |
| **v3.1 Fase 2** | Productivity Analytics dan filter periode. |
| **v3.1 Fase 3** | Goals & Insights, pencapaian dan streak. |
| **v3.1.0** | Stable release, GitHub Actions, GitHub Release, dan GitHub Pages. |
| **v3.1.1 (rencana)** | Konsistensi branding Chroniq, metadata dan nama ekspor CSV; tidak ada migrasi storage. |

Perubahan `v3.1.1` belum dianggap rilis sampai pengujian dan deployment terbaru berhasil.

## Asal proyek dan lisensi

Chroniq (sebelumnya JustSimple) merupakan pengembangan berkelanjutan dari proyek stopwatch pribadi yang dibuat pada awal kuliah. Source code dan desain dikembangkan bertahap sebagai portofolio frontend dan software engineering.

**Lisensi belum ditetapkan.** Jika repository dipublikasikan, pemilik proyek dapat memilih untuk menambahkan file `LICENSE` secara terpisah. Ketiadaan file lisensi tidak otomatis memberikan izin penggunaan ulang kepada pihak lain.
