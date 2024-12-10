import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const DynamicButton: React.FC<IconButtonProps> = ({
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors duration-300 ${className}`}
      {...props}
    >
      {leftIcon && <span className="flex items-center">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </button>
  );
};

export default DynamicButton;
