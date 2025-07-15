import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DynamicModal from "../../utilities/DynamicModal";

interface DateTimeSelectorProps {
  onMetaChange: (meta: {
    metaType1: string; // "dateonly" یا "datetime"
    metaType2: string; // "none"، "today"، "selected" یا "dynamic"
    metaType3: string; // تاریخ و زمان به صورت رشته
    metaType4?: string;
  }) => void;
  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
    metaType4?: string;
  };
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  onMetaChange,
  data,
}) => {
  const [initKey, setInitKey] = useState<string>("");
  const [userTouched, setUserTouched] = useState(false);

  const [format, setFormat] = useState<"dateOnly" | "dateTime">("dateOnly");
  const [defaultValue, setDefaultValue] = useState<"none" | "today" | "selected">("none");
  const [isDynamic, setIsDynamic] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<{ hours: string; minutes: string; seconds: string; }>({ hours: "", minutes: "", seconds: "" });
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);
  const [tempSelectedTime, setTempSelectedTime] = useState<{ hours: string; minutes: string; seconds: string; }>({ hours: "", minutes: "", seconds: "" });

  // format helpers
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  const formatTime = (time: { hours: string; minutes: string; seconds: string; }) => {
    const h = time.hours ? time.hours.padStart(2, "0") : "00";
    const m = time.minutes ? time.minutes.padStart(2, "0") : "00";
    const s = time.seconds ? time.seconds.padStart(2, "0") : "00";
    return `${h}:${m}:${s}`;
  };

  // مقداردهی اولیه فقط با کلید جدید
  useEffect(() => {
    if (!data) return;
    const key = (data.metaType1 ?? "") + "|" + (data.metaType2 ?? "") + "|" + (data.metaType3 ?? "");
    if (initKey === key) return;

    setInitKey(key);
    setUserTouched(false);

    setFormat(data.metaType1?.toLowerCase() === "datetime" ? "dateTime" : "dateOnly");
    if (data.metaType2 === "dynamic" || (data.metaType3 && data.metaType3.trim().toLowerCase() === "dynamic")) {
      setIsDynamic(true);
      setDefaultValue("today");
    } else if (data.metaType2 === "today") {
      setIsDynamic(false);
      setDefaultValue("today");
    } else if (data.metaType2 === "selected") {
      setIsDynamic(false);
      setDefaultValue("selected");
    } else {
      setIsDynamic(false);
      setDefaultValue("none");
    }

    if (
      data.metaType3 &&
      data.metaType3.trim() !== "" &&
      data.metaType3.trim().toLowerCase() !== "dynamic"
    ) {
      const [datePart, timePart] = data.metaType3.trim().split(" ");
      if (datePart) {
        const [yy, mm, dd] = datePart.split("-");
        const newDate = new Date(Number(yy), Number(mm) - 1, Number(dd));
        setSelectedDate(!isNaN(newDate.getTime()) ? newDate : null);
      } else {
        setSelectedDate(null);
      }
      if (timePart) {
        const [hh, mn, sc] = timePart.split(":");
        setSelectedTime({
          hours: hh || "",
          minutes: mn || "",
          seconds: sc || "00",
        });
      } else {
        setSelectedTime({
          hours: "",
          minutes: "",
          seconds: "",
        });
      }
    } else {
      setSelectedDate(null);
      setSelectedTime({
        hours: "",
        minutes: "",
        seconds: "",
      });
    }
  }, [data]);

  useEffect(() => {
    // فقط زمانی که کاربر چیزی تغییر داده یا مقدار اولیه ست شده
    if (!userTouched && initKey !== "") return;

    const metaType1 = format === "dateTime" ? "datetime" : "dateonly";
    let metaType2 = defaultValue;
    let metaType3 = "";

    if (isDynamic) {
      metaType2 = "today";
      metaType3 = "dynamic";
    } else if (defaultValue === "selected" && selectedDate) {
      const dateStr = formatDate(selectedDate);
      const timeStr = formatTime(selectedTime); // همواره ست می‌شود!
      metaType3 = `${dateStr} ${timeStr}`;
    } else if (defaultValue === "today" || defaultValue === "none") {
      metaType3 = "";
    }

    onMetaChange({
      metaType1,
      metaType2,
      metaType3,
      metaType4: data?.metaType4 || "",
    });
    // eslint-disable-next-line
  }, [format, defaultValue, isDynamic, selectedDate, selectedTime, userTouched]);

  // handlers
  const handleFormatChange = (val: "dateOnly" | "dateTime") => {
    setFormat(val);
    setUserTouched(true);
  };
  const handleDefaultValueChange = (val: "none" | "today" | "selected") => {
    setDefaultValue(val);
    setIsDynamic(false);
    setUserTouched(true);
    if (val === "none" || val === "today" || val === "selected") {
      setSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
    }
  };
  const handleDynamicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDynamic(e.target.checked);
    setUserTouched(true);
  };

  // dynamic update
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

  // Modal ها و اینپوت های تاریخ و زمان
  const handleDateChange = (date: Date | null) => {
    setTempSelectedDate(date);
  };
  const handleSelectDate = () => {
    setSelectedDate(tempSelectedDate);
    setDefaultValue("selected");
    setIsDateModalOpen(false);
    setUserTouched(true);
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
  const handleTimeChange = () => {
    setSelectedTime(tempSelectedTime);
    setIsTimeModalOpen(false);
    setUserTouched(true);
  };

  // Modal Date
  useEffect(() => {
    if (isDateModalOpen) {
      setTempSelectedDate(selectedDate || new Date());
    }
  }, [isDateModalOpen, selectedDate]);
  useEffect(() => {
    if (isTimeModalOpen) {
      setTempSelectedTime(selectedTime);
    }
  }, [isTimeModalOpen, selectedTime]);

  // رندر کامل:
  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg space-y-8">
      {/* انتخاب فرمت */}
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
              onChange={() => handleFormatChange("dateOnly")}
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
              onChange={() => handleFormatChange("dateTime")}
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
            {/* چک‌باکس Is Dynamic */}
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
      {/* انتخاب تاریخ و زمان */}
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
              handleDefaultValueChange("selected");
            }}
          />
          <div className="relative w-64">
            <input
              type="button"
              value={selectedDate ? formatDate(selectedDate) : ""}
              onClick={() => {
                setIsDateModalOpen(true);
                handleDefaultValueChange("selected");
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
                handleDefaultValueChange("selected");
              }}
            />
          </div>
        </label>
        {/* ورودی زمان همیشه نمایش داده شود */}
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
      {/* مودال تاریخ */}
      <DynamicModal
        isOpen={isDateModalOpen}
        onClose={() => {
          if (tempSelectedDate) {
            setSelectedDate(tempSelectedDate);
            setDefaultValue("selected");
            setUserTouched(true);
          }
          setIsDateModalOpen(false);
        }}
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
      {/* مودال زمان */}
      <DynamicModal
        isOpen={isTimeModalOpen}
        onClose={() => {
          if (tempSelectedTime) {
            setSelectedTime(tempSelectedTime);
            setUserTouched(true);
          }
          setIsTimeModalOpen(false);
        }}
      >
        <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
            Select a Time
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
