PERBAIKAN LOGIN & SIGNUP - VERCEL

Perbaikan yang dilakukan:
1. Root package.json sekarang memakai "type": "module" agar api/index.js dapat dijalankan oleh Node/Vercel.
2. API Vercel memakai satu serverless function /api/index.js untuk semua endpoint /api/*.
3. VITE_API_URL dinormalisasi agar /api, /api/courses, atau URL backend tidak menghasilkan endpoint ganda.
4. Respons login divalidasi sebelum token disimpan.
5. Konfigurasi Firebase Admin dibuat lebih toleran terhadap newline pada private key.
6. Endpoint health database diperbaiki untuk PostgreSQL.

TEST SETELAH DEPLOY:
- Buka: https://DOMAIN-ANDA/api/health
- Untuk autentikasi, coba POST endpoint:
  /api/auth/signup
  /api/auth/login

CATATAN PENTING:
Signup memakai Firebase Firestore. Jika Firebase Admin salah, semua endpoint auth dapat gagal saat function dimuat.
Pastikan FIREBASE_SERVICE_ACCOUNT_BASE64 berisi BASE64 dari seluruh file service account JSON, tanpa tambahan teks.
Atau gunakan FIREBASE_SERVICE_ACCOUNT_JSON berisi JSON service account lengkap.

Environment minimal untuk auth:
FIREBASE_SERVICE_ACCOUNT_BASE64 atau FIREBASE_SERVICE_ACCOUNT_JSON
FIREBASE_STORAGE_BUCKET
JWT_SECRET
JWT_EXPIRES_IN
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASSWORD
MAIL_FROM

Jika login menampilkan "Email belum diverifikasi", itu berarti akun sudah benar tetapi wajib memasukkan kode verifikasi dari halaman verify-email-code.
