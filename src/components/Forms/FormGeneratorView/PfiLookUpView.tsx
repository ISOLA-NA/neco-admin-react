// src/components/PfiLookupView.tsx
import React, { useState } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { FaTrash, FaEye } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface PfiLookupViewProps {
  data?: {
    DisplayName?: string;
  };
}

const PfiLookupView: React.FC<PfiLookupViewProps> = ({ data }) => {
  const { t } = useTranslation();

  const [displayName, setDisplayName] = useState<string>(
    data?.DisplayName || ""
  );

  const handleReset = () => {
    setDisplayName("");
  };

  return (
    <div className="flex flex-col items-center w-full mt-10">
      {/* ردیف بالا: دکمه Reset، ورودی نمایش DisplayName و دکمه View */}
      <div className="flex items-center gap-2 w-full">
        {displayName && (
          <button
            type="button"
            onClick={handleReset}
            title={t("PfiLookupView.Buttons.ResetDisplayName")}
            className="inline-flex items-center justify-center bg-red-500 text-white p-1 rounded hover:bg-red-700 transition duration-300"
          >
            <FaTrash size={16} />
          </button>
        )}

        <DynamicInput
          name={displayName || t("PfiLookupView.Labels.DisplayName")}
          type="text"
          placeholder={t("PfiLookupView.Placeholders.NoDisplayName")}
          disabled
          className="flex-grow -mt-6"
        />

        <button
          type="button"
          className="inline-flex items-center gap-2 px-2 py-1 bg-purple-500 text-white font-semibold rounded transition duration-300 cursor-not-allowed"
          disabled
        >
          <FaEye size={16} />
          {t("PfiLookupView.Buttons.View")}
        </button>
      </div>
    </div>
  );
};

export default PfiLookupView;
