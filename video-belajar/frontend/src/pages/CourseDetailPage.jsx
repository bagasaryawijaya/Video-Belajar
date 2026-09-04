import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiBookOpen, FiCheckCircle, FiChevronDown, FiClock, FiGlobe, FiPlayCircle, FiFileText, FiAward, FiUser } from "react-icons/fi";
import { useCourses } from "../context/CourseContext";
import { useAuth } from "../context/AuthContext";
import { getPaymentByCourse, expirePaymentIfNeeded } from "../services/payment";
import { getCourseBySlug } from "../services/api";
import { readLearning } from "../utils/learning";
import { courseSlug } from "../utils/slug";

const formatRupiah = (price) => `Rp ${Number(price || 0).toLocaleString("id-ID")}`;

const defaultLessons = [
  "The basics of user experience design",
  "Jobs in the field of user experience",
  "The product development life cycle",
];

function PurchaseCard({ course }) {
  const navigate = useNavigate();
  const { user, isLogin } = useAuth();
  const payment = isLogin ? expirePaymentIfNeeded(getPaymentByCourse(course.id, user?.email)) : null;
  const isPaid = payment?.status === "paid";
  const isPending = payment?.status === "pending";

  const handlePurchase = () => {
    if (!isLogin) {
      navigate("/login", { state: { from: `/courses/${course.id}` } });
      return;
    }
    if (isPaid) {
      navigate("/my-courses");
      return;
    }
    navigate(`/checkout/${course.id}/method`);
  };

  return (
    <aside className="h-fit rounded-xl bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold leading-tight sm:text-xl">{course.title}</h2>
      <p className="mt-1 text-sm text-gray-600">Belajar bersama tutor profesional di Video Course. Kapanpun, di manapun.</p>
      <div className="mt-5 flex items-end gap-3">
        <span className="text-xl font-bold text-green-500 sm:text-2xl">{formatRupiah(course.discount_active ? course.final_price : course.price)}</span>
        {course.discount_active ? <><span className="text-sm text-gray-400 line-through">{formatRupiah(course.price)}</span><span className="ml-auto rounded-md bg-orange-400 px-2 py-1 text-[10px] font-bold text-white">Diskon {course.discount_percent}%</span></> : null}
      </div>
      {course.discount_active && <p className="mt-3 text-xs font-semibold text-blue-500">Promo aktif sampai {course.discount_end_date || "tanggal yang ditentukan"}.</p>}
      <button
        type="button"
        onClick={handlePurchase}
        className={`mt-4 w-full rounded-lg py-3 font-bold text-white transition ${isPaid ? "bg-gray-400 hover:bg-gray-500" : "bg-green-500 hover:bg-green-600"}`}
      >
        {isPaid ? "Sudah Dibeli - Lihat Kelas" : isPending ? "Lanjutkan Pembayaran" : isLogin ? "Beli Sekarang" : "Login untuk Membeli"}
      </button>

      <h3 className="mt-6 text-sm font-bold">Kelas Ini Sudah Termasuk</h3>
      <div className="mt-3 grid grid-cols-2 gap-y-3 text-xs text-gray-600">
        <span className="flex items-center gap-2"><FiBookOpen /> Ujian Akhir</span>
        <span className="flex items-center gap-2"><FiPlayCircle /> 49 Video</span>
        <span className="flex items-center gap-2"><FiFileText /> 7 Dokumen</span>
        <span className="flex items-center gap-2"><FiAward /> Sertifikat</span>
        <span className="flex items-center gap-2"><FiCheckCircle /> Pretest</span>
      </div>

      <h3 className="mt-6 text-sm font-bold">Bahasa Pengantar</h3>
      <p className="mt-2 flex items-center gap-2 text-xs text-gray-600"><FiGlobe /> {course.language || "Bahasa Indonesia"}</p>
    </aside>
  );
}

function TutorCard({ course }) {
  return (
    <article className="rounded-xl border border-gray-200 p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700"><FiUser /></div>
        <div>
          <h3 className="text-sm font-semibold">{course.instructor || "Gregorius Edrik Lawanto"}</h3>
          <p className="text-xs text-gray-500">{course.instructorRole || "Senior Talent Acquisition"}</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-gray-600">Berkarier di bidang profesional selama lebih dari 3 tahun. Materi disusun berdasarkan pengalaman praktis agar mudah diterapkan setelah belajar.</p>
    </article>
  );
}

