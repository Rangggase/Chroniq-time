# JustSimple v3.1 — Fase 3: Goals & Insights

Patch ini diterapkan di atas **Fase 2 (`223619a` pada branch `feat/v3.1-productivity`)**. Tidak membuat repository baru, tidak mengubah `main`, dan **belum** merilis tag `v3.1.0`.

## Isi patch

| File | Tindakan |
| --- | --- |
| `src/App.tsx` | diperbarui — merender modul Goals & Insights |
| `src/styles/global.css` | diperbarui — tampilan responsif yang mengikuti dark/light mode |
| `src/lib/goals.ts` | baru — validasi target, agregasi tujuan harian/mingguan dan streak |
| `src/components/GoalsInsights.tsx` | baru — dashboard target dan konsistensi |
| `tests/goals.test.mjs` | baru — 8 pengujian unit tambahan |
| `e2e/goals.spec.ts` | baru — TC13 dan TC14 (masing-masing tiga browser) |
| `README.md` | diperbarui — dokumentasi Fase 3 |
| `README_PHASE3_GOALS.md` | baru — panduan patch ini |

Tidak ada penambahan dependensi npm, perubahan database IndexedDB, atau penghapusan fitur sebelumnya.

## Fitur dan definisi metrik

- **Target fokus harian:** 15–480 menit dengan kelipatan 15 (bawaan 120 menit). Pengaturan disimpan di `localStorage` dengan key `justsimple.daily-focus-goal.v1`, terpisah dari data sesi.
- **Progres hari ini:** hanya durasi sesi `kind='focus'`, `preset='focus'`, `status='completed'` yang **selesai pada tanggal lokal hari ini**. Bilah progres dibatasi 100%; durasi yang melebihi target tetap disimpan/ditampilkan.
- **Tercapai minggu ini:** jumlah hari kalender **Senin–Minggu lokal** dengan jumlah fokus selesai >= target yang sekarang disetel. Mengubah target menghitung ulang pencapaian historis, tidak mengubah rekaman aktivitas.
- **Streak:** jumlah hari berurutan dengan minimal satu sesi Focus kerja yang selesai (tidak bergantung jumlah menit/target). Jika hari ini belum aktif, streak kemarin masih ditampilkan; jika kemarin juga kosong, streak sekarang 0. Streak terpanjang dihitung dari seluruh riwayat di browser.
- **Waktu fokus mingguan:** jumlah durasi fokus kerja selesai sejak Senin lokal sampai hari ini.
- Istirahat Pomodoro, Countdown, Stopwatch, dan sesi Focus terhenti **tidak** menjadi waktu fokus maupun streak.
- Semua data lokal browser/origin masing-masing. Menghapus riwayat menurunkan semua metrik. Tidak ada upload ke server.

## Pemasangan di WebStorm — Windows PowerShell

1. Pastikan backup proyek dan kondisi Git clean: `git status` (branch harus `feat/v3.1-productivity`).
2. Letakkan ZIP patch di `D:\new another projectb\JustSimple_v3_1_Phase3_Goals_Insights_Patch.zip`.
3. **Jangan** mengekstrak patch langsung ke dalam `JustSimple-v3\JustSimple-v3`. Gunakan kode berikut untuk menyalin file ke lokasi tepat:

```powershell
$ErrorActionPreference = 'Stop'
$project = 'D:\new another projectb\JustSimple-v3'
$patch = 'D:\new another projectb\JustSimple_v3_1_Phase3_Goals_Insights_Patch.zip'
if (!(Test-Path -LiteralPath $patch)) { throw "ZIP tidak ditemukan: $patch" }
if ((git -C $project branch --show-current) -ne 'feat/v3.1-productivity') { throw 'Branch Git tidak sesuai' }
if (git -C $project status --porcelain) { throw 'Working tree belum clean' }
$temp = Join-Path $env:TEMP ('JustSimple-phase3-' + [guid]::NewGuid())
$paths = @('src/App.tsx','src/styles/global.css','src/lib/goals.ts',
  'src/components/GoalsInsights.tsx','tests/goals.test.mjs','e2e/goals.spec.ts',
  'README.md','README_PHASE3_GOALS.md')
try {
  Expand-Archive -LiteralPath $patch -DestinationPath $temp
  foreach ($file in $paths) {
    $source = Join-Path (Join-Path $temp 'JustSimple-v3') $file
    if (!(Test-Path -LiteralPath $source)) { throw "File patch hilang: $file" }
  }
  foreach ($file in $paths) {
    $source = Join-Path (Join-Path $temp 'JustSimple-v3') $file
    $target = Join-Path $project $file
    New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
    Copy-Item -LiteralPath $source -Destination $target -Force
    Write-Host "Terpasang: $file" -ForegroundColor Green
  }
}
finally { if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Recurse -Force } }
git -C $project status --short
```

## Pengujian

```powershell
npm run test               # Target: 28/28
npm run build              # Target: PASS
npx playwright test --list # Target: 42 eksekusi (14 kasus x 3 browser)
npx playwright test --workers=1
npx playwright show-report
```

Tes E2E fase baru: TC13 — menyimpan target dan memulihkannya setelah refresh; TC14 — ringkasan target/streak dari IndexedDB dan pengecualian sesi istirahat.

**Manual:** jalankan `npm run dev`, buka bagian **Target & konsistensi**. Ubah target ke 60 menit, simpan, refresh, lalu periksa masih 60. Buat sesi Focus selesai melalui aplikasi (atau gunakan test fixture E2E); periksa progres dan kartu hari aktif. Periksa dark/light serta layout HP. Periksa semua modul sebelumnya tetap berfungsi.

Jika semua lulus dan aplikasi telah diperiksa manual:

```powershell
git status
git add src/App.tsx src/styles/global.css src/lib/goals.ts src/components/GoalsInsights.tsx tests/goals.test.mjs e2e/goals.spec.ts README.md README_PHASE3_GOALS.md
git commit -m "feat: add daily focus goals and consistency insights"
git status
```

**Jangan membuat tag `v3.1.0` sebelum final QA.**
