import React, { useRef, useEffect, useState } from "react";
import { HiDotsHorizontal } from "react-icons/hi";

export interface OptionType {
  value: string;
  label: string;
}

interface SelectorProjectAccessProps {
  label?: string;
  options: OptionType[];
  selectedValue: string;
  onChange: (value: string) => void;
  buttonTitle?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const SelectorProjectAccess: React.FC<SelectorProjectAccessProps> = ({
  label = "Select post",
  options = [],
  selectedValue,
  onChange,
  buttonTitle = "",
  disabled = false,
  loading = false,
  className = "",
}) => {
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
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ایمن‌سازی جستجو در لیبل سلکتور
  const safeToLower = (value: any) =>
    typeof value === "string" ? value.toLowerCase() : "";

  const filteredOptions = searchValue
    ? options.filter((o) =>
        safeToLower(o.label).includes(safeToLower(searchValue))
      )
    : options;

  const selected = options.find((o) => o.value === selectedValue);

  return (
    <div className={`relative flex flex-col gap-1 ${className}`} ref={selectorRef}>
      <label className="block text-xs text-gray-600 mb-1" title={label}>
        {label}
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
        >
          <span className="block w-full truncate text-left">
            {selected ? selected.label : "-- Select --"}
          </span>
          <span className="ml-2 flex items-center">
            <HiDotsHorizontal className="w-4 h-4 text-purple-600" />
          </span>
        </button>
      </div>
      {open && (
        <div
          className="absolute left-0 top-[110%] w-full z-30 bg-white border border-purple-400 rounded shadow-lg max-h-60 overflow-y-auto"
        >
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-purple-400"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              autoFocus
            />
          </div>
          {loading ? (
            <div className="py-2 text-center text-xs text-gray-400">Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="py-2 text-center text-xs text-gray-400">No results found</div>
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
                }`}
                title={option.label}
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
