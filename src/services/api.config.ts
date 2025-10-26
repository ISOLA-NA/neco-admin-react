// src/services/httpClient.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import i18next from "i18next";

const baseUrl = import.meta.env.VITE_URL;
if (!baseUrl) {
  throw new Error("VITE_URL is not defined in the environment variables.");
}

const httpClient = axios.create({
  baseURL: `${baseUrl}/`,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "en", // پیش‌فرض؛ بعداً در interceptor override می‌شود
  },
  withCredentials: true,
});

// هلسپر ساخت Accept-Language
function buildAcceptLanguage(lngRaw: string | undefined): string {
  const lng = (lngRaw || "en").toLowerCase();
  const base = lng.split("-")[0]; // en-US -> en

  if (base === "fa") {
    // اولویت فارسی، بعد انگلیسی
    // (اگر سرورت فقط اولین مورد را می‌خواند، همین اولی "fa-IR" کفایت می‌کند)
    return `${lng},fa-IR;q=0.9,fa;q=0.9,en-US;q=0.8,en;q=0.7`;
  }

  // سایر زبان‌ها: زبان جاری اولویت دارد، اما فارسی هم به‌عنوان fallback ضعیف حضور دارد
  return `${lng},en-US;q=0.9,en;q=0.9,fa-IR;q=0.3,fa;q=0.2`;
}

// درخواست: ست‌کردن Authorization و Accept-Language
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Authorization
    const token = Cookies.get("token");
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }

    // اگر کاربر قبلاً دستی Accept-Language گذاشته بود، دست نزن
    if (!config.headers?.["Accept-Language"]) {
      const currentLang =
        i18next?.language ||
        (typeof window !== "undefined"
          ? window.localStorage.getItem("i18nextLng") || ""
          : "") ||
        "en";

      (config.headers as any)["Accept-Language"] = buildAcceptLanguage(
        currentLang
      );
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
