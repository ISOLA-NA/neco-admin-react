import Cookies from "js-cookie";

export const setCookie = (
  ttkk: string,
  timeExpire: Date = new Date(new Date().getTime() + 60 * 60 * 1000)
) => {
  Cookies.set("admin_token", ttkk, { expires: timeExpire, path: "/" });
};

export const getCookie = (ttkk: string = "admin_token") => {
  return Cookies.get(ttkk) || null;
};

export const removeCookie = (ttkk: string = "admin_token") => {
  Cookies.remove(ttkk, { path: "/" });
};

