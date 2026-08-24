import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiTag } from "react-icons/fi";
import { getBlogs } from "../services/blog";

export default function BlogDetailPage() {
  const { id } = useParams(); const [article, setArticle] = useState(null);
  useEffect(() => { getBlogs().then(items => setArticle(items.find(item => String(item.id) === String(id)))); }, [id]);
  if (!article) return <main className="min-h-screen bg-[#fffdf4] px-4 pt-28 pb-20 text-center"><h1 className="text-2xl font-bold">Berita tidak ditemukan</h1><Link to="/blog" className="mt-5 inline-flex rounded-lg bg-green-500 px-5 py-3 text-white">Kembali ke Blog</Link></main>;
  return <main className="min-h-screen bg-[#fffdf4] pt-20 sm:pt-[88px]"><article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-14">
    <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-green-600"><FiArrowLeft/> Kembali ke Blog</Link>
    <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-500"><span className="rounded-full bg-green-50 px-3 py-1 font-semibold text-green-600">{article.category}</span><span className="inline-flex items-center gap-1"><FiCalendar/>{article.date}</span><span className="inline-flex items-center gap-1"><FiTag/>{article.source}</span></div>
    <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">{article.title}</h1>
    <p className="mt-5 text-base leading-7 text-gray-500 sm:text-lg">{article.excerpt}</p>
    <img src={article.image} alt={article.title} className="mt-8 h-64 w-full rounded-2xl object-cover sm:h-[420px]" />
    <div className="mt-8 space-y-6 text-base leading-8 text-gray-700 sm:text-lg">{article.content?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
  </article></main>;
}
