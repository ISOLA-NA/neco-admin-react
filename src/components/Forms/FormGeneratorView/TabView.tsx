import React, { useState, useMemo, useEffect } from "react";

interface TabViewProps {
  data?: {
    metaType1?: string; // تب‌های انگلیسی (هر خط یک تب)
    metaType2?: string; // تب‌های فارسی (هر خط یک تب)
  };
}

const TabView: React.FC<TabViewProps> = ({ data }) => {
  // تب‌های انگلیسی
  const tabsEn = useMemo(() => {
    return data?.metaType1
      ? data.metaType1
          .split("\n")
          .map((tab) => tab.trim())
          .filter(Boolean)
      : [];
  }, [data]);

  // تب‌های فارسی
  const tabsFa = useMemo(() => {
    return data?.metaType2
      ? data.metaType2
          .split("\n")
          .map((tab) => tab.trim())
          .filter(Boolean)
      : [];
  }, [data]);

  // اندیس تب فعال برای انگلیسی و فارسی (کاملاً مستقل)
  const [activeTabEn, setActiveTabEn] = useState<number>(0);
  const [activeTabFa, setActiveTabFa] = useState<number>(0);

  // ایمن‌سازی اندیس‌ها هنگام تغییر طول آرایه‌ها
  useEffect(() => {
    if (tabsEn.length === 0) {
      setActiveTabEn(0);
    } else if (activeTabEn > tabsEn.length - 1) {
      setActiveTabEn(0);
    }
  }, [tabsEn.length, activeTabEn]);

  useEffect(() => {
    if (tabsFa.length === 0) {
      setActiveTabFa(0);
    } else if (activeTabFa > tabsFa.length - 1) {
      setActiveTabFa(0);
    }
  }, [tabsFa.length, activeTabFa]);

  // کلاس مشترک برای تب‌ها
  const tabClass = (isActive: boolean) =>
    `px-4 py-2 cursor-pointer whitespace-nowrap transition-colors ${
      isActive
        ? "border-b-2 border-blue-500 text-blue-600 font-medium"
        : "text-gray-600 hover:text-gray-800"
    }`;

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-300">
      {/* نوار تب‌های انگلیسی (مستقل) */}
      <div className="flex border-b border-gray-300 mb-4 overflow-x-auto">
        {tabsEn.map((tab, index) => (
          <div
            key={`en-${index}`}
            onClick={() => setActiveTabEn(index)}
            className={tabClass(activeTabEn === index)}
          >
            {tab}
          </div>
        ))}
        {tabsEn.length === 0 && (
          <div className="text-gray-400 text-sm px-2 py-2">(no English tabs)</div>
        )}
      </div>

      {/* نوار تب‌های فارسی (مستقل از انگلیسی) */}
      <div className="flex border-b border-gray-200 mb-1 overflow-x-auto" dir="rtl">
        {tabsFa.map((tab, index) => (
          <div
            key={`fa-${index}`}
            onClick={() => setActiveTabFa(index)}
            className={tabClass(activeTabFa === index)}
            title={tab}
          >
            {tab}
          </div>
        ))}
        {tabsFa.length === 0 && (
          <div className="text-gray-400 text-sm px-2 py-2" dir="ltr">
            (no Persian tabs)
          </div>
        )}
      </div>
    </div>
  );
};

export default TabView;
