import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiChevronDown, FiDownload, FiFileText, FiPlayCircle, FiStar, FiX } from "react-icons/fi";
import { useCourses } from "../context/CourseContext";
import { useAuth } from "../context/AuthContext";
import { readPayments } from "../services/payment";
import { canDownloadCertificate, downloadCertificate, progressFromLearning, quizQuestions, readLearning, saveLearning, scoreMessage } from "../utils/learning";
import defaultAvatar from "../assets/Avatar1.png";

const videoUrl = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

function ScoreBox({ score, correct, wrong, kind, onRetry }) {
  const value = Number(score);
  const scoreColor = value === 100 ? "bg-blue-500" : value >= 70 ? "bg-green-500" : "bg-red-500";
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-4">
        <div className={`p-4 text-white ${scoreColor}`}><p className="text-xs font-semibold">Nilai</p><p className="mt-2 text-2xl font-bold">{score}</p></div>
        <div className="p-4"><p className="text-xs font-semibold text-gray-500">Soal</p><p className="mt-2 text-2xl font-bold">10</p></div>
        <div className="p-4"><p className="text-xs font-semibold text-gray-500">Benar</p><p className="mt-2 text-2xl font-bold text-green-600">{correct}</p></div>
        <div className="p-4"><p className="text-xs font-semibold text-gray-500">Salah</p><p className="mt-2 text-2xl font-bold text-red-500">{wrong}</p></div>
      </div>
      <div className="border-t border-gray-200 p-4 text-sm text-gray-600">
        <p className="font-bold">{scoreMessage(score)}</p>
        <p className="mt-5">{kind} selesai.</p>
        <button onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-green-500 px-5 py-2.5 font-bold text-green-600 transition hover:bg-green-50"><FiArrowRight className="rotate-180"/> Ulangi {kind}</button>
      </div>
    </div>
  );
}

