import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiChevronDown, FiCopy } from "react-icons/fi";
import { useCourses } from "../context/CourseContext";
import { useAuth } from "../context/AuthContext";
import { expirePaymentIfNeeded, getPayment, getPaymentByCourse, upsertPayment } from "../services/payment";
import logo from "../assets/logo-video-belajar.png";
import { completePayment } from "../services/paymentApi";

const money = n => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, getCourseById } = useCourses();
  const { user, isLogin } = useAuth();
  const [course, setCourse] = useState(() => courses.find(c => String(c.id) === String(id)) || null);
  const [payment, setPayment] = useState(() => expirePaymentIfNeeded(getPaymentByCourse(id, user?.email)));
  const [remaining, setRemaining] = useState(() => Math.max(0, (getPaymentByCourse(id, user?.email)?.expiresAt || Date.now()) - Date.now()));
  const [card,setCard]=useState({name:"",number:"",expiry:"",cvv:""});
  const [paying,setPaying]=useState(false);
  const [cardError,setCardError]=useState("");

  useEffect(() => { getCourseById(id).then(data => data && setCourse(data)); }, [id, getCourseById]);

  useEffect(() => {
    if (!isLogin || !user?.email) {
      navigate("/login", { replace: true });
      return undefined;
    }
    const tick = () => {
      const current = expirePaymentIfNeeded(getPaymentByCourse(id, user.email));
      if (!current) return navigate(`/checkout/${id}/method`, { replace: true });
      setPayment(current);
      const left = Math.max(0, current.expiresAt - Date.now());
      setRemaining(left);
      if (current.status === "failed") navigate(`/checkout/${id}/failed`, { replace: true });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [id, navigate, isLogin, user?.email]);

  if (!course || !payment) return <div className="min-h-screen bg-[#fffdf4] pt-28 text-center">Memuat pembayaran...</div>;

  const total = payment.price + payment.adminFee;
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const pad = n => String(n).padStart(2, "0");

  const payNow = async () => {
    const current = expirePaymentIfNeeded(getPayment(payment.id));
    if (!current || current.status === "failed") return navigate(`/checkout/${id}/failed`);
    if (current.methodCode === "card") {
      const digits=card.number.replace(/\D/g,"");
      if(!card.name || digits.length < 13 || !/^\d{2}\/\d{2}$/.test(card.expiry) || card.cvv.length < 3){ setCardError("Lengkapi nama, nomor kartu, masa berlaku (MM/YY), dan CVV."); return; }
    }
    setPaying(true); setCardError("");
    try {
      await completePayment({ paymentId:current.gatewayPaymentId, cardLast4: current.methodCode === "card" ? card.number.replace(/\D/g,"").slice(-4) : undefined });
      upsertPayment({ ...current, status: "paid", paidAt: Date.now() });
      navigate(`/checkout/${id}/success`);
    } catch {
      setCardError("Pembayaran gagal diproses. Pastikan backend dan database aktif.");
    } finally { setPaying(false); }
  };

  return (
    <div className="min-h-screen bg-[#fffdf4] pt-20 sm:pt-[88px]">
      <CheckoutHeader step={2} />
      <div className="bg-orange-50 py-3 text-center text-xs text-gray-600 sm:text-sm">
        Selesaikan pemesanan dalam <b className="ml-2 rounded bg-orange-500 px-2 py-1 text-white">{pad(hours)}</b> : <b className="rounded bg-orange-500 px-2 py-1 text-white">{pad(minutes)}</b> : <b className="rounded bg-orange-500 px-2 py-1 text-white">{pad(seconds)}</b>
      </div>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_310px] lg:py-12">
        <section>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h1 className="text-xl font-bold">Metode Pembayaran</h1>
            <PaymentInstructions payment={payment} card={card} setCard={setCard} cardError={cardError} />

            <h2 className="mt-8 text-xl font-bold">Ringkasan Pesanan</h2>
            <div className="mt-5 space-y-5 text-sm">
              <div className="flex justify-between gap-4 text-gray-500"><span>Video Learning: {course.title}</span><b className="shrink-0 text-gray-600">{money(payment.price)}</b></div>
              <div className="flex justify-between text-gray-500"><span>Biaya Admin</span><b className="text-gray-600">{money(payment.adminFee)}</b></div>
              <div className="flex justify-between border-t pt-4 text-base font-bold"><span>Total Pembayaran</span><span className="text-green-500">{money(total)}</span></div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button onClick={() => navigate(`/checkout/${id}/method`)} className="rounded-lg border border-green-500 px-4 py-3 font-bold text-green-500 hover:bg-green-50">Ganti Metode Pembayaran</button>
              <button disabled={paying} onClick={payNow} className="rounded-lg bg-green-500 px-4 py-3 font-bold text-white hover:bg-green-600 disabled:opacity-60">{paying ? "Memproses..." : "Bayar Sekarang"}</button>
            </div>
          </div>

          <Instructions />
        </section>

        <CourseCard course={course} />
      </main>
    </div>
  );
}

