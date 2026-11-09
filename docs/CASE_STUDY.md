# Chroniq v3.1.1

**Dari stopwatch sederhana menjadi aplikasi pelacakan waktu dan produktivitas berbasis web**

**Portfolio Case Study | Software Engineering & Product Development**
**Peran:** Pengembangan dan integrasi frontend, perancangan fitur, pengujian, dokumentasi, serta proses rilis dan deployment
**Konteks:** Proyek pengembangan mandiri untuk portofolio mahasiswa S1 Sistem Informasi
**Teknologi:** React 19, TypeScript, Vite 8, CSS, IndexedDB, localStorage, Node.js Test Runner, Playwright, GitHub Actions
**Versi akhir yang dibahas:** v3.1.1 — Final Branding Polish

**Live Website:** https://rangggase.github.io/Chroniq-time/
**Source Code:** https://github.com/Rangggase/Chroniq-time
**Release:** https://github.com/Rangggase/Chroniq-time/releases/tag/v3.1.1

## 01. Ringkasan proyek

Chroniq adalah aplikasi web responsif untuk mengelola waktu dan memantau aktivitas produktivitas melalui Stopwatch, Focus/Pomodoro, Countdown, Activity History, Productivity Analytics, serta Goals & Insights. Aplikasi ini berkembang dari JustSimple, sebuah proyek stopwatch sederhana berbasis HTML, CSS, dan JavaScript yang dibuat pada masa awal perkuliahan.

Modernisasi tidak berhenti pada perubahan tampilan. Proyek ditata ulang dengan React dan TypeScript, pemisahan logika domain, penyimpanan data aktivitas secara lokal, pengujian otomatis lintas-browser, dan deployment berulang melalui GitHub Actions. Hasil akhirnya berupa aplikasi yang dapat diakses publik serta memiliki riwayat pengembangan dan kualitas rilis yang dapat ditelusuri.

**Masalah yang ditangani:** stopwatch dasar hanya membantu mengukur durasi sesaat. Pengguna yang ingin menjalankan sesi fokus, melihat riwayat, membandingkan pola penggunaan, dan menetapkan target harian membutuhkan alur kerja yang lebih terintegrasi.

**Tujuan proyek:** membuat pengalaman pelacakan waktu yang sederhana, terukur, dan mudah digunakan, sekaligus menerapkan proses software engineering yang lebih sistematis dari versi awal hingga rilis stabil.

## 02. Evolusi dari JustSimple ke Chroniq

| Tahap | Perubahan utama | Nilai yang ditambahkan |
| --- | --- | --- |
| JustSimple awal | Stopwatch HTML/CSS/JavaScript dengan start, stop, reset, dan lap. | Fondasi logika waktu dan interaksi dasar. |
| Modernisasi awal | Tampilan responsif, tema, statistik lap, ekspor CSV, dan penyimpanan browser. | Usability dan keberlanjutan sesi. |
| v3.0 Stable | Migrasi ke React + TypeScript + Vite; Stopwatch, Focus/Pomodoro, dan Countdown dalam satu antarmuka. | Struktur aplikasi modular dan baseline pengujian. |
| v3.1 Fase 1 | Activity History berbasis IndexedDB; filter, ekspor, dan hapus riwayat. | Data aktivitas yang persisten dan dapat ditinjau kembali. |
| v3.1 Fase 2 | Productivity Analytics dengan rentang 7, 30, dan 90 hari. | Informasi pola penggunaan dan ringkasan waktu fokus. |
| v3.1 Fase 3 | Daily Goals, progres mingguan, streak, dan validasi target. | Dukungan pemantauan konsistensi fokus. |
| v3.1.1 | Rebranding konsisten dari JustSimple menjadi Chroniq pada UI, metadata, dokumentasi, dan ekspor. | Identitas produk yang lebih matang tanpa migrasi data pengguna. |

