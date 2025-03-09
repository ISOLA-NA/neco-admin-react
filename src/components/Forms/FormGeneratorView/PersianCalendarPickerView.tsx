// src/components/ViewControllers/PersianCalendarPickerView.tsx
import React from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";

interface PersianCalendarPickerViewProps {
  data?: {
    metaType1?: string; // "dateonly" یا "datetime"
    metaType2?: string; // "none"، "today" یا "selected"
    metaType3?: string; // تاریخ به فرمت میلادی (مثلاً "2025-01-23 00:00:00")
    metaType4?: string;
    DisplayName?: string;
  };
}

const PersianCalendarPickerView: React.FC<PersianCalendarPickerViewProps> = ({ data }) => {
  if (!data) return null;

  // تعیین نوع نمایش: فقط تاریخ یا تاریخ و زمان
  const formatType = data.metaType1?.toLowerCase() === "datetime" ? "datetime" : "dateonly";
  // حالت پیش‌فرض: "none"، "today" یا "selected"
  const defaultType = data.metaType2 ? data.metaType2.toLowerCase() : "none";

  // ایجاد یک نمونه از تاریخ امروز به صورت شمسی
  const todayPersian = new DateObject({ calendar: persian, locale: persian_fa });
  const todayFormatted = todayPersian.format("jYYYY/jMM/jDD").replace(/j/g, "");

  // تابع صفرپر کردن
  const pad = (n: number) => n.toString().padStart(2, "0");
  // به‌دست آوردن ساعت و دقیقه از todayPersian (اگر مقدار موجود نباشد از زمان سیستم استفاده می‌شود)
  const currentHour = typeof todayPersian.hour === "number" ? todayPersian.hour : new Date().getHours();
  const currentMinute = typeof todayPersian.minute === "number" ? todayPersian.minute : new Date().getMinutes();
  const currentTime = `${pad(currentHour)}:${pad(currentMinute)}`;

  let dateValue = "";
  let timeValue = "";

  if (defaultType === "none") {
    // اگر گزینه "none" انتخاب شده باشد، ورودی کاملاً خالی است
    dateValue = "";
    timeValue = "";
  } else if (!data.metaType3 || data.metaType3.trim() === "" || data.metaType3.toLowerCase().includes("mm/dd/yyyy")) {
    // در صورت خالی بودن metaType3
    if (defaultType === "today") {
      dateValue = todayFormatted;
      if (formatType === "datetime") {
        timeValue = currentTime;
      }
    } else {
      dateValue = "";
      timeValue = "";
    }
  } else {
    // اگر metaType3 مقداری داشته باشد
    const parts = data.metaType3.trim().split(" ");
    if (parts[0]) {
      // ایجاد تاریخ میلادی از بخش تاریخ
      const gregDate = new DateObject({
        date: parts[0],
        calendar: gregorian,
        format: "YYYY-MM-DD",
      });
      // تبدیل به تقویم شمسی
      const persianDate = gregDate.convert(persian);
      dateValue = persianDate.format("jYYYY/jMM/jDD").replace(/j/g, "");
    }
    if (formatType === "datetime" && parts[1] && parts[1].length >= 5) {
      timeValue = parts[1].substring(0, 5);
    }
  }

  return (
    <div className="p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg space-y-4">
      {data.DisplayName && (
        <p className="block text-xs text-gray-600 mb-1">
          {data.DisplayName}
        </p>
      )}
      {formatType === "dateonly" ? (
        <div className="relative">
          <DynamicInput
            name=""
            type="text"
            value={dateValue}
            placeholder=""
            disabled
            className="w-full p-2 pr-10 border rounded focus:outline-none focus:border-gray-700"
          />
          <div className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none">
            <FaCalendarAlt className="text-gray-500" />
          </div>
        </div>
      ) : (
        <div className="flex space-x-4">
          <div className="relative w-1/2">
            <DynamicInput
              name=""
              type="text"
              value={dateValue}
              placeholder=""
              disabled
              className="w-full p-2 pr-10 border rounded focus:outline-none focus:border-gray-700"
            />
            <div className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none">
              <FaCalendarAlt className="text-gray-500" />
            </div>
          </div>
          <div className="relative w-1/2">
            <DynamicInput
              name=""
              type="text"
              value={timeValue}
              placeholder=""
              disabled
              className="w-full p-2 pr-10 border rounded focus:outline-none focus:border-gray-700"
            />
            <div className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none">
              <FaClock className="text-gray-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersianCalendarPickerView;
