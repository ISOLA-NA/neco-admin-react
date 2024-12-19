// src/components/PersianCalendarPicker.tsx
import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import DynamicModal from "../../utilities/DynamicModal";
import PersianDatePicker from "./DatePicker"; // Corrected import path and name
import { DateObject } from "react-multi-date-picker";

const PersianCalendarPicker: React.FC = () => {
  // State management
  const [defaultValue, setDefaultValue] = useState<
    "none" | "today" | "option1"
  >("none");
  const [isDynamic, setIsDynamic] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
  const [tempSelectedDate, setTempSelectedDate] = useState<DateObject | null>(
    null
  ); // Temporary state for date modal
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

  // Selected month and year for the Persian calendar
  const [selectedMonth, setSelectedMonth] = useState<number>(
    selectedDate ? selectedDate.month.number - 1 : new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    selectedDate ? selectedDate.year : new Date().getFullYear()
  );

  // Refs for time inputs
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);

  // Effect to manage default value changes
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
      setSelectedDate(null); // Implement specific logic for Option1 if needed
      setTempSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
      setTempSelectedTime({ hours: "", minutes: "", seconds: "" });
    }
  }, [defaultValue]);

  // Initial value for temporary date when opening the modal
  useEffect(() => {
    if (isDateModalOpen) {
      setTempSelectedDate(selectedDate || new DateObject());
      setSelectedMonth((selectedDate || new DateObject()).month.number - 1);
      setSelectedYear((selectedDate || new DateObject()).year);
    }
  }, [isDateModalOpen, selectedDate]);

  // Initial value for temporary time when opening the modal
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
      setSelectedDate(null); // Implement specific logic for Option1 if needed
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
      ? selectedDate.format("YYYY/MM/DD")
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

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-8">
      {/* Select Default Value */}
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

          {/* Today Option */}
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="defaultValue"
              value="today"
              checked={defaultValue === "today"}
              onChange={() => handleDefaultValueChange("today")}
              className="form-radio text-blue-600 h-4 w-4"
            />
            <span className="text-gray-700">Today</span>
            <input
              type="checkbox"
              name="isDynamic"
              checked={isDynamic}
              onChange={() => setIsDynamic(!isDynamic)}
              className="form-checkbox text-blue-600 h-4 w-4"
              disabled={defaultValue === "none"}
            />
            <span className="text-gray-700">Dynamic</span>
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
              value={selectedDate ? selectedDate.format("YYYY/MM/DD") : ""}
              onClick={() => setIsDateModalOpen(true)}
              placeholder="Select a date"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
            <FaCalendarAlt
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => setIsDateModalOpen(true)}
            />
          </div>
        </label>

        {/* Time Input (Always Visible) */}
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
            placeholder="Select time"
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            readOnly
          />
          <FaClock
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={() => setIsTimeModalOpen(true)}
          />
        </div>
      </div>

      {/* Optional Log Button */}
      {/* <div className="flex justify-center">
        <button
          onClick={logSelectedDateTime}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Log Selected Date and Time
        </button>
      </div> */}

      {/* Date Selection Modal */}
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
            onClick={handleSelectDate}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Select Date
          </button>
        </div>
      </DynamicModal>

      {/* Time Selection Modal */}
      <DynamicModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
      >
        <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
            Select Time
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
            {/* Hour Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                Hour
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

            {/* Minute Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                Minute
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

            {/* Second Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                Second
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

export default PersianCalendarPicker;