Pendekatan bertahap ini membantu menjaga fitur lama tetap berjalan sambil menambahkan kemampuan baru. Setiap fase diuji sebelum dilanjutkan ke fase berikutnya.

## 03. Arsitektur dan keputusan teknis

Chroniq menggunakan arsitektur **client-side** tanpa backend aplikasi atau sistem akun. Data aktivitas dan preferensi disimpan pada browser pengguna. Pemisahan komponen, hooks, utilitas domain, dan penyimpanan dirancang agar aturan bisnis tidak terikat langsung pada presentasi UI.

| Lapisan | Implementasi | Tanggung jawab |
| --- | --- | --- |
| Presentation | Komponen React: StopwatchPanel, FocusPanel, CountdownPanel, ActivityHistory, ProductivityAnalytics, GoalsInsights. | Menampilkan antarmuka dan menangani interaksi pengguna. |
| State & interaction | Custom hooks seperti useStopwatch, useFocusTimer, useCountdown, useActivityHistory, dan useTheme. | Mengelola status timer, pilihan mode, tema, serta pembaruan data. |
| Domain logic | Modul `src/lib/` untuk waktu, sesi, validasi aktivitas, analitik, goals, dan CSV. | Perhitungan yang dapat diuji secara terpisah dari komponen. |
| Persistence | IndexedDB untuk Activity History; localStorage untuk sesi Stopwatch dan preferensi. | Menyimpan data lokal dan mempertahankan kompatibilitas key lama. |
| Quality & delivery | Node.js Test Runner, Playwright, Git, GitHub Actions, Vite, GitHub Pages. | Validasi, build produksi, dan publikasi aplikasi. |

**Aliran data utama:** sesi Focus selesai → aktivitas divalidasi → catatan disimpan ke IndexedDB → modul analitik dan goals membaca catatan → dashboard menghitung ulang metrik dan menampilkan hasilnya.

Aturan metrik dibuat eksplisit: **waktu fokus hanya berasal dari sesi kerja Focus yang selesai**. Sesi istirahat, sesi terinterupsi, Stopwatch, dan Countdown tidak menaikkan total menit fokus. Pengelompokan harian menggunakan tanggal lokal saat sesi berakhir, sedangkan periode mingguan dihitung dari Senin sampai Minggu.

Target fokus harian dapat diatur antara **15–480 menit** dalam kelipatan 15 menit, dengan nilai awal **120 menit**. Indikator progres berhenti di 100%, tetapi jumlah waktu yang sebenarnya tetap dipertahankan. Streak dihitung berdasarkan hari berturut-turut dengan sesi Focus kerja yang selesai, bukan berdasarkan keberhasilan mencapai target menit.

## 04. Fitur dan pengalaman pengguna

**Stopwatch.** Start, pause, resume, reset, pencatatan lap, statistik lap, pemulihan sesi, shortcut keyboard, dan ekspor CSV. Pengguna juga dapat menyimpan aktivitas Stopwatch ke riwayat.

**Focus/Pomodoro.** Sesi kerja dan preset istirahat pendek atau panjang, dengan status sesi yang dibedakan agar analitik tidak mencampurkan waktu kerja dan istirahat.

**Countdown.** Preset durasi dan waktu khusus untuk aktivitas yang memiliki batas waktu.

**Activity History.** Pencatatan sesi Stopwatch, Focus, dan Countdown ke IndexedDB, disertai filter, ekspor CSV, penghapusan entri, serta penghapusan riwayat.

**Productivity Analytics.** Ringkasan durasi fokus, sesi selesai, rata-rata, hari aktif, tren 7/30/90 hari, dan perincian berdasarkan mode.

**Goals & Insights.** Target fokus harian, progres hari ini, ringkasan mingguan, active streak, dan longest streak.

**User experience.** Tema gelap/terang, desain responsif, antarmuka berbahasa Indonesia, dan penyimpanan preferensi browser. Rebranding v3.1.1 menyeragamkan nama Chroniq tanpa mengubah gaya visual yang sudah diuji.

