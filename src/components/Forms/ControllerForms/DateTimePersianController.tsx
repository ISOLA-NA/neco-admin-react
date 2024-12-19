// src/components/PersianCalendarPicker.tsx
import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import DynamicModal from "../../utilities/DynamicModal";
import PersianDatePicker from "./DatePicker"; // اطمینان از مسیر صحیح وارد کردن
import { DateObject } from "react-multi-date-picker";

const PersianCalendarPicker: React.FC = () => {
  // مدیریت وضعیت فرمت
  const [format, setFormat] = useState<"dateOnly" | "dateTime">("dateOnly");

  // مدیریت مقدار پیش‌فرض
  const [defaultValue, setDefaultValue] = useState<
    "none" | "today" | "option1"
  >("none");
  const [isDynamic, setIsDynamic] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
  const [tempSelectedDate, setTempSelectedDate] = useState<DateObject | null>(
    null
  ); // وضعیت موقتی برای مدال تاریخ
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
  }); // وضعیت موقتی برای مدال زمان
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  // انتخاب ماه و سال برای تقویم فارسی
  const [selectedMonth, setSelectedMonth] = useState<number>(
    selectedDate ? selectedDate.month.number - 1 : new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    selectedDate ? selectedDate.year : new Date().getFullYear()
  );

  // رفرنس‌ها برای ورودی‌های زمان
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);

  // تاثیرات تغییر فرمت
  useEffect(() => {
    if (format === "dateOnly") {
      // پاک کردن انتخاب زمان زمانی که فقط تاریخ انتخاب شده است
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
      setTempSelectedTime({ hours: "", minutes: "", seconds: "" });
    }
  }, [format]);

  // تاثیرات تغییر مقدار پیش‌فرض
  useEffect(() => {
    if (defaultValue === "none") {
      setIsDynamic(false);
      setSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
    } else if (defaultValue === "today") {
      setIsDynamic(true);
      const today = new DateObject();
      setSelectedDate(today);
      setTempSelectedDate(today);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
      setTempSelectedTime({ hours: "", minutes: "", seconds: "" });
    } else if (defaultValue === "option1") {
      setIsDynamic(true);
      setSelectedDate(null); // پیاده‌سازی منطق خاص برای Option1 در صورت نیاز
      setTempSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
      setTempSelectedTime({ hours: "", minutes: "", seconds: "" });
    }
  }, [defaultValue]);

  // مقداردهی اولیه برای تاریخ موقتی هنگام باز شدن مدال
  useEffect(() => {
    if (isDateModalOpen) {
      setTempSelectedDate(selectedDate || new DateObject());
      setSelectedMonth((selectedDate || new DateObject()).month.number - 1);
      setSelectedYear((selectedDate || new DateObject()).year);
    }
  }, [isDateModalOpen, selectedDate]);

  // مقداردهی اولیه برای زمان موقتی هنگام باز شدن مدال
  useEffect(() => {
    if (isTimeModalOpen) {
      setTempSelectedTime(selectedTime);
    }
  }, [isTimeModalOpen, selectedTime]);

  // هندلرها
  const handleDefaultValueChange = (value: "none" | "today" | "option1") => {
    setDefaultValue(value);
    if (value === "today") {
      setIsDynamic(true);
      const today = new DateObject();
      setSelectedDate(today);
      setTempSelectedDate(today);
    } else if (value === "none") {
      setSelectedDate(null);
      setTempSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
      setTempSelectedTime({ hours: "", minutes: "", seconds: "" });
      setIsDynamic(false);
    } else if (value === "option1") {
      setSelectedDate(null); // پیاده‌سازی منطق خاص برای Option1 در صورت نیاز
      setTempSelectedDate(null);
      setIsDynamic(true);
    }
  };

  const handleSelectDate = () => {
    setSelectedDate(tempSelectedDate);
    setIsDateModalOpen(false);
  };

  const handleTimeChange = () => {
    setSelectedTime(tempSelectedTime);
    setIsTimeModalOpen(false);
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // اجازه دادن فقط به اعداد و محدود کردن طول
    if (/^\d*$/.test(value)) {
      let val = value;
      if (name === "hours") {
        if (parseInt(val) > 23) val = "23";
      } else {
        if (parseInt(val) > 59) val = "59";
      }
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
    if (e.key === "Tab" && nextRef && nextRef.current) {
      nextRef.current.focus();
      e.preventDefault();
    }
  };

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
          {/* گزینه None */}
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

          {/* گزینه Today */}
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
        {/* ورودی تاریخ با رادیو */}
        <label className="flex items-center space-x-2">
          {/* رادیو */}
          <input
            type="radio"
            name="dateOption"
            value="dateOption1"
            className="form-radio text-blue-600 h-4 w-4"
            checked={selectedDate !== null}
            onChange={() => setIsDateModalOpen(true)}
          />

          {/* ورودی تاریخ */}
          <div className="relative w-64">
            <input
              type="text"
              value={selectedDate ? selectedDate.format("YYYY/MM/DD") : ""}
              onClick={() => setIsDateModalOpen(true)}
              placeholder="انتخاب تاریخ"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
            <FaCalendarAlt
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => setIsDateModalOpen(true)}
            />
          </div>
        </label>

        {/* ورودی زمان (همیشه نمایش داده می‌شود) */}
        <div className="relative w-48">
          <input
            type="text"
            value={
              selectedTime.hours && selectedTime.minutes && selectedTime.seconds
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

      {/* مدال انتخاب تاریخ */}
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
            type="button" // تنظیم نوع دکمه به "button"
            onClick={handleSelectDate}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            انتخاب تاریخ
          </button>
        </div>
      </DynamicModal>

      {/* مدال انتخاب زمان */}
      <DynamicModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
      >
        <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
            انتخاب زمان
          </h2>

          {/* نمایش زمان انتخاب شده */}
          {tempSelectedTime.hours ||
          tempSelectedTime.minutes ||
          tempSelectedTime.seconds ? (
            <div className="mb-4 text-center">
              <span className="text-lg font-medium text-pink-600">
                {`${tempSelectedTime.hours.padStart(
                  2,
                  "0"
                )}:${tempSelectedTime.minutes.padStart(
                  2,
                  "0"
                )}:${tempSelectedTime.seconds.padStart(2, "0")}`}
              </span>
            </div>
          ) : (
            <div className="mb-4 text-center">
              <span className="text-lg font-medium text-gray-500">
                زمان انتخاب نشده
              </span>
            </div>
          )}

          {/* ورودی‌های زمان */}
          <div className="flex justify-center space-x-6">
            {/* ورودی ساعت */}
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

            {/* ورودی دقیقه */}
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

            {/* ورودی ثانیه */}
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

          {/* دکمه ذخیره زمان */}
          <div className="flex justify-center mt-6">
            <button
              type="button" // تنظیم نوع دکمه به "button"
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
