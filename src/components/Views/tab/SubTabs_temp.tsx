// src/components/SubTabs.tsx
import React from "react";
import { useSubTabContext } from '../../../context/SubTabContext';

const subtabIcons: { [key: string]: string } = {
  Configurations: "/images/general/setting.png",
  ProgramTypes: "/images/approval/check.png",
};

const SubTabs: React.FC = () => {
  const { activeSubTab, setActiveSubTab } = useSubTabContext();
  const subtabs = ["Configurations", "ProgramTypes"];

  return (
    <div className="relative mt-1 mx-4">
      <div
        className="flex items-start space-x-5 overflow-x-auto px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 rounded-lg shadow-md"
      >
        {subtabs.map((subtab) => (
          <button
            key={subtab}
            className="flex flex-col items-center space-y-0.5 p-1.5 text-xs rounded-full relative focus:outline-none"
            onClick={() => setActiveSubTab(subtab)}
          >
            <img
              src={subtabIcons[subtab]}
              alt={`${subtab} icon`}
              className="w-6 h-6 object-cover"
            />
            <span
              className={`inline-block transition-colors duration-300 ${
                activeSubTab === subtab
                  ? "text-white font-medium border-b-2 border-white"
                  : "text-white border-b-2 border-transparent hover:text-indigo-200"
              }`}
            >
              {subtab}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubTabs;
