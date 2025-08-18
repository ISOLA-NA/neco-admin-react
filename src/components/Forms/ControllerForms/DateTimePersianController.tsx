// src/components/PersianCalendarPicker.tsx

import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import DynamicModal from "../../utilities/DynamicModal";
import PersianDatePicker from "./PersianDatePicker";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import { useTranslation } from "react-i18next";

interface PersianCalendarPickerProps {
  onMetaChange: (meta: {
    metaType1: string;
    metaType2: string;
    metaType3: string;
    metaType4?: string;
  }) => void;
  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
    metaType4?: string;
  };
}

const PersianCalendarPicker: React.FC<PersianCalendarPickerProps> = ({
  onMetaChange,
  data,
}) => {
  const { t } = useTranslation();
  // State برای مقادیر اصلی و موقت تاریخ و زمان
  const [initKey, setInitKey] = useState<string>("");
  const [userTouched, setUserTouched] = useState(false);

  const [format, setFormat] = useState<"dateOnly" | "dateTime">("dateOnly");
  const [defaultValue, setDefaultValue] = useState<
    "none" | "today" | "selected"
  >("none");
  const [isDynamic, setIsDynamic] = useState(false);

  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
  const [tempSelectedDate, setTempSelectedDate] = useState<DateObject | null>(
    null
  );

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
    new DateObject({
      calendar: persian,
      locale: persian_fa,
    }).monthIndex.toString()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new DateObject({ calendar: persian, locale: persian_fa }).year.toString()
  );

  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);

  // helpers
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

  // مقداردهی اولیه فقط زمانی که داده ورودی تغییر کند (تضمین ضد چشمک زدن)
  useEffect(() => {
    if (!data) return;
    const key =
      (data.metaType1 ?? "") +
      "|" +
      (data.metaType2 ?? "") +
      "|" +
      (data.metaType3 ?? "");
    if (initKey === key) return;

    setInitKey(key);
    setUserTouched(false);

    setFormat(
      data.metaType1?.toLowerCase() === "datetime" ? "dateTime" : "dateOnly"
    );

    if (
      data.metaType2 === "dynamic" ||
      (data.metaType3 && data.metaType3.trim().toLowerCase() === "dynamic")
    ) {
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
        const pDate = new DateObject({
          year: Number(yy),
          month: Number(mm),
          day: Number(dd),
          calendar: gregorian,
        }).convert(persian);
        setSelectedDate(pDate);
        setSelectedMonth(pDate.monthIndex.toString());
        setSelectedYear(pDate.year.toString());
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
        setSelectedTime({ hours: "", minutes: "", seconds: "" });
      }
    } else {
      setSelectedDate(null);
      setSelectedTime({ hours: "", minutes: "", seconds: "" });
    }
  }, [data]);

  // همگام‌سازی متادیتا با تغییر هر یک از stateها
  useEffect(() => {
    // مقداردهی اولیه تا وقتی کاربر چیزی را تغییر نداده اجرا نشود (ضد چشمک زنی)
    if (!userTouched && initKey !== "") return;

    const metaType1 = format === "dateTime" ? "datetime" : "dateonly";
    let metaType2 = defaultValue;
    let metaType3 = "";

    if (isDynamic) {
      metaType2 = "today";
      metaType3 = "dynamic";
    } else if (defaultValue === "selected" && selectedDate) {
      metaType3 = toGregorianString(selectedDate, selectedTime);
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
  }, [
    format,
    defaultValue,
    isDynamic,
    selectedDate,
    selectedTime,
    userTouched,
  ]);

  // handlers
  const handleFormatChange = (val: "dateOnly" | "dateTime") => {
    setFormat(val);
    setUserTouched(true);
  };
  const handleDefaultValueChange = (val: "none" | "today" | "selected") => {
    setDefaultValue(val);
    setIsDynamic(false);
    setUserTouched(true);
    setSelectedDate(null);
    setSelectedTime({ hours: "", minutes: "", seconds: "" });
  };
  const handleDynamicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDynamic(e.target.checked);
    setUserTouched(true);
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

  // انتخاب تاریخ
  const handleDateChange = (date: DateObject | null) => {
    setTempSelectedDate(date);
  };
  const handleSelectDate = () => {
    setSelectedDate(tempSelectedDate);
    setDefaultValue("selected");
    setIsDateModalOpen(false);
    setUserTouched(true);
  };

  // انتخاب ساعت
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
    setUserTouched(true);
  };

  // مقداردهی اولیه موقت تاریخ و ساعت برای مدال
  useEffect(() => {
    if (isDateModalOpen) {
      setTempSelectedDate(
        selectedDate ||
          new DateObject({ calendar: persian, locale: persian_fa })
      );
    }
  }, [isDateModalOpen, selectedDate]);
  useEffect(() => {
    if (isTimeModalOpen) {
      setTempSelectedTime(selectedTime);
    }
  }, [isTimeModalOpen, selectedTime]);

  // رندر کامل
  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg space-y-8">
      {/* انتخاب فرمت */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("DateTimeSelector.DateTimeFormatLabel")}
        </label>
        <div className="flex gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="format"
              value="dateOnly"
              checked={format === "dateOnly"}
              onChange={() => handleFormatChange("dateOnly")}
              className="form-radio text-blue-600 h-4 w-4"
            />
            <span className="text-gray-700">
              {t("DateTimeSelector.DateOnly")}
            </span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="format"
              value="dateTime"
              checked={format === "dateTime"}
              onChange={() => handleFormatChange("dateTime")}
              className="form-radio text-blue-600 h-4 w-4"
            />
            <span className="text-gray-700">
              {t("DateTimeSelector.DateAndTime")}
            </span>
          </label>
        </div>
      </div>

      {/* انتخاب مقدار پیش‌فرض */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("DateTimeSelector.DefaultValueLabel")}
        </label>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="defaultValue"
              value="none"
              checked={defaultValue === "none"}
              onChange={() => handleDefaultValueChange("none")}
              className="form-radio text-blue-600 h-4 w-4"
            />
            <span className="text-gray-700">{t("DateTimeSelector.None")}</span>
          </label>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="defaultValue"
                value="today"
                checked={defaultValue === "today"}
                onChange={() => handleDefaultValueChange("today")}
                className="form-radio text-blue-600 h-4 w-4"
              />
              <span className="text-gray-700">
                {t("DateTimeSelector.TodaysDate")}
              </span>
            </label>

            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="isDynamic"
                checked={isDynamic}
                onChange={handleDynamicChange}
                disabled={defaultValue !== "today"}
                className="form-checkbox text-blue-600 h-4 w-4"
              />
              <span className="text-gray-700">
                {t("DateTimeSelector.IsDynamic")}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* انتخاب تاریخ و زمان */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2">
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
              value={selectedDate ? formatPersian(selectedDate) : ""}
              onClick={() => {
                setIsDateModalOpen(true);
                handleDefaultValueChange("selected");
              }}
              placeholder={t("DateTimeSelector.SelectDatePlaceholder")}
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

        {/* ورودی ساعت */}
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
            placeholder={t("DateTimeSelector.SelectTimePlaceholder")}
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

      {/* مودال انتخاب تاریخ */}
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
            {t("DateTimeSelector.SelectDateButton")}
          </button>
        </div>
      </DynamicModal>

      {/* مودال انتخاب ساعت */}
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
            {t("DateTimeSelector.ModalSelectTimeTitle")}
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
                {t("DateTimeSelector.NoTimeSelected")}
              </span>
            </div>
          )}
          <div className="flex justify-center gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                {t("DateTimeSelector.HoursShort")}
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
                {t("DateTimeSelector.SecondsShort")}
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
                onBlur={() => setSelectedTime(tempSelectedTime)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                {t("DateTimeSelector.MinutesShort")}
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
                onBlur={() => setSelectedTime(tempSelectedTime)}
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
