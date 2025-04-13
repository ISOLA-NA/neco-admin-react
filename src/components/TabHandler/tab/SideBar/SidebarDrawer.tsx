// src/components/SidebarDrawer.tsx

import React, { useState } from "react";
import Info from "./Info"; // ایمپورت کامپوننت Info
import Account from "./account"; // ایمپورت کامپوننت Account

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState<"info" | "account">("info");

  const renderTabContent = () => {
    if (activeTab === "info") {
      return <Info />; // استفاده از کامپوننت Info
    } else if (activeTab === "account") {
      return <Account />; // استفاده از کامپوننت Account
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Sidebar Drawer */}
      <div className="relative w-60 bg-gradient-to-b from-[#905bf5] to-[#c050d5] p-4 shadow-lg flex flex-col">
        {/* دکمه بستن دراور */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-xl font-bold"
          aria-label="Close Drawer"
        >
          &times;
        </button>

        {/* دکمه‌های تب Info و Account و Logout */}
        <div className="mt-16 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("info")}
            className={`w-full px-4 py-2 rounded ${
              activeTab === "info" ? "bg-white text-black" : "bg-transparent text-white"
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`w-full px-4 py-2 rounded ${
              activeTab === "account" ? "bg-white text-black" : "bg-transparent text-white"
            }`}
          >
            Account
          </button>
          <button
            onClick={onLogout}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ناحیه محتوای تب */}
      <div className="flex-1 bg-white flex items-center justify-center">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SidebarDrawer;
