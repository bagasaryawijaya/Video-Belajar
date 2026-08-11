
import { useState } from "react";
import { useCourses } from "../context/CourseContext";
import { useAuth } from "../context/AuthContext";
import AdminCourseManager from "../components/AdminCourseManager";

const categories = [
  "Semua Kelas",
  "UI/UX Design",
  "Web Development",
  "Data Analyst",
];

export default function Coursespage() {
  const { courses } = useCourses();
  const { isAdmin } = useAuth();
  const [category, setCategory] = useState("Semua Kelas");

  const filteredCourses =
    category === "Semua Kelas"
      ? courses
      : courses.filter((course) => course.category === category);

  // Format harga menjadi Rupiah
  const formatRupiah = (price) => {
    const number = Number(price) || 0;

    return `Rp${number.toLocaleString("id-ID")}`;
  };

  const renderStars = (rating) => {
    const filled = Math.round(Number(rating) || 0);

    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={
          index < filled
            ? "text-yellow-400 text-xs"
            : "text-gray-300 text-xs"
        }
      >
        ★
      </span>
    ));
  };

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center">
          <h1 className="text-3xl lg:text-5xl font-bold text-slate-800">
            Semua Courses
          </h1>

          <p className="mt-3 text-gray-500">
            Temukan course terbaik untuk meningkatkan kemampuanmu.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto scrollbar-hide">
          <div className="flex justify-center gap-2 bg-gray-100 rounded-full p-2 w-max mx-auto">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={
                  category === item
                    ? "bg-white rounded-full px-6 py-3 shadow font-medium whitespace-nowrap"
                    : "px-6 py-3 whitespace-nowrap"
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <article
              key={course.id}
              className="bg-white border rounded-2xl shadow-sm hover:shadow-lg overflow-hidden"
            >
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-56 object-cover"
              />

              <div className="p-5">
                <span className="text-xs font-semibold text-green-600">
                  {course.category}
                </span>

                <h2 className="text-xl font-bold mt-2">
                  {course.title}
                </h2>

                <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex items-center gap-3 mt-5">
                  <img
                    src={`https://i.pravatar.cc/100?img=${course.id}`}
                    alt={course.instructor}
                    className="w-12 h-12 rounded-full"
                  />

                  <div>
                    <p className="font-semibold">
                      {course.instructor}
                    </p>

                    <p className="text-sm text-gray-500">
                      {course.role}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <div>
                    <div className="flex">
                      {renderStars(course.rating)}
                    </div>

                    <p className="text-sm text-gray-500">
                      {course.rating} ({course.reviews})
                    </p>
                  </div>

                  <p className="text-xl font-bold text-green-500">
                    {formatRupiah(course.price)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            Belum ada course pada kategori ini.
          </p>
        )}
      </div>

      {/* Hanya admin yang melihat panel CRUD */}
      {isAdmin && <AdminCourseManager />}
    </div>
  );
}

