import axios from "axios";
import { createRoot } from "react-dom/client";

// simple pub/sub so we can notify from interceptor without circular imports
let toast;
export const setToast = (fn) => (toast = fn);

const http = axios.create({ baseURL: "/api" });

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Network / server error";
    toast && toast(msg, "error");
    return Promise.reject(err);
  }
);

export default http;
