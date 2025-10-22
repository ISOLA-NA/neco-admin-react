import React, { useEffect, useState } from "react";
import { useApi } from "../../../context/ApiContext";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useTranslation } from "react-i18next";

/** شکل داده‌ی ذخیره‌شده در کنترلر Inventory */
type MetaJson = {
  InventorySumEntityFieldID?: number | string;
  Inventory1EntityFieldID?: number | string;
  Inventory2EntityFieldID?: number | string;
  Inventory3EntityFieldID?: number | string;
  Inventory4EntityFieldID?: number | string;
  Inventory5EntityFieldID?: number | string;

  Unit1EntityFieldID?: number | string;
  Unit2EntityFieldID?: number | string;
  Unit3EntityFieldID?: number | string;
  Unit4EntityFieldID?: number | string;
  Unit5EntityFieldID?: number | string;

  Unit2RatioEntityFieldID?: number | string;
  Unit3RatioEntityFieldID?: number | string;
  Unit4RatioEntityFieldID?: number | string;
  Unit5RatioEntityFieldID?: number | string;

  ReserveEntityFieldID?: number | string;
};

interface InventoryViewProps {
  data?: {
    metaType1?: string | number | null; // EntityType منبع
    metaTypeJson?: string;              // JSON انتخاب‌ها
  };
}

const toStr = (v: any, fallback = "") =>
  v === undefined || v === null ? fallback : String(v);

const parseJson = (s?: string | null): MetaJson => {
  try {
    const j = s ? JSON.parse(s) : {};
    return typeof j === "object" && j ? j : {};
  } catch {
    return {};
  }
};

const InventoryView: React.FC<InventoryViewProps> = ({ data }) => {
  const { t } = useTranslation("Inventory");
  const { getEntityFieldByEntityTypeId } = useApi();

  const metaJson = parseJson(data?.metaTypeJson);
  const [fields, setFields] = useState<any[]>([]);

  // فهرست فیلدهای منبع
  useEffect(() => {
    const id = Number(data?.metaType1);
    if (!isNaN(id) && id > 0) {
      getEntityFieldByEntityTypeId(id)
        .then((r) => setFields(Array.isArray(r) ? r : []))
        .catch(console.error);
    } else {
      setFields([]);
    }
  }, [data?.metaType1, getEntityFieldByEntityTypeId]);

  const fieldOptions = fields.map((f) => ({
    value: String(f.ID),
    label: f.DisplayName,
  }));

  // یک رندرکننده‌ی سلکتِ فقط-نمایش
  const RSel: React.FC<{
    name: string;
    label: string;
    value?: string | number | null;
  }> = ({ name, label, value }) => (
    <DynamicSelector
      name={name}
      label={label}
      options={fieldOptions}
      selectedValue={toStr(value)}
      onChange={() => {}}
      disabled
    />
  );

  return (
    <div className="p-4">
      {/* دو ستون: چپ (Inventories + Reserve) | راست (Units) */}
      <div className="grid grid-cols-2 gap-6 min-w-0">
        {/* ستون چپ: فقط اینونتوری‌ها و رزرو */}
        <div className="flex flex-col gap-3 min-w-0">
          {/* ردیف 1: InventorySum | Inventory1 | Inventory2 */}
          <div className="grid grid-cols-3 gap-3 min-w-0">
            <RSel
              name="invSum"
              label={t("InventorySum")}
              value={metaJson.InventorySumEntityFieldID}
            />
            <RSel
              name="inv1"
              label={t("Inventory1")}
              value={metaJson.Inventory1EntityFieldID}
            />
            <RSel
              name="inv2"
              label={t("Inventory2")}
              value={metaJson.Inventory2EntityFieldID}
            />
          </div>

          {/* ردیف 2: Inventory3 | Inventory4 | Inventory5 */}
          <div className="grid grid-cols-3 gap-3 min-w-0">
            <RSel
              name="inv3"
              label={t("Inventory3")}
              value={metaJson.Inventory3EntityFieldID}
            />
            <RSel
              name="inv4"
              label={t("Inventory4")}
              value={metaJson.Inventory4EntityFieldID}
            />
            <RSel
              name="inv5"
              label={t("Inventory5")}
              value={metaJson.Inventory5EntityFieldID}
            />
          </div>

          {/* Reserve */}
          <div className="grid grid-cols-3 gap-3 min-w-0">
            <RSel
              name="reserve"
              label={t("Reserve")}
              value={metaJson.ReserveEntityFieldID}
            />
            <div className="min-w-0" />
            <div className="min-w-0" />
          </div>
        </div>

        {/* ستون راست: Unit names و Ratios دقیقاً مطابق تصاویر */}
        <div className="flex flex-col gap-3 min-w-0 pr-2">
          {/* ردیف 1: Unit1Name | Unit2Name | Unit3Name */}
          <div className="grid grid-cols-3 gap-3 min-w-0">
            <RSel name="u1" label={t("Unit1Name")} value={metaJson.Unit1EntityFieldID} />
            <RSel name="u2" label={t("Unit2Name")} value={metaJson.Unit2EntityFieldID} />
            <RSel name="u3" label={t("Unit3Name")} value={metaJson.Unit3EntityFieldID} />
          </div>

          {/* ردیف 2: Unit4Name | Unit5Name | Unit2Ratio */}
          <div className="grid grid-cols-3 gap-3 min-w-0">
            <RSel name="u4" label={t("Unit4Name")} value={metaJson.Unit4EntityFieldID} />
            <RSel name="u5" label={t("Unit5Name")} value={metaJson.Unit5EntityFieldID} />
            <RSel name="r2" label={t("Unit2Ratio")} value={metaJson.Unit2RatioEntityFieldID} />
          </div>

          {/* ردیف 3: Unit3Ratio | Unit4Ratio | Unit5Ratio */}
          <div className="grid grid-cols-3 gap-3 min-w-0">
            <RSel name="r3" label={t("Unit3Ratio")} value={metaJson.Unit3RatioEntityFieldID} />
            <RSel name="r4" label={t("Unit4Ratio")} value={metaJson.Unit4RatioEntityFieldID} />
            <RSel name="r5" label={t("Unit5Ratio")} value={metaJson.Unit5RatioEntityFieldID} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryView;
