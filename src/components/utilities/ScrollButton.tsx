// src/components/Views/tab/ScrollButton.tsx
import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ScrollButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  size: number;
  ariaLabel: string;
  className?: string;
}

const ScrollButton: React.FC<ScrollButtonProps> = ({
  direction,
  onClick,
  size,
  ariaLabel,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex items-center justify-center w-10 h-10 bg-purple-600 bg-opacity-75 text-white rounded-full hover:bg-opacity-90 transition ${className}`}
    >
      {direction === "left" ? <FiChevronLeft size={size} /> : <FiChevronRight size={size} />}
    </button>
  );
};

export default ScrollButton;
