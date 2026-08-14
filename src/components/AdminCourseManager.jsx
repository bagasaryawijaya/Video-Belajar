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
  // ==============================
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      alert("File yang dipilih harus berupa gambar.");
      return;
    }

    // Validasi ukuran maksimal 5 MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        thumbnail: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  // ==============================
  // SUBMIT FORM
  // ==============================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Judul course wajib diisi.");
      return;
    }

    if (!form.thumbnail) {
      alert("Thumbnail course wajib diupload.");
      return;
    }

    const courseData = {
      ...form,
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
      price: Number(form.price) || 0,
    };

    if (editingId) {
      updateCourse(editingId, courseData);
    } else {
      addCourse(courseData);
    }

    closeForm();
  };

  // ==============================
  // DELETE COURSE
  // ==============================
  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus course ini?"
    );

    if (confirmed) {
      deleteCourse(id);
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
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">

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
                  INSTRUKTUR
              ============================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instruktur
                </label>

                <input
                  name="instructor"
                  type="text"
                  value={form.instructor}
                  onChange={handleChange}
                  placeholder="Nama instruktur"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* ==============================
                  JABATAN INSTRUKTUR
              ============================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jabatan Instruktur
                </label>

                <input
                  name="instructorRole"
                  type="text"
                  value={form.instructorRole}
                  onChange={handleChange}
                  placeholder="Contoh: UI/UX Designer"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* ==============================
                  KATEGORI
              ============================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>

                <input
                  name="category"
                  type="text"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Contoh: UI/UX Design"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* ==============================
                  LEVEL
              ============================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>

                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="Beginner">
                    Beginner
                  </option>

                  <option value="Intermediate">
                    Intermediate
                  </option>

                  <option value="Advanced">
                    Advanced
                  </option>
                </select>
              </div>

              {/* ==============================
                  RATING
              ============================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>

                <input
                  name="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* ==============================
                  JUMLAH REVIEW
              ============================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Review
                </label>

                <input
                  name="reviews"
                  type="number"
                  min="0"
                  value={form.reviews}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
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