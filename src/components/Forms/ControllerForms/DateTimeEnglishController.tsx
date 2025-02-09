// src/components/DateTimeSelector.tsx
import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DynamicModal from "../../utilities/DynamicModal";

interface DateTimeSelectorProps {
  onMetaChange: (meta: {
    metaType1: string;
    metaType2: string;
    metaType3: string;
    metaType4?: string;
  }) => void;
  data?: {
    metaType1?: string; // "dateonly" یا "datetime"
    metaType2?: string; // "none"، "today" یا "selected"
    metaType3?: string; // تاریخ و زمان به صورت رشته (یا "dynamic")
    metaType4?: string;
  };
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({ onMetaChange, data }) => {
  // حالت‌های مربوط به فرمت تاریخ
  const [format, setFormat] = useState<"dateOnly" | "dateTime">("dateOnly");
  // حالت پیش‌فرض: "none" | "today" | "option1" (که در خروجی به عنوان "selected" ارسال می‌شود)
  const [defaultValue, setDefaultValue] = useState<"none" | "today" | "option1">("none");
  // آیا مقدار به صورت داینامیک تعیین شده باشد؟
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
  // حالت باز بودن مودال‌های تاریخ و زمان
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  // انتخاب ماه و سال (برای مودال تاریخ)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // مراجع ورودی‌های زمان
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);

  // تابعی برای قالب‌بندی تاریخ به صورت YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // قالب‌بندی زمان به صورت HH:mm:ss
  const formatTime = (time: { hours: string; minutes: string; seconds: string }) => {
    const h = time.hours ? time.hours.padStart(2, "0") : "00";
    const m = time.minutes ? time.minutes.padStart(2, "0") : "00";
    const s = time.seconds ? time.seconds.padStart(2, "0") : "00";
    return `${h}:${m}:${s}`;
  };

  // به‌روزرسانی خروجی meta در هر تغییر
  useEffect(() => {
    const metaType1 = format === "dateOnly" ? "dateonly" : "datetime";
    // نگاشت defaultValue: اگر "option1" انتخاب شده باشد، در خروجی به عنوان "selected" ارسال می‌شود.
    const metaType2 = defaultValue === "option1" ? "selected" : defaultValue;
    // اگر تاریخ انتخاب شده باشد، تاریخ و زمان به صورت رشته قالب‌بندی شده؛ در غیر این صورت "dynamic"
    const metaType3 = selectedDate
      ? `${formatDate(selectedDate)} ${formatTime(selectedTime)}`
      : "dynamic";
    onMetaChange({ metaType1, metaType2, metaType3, metaType4: "" });
  }, [format, defaultValue, selectedDate, selectedTime, onMetaChange]);

  // در صورت دریافت مقدار اولیه از prop.data
  useEffect(() => {
    if (data) {
      if (data.metaType1) {
        setFormat(data.metaType1 === "datetime" ? "dateTime" : "dateOnly");
      }
      if (data.metaType2) {
        setDefaultValue(data.metaType2 === "selected" ? "option1" : (data.metaType2 as "none" | "today"));
      }
      if (data.metaType3 && data.metaType3 !== "dynamic") {
        const parts = data.metaType3.split(" ");
        if (parts[0]) {
          const dateParts = parts[0].split("-");
          if (dateParts.length === 3) {
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1;
            const day = parseInt(dateParts[2], 10);
            setSelectedDate(new Date(year, month, day));
          }
        }
        if (parts[1]) {
          const timeParts = parts[1].split(":");
          setSelectedTime({
            hours: timeParts[0] || "",
            minutes: timeParts[1] || "",
            seconds: timeParts[2] || "00",
          });
        }
      } else if (data.metaType3 === "dynamic") {
        setIsDynamic(true);
      }
    }
  }, [data]);

  // تغییر مقدار پیش‌فرض (none, today, یا option1)
  const handleDefaultValueChange = (value: "none" | "today" | "option1") => {
    setDefaultValue(value);
    if (value === "none") {
      setIsDynamic(false);
      setSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
    } else if (value === "today") {
      setIsDynamic(true);
      const now = new Date();
      setSelectedDate(now);
      setTempSelectedDate(now);
      setSelectedTime({
        hours: now.getHours().toString(),
        minutes: now.getMinutes().toString(),
        seconds: now.getSeconds().toString(),
      });
      setTempSelectedTime({
        hours: now.getHours().toString(),
        minutes: now.getMinutes().toString(),
        seconds: now.getSeconds().toString(),
      });
    } else if (value === "option1") {
      setIsDynamic(false);
      setSelectedDate(null);
      setTempSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
      setTempSelectedTime({ hours: "", minutes: "", seconds: "" });
    }
  };

  // تغییر تاریخ در مودال
  const handleDateChange = (date: Date | null) => {
    setTempSelectedDate(date);
    if (date) {
      setSelectedMonth(date.getMonth());
      setSelectedYear(date.getFullYear());
    }
  };

