// src/components/PersianDatePicker.tsx
import React from "react";
import { Calendar, DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface PersianDatePickerProps {
  selectedDate: DateObject | null;
  onDateChange: React.Dispatch<React.SetStateAction<DateObject | null>>;
  selectedMonth: number;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
  selectedYear: number;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
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
    { label: "فروردین", value: 0 },
    { label: "اردیبهشت", value: 1 },
    { label: "خرداد", value: 2 },
    { label: "تیر", value: 3 },
    { label: "مرداد", value: 4 },
    { label: "شهریور", value: 5 },
    { label: "مهر", value: 6 },
    { label: "آبان", value: 7 },
    { label: "آذر", value: 8 },
    { label: "دی", value: 9 },
    { label: "بهمن", value: 10 },
    { label: "اسفند", value: 11 },
  ];

  const years = Array.from({ length: 1430 - 1300 + 1 }, (_, i) => {
    const persianYear = 1300 + i;
    return { label: persianYear, value: persianYear };
  });

  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
        انتخاب تاریخ
      </h2>

      {/* Display selected date */}
      {selectedDate && (
        <div className="mb-4 text-center">
          <span className="text-lg font-medium text-pink-600">
            تاریخ انتخاب‌شده: {selectedDate.format("YYYY/MM/DD")}
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
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            سال
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
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
          onChange={(date: DateObject) => onDateChange(date)}
          calendar={persian}
          locale={persian_fa}
          className="w-full custom-calendar"
          currentDate={
            new DateObject({
              calendar: persian,
              year: selectedYear,
              month: selectedMonth + 1,
              day: 1,
            })
          }
        />
      </div>
    </div>
  );
};

export default PersianDatePicker;
