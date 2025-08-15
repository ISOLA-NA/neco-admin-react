import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import "daisyui";
import { useApi } from "../../context/ApiContext";
import DynamicInput from "../utilities/DynamicInput";
import { showAlert } from "../utilities/Alert/DynamicAlert";
import { FaCalendarAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export interface CalendarHandle {
  save: () => Promise<boolean>;
}

interface CalendarProps {
  selectedRow: Calendar | null;
}

export interface Calendar {
  ID?: number;
  Name: string;
  SpecialDay: string;
  dateTimeRoutine: string;
  IsVisible: boolean;
  ModifiedById?: string | null;
  LastModified?: string;
  CreatorId?: string;
  CreateDate?: string;
}

const parseJsonSafely = (
  jsonString: string | undefined | null,
  defaultValue: object = {}
) => {
  if (!jsonString) return defaultValue;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed && typeof parsed === "object" ? parsed : defaultValue;
  } catch (error) {
    console.warn("Error parsing JSON:", error);
    return defaultValue;
  }
};

const CalendarTabs = forwardRef<CalendarHandle, CalendarProps>(
  ({ selectedRow }, ref) => {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [activeTab, setActiveTab] = useState<"routine" | "exception">(
      "routine"
    );
    const [calendarData, setCalendarData] = useState<Calendar>({
      Name: "",
      SpecialDay: "{}",
      dateTimeRoutine: "{}",
      IsVisible: true,
    });

    const [routineData, setRoutineData] = useState<{ [key: string]: number }>(
      {}
    );
    const [exceptionData, setExceptionData] = useState<{
      [key: string]: number;
    }>({});

    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [modalValue, setModalValue] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      if (selectedRow) {
        setCalendarData({
          ...selectedRow,
          SpecialDay: selectedRow.SpecialDay || "{}",
          dateTimeRoutine: selectedRow.dateTimeRoutine || "{}",
        });

        setRoutineData(parseJsonSafely(selectedRow.dateTimeRoutine));
        setExceptionData(parseJsonSafely(selectedRow.SpecialDay));
      } else {
        setCalendarData({
          Name: "",
          SpecialDay: "{}",
          dateTimeRoutine: "{}",
          IsVisible: true,
        });
        setRoutineData({});
        setExceptionData({});
      }
    }, [selectedRow]);

    useImperativeHandle(ref, () => ({
      async save() {
        try {
          setIsLoading(true);
          if (!calendarData.Name.trim()) {
            showAlert(
              "error",
              null,
              t("Global.Error", { defaultValue: "Error" }),
              t("Calendars.CalendarNameRequired", {
                defaultValue: "Calendar name is required",
              })
            );
            return false;
          }

          const dataToSave: Calendar = {
            ...calendarData,
            Name: calendarData.Name.trim(),
            SpecialDay: JSON.stringify(exceptionData),
            dateTimeRoutine: JSON.stringify(routineData),
            LastModified: new Date().toISOString(),
            IsVisible: true,
          };

          if (selectedRow?.ID) {
            await api.updateCalendar(dataToSave);
          } else {
            await api.insertCalendar(dataToSave);
          }
          return true;
        } catch (error) {
          console.error("Error saving calendar:", error);
          showAlert(
            "error",
            null,
            t("Global.Error", { defaultValue: "Error" }),
            t("Calendars.SaveFailed", {
              defaultValue: "Failed to save calendar",
            })
          );
          return false;
        } finally {
          setIsLoading(false);
        }
      },
    }));

    const daysInMonth = (month: number, year: number) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCalendarData((prev) => ({
        ...prev,
        Name: e.target.value,
      }));
    };

    const handleRoutineChange = (
      day: string,
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const numValue = parseFloat(e.target.value);
      if (isNaN(numValue) || numValue < 0 || numValue > 1) return;

      setRoutineData((prev) => ({
        ...prev,
        [day]: numValue,
      }));
    };

    const handleRoutineToggle = (day: string) => {
      setRoutineData((prev) => {
        if (day in prev) {
          const { [day]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [day]: 0 };
      });
    };

    const handleSaveModal = () => {
      if (!selectedDate) return;

      const numValue = parseFloat(modalValue);
      if (isNaN(numValue) || numValue < 0 || numValue > 1) {
        showAlert(
          "error",
          null,
          t("Global.Error", { defaultValue: "Error" }),
          t("Calendars.EnterValidNumber01", {
            defaultValue: "Please enter a valid number between 0 and 1",
          })
        );
        return;
      }

      setExceptionData((prev) => ({
        ...prev,
        [selectedDate]: numValue,
      }));
      setSelectedDate(null);
      setModalValue("");
    };

    const handleOpenModal = (day: number) => {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      setSelectedDate(dateStr);
      setModalValue(exceptionData[dateStr]?.toString() || "");
    };

    const weekDayKeys = [
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ] as const;

    const weekDaysLocalized = weekDayKeys.map((k) =>
      t(`Calendars.${k}`, { defaultValue: k })
    );

    return (
      <div
        className="p-4 bg-white rounded-lg shadow-sm max-w-7xl mx-auto"
        dir={i18n.dir()}
      >
        <div className="flex justify-center mb-6">
          <div className="w-full md:w-1/2">
            <DynamicInput
              name={t("Calendars.CalendarName", {
                defaultValue: "Calendar Name",
              })}
              type="text"
              value={calendarData.Name}
              onChange={handleNameChange}
              required={true}
              placeholder={t("Calendars.EnterCalendarName", {
                defaultValue: "Enter calendar name",
              })}
              leftIcon={<FaCalendarAlt />}
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            />
          </div>
        </div>

        <div className="relative mb-6">
          <div className="flex flex-wrap justify-center space-x-4 overflow-x-auto scrollbar-hide px-4 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 rounded-lg shadow-xl">
            <button
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 transform ${
                activeTab === "routine"
                  ? "bg-white text-purple-600 shadow-xl scale-105"
                  : "text-white hover:bg-purple-600 hover:scale-105"
              }`}
              onClick={() => setActiveTab("routine")}
            >
              {t("Calendars.RoutineWorkingHours", {
                defaultValue: "Routine Working Hours",
              })}
            </button>
            <button
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 transform ${
                activeTab === "exception"
                  ? "bg-white text-purple-600 shadow-xl scale-105"
                  : "text-white hover:bg-purple-600 hover:scale-105"
              }`}
              onClick={() => setActiveTab("exception")}
            >
              {t("Calendars.Exceptions", { defaultValue: "Exceptions" })}
            </button>
          </div>
        </div>

        <div className="mt-4">
          {activeTab === "routine" && (
            <div className="routine-tab p-4 bg-white rounded-lg shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {weekDayKeys.map((dayKey, idx) => {
                  const dayLabel = weekDaysLocalized[idx];
                  return (
                    <div
                      key={dayKey}
                      className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg"
                    >
                      <label className="flex items-center gap-2 min-w-[120px]">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-purple-600 rounded border-purple-600"
                          checked={dayKey in routineData}
                          onChange={() => handleRoutineToggle(dayKey)}
                        />
                        <span className="text-gray-700 whitespace-nowrap">
                          {dayLabel}
                        </span>
                      </label>
                      <div className="flex-grow">
                        <DynamicInput
                          name={`${dayLabel} ${t("Calendars.Hours", {
                            defaultValue: "Hours",
                          })}`}
                          type="number"
                          min={0}
                          max={1}
                          step={0.1}
                          value={routineData[dayKey]?.toString() || ""}
                          onChange={(e) => handleRoutineChange(dayKey, e)}
                          disabled={!(dayKey in routineData)}
                          placeholder={t("Calendars.Value", {
                            defaultValue: "Value (0-1)",
                          })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "exception" && (
            <div className="exception-tab p-4 bg-white rounded-lg shadow-sm">
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <select
                  className="select border border-purple-600 rounded-md px-4 py-2"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(0, i).toLocaleString(i18n.language, {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
                <select
                  className="select border border-purple-600 rounded-md px-4 py-2"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const yearValue = new Date().getFullYear() - 5 + i;
                    return (
                      <option key={yearValue} value={yearValue}>
                        {yearValue}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* نام کامل روزهای هفته در هدر تب استثناها */}
              <div className="grid grid-cols-7 gap-2">
                {weekDaysLocalized.map((dayLabel) => (
                  <div
                    key={`head-${dayLabel}`}
                    className="text-center font-bold text-gray-600 p-2"
                  >
                    {dayLabel}
                  </div>
                ))}

                {Array.from(
                  { length: new Date(year, month, 1).getDay() },
                  (_, i) => (
                    <div key={`empty-${i}`} className="p-2"></div>
                  )
                )}

                {[...Array(daysInMonth(month, year))].map((_, day) => {
                  const dateStr = `${year}-${(month + 1)
                    .toString()
                    .padStart(2, "0")}-${(day + 1)
                    .toString()
                    .padStart(2, "0")}`;
                  const hasValue = dateStr in exceptionData;

                  return (
                    <div
                      key={day + 1}
                      className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        hasValue
                          ? "bg-gradient-to-r from-purple-600 to-indigo-500 text-white"
                          : "bg-white hover:bg-gray-100 border border-purple-600"
                      }`}
                      onClick={() => handleOpenModal(day + 1)}
                    >
                      <span
                        className={hasValue ? "text-white" : "text-gray-700"}
                      >
                        {day + 1}
                      </span>
                      {hasValue && (
                        <span className="text-xs mt-1">
                          {exceptionData[dateStr]}h
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedDate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4 text-gray-800">
                  {t("Calendars.SetWorkingHoursFor", {
                    defaultValue: "Set Working Hours for {{date}}",
                    date: selectedDate,
                  })}
                </h3>
                <DynamicInput
                  name={t("Calendars.WorkingHours", {
                    defaultValue: "Working Hours",
                  })}
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  placeholder={t("Calendars.EnterHours01", {
                    defaultValue: "Enter hours (0-1)",
                  })}
                  className="w-full"
                />
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    className="px-4 py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50"
                    onClick={() => setSelectedDate(null)}
                  >
                    {t("Global.Cancel", { defaultValue: "Cancel" })}
                  </button>
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    onClick={handleSaveModal}
                  >
                    {t("Global.Add", { defaultValue: "Add" })}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

CalendarTabs.displayName = "CalendarTabs";

export default CalendarTabs;
