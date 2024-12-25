// src/components/SidebarDrawer.tsx

import React from "react";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose, onLogout }) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* بخش دراور */}
      <div className="relative w-80 bg-gradient-to-b from-[#905bf5] to-[#c050d5] p-4 shadow-lg">
        {/* دکمه بستن دراور */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-xl font-bold"
          aria-label="Close Drawer"
        >
          &times;
        </button>
        {/* دکمه Logout */}
        <div className="mt-16">
          <button
            onClick={onLogout}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      </div>
      {/* فضای خالی برای بستن دراور با کلیک خارج */}
      <div
        className="flex-1"
        onClick={onClose}
        aria-label="Close Drawer Area"
      ></div>
    </div>
  );
};

export default SidebarDrawer;
