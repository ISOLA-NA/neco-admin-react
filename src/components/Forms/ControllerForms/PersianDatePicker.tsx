import React from "react";
import { Calendar, DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface PersianDatePickerProps {
  selectedDate: DateObject | null;
  onDateChange: (date: DateObject | null) => void;
  selectedMonth: string;
  setSelectedMonth: React.Dispatch<React.SetStateAction<string>>;
  selectedYear: string;
  setSelectedYear: React.Dispatch<React.SetStateAction<string>>;
}

const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  selectedDate,
  onDateChange,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}) => {
  const months = [
    { label: "فروردین", value: "0" },
    { label: "اردیبهشت", value: "1" },
    { label: "خرداد", value: "2" },
    { label: "تیر", value: "3" },
    { label: "مرداد", value: "4" },
    { label: "شهریور", value: "5" },
    { label: "مهر", value: "6" },
    { label: "آبان", value: "7" },
    { label: "آذر", value: "8" },
    { label: "دی", value: "9" },
    { label: "بهمن", value: "10" },
    { label: "اسفند", value: "11" },
  ];

  // ایجاد لیست سال‌های شمسی از ۱۳۰۰ تا ۱۴۳۰
  const years = Array.from({ length: 1430 - 1300 + 1 }, (_, i) => {
    const persianYear = (1300 + i).toString();
    return { label: persianYear, value: persianYear };
  });

  // تابع کمکی برای قالب‌بندی تاریخ شمسی بدون "j"
  const formatPersian = (date: DateObject) =>
    date.convert(persian).format("jYYYY/jMM/jDD").replace(/j/g, "");

  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
        انتخاب تاریخ
      </h2>

      {selectedDate && (
        <div className="mb-4 text-center">
          <span className="text-lg font-medium text-pink-600">
            تاریخ انتخاب‌شده: {formatPersian(selectedDate)}
          </span>
        </div>
      )}

      <div className="flex justify-center space-x-4 mb-4">
        <div>
          <label
            htmlFor="month"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ماه
          </label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
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
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            سال
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {years.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <Calendar
          value={selectedDate}
          onChange={(date: DateObject | null) => onDateChange(date)}
          calendar={persian}
          locale={persian_fa}
          format="jYYYY/jMM/jDD"
          className="w-full custom-calendar"
          currentDate={
            selectedYear && selectedMonth !== ""
              ? new DateObject({
                  calendar: persian,
                  locale: persian_fa,
                  year: Number(selectedYear),
                  month: Number(selectedMonth) + 1,
                  day: selectedDate?.day || 1,
                })
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default PersianDatePicker;
