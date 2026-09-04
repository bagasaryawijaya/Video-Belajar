import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiCheckCircle, FiClock, FiRefreshCw } from "react-icons/fi";
import { useCourses } from "../context/CourseContext";
import { useAuth } from "../context/AuthContext";
import { getPaymentByCourse, upsertPayment } from "../services/payment";
import { getPaymentStatus } from "../services/paymentApi";
import logo from "../assets/logo-video-belajar.png";

const money = n => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

function loadSnap() {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve(window.snap);
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    if (!clientKey) return reject(new Error("VITE_MIDTRANS_CLIENT_KEY belum diisi di Vercel."));
    const script = document.createElement("script");
    script.src = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true" ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => resolve(window.snap);
    script.onerror = () => reject(new Error("Gagal memuat halaman pembayaran Midtrans."));
    document.head.appendChild(script);
  });
}

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, getCourseById } = useCourses();
  const { user, isLogin } = useAuth();
  const [course, setCourse] = useState(() => courses.find(c => String(c.id) === String(id)) || null);
  const [payment] = useState(() => getPaymentByCourse(id, user?.email));
  const [status, setStatus] = useState("pending");
  const [opening, setOpening] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { getCourseById(id).then(data => data && setCourse(data)); }, [id, getCourseById]);
  useEffect(() => {
    if (!isLogin) { navigate("/login", { replace: true }); return; }
    const local = getPaymentByCourse(id, user?.email);
    if (!local?.id) { navigate(`/checkout/${id}/method`, { replace: true }); return; }
    getPaymentStatus(local.id).then((data) => setStatus(data?.status || "pending")).catch(() => {});
  }, [id, isLogin, navigate, user?.email]);

  const checkStatus = useCallback(async (goOnSuccess = true) => {
    if (!payment?.id) return "pending";
    try {
      const data = await getPaymentStatus(payment.id);
      setStatus(data.status);
      if (data.status === "paid") {
        upsertPayment({ ...payment, status: "paid", paidAt: Date.now(), transactionId: data.transactionId });
        if (goOnSuccess) navigate(`/checkout/${id}/success`, { replace: true });
      } else if (data.status === "failed") {
        upsertPayment({ ...payment, status: "failed" });
      }
      return data.status;
    } catch { return "pending"; }
  }, [id, navigate, payment]);

  useEffect(() => {
    if (!payment?.id || status !== "pending") return undefined;
    const timer = setInterval(() => checkStatus(true), 5000);
    return () => clearInterval(timer);
  }, [payment?.id, status, checkStatus]);

  const openPayment = async () => {
    if (!payment?.snapToken) return setMessage("Token pembayaran tidak ditemukan. Silakan pilih metode pembayaran lagi.");
    setOpening(true); setMessage("");
    try {
      const snap = await loadSnap();
      snap.pay(payment.snapToken, {
        language: "id",
        onSuccess: async () => { setMessage("Pembayaran berhasil. Menunggu konfirmasi server..."); await checkStatus(true); },
        onPending: () => { setStatus("pending"); setMessage("Pembayaran menunggu penyelesaian. Untuk transfer/QRIS, selesaikan pembayaran pada instruksi Midtrans."); },
        onError: () => { setStatus("failed"); setMessage("Pembayaran gagal. Silakan coba lagi."); },
        onClose: () => { setMessage("Halaman pembayaran ditutup. Anda masih dapat melanjutkan pembayaran."); },
      });
    } catch (error) { setMessage(error.message); }
    finally { setOpening(false); }
  };

  if (!course || !payment) return <div className="min-h-screen bg-[#fffdf4] pt-28 text-center">Memuat pembayaran...</div>;
  const total = Number(payment.amount || payment.price || 0);

  return <div className="min-h-screen bg-[#fffdf4] pt-20 sm:pt-[88px]"><CheckoutHeader step={2}/><main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_310px] lg:py-12"><section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-green-600">Pesanan {payment.orderNumber}</p><h1 className="mt-2 text-2xl font-bold">Selesaikan Pembayaran</h1><p className="mt-2 text-sm leading-6 text-gray-500">Pembayaran diproses secara aman oleh Midtrans. Transfer bank, QRIS/e-wallet, dan kartu diproses oleh gateway.</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${status==="paid"?"bg-green-50 text-green-600":status==="failed"?"bg-red-50 text-red-600":"bg-orange-50 text-orange-600"}`}>{status==="paid"?"Lunas":status==="failed"?"Gagal":"Menunggu"}</span></div><div className="mt-7 rounded-2xl border border-green-100 bg-green-50 p-5"><div className="flex items-center gap-3"><FiClock className="text-xl text-green-600"/><div><p className="text-sm font-semibold">Total pembayaran</p><p className="text-2xl font-extrabold text-green-600">{money(total)}</p></div></div></div>{message&&<div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">{message}</div>}<button disabled={opening||status==="paid"} onClick={openPayment} className="mt-6 w-full rounded-xl bg-green-500 py-4 font-bold text-white hover:bg-green-600 disabled:opacity-60">{opening?"Membuka pembayaran...":status==="paid"?"Pembayaran sudah lunas":"Buka Pembayaran Midtrans"}</button><button onClick={()=>checkStatus(false)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"><FiRefreshCw/> Perbarui Status Pembayaran</button><div className="mt-7 grid gap-3 sm:grid-cols-3"><Info title="Transfer Bank" text="Virtual Account bank yang tersedia di Midtrans"/><Info title="E-Wallet / QRIS" text="Bayar melalui QRIS atau e-wallet yang aktif"/><Info title="Kartu" text="Kartu kredit/debit melalui halaman aman Midtrans"/></div><div className="mt-7 rounded-xl border border-gray-200 p-4 text-sm text-gray-500"><b className="text-gray-800">Penting:</b> Jangan kirim nomor kartu, CVV, OTP, atau PIN kepada admin. Data kartu dimasukkan langsung di halaman pembayaran Midtrans.</div></section><aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-28"><img src={course.thumbnail} alt="" className="h-40 w-full rounded-xl object-cover"/><h2 className="mt-4 font-bold">{course.title}</h2><p className="mt-3 text-sm text-gray-500">Metode: <b className="text-gray-800">{payment.method}</b></p><div className="mt-5 border-t pt-4 text-sm"><div className="flex justify-between"><span className="text-gray-500">Course</span><b>{money(payment.price)}</b></div><div className="mt-2 flex justify-between"><span className="text-gray-500">Biaya Admin</span><b>{money(payment.adminFee)}</b></div><div className="mt-3 flex justify-between border-t pt-3 font-bold"><span>Total</span><span className="text-green-500">{money(total)}</span></div></div><Link to={`/checkout/${id}/method`} className="mt-5 block text-center text-sm font-semibold text-green-600 hover:underline">Ganti metode pembayaran</Link></aside></main></div>;
}
function Info({title,text}){return <div className="rounded-xl border border-gray-200 p-4"><p className="font-bold text-gray-800">{title}</p><p className="mt-1 text-xs leading-5 text-gray-500">{text}</p></div>}
function CheckoutHeader({step}){return <div className="border-b border-gray-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:px-6"><img src={logo} alt="Video Belajar" className="h-8 w-auto sm:h-10"/><div className="flex items-center gap-2 text-xs font-semibold sm:gap-4 sm:text-sm">{["Pilih Metode","Bayar","Selesai"].map((item,i)=><div key={item} className="flex items-center gap-2"><span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${i+1<=step?"border-green-500 bg-green-500 text-white":"border-gray-300 text-gray-400"}`}>{i+1<step?<FiCheckCircle/>:i+1}</span><span className={i+1<=step?"text-gray-800":"text-gray-400"}>{item}</span></div>)}</div></div></div>}
