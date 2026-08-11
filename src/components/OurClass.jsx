import { useState } from "react";
import { Link } from "react-router-dom";
import { useCourses } from "../context/CourseContext";
import { useAuth } from "../context/AuthContext";
import AdminCourseManager from "./AdminCourseManager";

const OurClass = () => {
  const { courses } = useCourses();
  const { isAdmin } = useAuth();
  const [category, setCategory] = useState("Semua Kelas");

  const categories = [
    "Semua Kelas",
    "UI/UX Design",
    "Web Development",
    "Data Analyst",
  ];

  const filteredCourses =
    category === "Semua Kelas"
      ? courses
      : courses.filter((course) => course.category === category);

  const formatPrice = (price) => {
    return `Rp${Number(price || 0).toLocaleString("id-ID")}`;
  };

  const renderStars = (rating) => {
    const filled = Math.round(Number(rating) || 0);

    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={
          i < filled
            ? "text-yellow-400 text-xs"
            : "text-gray-300 text-xs"
        }
      >
        ★
      </span>
    ));
  };

  return (
    <>
      <section className="py-20 bg-white" id="courses">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-800">
              Koleksi Video Pembelajaran Unggulan
            </h2>
            <p className="mt-3 text-gray-500 text-sm lg:text-lg">
              Jelajahi Dunia Pengetahuan Melalui Pilihan Kami!
            </p>
          </div>

          <div className="mt-10 overflow-x-auto scrollbar-hide">
            <div className="flex lg:justify-center gap-2 w-max lg:w-auto bg-gray-100 rounded-full p-2">
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

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white border rounded-2xl shadow-sm hover:shadow-lg overflow-hidden"
              >
                <div className="flex lg:hidden p-3 gap-3">
                  <img
                    src={course.image || course.thumbnail}
                    alt={course.title}
                    className="w-32 h-28 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={`https://i.pravatar.cc/100?img=${course.id}`}
                        alt={course.instructor}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-xs font-semibold">
                          {course.instructor}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {course.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <div className="flex">
                          {renderStars(course.rating)}
                        </div>
                        <p className="text-[10px] text-gray-500">
                          {course.rating} ({course.reviews})
                        </p>
                      </div>
                      <p className="font-bold text-green-500">
                        {formatPrice(course.price)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <img
                    src={course.image || course.thumbnail}
                    alt={course.title}
                    className="w-full h-56 object-cover"
                  />

                  <div className="p-5">
                    <h3 className="text-xl font-bold">{course.title}</h3>

                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
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

                      <p className="text-2xl font-bold text-green-500">
                        {formatPrice(course.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <p className="text-center text-gray-500 mt-10">
              Belum ada course pada kategori ini.
            </p>
          )}

          <div className="flex justify-center mt-16">
            <Link
              to="/courses"
              className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-xl font-semibold"
            >
              Lihat Semua Program
            </Link>
          </div>

          {/* Kelola Courses hanya ditampilkan di dalam section OurClass untuk admin. */}
          {isAdmin && (
            <div className="mt-12">
              <AdminCourseManager />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default OurClass;
