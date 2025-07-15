// src/components/ControllerForms/PfiLookup.tsx
import React, { useState, useEffect, useRef } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useApi } from "../../../context/ApiContext";
import { GetEnumResponse, EntityType } from "../../../services/api.services";

interface PfiLookupProps {
  onMetaChange: (updatedMeta: { metaType1: string; LookupMode: string }) => void;
  data?: { metaType1?: string | number | string[]; LookupMode?: string | number };
}

const PfiLookup: React.FC<PfiLookupProps> = ({ onMetaChange, data = {} }) => {
  const { getAllEntityType, getEnum } = useApi();

  /* ---------------- options ---------------- */
  const [entityTypes, setEntityTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [modeOptions, setModeOptions] = useState<Array<{ value: string; label: string }>>([]);

  /* ---------------- meta state ---------------- */
  const [metaTypes, setMetaTypes] = useState(() => ({
    metaType1:
      data.metaType1 != null
        ? String(Array.isArray(data.metaType1) ? data.metaType1[0] : data.metaType1)
        : "",
    LookupMode: data.LookupMode != null ? String(data.LookupMode) : "",
  }));

  /* -------- sync props→state (فقط در صورت تفاوت) -------- */
  useEffect(() => {
    const next = {
      metaType1:
        data.metaType1 != null
          ? String(Array.isArray(data.metaType1) ? data.metaType1[0] : data.metaType1)
          : "",
      LookupMode: data.LookupMode != null ? String(data.LookupMode) : "",
    };
    setMetaTypes((prev) =>
      prev.metaType1 === next.metaType1 && prev.LookupMode === next.LookupMode
        ? prev
        : next
    );
  }, [data.metaType1, data.LookupMode]);

  /* -------- fetch entity types once -------- */
  useEffect(() => {
    getAllEntityType()
      .then((res: EntityType[]) =>
        setEntityTypes(res.map((e) => ({ value: String(e.ID), label: e.Name })))
      )
      .catch((err) => console.error("Entity types error:", err));
  }, [getAllEntityType]);

  /* -------- fetch lookMode options once -------- */
  useEffect(() => {
    (async () => {
      try {
        const resp: GetEnumResponse | any = await getEnum({ str: "lookMode" });
        const modes = Array.isArray(resp)
          ? resp
          : Object.entries(resp).map(([k, v]) => ({ value: String(v), label: k }));
        setModeOptions(modes);

        /* اگر مقدار جاری نامعتبر است، مقدار پیش‌فرض ست کن */
        const current = metaTypes.LookupMode;
        if (!current || !modes.some((m) => m.value === current)) {
          const defVal = modes[0]?.value ?? "";
          setMetaTypes((prev) =>
            prev.LookupMode === defVal ? prev : { ...prev, LookupMode: defVal }
          );
        }
      } catch (err) {
        console.error("lookMode error:", err);
      }
    })();
    // getEnum فقط یک‌بار فراخوانی می‌شود
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------- propagate meta upward (فقط هنگام تفاوت) -------- */
  const prevMetaStr = useRef("");
  useEffect(() => {
    const str = JSON.stringify(metaTypes);
    if (str !== prevMetaStr.current) {
      prevMetaStr.current = str;
      onMetaChange(metaTypes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaTypes]); // ← onMetaChange حذف شد

  /* ---------------- handlers ---------------- */
  const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setMetaTypes((p) => ({ ...p, metaType1: e.target.value }));

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setMetaTypes((p) => ({ ...p, LookupMode: e.target.value }));

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex justify-center">
      <div className="flex flex-col gap-4 w-64">
        <DynamicSelector
          name="entityType"
          label="Select Entity Type"
          options={entityTypes}
          selectedValue={metaTypes.metaType1}
          onChange={handleEntityTypeChange}
        />
        <DynamicSelector
          name="mode"
          label="Modes"
          options={modeOptions}
          selectedValue={metaTypes.LookupMode}
          onChange={handleModeChange}
        />
      </div>
    </div>
  );
};

export default PfiLookup;
