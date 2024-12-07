// ScrollButton.tsx
import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface ScrollButtonProps {
  direction: 'left' | 'right';
  onClick: () => void;
  size?: number;
  ariaLabel: string;
}

const ScrollButton: React.FC<ScrollButtonProps> = ({
  direction,
  onClick,
  size = 16,
  ariaLabel,
}) => {
  const isLeft = direction === 'left';
  const positionClass = isLeft ? 'left-2' : 'right-2';

  return (
    <button
      className={`absolute top-1/2 transform -translate-y-1/2 ${positionClass} h-8 w-8 bg-white bg-opacity-70 rounded-full shadow-md flex items-center justify-center z-10 block md:hidden`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {isLeft ? (
        <FaChevronLeft size={size} />
      ) : (
        <FaChevronRight size={size} />
      )}
    </button>
  );
};

export default ScrollButton;
