import React, { ReactNode } from "react";

interface ReusableButtonProps {
  text?: string;
  onClick?: () => void;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "orgGreen"
    | "orgBlue"
    | "orgYellow"
    | "orgRed";
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  loading?: boolean;
  title?: string;
  type?: "button" | "submit" | "reset";
}

const base =
  "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

const sizes = {
  sm: "h-9 px-3 text-sm gap-2",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
};

const iconPads = {
  sm: "h-9 w-9 p-0",
  md: "h-10 w-10 p-0",
  lg: "h-11 w-11 p-0",
};

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400",
  outline:
    "border border-gray-300 text-gray-800 hover:bg-gray-50 focus:ring-gray-400",
  ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",

  // 🎯 رنگ‌های سازمانی
  orgGreen: "bg-[#009f69] text-white hover:bg-[#007f54] focus:ring-[#009f69]",
  orgBlue: "bg-[#005b96] text-white hover:bg-[#004374] focus:ring-[#005b96]",
  orgYellow: "bg-[#f0ad00] text-white hover:bg-[#cc8c00] focus:ring-[#f0ad00]",
  orgRed: "bg-[#d72638] text-white hover:bg-[#a51d2a] focus:ring-[#d72638]",
};

const spinner = (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

const DynamicButton: React.FC<ReusableButtonProps> = ({
  text,
  onClick,
  isDisabled = false,
  leftIcon,
  rightIcon,
  className = "",
  variant = "secondary",
  size = "sm",
  iconOnly = false,
  loading = false,
  title,
  type = "button",
}) => {
  const sizeClasses = iconOnly ? iconPads[size] : sizes[size];
  const contentHidden = iconOnly ? "sr-only" : "";

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizeClasses} ${className}`}
      onClick={onClick}
      disabled={isDisabled || loading}
      title={title}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          {spinner}
          {!iconOnly && <span>Loading…</span>}
        </span>
      ) : (
        <>
          {leftIcon && <span className="-ms-0.5">{leftIcon}</span>}
          {text && <span className={contentHidden}>{text}</span>}
          {rightIcon && <span className="-me-0.5">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default DynamicButton;
