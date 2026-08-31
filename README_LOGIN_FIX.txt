PERBAIKAN LOGIN & SIGNUP
=========================

Penyebab utama login/signup gagal di deployment Vercel:
1. vercel.json sebelumnya mengarahkan /api/* ke endpoint yang tidak ada (/api/backend-code).
2. Backend Express belum menjadi Vercel Serverless Function di deployment utama.
3. Variabel backend/.env tidak otomatis tersedia sebagai Environment Variables di Vercel.

Yang sudah diperbaiki:
- Ditambahkan api/index.js sebagai entry point Vercel Serverless Function.
- Rewrite /api/* diarahkan ke /api/index.js.
- Dependency backend ditambahkan ke package.json root agar API dapat dibundle oleh Vercel.
- Urutan pemuatan environment diperbaiki.
- CORS dibuat kompatibel dengan deployment dan preview Vercel.
- Akun tidak lagi langsung dihapus jika pengiriman email verifikasi SMTP gagal.

WAJIB DIISI DI VERCEL > Project > Settings > Environment Variables:
- FIREBASE_SERVICE_ACCOUNT_BASE64 (atau FIREBASE_SERVICE_ACCOUNT_JSON)
- FIREBASE_STORAGE_BUCKET
- JWT_SECRET
- JWT_EXPIRES_IN
- FRONTEND_URL
- CORS_ORIGIN
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASSWORD
- MAIL_FROM
- DATABASE_URL jika endpoint lain menggunakan database

PENTING:
Jangan mengandalkan backend/.env untuk production. Salin nilainya ke Environment Variables Vercel,
kemudian Redeploy.
