// src/components/PersianCalendarPicker.tsx

import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import DynamicModal from "../../utilities/DynamicModal";
import PersianDatePicker from "./PersianDatePicker";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";

interface PersianCalendarPickerProps {
  onMetaChange: (meta: {
    metaType1: string; // "dateonly" | "datetime"
    metaType2: string; // "none" | "today" | "selected" | "dynamic"
    metaType3: string; // تاریخ میلادی به صورت رشته
    metaType4?: string;
  }) => void;
  data?: {
    metaType1?: string; // "dateonly" یا "datetime"
    metaType2?: string; // "none" | "today" | "selected" | "dynamic"
    metaType3?: string; // مقدار میلادی ذخیره‌شده (یا "dynamic")
    metaType4?: string;
  };
}

const PersianCalendarPicker: React.FC<PersianCalendarPickerProps> = ({
  onMetaChange,
  data,
}) => {
  const [format, setFormat] = useState<"dateOnly" | "dateTime">("dateOnly");
  const [defaultValue, setDefaultValue] = useState<"none" | "today" | "selected">("none");
  const [isDynamic, setIsDynamic] = useState(false);

  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
  const [tempSelectedDate, setTempSelectedDate] = useState<DateObject | null>(null);

  const [selectedTime, setSelectedTime] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({
    hours: "",
    minutes: "",
    seconds: "",
  });
  const [tempSelectedTime, setTempSelectedTime] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({
    hours: "",
    minutes: "",
    seconds: "",
  });

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new DateObject({ calendar: persian, locale: persian_fa }).monthIndex.toString()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new DateObject({ calendar: persian, locale: persian_fa }).year.toString()
  );

  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);

  const formatPersian = (date: DateObject) =>
    date.convert(persian).format("YYYY/MM/DD");

  const formatTime = (time: {
    hours: string;
    minutes: string;
    seconds: string;
  }) => {
    const h = time.hours ? time.hours.padStart(2, "0") : "00";
    const m = time.minutes ? time.minutes.padStart(2, "0") : "00";
    const s = time.seconds ? time.seconds.padStart(2, "0") : "00";
    return `${h}:${m}:${s}`;
  };

  const toGregorianString = (
    date: DateObject | null,
    time: { hours: string; minutes: string; seconds: string }
  ) => {
    if (!date) return "";
    const gDate = date.convert(gregorian);
    const year = gDate.year;
    const month = String(gDate.month).padStart(2, "0");
    const day = String(gDate.day).padStart(2, "0");
    const h = time.hours ? time.hours.padStart(2, "0") : "00";
    const m = time.minutes ? time.minutes.padStart(2, "0") : "00";
    const s = time.seconds ? time.seconds.padStart(2, "0") : "00";
    return `${year}-${month}-${day} ${h}:${m}:${s}`;
  };

  useEffect(() => {
    if (!data) return;
    if (data.metaType1) {
      setFormat(
        data.metaType1.toLowerCase() === "datetime" ? "dateTime" : "dateOnly"
      );
    }
    if (data.metaType2 === "dynamic") {
      setIsDynamic(true);
      setDefaultValue("today");
    } else if (data.metaType2 === "selected") {
      setDefaultValue("selected");
    } else if (data.metaType2 === "today") {
      setDefaultValue("today");
    } else {
      setDefaultValue("none");
    }
    if (data.metaType3 && data.metaType3.trim().toLowerCase() !== "dynamic") {
      const [datePart, timePart] = data.metaType3.split(" ");
      if (datePart) {
        const [yy, mm, dd] = datePart.split("-");
        const pDate = new DateObject({
          year: Number(yy),
          month: Number(mm),
          day: Number(dd),
          calendar: gregorian,
        }).convert(persian);
        setSelectedDate(pDate);
        setSelectedMonth(pDate.monthIndex.toString());
        setSelectedYear(pDate.year.toString());
      }
      if (timePart) {
        const [hh, mn, sc] = timePart.split(":");
        setSelectedTime({
          hours: hh || "",
          minutes: mn || "",
          seconds: sc || "00",
        });
      }
    } else if (data.metaType3 && data.metaType3.trim().toLowerCase() === "dynamic") {
      setIsDynamic(true);
      setDefaultValue("today");
    }
  }, []);

  useEffect(() => {
    const metaType1 = format === "dateTime" ? "datetime" : "dateonly";
    const metaType2 = defaultValue;
    let metaType3 = "";

    if (isDynamic) {
      metaType3 = "dynamic";
    } else if (defaultValue === "selected" && selectedDate) {
      metaType3 = toGregorianString(selectedDate, selectedTime);
    }
    onMetaChange({
      metaType1,
      metaType2,
      metaType3,
      metaType4: data?.metaType4 || "",
    });
  }, [format, defaultValue, selectedDate, selectedTime, isDynamic]);

  const handleDefaultValueChange = (val: "none" | "today" | "selected") => {
    setDefaultValue(val);
    if (val === "none") {
      setIsDynamic(false);
      setSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
    } else if (val === "today") {
      setIsDynamic(false);
      setSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
    } else if (val === "selected") {
      setIsDynamic(false);
      setSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
    }
  };

  const handleDynamicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDynamic(e.target.checked);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isDynamic) {
      timer = setInterval(() => {
        const now = new DateObject({ calendar: persian, locale: persian_fa });
        setSelectedDate(now);
        setSelectedMonth(now.monthIndex.toString());
        setSelectedYear(now.year.toString());
        setSelectedTime({
          hours: now.hour.toString().padStart(2, "0"),
          minutes: now.minute.toString().padStart(2, "0"),
          seconds: "00",
        });
      }, 30000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDynamic]);

  const handleDateChange = (date: DateObject | null) => {
    setTempSelectedDate(date);
  };
  const handleSelectDate = () => {
    setSelectedDate(tempSelectedDate);
    setDefaultValue("selected");
    setIsDateModalOpen(false);
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      let val = value;
      if (name === "hours" && parseInt(val, 10) > 23) val = "23";
      if ((name === "minutes" || name === "seconds") && parseInt(val, 10) > 59)
        val = "59";
      setTempSelectedTime((prev) => ({
        ...prev,
        [name]: val.slice(0, 2),
      }));
    }
  };
  const handleTimeKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef: React.RefObject<HTMLInputElement> | null
  ) => {
    if (e.key === "Tab" && nextRef?.current) {
      nextRef.current.focus();
      e.preventDefault();
    }
  };
  const handleTimeChange = () => {
    setSelectedTime(tempSelectedTime);
    setIsTimeModalOpen(false);
  };

  useEffect(() => {
    if (isDateModalOpen) {
      setTempSelectedDate(selectedDate || new DateObject({ calendar: persian, locale: persian_fa }));
    }
  }, [isDateModalOpen, selectedDate]);

  useEffect(() => {
    if (isTimeModalOpen) {
      setTempSelectedTime(selectedTime);
    }
  }, [isTimeModalOpen, selectedTime]);

  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date and Time Format:
        </label>
        <div className="flex space-x-6">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="format"
              value="dateOnly"
              checked={format === "dateOnly"}
              onChange={() => setFormat("dateOnly")}
              className="form-radio text-blue-600 h-4 w-4"
            />
            <span className="ml-2 text-gray-700">Date Only</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="format"
              value="dateTime"
              checked={format === "dateTime"}
              onChange={() => setFormat("dateTime")}
              className="form-radio text-blue-600 h-4 w-4"
            />
            <span className="ml-2 text-gray-700">Date & Time</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Value:
        </label>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="defaultValue"
              value="none"
              checked={defaultValue === "none"}
              onChange={() => handleDefaultValueChange("none")}
              className="form-radio text-blue-600 h-4 w-4"
            />
            <span className="text-gray-700">None</span>
          </label>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="defaultValue"
                value="today"
                checked={defaultValue === "today"}
                onChange={() => handleDefaultValueChange("today")}
                className="form-radio text-blue-600 h-4 w-4"
              />
              <span className="text-gray-700">Today's Date</span>
            </label>
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                name="isDynamic"
                checked={isDynamic}
                onChange={handleDynamicChange}
                disabled={defaultValue !== "today"}
                className="form-checkbox text-blue-600 h-4 w-4"
              />
              <span className="text-gray-700">Is Dynamic</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="dateOption"
            value="dateOption1"
            className="form-radio text-blue-600 h-4 w-4"
            checked={defaultValue === "selected"}
            onChange={() => {
              setIsDateModalOpen(true);
              setDefaultValue("selected");
            }}
          />
          <div className="relative w-64">
            <input
              type="button"
              value={selectedDate ? formatPersian(selectedDate) : ""}
              onClick={() => {
                setIsDateModalOpen(true);
                setDefaultValue("selected");
              }}
              placeholder="تاریخ را انتخاب کنید"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm
                         cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              readOnly
              onBlur={() => {
                if (defaultValue === "selected" && tempSelectedDate) {
                  setSelectedDate(tempSelectedDate);
                }
              }}
            />
            <FaCalendarAlt
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => {
                setIsDateModalOpen(true);
                setDefaultValue("selected");
              }}
            />
          </div>
        </label>
        <div className="relative w-48">
          <input
            type="text"
            value={
              selectedTime.hours || selectedTime.minutes || selectedTime.seconds
                ? `${selectedTime.hours.padStart(
                    2,
                    "0"
                  )}:${selectedTime.minutes.padStart(
                    2,
                    "0"
                  )}:${selectedTime.seconds.padStart(2, "0")}`
                : ""
            }
            onClick={() => setIsTimeModalOpen(true)}
            placeholder="ساعت را انتخاب کنید"
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm
                       cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            readOnly
          />
          <FaClock
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={() => setIsTimeModalOpen(true)}
          />
        </div>
      </div>

      <DynamicModal
        isOpen={isDateModalOpen}
        onClose={() => {
          if (tempSelectedDate) {
            setSelectedDate(tempSelectedDate);
            setDefaultValue("selected");
          }
          setIsDateModalOpen(false);
        }}
      >
        <PersianDatePicker
          selectedDate={tempSelectedDate}
          onDateChange={handleDateChange}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={handleSelectDate}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            انتخاب تاریخ
          </button>
        </div>
      </DynamicModal>

      <DynamicModal
        isOpen={isTimeModalOpen}
        onClose={() => {
          if (tempSelectedTime) {
            setSelectedTime(tempSelectedTime);
          }
          setIsTimeModalOpen(false);
        }}
      >
        <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
            انتخاب ساعت
          </h2>
          {tempSelectedTime.hours ||
          tempSelectedTime.minutes ||
          tempSelectedTime.seconds ? (
            <div className="mb-4 text-center">
              <span className="text-lg font-medium text-pink-600">
                {formatTime(tempSelectedTime)}
              </span>
            </div>
          ) : (
            <div className="mb-4 text-center">
              <span className="text-lg font-medium text-gray-500">
                ساعت انتخاب نشده
              </span>
            </div>
          )}
          <div className="flex justify-center space-x-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                HH
              </label>
              <input
                type="text"
                name="hours"
                value={tempSelectedTime.hours}
                onChange={handleTimeInputChange}
                onKeyDown={(e) => handleTimeKeyDown(e, minuteRef)}
                ref={hourRef}
                placeholder="00"
                maxLength={2}
                className="w-16 mx-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                onBlur={() => setSelectedTime(tempSelectedTime)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                MM
              </label>
              <input
                type="text"
                name="minutes"
                value={tempSelectedTime.minutes}
                onChange={handleTimeInputChange}
                onKeyDown={(e) => handleTimeKeyDown(e, secondRef)}
                ref={minuteRef}
                placeholder="00"
                maxLength={2}
                className="w-16 mx-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                onBlur={() => {
                  if (defaultValue === "selected") {
                    setSelectedTime(tempSelectedTime);
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                SS
              </label>
              <input
                type="text"
                name="seconds"
                value={tempSelectedTime.seconds}
                onChange={handleTimeInputChange}
                onKeyDown={(e) => handleTimeKeyDown(e, null)}
                ref={secondRef}
                placeholder="00"
                maxLength={2}
                className="w-16 mx-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                onBlur={() => {
                  if (defaultValue === "selected") {
                    setSelectedTime(tempSelectedTime);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={handleTimeChange}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              ذخیره ساعت
            </button>
          </div>
        </div>
      </DynamicModal>
    </div>
  );
};

export default PersianCalendarPicker;
