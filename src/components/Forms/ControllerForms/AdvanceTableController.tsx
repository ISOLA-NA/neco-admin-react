// src/components/ControllerForms/AdvanceTable.tsx
import React, { useEffect, useRef, useState } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useApi } from "../../../context/ApiContext";
import { useTranslation } from "react-i18next";

interface AdvanceTableProps {
  onMetaChange?: (data: {
    metaType1: string;
    metaType2: string;
    metaType3?: string;
  }) => void;

  data?: {
    metaType1?: string;
    metaType2?: string | number;
    metaType3?: string;
  };
}

/* ---------------------------------------------------
   🔥 شش دسترسی جدید — همان‌هایی که خواسته بودید
----------------------------------------------------*/
const ACCESS_FLAGS = [
  { key: "AddByActor", labelKey: "AdvanceTable.Access.AddByActor" },
  { key: "EditByActor", labelKey: "AdvanceTable.Access.EditByActor" },
  { key: "DeleteByActor", labelKey: "AdvanceTable.Access.DeleteByActor" },
  { key: "AddByApproval", labelKey: "AdvanceTable.Access.AddByApproval" },
  { key: "EditByApproval", labelKey: "AdvanceTable.Access.EditByApproval" },
  { key: "DeleteByApproval", labelKey: "AdvanceTable.Access.DeleteByApproval" },
];

const buildMetaType3 = (state: Record<string, boolean>) =>
  ACCESS_FLAGS.filter((x) => state[x.key])
    .map((x) => x.key + "-")
    .join("");

/* --------------------------------------------------- */

const AdvanceTable: React.FC<AdvanceTableProps> = ({ onMetaChange, data = {} }) => {
  const { t } = useTranslation();
  const { getAllEntityType } = useApi();

  const [formOptions, setFormOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [selectedForm, setSelectedForm] = useState<string>(data.metaType1 ?? "");

  const [isGalleryMode, setIsGalleryMode] = useState<boolean>(
    String(data.metaType2) === "1"
  );

  /* ------------------------------
     🔥 خواندن metaType3 و ساخت state چک‌باکس‌ها
  ------------------------------*/
  const initialAccess: Record<string, boolean> = {};
  ACCESS_FLAGS.forEach((x) => {
    initialAccess[x.key] = data.metaType3?.includes(x.key + "-") ?? false;
  });

  const [accessState, setAccessState] = useState<Record<string, boolean>>(
    initialAccess
  );

  const toggleAccess = (key: string, checked: boolean) => {
    const next = { ...accessState, [key]: checked };
    setAccessState(next);

    const meta3 = buildMetaType3(next);

    if (onMetaChange) {
      onMetaChange({
        metaType1: selectedForm,
        metaType2: isGalleryMode ? "1" : "0",
        metaType3: meta3,
      });
    }
  };

  /* ------------------------------ */

  useEffect(() => {
    (async () => {
      try {
        const entities = await getAllEntityType();
        setFormOptions(
          entities.map((e: any) => ({
            value: String(e.ID),
            label: e.Name ?? `Entity ${e.ID}`,
          }))
        );
      } catch (err) {
        console.error("Error fetching entity types:", err);
      }
    })();
  }, [getAllEntityType]);

  useEffect(() => {
    setSelectedForm(data.metaType1 ?? "");
    setIsGalleryMode(String(data.metaType2) === "1");

    const next: Record<string, boolean> = {};
    ACCESS_FLAGS.forEach((x) => {
      next[x.key] = data.metaType3?.includes(x.key + "-") ?? false;
    });
    setAccessState(next);

  }, [data.metaType1, data.metaType2, data.metaType3]);

  const prevMetaString = useRef("");
  useEffect(() => {
    if (!onMetaChange) return;

    const meta = {
      metaType1: selectedForm,
      metaType2: isGalleryMode ? "1" : "0",
      metaType3: buildMetaType3(accessState),
    };

    const s = JSON.stringify(meta);
    if (s !== prevMetaString.current) {
      prevMetaString.current = s;
      onMetaChange(meta);
    }

  }, [selectedForm, isGalleryMode, accessState]);

  /* ------------------------------ */

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex flex-col gap-6">

      <div className="flex justify-center">
        <div className="flex flex-col gap-4 w-64">
          <DynamicSelector
            name="Show Form"
            label={t("AdvanceTable.Labels.ShowForm")}
            options={formOptions}
            selectedValue={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              id="galleryMode"
              type="checkbox"
              className="h-5 w-5 text-purple-600 border-gray-300 rounded"
              checked={isGalleryMode}
              onChange={(e) => setIsGalleryMode(e.target.checked)}
            />
            <span className="text-gray-700 font-medium">
              {t("AdvanceTable.Labels.GalleryMode")}
            </span>
          </label>
        </div>
      </div>
      {/* 🔥 چک‌باکس‌های جدید دسترسی */}
      <div className="grid grid-cols-2 gap-3 shadow-sm border border-gray-200 p-3 rounded-lg">
        {ACCESS_FLAGS.map((item) => (
          <label
            key={item.key}
            className="flex items-center gap-2 text-gray-700 text-sm font-medium"
          >
            <input
              type="checkbox"
              checked={accessState[item.key]}
              onChange={(e) => toggleAccess(item.key, e.target.checked)}
              className="h-4 w-4 accent-pink-500 cursor-pointer"
            />
            {t(item.labelKey)}
          </label>
        ))}
      </div>
    </div>
  );
};

export default AdvanceTable;
