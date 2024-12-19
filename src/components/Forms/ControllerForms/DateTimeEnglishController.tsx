// src/components/DateTimeSelector.tsx
import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DynamicModal from "../../utilities/DynamicModal";

const DateTimeSelector: React.FC = () => {
  // State Management
  const [format, setFormat] = useState<"dateOnly" | "dateTime">("dateOnly");
  const [defaultValue, setDefaultValue] = useState<
    "none" | "today" | "option1"
  >("none");
  const [isDynamic, setIsDynamic] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null); // Temporary state for date modal
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
  }); // Temporary state for time modal
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  // Additional State for Month and Year Selection
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Refs for Time Inputs
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);

  // Effect to handle default value changes
  useEffect(() => {
    if (defaultValue === "none") {
      setIsDynamic(false);
      setSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
    } else if (defaultValue === "today") {
      setIsDynamic(true);
      setSelectedDate(new Date());
      setTempSelectedDate(new Date());
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

  // Initialize temporary selected date when modal opens
  useEffect(() => {
    if (isDateModalOpen) {
      setTempSelectedDate(selectedDate || new Date());
      setSelectedMonth((selectedDate || new Date()).getMonth());
      setSelectedYear((selectedDate || new Date()).getFullYear());
    }
  }, [isDateModalOpen, selectedDate]);

  // Initialize temporary selected time when modal opens
  useEffect(() => {
    if (isTimeModalOpen) {
      setTempSelectedTime(selectedTime);
    }
  }, [isTimeModalOpen, selectedTime]);

  // Handlers
  const handleDefaultValueChange = (value: "none" | "today" | "option1") => {
    setDefaultValue(value);
    if (value === "today") {
      setIsDynamic(true);
      setSelectedDate(new Date());
      setTempSelectedDate(new Date());
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

  const handleDateChange = (date: Date | null) => {
    setTempSelectedDate(date);
    if (date) {
      setSelectedMonth(date.getMonth());
      setSelectedYear(date.getFullYear());
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
    // Allow only numbers and limit length
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

  const logSelectedDateTime = () => {
    const dateStr = selectedDate
      ? selectedDate.toLocaleDateString("en-CA")
      : "No Date Selected";
    const timeStr =
      selectedTime.hours && selectedTime.minutes && selectedTime.seconds
        ? `${selectedTime.hours.padStart(
            2,
            "0"
          )}:${selectedTime.minutes.padStart(
            2,
            "0"
          )}:${selectedTime.seconds.padStart(2, "0")}`
        : "No Time Selected";
    console.log(`Selected Date: ${dateStr}`);
    console.log(`Selected Time: ${timeStr}`);
  };

  // Generate Years Range
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i); // From currentYear -10 to currentYear +10

  // Months Array
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
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-8">
      {/* Date and Time Format Selection */}
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

      {/* Default Value Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Value:
        </label>
        <div className="space-y-4">
          {/* None Option */}
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

          {/* Today's Date Option */}
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
        </div>
      </div>

      {/* Date and Time Inputs */}
      <div className="flex items-center space-x-6">
        {/* Date Input with Radio Button */}
        <label className="flex items-center space-x-2">
          {/* Radio Button */}
          <input
            type="radio"
            name="dateOption"
            value="dateOption1"
            className="form-radio text-blue-600 h-4 w-4"
            checked={selectedDate !== null}
            onChange={() => setIsDateModalOpen(true)}
          />

          {/* Date Input */}
          <div className="relative w-64">
            <input
              type="text"
              value={
                selectedDate ? selectedDate.toLocaleDateString("en-CA") : ""
              }
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
        </label>

        {/* Time Input */}
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

      {/* Log Button */}
      {/* <div className="flex justify-center">
        <button
          onClick={logSelectedDateTime}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Log Selected Date & Time
        </button>
      </div> */}

      {/* Date Picker Modal */}
      <DynamicModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
      >
        <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
            Select a Date
          </h2>

          {/* Display Selected Date */}
          {tempSelectedDate && (
            <div className="mb-4 text-center">
              <span className="text-lg font-medium text-pink-600">
                {tempSelectedDate.toLocaleDateString("en-CA")}
              </span>
            </div>
          )}

          {/* Month and Year Selectors */}
          <div className="flex justify-center space-x-4 mb-4">
            {/* Month Selector */}
            <div>
              <label
                htmlFor="month"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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

            {/* Year Selector */}
            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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

          {/* DatePicker Component */}
          <div className="flex justify-center">
            <DatePicker
              selected={tempSelectedDate}
              onChange={handleDateChange}
              inline
              // Force the calendar to open to the selected month and year
              showMonthDropdown={false}
              showYearDropdown={false}
              dropdownMode="select"
              // Use a custom header to integrate with external month/year selectors
              renderCustomHeader={({}) => (
                <div className="flex justify-center mb-2">
                  {/* Empty since we're using external selectors */}
                </div>
              )}
              // Set the calendar to the selected month and year
              openToDate={new Date(selectedYear, selectedMonth, 1)}
            />
          </div>

          {/* Select Date Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSelectDate}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Select Date
            </button>
          </div>
        </div>
      </DynamicModal>

      {/* Time Picker Modal */}
      <DynamicModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
      >
        <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
            Select a Time
          </h2>

          {/* Display Selected Time */}
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
                No Time Selected
              </span>
            </div>
          )}

          {/* Time Inputs */}
          <div className="flex justify-center space-x-6">
            {/* Hours Input */}
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
                className="w-16 mx-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              />
            </div>

            {/* Minutes Input */}
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
                className="w-16 mx-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              />
            </div>

            {/* Seconds Input */}
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
                className="w-16 mx-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              />
            </div>
          </div>

          {/* Save Time Button */}
          <div className="flex justify-center mt-6">
            <button
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
