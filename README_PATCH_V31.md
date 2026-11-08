# JustSimple v3.1 — Patch Tahap 1: Activity History

Patch ini dibuat dari source `JustSimple-v3.zip` yang dikirim setelah seluruh pengujian v3.0 berhasil.

## Apa yang berubah

- Riwayat aktivitas baru disimpan pada **IndexedDB** (database `justsimple.activity.v1`, object store `activities`). Data v3.0 di `localStorage` tetap utuh.
- Tombol **Simpan sesi** pada Stopwatch menyimpan snapshot sesi aktif/paused lalu mereset stopwatch **hanya jika penyimpanan berhasil**.
- Focus/Countdown otomatis menyimpan sesi yang mencapai akhir. Jika pengguna menekan Reset atau mengganti preset setelah minimal 1 detik, riwayat dicatat berstatus `interrupted`.
- Panel **Riwayat aktivitas** di bawah stopwatch/focus/countdown, dengan ringkasan, filter, ekspor CSV, hapus satu, dan hapus semua dengan konfirmasi.
- `package.json` dan lockfile disesuaikan ke 3.1.0. CI menggunakan npm ci dan Playwright di seluruh branch.
- Test baru `tests/activity.test.mjs` dan `e2e/activity.spec.ts`.

## Cara memasang (Windows + WebStorm)

1. Pastikan terminal berada di `D:\new another projectb\JustSimple-v3`, branch `feat/v3.1-productivity`, dan `git status` bersih.
2. Buat backup folder proyek atau checkpoint ZIP terlebih dahulu.
3. Ekstrak ZIP **ke folder induk** `D:\new another projectb\` (bukan ke dalam `JustSimple-v3`). Di dalam ZIP terdapat folder `JustSimple-v3/` yang sejajar dengan proyek yang sudah ada. Izinkan overwrite file yang namanya sama.
4. Jangan menyalin `.git` atau `node_modules` dari ZIP lama; patch ini tidak berisi keduanya.
5. Di terminal WebStorm jalankan:

```powershell
npm ci
npm run test
npm run build
npx playwright test --workers=1
npx playwright show-report
```

Setelah pemasangan patch, targetnya **14 tes unit** dan **30 eksekusi Playwright** (10 skenario x 3 browser), tetapi angka E2E ini adalah target yang harus diverifikasi di komputermu, bukan klaim sudah lulus.

## Acceptance testing manual yang disarankan

- [ ] Stopwatch mulai, catat lap, lalu Simpan sesi: riwayat bertambah 1, stopwatch kembali nol.
- [ ] Refresh halaman: riwayat tetap ada.
- [ ] Focus dijalankan minimal 1 detik lalu Reset: riwayat bertambah dengan status Dihentikan.
- [ ] Countdown dijalankan minimal 1 detik lalu Reset: riwayat bertambah dengan status Dihentikan.
- [ ] Filter jenis, ekspor CSV, hapus entri, dan hapus semua bekerja.
- [ ] Dark/light mode dan tampilan mobile tetap baik.
- [ ] Tes lama Stopwatch, Focus, Countdown, dan ekspor lap tetap lulus.

## Batasan desain tahap ini

- Belum ada grafik mingguan atau target produktivitas. Itu tahap selanjutnya setelah riwayat stabil.
- Focus/Countdown yang masih berjalan **tidak** otomatis diarsipkan saat refresh/menutup browser; hanya penyelesaian atau Reset/ganti preset ketika halaman terbuka. Ini akan ditangani pada pengembangan berikutnya.
- Riwayat hanya tersedia pada origin browser yang sama. Data IndexedDB tidak sinkron ke perangkat lain.
- Untuk sesi Stopwatch lama dari v3.0, `startedAt` pada arsip mungkin dihitung dari waktu akhir minus durasi aktif, karena versi lama belum menyimpan timestamp awal pertama.
- Berkas ZIP yang sebelumnya dikirim memuat `.git`, `node_modules`, `.idea`, `dist`. Abaikan folder-folder tersebut saat berbagi source di masa depan; `.git` tetap disimpan di komputer.

## Setelah pengujian lulus

```powershell
git status
git diff --stat
git add .
git commit -m "feat: add IndexedDB activity history in v3.1"
```

Jangan membuat tag rilis `v3.1.0` sebelum Playwright, build, manual acceptance, dan review GitHub Actions lulus. Tag `v3.0.0` di branch `main` harus tetap tidak berubah.
