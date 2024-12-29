import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";

const baseUrl = import.meta.env.VITE_URL;
if (!baseUrl) {
  throw new Error("VITE_URL is not defined in the environment variables.");
}

const httpClient = axios.create({
  baseURL: `${baseUrl}/`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// درخواست: ست‌کردن هدر Authorization با توکن
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// پاسخ: اگر 401 شد، توکن را حذف و ریدایرکت
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove("token");
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default httpClient;