function PaymentInstructions({ payment, card, setCard, cardError }) {
  const d=payment.details || {};
  if(d.type === "bank") return <div className="mt-5 rounded-xl border border-gray-200 p-5 sm:p-8">
    <div className="text-2xl font-extrabold text-blue-600">{d.bank}</div><p className="mt-2 text-base font-medium">Bayar melalui Virtual Account {d.bank}</p>
    <div className="mt-5 rounded-xl bg-gray-50 p-4"><p className="text-xs text-gray-500">Nomor Virtual Account</p><div className="mt-1 flex flex-wrap items-center gap-2 text-lg font-extrabold tracking-wider"><span>{d.va}</span><button className="text-sm font-bold text-orange-500" onClick={()=>navigator.clipboard?.writeText(d.va)}><FiCopy className="inline"/> Salin</button></div></div>
    <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-6 text-gray-500"><li>Pilih transfer ke Virtual Account pada ATM/mobile banking.</li><li>Masukkan nomor VA sesuai bank yang dipilih.</li><li>Pastikan nominal sama dengan total pembayaran.</li><li>Konfirmasi transaksi dan tunggu status pembayaran.</li></ol>
  </div>;
  if(d.type === "wallet") return <div className="mt-5 rounded-xl border border-gray-200 p-5 text-center sm:p-8"><div className="mx-auto flex h-44 w-44 items-center justify-center rounded-xl border-8 border-gray-900 bg-white text-center font-black tracking-widest">QRIS<br/><span className="text-[10px]">{d.qrReference}</span></div><p className="mt-4 font-bold">Bayar dengan {d.wallet}</p><p className="mt-2 text-sm text-gray-500">Buka aplikasi {d.wallet}, pilih pembayaran QR/merchant, lalu scan QR di atas.</p><p className="mt-3 text-xs text-gray-400">Kode merchant: {d.merchantCode}</p></div>;
  return <div className="mt-5 rounded-xl border border-gray-200 p-5 sm:p-8"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold sm:col-span-2">Nama pada Kartu<input value={card.name} onChange={e=>setCard({...card,name:e.target.value})} className="mt-2 w-full rounded-xl border p-3 font-normal" placeholder="Nama lengkap"/></label><label className="text-sm font-semibold sm:col-span-2">Nomor Kartu<input inputMode="numeric" value={card.number} onChange={e=>setCard({...card,number:e.target.value.replace(/[^0-9 ]/g,"")})} className="mt-2 w-full rounded-xl border p-3 font-normal tracking-wider" placeholder="1234 5678 9012 3456" maxLength="19"/></label><label className="text-sm font-semibold">Masa Berlaku<input inputMode="numeric" value={card.expiry} onChange={e=>setCard({...card,expiry:e.target.value.replace(/[^0-9/]/g,"").slice(0,5)})} className="mt-2 w-full rounded-xl border p-3 font-normal" placeholder="MM/YY" maxLength="5"/></label><label className="text-sm font-semibold">CVV<input type="password" inputMode="numeric" value={card.cvv} onChange={e=>setCard({...card,cvv:e.target.value.replace(/\D/g,"").slice(0,4)})} className="mt-2 w-full rounded-xl border p-3 font-normal" placeholder="•••" maxLength="4"/></label></div>{cardError&&<p className="mt-3 text-sm font-semibold text-red-500">{cardError}</p>}<p className="mt-4 text-xs leading-5 text-gray-400">Simulasi checkout: nomor kartu dan CVV tidak disimpan ke database. Hanya 4 digit terakhir yang dikirim sebagai referensi transaksi.</p></div>;
}

