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
  return (
    <button
      className='absolute top-0 bottom-0 m-auto h-8 w-8 bg-white bg-opacity-50 rounded-full shadow-md flex items-center justify-center z-10 md:hidden'
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {direction === 'left' ? <FaChevronLeft size={size} /> : <FaChevronRight size={size} />}
    </button>
  );
};

export default ScrollButton;
