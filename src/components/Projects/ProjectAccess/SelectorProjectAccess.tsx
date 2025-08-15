import React, { useRef, useEffect, useState } from "react";
import { HiDotsHorizontal } from "react-icons/hi";
import { useTranslation } from "react-i18next";

export interface OptionType {
  value: string;
  label: string;
}

interface SelectorProjectAccessProps {
  label?: string; // اگر بدی، همون نمایش داده میشه؛ وگرنه ترجمه استفاده میشه
  options: OptionType[];
  selectedValue: string;
  onChange: (value: string) => void;
  buttonTitle?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const SelectorProjectAccess: React.FC<SelectorProjectAccessProps> = ({
  // ❌ قبلاً: label = "Select post"  → باعث نادیده گرفتن ترجمه می‌شد
  label, // بدون پیش‌فرض؛ تا ترجمه اعمال شود
  options = [],
  selectedValue,
  onChange,
  buttonTitle = "",
  disabled = false,
  loading = false,
  className = "",
}) => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isRtl = dir === "rtl";

  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchValue("");
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const safeToLower = (v: any) =>
    typeof v === "string" ? v.toLowerCase() : "";

  const filteredOptions = searchValue
    ? options.filter((o) =>
        safeToLower(o.label).includes(safeToLower(searchValue))
      )
    : options;

  const selected = options.find((o) => o.value === selectedValue);

  // --- ترجمه‌ها (با fallback در صورت نبودن کلید) ---
  const labelText =
    label ?? t("ProjectAccess.SelectPost", { defaultValue: "Select post" });
  const selectPlaceholder = t("ProjectAccess.SelectPlaceholder", {
    defaultValue: "-- Select --",
  });
  const searchPlaceholder = t("ProjectAccess.Search", {
    defaultValue: "Search...",
  });
  const loadingText = t("ProjectAccess.Loading", {
    defaultValue: "Loading...",
  });
  const noResultsText = t("ProjectAccess.NoResultsFound", {
    defaultValue: "No results found",
  });

  return (
    <div
      className={`relative flex flex-col gap-1 ${className}`}
      ref={selectorRef}
      dir={dir}
    >
      <label className="block text-xs text-gray-600 mb-1" title={labelText}>
        {labelText}
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          disabled={disabled || loading}
          className={`w-full flex items-center justify-between border border-purple-400 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-purple-400 transition min-h-[2.25rem] relative ${
            disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
          }`}
          style={{ minWidth: 140 }}
          title={buttonTitle}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span
            className={`block w-full truncate ${
              isRtl ? "text-right" : "text-left"
            }`}
          >
            {selected ? selected.label : selectPlaceholder}
          </span>
          <span className={`${isRtl ? "mr-2" : "ml-2"} flex items-center`}>
            <HiDotsHorizontal className="w-4 h-4 text-purple-600" />
          </span>
        </button>
      </div>

      {open && (
        <div
          className={`absolute ${
            isRtl ? "right-0" : "left-0"
          } top-[110%] w-full z-30 bg-white border border-purple-400 rounded shadow-lg max-h-60 overflow-y-auto`}
          role="listbox"
        >
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              className={`w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-purple-400 ${
                isRtl ? "text-right" : "text-left"
              }`}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              autoFocus
              dir={dir}
            />
          </div>

          {loading ? (
            <div className="py-2 text-center text-xs text-gray-400">
              {loadingText}
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="py-2 text-center text-xs text-gray-400">
              {noResultsText}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setSearchValue("");
                }}
                className={`cursor-pointer text-xs px-3 py-2 hover:bg-purple-100 transition truncate ${
                  selectedValue === option.value
                    ? "bg-purple-50 font-bold text-purple-700"
                    : ""
                } ${isRtl ? "text-right" : "text-left"}`}
                title={option.label}
                role="option"
                aria-selected={selectedValue === option.value}
                dir={dir}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SelectorProjectAccess;