## 05. Tantangan engineering dan cara penyelesaiannya

| Tantangan | Pendekatan yang diterapkan | Pembelajaran |
| --- | --- | --- |
| Ketepatan timer dan refresh | Stopwatch menggunakan pengukuran waktu monotonic saat berjalan serta referensi waktu sistem untuk pemulihan sesi. | Logika berbasis waktu memerlukan pengujian transisi state, bukan hanya tampilan angka. |
| Perbedaan tanggal lokal dan UTC | Perhitungan analitik dan goals menggunakan batas hari lokal serta uji batas tanggal, tahun, dan minggu. | Definisi metrik harus konsisten dengan konteks pengguna. |
| Sesi tidak valid dan riwayat | Validasi durasi/timestamp, status completed/interrupted, serta penanganan kegagalan penyimpanan. | Kualitas data menentukan kualitas insight. |
| Stabilitas E2E di WebKit | Mengurangi konkurensi, menggunakan reduced motion untuk WebKit, dan memperbaiki stabilitas interaksi UI. | Pengujian lintas-browser memerlukan pengendalian timing dan animasi. |
| Instalasi dependensi Windows | Mengatasi `EPERM` saat TypeScript executable terkunci; `npm ci` dijalankan kembali hingga dependensi lengkap. | Masalah lingkungan perlu dipisahkan dari masalah source code. |
| Deployment pada subpath GitHub Pages | Konfigurasi base path Vite dan workflow deployment GitHub Actions. | Build lokal belum cukup; aset dan navigasi harus diverifikasi pada URL publik. |
| Rebranding tanpa kehilangan data | Nama UI, metadata, dan ekspor diperbarui, tetapi key localStorage dan identifier IndexedDB lama dipertahankan. | Perubahan branding tidak seharusnya merusak kompatibilitas data pengguna. |

Ekspor CSV juga mencakup perlindungan terhadap teks yang dapat ditafsirkan sebagai formula spreadsheet. Fitur ini menunjukkan perhatian pada keamanan output, meskipun aplikasi tidak mengelola akun atau backend.

## 06. Pengujian dan hasil terukur

Pengujian menggunakan tiga pendekatan: **unit test** untuk aturan domain, **end-to-end test** untuk perilaku antarmuka, dan **manual acceptance** untuk memastikan pengalaman penggunaan sesuai harapan.

| Indikator | Hasil tercatat | Ruang lingkup |
| --- | --- | --- |
| Unit test v3.1.1 | **28/28 passed** | Timer, sesi, CSV, Activity History, Analytics, Goals & Streaks. |
| Playwright E2E v3.1.1 | **45/45 passed** | 15 skenario per browser: Chromium, Firefox, WebKit. |
| Manual acceptance v3.1 | **6/6 lulus** | Navigasi, penyimpanan, analitik, goals, ekspor, tema, dan tampilan responsif. |
| Production build | **Passed** | TypeScript compilation dan Vite build. |
| Dependensi | **0 vulnerabilities reported** | Hasil `npm ci`/audit pada lingkungan pengembangan saat pengujian. |
| GitHub Actions | **Passed pada PR final** | Pemeriksaan otomatis sebelum merge; workflow deploy dikelola terpisah. |

**PageSpeed Insights pada website publik (pengukuran yang dilaporkan, 8 November 2026):** Performance **97 mobile / 100 desktop**; Accessibility **100/100**; Best Practices **100/100**; dan SEO **100/100**. Nilai Lighthouse merupakan hasil pengukuran pada waktu tertentu, bukan jaminan skor yang sama pada setiap perangkat atau jaringan. Skor aksesibilitas yang tinggi juga bukan sertifikasi seluruh kriteria WCAG.

