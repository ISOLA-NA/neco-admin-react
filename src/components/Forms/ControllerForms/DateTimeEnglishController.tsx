// src/components/DateTimeSelector.tsx

import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DynamicModal from "../../utilities/DynamicModal";

interface DateTimeSelectorProps {
  onMetaChange: (meta: {
    metaType1: string;    // "dateonly" یا "datetime"
    metaType2: string;    // "none"، "today"، "selected" یا "dynamic"
    metaType3: string;    // تاریخ و زمان به صورت رشته
    metaType4?: string;
  }) => void;
  data?: {
    metaType1?: string;   // "dateonly" یا "datetime"
    metaType2?: string;   // "none"، "today"، "selected" یا "dynamic"
    metaType3?: string;   // تاریخ و زمان به صورت رشته (یا "dynamic")
    metaType4?: string;
  };
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({ onMetaChange, data }) => {
  // تعیین فرمت: فقط تاریخ یا تاریخ و زمان
  const [format, setFormat] = useState<"dateOnly" | "dateTime">("dateOnly");

  // تعیین مقدار پیش‌فرض: "none" | "today" | "selected"
  const [defaultValue, setDefaultValue] = useState<"none" | "today" | "selected">("none");

  // آیا مقدار به‌صورت داینامیک تغییر می‌کند؟
  const [isDynamic, setIsDynamic] = useState(false);

  // تاریخ انتخاب شده
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);

