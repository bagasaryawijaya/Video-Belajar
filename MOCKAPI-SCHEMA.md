# Schema MockAPI — Courses

Gunakan resource:

`https://6a7eaf4b3183f5fd884a50ee.mockapi.io/Courses`

## Field schema

| Field | Type MockAPI | Contoh | Keterangan |
|---|---|---|---|
| `title` | String | `Belajar UI/UX Design` | Judul course |
| `deskripsi` | String | `Mempelajari dasar UI/UX` | Deskripsi |
| `thumbnail-course` | String | `data:image/webp;base64,...` atau URL gambar | Thumbnail |
| `instruktur` | String | `Bagas Arya` | Nama instruktur |
| `jabatan-instruktur` | String | `UI/UX Designer` | Jabatan instruktur |
| `kategori` | String | `UI/UX Design` | Salah satu dari 3 kategori |
| `level` | String | `Beginner` | Level course |
| `rating` | Number | `4.8` | Rating |
| `jumlah-review` | Number | `120` | Jumlah review |
| `harga` | Number | `300000` | Harga dalam rupiah |

### Nilai kategori yang harus dipakai

- `UI/UX Design`
- `Web Development`
- `Data Analyst`

Jangan memakai variasi seperti `UIUX`, `UI UX Design`, atau `Web development`, karena filter Home/OurClass dan Coursespage mencocokkan nilai kategori secara persis.

## Thumbnail dari komputer

MockAPI tidak menerima file binary langsung melalui field resource biasa. Field `thumbnail-course` pada project ini bertipe **String**.

Saat admin memilih file:

1. Browser membaca file.
2. Gambar diperkecil maksimal 1280×720.
3. Gambar dikompres ke WebP.
4. Hasilnya menjadi Data URL (`data:image/webp;base64,...`).
5. Data URL dikirim dalam JSON ke MockAPI pada field `thumbnail-course`.
6. Saat GET, aplikasi memakai nilai tersebut sebagai `src` gambar.

Karena Data URL membuat payload JSON besar, aplikasi membatasi hasil setelah kompresi. Jika masih terlalu besar, gunakan gambar dengan resolusi/ukuran lebih kecil.

> Untuk aplikasi produksi dengan banyak gambar, lebih baik menyimpan file pada image storage/CDN (misalnya Cloudinary, Supabase Storage, atau S3) lalu menyimpan URL-nya sebagai String di `thumbnail-course`. MockAPI cocok untuk kebutuhan mock/demo, bukan penyimpanan file gambar skala besar.
