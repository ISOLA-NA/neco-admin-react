// src/components/ViewControllers/DateTimeSelectorView.tsx
import React from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

interface DateTimeSelectorViewProps {
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

const convertUSDateToISO = (dateStr: string): string => {
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateStr;
};

const DateTimeSelectorView: React.FC<DateTimeSelectorViewProps> = ({
  data,
  isFaMode = false,
}) => {
  if (!data) return null;

  const label = isFaMode
    ? data.PersianName || data.DisplayName || ""
    : data.DisplayName || data.PersianName || "";

  let dateValue = "";
  let timeValue = "";

  const formatType =
    data.metaType1?.toLowerCase() === "datetime" ? "datetime" : "dateonly";

  const defaultType = data.metaType2 ? data.metaType2.toLowerCase() : "none";

  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];

  const pad = (n: number) => n.toString().padStart(2, "0");
  const currentTime = `${pad(today.getHours())}:${pad(today.getMinutes())}`;

  const rawDate = data.metaType3 ? data.metaType3.trim() : "";

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
    <div>
      {label && (
        <p className="text-xs font-semibold text-gray-800">{label}</p>
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

export default DateTimeSelectorView;