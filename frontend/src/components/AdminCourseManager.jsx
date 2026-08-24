import { useState } from "react";
import { FaEdit, FaPlus, FaTrash, FaTimes, FaImage } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useCourses } from "../context/CourseContext";

const emptyForm = {
  title: "",
  description: "",
  thumbnail: "",
  instructor: "",
  instructorRole: "",
  rating: 0,
  reviews: 0,
  price: 0,
  category: "",
  level: "Beginner",
};

export default function AdminCourseManager() {
  const { isAdmin } = useAuth();
  const { courses, addCourse, updateCourse, deleteCourse } = useCourses();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  // ==============================
  // BUKA FORM TAMBAH
  // ==============================
  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
  };

  // ==============================
  // BUKA FORM EDIT
  // ==============================
  const openEdit = (course) => {
    setForm({
      ...emptyForm,
      ...course,
    });

    setEditingId(course.id);
    setOpen(true);
  };

  // ==============================
  // TUTUP FORM
  // ==============================
  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // ==============================
  // HANDLE INPUT BIASA
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // HANDLE UPLOAD THUMBNAIL
  // MockAPI menyimpan thumbnail-course sebagai STRING.
  // File dikompres + diubah menjadi Data URL agar bisa dikirim
  // melalui JSON dan disimpan langsung pada field thumbnail-course.
  // ==============================
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File yang dipilih harus berupa gambar.");
      e.target.value = "";
      return;
    }

    // Batas file asli agar proses browser tetap ringan.
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar asli maksimal 5 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 720;

        let width = image.naturalWidth;
        let height = image.naturalHeight;

        const scale = Math.min(
          1,
          MAX_WIDTH / width,
          MAX_HEIGHT / height
        );

        width = Math.round(width * scale);
        height = Math.round(height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          alert("Browser tidak mendukung proses gambar.");
          return;
        }

        ctx.drawImage(image, 0, 0, width, height);

        // WebP jauh lebih kecil daripada PNG/JPEG sehingga lebih aman
        // untuk disimpan sebagai string di MockAPI.
        const compressedDataUrl = canvas.toDataURL("image/webp", 0.78);

        // Hindari request JSON yang terlalu besar.
        const MAX_DATA_URL_LENGTH = 2_000_000;

        if (compressedDataUrl.length > MAX_DATA_URL_LENGTH) {
          alert(
            "Gambar masih terlalu besar setelah dikompres. " +
            "Gunakan gambar dengan resolusi/ukuran lebih kecil."
          );
          e.target.value = "";
          return;
        }

        setForm((prev) => ({
          ...prev,
          thumbnail: compressedDataUrl,
        }));
      };

      image.onerror = () => {
        alert("Gambar tidak dapat diproses.");
        e.target.value = "";
      };

      image.src = reader.result;
    };

    reader.onerror = () => {
      alert("Gagal membaca file gambar.");
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  // ==============================
  // SUBMIT FORM
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Judul course wajib diisi.");
      return;
    }

    if (!form.thumbnail) {
      alert("Thumbnail course wajib diupload.");
      return;
    }

    const allowedCategories = [
      "UI/UX Design",
      "Web Development",
      "Data Analyst",
    ];

    const normalizedCategory = allowedCategories.includes(form.category)
      ? form.category
      : "";

    if (!normalizedCategory) {
      alert("Silakan pilih kategori course.");
      return;
    }

    const courseData = {
      ...form,
      category: normalizedCategory,
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
      price: Number(form.price) || 0,
    };

    try {
      if (editingId) {
        await updateCourse(editingId, courseData);
        alert("Course berhasil diperbarui.");
      } else {
        await addCourse(courseData);
        alert("Course berhasil ditambahkan.");
      }

      closeForm();
    } catch (error) {
      alert(error.message || "Terjadi kesalahan saat menyimpan course.");
    }
  };

  // ==============================
  // DELETE COURSE
  // ==============================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus course ini?"
    );

    if (!confirmed) return;

    try {
      await deleteCourse(id);
      alert("Course berhasil dihapus.");
    } catch (error) {
      alert(error.message || "Gagal menghapus course.");
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

        {/* ==============================
            HEADER
        ============================== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-green-600">
              ADMIN
            </p>

            <h2 className="text-2xl font-bold text-gray-800">
              Kelola Courses
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Tambah, edit, dan hapus data courses.
            </p>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <FaPlus />
            Tambah Course
          </button>
        </div>

        {/* ==============================
            LIST COURSE
        ============================== */}
        <div className="space-y-3">
          {courses.length === 0 ? (
            <p className="text-gray-500 py-5">
              Belum ada course.
            </p>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 md:items-center"
              >

                {/* THUMBNAIL */}
                <img
                  src={course.thumbnail || course.image}
                  alt={course.title}
                  className="w-full md:w-32 h-20 object-cover rounded-lg bg-gray-100"
                />

                {/* INFO COURSE */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {course.title}
                  </h3>

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {course.description}
                  </p>

                  <p className="text-sm text-green-600 mt-1 font-medium">
                    Rp {Number(course.price || 0).toLocaleString("id-ID")}
                  </p>
                </div>

                {/* ACTION */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(course)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(course.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <FaTrash />
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ==============================
          MODAL
      ============================== */}
      {open && (
        <div className="fixed inset-0 z-200 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {editingId ? "Edit Course" : "Tambah Course"}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {editingId
                    ? "Ubah informasi course."
                    : "Tambahkan course baru."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-800 transition"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
            >

              {/* ==============================
                  JUDUL
              ============================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Course
                </label>

                <input
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Masukkan judul course"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* ==============================
                  DESKRIPSI
              ============================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Masukkan deskripsi course"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {/* ==============================
                  UPLOAD THUMBNAIL
              ============================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail Course
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">

                  {/* PREVIEW */}
                  {form.thumbnail ? (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">
                        Preview Thumbnail
                      </p>

                      <div className="relative w-full">
                        <img
                          src={form.thumbnail}
                          alt="Preview Thumbnail"
                          className="w-full h-48 object-cover rounded-lg"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              thumbnail: "",
                            }))
                          }
                          className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition"
                          title="Hapus thumbnail"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <FaImage size={40} className="mb-3" />

                      <p className="text-sm">
                        Belum ada thumbnail
                      </p>
                    </div>
                  )}

                  {/* FILE INPUT */}
                  <label
                    htmlFor="thumbnail"
                    className="cursor-pointer block"
                  >
                    <div className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-4 py-3 transition">
                      <FaImage className="text-gray-600" />

                      <span className="text-sm font-medium text-gray-700">
                        {form.thumbnail
                          ? "Ganti Thumbnail"
                          : "Upload Thumbnail"}
                      </span>
                    </div>
                  </label>

                  <input
                    id="thumbnail"
                    name="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Format JPG, JPEG, PNG, atau WEBP. Maksimal 5 MB.
                  </p>
                </div>
              </div>

              {/* ==============================
                  KATEGORI
              ============================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="" disabled>
                    Pilih kategori
                  </option>
                  <option value="UI/UX Design">
                    UI/UX Design
                  </option>
                  <option value="Web Development">
                    Web Development
                  </option>
                  <option value="Data Analyst">
                    Data Analyst
                  </option>
                </select>
              </div>

              {/* ==============================
                  HARGA
              ============================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                    Rp
                  </span>

                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="300000"
                    className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* PREVIEW HARGA */}
                <p className="text-xs text-gray-500 mt-1">
                  Preview: Rp{" "}
                  {Number(form.price || 0).toLocaleString("id-ID")}
                </p>
              </div>

              {/* ==============================
                  BUTTON
              ============================== */}
              <div className="flex justify-end gap-3 pt-4 border-t">

                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  {editingId
                    ? "Simpan Perubahan"
                    : "Tambah Course"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}