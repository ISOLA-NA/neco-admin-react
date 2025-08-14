import React, { useState, useRef, useEffect } from "react";
import { classNames } from "primereact/utils";
import { useTranslation } from "react-i18next";

interface Option {
  value: string;
  label: string;
}

interface DynamicSelectorProps {
  name?: string;
  options: Option[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: string;
  showButton?: boolean;
  onButtonClick?: () => void;
  leftIcon?: React.ReactNode;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  allowCustom?: boolean;
}

const DynamicSelector: React.FC<DynamicSelectorProps> = ({
  name,
  options = [],
  selectedValue,
  onChange,
  label = "Select",
  showButton = false,
  onButtonClick,
  leftIcon,
  error = false,
  errorMessage = "",
  className,
  disabled = false,
  loading = false,
  allowCustom = false,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggleDropdown = () => {
    if (!disabled && !loading) {
      setOpen(!open);
    }
  };

  const handleOptionClick = (value: string) => {
    onChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
    setCustomInput("");
  };

  const handleAddCustomOption = () => {
    if (customInput.trim()) {
      onChange({
        target: { name, value: customInput },
      } as React.ChangeEvent<HTMLSelectElement>);
      setOpen(false);
      setCustomInput("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const optionStyle = {
    height: "2.25rem",
    lineHeight: "2.25rem",
  };

  const selectedOption = options.find((o) => o.value === selectedValue);

  return (
    <div
      ref={containerRef}
      className={classNames(
        "relative flex flex-col gap-1",
        className,
        disabled ? "opacity-75 cursor-not-allowed" : ""
      )}
    >
      {label && (
        <label
          htmlFor={name}
          className="block text-xs text-gray-600 mb-1"
          title={label}
        >
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          {leftIcon && (
            <div className="absolute top-1/2 transform -translate-y-1/2 text-purple-600 pointer-events-none ltr:left-2 rtl:right-2">
              {leftIcon}
            </div>
          )}

          <button
            type="button"
            onClick={handleToggleDropdown}
            disabled={disabled}
            className={classNames(
              "w-full text-xs h-9 border border-purple-500 rounded transition focus:outline-none focus:ring-1 focus:ring-purple-500 flex items-center justify-between ltr:pl-2 ltr:pr-2 rtl:pr-2 rtl:pl-2",
              disabled ? "bg-gray-300 text-gray-800" : "bg-white"
            )}
          >
            <span className="block w-full truncate whitespace-nowrap overflow-hidden ltr:text-left rtl:text-justify">
              {loading
                ? "Loading..."
                : selectedOption
                ? selectedOption.label
                : selectedValue}
            </span>

            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {open && (
            <div className="absolute left-0 top-full mt-1 w-full bg-white border border-purple-500 rounded shadow-lg z-10 max-h-60 overflow-auto">
              {allowCustom && (
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                    placeholder="Type custom value..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomOption();
                      }
                    }}
                  />
                </div>
              )}
              {options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  style={optionStyle}
                  className="cursor-pointer text-xs px-2 hover:bg-purple-100"
                >
                  <span className="block w-full truncate whitespace-nowrap overflow-hidden ltr:text-left rtl:text-justify">
                    {option.label}
                  </span>
                </div>
              ))}
              {allowCustom && customInput.trim() !== "" && (
                <div
                  onClick={handleAddCustomOption}
                  style={optionStyle}
                  className="cursor-pointer text-xs ltr:px-2 rtl:px-2 hover:bg-purple-100 whitespace-nowrap font-semibold"
                >
                  Add "{customInput}"
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="absolute top-1/2 transform -translate-y-1/2 ltr:right-2 rtl:left-2">
              <svg
                className="animate-spin h-4 w-4 text-purple-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            </div>
          )}
        </div>

        {showButton && !loading && (
          <button
            type="button"
            onClick={onButtonClick}
            disabled={disabled}
            className={classNames(
              "bg-purple-600 text-white px-3 py-1 rounded text-xs shadow-sm transition-colors duration-300 h-9 flex items-center justify-center ltr:ml-2 rtl:mr-2",
              disabled ? "bg-gray-500 cursor-not-allowed" : "hover:bg-pink-500"
            )}
            title="اضافه کردن"
          >
            ...
          </button>
        )}
      </div>

      {error && errorMessage && (
        <p className="mt-1 text-red-500 text-xs">{errorMessage}</p>
      )}
    </div>
  );
};

export default DynamicSelector;
