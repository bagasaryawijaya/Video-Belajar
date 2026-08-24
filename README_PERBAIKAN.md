# Perbaikan Video Belajar

## 1. Upload gambar Admin / Super Admin
- Form Course dan Blog sudah memakai `input type="file"`.
- File gambar dikirim ke backend sebagai base64 dan disimpan di `backend/uploads/courses` atau `backend/uploads/blogs`.
- Nama file database dibuat pendek otomatis, contoh `a81f2c9e41ab.jpg`.
- Ukuran maksimal 5 MB dan format: JPG, PNG, WEBP, GIF.
- URL lama yang masih tersimpan di database tetap dapat ditampilkan.

## 2. Pembayaran
- Transfer Bank: BCA, BNI, BRI, Mandiri. Setiap bank menghasilkan Virtual Account dengan prefix bank yang berbeda.
- E-Wallet: Dana, OVO, LinkAja, Shopee Pay. Checkout menampilkan alur QR/merchant yang umum digunakan.
- Kartu Kredit/Debit: form nama, nomor kartu, masa berlaku, CVV. Data kartu lengkap/CVV tidak disimpan; hanya 4 digit terakhir yang dipakai sebagai referensi simulasi.
- Endpoint backend: `/api/payments/prepare` dan `/api/payments/complete`.
- Pembayaran pada project ini adalah simulasi backend. Untuk pembayaran uang nyata, integrasikan gateway resmi seperti Midtrans/Xendit dan jangan memproses nomor kartu sendiri.

## 3. Responsive
Dashboard, form modal, course card, blog list, dan halaman checkout memakai breakpoint Tailwind untuk mobile, tablet, dan desktop.

## Menjalankan
1. Jalankan MySQL dan import `backend/database/database.sql`.
2. Buat `backend/.env` berdasarkan `.env.example`.
3. `cd backend && npm install && npm run dev`
4. `cd frontend && npm install && npm run dev`
5. Buka `http://localhost:5173`.

Jika frontend dan backend berada pada domain berbeda saat production, isi `VITE_API_URL` pada frontend dan sesuaikan CORS/backend static `/uploads`.
