# Tutorial Koneksi Frontend + Backend + MySQL Workbench

Project ini sekarang memakai **satu file database**:

`backend/database/database.sql`

File tersebut berisi:
- pembuatan database `video_belajar`
- seluruh tabel utama
- kolom durasi course
- kolom diskon dan periode diskon
- data demo kategori, user, course, video, review, dan blog

## 1. Pastikan MySQL Server aktif

Jika menggunakan MySQL Installer di Windows:

1. Buka **Services** Windows.
2. Cari service **MySQL80** (nama bisa berbeda sesuai instalasi).
3. Pastikan statusnya **Running**.

Jika menggunakan XAMPP, aktifkan **MySQL** dari XAMPP Control Panel.

> MySQL Workbench adalah aplikasi untuk mengelola database. Yang harus benar-benar aktif adalah **MySQL Server**.

## 2. Buka MySQL Workbench

1. Jalankan MySQL Workbench.
2. Klik koneksi MySQL yang digunakan, misalnya `Local instance MySQL80`.
3. Masukkan password MySQL saat diminta.

Biasanya konfigurasi lokal adalah:

```text
Host     : localhost
Port     : 3306
User     : root
Password : password MySQL Anda
```

## 3. Import database

Tidak perlu import `schema.sql`, `seed.sql`, atau migration terpisah. Semuanya sudah digabung menjadi:

`backend/database/database.sql`

Langkahnya:

1. Di MySQL Workbench pilih **File > Open SQL Script**.
2. Pilih file:
   `backend/database/database.sql`
3. Pastikan tab SQL sudah terbuka.
4. Klik tombol **petir / Execute**.
5. Tunggu sampai seluruh query selesai.
6. Pada panel **SCHEMAS**, klik tombol refresh.
7. Cari database **video_belajar**.
8. Buka `video_belajar > Tables`.

Anda seharusnya melihat tabel seperti:

- `categories`
- `users`
- `courses`
- `videos`
- `questions`
- `question_options`
- `question_answers`
- `enrollments`
- `reviews`
- `orders`
- `order_items`
- `payment_methods`
- `payments`
- `certificates`
- `video_progress`
- `blog_posts`

## 4. Cek database berhasil dibuat

Jalankan di SQL Editor:

```sql
USE video_belajar;
SHOW TABLES;
SELECT COUNT(*) AS jumlah_course FROM courses;
SELECT COUNT(*) AS jumlah_blog FROM blog_posts;
```

Jika berhasil, jumlah course dan blog akan lebih dari 0.

Untuk mengecek durasi dan diskon:

```sql
SELECT
  course_title,
  duration_hours,
  price,
  discount_percent,
  discount_start_date,
  discount_end_date
FROM courses;
```

## 5. Hubungkan Backend Express ke MySQL

Masuk ke folder:

`backend`

Salin:

`.env.example`

menjadi:

`.env`

Contoh isi `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_mysql_anda
DB_NAME=video_belajar
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

**Penting:** ganti `DB_PASSWORD` dengan password MySQL yang sebenarnya.

Contoh jika password MySQL adalah `123456`:

```env
DB_PASSWORD=123456
```

Jika MySQL root tidak menggunakan password, gunakan:

```env
DB_PASSWORD=
```

## 6. Install dependency backend

Dari folder project:

```bash
cd backend
npm install
```

Kemudian jalankan:

```bash
npm run dev
```

Jika berhasil akan muncul:

```text
Backend berjalan di http://localhost:5000
```

## 7. Tes apakah Backend sudah terhubung ke MySQL

Buka browser atau Postman dan akses:

```text
GET http://localhost:5000/api/health
```

Jika koneksi berhasil, response-nya:

```json
{
  "success": true,
  "message": "API dan MySQL terhubung"
}
```

Jika muncul error `ECONNREFUSED`, berarti MySQL Server belum aktif atau host/port salah.

Jika muncul `Access denied for user 'root'`, berarti username/password MySQL pada `.env` salah.

Jika muncul `Unknown database 'video_belajar'`, import `backend/database/database.sql` terlebih dahulu.

## 8. Tes API Course menggunakan Postman

### Ambil semua course

```text
GET http://localhost:5000/api/courses
```

### Ambil course berdasarkan slug

Contoh:

```text
GET http://localhost:5000/api/courses/slug/react-js-dari-dasar
```

### Filter durasi

Gunakan parameter yang tersedia pada endpoint course project ini, misalnya:

```text
GET http://localhost:5000/api/courses?duration=4-8
```

### Filter kategori

```text
GET http://localhost:5000/api/courses?category=digital-teknologi
```

## 9. Hubungkan Frontend

Frontend menggunakan API backend melalui konfigurasi API yang ada di:

`frontend/src/services/api.js`

Pastikan backend berjalan di:

```text
http://localhost:5000
```

Kemudian jalankan frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend biasanya tersedia di:

```text
http://localhost:5173
```

## 10. Urutan menjalankan project setiap kali mulai coding

Buka MySQL Server terlebih dahulu.

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Kemudian buka:

```text
http://localhost:5173
```

## 11. Alur koneksi keseluruhan

```text
React Frontend
      |
      | HTTP Request
      v
Express Backend :5000
      |
      | mysql2
      v
MySQL Server :3306
      |
      v
video_belajar
      |
      +-- courses
      +-- categories
      +-- users
      +-- enrollments
      +-- videos
      +-- questions
      +-- reviews
      +-- orders
      +-- payments
      +-- certificates
      +-- blog_posts
```

## 12. Jika ingin membuat database dari awal lagi

**Hati-hati:** langkah ini menghapus database lama beserta datanya.

Jika memang ingin reset total, jalankan:

```sql
DROP DATABASE IF EXISTS video_belajar;
```

Setelah itu buka kembali `backend/database/database.sql` dan Execute seluruh file.

Untuk project pengembangan, cara ini berguna ketika struktur database sudah berubah dan ingin mulai dari database kosong.