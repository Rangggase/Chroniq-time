# JustSimple v3.1 — Fase 2: Productivity Analytics

Patch ini dilanjutkan dari **v3.1 Activity History** (`ecf687d`) pada branch `feat/v3.1-productivity`.
Tidak ada dependensi npm baru dan tidak ada perubahan pada skema IndexedDB.

## Fitur
- Statistik 7/30/90 hari: menit fokus selesai, jumlah sesi fokus, rata-rata, hari aktif
- Grafik tren fokus (harian untuk 7 hari; kelompok 7 hari untuk 30/90 hari)
- Durasi selesai per mode dan jumlah sesi selesai/terhenti
- Dashboard akan otomatis diperbarui setelah penyimpanan/penghapusan Activity History
- Kosong/error state dan desain responsif

## Perhitungan yang dipakai
- Periode dihitung berdasarkan **tanggal lokal browser saat sesi selesai**, termasuk hari ini.
- Waktu fokus hanya menghitung `kind=focus`, `status=completed`, dan `preset=focus`.
- Istirahat Pomodoro (`short`/`long`) tidak dihitung dalam menit fokus atau durasi Focus.
- Sesi terhenti tidak dihitung dalam durasi sesi selesai.
- Jumlah `Sesi selesai` mencakup seluruh jenis aktivitas yang benar-benar berstatus `completed`, termasuk istirahat Pomodoro.
- Jika aktivitas melintasi tengah malam, seluruh durasinya ditempatkan pada tanggal sesi berakhir; data historis tidak diubah.
- Grafik tidak membuat klaim tingkat produktivitas atau penilaian kualitas kerja; ia menunjukkan waktu yang terekam saja.

## Penerapan
1. Pastikan `git branch --show-current` menunjukkan `feat/v3.1-productivity` dan `git status` bersih.
2. Backup proyek lokal. Ekstrak ZIP patch di `D:\\new another projectb\\`, lalu gabungkan folder `JustSimple-v3` dan izinkan timpa file yang sama.
3. Tidak perlu menjalankan `npm ci` lagi kecuali node_modules sudah tidak ada. Tidak ada paket baru.
4. Jalankan `npm run test`, `npm run build`, `npx playwright test --workers=1`, lalu `npm run dev`.
5. Coba Simpan Sesi Stopwatch dan cek panel Analisis produktivitas. Stopwatch tampil dalam durasi per mode, **bukan** menit fokus.
6. Untuk menguji menit fokus, selesaikan satu sesi pada preset Focus. Gunakan filter 7/30/90 hari.

## Target pengujian
- 20 unit test (14 lama + 6 analitik baru)
- 36 Playwright E2E (30 lama + 6 analitik baru, setiap test berjalan di 3 browser)
- Build produksi PASS

Semua target di atas harus diverifikasi pada perangkat pengembang sebelum commit/rilis. Jangan membuat tag `v3.1.0` terlebih dahulu.
