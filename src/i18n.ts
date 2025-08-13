import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// English files
import enLogin from "./components/locales/en/login.json";
import enMenu from "./components/locales/en/Menu.json";
import enConfiguration from "./components/locales/en/configuration.json";

// Farsi files
import faLogin from "./components/locales/fa/login.json";
import faMenu from "./components/locales/fa/Menu.json";
import faConfiguration from "./components/locales/fa/configuration.json";

const resources = {
  en: {
    translation: {
      ...enLogin,
      ...enMenu,
      ...enConfiguration,
    },
  },
  fa: {
    translation: {
      ...faLogin,
      ...faMenu,
      ...faConfiguration,
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("i18nextLng") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// ★ هم‌گام‌سازی جهت و زبانِ عنصر <html> با تغییر زبان
const setDir = (lng: string) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "fa" ? "rtl" : "ltr";
};
setDir(i18n.language);

i18n.on("languageChanged", (lng) => setDir(lng));

export default i18n;
