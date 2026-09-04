import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { expirePaymentIfNeeded, readPayments } from "../services/payment";
import { useAuth } from "../context/AuthContext";

const statusText = { paid: "Berhasil", pending: "Belum Bayar", failed: "Gagal" };
const statusClass = {
  paid: "bg-green-100 text-green-500",
  pending: "bg-amber-100 text-amber-500",
  failed: "bg-red-100 text-red-500",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const refresh = () => setOrders(readPayments(user?.email).map(expirePaymentIfNeeded));
    refresh();
    const timer = setInterval(refresh, 1000);
    return () => clearInterval(timer);
  }, [user?.email]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-5 overflow-x-auto text-sm font-semibold">
          <span className="whitespace-nowrap border-b-2 border-orange-500 pb-3 text-orange-500">Semua Pesanan</span>
          <span className="whitespace-nowrap text-gray-500">Menunggu</span>
          <span className="whitespace-nowrap text-gray-500">Berhasil</span>
          <span className="whitespace-nowrap text-gray-500">Gagal</span>
        </div>
        <label className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-gray-400 sm:w-40">
          <input placeholder="Cari Kelas" className="min-w-0 flex-1 text-xs outline-none" /><FiSearch/>
        </label>
      </div>

      <div className="space-y-5">
        {orders.length === 0 && <div className="py-10 text-center text-sm text-gray-500">Belum ada pesanan.</div>}
        {orders.map(order => (
          <article key={order.id} className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex flex-wrap items-center gap-3 bg-[#f9fff7] px-4 py-3 text-xs text-gray-500 sm:text-sm">
              <span>No. Invoice: <a href={`#${order.id}`} className="font-medium text-sky-500 underline">{order.id}</a></span>
              <span>Waktu Pemesanan: {new Date(order.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
              <span className={`ml-auto rounded-lg px-2 py-1 ${statusClass[order.status]}`}>{statusText[order.status]}</span>
            </div>
            <div className="flex items-center gap-3 p-4">
              <img src={order.thumbnail} alt="" className="h-12 w-16 rounded-lg object-cover sm:h-14 sm:w-20"/>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-800 sm:text-base">{order.title}</h3>
                {order.status === "pending" && <p className="mt-1 text-xs text-gray-500">Selesaikan pembayaran sebelum batas waktu berakhir.</p>}
              </div>
              <div className="hidden border-l border-gray-200 pl-6 text-xs sm:block"><p className="text-gray-500">Harga</p><b>Rp {order.price.toLocaleString("id-ID")}</b></div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 bg-[#f9fff7] px-4 py-3">
              <span className="text-xs text-gray-500">Total Pembayaran</span>
              <span className="font-bold text-green-500">Rp {(order.price + order.adminFee).toLocaleString("id-ID")}</span>
            </div>
            {order.status === "pending" && <div className="px-4 pb-4"><Link to={`/checkout/${order.courseId}/pay`} className="inline-flex rounded-lg bg-green-500 px-4 py-2 text-xs font-semibold text-white">Lanjut Bayar</Link></div>}
          </article>
        ))}
      </div>

      {orders.length > 0 && <div className="mt-6 flex justify-end gap-2 text-xs"><button className="rounded bg-gray-100 p-2"><FiChevronLeft/></button><span className="rounded bg-orange-400 px-3 py-2 text-white">1</span><button className="rounded bg-gray-100 p-2"><FiChevronRight/></button></div>}
    </div>
  );
}
