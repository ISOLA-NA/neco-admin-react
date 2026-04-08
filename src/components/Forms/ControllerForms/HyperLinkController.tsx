// src/components/HyperLinkController.tsx
import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { useTranslation } from "react-i18next";

interface HyperLinkControllerProps {
  onMetaChange: (meta: {
    metaType1: string;
    metaType2: string;
    metaType3: string | null;
    metaType4: string | null;
  }) => void;

  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
    metaType4?: string;
  };

  isDisable?: boolean;
}

const HyperLinkController: React.FC<HyperLinkControllerProps> = ({
  onMetaChange,
  data = {},
  isDisable = false,
}) => {
  const { t } = useTranslation();

  /* ---------------- state ---------------- */
  const [metaTypes, setMetaTypes] = useState({
    metaType1: data.metaType1 ?? "",
    metaType2: "hyper",
    metaType3: data.metaType3 ?? null,
    metaType4: data.metaType4 ?? null,
  });

  /* ----------- keep state in-sync with props ----------- */
  useEffect(() => {
    /* اگر هیچ تغییری در مقادیر جدید نسبت به استیت نیست، ریست نکن */
    setMetaTypes((prev) => {
      const next = {
        metaType1: data.metaType1 ?? "",
        metaType2: "hyper",
        metaType3: data.metaType3 ?? null,
        metaType4: data.metaType4 ?? null,
      };

      return prev.metaType1 === next.metaType1 &&
        prev.metaType3 === next.metaType3 &&
        prev.metaType4 === next.metaType4
        ? prev
        : next;
    });
  }, [data.metaType1, data.metaType3, data.metaType4]);

  /* ------------- propagate to parent ------------- */
  useEffect(() => {
    onMetaChange(metaTypes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaTypes]);

  /* --------------- handlers --------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMetaTypes((prev) => ({ ...prev, metaType1: newValue }));
  };

  /* --------------- UI --------------- */
  return (
    <div className="mt-10 bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
      <div className="mb-4 flex items-center gap-2">
        <span className="mr-2 font-medium">
          {t("HyperLinkController.FormatUrlAs")}
        </span>
        <input type="radio" checked readOnly className="mr-1" />
        <span className="font-medium text-gray-700">Hyperlink</span>
      </div>

      <DynamicInput
        name={t("HyperLinkController.HyperLinkLabel")}
        type="text"
        value={metaTypes.metaType1}
        onChange={handleChange}
        placeholder=" "
        disabled={isDisable}
        className="w-full p-2 border rounded focus:outline-none focus:border-gray-700"
      />
    </div>
  );
};

export default HyperLinkController;