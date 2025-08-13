// src/components/ControllerForms/ViewControllers/YesNoView.tsx
import React from "react";

interface YesNoViewProps {
  data?: {
    metaType1?: "yes" | "no";
    DisplayName?: string;
  };
  /** در صورت نیاز می‌تونی جهت رو هم مستقیماً بدی؛ پیش‌فرض از والد می‌گیره */
  dir?: "ltr" | "rtl";
}

const YesNoView: React.FC<YesNoViewProps> = ({ data, dir }) => {
  const selected = data?.metaType1 || "yes";

  return (
    <div
      dir={dir}
      className="p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center gap-4"
    >
      {data?.DisplayName && (
        <span className="text-sm font-medium text-gray-700">
          {data.DisplayName}
        </span>
      )}

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="yesnoView"
            value="yes"
            checked={selected === "yes"}
            disabled
            className="appearance-none w-4 h-4 rounded-full border-2 border-purple-500 checked:bg-purple-500"
            readOnly
          />
          <span className="text-gray-800">Yes</span>
        </label>

        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="yesnoView"
            value="no"
            checked={selected === "no"}
            disabled
            className="appearance-none w-4 h-4 rounded-full border-2 border-purple-500 checked:bg-purple-500"
            readOnly
          />
          <span className="text-gray-800">No</span>
        </label>
      </div>
    </div>
  );
};

export default YesNoView;
