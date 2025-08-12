import React, { useState, useLayoutEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Info from "./Info";
import Account from "./account";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

// تشخیص جهت سند با در نظر گرفتن تمام سناریوها
const detectRTL = (): boolean => {
  if (typeof window === "undefined") return false; // SSR
  const rootAttr = document.documentElement.getAttribute("dir");
  const bodyAttr = document.body.getAttribute("dir");
  const attrDir = (rootAttr || bodyAttr || "").toLowerCase();
  if (attrDir) return attrDir === "rtl";
  return (
    window.getComputedStyle(document.documentElement).direction === "rtl" ||
    window.getComputedStyle(document.body).direction === "rtl"
  );
};

const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState<"info" | "account">("info");
  const [isRTL, setIsRTL] = useState<boolean>(detectRTL);

  useLayoutEffect(() => {
    const observer = new MutationObserver(() => {
      setIsRTL(detectRTL());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
    return () => observer.disconnect();
  }, []);

  const renderTabContent = () => (activeTab === "info" ? <Info /> : <Account />);

  // Framer Motion variants for the drawer sliding
  const variants = {
    hidden: (rtl: boolean) => ({ x: rtl ? '100%' : '-100%' }),
    visible: { x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial="hidden"
          animate="visible"
          exit="hidden"
          custom={isRTL}
          variants={variants}
          transition={{ type: 'tween', duration: 0.3 }}
        >
          {/* نوار کناری */}
          <motion.div
            className="relative w-60 bg-gradient-to-b from-[#905bf5] to-[#c050d5] p-4 shadow-lg flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* دکمه بستن */}
            <button
              onClick={onClose}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-white text-xl font-bold`}
              aria-label="Close Drawer"
            >
              &times;
            </button>

            {/* دکمه‌های تب و خروج */}
            <div className="mt-16 flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full px-4 py-2 rounded ${
                  activeTab === 'info' ? 'bg-white text-black' : 'bg-transparent text-white'
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full px-4 py-2 rounded ${
                  activeTab === 'account' ? 'bg-white text-black' : 'bg-transparent text-white'
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
          </motion.div>

          {/* ناحیه محتوا */}
          <motion.div
            className={`flex-1 bg-white flex items-center justify-center p-4 ${isRTL ? 'text-right' : 'text-left'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SidebarDrawer;
