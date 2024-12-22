import Cookies from "js-cookie";

export const setCookie = (
  ttkk: string,
  timeExpire: Date = new Date(new Date().getTime() + 60 * 60 * 1000)
) => {
  Cookies.set("token", ttkk, { expires: timeExpire });
};

export const getCookie = (ttkk: string = "token") => {
    return Cookies.get(ttkk) || null;
  };
  

export const removeCookie = (ttkk: string = "token") => {
  Cookies.remove(ttkk);
};
