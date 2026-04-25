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
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
    metaType4?: string;
    DisplayName?: string;
    PersianName?: string;
  };
  isFaMode?: boolean;
}

const PersianCalendarPickerView: React.FC<PersianCalendarPickerViewProps> = ({
  data,
  isFaMode = false,
}) => {
  if (!data) return null;

  const label = isFaMode
    ? data.PersianName || data.DisplayName || ""
    : data.DisplayName || data.PersianName || "";

  const formatType = data.metaType1?.toLowerCase() === "datetime" ? "datetime" : "dateonly";
  const defaultType = data.metaType2 ? data.metaType2.toLowerCase() : "none";

  const todayPersian = new DateObject({ calendar: persian, locale: persian_fa });
  const todayFormatted = todayPersian.format("jYYYY/jMM/jDD").replace(/j/g, "");

  const pad = (n: number) => n.toString().padStart(2, "0");
  const currentHour = typeof todayPersian.hour === "number" ? todayPersian.hour : new Date().getHours();
  const currentMinute = typeof todayPersian.minute === "number" ? todayPersian.minute : new Date().getMinutes();
  const currentTime = `${pad(currentHour)}:${pad(currentMinute)}`;

  let dateValue = "";
  let timeValue = "";

  if (defaultType === "none") {
    dateValue = "";
    timeValue = "";
  } else if (!data.metaType3 || data.metaType3.trim() === "" || data.metaType3.toLowerCase().includes("mm/dd/yyyy")) {
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
    const parts = data.metaType3.trim().split(" ");
    if (parts[0]) {
      const gregDate = new DateObject({
        date: parts[0],
        calendar: gregorian,
        format: "YYYY-MM-DD",
      });
      const persianDate = gregDate.convert(persian);
      dateValue = persianDate.format("jYYYY/jMM/jDD").replace(/j/g, "");
    }
    if (formatType === "datetime" && parts[1] && parts[1].length >= 5) {
      timeValue = parts[1].substring(0, 5);
    }
  }

  return (
    <div>
      {label && (
        <p className="block text-xs text-gray-600 mb-1">{label}</p>
      )}
      {formatType === "dateonly" ? (
        <div className="relative">
          <DynamicInput
            name=""
            type="text"
            value={dateValue}
            placeholder=""
            disabled
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