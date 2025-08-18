// src/components/ControllerForms/PfiLookup.tsx
import React, { useState, useEffect, useRef } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useApi } from "../../../context/ApiContext";
import { GetEnumResponse, EntityType } from "../../../services/api.services";
import { useTranslation } from "react-i18next";

interface PfiLookupProps {
  onMetaChange: (updatedMeta: {
    metaType1: string;
    LookupMode: string;
  }) => void;
  data?: {
    metaType1?: string | number | string[];
    LookupMode?: string | number;
  };
}

const PfiLookup: React.FC<PfiLookupProps> = ({ onMetaChange, data = {} }) => {
  const { t } = useTranslation();
  const { getAllEntityType, getEnum } = useApi();

  /* ---------------- options ---------------- */
  const [entityTypes, setEntityTypes] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [modeOptions, setModeOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  /* ---------------- meta state ---------------- */
  const [metaTypes, setMetaTypes] = useState(() => ({
    metaType1:
      data.metaType1 != null
        ? String(
            Array.isArray(data.metaType1) ? data.metaType1[0] : data.metaType1
          )
        : "",
    LookupMode: data.LookupMode != null ? String(data.LookupMode) : "",
  }));

  // آخرین مقدار state برای جلوگیری از بازنویسی ناخواسته توسط افکت async
  const metaRef = useRef(metaTypes);
  useEffect(() => {
    metaRef.current = metaTypes;
  }, [metaTypes]);

  /* -------- sync props→state (فقط در صورت تفاوت) -------- */
  useEffect(() => {
    const next = {
      metaType1:
        data.metaType1 != null
          ? String(
              Array.isArray(data.metaType1) ? data.metaType1[0] : data.metaType1
            )
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

        const modes: Array<{ value: string; label: string }> = Array.isArray(
          resp
        )
          ? resp.map((x: any) =>
              typeof x === "object" && x !== null
                ? {
                    value: String((x as any).value ?? x.id ?? x.key ?? ""),
                    label: String(
                      (x as any).label ??
                        (x as any).name ??
                        (x as any).text ??
                        ""
                    ),
                  }
                : { value: String(x), label: String(x) }
            )
          : Object.entries(resp).map(([k, v]) => ({
              value: String(v),
              label: String(k),
            }));

        setModeOptions(modes);

        /* اگر مقدار جاری نامعتبر است، مقدار پیش‌فرض ست کن
           — اما از آخرین state استفاده کن تا انتخاب کاربر/پراپز overwrite نشه */
        const current = (metaRef.current?.LookupMode ?? "").trim();
        const hasCurrentInList = modes.some((m) => m.value === current);
        if (!current || !hasCurrentInList) {
          const defVal = modes[0]?.value ?? "";
          if (defVal && defVal !== current) {
            setMetaTypes((prev) =>
              prev.LookupMode === defVal
                ? prev
                : { ...prev, LookupMode: defVal }
            );
          }
        }
      } catch (err) {
        console.error("lookMode error:", err);
      }
    })();
    // فقط یک‌بار لود کن
  }, [getEnum]);

  /* -------- propagate meta upward (فقط هنگام تفاوت) -------- */
  const prevMetaStr = useRef("");
  useEffect(() => {
    const str = JSON.stringify(metaTypes);
    if (str !== prevMetaStr.current) {
      prevMetaStr.current = str;
      onMetaChange(metaTypes);
    }
  }, [metaTypes, onMetaChange]);

  /* ---------------- helpers ---------------- */
  // با هر نوع onChange کار می‌کند: event، {value,label}، مقدار ساده
  type ChangeArg =
    | React.ChangeEvent<HTMLSelectElement>
    | { value?: string | number }
    | string
    | number
    | null
    | undefined;

  const pickValue = (arg: ChangeArg): string => {
    if (arg == null) return "";
    if (typeof arg === "string" || typeof arg === "number") return String(arg);
    const maybeEvent = arg as React.ChangeEvent<HTMLSelectElement>;
    if (
      (maybeEvent as any).target &&
      (maybeEvent as any).target.value != null
    ) {
      return String((maybeEvent as any).target.value);
    }
    const maybeObj = arg as { value?: string | number };
    if (maybeObj.value != null) return String(maybeObj.value);
    return "";
  };

  /* ---------------- handlers ---------------- */
  const handleEntityTypeChange = (e: ChangeArg) =>
    setMetaTypes((p) => ({ ...p, metaType1: pickValue(e) }));

  const handleModeChange = (e: ChangeArg) =>
    setMetaTypes((p) => ({ ...p, LookupMode: pickValue(e) }));

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex justify-center">
      <div className="flex flex-col gap-4 w-64">
        <DynamicSelector
          name="entityType"
          label={t("PfiLookup.Labels.SelectEntityType")}
          options={entityTypes}
          selectedValue={metaTypes.metaType1}
          onChange={handleEntityTypeChange}
        />
        <DynamicSelector
          name="mode"
          label={t("PfiLookup.Labels.Modes")}
          options={modeOptions}
          selectedValue={metaTypes.LookupMode}
          onChange={handleModeChange}
        />
      </div>
    </div>
  );
};

export default PfiLookup;