function CourseCard({ course }) {
  return <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-28">
    <img src={course.thumbnail} alt="" className="h-40 w-full rounded-xl object-cover"/>
    <h2 className="mt-4 text-lg font-bold">{course.title}</h2>
    <p className="mt-4 font-bold text-green-500">{money(course.price)} <span className="ml-2 text-sm font-normal text-gray-400 line-through">Rp 500K</span></p>
    <span className="mt-2 inline-block rounded bg-orange-400 px-2 py-1 text-[10px] font-bold text-white">Diskon 50%</span>
    <h3 className="mt-5 text-sm font-bold">Kelas Ini Sudah Termasuk</h3>
    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-500"><span>✓ Ujian Akhir</span><span>✓ 49 Video</span><span>✓ 7 Dokumen</span><span>✓ Sertifikat</span><span>✓ Pretest</span></div>
    <h3 className="mt-5 text-sm font-bold">Bahasa Pengantar</h3><p className="mt-2 text-xs text-gray-500">◉ Bahasa Indonesia</p>
  </aside>;
}

function Instructions() {
  const [open, setOpen] = useState(0);
  const data = [
    ["ATM BCA", ["Masukkan kartu ATM dan PIN BCA Anda.", "Di menu utama, pilih Transaksi Lainnya lalu pilih Transfer.", "Pilih Ke BCA Virtual Account.", "Masukkan nomor Virtual Account dan nominal pembayaran.", "Periksa detail transaksi lalu pilih Benar.", "Transaksi Anda sudah selesai."]],
    ["Mobile Banking BCA", ["Buka Aplikasi BCA Mobile.", "Pilih m-BCA kemudian pilih m-Transfer.", "Pilih BCA Virtual Account.", "Masukkan nomor Virtual Account lalu pilih OK.", "Klik Send untuk melanjutkan transfer.", "Masukkan PIN dan tunggu transaksi selesai."]],
    ["Internet Banking BCA", ["Login ke KlikBCA Individual.", "Pilih Transfer lalu Transfer ke BCA Virtual Account.", "Masukkan nomor Virtual Account.", "Pilih Lanjutkan untuk melanjutkan pembayaran.", "Masukkan respon KeyBCA sesuai instruksi.", "Pembayaran telah selesai."]],
  ];
  return <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
    <h2 className="text-xl font-bold">Tata Cara Pembayaran</h2>
    <div className="mt-5 space-y-2">{data.map(([title, lines], i) => <div key={title} className="rounded-xl border border-gray-200">
      <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full justify-between px-4 py-4 text-left text-sm font-bold">{title}<FiChevronDown className={open === i ? "rotate-180" : ""}/></button>
      {open === i && <ol className="list-decimal space-y-1 px-9 pb-4 text-sm leading-5 text-gray-500">{lines.map(x => <li key={x}>{x}</li>)}</ol>}
    </div>)}</div>
  </section>;
}

function CheckoutHeader({ step }) {
  const steps = ["Pilih Metode", "Bayar", "Selesai"];
  return <div className="border-b border-gray-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4"><img src={logo} alt="Video Belajar" className="h-8 w-auto sm:h-10" />{steps.map((item, i) => <div key={item} className="flex items-center gap-2 text-xs font-semibold sm:text-sm"><span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${i + 1 <= step ? "border-green-500 bg-green-500 text-white" : "border-gray-300 text-gray-400"}`}>{i + 1 < step ? "✓" : i + 1}</span><span className={i + 1 <= step ? "text-gray-800" : "text-gray-400"}>{item}</span>{i < 2 && <span className="hidden h-0.5 w-8 bg-gray-300 sm:block" />}</div>)}</div></div>;
}