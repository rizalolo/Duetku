# Keuangan — Aplikasi Keuangan Pribadi

PWA (bisa diinstall di Android & diakses di browser desktop) untuk mencatat
transaksi, budgeting, dan analisis keuangan pribadi. Backend: Firebase
(Auth Google + Firestore).

## Status: Fase 2 + sebagian Fase 3 selesai

Sudah bisa dipakai:
- Login dengan akun Google
- Kelola Dompet (saldo otomatis: saldo awal + pemasukan - pengeluaran)
- Kelola Kategori (kebutuhan / keinginan), sudah ada kategori default
- Tambah/lihat/hapus transaksi manual, dengan tanggal & jam, toggle tampilan minggu/bulan
- PWA - bisa di-install ke Android via Chrome ("Tambahkan ke layar utama")

Fase 2:
- Anggaran per kategori (limit bulanan berulang), progres %, sisa hari, banner peringatan di Beranda saat >=80%
- Ikhtisar: donut pemasukan/pengeluaran, kebutuhan vs keinginan, kategori teratas, tab Bandingkan (6 bulan + per kategori)
- Hutang dengan tenggat & catat pembayaran cicilan
- Ekspor Excel (Lainnya > Ekspor ke Excel)

Fase 3 (sebagian):
- Tambah transaksi dengan suara (Web Speech API, gratis, tombol "Isi dengan suara" di form transaksi — hanya muncul di browser yang mendukung, mis. Chrome Android)
- Impor transaksi dari Excel (Lainnya > Impor dari Excel), format kolom sama seperti hasil Ekspor
- Transaksi sekarang bisa diedit (ketuk transaksi di Beranda), tidak cuma dihapus
- Beranda: toggle Minggu/Bulan sekarang punya navigasi maju-mundur dan benar-benar membatasi rentang tanggal
- Hutang/Piutang: bayar/terima sekarang membuat transaksi otomatis yang memotong/menambah saldo dompet; Hutang dipindah jadi tab di halaman Anggaran (tidak lagi di menu Lainnya)

Belum ada:
- Scan struk (OCR) — menyusul, lihat catatan di README soal opsi Tesseract.js vs Cloud Vision

## Cara menjalankan

1. Install dependency:
   ```
   npm install
   ```

2. Isi kredensial Firebase kamu. Buka `.env.local` (sudah dibuat, isinya
   kosong) dan isi dari Firebase Console -> Project Settings -> General ->
   Your apps -> SDK setup and configuration:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

3. Di Firebase Console, pastikan:
   - Authentication -> Sign-in method -> Google sudah diaktifkan
   - Firestore Database sudah dibuat (mode production atau test, tidak masalah - rules kita atur sendiri)
   - Domain tempat kamu run app (misal localhost) ada di Authentication -> Settings -> Authorized domains (localhost biasanya sudah otomatis ada)

4. Terapkan Firestore security rules (isinya sudah ada di file `firestore.rules`
   di root project ini). Cara paling gampang: buka Firebase Console ->
   Firestore Database -> Rules, lalu copy-paste isi file itu, klik Publish.

5. Jalankan dev server:
   ```
   npm run dev
   ```
   Buka URL yang muncul (biasanya http://localhost:5173), login dengan
   akun Google kamu.

## Kalau ada error

Kalau muncul error pas login atau nyimpan data (misal auth/unauthorized-domain
atau permission-denied), itu biasanya karena langkah 3 atau 4 di atas belum
selesai. Kirim pesan error persisnya untuk dibantu diperbaiki.

## Struktur data Firestore

Semua data disimpan di bawah users/{uid}/... - lihat src/types/index.ts
untuk skema lengkap tiap koleksi (wallets, categories, transactions, budgets,
debts).
