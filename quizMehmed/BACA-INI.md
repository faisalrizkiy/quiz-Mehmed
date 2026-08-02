# Kuis Seru — Panduan Setup

File sudah dipisah jadi 3 bagian, lebih rapi dan gampang dirawat:

- `index.html` — struktur halaman saja
- `style.css` — semua tampilan/desain
- `script.js` — semua logika (soal, skor, papan skor)
- `database.sql` — skema database baru untuk papan skor
- Folder `assets/` — taruh `background.jpg`, `foto.jpg`, `music.mp3` di sini (nama file harus sama persis)

## Apa yang berubah dari versi lama

- Tampilan baru: tema "malam kuis" dengan warna emas di atas latar ungu gelap, font Baloo 2 (judul) + Work Sans (isi teks) — bukan cuma Comic Neue di semua tempat.
- Ada indikator progres (titik-titik) yang menyala hijau/merah tiap soal terjawab, jadi jelas sudah sampai soal ke berapa.
- Opsi jawaban sekarang pakai elemen `<button>` sungguhan (bisa dinavigasi pakai keyboard/Tab, ramah pembaca layar), bukan `<div>` biasa.
- Ada perlindungan dari klik ganda saat menjawab, dan nama pemain di-escape supaya tidak bisa dipakai untuk menyuntik HTML/skrip jahat ke papan skor.
- Kalau database belum disambungkan, papan skor menampilkan pesan yang jelas alih-alih error diam-diam di console.
- Menghormati pengaturan "reduce motion" perangkat, untuk pengguna yang sensitif terhadap animasi.

## Menyambungkan database baru (Supabase)

1. Buka https://supabase.com, buat akun/login, lalu klik **New project**.
2. Setelah project jadi, buka **Settings > API**. Salin **Project URL** dan **anon public key**.
3. Buka **SQL Editor** di dashboard, tempel isi `database.sql`, lalu klik **Run**. Ini akan membuat tabel `leaderboard` beserta izin aksesnya.
4. Buka `script.js`, ganti dua baris ini di paling atas dengan nilai yang kamu salin tadi:
   ```js
   const SUPABASE_URL = "GANTI_DENGAN_PROJECT_URL_SUPABASE_BARU";
   const SUPABASE_KEY = "GANTI_DENGAN_ANON_KEY_SUPABASE_BARU";
   ```
5. Simpan, lalu buka `index.html` di browser (atau upload ke hosting kamu). Coba main sekali dan cek tabel `leaderboard` di Supabase — skor kamu harus muncul di sana.

Kunci "anon public" ini memang didesain untuk dipakai di sisi browser (tidak rahasia), tapi tetap dibatasi lewat aturan `Row Level Security` di `database.sql` — hanya boleh baca semua data dan menambah baris baru, tidak bisa mengubah atau menghapus skor orang lain.

## Menjalankan di lokal

Karena pakai `fetch`/modul dari CDN, buka lewat server lokal, bukan `file://`, misalnya:

```bash
npx serve .
```

lalu buka alamat yang ditampilkan di terminal.