  // تایید تاریخ انتخاب شده
  const handleSelectDate = () => {
    setSelectedDate(tempSelectedDate);
    setIsDateModalOpen(false);
  };

  // تایید زمان انتخاب شده
  const handleTimeChange = () => {
    setSelectedTime(tempSelectedTime);
    setIsTimeModalOpen(false);
  };

  // مدیریت تغییر ورودی‌های زمان
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      let val = value;
      if (name === "hours" && parseInt(val, 10) > 23) {
        val = "23";
      } else if ((name === "minutes" || name === "seconds") && parseInt(val, 10) > 59) {
        val = "59";
      }
      setTempSelectedTime(prev => ({ ...prev, [name]: val.slice(0, 2) }));
    }
  };

  const handleTimeKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef: React.RefObject<HTMLInputElement> | null
  ) => {
    if (e.key === "Tab" && nextRef && nextRef.current) {
      nextRef.current.focus();
      e.preventDefault();
    }
  };

  // هنگامی که مودال تاریخ باز می‌شود، مقدار موقت تاریخ تنظیم می‌شود
  useEffect(() => {
    if (isDateModalOpen) {
      setTempSelectedDate(selectedDate || new Date());
      setSelectedMonth((selectedDate || new Date()).getMonth());
      setSelectedYear((selectedDate || new Date()).getFullYear());
    }
  }, [isDateModalOpen, selectedDate]);

  // هنگامی که مودال زمان باز می‌شود، مقدار موقت زمان تنظیم می‌شود
  useEffect(() => {
    if (isTimeModalOpen) {
      setTempSelectedTime(selectedTime);
    }
  }, [isTimeModalOpen, selectedTime]);

  // لیست سال‌ها (از سال جاری-10 تا سال جاری+10)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  // لیست ماه‌ها
  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg space-y-8">
      {/* انتخاب فرمت تاریخ و زمان */}
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
            <input
              type="checkbox"
              name="isDynamic"
              checked={isDynamic}
              onChange={() => setIsDynamic(!isDynamic)}
              className="form-checkbox text-blue-600 h-4 w-4"
              disabled={defaultValue === "none"}
            />
            <span className="text-gray-700">Is Dynamic</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="defaultValue"
              value="option1"
              checked={defaultValue === "option1"}
              onChange={() => handleDefaultValueChange("option1")}
              className="form-radio text-blue-600 h-4 w-4"
            />
            <span className="text-gray-700">Date Picker</span>
          </label>
        </div>
      </div>

      {/* نمایش همیشگی اینپوت‌های تاریخ و زمان */}
      <div className="flex items-center space-x-6">
        {/* اینپوت تاریخ */}
        <div className="relative w-64">
          <input
            type="text"
            value={selectedDate ? formatDate(selectedDate) : ""}
            onClick={() => setIsDateModalOpen(true)}
            placeholder="Select Date"
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            readOnly
          />
          <FaCalendarAlt
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={() => setIsDateModalOpen(true)}
          />
        </div>
        {/* اینپوت زمان */}
        <div className="relative w-48">
          <input
            type="text"
            value={formatTime(selectedTime)}
            onClick={() => setIsTimeModalOpen(true)}
            placeholder="Select Time"
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            readOnly
          />
          <FaClock
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={() => setIsTimeModalOpen(true)}
          />
        </div>
      </div>

      {/* مودال DatePicker */}
      <DynamicModal isOpen={isDateModalOpen} onClose={() => setIsDateModalOpen(false)}>
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
          <div className="flex justify-center space-x-4 mb-4">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-center">
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
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Select Date
            </button>
          </div>
        </div>
      </DynamicModal>

      {/* مودال TimePicker */}
      <DynamicModal isOpen={isTimeModalOpen} onClose={() => setIsTimeModalOpen(false)}>
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
              <span className="text-lg font-medium text-gray-500">No Time Selected</span>
            </div>
          )}
          <div className="flex justify-center space-x-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">HH</label>
              <input
                type="text"
                name="hours"
                value={tempSelectedTime.hours}
                onChange={handleTimeInputChange}
                onKeyDown={(e) => handleTimeKeyDown(e, minuteRef)}
                ref={hourRef}
                placeholder="00"
                maxLength={2}
                className="w-16 mx-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">MM</label>
              <input
                type="text"
                name="minutes"
                value={tempSelectedTime.minutes}
                onChange={handleTimeInputChange}
                onKeyDown={(e) => handleTimeKeyDown(e, secondRef)}
                ref={minuteRef}
                placeholder="00"
                maxLength={2}
                className="w-16 mx-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">SS</label>
              <input
                type="text"
                name="seconds"
                value={tempSelectedTime.seconds}
                onChange={handleTimeInputChange}
                onKeyDown={(e) => handleTimeKeyDown(e, null)}
                ref={secondRef}
                placeholder="00"
                maxLength={2}
                className="w-16 mx-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              />
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={handleTimeChange}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
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
