import { Link, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPaymentByCourse } from "../services/payment";
import { FiCheckCircle } from "react-icons/fi";
import logo from "../assets/logo-video-belajar.png";

export function PaymentSuccessPage() {
  const { id } = useParams();
  const { user, isLogin } = useAuth();
  const payment = getPaymentByCourse(id, user?.email);
  if (!isLogin) return <Navigate to="/login" replace />;
  return <CheckoutShell step={3}>
    <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm sm:p-12">
      <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-green-50"><FiCheckCircle className="text-8xl text-green-500"/></div>
      <h1 className="mt-8 text-2xl font-bold sm:text-3xl">Pembayaran Berhasil!</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">Silakan cek email kamu untuk informasi lebih lanjut. Pesanan sudah masuk ke menu Pesanan Saya.</p>
      <Link to="/orders" className="mt-7 inline-flex rounded-lg bg-green-500 px-7 py-3 font-bold text-white hover:bg-green-600">Lihat Detail Pesanan</Link>
      <p className="mt-4 text-xs text-gray-400">{payment?.id || "Pembayaran selesai"}</p>
    </div>
  </CheckoutShell>;
}

export function PaymentFailedPage() {
  const { id } = useParams();
  const { user, isLogin } = useAuth();
  const payment = getPaymentByCourse(id, user?.email);
  if (!isLogin) return <Navigate to="/login" replace />;
  return <CheckoutShell step={2}>
    <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm sm:p-12">
      <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-amber-50 text-7xl">!</div>
      <h1 className="mt-8 text-2xl font-bold sm:text-3xl">Pembayaran Tertunda!</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">Batas waktu pembayaran sudah habis. Pesanan ini otomatis dinyatakan gagal.</p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to={`/checkout/${id}/method`} className="rounded-lg border border-green-500 px-6 py-3 font-bold text-green-500">Pilih Metode Lagi</Link>
        <Link to="/orders" className="rounded-lg bg-green-500 px-6 py-3 font-bold text-white">Lihat Pesanan</Link>
      </div>
    </div>
  </CheckoutShell>;
}

function CheckoutShell({ children, step }) {
  return <div className="min-h-screen bg-[#fffdf4] pt-20 sm:pt-[88px]">
    <div className="border-b border-gray-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6"><img src={logo} alt="Video Belajar" className="h-8 w-auto sm:h-10" />{["Pilih Metode","Bayar","Selesai"].map((s,i) => <div key={s} className="flex items-center gap-2 text-xs font-semibold sm:text-sm"><span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${i+1<=step ? "border-green-500 bg-green-500 text-white":"border-gray-300 text-gray-400"}`}>{i+1<step?"✓":i+1}</span><span>{s}</span>{i<2&&<span className="hidden h-0.5 w-8 bg-gray-300 sm:block"/>}</div>)}</div></div>
    <main className="px-4 py-12 sm:px-6 lg:py-16">{children}</main>
  </div>;
}
// Default export dipertahankan untuk kompatibilitas import lama.
export default PaymentSuccessPage;
