import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiTag, FiArrowRight } from "react-icons/fi";
import { getBlogs } from "../services/blog";

export default function Blogpage() {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState("Semua Berita");
  useEffect(() => { getBlogs().then(setArticles); }, []);
  const categories = ["Semua Berita", ...Array.from(new Set(articles.map((article) => article.category).filter(Boolean)))];
  const filtered = category === "Semua Berita" ? articles : articles.filter((article) => article.category === category);
  return <main className="min-h-screen bg-[#fffdf4] pt-20 sm:pt-[88px]">
    <section className="bg-white border-b border-gray-100"><div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
      <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">BLOG VIDEO BELAJAR</span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Berita Pendidikan & Teknologi Terbaru</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">Baca berita, wawasan, dan tips terbaru seputar pendidikan, teknologi, AI, dan pengembangan keterampilan digital.</p>
    </div></section>
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex w-full justify-center">
        <div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full bg-gray-100 p-1.5 scrollbar-hide">
          {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 whitespace-nowrap rounded-full border-2 px-5 py-2.5 text-sm font-medium transition ${category === item ? "border-green-500 bg-white text-gray-900" : "border-transparent text-gray-600 hover:text-green-600"}`}>{item}</button>)}
        </div>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(article => <Link key={article.id} to={`/blog/${article.id}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <img src={article.image} alt={article.title} className="h-48 w-full object-cover transition duration-300 group-hover:scale-105" />
          <div className="flex flex-1 flex-col p-5">
            <div className="flex flex-wrap gap-3 text-xs text-gray-400"><span className="inline-flex items-center gap-1"><FiCalendar/>{article.date}</span><span className="inline-flex items-center gap-1"><FiTag/>{article.category}</span></div>
            <h2 className="mt-4 line-clamp-3 text-lg font-bold leading-6">{article.title}</h2>
            <p className="mt-3 flex-1 line-clamp-3 text-sm leading-6 text-gray-500">{article.excerpt}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-green-600">Baca selengkapnya <FiArrowRight className="transition group-hover:translate-x-1"/></span>
          </div>
        </Link>)}
      </div>
      {!filtered.length && <div className="mt-10 rounded-2xl bg-white p-10 text-center text-gray-500">Belum ada berita pada kategori ini.</div>}
    </section>
  </main>;
}
