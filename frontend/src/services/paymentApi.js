import axios from "axios";

const API_ROOT = String(import.meta.env.VITE_API_URL || "/api").trim().replace(/\/+$/, "").replace(/\/courses$/, "");
const api = axios.create({ baseURL: `${API_ROOT}/payments`, timeout: 20000 });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const preparePayment = async (payload) => (await api.post("/prepare", payload)).data?.data;
export const getPaymentStatus = async (paymentId) => (await api.get(`/${encodeURIComponent(paymentId)}/status`)).data?.data;
