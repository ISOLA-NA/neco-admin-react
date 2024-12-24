// src/components/Views/tab/TabbedInterface.tsx
import React, { useRef, useEffect } from "react";
import SubTabs from "../../Views/tab/SubTabs";
import { useSubTabContext } from "../../../context/SubTabContext";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import { useNavigate } from "react-router-dom";
import DrawerComponent from "../tab/Header";
import SidebarDrawer from "../tab/SidebarDrawer";
import { Configuration, ProgramType } from "../../../services/api.services";

interface TabbedInterfaceProps {
  onLogout: () => void;
}

const TabbedInterface: React.FC<TabbedInterfaceProps> = ({ onLogout }) => {
  const { activeSubTab, data, loading, error } = useSubTabContext();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const navigate = useNavigate();
  const subTabsRef = useRef<HTMLDivElement>(null);

  const handleLogoutClick = () => {
    onLogout();
    showAlert("success", null, "خروج", "شما با موفقیت خارج شدید.");
    navigate("/login");
    setIsDrawerOpen(false);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isDrawerOpen]);

  return (
    <>
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onLogout={handleLogoutClick}
      />

      <div
        className={`w-full h-screen flex flex-col bg-gray-100 overflow-x-hidden transition-filter duration-300 ${
          isDrawerOpen ? "filter blur-sm" : ""
        }`}
      >
        <DrawerComponent username="Hasanzade" />

        <SubTabs />

        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{activeSubTab}</h1>
            <button
              onClick={handleLogoutClick}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              خروج
            </button>
          </div>

          <div className="mt-4">
            {loading && <p>در حال بارگذاری...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && data && (
              <div>
                {activeSubTab === 'Configurations' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">تنظیمات</h2>
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr>
                          <th className="py-2">شناسه</th>
                          <th className="py-2">نام</th>
                          <th className="py-2">اولین قالب برنامه</th>
                          <th className="py-2">توضیحات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data as Configuration[]).map((config) => (
                          <tr key={config.ID} className="text-center">
                            <td className="py-2">{config.ID}</td>
                            <td className="py-2">{config.Name}</td>
                            <td className="py-2">{config.FirstIDProgramTemplate}</td>
                            <td className="py-2">{config.Description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {activeSubTab === 'ProgramTypes' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">انواع برنامه</h2>
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr>
                          <th className="py-2">شناسه</th>
                          <th className="py-2">نام</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data as ProgramType[]).map((programType) => (
                          <tr key={programType.ID} className="text-center">
                            <td className="py-2">{programType.ID}</td>
                            <td className="py-2">{programType.Name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TabbedInterface;
