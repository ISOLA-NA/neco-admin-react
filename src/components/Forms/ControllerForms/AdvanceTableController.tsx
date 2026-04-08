// src/components/ControllerForms/AdvanceTable.tsx
import React, { useEffect, useRef, useState } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicInput from "../../utilities/DynamicInput";
import { useApi } from "../../../context/ApiContext";
import { useTranslation } from "react-i18next";

interface AdvanceTableProps {
  onMetaChange?: (data: {
    metaType1: string;
    metaType2: string;
    metaType3?: string;
    metaTypeJson?: string; // ✅ اضافه شد
  }) => void;

  data?: {
    metaType1?: string;
    metaType2?: string | number;
    metaType3?: string;
    metaTypeJson?: string | null; // ✅ اضافه شد
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

const parseMetaJson = (metaTypeJson?: string | null): any => {
  if (!metaTypeJson) return {};
  try {
    const obj = JSON.parse(metaTypeJson);
    return typeof obj === "object" && obj !== null ? obj : {};
  } catch {
    return {};
  }
};

const onlyDigits = (s: string) => s.replace(/[^\d]/g, "");

/* --------------------------------------------------- */

const AdvanceTable: React.FC<AdvanceTableProps> = ({
  onMetaChange,
  data = {},
}) => {
  const { t } = useTranslation();
  const { getAllEntityType } = useApi();

  const [formOptions, setFormOptions] = useState<{ value: string; label: string }[]>(
    []
  );

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

  /* ------------------------------
     ✅ metaTypeJson برای AllowedAddedRows...
  ------------------------------*/
  const [metaJsonObj, setMetaJsonObj] = useState<any>(() =>
    parseMetaJson(data.metaTypeJson)
  );

  const [allowedByActor, setAllowedByActor] = useState<string>(() => {
    const mj = parseMetaJson(data.metaTypeJson);
    const v = mj?.AllowedAddedRowsByActor;
    return v === 0 || v ? String(v) : "";
  });

  const [allowedByApproval, setAllowedByApproval] = useState<string>(() => {
    const mj = parseMetaJson(data.metaTypeJson);
    const v = mj?.AllowedAddedRowsByApproval;
    return v === 0 || v ? String(v) : "";
  });

  const patchMetaJson = (patch: (prev: any) => any) => {
    const prev = metaJsonObj ?? {};
    const next = patch({ ...prev });
    setMetaJsonObj(next);

    if (onMetaChange) {
      onMetaChange({
        metaType1: selectedForm,
        metaType2: isGalleryMode ? "1" : "0",
        metaType3: buildMetaType3(accessState),
        metaTypeJson: JSON.stringify(next),
      });
    }
  };

  const updateAllowedRows = (kind: "actor" | "approval", raw: string) => {
    const cleaned = onlyDigits(raw);

    if (kind === "actor") setAllowedByActor(cleaned);
    else setAllowedByApproval(cleaned);

    patchMetaJson((prev) => {
      const next = { ...prev };

      if (kind === "actor") {
        if (cleaned === "") delete next.AllowedAddedRowsByActor;
        else next.AllowedAddedRowsByActor = Number(cleaned);
      } else {
        if (cleaned === "") delete next.AllowedAddedRowsByApproval;
        else next.AllowedAddedRowsByApproval = Number(cleaned);
      }

      return next;
    });
  };

  const toggleAccess = (key: string, checked: boolean) => {
    const next = { ...accessState, [key]: checked };
    setAccessState(next);

    const meta3 = buildMetaType3(next);

    if (onMetaChange) {
      onMetaChange({
        metaType1: selectedForm,
        metaType2: isGalleryMode ? "1" : "0",
        metaType3: meta3,
        metaTypeJson: JSON.stringify(metaJsonObj ?? {}),
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

    const mj = parseMetaJson(data.metaTypeJson);
    setMetaJsonObj(mj);

    const a1 = mj?.AllowedAddedRowsByActor;
    setAllowedByActor(a1 === 0 || a1 ? String(a1) : "");

    const a2 = mj?.AllowedAddedRowsByApproval;
    setAllowedByApproval(a2 === 0 || a2 ? String(a2) : "");

  }, [data.metaType1, data.metaType2, data.metaType3, data.metaTypeJson]);

  const prevMetaString = useRef("");
  useEffect(() => {
    if (!onMetaChange) return;

    const meta = {
      metaType1: selectedForm,
      metaType2: isGalleryMode ? "1" : "0",
      metaType3: buildMetaType3(accessState),
      metaTypeJson: JSON.stringify(metaJsonObj ?? {}),
    };

    const s = JSON.stringify(meta);
    if (s !== prevMetaString.current) {
      prevMetaString.current = s;
      onMetaChange(meta);
    }

  }, [selectedForm, isGalleryMode, accessState, metaJsonObj]);

  /* ------------------------------ */

  // ✅ Actor ها چپ، Approval ها راست
  const LEFT_KEYS = ["AddByActor", "EditByActor", "DeleteByActor"];
  const RIGHT_KEYS = ["AddByApproval", "EditByApproval", "DeleteByApproval"];

  const leftItems = ACCESS_FLAGS.filter((x) => LEFT_KEYS.includes(x.key));
  const rightItems = ACCESS_FLAGS.filter((x) => RIGHT_KEYS.includes(x.key));

  const renderItem = (item: { key: string; labelKey: string }) => {
    const fullText = t(item.labelKey);
    return (
      <label
        key={item.key}
        className="flex items-center gap-2 text-[11px] font-normal text-gray-700 min-w-0"
        title={fullText}
      >
        <input
          type="checkbox"
          checked={!!accessState[item.key]}
          onChange={(e) => toggleAccess(item.key, e.target.checked)}
          className="h-4 w-4 accent-pink-500 cursor-pointer"
        />
        <span className="min-w-0 truncate">{fullText}</span>
      </label>
    );
  };

  const actorLabel = "Allowed added numbers of rows by actor:";
  const approvalLabel = "Allowed added numbers of rows by approval:";

  return (
  <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex flex-col gap-6">
    {/* ✅ Show Form + Gallery mode چسبیده سمت چپ */}
    <div className="flex justify-start">
      <div className="flex flex-col gap-2 w-64">
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

    {/* 🔥 چک‌باکس‌های جدید + اینپوت‌های عددی */}
    <div className="w-full flex flex-col md:flex-row gap-2 md:gap-3 items-stretch">
      <div className="p-3 rounded-lg shadow-sm border border-gray-200 flex-1 h-full min-h-[140px]">
        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
          <div className="flex flex-col gap-3">
            {leftItems.map((item) => {
              const fullText = t(item.labelKey);
              return (
                <label
                  key={item.key}
                  className="flex items-start gap-1 text-[10px] leading-4 font-normal text-gray-700"
                  title={fullText}
                >
                  <input
                    type="checkbox"
                    checked={!!accessState[item.key]}
                    onChange={(e) => toggleAccess(item.key, e.target.checked)}
                    className="mt-[2px] h-4 w-4 accent-pink-500 cursor-pointer shrink-0"
                  />
                  <span className="whitespace-normal break-words">
                    {fullText}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            {rightItems.map((item) => {
              const fullText = t(item.labelKey);
              return (
                <label
                  key={item.key}
                  className="flex items-start gap-1 text-[10px] leading-4 font-normal text-gray-700"
                  title={fullText}
                >
                  <input
                    type="checkbox"
                    checked={!!accessState[item.key]}
                    onChange={(e) => toggleAccess(item.key, e.target.checked)}
                    className="mt-[2px] h-4 w-4 accent-pink-500 cursor-pointer shrink-0"
                  />
                  <span className="whitespace-normal break-words">
                    {fullText}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg shadow-sm border border-gray-200 h-full min-h-[140px] flex items-stretch">
        <div className="w-full md:w-[210px] lg:w-[220px] flex flex-col h-full justify-between gap-3">
          <div className="flex flex-col justify-start" title={actorLabel}>
            <DynamicInput
              name="AllowedAddedRowsByActor"
              type="number"
              value={allowedByActor}
              onChange={(e) => updateAllowedRows("actor", e.target.value)}
              label={actorLabel}
              labelClassName="text-[11px] font-normal text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis mb-0.5"
              placeholder=""
              min={0}
              step={1}
              className="w-full"
              style={{ height: 30 }}
            />
          </div>

          <div className="flex flex-col justify-start" title={approvalLabel}>
            <DynamicInput
              name="AllowedAddedRowsByApproval"
              type="number"
              value={allowedByApproval}
              onChange={(e) => updateAllowedRows("approval", e.target.value)}
              label={approvalLabel}
              labelClassName="text-[11px] font-normal text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis mb-0.5"
              placeholder=""
              min={0}
              step={1}
              className="w-full"
              style={{ height: 30 }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default AdvanceTable;
