// src/components/ControllerForms/AdvanceTable.tsx
import React, { useEffect, useRef, useState } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useApi } from "../../../context/ApiContext";

interface AdvanceTableProps {
  /** فراخوانی می‌شود وقتی metaType1 یا metaType2 تغییر کند */
  onMetaChange?: (data: { metaType1: string; metaType2: string }) => void;
  /** مقادیر اولیه در حالت ویرایش */
  data?: { metaType1?: string; metaType2?: string | number };
}

const AdvanceTable: React.FC<AdvanceTableProps> = ({
  onMetaChange,
  data = {},
}) => {
  const { getAllEntityType } = useApi();

  /* ---------- option list ---------- */
  const [formOptions, setFormOptions] = useState<
    { value: string; label: string }[]
  >([]);

  /* ---------- local state ---------- */
  const [selectedForm, setSelectedForm] = useState<string>(
    data.metaType1 ?? ""
  );
  const [isGalleryMode, setIsGalleryMode] = useState<boolean>(
    String(data.metaType2) === "1"
  );

  /* ---------- fetch entity types ONCE ---------- */
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

  /* ---------- sync props→state (فقط هنگام تفاوت) ---------- */
  useEffect(() => {
    setSelectedForm((p) => (p === (data.metaType1 ?? "") ? p : data.metaType1 ?? ""));
    setIsGalleryMode((p) => p === (String(data.metaType2) === "1") ? p : String(data.metaType2) === "1");
  }, [data.metaType1, data.metaType2]);

  /* ---------- propagate meta up (فقط هنگام تغییر واقعی) ---------- */
  const prevMetaString = useRef("");
  useEffect(() => {
    if (!onMetaChange) return;
    const meta = {
      metaType1: selectedForm,
      metaType2: isGalleryMode ? "1" : "0",
    };
    const s = JSON.stringify(meta);
    if (s !== prevMetaString.current) {
      prevMetaString.current = s;
      onMetaChange(meta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedForm, isGalleryMode]);

  /* ---------- UI ---------- */
  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex justify-center">
      <div className="flex flex-col gap-4 w-64">
        <DynamicSelector
          name="Show Form"
          label="Show Form"
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
          <span className="text-gray-700 font-medium">Gallery mode</span>
        </label>
      </div>
    </div>
  );
};

export default AdvanceTable;
