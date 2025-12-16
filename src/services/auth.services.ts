import Cookies from "js-cookie";

export const logout = () => {
  // تمام کوکی‌های موجود را دریافت کن
  const allCookies = Cookies.get();

  // هر کوکی را با path های مختلف حذف کن
  Object.keys(allCookies).forEach((cookieName) => {
    // حذف با path "/"
    Cookies.remove(cookieName, { path: "/" });

    // حذف با path خالی (اگر قبلاً غلط ست شده)
    Cookies.remove(cookieName);

    // اگر ساب‌مسیر داشته باشد
    Cookies.remove(cookieName, { path: "/admin" });
    Cookies.remove(cookieName, { path: "/dashboard" });
    Cookies.remove(cookieName, { path: "/login" });
  });

  // ریدایرکت
  window.location.href = "/login";
};
