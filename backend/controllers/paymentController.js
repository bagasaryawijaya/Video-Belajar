import crypto from "crypto";
import { firestore } from "../config/firebase.js";

const orders = () => firestore.collection("orders");
const payments = () => firestore.collection("payments");
const courses = () => firestore.collection("courses");

const ADMIN_FEE = Number(process.env.PAYMENT_ADMIN_FEE || 7000);
const MIDTRANS_BASE = process.env.MIDTRANS_IS_PRODUCTION === "true"
  ? "https://app.midtrans.com"
  : "https://app.sandbox.midtrans.com";

const PAYMENT_METHODS = {
  "Bank BCA": ["bca_va"],
  "Bank BNI": ["bni_va"],
  "Bank BRI": ["bri_va"],
  "Bank Mandiri": ["echannel"],
  "QRIS / E-Wallet": ["gopay", "shopeepay", "qris"],
  "Kartu Kredit/Debit": ["credit_card"],
};

function makeOrderNumber() {
  return `VB-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function publicStatus(status) {
  if (["capture", "settlement", "success", "paid"].includes(status)) return "paid";
  if (["deny", "cancel", "expire", "failed", "failure"].includes(status)) return "failed";
  return "pending";
}

async function midtransRequest(path, payload) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi di Vercel.");
  const auth = Buffer.from(`${serverKey}:`).toString("base64");
  const response = await fetch(`${MIDTRANS_BASE}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_messages?.join(", ") || data.status_message || `Midtrans error ${response.status}`);
  return data;
}

export const preparePayment = async (req, res, next) => {
  try {
    const { courseId, method = "QRIS / E-Wallet" } = req.body || {};
    if (!courseId || !PAYMENT_METHODS[method]) return res.status(400).json({ success: false, message: "Course dan metode pembayaran wajib dipilih." });

    const courseRef = courses().doc(String(courseId));
    const courseSnap = await courseRef.get();
    if (!courseSnap.exists) return res.status(404).json({ success: false, message: "Course tidak ditemukan." });

    const course = courseSnap.data();
    const price = Number(course.price || 0);
    const discount = Number(course.discount_percent || 0);
    const today = new Date().toISOString().slice(0, 10);
    const activeDiscount = discount > 0 && (!course.discount_start_date || today >= String(course.discount_start_date).slice(0, 10)) && (!course.discount_end_date || today <= String(course.discount_end_date).slice(0, 10));
    const finalPrice = activeDiscount ? Math.max(0, Math.round(price * (1 - discount / 100))) : price;
    const total = finalPrice + ADMIN_FEE;
    if (total <= 0) return res.status(400).json({ success: false, message: "Harga course tidak valid." });

    const userSnap = await firestore.collection("users").doc(String(req.user.sub)).get();
    const user = userSnap.exists ? userSnap.data() : null;
    if (!user) return res.status(401).json({ success: false, message: "Pengguna tidak ditemukan." });

    const orderId = makeOrderNumber();
    const paymentId = crypto.randomUUID();
    const items = [
      { id: String(courseId), price: finalPrice, quantity: 1, name: String(course.course_title || course.title || "Course").slice(0, 50) },
      { id: "ADMIN-FEE", price: ADMIN_FEE, quantity: 1, name: "Biaya Admin" },
    ];
    const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
    const enabledPayments = PAYMENT_METHODS[method];

    const snap = await midtransRequest("/snap/v1/transactions", {
      transaction_details: { order_id: orderId, gross_amount: total },
      item_details: items,
      customer_details: {
        first_name: String(user.nama || "Customer").slice(0, 50),
        email: String(user.email || "").slice(0, 100),
        phone: String(user.phone || "").slice(0, 20),
      },
      enabled_payments: enabledPayments,
      expiry: { unit: "minutes", duration: Number(process.env.PAYMENT_EXPIRE_MINUTES || 60) },
      callbacks: frontendUrl ? {
        finish: `${frontendUrl}/checkout/${encodeURIComponent(courseId)}/success`,
        unfinish: `${frontendUrl}/checkout/${encodeURIComponent(courseId)}/pay`,
        error: `${frontendUrl}/checkout/${encodeURIComponent(courseId)}/failed`,
      } : undefined,
    });

    const now = new Date().toISOString();
    await orders().doc(orderId).set({
      id: orderId, orderNumber: orderId, userId: String(req.user.sub), courseId: String(courseId),
      total_amount: total, course_amount: finalPrice, admin_fee: ADMIN_FEE, status: "pending",
      payment_method: method, createdAt: now, updatedAt: now,
    });
    await payments().doc(paymentId).set({
      id: paymentId, orderId, userId: String(req.user.sub), courseId: String(courseId),
      amount: total, courseAmount: finalPrice, adminFee: ADMIN_FEE, method,
      payment_status: "pending", snap_token: snap.token, transaction_id: snap.token,
      createdAt: now, updatedAt: now,
    });

    res.status(201).json({ success: true, data: { paymentId, orderId, orderNumber: orderId, amount: total, courseAmount: finalPrice, adminFee: ADMIN_FEE, method, snapToken: snap.token } });
  } catch (error) { next(error); }
};

export const getPaymentStatus = async (req, res, next) => {
  try {
    const ref = payments().doc(String(req.params.paymentId));
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ success: false, message: "Pembayaran tidak ditemukan." });
    const payment = snap.data();
    if (String(payment.userId) !== String(req.user.sub)) return res.status(403).json({ success: false, message: "Akses pembayaran ditolak." });
    res.json({ success: true, data: { paymentId: ref.id, status: publicStatus(payment.payment_status), rawStatus: payment.payment_status, orderId: payment.orderId, transactionId: payment.transaction_id || null } });
  } catch (error) { next(error); }
};

export const handleNotification = async (req, res, next) => {
  try {
    const body = req.body || {};
    const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
    if (!serverKey) return res.status(500).json({ success: false, message: "MIDTRANS_SERVER_KEY belum dikonfigurasi." });
    const expected = crypto.createHash("sha512").update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`).digest("hex");
    if (expected !== body.signature_key) return res.status(403).json({ success: false, message: "Signature Midtrans tidak valid." });

    const orderRef = orders().doc(String(body.order_id));
    const orderSnap = await orderRef.get();
    if (orderSnap.exists) {
      const status = publicStatus(body.transaction_status);
      await orderRef.update({ status, gateway_status: body.transaction_status, transaction_id: body.transaction_id || null, updatedAt: new Date().toISOString() });
    }
    const paymentSnap = await payments().where("orderId", "==", String(body.order_id)).limit(1).get();
    if (!paymentSnap.empty) {
      await paymentSnap.docs[0].ref.update({ payment_status: body.transaction_status, transaction_id: body.transaction_id || paymentSnap.docs[0].data().transaction_id, payment_type: body.payment_type || null, settlement_time: body.settlement_time || null, updatedAt: new Date().toISOString() });
    }
    res.json({ success: true });
  } catch (error) { next(error); }
};
