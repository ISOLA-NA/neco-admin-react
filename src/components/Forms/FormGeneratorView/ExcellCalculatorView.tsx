// src/components/ExcellCalculatorView.tsx
import React from "react";

interface ExcellCalculatorViewProps {
  data?: {
    DisplayName?: string;
  };
  /** در صورت نیاز می‌تونی جهت رو مشخص کنی؛ اگر ندی از والد ارث می‌بره */
  dir?: "ltr" | "rtl";
}

const ExcellCalculatorView: React.FC<ExcellCalculatorViewProps> = ({
  data,
  dir,
}) => {
  return (
    <div
      dir={dir}
      className="flex flex-col gap-4 p-6 bg-white rounded-lg border border-gray-300 items-center justify-center"
    >
      {data?.DisplayName && (
        <div className="text-xl font-bold text-gray-800">
          {data.DisplayName}
        </div>
      )}

      {/* به‌جای space-x-4 از gap-4 استفاده شده تا در RTL/LTR یکسان عمل کند */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition duration-300"
        >
          Calculated
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
        >
          Show
        </button>
      </div>
    </div>
  );
};

export default ExcellCalculatorView;
