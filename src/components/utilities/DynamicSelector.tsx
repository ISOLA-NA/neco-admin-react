import React, { useState, useRef, useEffect, useMemo } from "react";
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

  /** جدید */
  searchable?: boolean;
  searchPlaceholder?: string;
  clearable?: boolean;
  onClear?: () => void;
  placeholder?: string;
  noOptionsText?: string;

  /** کلاس سفارشی برای لیبل (برای هماهنگی با چک‌باکس‌ها در AddColumnForm) */
  labelClassName?: string;
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

  /** پیش‌فرض‌های جدید */
  searchable = true,
  searchPlaceholder,
  clearable = true,
  onClear,
  placeholder,
  noOptionsText,

  /** کلاس لیبل */
  labelClassName,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const optionStyle: React.CSSProperties = {
    height: "2.25rem",
    lineHeight: "2.25rem",
  };

  const selectedOption = options.find((o) => o.value === selectedValue);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const q = searchQuery.trim().toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, searchable, searchQuery]);

  const handleToggleDropdown = () => {
    if (!disabled && !loading) {
      setOpen((p) => !p);
      setTimeout(() => {
        // فوکوس روی سرچ یا لیست بعد از باز شدن
        if (searchable && listRef.current) {
          const input = listRef.current.querySelector(
            "input[data-role='search']"
          ) as HTMLInputElement | null;
          input?.focus();
        }
      }, 0);
    }
  };

  const emitChange = (value: string) => {
    onChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  const handleOptionClick = (value: string) => {
    emitChange(value);
    setOpen(false);
    setCustomInput("");
    setSearchQuery("");
    setActiveIndex(-1);
    buttonRef.current?.focus();
  };

  const handleAddCustomOption = () => {
    if (customInput.trim()) {
      emitChange(customInput.trim());
      setOpen(false);
      setCustomInput("");
      setSearchQuery("");
      setActiveIndex(-1);
      buttonRef.current?.focus();
    }
  };

  const handleClear = (e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation?.();
    if (!clearable || disabled) return;
    emitChange("");
    onClear?.();
    setSearchQuery("");
    setCustomInput("");
    setActiveIndex(-1);
    // باز نکنه دراپ‌داون
    setOpen(false);
    buttonRef.current?.focus();
  };

  // بستن با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // مدیریت کیبورد
  const onButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setTimeout(() => {
          if (searchable) {
            const input = listRef.current?.querySelector(
              "input[data-role='search']"
            ) as HTMLInputElement | null;
            input?.focus();
          } else {
            listRef.current?.focus();
          }
        }, 0);
      }
    } else if (
      (e.key === "Backspace" || e.key === "Delete") &&
      clearable &&
      selectedValue
    ) {
      e.preventDefault();
      handleClear(e.nativeEvent);
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }

    const lastIndex = filteredOptions.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((idx) => (idx < lastIndex ? idx + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((idx) => (idx > 0 ? idx - 1 : lastIndex));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && filteredOptions[activeIndex]) {
        handleOptionClick(filteredOptions[activeIndex].value);
      }
    } else if (e.key === "Tab") {
      // بستن روی تب
      setOpen(false);
    }
  };

  // اسکرول خودکار به آیتم فعال
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el =
      listRef.current?.querySelector<HTMLDivElement>(
        `[data-index="${activeIndex}"]`
      );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  // کلاس‌های پدینگ دکمه با توجه به آیکن‌ها
  const triggerPadding = classNames(
    leftIcon ? "ltr:pl-8 rtl:pr-8" : "ltr:pl-2 rtl:pr-2",
    // جا برای caret و clear
    clearable && selectedValue && !disabled
      ? "ltr:pr-10 rtl:pl-10"
      : "ltr:pr-8 rtl:pl-8"
  );

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
          className={classNames(
            "block mb-1",
            labelClassName
              ? labelClassName // اگر خواستید مثل چک‌باکس‌ها: "text-gray-700 font-medium"
              : "text-xs text-gray-600"
          )}
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
            ref={buttonRef}
            type="button"
            onClick={handleToggleDropdown}
            onKeyDown={onButtonKeyDown}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={name ? `${name}-listbox` : undefined}
            className={classNames(
              "w-full text-xs h-9 border border-purple-500 rounded transition focus:outline-none focus:ring-1 focus:ring-purple-500 flex items-center",
              "bg-white",
              triggerPadding
            )}
          >
            <span className="block w-full truncate whitespace-nowrap overflow-hidden ltr:text-left rtl:text-justify">
              {loading
                ? t("Loading...", { defaultValue: "Loading..." })
                : selectedOption
                ? selectedOption.label
                : selectedValue || placeholder || t("", { defaultValue: "" })}
            </span>

            {/* دکمه پاک کردن */}
            {clearable && !disabled && !!selectedValue && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-1/2 transform -translate-y-1/2 ltr:right-7 rtl:left-7 rounded hover:bg-gray-100 p-1"
                aria-label={t("Clear selection", {
                  defaultValue: "Clear selection",
                })}
                title={t("Clear", { defaultValue: "Clear" })}
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </button>
            )}

            {/* caret */}
            <svg
              className="absolute top-1/2 transform -translate-y-1/2 ltr:right-2 rtl:left-2 w-4 h-4 text-gray-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
            <div
              id={name ? `${name}-listbox` : undefined}
              role="listbox"
              aria-activedescendant={
                activeIndex >= 0 ? `${name}-opt-${activeIndex}` : undefined
              }
              tabIndex={-1}
              ref={listRef}
              onKeyDown={onListKeyDown}
              className="absolute left-0 top-full mt-1 w-full bg-white border border-purple-500 rounded shadow-lg z-10 max-h-60 overflow-auto"
            >
              {/* سرچ */}
              {searchable && (
                <div className="p-2 border-b border-gray-200">
                  <input
                    data-role="search"
                    type="text"
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder={
                      searchPlaceholder ||
                      t("Search...", { defaultValue: "Search..." })
                    }
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setActiveIndex(-1);
                    }}
                  />
                </div>
              )}

              {/* ورودی ساخت گزینه دلخواه */}
              {allowCustom && (
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder={t("Type custom value...", {
                      defaultValue: "Type custom value...",
                    })}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomOption();
                      }
                    }}
                  />
                  {allowCustom && customInput.trim() !== "" && (
                    <button
                      onClick={handleAddCustomOption}
                      className="mt-2 w-full text-xs border border-purple-500 text-purple-700 rounded px-2 py-1 hover:bg-purple-50"
                      title={t("Add", { defaultValue: "Add" })}
                    >
                      {t('Add "{{value}}"', {
                        defaultValue: 'Add "{{value}}"',
                        value: customInput,
                      })}
                    </button>
                  )}
                </div>
              )}

              {/* گزینه‌ها */}
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-500">
                  {noOptionsText ||
                    t("No results", { defaultValue: "No results" })}
                </div>
              ) : (
                filteredOptions.map((option, idx) => {
                  const isSelected = option.value === selectedValue;
                  const isActive = idx === activeIndex;
                  return (
                    <div
                      key={option.value}
                      id={name ? `${name}-opt-${idx}` : undefined}
                      data-index={idx}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseLeave={() => setActiveIndex(-1)}
                      onClick={() => handleOptionClick(option.value)}
                      style={optionStyle}
                      className={classNames(
                        "cursor-pointer text-xs px-2 whitespace-nowrap flex items-center",
                        isActive ? "bg-purple-100" : "hover:bg-purple-50",
                        isSelected ? "font-semibold text-purple-700" : ""
                      )}
                    >
                      <span className="block w-full truncate whitespace-nowrap overflow-hidden ltr:text-left rtl:text-justify">
                        {option.label}
                      </span>
                      {isSelected && (
                        <svg
                          className="w-4 h-4 ltr:ml-auto rtl:mr-auto"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  );
                })
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
