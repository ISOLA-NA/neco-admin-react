// src/components/tab/Header.tsx

import React, { useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

interface HeaderProps {
  username: string;
  avatarUrl?: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Header: React.FC<HeaderProps> = (props) => {
  // لاگ یک‌باره در هر رندر
  console.log("%c[Header props]", "color:#0af;font-weight:bold;", props);

  // یا فقط وقتی props عوض شد
  useEffect(() => {
    console.log("%c[Header props changed]", "color:#f0a;", props);
    console.table(props);
  }, [props]);

  const { username, avatarUrl, collapsed, onToggleCollapse } = props;

  return (
    <header className="flex justify-between items-center p-1 mx-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-md">
      {/* Logo */}
      <div className="flex items-center">
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src="./images/Neco/logoNeco.jpg"
            alt="Company Logo"
            className="rounded-lg shadow-sm border border-gray-200 bg-white transition-transform transform hover:scale-105 hover:shadow-md"
          />
        </div>
      </div>

      {/* Centered Title */}
      <h4 className="text-white text-sm font-semibold text-center">
        NECO Organizational Project Management System
      </h4>

      {/* User info + toggle */}
      <div className="flex items-center">
        <span className="text-white text-sm font-medium mr-2">{username}</span>

        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover border border-white/40 ml-2"
          />
        ) : (
          <div className="w-8 h-8 rounded-full border border-white/40 bg-white/20 ml-2" />
        )}

        <button
          onClick={onToggleCollapse}
          className="focus:outline-none transform transition-transform duration-300 ml-4"
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
