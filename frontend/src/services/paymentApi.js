import axios from "axios";
const API_URL = "/api/courses";
const API_ROOT = API_URL.replace(/\/courses\/?$/, "");
const api = axios.create({ baseURL: `${API_ROOT}/payments`, timeout: 15000 });
export const preparePayment = async (payload) => (await api.post("/prepare", payload)).data?.data;
export const completePayment = async (payload) => (await api.post("/complete", payload)).data?.data;
