// src/components/ControllerForms/InventoryFieldController.tsx
import React, { useEffect, useState } from "react";

interface InventoryFieldProps {
  data?: {
    /** "inventory" | "reserve" */
    metaType1?: string | null;
    /** Min value (number stored as string) */
    metaType2?: string | number | null;
    /** Max value (number stored as string) */
    metaType3?: string | number | null;

    // سایر متاهای عمومی در صورت وجود، بدون استفاده اینجا
    [k: string]: any;
  };
  onMetaChange?: (updated: any) => void;
  resetKey?: number | string;
}

const toStr = (v: any, fallback = "") =>
  v === undefined || v === null ? fallback : String(v);

/**
 * InventoryFieldController
 * - Radio: inventory / reserve  -> writes to metaType1
 * - Inputs: min -> metaType2, max -> metaType3
 */
const InventoryFieldController: React.FC<InventoryFieldProps> = ({
  data = {},
  onMetaChange,
  resetKey, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  const [kind, setKind] = useState<"inventory" | "reserve">(
    (toStr(data.metaType1) as any) === "reserve" ? "reserve" : "inventory"
  );
  const [minVal, setMinVal] = useState<string>(toStr(data.metaType2));
  const [maxVal, setMaxVal] = useState<string>(toStr(data.metaType3));

  // sync when editing existing
  useEffect(() => {
    setKind((toStr(data.metaType1) as any) === "reserve" ? "reserve" : "inventory");
    setMinVal(toStr(data.metaType2));
    setMaxVal(toStr(data.metaType3));
  }, [data.metaType1, data.metaType2, data.metaType3]);

  // push helper
  const push = (partial: Partial<{ metaType1: string; metaType2: string; metaType3: string }>) => {
    const next = {
      metaType1: kind,
      metaType2: minVal,
      metaType3: maxVal,
      ...partial,
    };
    onMetaChange?.(next);
  };

  return (
    <div className="w-full min-w-0">
      {/* Radios */}
      <div className="flex flex-wrap items-center gap-6 mb-4">
        <span className="text-sm font-medium">Type:</span>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="invFieldKind"
            value="inventory"
            checked={kind === "inventory"}
            onChange={() => {
              setKind("inventory");
              push({ metaType1: "inventory" });
            }}
          />
          <span>Inventory</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="invFieldKind"
            value="reserve"
            checked={kind === "reserve"}
            onChange={() => {
              setKind("reserve");
              push({ metaType1: "reserve" });
            }}
          />
          <span>Reserve</span>
        </label>
      </div>

      {/* Min / Max */}
      <div className="grid grid-cols-2 gap-4">
        <div className="min-w-0">
          <label className="block text-sm font-medium mb-1">Min</label>
          <input
            type="number"
            className="w-full rounded border px-2 py-1"
            value={minVal}
            onChange={(e) => {
              setMinVal(e.target.value);
              push({ metaType2: e.target.value });
            }}
          />
        </div>

        <div className="min-w-0">
          <label className="block text-sm font-medium mb-1">Max</label>
          <input
            type="number"
            className="w-full rounded border px-2 py-1"
            value={maxVal}
            onChange={(e) => {
              setMaxVal(e.target.value);
              push({ metaType3: e.target.value });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryFieldController;