function QuizView({ course, learning, onResult, final = false, pretest = false }) {
  const phase = pretest ? "pretest" : final ? "final" : "quiz";
  const kind = pretest ? "Pre-Test" : final ? "Ujian Akhir" : "Quiz";
  const questions = useMemo(() => quizQuestions(course.title, phase), [course.title, phase]);
  const [answers, setAnswers] = useState(() => learning.answers?.[phase] || {});
  const [result, setResult] = useState(null);

  const retry = () => {
    setAnswers({});
    setResult(null);
    onResult(null, phase, {});
  };

  const submit = () => {
    const correct = questions.reduce((total, q) => total + (Number(answers[q.id]) === q.answer ? 1 : 0), 0);
    const score = correct * 10;
    const payload = { score, correct, wrong: 10 - correct };
    setResult(payload);
    onResult(payload, phase, answers);
  };

  return <div className="space-y-5">
    <div><h2 className="text-2xl font-bold sm:text-3xl">{kind}: {course.title}</h2><p className="mt-2 text-sm leading-6 text-gray-500">Kerjakan 10 soal. Setiap jawaban benar bernilai 10 poin. Minimal nilai kelulusan adalah 70.</p></div>
    {questions.map((q, qi) => <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5"><h3 className="font-bold">Pertanyaan {qi + 1}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{q.question}</p><div className="mt-4 space-y-2">{q.options.map((option, oi) => <label key={option} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${Number(answers[q.id]) === oi ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"}`}><input type="radio" name={`q-${phase}-${q.id}`} checked={Number(answers[q.id]) === oi} onChange={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))} className="mt-1 accent-green-500"/><span>{option}</span></label>)}</div></div>)}
    <button onClick={submit} disabled={Object.keys(answers).length < 10} className="w-full rounded-xl bg-green-500 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300">Selesaikan {kind}</button>
    {result && <ScoreBox score={result.score} correct={result.correct} wrong={result.wrong} kind={kind} onRetry={retry}/>} 
  </div>;
}

function ReviewModal({ course, onClose, onSave }) {
  const [rating, setRating] = useState(5); const [comment, setComment] = useState("");
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Berikan Review & Rating</h2><button onClick={onClose} aria-label="Tutup"><FiX/></button></div><p className="mt-2 text-sm text-gray-500">Bagaimana pengalamanmu mengikuti {course.title}?</p><div className="my-6 flex justify-center gap-2">{[1,2,3,4,5].map(star => <button key={star} onClick={() => setRating(star)} className="text-3xl"><FiStar className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}/></button>)}</div><textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Tulis review terbaikmu" className="h-32 w-full resize-none rounded-xl border border-gray-200 p-4 outline-none focus:border-green-500"/><div className="mt-4 grid grid-cols-2 gap-3"><button onClick={onClose} className="rounded-xl border border-green-500 py-3 font-bold text-green-600">Batal</button><button onClick={() => onSave({ rating, comment })} className="rounded-xl bg-green-500 py-3 font-bold text-white">Selesai</button></div></div></div>;
}

export default function LearningPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, getCourseById } = useCourses();
  const [course, setCourse] = useState(() => courses.find(c => String(c.id) === String(id)) || null);
  const [learning, setLearning] = useState(() => readLearning(user?.email, id));
  const [active, setActive] = useState("pretest");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [openModule, setOpenModule] = useState(true);

  useEffect(() => { getCourseById(id).then(data => data && setCourse(data)); }, [id, getCourseById]);

  if (!user) return <Navigate to="/login" replace />;
  if (!course) return <main className="min-h-screen pt-24 text-center">Course tidak ditemukan</main>;

  const progress = progressFromLearning(learning);
  const modules = [
    { id:"pretest", label:`Pre-Test: ${course.title}`, type:"pretest", meta:"10 Pertanyaan" },
    ...Array.from({length:8}, (_,i) => ({ id:`video-${i+1}`, label:`Video: ${course.title}`, type:"video", meta:"12 Menit" })),
    { id:"summary", label:`Rangkuman: ${course.title}`, type:"summary", meta:"12 Menit" },
    { id:"quiz", label:`Quiz: ${course.title}`, type:"quiz", meta:"10 Pertanyaan" },
    { id:"final", label:`Ujian Akhir: ${course.title}`, type:"final", meta:"10 Pertanyaan" },
  ];
  const completed = (itemId) => learning.completedItems.includes(itemId);
  const mark = (itemId) => { const next = saveLearning(user.email, id, { ...learning, completedItems: [...new Set([...learning.completedItems, itemId])] }); setLearning(next); };
  const handleResult = (payload, type, answers) => {
    let next = { ...learning, answers: { ...learning.answers, [type]: answers } };
    if (type === "pretest") next.pretestScore = payload?.score ?? null;
    if (type === "quiz") next.quizScore = payload?.score ?? null;
    if (type === "final") next.finalScore = payload?.score ?? null;
    if (type === "pretest" && payload) next.completedItems = [...new Set([...next.completedItems, type])];
    if ((type === "quiz" || type === "final") && payload?.score >= 70) next.completedItems = [...new Set([...next.completedItems, type])];
    if (!payload && (type === "pretest" || type === "quiz" || type === "final")) next.completedItems = next.completedItems.filter((item) => item !== type);
    const saved = saveLearning(user.email, id, next);
    setLearning(saved);
    if (type === "final" && payload?.score >= 70 && progressFromLearning(saved) >= 100) setReviewOpen(true);
  };
  const handleReview = ({ rating, comment }) => { const saved = saveLearning(user.email, id, { ...learning, review:{ rating, comment, createdAt: Date.now() } }); setLearning(saved); setReviewOpen(false); };

  const current = modules.find(m => m.id === active) || modules[0];
  const content = current.type === "quiz" ? <QuizView course={course} learning={learning} onResult={handleResult}/> : current.type === "final" ? <QuizView course={course} learning={learning} final onResult={handleResult}/> : current.type === "pretest" ? <QuizView course={course} learning={learning} pretest onResult={handleResult}/> : current.type === "summary" ? <div><h2 className="text-2xl font-bold">Rangkuman Modul</h2><p className="mt-3 text-gray-500">Tonton video rangkuman, lalu download materi ringkasannya.</p><div className="mt-5 aspect-video overflow-hidden rounded-2xl bg-gray-900"><video controls className="h-full w-full" src={videoUrl} onEnded={() => mark("summary")}/></div><button onClick={() => { mark("summary"); const blob = new Blob([`Rangkuman ${course.title}\n\nMateri: konsep utama, praktik, dan evaluasi pembelajaran.`], {type:"text/plain"}); const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`Rangkuman-${course.title}.txt`; a.click(); URL.revokeObjectURL(url); }} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-green-500 px-5 py-3 font-bold text-green-600"><FiDownload/> Download Rangkuman</button></div> : <div><div className="aspect-video overflow-hidden rounded-2xl bg-gray-900"><video controls className="h-full w-full" src={videoUrl} onEnded={() => mark(current.id)} /></div><h2 className="mt-6 text-2xl font-bold">{current.label}</h2><p className="mt-2 text-gray-500">Pelajari materi video sampai selesai untuk memperbarui progres kelas.</p><button onClick={() => mark(current.id)} className="mt-5 rounded-xl bg-green-500 px-5 py-3 font-bold text-white">{completed(current.id) ? "Sudah Selesai" : "Tandai Selesai"}</button></div>;

  const paidCourses = courses.filter((item) => readPayments(user.email).some((payment) => payment.status === "paid" && String(payment.courseId) === String(item.id)));
  const hasThreePurchased = paidCourses.length >= 3;
  const currentIndex = paidCourses.findIndex((item) => String(item.id) === String(course.id));
  const previousCourse = currentIndex > 0 ? paidCourses[currentIndex - 1] : null;
  const nextCourse = currentIndex >= 0 && currentIndex < paidCourses.length - 1 ? paidCourses[currentIndex + 1] : null;

  return <div className="min-h-screen bg-white pb-16">
    <header className="sticky top-0 z-50 flex min-h-16 items-center justify-between border-b bg-white px-3 sm:px-8">
      <Link to="/my-courses" className="flex min-w-0 items-center gap-3 font-semibold"><FiArrowLeft/><span className="truncate">{course.title}</span></Link>
      <div className="flex items-center gap-3 sm:gap-5"><div className="flex items-center gap-2"><div className="h-2 w-20 rounded-full bg-gray-100 sm:w-28"><div className="h-full rounded-full bg-orange-400" style={{width:`${progress}%`}}/></div><span className="font-bold text-green-500">{progress}%</span></div><Link to="/profile" aria-label="Buka profil"><img src={user?.profileImage || defaultAvatar} className="h-9 w-9 rounded-xl object-cover sm:h-10 sm:w-10" alt="Foto profil"/></Link></div>
    </header>
    <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[minmax(0,1fr)_380px]">
      <main className="bg-white p-4 sm:p-7 lg:p-10"><div className="mx-auto max-w-4xl">{content}</div></main>
      <aside className="border-l bg-white"><div className="sticky top-16 max-h-[calc(100vh-64px)] overflow-y-auto"><div className="border-b p-5"><h2 className="text-xl font-bold">Daftar Modul</h2></div><button onClick={() => setOpenModule(v=>!v)} className="flex w-full items-center justify-between p-5 font-bold">{course.title}<FiChevronDown className={openModule ? "rotate-180" : ""}/></button>{openModule && <div className="space-y-3 px-4 pb-5">{modules.map(item => <button key={item.id} onClick={() => setActive(item.id)} className={`w-full rounded-xl border p-4 text-left ${active===item.id ? "border-green-500 bg-green-50" : "border-gray-200"}`}><div className="flex gap-3"><span className={`mt-0.5 ${completed(item.id) ? "text-green-500" : "text-gray-400"}`}>{completed(item.id) ? <FiCheckCircle/> : item.type === "video" ? <FiPlayCircle/> : <FiFileText/>}</span><span className="min-w-0"><span className="block text-sm font-semibold">{item.label}</span><span className="mt-1 block text-xs text-gray-500">{item.meta}</span></span></div></button>)}</div>}<button onClick={() => setReviewOpen(true)} disabled={!(progress>=100 && Number(learning.finalScore)>=70)} className="w-full bg-orange-400 px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><FiStar className="mr-2 inline"/> Beri Review & Rating</button></div></aside>
    </div>
    {hasThreePurchased && <nav className="fixed bottom-0 inset-x-0 z-40 grid grid-cols-2 bg-green-500 text-white shadow-2xl"><button disabled={!previousCourse} onClick={() => previousCourse && navigate(`/learn/${previousCourse.id}`)} className="flex items-center gap-3 px-4 py-4 text-left font-bold disabled:opacity-40 sm:px-10"><FiArrowLeft/><span className="truncate">{previousCourse?.title || "Kursus sebelumnya"}</span></button><button disabled={!nextCourse} onClick={() => nextCourse && navigate(`/learn/${nextCourse.id}`)} className="flex items-center justify-end gap-3 px-4 py-4 text-right font-bold disabled:opacity-40 sm:px-10"><span className="truncate">{nextCourse?.title || "Kursus berikutnya"}</span><FiArrowRight/></button></nav>}
    {progress >= 100 && <div className="fixed bottom-20 right-3 z-40 w-[calc(100%-1.5rem)] max-w-sm rounded-2xl bg-white p-4 shadow-2xl sm:right-6"><div className="flex items-center justify-between gap-4"><div><p className="font-bold">Kelas selesai!</p><p className="text-xs text-gray-500">Nilai akhir {learning.finalScore ?? "-"}/100</p></div><button disabled={!canDownloadCertificate(learning)} onClick={() => downloadCertificate(course, user, learning.finalScore)} className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-white disabled:bg-gray-300"><FiDownload/> Unduh Sertifikat</button></div></div>}
    {reviewOpen && <ReviewModal course={course} onClose={() => setReviewOpen(false)} onSave={handleReview}/>}</div>;
}
