// src/components/ExcellCalculatorView.tsx
import React from "react";

interface ExcellCalculatorViewProps {
  data?: {
    DisplayName?: string;
  };
}

const ExcellCalculatorView: React.FC<ExcellCalculatorViewProps> = ({ data }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-gray-300">
      {data?.DisplayName && (
        <div className="mb-4 text-xl font-bold text-gray-800">
          {data.DisplayName}
        </div>
      )}
      <div className="flex space-x-4">
        <button
          type="button"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
        >
          Calculated
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
        >
          Show
        </button>
      </div>
    </div>
  );
};

export default ExcellCalculatorView;