Pengujian v3.1.1 menambahkan skenario khusus untuk memeriksa konsistensi nama Chroniq, metadata browser, dan favicon pada tiga browser. Hasil pengujian menunjukkan cakupan regresi yang lebih luas dibandingkan rilis v3.1.0, yang tercatat memiliki **42/42 E2E passed**.

## 07. Git workflow, rilis, dan deployment

Pengembangan menggunakan Git dengan branch fitur terpisah, commit bertahap, Pull Request, pemeriksaan GitHub Actions, dan merge ke `main`. Riwayat rilis memperlihatkan evolusi dari baseline `v3.0.0`, pengembangan v3.1, hingga rebranding v3.1.1.

**Rantai pengiriman:** feature branch → Pull Request → CI unit test/build + Playwright → merge ke `main` → build dan deployment GitHub Pages → pemeriksaan website publik → tag dan GitHub Release.

Versi **v3.1.0** memperkenalkan Productivity & Analytics, sedangkan **v3.1.1** memfinalisasi identitas Chroniq. Pengujian pascadeployment mencakup tampilan mobile/desktop dan audit PageSpeed Insights. Pemisahan tag rilis dan commit deployment menjaga riwayat aplikasi tetap dapat ditelusuri.

## 08. Keterbatasan dan ruang pengembangan

Chroniq merupakan aplikasi **local-first**. Data hanya tersedia pada browser dan origin yang digunakan; belum ada akun, sinkronisasi lintasperangkat, atau backend. Membersihkan penyimpanan browser dapat menghapus riwayat, dan ekspor CSV belum disertai fitur impor ulang. Sesi Focus dan Countdown yang masih berjalan belum sepenuhnya dipulihkan setelah halaman dimuat ulang.

Karena proyek ini merupakan portofolio pengembangan mandiri, **belum ada bukti pengukuran dampak terhadap produktivitas pengguna eksternal**. Klaim keberhasilan dibatasi pada implementasi fitur, hasil pengujian, kesiapan deployment, dan kualitas teknis yang terdokumentasi.

Pengembangan berikutnya—jika dibutuhkan—dapat diarahkan pada ekspor/impor cadangan yang lebih lengkap, pengalaman offline, peningkatan aksesibilitas berdasarkan pengujian pengguna, atau sinkronisasi opsional. Fitur tambahan tersebut bukan prasyarat untuk menyatakan v3.1.1 selesai sebagai proyek portofolio.

## 09. Nilai proyek untuk portofolio Sistem Informasi

Chroniq menunjukkan penerapan kemampuan yang relevan untuk mahasiswa S1 Sistem Informasi: menerjemahkan kebutuhan pengguna menjadi fitur; memodelkan dan menjaga konsistensi data aktivitas; menyusun aturan metrik yang dapat dijelaskan; membangun antarmuka berbasis komponen; menguji perangkat lunak secara otomatis; serta mengelola rilis yang dapat diakses publik.

Nilai penting proyek ini bukan hanya jumlah fitur, melainkan **kemampuan mengubah produk awal yang sederhana menjadi aplikasi yang terstruktur, teruji, dan memiliki alur delivery yang jelas**. Dalam konteks wawancara, proyek ini dapat digunakan untuk menjelaskan keputusan teknis, trade-off, proses debugging, dan cara memastikan kualitas sebelum perubahan dipublikasikan.

**Ringkasan untuk CV (bahasa Indonesia):** Mengembangkan Chroniq, aplikasi pelacakan waktu dan produktivitas berbasis React–TypeScript dengan IndexedDB, analitik 7/30/90 hari, dan daily goals; memvalidasi rilis melalui **28 unit test dan 45 Playwright E2E test** lintas tiga browser, serta menerapkan CI/CD dan deployment GitHub Pages.

**One-line pitch (English):** Evolved a vanilla JavaScript stopwatch into a React–TypeScript productivity app with browser-based activity analytics, automated cross-browser testing, and GitHub Pages deployment.

