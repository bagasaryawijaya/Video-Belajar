import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiChevronDown, FiSearch, FiSliders } from "react-icons/fi";
import { useCourses } from "../context/CourseContext";
import { courseSlug } from "../utils/slug";

const durations = ["Kurang dari 4 Jam", "4 – 8 Jam", "Lebih dari 8 Jam"];

const formatRupiah = (price) => `Rp ${Number(price || 0).toLocaleString("id-ID")}`;

function Rating({ value = 0, reviews = 0 }) {
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm">
      <span className="tracking-tight text-yellow-400">★★★★★</span>
      <span className="text-gray-500 underline">{Number(value).toFixed(1)} ({reviews})</span>
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${courseSlug(course)}`} className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <img src={course.thumbnail} alt={course.title} className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.01] sm:h-52" />
      <div className="p-4 sm:p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-tight text-gray-900 sm:text-xl">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500 sm:text-sm">{course.description}</p>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-sm font-bold text-green-700">{(course.instructor || "J").charAt(0)}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">{course.instructor || "Jenna Ortega"}</p>
            <p className="truncate text-xs text-gray-500">{course.instructorRole || "Senior Accountant"}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Rating value={course.rating} reviews={course.reviews} />
          <div className="text-right">{course.discount_active ? <><span className="mr-2 text-xs text-gray-400 line-through">{formatRupiah(course.price)}</span><strong className="whitespace-nowrap text-lg text-green-500 sm:text-xl">{formatRupiah(course.final_price)}</strong></> : <strong className="whitespace-nowrap text-lg text-green-500 sm:text-xl">{formatRupiah(course.price)}</strong>}{course.discount_active && <span className="mt-1 block text-[11px] font-semibold text-orange-500">Diskon {Number(course.discount_percent)}%</span>}</div>
        </div>
      </div>
    </Link>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <div className="mb-3 flex items-center justify-between text-green-600">
        <span className="font-semibold">{title}</span>
        <FiChevronDown />
      </div>
      {children}
    </div>
  );
}

export default function Coursepage() {
  const { courses, loading, error } = useCourses();
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(() => searchParams.get("category") || "Semua Kelas");
  const [duration, setDuration] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Terbaru");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [mobileFilter, setMobileFilter] = useState(false);

  const filteredCourses = useMemo(() => {
    let result = [...courses];
    if (category !== "Semua Kelas") result = result.filter((course) => course.category === category);
    if (duration.length) {
      result = result.filter((course) => duration.some((item) => {
        const hours = Number(course.duration_hours || 0);
        if (item === "Kurang dari 4 Jam") return hours < 4;
        if (item === "4 – 8 Jam") return hours >= 4 && hours <= 8;
        return hours > 8;
      }));
    }
    if (search.trim()) {
      const keyword = search.toLowerCase();
      result = result.filter((course) => `${course.title} ${course.description} ${course.category}`.toLowerCase().includes(keyword));
    }
    if (sort === "Harga Rendah") result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "Harga Tinggi") result.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "Rating Tertinggi") result.sort((a, b) => Number(b.rating) - Number(a.rating));
    if (sort === "Rating Terendah") result.sort((a, b) => Number(a.rating) - Number(b.rating));
    if (sort === "A to Z") result.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "Z to A") result.sort((a, b) => b.title.localeCompare(a.title));
    return result;
  }, [courses, category, duration, search, sort]);

  const toggleDuration = (value) => setDuration((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const reset = () => { setCategory("Semua Kelas"); setDuration([]); setSearch(""); setSort("Terbaru"); };

  // Filter bidang studi diambil langsung dari nilai bidang studi pada course.
  const allCategories = Array.from(new Set(courses.map((course) => String(course.category || "").trim()).filter(Boolean)));
  const visibleCategories = showAllCategories ? allCategories : allCategories.slice(0, 5);

  return (
    <main className="min-h-screen bg-black pt-24 pb-16 text-gray-900 sm:pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl font-bold text-white sm:text-4xl">Koleksi Video Pembelajaran Unggulan</h1>
          <p className="mt-2 text-sm text-gray-400 sm:text-base">Jelajahi Dunia Pengetahuan Melalui Pilihan Kami!</p>
        </header>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200 sm:text-sm">
            {error}
          </div>
        )}

        <button onClick={() => setMobileFilter((value) => !value)} className="mb-4 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 font-semibold md:hidden">
          <span className="flex items-center gap-2"><FiSliders className="text-green-500" /> Filter</span>
          <span className="text-sm text-red-500">{mobileFilter ? "Tutup" : "Buka"}</span>
        </button>

        <div className="grid gap-7 md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className={`${mobileFilter ? "block" : "hidden"} h-fit rounded-2xl bg-white p-4 md:block md:p-5`}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-xl font-bold">Filter</h2>
              <button onClick={reset} className="text-sm text-red-500 hover:underline">Reset</button>
            </div>
            <FilterSection title="Bidang Studi">
              <div className="space-y-3">
                {visibleCategories.map((item) => (
                  <label key={item} className="flex cursor-pointer items-center gap-3 text-sm text-gray-500">
                    <input type="radio" name="category" checked={category === item} onChange={() => setCategory(item)} className="accent-green-500" />
                    {item}
                  </label>
                ))}
                {allCategories.length > 5 && <button onClick={() => setShowAllCategories((v) => !v)} className="text-xs font-medium text-green-600">{showAllCategories ? "Tampilkan lebih sedikit" : "Tampilkan semua"}</button>}
              </div>
            </FilterSection>
            <FilterSection title="Durasi">
              <div className="space-y-3">
                {durations.map((item) => (
                  <label key={item} className="flex cursor-pointer items-center gap-3 text-sm text-gray-500">
                    <input type="checkbox" checked={duration.includes(item)} onChange={() => toggleDuration(item)} className="accent-green-500" />
                    {item}
                  </label>
                ))}
              </div>
            </FilterSection>
          </aside>

          <section className="min-w-0">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-white px-4 sm:max-w-xs">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari Kelas" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
                <FiSearch className="text-gray-500" />
              </label>
              <div className="relative">
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 w-full appearance-none rounded-xl bg-white px-4 pr-10 text-sm outline-none sm:w-48">
                  <option>Terbaru</option>
                  <option>A to Z</option>
                  <option>Z to A</option>
                  <option>Rating Tertinggi</option>
                  <option>Rating Terendah</option>
                </select>
                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-white p-10 text-center text-gray-500">Memuat course...</div>
            ) : filteredCourses.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {filteredCourses.map((course) => <CourseCard key={course.id} course={course} />)}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-10 text-center text-gray-500">Course tidak ditemukan. Coba ubah filter atau kata pencarian.</div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