export default function CourseDetailPage() {
  const { slug } = useParams();
  const { courses, getCourseById } = useCourses();
  const [course, setCourse] = useState(() => courses.find((item) => courseSlug(item) === slug || String(item.id) === String(slug)) || null);
  const [openLesson, setOpenLesson] = useState(true);
  const { user } = useAuth();
  const learning = readLearning(user?.email, course?.id);

  useEffect(() => {
    let active = true;
    const local = courses.find((item) => courseSlug(item) === slug || String(item.id) === String(slug));
    if (local) { setCourse(local); return () => { active = false; }; }
    if (/^\d+$/.test(String(slug))) getCourseById(slug).then((data) => { if (active && data) setCourse(data); });
    else getCourseBySlug(slug).then((data) => { if (active && data) setCourse(data); }).catch(() => {});
    return () => { active = false; };
  }, [slug, courses, getCourseById]);

  const lessons = useMemo(() => course?.lessons?.length ? course.lessons : defaultLessons, [course]);

  if (!course) {
    return <main className="min-h-screen bg-black px-4 pt-28 pb-16 text-white"><div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 text-center text-gray-700"><h1 className="text-2xl font-bold">Course tidak ditemukan</h1><Link to="/courses" className="mt-5 inline-block rounded-lg bg-green-500 px-6 py-3 font-semibold text-white">Kembali ke Courses</Link></div></main>;
  }

  return (
    <main className="min-h-screen bg-black pt-20 pb-14 text-gray-900 sm:pt-24">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
        <div className="mb-5 text-xs text-gray-400 sm:text-sm"><Link to="/courses" className="hover:text-green-400">Courses</Link> / <Link to={`/courses?category=${encodeURIComponent(course.category || "")}`} className="hover:text-green-400">{course.category}</Link> / <span>{course.title}</span></div>

        <section className="relative overflow-hidden rounded-xl min-h-[240px] sm:min-h-[300px] lg:min-h-[350px]">
          <img src={course.thumbnail} alt={course.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative flex min-h-[240px] flex-col justify-center p-6 text-white sm:min-h-[300px] sm:p-10 lg:min-h-[350px] lg:p-16">
            <h1 className="max-w-3xl text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-xs leading-5 text-gray-200 sm:text-sm">Belajar bersama tutor profesional di Video Course. Kapanpun, di manapun.</p>
            <div className="mt-5 flex items-center gap-3 text-xs sm:text-sm">
              <span className="tracking-tight text-yellow-400">★★★★★</span>
              <span>{Number(course.rating || 0).toFixed(1)} ({course.reviews || 0})</span>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <section className="rounded-xl bg-white p-4 sm:p-6">
              <h2 className="text-lg font-bold sm:text-xl">Deskripsi</h2>
              <p className="mt-4 text-xs leading-6 text-gray-600 sm:text-sm">{course.description} Materi disusun secara bertahap agar peserta memahami konsep, melakukan praktik, dan memiliki bekal yang dapat digunakan dalam pekerjaan atau proyek nyata.</p>
            </section>

            <section className="rounded-xl bg-white p-4 sm:p-6">
              <h2 className="text-lg font-bold sm:text-xl">Belajar bersama Tutor Profesional</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2"><TutorCard course={course} /><TutorCard course={course} /></div>
            </section>

            <section className="rounded-xl bg-white p-4 sm:p-6">
              <h2 className="text-lg font-bold sm:text-xl">Kamu akan Mempelajari</h2>
              <div className="mt-4">
                <button onClick={() => setOpenLesson((value) => !value)} className="flex w-full items-center justify-between text-left font-semibold text-green-500">
                  <span>Introduction to Course: Fondasi Pembelajaran</span><FiChevronDown className={`transition ${openLesson ? "rotate-180" : ""}`} />
                </button>
                {openLesson && (
                  <div className="mt-3 space-y-2">
                    {lessons.map((lesson, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-3 text-xs sm:text-sm">
                        <span>{lesson}</span>
                        <span className="hidden items-center gap-2 text-gray-400 sm:flex"><FiPlayCircle /> Video <FiClock /> 12 Menit</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {["Universal design, inclusive design, and equity-focused design", "Introduction to design sprints", "Introduction to UX research"].map((item) => (
                <button key={item} className="mt-4 flex w-full items-center justify-between text-left text-sm font-semibold text-green-500"><span>{item}</span><FiChevronDown /></button>
              ))}
            </section>

            <section className="rounded-xl bg-white p-4 sm:p-6">
              <h2 className="text-lg font-bold sm:text-xl">Rating dan Review</h2>
              {learning.review && (
                <article className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-bold">Review Anda</p>
                  <div className="mt-2 flex items-center gap-2"><span className="text-yellow-400">{"★".repeat(learning.review.rating)}{"★".repeat(5-learning.review.rating)}</span><span className="text-sm text-gray-500">{learning.review.rating}/5</span></div>
                  <p className="mt-2 text-sm text-gray-600">{learning.review.comment || "Tidak ada komentar."}</p>
                </article>
              )}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["Alumni Batch 2", "Alumni Batch 4"].map((label) => (
                  <article key={label} className="rounded-xl border border-gray-200 p-3">
                    <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700"><FiUser /></div><div><p className="text-sm font-semibold">{course.instructor || "Gregorius Edrik Lawanto"}</p><p className="text-xs text-gray-500">{label}</p></div></div>
                    <p className="mt-3 text-xs leading-5 text-gray-600">Materi mudah dipahami dan relevan. Penjelasan tutor membantu saya menerapkan pengetahuan dalam pekerjaan.</p>
                    <div className="mt-3 text-xs"><span className="text-yellow-400">★★★★</span><span className="text-gray-300">★</span> <span className="ml-2 text-gray-500">{Number(course.rating || 0).toFixed(1)}</span></div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <PurchaseCard course={course} />
        </div>
      </div>
    </main>
  );
}
