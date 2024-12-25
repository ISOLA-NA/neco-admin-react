// src/components/Header.tsx

import React from "react";

interface DrawerComponentProps {
  username: string;
}

const Header: React.FC<DrawerComponentProps> = ({ username }) => {
  return (
    <header className="flex justify-between items-center p-1 mx-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-md">
      <div className="flex items-center">
        {/* Logo */}
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src="./images/Neco/logoNeco.jpg"
            alt="Company Logo"
            className="rounded-lg shadow-sm border border-gray-200 bg-white transition-transform transform hover:scale-105 hover:shadow-md"
          />
        </div>
      </div>
      {/* Centered Title */}
      <h4 className="text-white text-sm font-semibold">
        NECO Organizational Project Management System
      </h4>
      {/* Profile */}
      <div className="flex items-center">
        <span className="text-white text-sm font-medium mr-2">{username}</span>
        <span className="text-white text-xl">👤</span>
      </div>
    </header>
  );
};

export default Header;
