import React, { ReactNode } from "react";

interface ReusableButtonProps {
  text: string;
  onClick: () => void;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

const DynamicButton: React.FC<ReusableButtonProps> = ({
  text,
  onClick,
  isDisabled = false,
  leftIcon,
  rightIcon,
  className = "",
}) => {
  return (
    <button
      className={`btn w-48 flex items-center justify-center ${
        isDisabled
          ? "bg-blue-300 text-gray-500 cursor-not-allowed"
          : "btn-primary"
      } ${className}`}
      onClick={onClick}
      disabled={isDisabled}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {text}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default DynamicButton;
