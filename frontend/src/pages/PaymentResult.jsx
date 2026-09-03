import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPaymentByCourse, upsertPayment } from "../services/payment";
import { getPaymentStatus } from "../services/paymentApi";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import logo from "../assets/logo-video-belajar.png";

export function PaymentSuccessPage() {
  const { id } = useParams();
  const { user, isLogin } = useAuth();
  const payment = getPaymentByCourse(id, user?.email);
  const [status, setStatus] = useState(payment?.status || "pending");

  useEffect(() => {
    if (!payment?.id) return;
    let active = true;
    const poll = async () => {
      try {
        const data = await getPaymentStatus(payment.id);
        if (!active) return;
        setStatus(data.status);
        if (data.status === "paid") upsertPayment({ ...payment, status: "paid", paidAt: Date.now(), transactionId: data.transactionId });
      } catch { /* notification gateway dapat tiba beberapa detik kemudian */ }
    };
    poll();
    const timer = setInterval(poll, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [payment]);

  if (!isLogin) return <Navigate to="/login" replace />;
  return <CheckoutShell step={status === "paid" ? 3 : 2}><div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm sm:p-12"><div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-green-50">{status === "paid" ? <FiCheckCircle className="text-7xl text-green-500"/> : <FiClock className="text-7xl text-orange-500"/>}</div><h1 className="mt-8 text-2xl font-bold sm:text-3xl">{status === "paid" ? "Pembayaran Berhasil!" : "Pembayaran Sedang Diverifikasi"}</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">{status === "paid" ? "Pembayaran telah dikonfirmasi oleh gateway. Pesanan dan akses course dapat digunakan." : "Pembayaran sudah dikirim ke gateway. Status akan diperbarui otomatis setelah notifikasi pembayaran diterima."}</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/orders" className="rounded-lg bg-green-500 px-7 py-3 font-bold text-white hover:bg-green-600">Lihat Pesanan</Link>{status !== "paid" && <Link to={`/checkout/${id}/pay`} className="rounded-lg border border-green-500 px-6 py-3 font-bold text-green-600">Kembali ke Pembayaran</Link>}</div><p className="mt-4 text-xs text-gray-400">{payment?.orderNumber || "Pesanan Video Belajar"}</p></div></CheckoutShell>;
}

export function PaymentFailedPage() {
  const { id } = useParams();
  const { isLogin } = useAuth();
  if (!isLogin) return <Navigate to="/login" replace />;
  return <CheckoutShell step={2}><div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm sm:p-12"><div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-red-50 text-6xl text-red-500">!</div><h1 className="mt-8 text-2xl font-bold sm:text-3xl">Pembayaran Gagal</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">Transaksi tidak berhasil. Anda dapat memilih metode pembayaran lain dan membuat transaksi baru.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link to={`/checkout/${id}/method`} className="rounded-lg border border-green-500 px-6 py-3 font-bold text-green-600">Pilih Metode Lagi</Link><Link to="/orders" className="rounded-lg bg-green-500 px-6 py-3 font-bold text-white">Lihat Pesanan</Link></div></div></CheckoutShell>;
}
function CheckoutShell({ children, step }) { return <div className="min-h-screen bg-[#fffdf4] pt-20 sm:pt-[88px]"><div className="border-b border-gray-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6"><img src={logo} alt="Video Belajar" className="h-8 w-auto sm:h-10"/><div className="flex items-center gap-2 text-xs font-semibold sm:gap-4 sm:text-sm">{["Pilih Metode","Bayar","Selesai"].map((s,i)=><div key={s} className="flex items-center gap-2"><span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${i+1<=step?"border-green-500 bg-green-500 text-white":"border-gray-300 text-gray-400"}`}>{i+1<step?"✓":i+1}</span><span>{s}</span></div>)}</div></div></div><main className="px-4 py-12 sm:px-6 lg:py-16">{children}</main></div>; }
export default PaymentSuccessPage;
