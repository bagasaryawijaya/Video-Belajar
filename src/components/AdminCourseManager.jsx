import { useState } from "react";
import { FaEdit, FaPlus, FaTrash, FaTimes } from "react-icons/fa";
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

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (course) => {
    setForm({
      ...emptyForm,
      ...course,
    });
    setEditingId(course.id);
    setOpen(true);
  };

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Judul course wajib diisi.");
      return;
    }

    if (editingId) {
      updateCourse(editingId, form);
    } else {
      addCourse(form);
    }

    closeForm();
  };

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
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700"
          >
            <FaPlus />
            Tambah Course
          </button>
        </div>

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
                <img
                  src={course.thumbnail || course.image}
                  alt={course.title}
                  className="w-full md:w-32 h-20 object-cover rounded-lg bg-gray-100"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {course.title}
                  </h3>

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {course.description}
                  </p>

                  <p className="text-sm text-green-600 mt-1">
                    Rp {Number(course.price || 0).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(course)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(course.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
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

      {open && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">
                {editingId ? "Edit Course" : "Tambah Course"}
              </h3>

              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-800"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                ["title", "Judul Course", "text"],
                ["description", "Deskripsi", "text"],
                ["thumbnail", "URL Thumbnail", "url"],
                ["instructor", "Instruktur", "text"],
                ["instructorRole", "Jabatan Instruktur", "text"],
                ["category", "Kategori", "text"],
                ["level", "Level", "text"],
                ["rating", "Rating", "number"],
                ["reviews", "Jumlah Review", "number"],
                ["price", "Harga", "number"],
              ].map(([name, label, type]) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>

                  {name === "description" ? (
                    <textarea
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : name === "price" ? (
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                        Rp
                      </span>
                      <input
                        name={name}
                        type="number"
                        min="0"
                        value={form[name]}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  ) : (
                    <input
                      name={name}
                      type={type}
                      value={form[name]}
                      onChange={handleChange}
                      step={name === "rating" ? "0.1" : undefined}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 border rounded-lg"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingId ? "Simpan Perubahan" : "Tambah Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}