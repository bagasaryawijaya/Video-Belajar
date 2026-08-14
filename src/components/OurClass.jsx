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

  return (
    <div>
      <section className="py-16 sm:py-20 bg-white" id="courses">
        <div className="max-w-7xl mx-auto px-5">

          {/* =========================
              SECTION TITLE
          ========================== */}
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
              Koleksi Video Pembelajaran Unggulan
            </h2>

            <p className="mt-3 text-gray-500 text-sm sm:text-base lg:text-lg">
              Jelajahi Dunia Pengetahuan Melalui Pilihan Kami!
            </p>
          </div>

          {/* =========================
              CATEGORY FILTER
          ========================== */}
          <div className="mt-10 flex justify-center w-full">
            <div
              className="
                flex
                items-center
                gap-1.5
                bg-gray-100
                rounded-full
                p-1.5
                max-w-full
                overflow-x-auto
                scrollbar-hide
              "
            >
              {categories.map((item) => {
                const isActive = category === item;

                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setCategory(item)}
                    className={`
                      shrink-0
                      whitespace-nowrap
                      rounded-full
                      font-medium
                      text-sm
                      px-5
                      py-2.5
                      border-2
                      transition-all
                      duration-200
                      ease-in-out
                      focus:outline-none

                      ${
                        isActive
                          ? "bg-white border-green-500"
                          : "bg-transparent border-transparent"
                      }
                    `}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =========================
              COURSE GRID
          ========================== */}
          <div
            className="
              mt-12
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-6
            "
          >
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  shadow-sm
                  hover:shadow-lg
                  transition-shadow
                  duration-300
                  overflow-hidden
                "
              >
                {/* =========================
                    COURSE IMAGE
                ========================== */}
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="
                    w-full
                    h-48
                    sm:h-52
                    lg:h-56
                    object-cover
                  "
                />

                {/* =========================
                    COURSE CONTENT
                ========================== */}
                <div className="p-4 sm:p-5">

                  {/* Title */}
                  <h3
                    className="
                      text-base
                      sm:text-lg
                      lg:text-xl
                      font-bold
                      text-slate-800
                      line-clamp-2
                    "
                  >
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="
                      mt-2
                      text-xs
                      sm:text-sm
                      text-gray-500
                      line-clamp-2
                    "
                  >
                    {course.description}
                  </p>

                  {/* =========================
                      PRICE
                  ========================== */}
                  <div
                    className="
                      flex
                      justify-between
                      items-end
                      mt-5
                      gap-3
                    "
                  >

                    {/* Price */}
                    <p
                      className="
                        text-lg
                        sm:text-xl
                        lg:text-2xl
                        font-bold
                        text-green-500
                        whitespace-nowrap
                      "
                    >
                      {formatPrice(course.price)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* =========================
              EMPTY STATE
          ========================== */}
          {filteredCourses.length === 0 && (
            <p className="text-center text-gray-500 mt-10">
              Belum ada course pada kategori ini.
            </p>
          )}

          {/* =========================
              VIEW ALL BUTTON
          ========================== */}
          <div className="flex justify-center mt-12 sm:mt-16">
            <Link
              to="/courses"
              className="
                inline-flex
                items-center
                justify-center
                bg-green-500
                hover:bg-green-600
                
                text-white
                px-8
                sm:px-10
                py-3.5
                sm:py-4
                rounded-xl
                font-semibold
                text-sm
                sm:text-base
                transition-colors
                duration-200
              "
            >
              Lihat Semua Courses
            </Link>
          </div>

          {/* =========================
              ADMIN COURSE MANAGER
          ========================== */}
          {isAdmin && (
            <div className="mt-12">
              <AdminCourseManager />
            </div>
          )}

        </div>
      </section>
    </div>
  );
};

export default OurClass;