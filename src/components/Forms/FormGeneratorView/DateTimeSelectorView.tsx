// src/components/ViewControllers/DateTimeSelectorView.tsx
import React from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

interface DateTimeSelectorViewProps {
  data?: {
    metaType1?: string; // "dateonly" یا "datetime"
    metaType2?: string; // "none"، "date picker" یا "selected"
    metaType3?: string; // برای dateonly: "YYYY-MM-DD" یا "MM/DD/YYYY"؛ برای datetime: "YYYY-MM-DD HH:mm:ss" یا "MM/DD/YYYY HH:mm:ss"
    metaType4?: string;
    DisplayName?: string;
  };
}

// تابع کمکی جهت تبدیل تاریخ از فرمت mm/dd/yyyy به yyyy-mm-dd
const convertUSDateToISO = (dateStr: string): string => {
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateStr;
};

const DateTimeSelectorView: React.FC<DateTimeSelectorViewProps> = ({ data }) => {
  if (!data) return null;

  let dateValue = "";
  let timeValue = "";

  // نوع فیلد: فقط تاریخ یا تاریخ و زمان
  const formatType =
    data.metaType1?.toLowerCase() === "datetime" ? "datetime" : "dateonly";

  // حالت پیش‌فرض: "none"، "date picker" یا "selected"
  const defaultType = data.metaType2 ? data.metaType2.toLowerCase() : "none";

  // تاریخ امروز به فرمت ISO (yyyy-mm-dd)
  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];

  // تابع کمکی صفرپر کردن ساعت و دقیقه
  const pad = (n: number) => n.toString().padStart(2, "0");
  // زمان کنونی به فرمت hh:mm
  const currentTime = `${pad(today.getHours())}:${pad(today.getMinutes())}`;

  const rawDate = data.metaType3 ? data.metaType3.trim() : "";

  // منطق تعیین مقدار ورودی
  if (defaultType === "none") {
    dateValue = "";
    timeValue = "";
  } else if (rawDate === "" || rawDate.toLowerCase().includes("mm/dd/yyyy")) {
    if (defaultType === "date picker") {
      dateValue = todayISO;
      if (formatType === "datetime") {
        timeValue = currentTime;
      }
    } else {
      dateValue = "";
      timeValue = "";
    }
  } else {
    if (formatType === "dateonly") {
      if (rawDate.includes("/")) {
        dateValue = convertUSDateToISO(rawDate);
      } else if (rawDate.length >= 10) {
        dateValue = rawDate.substring(0, 10);
      } else {
        dateValue = rawDate;
      }
    } else {
      // حالت datetime
      const parts = rawDate.split(" ");
      if (parts[0]) {
        if (parts[0].includes("/")) {
          dateValue = convertUSDateToISO(parts[0]);
        } else if (parts[0].length >= 10) {
          dateValue = parts[0].substring(0, 10);
        } else {
          dateValue = parts[0];
        }
      }
      if (parts[1] && parts[1].length >= 5) {
        timeValue = parts[1].substring(0, 5);
      }
    }
  }

  return (
    <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg space-y-4">
      {data.DisplayName && (
        <p className="text-xs font-semibold text-gray-800">
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

export default DateTimeSelectorView;
