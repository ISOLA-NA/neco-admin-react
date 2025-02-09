import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import DynamicModal from "../../utilities/DynamicModal";
import PersianDatePicker from "./PersianDatePicker";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// تعریف interface برای prop ها
interface PersianCalendarPickerProps {
  data?: {
    metaType1?: string; // "dateonly" یا "datetime"
    metaType2?: string; // "none"، "today" یا "selected"
    metaType3?: string; // ترکیب تاریخ و زمان (مثلاً "1399/01/01 12:30:00")
    metaType4?: string; // (در صورت نیاز)
  };
  onMetaChange?: (meta: {
    metaType1: string;
    metaType2: string;
    metaType3: string;
    metaType4: string;
  }) => void;
}

const PersianCalendarPicker: React.FC<PersianCalendarPickerProps> = ({ data, onMetaChange }) => {
  // وضعیت فرمت: فقط تاریخ یا تاریخ و زمان
  const [format, setFormat] = useState<"dateOnly" | "dateTime">("dateOnly");
  // وضعیت مقدار پیش‌فرض: "none" (هیچ‌کدام)، "today" (امروز) یا "selected" (توسط کاربر انتخاب شده)
  const [defaultValue, setDefaultValue] = useState<"none" | "today" | "selected">("none");
  // وضعیت پویا بودن (IsDynamic) – در صورت تیک خوردن
  const [isDynamic, setIsDynamic] = useState(false);

  // مدیریت تاریخ انتخاب‌شده
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
  const [tempSelectedDate, setTempSelectedDate] = useState<DateObject | null>(null);

  // مدیریت زمان انتخاب‌شده
  const [selectedTime, setSelectedTime] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({ hours: "", minutes: "", seconds: "" });
  const [tempSelectedTime, setTempSelectedTime] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({ hours: "", minutes: "", seconds: "" });

  // وضعیت باز بودن مودال‌های انتخاب تاریخ و زمان
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  // نگهداری ماه و سال انتخاب‌شده (برای PersianDatePicker)
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  // رفرنس‌های ورودی زمان جهت انتقال فوکوس
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);

  // در صورتی که فرمت "فقط تاریخ" انتخاب شده باشد، زمان پاک می‌شود
  useEffect(() => {
    if (format === "dateOnly") {
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
      setTempSelectedTime({ hours: "", minutes: "", seconds: "" });
    }
  }, [format]);

  // تغییرات در مقدار پیش‌فرض
  useEffect(() => {
    if (defaultValue === "none") {
      setIsDynamic(false);
      setSelectedDate(null);
      setTempSelectedDate(null);
      setSelectedYear("");
      setSelectedMonth("");
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
      setTempSelectedTime({ hours: "", minutes: "", seconds: "" });
    } else if (defaultValue === "today") {
      setIsDynamic(true);
      const today = new DateObject({ calendar: persian, locale: persian_fa });
      setSelectedDate(today);
      setTempSelectedDate(today);
      // بررسی ایمن برای مقدار سال و ماه
      setSelectedYear(typeof today.year === "number" ? today.year.toString() : "");
      setSelectedMonth(today.month && typeof today.month.number === "number" ? (today.month.number - 1).toString() : "");
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
      setTempSelectedTime({ hours: "", minutes: "", seconds: "" });
    }
  }, [defaultValue]);

  // مقداردهی اولیه برای تاریخ موقت هنگام باز شدن مودال انتخاب تاریخ
  useEffect(() => {
    if (isDateModalOpen) {
      if (selectedDate && selectedDate.month && typeof selectedDate.month.number === "number") {
        setTempSelectedDate(selectedDate);
        setSelectedMonth((selectedDate.month.number - 1).toString());
        setSelectedYear(typeof selectedDate.year === "number" ? selectedDate.year.toString() : "");
      } else {
        const today = new DateObject({ calendar: persian, locale: persian_fa });
        setTempSelectedDate(today);
        setSelectedMonth(today.month && typeof today.month.number === "number" ? (today.month.number - 1).toString() : "");
        setSelectedYear(typeof today.year === "number" ? today.year.toString() : "");
      }
    }
  }, [isDateModalOpen, selectedDate]);

  // مقداردهی اولیه برای زمان موقت هنگام باز شدن مودال انتخاب زمان
  useEffect(() => {
    if (isTimeModalOpen) {
      setTempSelectedTime(selectedTime);
    }
  }, [isTimeModalOpen, selectedTime]);

  // تابع تغییر مقدار پیش‌فرض (مانند "none" یا "today")
  const handleDefaultValueChange = (value: "none" | "today" | "selected") => {
    setDefaultValue(value);
    if (value === "today") {
      setIsDynamic(true);
      const today = new DateObject({ calendar: persian, locale: persian_fa });
      setSelectedDate(today);
      setTempSelectedDate(today);
      setSelectedYear(typeof today.year === "number" ? today.year.toString() : "");
      setSelectedMonth(today.month && typeof today.month.number === "number" ? (today.month.number - 1).toString() : "");
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
      setTempSelectedTime({ hours: "", minutes: "", seconds: "" });
    } else if (value === "none") {
      setSelectedDate(null);
      setTempSelectedDate(null);
      setSelectedYear("");
      setSelectedMonth("");
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
      setTempSelectedTime({ hours: "", minutes: "", seconds: "" });
      setIsDynamic(false);
    }
  };

  // هنگام انتخاب تاریخ از مودال، تاریخ انتخاب می‌شود و حالت پیش‌فرض به "selected" تغییر می‌کند
  const handleSelectDate = () => {
    if (tempSelectedDate) {
      setSelectedDate(tempSelectedDate);
      setSelectedMonth(
        tempSelectedDate.month && typeof tempSelectedDate.month.number === "number"
          ? (tempSelectedDate.month.number - 1).toString()
          : ""
      );
      setSelectedYear(typeof tempSelectedDate.year === "number" ? tempSelectedDate.year.toString() : "");
      setDefaultValue("selected");
    }
    setIsDateModalOpen(false);
  };

  // ذخیره زمان انتخاب شده از مودال
  const handleTimeChange = () => {
    setSelectedTime(tempSelectedTime);
    setIsTimeModalOpen(false);
  };

  // هندلر تغییر ورودی‌های زمان (تنها اعداد مجاز و حداکثر دو رقم)
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      let val = value;
      if (name === "hours") {
        if (parseInt(val, 10) > 23) val = "23";
      } else {
        if (parseInt(val, 10) > 59) val = "59";
      }
      setTempSelectedTime((prev) => ({
        ...prev,
        [name]: val.slice(0, 2),
      }));
    }
  };

  // انتقال فوکوس بین ورودی‌های زمان
  const handleTimeKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef: React.RefObject<HTMLInputElement> | null
  ) => {
    if (e.key === "Tab" && nextRef && nextRef.current) {
      nextRef.current.focus();
      e.preventDefault();
    }
  };

  // در صورت دریافت داده از بیرون (prop.data) مقادیر اولیه تنظیم می‌شود
  useEffect(() => {
    if (data) {
      if (data.metaType1) {
        setFormat(data.metaType1 === "dateonly" ? "dateOnly" : "dateTime");
      }
      if (data.metaType2) {
        setDefaultValue(data.metaType2 as "none" | "today" | "selected");
      }
      if (data.metaType3) {
        const parts = data.metaType3.split(" ");
        if (parts[0]) {
          const dateObj = new DateObject({ date: parts[0], calendar: persian, locale: persian_fa });
          setSelectedDate(dateObj);
          setTempSelectedDate(dateObj);
          setSelectedYear(typeof dateObj.year === "number" ? dateObj.year.toString() : "");
          setSelectedMonth(
            dateObj.month && typeof dateObj.month.number === "number"
              ? (dateObj.month.number - 1).toString()
              : ""
          );
        }
        if (parts[1]) {
          const timeParts = parts[1].split(":");
          setSelectedTime({
            hours: timeParts[0] || "",
            minutes: timeParts[1] || "",
            seconds: timeParts[2] || "",
          });
          setTempSelectedTime({
            hours: timeParts[0] || "",
            minutes: timeParts[1] || "",
            seconds: timeParts[2] || "",
          });
        }
      }
    }
  }, [data]);

  // انتشار (emit) مقادیر meta به صورت شیء با استفاده از onMetaChange
  useEffect(() => {
    if (onMetaChange) {
      const meta = {
        // metaType1: فرمت تاریخ ("dateonly" یا "datetime")
        metaType1: format === "dateOnly" ? "dateonly" : "datetime",
        // metaType2: مقدار پیش‌فرض ("none"، "today" یا "selected")
        metaType2: defaultValue,
        // metaType3: در صورت انتخاب دستی (و نبودن حالت پویا) تاریخ (و زمان در صورت "dateTime")
        metaType3: isDynamic
          ? "dynamic"
          : (selectedDate ? selectedDate.format("YYYY/MM/DD") : "") +
            (format === "dateTime" &&
            selectedTime.hours &&
            selectedTime.minutes &&
            selectedTime.seconds
              ? " " +
                `${selectedTime.hours.padStart(2, "0")}:${selectedTime.minutes.padStart(2, "0")}:${selectedTime.seconds.padStart(2, "0")}`
              : ""),
        // metaType4: اگر در prop.data موجود باشد (در این مثال خالی باقی مانده)
        metaType4: data && data.metaType4 ? data.metaType4 : "",
      };
      onMetaChange(meta);
    }
  }, [format, defaultValue, isDynamic, selectedDate, selectedTime, data, onMetaChange]);

  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg space-y-8">
      {/* انتخاب فرمت تاریخ و زمان */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          فرمت تاریخ و زمان:
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
            <span className="ml-2 text-gray-700">فقط تاریخ</span>
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
            <span className="ml-2 text-gray-700">تاریخ و زمان</span>
          </label>
        </div>
      </div>

      {/* انتخاب مقدار پیش‌فرض */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          مقدار پیش‌فرض:
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
            <span className="text-gray-700">هیچ‌کدام</span>
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
            <span className="text-gray-700">امروز</span>
            <input
              type="checkbox"
              name="isDynamic"
              checked={isDynamic}
              onChange={() => setIsDynamic(!isDynamic)}
              className="form-checkbox text-blue-600 h-4 w-4"
              disabled={defaultValue === "none"}
            />
            <span className="text-gray-700">پویا</span>
          </label>
        </div>
      </div>

      {/* ورودی‌های تاریخ و زمان */}
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
              value={selectedDate ? selectedDate.format("YYYY/MM/DD") : ""}
              onClick={() => {
                setIsDateModalOpen(true);
                setDefaultValue("selected");
              }}
              placeholder="انتخاب تاریخ"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <div className="relative w-48">
          <input
            type="text"
            value={
              selectedTime.hours && selectedTime.minutes && selectedTime.seconds
                ? `${selectedTime.hours.padStart(2, "0")}:${selectedTime.minutes.padStart(2, "0")}:${selectedTime.seconds.padStart(2, "0")}`
                : ""
            }
            onClick={() => setIsTimeModalOpen(true)}
            placeholder="انتخاب زمان"
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            readOnly
          />
          <FaClock
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={() => setIsTimeModalOpen(true)}
          />
        </div>
      </div>

      {/* مودال انتخاب تاریخ */}
      <DynamicModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
      >
        <PersianDatePicker
          selectedDate={tempSelectedDate}
          onDateChange={setTempSelectedDate}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={handleSelectDate}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            انتخاب تاریخ
          </button>
        </div>
      </DynamicModal>

      {/* مودال انتخاب زمان */}
      <DynamicModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
      >
        <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
            انتخاب زمان
          </h2>
          {tempSelectedTime.hours ||
          tempSelectedTime.minutes ||
          tempSelectedTime.seconds ? (
            <div className="mb-4 text-center">
              <span className="text-lg font-medium text-pink-600">
                {`${tempSelectedTime.hours.padStart(2, "0")}:${tempSelectedTime.minutes.padStart(2, "0")}:${tempSelectedTime.seconds.padStart(2, "0")}`}
              </span>
            </div>
          ) : (
            <div className="mb-4 text-center">
              <span className="text-lg font-medium text-gray-500">
                زمان انتخاب نشده
              </span>
            </div>
          )}
          <div className="flex justify-center space-x-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                ساعت
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
                className="w-16 mx-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                دقیقه
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
                className="w-16 mx-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                ثانیه
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
              ذخیره زمان
            </button>
          </div>
        </div>
      </DynamicModal>
    </div>
  );
};

export default PersianCalendarPicker;