  // زمان انتخاب شده
  const [selectedTime, setSelectedTime] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: "",
    minutes: "",
    seconds: "",
  });
  const [tempSelectedTime, setTempSelectedTime] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: "",
    minutes: "",
    seconds: "",
  });

  // وضعیت مودال‌ها
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  // برای DatePicker (غیرفعال اگر نمی‌خواهید)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // رفرنس‌های اینپوت زمان
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);

  // --- تابع قالب‌بندی تاریخ ---
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // --- تابع قالب‌بندی زمان ---
  const formatTime = (time: { hours: string; minutes: string; seconds: string }) => {
    const h = time.hours ? time.hours.padStart(2, "0") : "00";
    const m = time.minutes ? time.minutes.padStart(2, "0") : "00";
    const s = time.seconds ? time.seconds.padStart(2, "0") : "00";
    return `${h}:${m}:${s}`;
  };

  // فقط یکبار در mount از data بخوانید
  useEffect(() => {
    if (!data) return;

    // metaType1 => تعیین فرمت
    if (data.metaType1) {
      setFormat(data.metaType1.toLowerCase() === "datetime" ? "dateTime" : "dateOnly");
    }

    // metaType2 => تعیین مقدار پیش‌فرض یا داینامیک
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

    // metaType3 => تعیین تاریخ و زمان (اگر dynamic نباشد)
    if (data.metaType3 && data.metaType3.trim().toLowerCase() !== "dynamic") {
      const [datePart, timePart] = data.metaType3.split(" ");
      if (datePart) {
        const [yy, mm, dd] = datePart.split("-");
        const newDate = new Date(Number(yy), Number(mm) - 1, Number(dd));
        if (!isNaN(newDate.getTime())) {
          setSelectedDate(newDate);
        }
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
      // اگر explicitly نوشته شده بود "dynamic"
      setIsDynamic(true);
      setDefaultValue("today");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // فقط یک بار در mount

  // هر بار که state داخلی تغییر کرد، آن را به والد بفرست
  useEffect(() => {
    const metaType1 = (format === "dateTime") ? "datetime" : "dateonly";
    const metaType2 = isDynamic ? "dynamic" : defaultValue;

    let metaType3 = "dynamic";
    if (selectedDate) {
      const dateStr = formatDate(selectedDate);
      const timeStr = formatTime(selectedTime);
      metaType3 = `${dateStr} ${timeStr}`;
    }

    onMetaChange({
      metaType1,
      metaType2,
      metaType3,
      metaType4: data?.metaType4 || "",
    });
  }, [
    format,
    defaultValue,
    selectedDate,
    selectedTime,
    isDynamic,
    // از قرار دادن data یا onMetaChange در این dependency خودداری کنید
    // چرا که ممکن است loop ایجاد شود اگر پدر در پاسخ این data را تغییر دهد
  ]); 

  // تابع تغییر مقدار پیش‌فرض 
  const handleDefaultValueChange = (val: "none" | "today" | "selected") => {
    setDefaultValue(val);

    if (val === "none") {
      setIsDynamic(false);
      setSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
    } else if (val === "today") {
      setIsDynamic(true);
      const now = new Date();
      setSelectedDate(now);
      setTempSelectedDate(now);
      setSelectedTime({
        hours: String(now.getHours()),
        minutes: String(now.getMinutes()),
        seconds: String(now.getSeconds()),
      });
      setTempSelectedTime({
        hours: String(now.getHours()),
        minutes: String(now.getMinutes()),
        seconds: String(now.getSeconds()),
      });
    } else if (val === "selected") {
      setIsDynamic(false);
      setSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
    }
  };

  // تابع تغییر داینامیک
  const handleDynamicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDynamic(e.target.checked);
  };

  // اگر isDynamic فعال باشد، هر 30 ثانیه زمان را آپدیت کن
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isDynamic) {
      timer = setInterval(() => {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, "0");
        setSelectedDate(now);
        setSelectedTime({
          hours: pad(now.getHours()),
          minutes: pad(now.getMinutes()),
          seconds: "00",
        });
      }, 30000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDynamic]);

  // باز کردن مودال تاریخ
  const handleDateChange = (date: Date | null) => {
    setTempSelectedDate(date);
  };
  const handleSelectDate = () => {
    setSelectedDate(tempSelectedDate);
    setDefaultValue("selected");
    setIsDateModalOpen(false);
  };

  // باز کردن مودال زمان
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      let val = value;
      if (name === "hours" && parseInt(val, 10) > 23) val = "23";
      if ((name === "minutes" || name === "seconds") && parseInt(val, 10) > 59) val = "59";
      setTempSelectedTime(prev => ({
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

  // هنگام باز شدن مودال تاریخ
  useEffect(() => {
    if (isDateModalOpen) {
      setTempSelectedDate(selectedDate || new Date());
    }
  }, [isDateModalOpen, selectedDate]);

  // هنگام باز شدن مودال زمان
  useEffect(() => {
    if (isTimeModalOpen) {
      setTempSelectedTime(selectedTime);
    }
  }, [isTimeModalOpen, selectedTime]);

  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg space-y-8">
      {/* انتخاب فرمت تاریخ/زمان */}
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

      {/* انتخاب مقدار پیش‌فرض */}
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

            {/* چک‌باکس Is Dynamic (در حالت ادیت همیشه فعال، در حالت جدید فقط اگر 'today') */}
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                name="isDynamic"
                checked={isDynamic}
                onChange={handleDynamicChange}
                disabled={data ? false : (defaultValue !== "today")}
                className="form-checkbox text-blue-600 h-4 w-4"
              />
              <span className="text-gray-700">Is Dynamic</span>
            </label>
          </div>
        </div>
      </div>

      {/* نمایش تاریخ و زمان */}
      <div className="flex items-center space-x-6">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="dateOption"
            value="dateOption1"
            className="form-radio text-blue-600 h-4 w-4"
            checked={selectedDate !== null}
            onChange={() => {
              setIsDateModalOpen(true);
              setDefaultValue("selected");
            }}
          />
          <div className="relative w-64">
            <input
              type="button"
              value={selectedDate ? formatDate(selectedDate) : ""}
              onClick={() => {
                setIsDateModalOpen(true);
                setDefaultValue("selected");
              }}
              placeholder="Select Date"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm
                         cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              readOnly
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

        {/* اینپوت زمان */}
        <div className="relative w-48">
          <input
            type="text"
            value={
              selectedTime.hours || selectedTime.minutes || selectedTime.seconds
                ? `${selectedTime.hours.padStart(2, "0")}:${selectedTime.minutes.padStart(2, "0")}:${selectedTime.seconds.padStart(2, "0")}`
                : ""
            }
            onClick={() => setIsTimeModalOpen(true)}
            placeholder="Select Time"
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

      {/* مودال DatePicker */}
      <DynamicModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
      >
        <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
            Select a Date
          </h2>

          {tempSelectedDate && (
            <div className="mb-4 text-center">
              <span className="text-lg font-medium text-pink-600">
                {formatDate(tempSelectedDate)}
              </span>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <DatePicker
              selected={tempSelectedDate}
              onChange={handleDateChange}
              inline
              openToDate={new Date(selectedYear, selectedMonth, 1)}
            />
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={handleSelectDate}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Select Date
            </button>
          </div>
        </div>
      </DynamicModal>

      {/* مودال انتخاب زمان */}
      <DynamicModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
      >
        <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
            Select a Time
          </h2>

          {tempSelectedTime.hours || tempSelectedTime.minutes || tempSelectedTime.seconds ? (
            <div className="mb-4 text-center">
              <span className="text-lg font-medium text-pink-600">
                {formatTime(tempSelectedTime)}
              </span>
            </div>
          ) : (
            <div className="mb-4 text-center">
              <span className="text-lg font-medium text-gray-500">
                No Time Selected
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
              Save Time
            </button>
          </div>
        </div>
      </DynamicModal>
    </div>
  );
};

export default DateTimeSelector;
