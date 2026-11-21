# Dana Kencan 💸

Aplikasi web untuk mencatat dan mengelola **dana kencan bersama**. Pasangan patungan ("urunan") setiap sesi, mencatat pengeluaran, lalu sisa uangnya disimpan sebagai **saldo endapan** yang terbawa ke sesi berikutnya. Data tersimpan di Google Sheets lewat Google Apps Script.

## Cara Kerja Sistem

1. **Urunan**: Cowok dan Cewek mengisi nominal patungan masing-masing.
2. **Pengeluaran**: Setiap barang dicatat dengan nama, kategori, dan harga.
3. **Perhitungan otomatis**:
   - Mode normal: `Sisa Hari Ini = Total Urunan − Total Pengeluaran`
   - `Proyeksi Saldo Akhir = Saldo Endapan + Sisa Hari Ini`
   - Jika pengeluaran lebih besar dari urunan, defisit memotong saldo endapan.
4. **Tutup Sesi**: Sesi disimpan ke database dan saldo endapan baru dipakai untuk sesi berikutnya.

## Fitur

### 🔐 Autentikasi
- Login memakai PIN. PIN diverifikasi oleh backend (Google Apps Script).
- Status login disimpan di `localStorage`.
- Halaman `/dashboard`, `/riwayat`, dan `/statistik` dilindungi `ProtectedRoute`. Pengguna yang belum login diarahkan ke `/login`.
- URL yang tidak dikenal dialihkan ke halaman depan.

### 🏠 Landing Page
- Halaman perkenalan aplikasi yang menjelaskan fitur utama.
- Formulir pendaftaran peminat (`tambah_peminat`) yang dikirim ke backend.

### 📊 Dashboard
- Menampilkan **Saldo Endapan** yang diambil dari database. Saldo bisa disembunyikan atau ditampilkan.
- Input urunan Cowok dan Cewek.
- Tambah dan hapus pengeluaran, dengan kategori.
- Ringkasan kategori beserta persentase tiap kategori.
- **Mode Cheat Day 👑**: urunan tidak dipakai, dan pengeluaran dihitung langsung dari total dana (urunan + endapan).
- Peringatan saat pengeluaran melebihi urunan, dan peringatan **BAHAYA** saat saldo gabungan minus.
- **Draft otomatis**: input urunan, pengeluaran, tanggal, dan mode disimpan di `localStorage`, jadi tidak hilang saat halaman dimuat ulang.
- Jika server tidak bisa dihubungi, saldo cadangan dari `localStorage` dipakai.
- Tutup sesi memakai dialog konfirmasi SweetAlert2 dan layar loading saat menyimpan.

### 🧾 Riwayat
- Tabel laporan sesi: tanggal, mode, total keluar, sisa harian, dan saldo akhir.
- Filter berdasarkan **rentang tanggal** dan **kata kunci** (nama barang, kategori, atau mode).
- Tombol **Struk** untuk melihat detail barang per sesi, dengan tampilan siap cetak.
- Tombol **Hapus** sesi, dengan konfirmasi.
- Tampilan tabel menyesuaikan layar HP.

### 📈 Statistik
- Diagram lingkaran (pie chart, Recharts) pengeluaran per kategori.
- Klik kategori untuk membuka pop-up berisi daftar barang di kategori itu, yang bisa diurutkan.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 19, Vite |
| Routing | React Router DOM 7 |
| Grafik | Recharts |
| Dialog | SweetAlert2 |
| Backend & database | Google Apps Script + Google Sheets |
| Lint | ESLint |

## Struktur Proyek

```
src/
├── App.jsx                  # Routing dan ProtectedRoute
├── main.jsx
├── index.css
├── components/
│   ├── UrunanCard.jsx       # Input urunan dan toggle Cheat Day
│   ├── PengeluaranCard.jsx  # Form dan daftar pengeluaran
│   └── RingkasanCard.jsx    # Ringkasan, peringatan, tombol Tutup Sesi
└── pages/
    ├── Landing.jsx
    ├── Login.jsx
    ├── Dashboard.jsx
    ├── Riwayat.jsx
    └── Statistik.jsx
```

## Menjalankan Proyek

Kebutuhan: Node.js dan sebuah web app Google Apps Script yang sudah di-deploy.

```bash
npm install
```

Buat file `.env` di root proyek:

```env
VITE_API_URL=https://script.google.com/macros/s/XXXXXXXX/exec
```

Lalu jalankan:

```bash
npm run dev       # server pengembangan
npm run build     # build produksi
npm run preview   # pratinjau hasil build
npm run lint      # cek kode dengan ESLint
```

## API Backend (Google Apps Script)

Semua request dikirim ke `VITE_API_URL`.

| Method | Action | Fungsi |
| --- | --- | --- |
| GET | - | Mengambil data riwayat sesi dan detail barang |
| POST | `login` | Verifikasi PIN |
| POST | `simpan` | Menyimpan sesi yang ditutup |
| POST | `delete` | Menghapus sesi berdasarkan `idSesi` |
| POST | `tambah_peminat` | Menyimpan pendaftar dari landing page |

Kolom sheet yang dipakai: `ID Sesi`, `Tanggal`, `Mode Cheat Day`, `Total Pengeluaran`, `Sisa Hari Ini`, `Saldo Endapan Akhir`, serta detail barang (`Nama Barang`, `Kategori`, `Harga`).
