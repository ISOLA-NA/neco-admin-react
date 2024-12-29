// src/services/api.config.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";

// استفاده از import.meta.env برای دسترسی به متغیر محیطی در Vite
const baseUrl = import.meta.env.VITE_URL_FILE;

if (!baseUrl) {
  throw new Error("VITE_URL is not defined in the environment variables.");
}

const httpClientFile = axios.create({
  baseURL: `${baseUrl}/`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// اضافه کردن interceptor برای افزودن هدر Authorization
httpClientFile.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("token");
    if (token) {
      // اطمینان از اینکه headers تعریف شده است
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`; // معمولاً توکن به صورت Bearer ارسال می‌شود
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// اضافه کردن interceptor برای مدیریت خطاهای پاسخ
httpClientFile.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // در صورت دریافت خطای 401، توکن را حذف کرده و به صفحه لاگین هدایت کنید
      Cookies.remove("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default httpClientFile;
