PERBAIKAN ERROR VERCEL: Function Runtimes must have a valid version

Penyebab:
Konfigurasi sebelumnya menggunakan field functions.runtime dengan nilai nodejs22.x. Pada konfigurasi Vercel saat ini, nilai tersebut dapat ditolak sebagai Function Runtime.

Perbaikan:
1. Field functions di vercel.json dihapus.
2. Vercel akan mendeteksi api/index.js secara otomatis sebagai Serverless Function.
3. Versi Node dikontrol melalui package.json: engines.node = 22.x.
4. Routing /api/* tetap diarahkan ke /api/index.js.

CARA DEPLOY:
- Upload/push isi project ini ke repository atau deploy ulang ke Vercel.
- Root Directory: video-belajar (jika folder induk ZIP ikut terupload).
- Build Command: npm run build
- Output Directory: frontend/dist
- Jangan menambahkan Override Runtime pada Vercel kecuali diperlukan. Gunakan Node.js 22.x atau Automatic.

Setelah deploy, uji:
https://DOMAIN-ANDA.vercel.app/api/health
