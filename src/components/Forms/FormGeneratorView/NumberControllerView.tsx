// src/components/ViewControllers/DateTimeSelectorView.tsx
import React from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface DateTimeSelectorViewProps {
  data?: {
    metaType1?: string; // "dateonly" یا "datetime"
    metaType2?: string; // "none"، "today" یا "selected"
    metaType3?: string; // برای dateonly: "YYYY-MM-DD" یا "MM/DD/YYYY" یا "YYYY-MM-DD HH:mm:ss" برای datetime
    metaType4?: string;
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

  const formatType =
    data.metaType1?.toLowerCase() === "datetime" ? "datetime" : "dateonly";
  const defaultType = data.metaType2 ? data.metaType2.toLowerCase() : "none";

  // دریافت تاریخ امروز به فرمت ISO (yyyy-mm-dd)
  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];
  // زمان فعلی به فرمت HH:mm
  const pad = (n: number) => n.toString().padStart(2, "0");
  const currentTime = `${pad(today.getHours())}:${pad(today.getMinutes())}`;

  let dateValue = "";
  let timeValue = "";

  // اگر metaType3 وجود نداشته باشد یا شامل "mm/dd/yyyy" باشد، مقدار خالی نمایش داده شود.
  const rawDate = data.metaType3 ? data.metaType3.trim() : "";
  if (rawDate === "" || rawDate.toLowerCase().includes("mm/dd/yyyy")) {
    dateValue = "";
    timeValue = "";
  } else {
    if (formatType === "dateonly") {
      if (defaultType === "today") {
        dateValue = todayISO;
      } else {
        // اگر فرمت شامل "/" باشد، تبدیل شود؛ همچنین اگر رشته طول کافی دارد، 10 کاراکتر اول گرفته شود.
        if (rawDate.includes("/")) {
          dateValue = convertUSDateToISO(rawDate);
        } else if (rawDate.length >= 10) {
          dateValue = rawDate.substring(0, 10);
        } else {
          dateValue = rawDate;
        }
      }
    } else {
      // حالت datetime
      if (defaultType === "today") {
        dateValue = todayISO;
        timeValue = currentTime;
      } else {
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
  }

  return (
    <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg space-y-4">
      {formatType === "dateonly" ? (
        <div>
          <DynamicInput
            name="dateView"
            type="date"
            value={dateValue}
            placeholder=""
            disabled
            className="w-full p-2 border rounded focus:outline-none focus:border-gray-700"
          />
        </div>
      ) : (
        <div className="flex space-x-4">
          <DynamicInput
            name="dateView"
            type="date"
            value={dateValue}
            placeholder=""
            disabled
            className="w-1/2 p-2 border rounded focus:outline-none focus:border-gray-700"
          />
          <DynamicInput
            name="timeView"
            type="time"
            value={timeValue}
            placeholder=""
            disabled
            className="w-1/2 p-2 border rounded focus:outline-none focus:border-gray-700"
          />
        </div>
      )}
    </div>
  );
};

export default DateTimeSelectorView;
