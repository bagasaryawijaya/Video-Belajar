import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiChevronDown, FiCheck, FiCreditCard, FiSmartphone } from "react-icons/fi";
import { useCourses } from "../context/CourseContext";
import { useAuth } from "../context/AuthContext";
import { createPendingPayment, getPaymentByCourse, upsertPayment, expirePaymentIfNeeded } from "../services/payment";
import logo from "../assets/logo-video-belajar.png";
import { preparePayment } from "../services/paymentApi";

const money = n => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const bankMethods = ["Bank BCA", "Bank BNI", "Bank BRI", "Bank Mandiri"];
const walletMethods = ["Dana", "OVO", "LinkAja", "Shopee Pay"];

export default function PaymentMethodPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, getCourseById } = useCourses();
  const { user, isLogin } = useAuth();
  const [course, setCourse] = useState(() => courses.find(c => String(c.id) === String(id)) || null);
  const [selected, setSelected] = useState("Bank BCA");
  const [open, setOpen] = useState({ bank: true, wallet: true, card: true });

  useEffect(() => {
    getCourseById(id).then(data => data && setCourse(data));
  }, [id, getCourseById]);

  useEffect(() => {
    if (!isLogin) {
      navigate("/login", { replace: true });
      return;
    }
    const existing = expirePaymentIfNeeded(getPaymentByCourse(id, user?.email));
    if (existing?.status === "paid") {
      navigate("/my-courses", { replace: true });
      return;
    }
    if (existing?.status === "pending") setSelected(existing.method);
  }, [id, isLogin, navigate, user?.email]);

  if (!course) return <div className="min-h-screen bg-[#fffdf4] pt-28 text-center">Memuat course...</div>;

  const handleBuy = async () => {
    if (!isLogin || !user?.email) {
      navigate("/login");
      return;
    }

    const existing = expirePaymentIfNeeded(getPaymentByCourse(id, user.email));
    if (existing?.status === "paid") {
      navigate("/my-courses");
      return;
    }

    let payment = existing;
    if (!payment || payment.status !== "pending") payment = createPendingPayment(course, user.email);
    const price = Number(course.final_price ?? course.price ?? 0);
    const methodCode = selected === "Kartu Kredit/Debit" ? "card" : selected;
    try {
      const gateway = await preparePayment({ email:user.email, name:user.nama, courseId:id, amount:price + 7000, method:methodCode });
      payment = upsertPayment({ ...payment, userEmail:user.email.toLowerCase(), method:selected, methodCode, title:course.title, thumbnail:course.thumbnail, price, gatewayPaymentId:gateway.paymentId, orderNumber:gateway.orderNumber, details:gateway.details, status:"pending" });
      navigate(`/checkout/${id}/pay`);
    } catch (error) {
      alert(error.response?.data?.message || "Backend pembayaran belum terhubung. Jalankan backend dan isi payment_methods pada database.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf4] pt-20 sm:pt-[88px]">
      <CheckoutHeader step={1} />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_310px] lg:py-12">
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h1 className="text-xl font-bold sm:text-2xl">Metode Pembayaran</h1>

          <PaymentGroup title="Transfer Bank" open={open.bank} onClick={() => setOpen(v => ({...v, bank: !v}))}>
            {bankMethods.map(item => <MethodRow key={item} label={item} selected={selected === item} onClick={() => setSelected(item)} />)}
          </PaymentGroup>

          <PaymentGroup title="E-Wallet" open={open.wallet} onClick={() => setOpen(v => ({...v, wallet: !v}))}>
            {walletMethods.map(item => <MethodRow key={item} label={item} selected={selected === item} onClick={() => setSelected(item)} />)}
          </PaymentGroup>

          <PaymentGroup title="Kartu Kredit/Debit" open={open.card} onClick={() => setOpen(v => ({...v, card: !v}))}>
            <MethodRow label="Mastercard / VISA / JCB" selected={selected === "Kartu Kredit/Debit"} onClick={() => setSelected("Kartu Kredit/Debit")} />
          </PaymentGroup>
        </section>

        <CourseSummary course={course} selected={selected} onBuy={handleBuy} />
      </main>
    </div>
  );
}

function PaymentGroup({ title, open, onClick, children }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
      <button onClick={onClick} className="flex w-full items-center justify-between px-4 py-4 text-left font-bold">
        {title}<FiChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-2 px-3 pb-3">{children}</div>}
    </div>
  );
}

function MethodRow({ label, selected, onClick }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left text-sm transition ${selected ? "border-orange-300 bg-orange-50" : "border-gray-200 hover:border-green-300"}`}>
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${selected ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"}`}>
        {label === "Dana" || label === "OVO" || label === "LinkAja" || label === "Shopee Pay" ? <FiSmartphone/> : <FiCreditCard/>}
      </span>
      <span className="flex-1">{label}</span>
      {selected && <FiCheck className="text-orange-500"/>}
    </button>
  );
}

function CourseSummary({ course, selected, onBuy }) {
  const price = Number(course.final_price ?? course.price ?? 0);
  const total = price + 7000;
  return (
    <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-28">
      <img src={course.thumbnail} alt="" className="h-40 w-full rounded-xl object-cover" />
      <h2 className="mt-4 text-lg font-bold leading-tight">{course.title}</h2>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-lg font-bold text-green-500">{money(price)}</span>
        {course.discount_active ? <><span className="text-sm text-gray-400 line-through">{money(course.price)}</span><span className="ml-auto rounded-lg bg-orange-400 px-2 py-1 text-[10px] font-bold text-white">Diskon {course.discount_percent}%</span></> : null}
      </div>
      <div className="mt-5 space-y-3 text-xs text-gray-500">
        <p>✓ Ujian Akhir &nbsp; ✓ Video Pembelajaran</p>
        <p>✓ 7 Dokumen &nbsp; ✓ Sertifikat</p>
        <p>✓ Pretest &nbsp; ✓ Bahasa Indonesia</p>
      </div>
      <div className="mt-5 border-t pt-4">
        <div className="flex justify-between text-sm text-gray-500"><span>Video Learning</span><b>{money(price)}</b></div>
        <div className="mt-2 flex justify-between text-sm text-gray-500"><span>Biaya Admin</span><b>{money(7000)}</b></div>
        <div className="mt-3 flex justify-between border-t pt-3 font-bold"><span>Total Pembayaran</span><span className="text-green-500">{money(total)}</span></div>
      </div>
      <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">Metode dipilih: <b className="text-gray-700">{selected}</b></div>
      <button onClick={onBuy} className="mt-3 w-full rounded-lg bg-green-500 py-3 font-bold text-white hover:bg-green-600">Beli Sekarang</button>
    </aside>
  );
}

function CheckoutHeader({ step }) {
  const steps = ["Pilih Metode", "Bayar", "Selesai"];
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <img src={logo} alt="Video Belajar" className="h-8 w-auto sm:h-10" />
        <div className="flex w-full items-center justify-end gap-2 sm:gap-4">
          {steps.map((item, i) => {
            const active = i + 1 <= step;
            return <div key={item} className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${active ? "border-green-500 bg-green-500 text-white" : "border-gray-300 text-gray-400"}`}>{active && i < step ? "✓" : i + 1}</span>
              <span className={active ? "text-gray-800" : "text-gray-400"}>{item}</span>
              {i < 2 && <span className="hidden h-0.5 w-8 bg-gray-300 sm:block" />}
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}

export { CheckoutHeader };