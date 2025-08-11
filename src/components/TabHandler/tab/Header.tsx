// src/components/tab/Header.tsx
import React, { useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoLanguage } from "react-icons/io5";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  username: string;
  avatarUrl?: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Header: React.FC<HeaderProps> = (props) => {
  console.log("%c[Header props]", "color:#0af;font-weight:bold;", props);

  useEffect(() => {
    console.log("%c[Header props changed]", "color:#f0a;", props);
    console.table(props);
  }, [props]);

  const { t, i18n } = useTranslation();
  const { username, avatarUrl, collapsed, onToggleCollapse } = props;

  /*───────── تغییر زبان با کلیک روی ایکون ─────────*/
  const toggleLanguage = () => {
    const newLng = i18n.language === "fa" ? "en" : "fa";
    i18n.changeLanguage(newLng);
    localStorage.setItem("i18nextLng", newLng);
  };

  return (
    /* dir="ltr" ⇒ ترتیب Flex ثابت می‌ماند تا لوگو و آیکون همیشه چپ باشند */
    <header
      dir="ltr"
      className="flex justify-between items-center p-1 mx-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-md"
    >
      {/* لوگو + ایکون زبان – همیشه چسبیده به چپ */}
      <div className="flex items-center gap-4">
        <img
          src="./images/Neco/logoNeco.jpg"
          alt="Company Logo"
          className="w-8 h-8 rounded-lg shadow-sm border border-gray-200 bg-white transition-transform transform hover:scale-105 hover:shadow-md"
        />

        <button
          onClick={toggleLanguage}
          className="text-white text-lg focus:outline-none transition-transform hover:scale-110"
          aria-label="Change language"
          title={i18n.language === "fa" ? "English" : "فارسی"}
        >
          <IoLanguage size={24} />
        </button>
      </div>

      {/* عنوان مرکزی */}
      <h4 className="text-white text-sm font-semibold text-center">
        {t("header.title", "NECO Organizational Project Management System")}
      </h4>

      {/* نام کاربر، آواتار و دکمهٔ باز/بستن – فاصله یکنواخت در هر جهت */}
      <div className="flex items-center gap-4">
        <span className="text-white text-sm font-medium whitespace-nowrap">
          {username}
        </span>

        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover border border-white/40"
          />
        ) : (
          <div className="w-8 h-8 rounded-full border border-white/40 bg-white/20" />
        )}

        <button
          onClick={onToggleCollapse}
          className="focus:outline-none transform transition-transform duration-300"
          aria-label="toggle header"
        >
          <FaChevronDown
            className={`text-white text-lg ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
