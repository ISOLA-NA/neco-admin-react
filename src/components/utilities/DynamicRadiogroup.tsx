// src/utilities/DynamicRadiogroup.tsx

import React from 'react';

interface DynamicRadioGroupProps {
  options: { value: string; label: string }[];
  title: string;
  name: string;
  selectedValue: string;
  onChange: (selectedValue: string) => void;
  className?: string;

  /**
   * اگر true باشد، یعنی کاربر روی ردیف جدول کلیک کرده و انتظار داریم
   * رادیوها به‌صورت کنترل‌شده (با checked) عمل کنند؛
   * در غیر این صورت از defaultChecked استفاده خواهد شد.
   */
  isRowClicked: boolean;
}

const DynamicRadioGroup: React.FC<DynamicRadioGroupProps> = ({
  options,
  title,
  name,
  selectedValue,
  onChange,
  className,
  isRowClicked,
}) => {
  return (
    <div className={`flex items-start space-x-4 ${className || ''}`}>
      <span className='text-base font-semibold whitespace-nowrap'>{title}</span>
      <div className='flex flex-wrap items-center gap-2'>
        {options.map(option => {
          const radioId = `${name}-${option.value}`;
          return (
            <label
              key={`${option.value}-${isRowClicked ? "controlled" : "uncontrolled"}`} // کلید منحصر به فرد
              htmlFor={radioId}
              className='flex items-center cursor-pointer space-x-1 text-sm'
            >
              <input
                id={radioId}
                type='radio'
                name={name}
                value={option.value}
                {...(isRowClicked
                  ? { checked: selectedValue === option.value }
                  : { defaultChecked: selectedValue === option.value })}
                onChange={(e) => onChange(e.target.value)}
                className='radio radio-primary'
              />
              <span className='text-gray-700'>{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicRadioGroup;
