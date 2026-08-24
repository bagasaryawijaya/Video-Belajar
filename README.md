# Video Belajar Fullstack - Responsive Update

Project e-learning React + Tailwind + Express + MySQL.

## Perbaikan versi ini
- Dashboard Admin/Super Admin memiliki tombol **Kembali ke Home**.
- Tombol Dashboard pada Navbar admin/super admin menuju `/admin`.
- Kategori **Our Class** dibuat dinamis dari kategori course dan terhubung ke `/courses`.
- Detail course menggunakan slug, contoh `/courses/react-js-dari-dasar`.
- Breadcrumb detail course tidak lagi menampilkan Beranda; kategori dapat diklik untuk membuka course berdasarkan kategori.
- Foto profil pada halaman belajar menggunakan sumber yang sama dengan Navbar dan dapat diklik ke Profil.
- Pre-Test, Quiz, dan Ujian Akhir memiliki 10 soal berbeda berdasarkan judul/materi course dan fase ujian.
- Setiap jawaban benar bernilai 10; nilai minimal lulus 70.
- Warna nilai: 0-60 merah, 70-90 hijau, 100 biru.
- Tombol **Ulangi Pre-Test**, **Ulangi Quiz**, dan **Ulangi Ujian Akhir** muncul di bawah hasil nilai.
- Navigasi Sebelumnya/Selanjutnya di bawah halaman belajar aktif jika pengguna memiliki minimal 3 course berstatus paid.
- Kotak Admin Course Manager di halaman Home dan Courses dihapus; pengelolaan course dilakukan dari Dashboard.
- Kategori Blog dibuat dinamis sebagai filter berbentuk tombol.
- Backend menyediakan endpoint detail course berdasarkan slug.
- Tampilan memakai breakpoint responsive untuk desktop, tablet, dan mobile.

## Menjalankan project

### 1. Install dependency root
```bash
npm install
```

### 2. Install frontend
```bash
cd frontend
npm install
```

### 3. Install backend
```bash
cd ../backend
npm install
```

### 4. Jalankan dari root
```bash
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Akun demo
- Admin: `admin@videobelajar.com` / `admin123`
- Super Admin: `superadmin@videobelajar.com` / `superadmin123`

## Catatan
Jika MySQL/backend belum aktif, frontend tetap memakai fallback localStorage agar fitur demo dapat diuji. Untuk data produksi, autentikasi, progress, review, dan hasil ujian sebaiknya dipersistenkan melalui API dan database.

## Update 24 Agustus 2026

### Durasi & Diskon Course
Dashboard Admin/Super Admin sekarang dapat menentukan kelompok durasi:
- Kurang dari 4 jam
- 4–8 jam
- Lebih dari 8 jam

Dashboard juga dapat mengatur diskon per course berdasarkan persentase dan tanggal mulai/akhir. Harga promo dihitung backend dan digunakan pada katalog, detail course, dan checkout.

Kolom promo merupakan ekstensi kebutuhan aplikasi dari ERD awal:
- `discount_percent`
- `discount_start_date`
- `discount_end_date`

Database sekarang sudah disatukan menjadi satu file: `backend/database/database.sql`. File ini berisi schema, kolom durasi/diskon, dan data demo. Tidak perlu menjalankan migration atau seed terpisah.

### Dokumentasi MySQL + Postman
Lihat `docs/MYSQL_WORKBENCH.md` untuk tutorial lengkap import database ke MySQL Workbench, konfigurasi `.env`, koneksi backend Express, koneksi frontend Vite, dan pengujian API menggunakan Postman.

### Favicon tidak buram
Favicon lama menggunakan logo horizontal sehingga ketika diperkecil oleh browser terlihat kurang tajam. Versi ini menggunakan `frontend/public/favicon.svg` berbentuk ikon persegi berbasis SVG agar tetap tajam di tab browser.

## Database

Semua schema dan data demo telah digabung dalam `backend/database/database.sql`. Ikuti `docs/MYSQL_WORKBENCH.md` untuk mengaktifkan MySQL Server, import database, mengisi `.env`, dan memastikan backend dapat mengakses MySQL.
