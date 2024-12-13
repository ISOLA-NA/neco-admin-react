import React, { useState } from "react";
import "daisyui";

const CalendarTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("routine");
  const [routineData, setRoutineData] = useState<{ [key: string]: number }>({});
  const [calendarData, setCalendarData] = useState<{ [key: string]: number }>(
    {}
  );
  const [month, setMonth] = useState(11); // December (0-indexed)
  const [year, setYear] = useState(2024);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalValue, setModalValue] = useState<string>("");

  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleRoutineSave = () => {
    const filledDays = Object.keys(routineData)
      .filter((key) => routineData[key] !== undefined)
      .reduce((obj, key) => {
        obj[key] = routineData[key];
        return obj;
      }, {} as { [key: string]: number });

    console.log("Routine Data", filledDays);
  };

  const handleRoutineChange = (day: string, value: string) => {
    setRoutineData((prev) => ({
      ...prev,
      [day]: parseFloat(value) || 0,
    }));
  };

  const handleRoutineToggle = (day: string) => {
    setRoutineData((prev) => {
      if (day in prev) {
        const updated = { ...prev };
        delete updated[day];
        return updated;
      } else {
        return { ...prev, [day]: 0 };
      }
    });
  };

  const handleSaveModal = () => {
    if (selectedDate) {
      setCalendarData((prev) => ({
        ...prev,
        [selectedDate]: parseFloat(modalValue) || 0,
      }));
      setSelectedDate(null);
      setModalValue("");
    }
  };

  const handleSaveAll = () => {
    const filledDates = Object.keys(calendarData)
      .filter((key) => calendarData[key] !== undefined)
      .reduce((obj, key) => {
        obj[key] = calendarData[key];
        return obj;
      }, {} as { [key: string]: number });

    console.log("Exception Data", filledDates);
  };

  const handleOpenModal = (day: number) => {
    setSelectedDate(`${year}-${month + 1}-${day}`);
    setModalValue(
      calendarData[`${year}-${month + 1}-${day}`]?.toString() || ""
    );
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    return new Date(0, i).toLocaleString("default", { month: "long" });
  });

  const yearOptions = Array.from({ length: 10 }, (_, i) => 2020 + i);

  return (
    <div className="p-4">
      {/* Tabs Navigation */}
      <div className="relative mx-4 mb-6">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide px-6 py-3 bg-gradient-to-r from-[#E04AA9] via-[#B652E2] to-[#6565F1] rounded-lg shadow-xl">
          <button
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 transform ${
              activeTab === "routine"
                ? "bg-white text-[#E04AA9] shadow-xl scale-105"
                : "text-white hover:bg-[#E04AA9] hover:scale-105"
            }`}
            onClick={() => setActiveTab("routine")}
          >
            Routine Workings Date
          </button>
          <button
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 transform ${
              activeTab === "exception"
                ? "bg-white text-[#E04AA9] shadow-xl scale-105"
                : "text-white hover:bg-[#E04AA9] hover:scale-105"
            }`}
            onClick={() => setActiveTab("exception")}
          >
            Exception
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "routine" && (
          <div className="routine-tab text-center">
            <div className="grid grid-cols-2 gap-6">
              <div>
                {["Saturday", "Sunday", "Monday", "Tuesday"].map((day) => (
                  <div
                    key={day}
                    className="flex items-center justify-between mb-4"
                  >
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={day in routineData}
                        onChange={() => handleRoutineToggle(day)}
                      />
                      <span className="font-semibold">{day}</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="1"
                      className="input input-bordered w-40"
                      value={routineData[day]?.toString() || ""}
                      onChange={(e) => handleRoutineChange(day, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div>
                {["Wednesday", "Thursday", "Friday"].map((day) => (
                  <div
                    key={day}
                    className="flex items-center justify-between mb-4"
                  >
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={day in routineData}
                        onChange={() => handleRoutineToggle(day)}
                      />
                      <span className="font-semibold">{day}</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="1"
                      className="input input-bordered w-40"
                      value={routineData[day]?.toString() || ""}
                      onChange={(e) => handleRoutineChange(day, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <button
              className="btn btn-primary mt-4 w-full bg-[#E04AA9] hover:bg-[#B652E2]"
              onClick={handleRoutineSave}
            >
              Save
            </button>
          </div>
        )}

        {activeTab === "exception" && (
          <div className="exception-tab text-center">
            <div className="calendar-container">
              <div className="flex justify-center items-center gap-4 mb-4">
                <select
                  className="select select-bordered"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                  {monthOptions.map((monthName, i) => (
                    <option key={i} value={i}>
                      {monthName}
                    </option>
                  ))}
                </select>
                <select
                  className="select select-bordered"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                >
                  {yearOptions.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {[...Array(daysInMonth(month, year)).keys()].map((day) => (
                  <div
                    key={day + 1}
                    className="flex flex-col items-center border p-2 rounded bg-gray-200 cursor-pointer"
                    onClick={() => handleOpenModal(day + 1)}
                  >
                    <span className="font-bold text-gray-700">{day + 1}</span>
                    {calendarData[`${year}-${month + 1}-${day + 1}`] !==
                      undefined && (
                      <span className="text-sm bg-gradient-to-r from-[#E04AA9] to-[#B652E2] text-white px-6 py-1 rounded mt-1 text-center">
                        {calendarData[`${year}-${month + 1}-${day + 1}`]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button
              className="btn btn-primary mt-4 w-full bg-[#E04AA9] hover:bg-[#B652E2]"
              onClick={handleSaveAll}
            >
              Save All
            </button>
          </div>
        )}

        {selectedDate && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">
                Set Value for {selectedDate}
              </h3>
              <input
                type="number"
                min="0"
                max="24"
                step="1"
                value={modalValue}
                onChange={(e) => setModalValue(e.target.value)}
                className="input input-bordered w-full mt-4"
              />
              <div className="modal-action">
                <button
                  className="btn btn-outline"
                  onClick={() => setSelectedDate(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary bg-[#E04AA9] hover:bg-[#B652E2]"
                  onClick={handleSaveModal}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarTabs;
