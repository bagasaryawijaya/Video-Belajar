export const PAYMENT_KEY = "videoBelajarPayments";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export const readPayments = (userEmail = "") => {
  try {
    const data = JSON.parse(localStorage.getItem(PAYMENT_KEY));
    const items = Array.isArray(data) ? data : [];
    const email = normalizeEmail(userEmail);

    // Migrasi data lama yang belum memiliki pemilik. Data lama hanya
    // diklaim oleh user yang sedang login agar tidak bercampur dengan akun lain.
    if (email) {
      let changed = false;
      const migrated = items.map((item) => {
        if (!item.userEmail) {
          changed = true;
          return { ...item, userEmail: email };
        }
        return item;
      });
      if (changed) localStorage.setItem(PAYMENT_KEY, JSON.stringify(migrated));
      return migrated.filter((item) => normalizeEmail(item.userEmail) === email);
    }

    return items;
  } catch {
    return [];
  }
};

export const readAllPayments = () => {
  try {
    const data = JSON.parse(localStorage.getItem(PAYMENT_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const savePayments = (items) => {
  localStorage.setItem(PAYMENT_KEY, JSON.stringify(items));
};

export const getPayment = (id) => readAllPayments().find((item) => item.id === id);

export const getPaymentsForUser = (userEmail) => readPayments(userEmail);

export const getPaidCourseIds = (userEmail) =>
  readPayments(userEmail)
    .filter((item) => item.status === "paid")
    .map((item) => String(item.courseId));

export const getPaymentByCourse = (courseId, userEmail) =>
  readPayments(userEmail).find((item) => String(item.courseId) === String(courseId));

export const upsertPayment = (payment) => {
  const items = readAllPayments();
  const index = items.findIndex((item) => item.id === payment.id);
  if (index >= 0) items[index] = payment;
  else items.unshift(payment);
  savePayments(items);
  return payment;
};

export const makePaymentId = () => `INV-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

export const createPendingPayment = (course, userEmail) => {
  const now = Date.now();
  const payment = {
    id: makePaymentId(),
    courseId: String(course.id),
    userEmail: normalizeEmail(userEmail),
    title: course.title,
    thumbnail: course.thumbnail,
    price: Number(course.price || 0),
    adminFee: 7000,
    method: "Bank BCA",
    status: "pending",
    createdAt: now,
    expiresAt: now + 60 * 60 * 1000,
  };
  return upsertPayment(payment);
};

export const expirePaymentIfNeeded = (payment) => {
  if (payment && payment.status === "pending" && Date.now() >= payment.expiresAt) {
    return upsertPayment({ ...payment, status: "failed", failedAt: Date.now() });
  }
  return payment;
};
