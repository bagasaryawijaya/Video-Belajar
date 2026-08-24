import { Link } from "react-router-dom";
import { useCourses } from "../context/CourseContext";
import { courseSlug } from "../utils/slug";

const OurClass = () => {
  const { courses } = useCourses();
  const categories = Array.from(new Set(courses.map((course) => course.category).filter(Boolean)));
  const formatPrice = (price) => `Rp ${Number(price || 0).toLocaleString("id-ID")}`;

  return (
    <section className="bg-white py-16 sm:py-20" id="courses">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl lg:text-5xl">Our Class</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500 sm:text-base lg:text-lg">Temukan kelas berdasarkan kategori yang tersedia di halaman Courses.</p>
        </div>

        <div className="mt-12 space-y-12">
          {categories.map((category) => {
            const items = courses.filter((course) => course.category === category);
            return (
              <div key={category}>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-slate-800 sm:text-2xl">{category}</h3>
                  <Link to={`/courses?category=${encodeURIComponent(category)}`} className="text-sm font-semibold text-green-600 hover:underline">Lihat semua</Link>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((course) => (
                    <Link key={course.id} to={`/courses/${courseSlug(course)}`} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      <img src={course.thumbnail} alt={course.title} className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-52" />
                      <div className="p-4 sm:p-5">
                        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">{category}</span>
                        <h4 className="mt-3 line-clamp-2 text-base font-bold text-slate-800 sm:text-lg">{course.title}</h4>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{course.description}</p>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="text-sm text-gray-500">{course.duration_hours || 0} jam</span>
                          <strong className="text-lg text-green-500">{formatPrice(course.discount_active ? course.final_price : course.price)}</strong>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {!categories.length && <p className="mt-10 text-center text-gray-500">Belum ada course.</p>}
        <div className="mt-12 flex justify-center sm:mt-16">
          <Link to="/courses" className="rounded-xl bg-green-500 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-green-600 sm:px-10 sm:py-4 sm:text-base">Lihat Semua Courses</Link>
        </div>
      </div>
    </section>
  );
};

export default OurClass;
