// src/components/ControllerForms/LookupController.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useApi } from "../../../context/ApiContext";
import AppServices from "../../../services/api.services";
import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";
import { useTranslation } from "react-i18next";

/* ──────────────── Types ──────────────── */
interface LookUpProps {
  data?: {
    metaType1?: string | number | null; // EntityType منبع
    metaType2?: string | number | null; // ستونی که نمایش داده می‌شود
    metaType3?: string;                 // drop | radio | check
    metaType4?: string;                 // JSON جدول نگاشت
    metaType5?: string;                 // پروژه‌های پیش‌فرض
    LookupMode?: string | number | null;
    CountInReject?: boolean;
    BoolMeta1?: boolean;
    /** ID نوع انتیتی فرم فعلی (برای تامین DesField از فیلدهای همین فرم) */
    currentEntityTypeId?: string | number | null;
  };
  onMetaChange?: (updated: any) => void;
  onMetaExtraChange?: (updated: { metaType4: string }) => void;
  resetKey?: number | string;

  /** فهرست فیلدهای فرم فعلی (برای ستون DesField) */
  srcFields?: Array<{ ID: string | number; DisplayName: string }>;
  /** اگر srcFields نبود، از این ID برای واکشی فیلدهای فرم فعلی استفاده کن */
  srcEntityTypeId?: string | number;
}

interface TableRow {
  ID: string;
  /** ✅ DesField (ستون چپ): از فیلدهای فرم فعلی */
  DesFieldID: string;
  FilterOpration: string;
  FilterText: string;
  /** ✅ SrcField (ستون راست): از فیلدهای EntityType منبع */
  SrcFieldID: string;
}

/* ──────────────── Helpers ──────────────── */
const genId = () =>
  typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : uuidv4();

const toStr = (v: any, fallback = "") =>
  v === undefined || v === null ? fallback : String(v);

/* ──────────────── Component ──────────────── */
const LookUp: React.FC<LookUpProps> = ({
  data = {},
  onMetaChange,
  onMetaExtraChange,
  resetKey,
  srcFields,
  srcEntityTypeId,
}) => {
  const { t } = useTranslation();
  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();

  // refs
  const initialModeRef = useRef(true);
  const baseFieldsLockedRef = useRef(false);

  // state
  const [meta, setMeta] = useState({
    metaType1: "", // EntityType منبع
    metaType2: "", // ستون نمایش از منبع
    metaType3: "drop",
    metaType4: "[]", // JSON جدول
    metaType5: "", // پروژه‌های پیش‌فرض
    LookupMode: "",
  });
  const [removeSameName, setRemoveSameName] = useState(false);
  const [oldLookup, setOldLookup] = useState(false);

  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [entities, setEntities] = useState<{ ID: any; Name: string }[]>([]);

  // فیلدهای پویا بر اساس metaType1 (منبع)
  const [fields, setFields] = useState<any[]>([]);
  // فیلدهای ثابت فرم فعلی (برای DesField)
  const [baseFields, setBaseFields] = useState<any[]>([]);

  const [modesList, setModesList] = useState<{ value: string; label: string }[]>(
    []
  );
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);

  /* ─── sync from props.data (edit) ─── */
  useEffect(() => {
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(data.metaType4 || "[]");
    } catch {
      parsed = [];
    }

    setTableData(
      Array.isArray(parsed)
        ? parsed.map((it) => ({
            ID: toStr(it.ID, genId()),
            DesFieldID: it.DesFieldID != null ? toStr(it.DesFieldID) : "",
            FilterOpration: toStr(it.FilterOpration),
            FilterText: toStr(it.FilterText),
            SrcFieldID: it.SrcFieldID != null ? toStr(it.SrcFieldID) : "",
          }))
        : []
    );

    setMeta({
      metaType1: toStr(data.metaType1),
      metaType2: toStr(data.metaType2),
      metaType3: data.metaType3 || "drop",
      metaType4: data.metaType4 || "[]",
      metaType5: toStr(data.metaType5),
      LookupMode: toStr(data.LookupMode),
    });
    setRemoveSameName(!!data.CountInReject);
    setOldLookup(!!data.BoolMeta1);
    initialModeRef.current = true;
  }, [data]);

  /* ─── load entities + enums ─── */
  useEffect(() => {
    getAllEntityType()
      .then((r) => Array.isArray(r) && setEntities(r))
      .catch(console.error);

    AppServices.getEnum({ str: "lookMode" })
      .then((r) =>
        setModesList(
          Object.entries(r).map(([k, v]) => ({ value: String(v), label: k }))
        )
      )
      .catch(console.error);

    AppServices.getEnum({ str: "FilterOpration" })
      .then((r) =>
        setOperationList(
          Object.entries(r).map(([k, v]) => ({ value: String(v), label: k }))
        )
      )
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── after modes loaded, restore LookupMode ─── */
  useEffect(() => {
    if (initialModeRef.current && modesList.length && data.LookupMode != null) {
      const mv = String(data.LookupMode);
      if (modesList.some((m) => m.value === mv))
        setMeta((p) => ({ ...p, LookupMode: mv }));
      initialModeRef.current = false;
    }
  }, [modesList, data.LookupMode]);

  /* ─── dynamic fields for metaType1 (source entity) ─── */
  useEffect(() => {
    const id = Number(meta.metaType1);
    if (!isNaN(id) && id > 0) {
      getEntityFieldByEntityTypeId(id)
        .then((r) => setFields(Array.isArray(r) ? r : []))
        .catch(console.error);
    } else {
      setFields([]);
    }
  }, [meta.metaType1, getEntityFieldByEntityTypeId]);

  /* ─── ثابت‌سازی baseFields از srcFields ─── */
  useEffect(() => {
    if (baseFieldsLockedRef.current) return;
    if (Array.isArray(srcFields) && srcFields.length > 0) {
      setBaseFields(srcFields);
      baseFieldsLockedRef.current = true;
    }
  }, [srcFields]);

  /* ─── اگر srcFields نبود، از ID فرم فعلی واکشی کن ─── */
  useEffect(() => {
    if (baseFieldsLockedRef.current) return;
    const rawId = srcEntityTypeId ?? data.currentEntityTypeId ?? null;
    const idNum = rawId != null ? Number(rawId) : NaN;
    if (!isNaN(idNum) && idNum > 0) {
      getEntityFieldByEntityTypeId(idNum)
        .then((r) => {
          const arr = Array.isArray(r) ? r : [];
          // ⛔️ اگر خالی بود، عمداً baseFields را خالی نگه داریم (طبق خواسته)
          if (arr.length > 0) {
            setBaseFields(arr);
            baseFieldsLockedRef.current = true;
          }
        })
        .catch(console.error);
    }
  }, [srcEntityTypeId, data.currentEntityTypeId, getEntityFieldByEntityTypeId]);

  /* ⛔️ حذف fallback قدیمی:
     قبلاً اگر هنوز قفل نشده و fields (پویا) می‌آمد، baseFields = fields می‌شد.
     طبق نیاز جدید، هرگز از fields به‌عنوان پایه DesField استفاده نمی‌کنیم. */
  // (هیچ fallback دیگری وجود ندارد)

  /* ─── sync metaType2 با fields ─── */
  useEffect(() => {
    if (!fields.length) return;
    setMeta((prev) => {
      if (prev.metaType2 && !fields.some((f) => String(f.ID) === prev.metaType2)) {
        const nextVal = fields[0] ? String(fields[0].ID) : "";
        const next = { ...prev, metaType2: nextVal };
        onMetaChange?.({
          ...data,
          ...next,
          CountInReject: removeSameName,
          BoolMeta1: oldLookup,
        });
        return next;
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  /* ─── helpers ─── */
  const pushMeta = (partial: Partial<typeof meta>) => {
    const next = { ...meta, ...partial };
    setMeta(next);
    onMetaChange?.({
      ...data,
      ...next,
      CountInReject: removeSameName,
      BoolMeta1: oldLookup,
    });
  };

  const toggleCheck = (key: "removeSameName" | "oldLookup", val: boolean) => {
    if (key === "removeSameName") setRemoveSameName(val);
    else setOldLookup(val);

    onMetaChange?.({
      ...data,
      ...meta,
      CountInReject: key === "removeSameName" ? val : removeSameName,
      BoolMeta1: key === "oldLookup" ? val : oldLookup,
    });
  };

  const emitTableData = (rows: TableRow[]) => {
    setTableData(rows);
    const json = JSON.stringify(rows);
    setMeta((p) => ({ ...p, metaType4: json }));
    onMetaExtraChange?.({ metaType4: json });
  };

  // ✅ شرط: اگر getInformationFrom و WhatColumnToDisplay هر دو خالی باشند
  const bothEmpty = meta.metaType1.trim() === "" && meta.metaType2.trim() === "";
  // ✅ شرط نهایی: اگر جدول FormsCommand1 خالی باشد، DesField هم باید خالی باشد
  const noDesOptions = bothEmpty || baseFields.length === 0;

  const addRow = () => {
    const defaultDes = noDesOptions ? "" : (baseFields[0]?.ID ?? "");
    const defaultSrc = bothEmpty ? "" : (fields[0]?.ID ?? "");
    const newRow: TableRow = {
      ID: genId(),
      DesFieldID: defaultDes ? String(defaultDes) : "",
      FilterOpration: "",
      FilterText: "",
      SrcFieldID: defaultSrc ? String(defaultSrc) : "",
    };
    emitTableData([...tableData, newRow]);
  };

  const onCellChange = (e: any) => {
    const upd = e.data as TableRow;
    const next = tableData.map((r) =>
      r.ID === upd.ID
        ? {
            ...upd,
            DesFieldID: upd.DesFieldID != null ? String(upd.DesFieldID) : "",
            SrcFieldID: upd.SrcFieldID != null ? String(upd.SrcFieldID) : "",
          }
        : r
    );
    emitTableData(next);
  };

  /* ─── Maps & signatures ─── */
  const fieldsMap = useMemo(
    () => new Map(fields.map((f: any) => [String(f.ID), f.DisplayName])),
    [fields]
  );
  const baseFieldsMap = useMemo(
    () => new Map(baseFields.map((f: any) => [String(f.ID), f.DisplayName])),
    [baseFields]
  );
  const fieldsSig = useMemo(
    () => fields.map((f: any) => String(f.ID)).join("|"),
    [fields]
  );
  const baseFieldsSig = useMemo(
    () => baseFields.map((f: any) => String(f.ID)).join("|"),
    [baseFields]
  );

  /* ─── نرمالایز SrcField بعد از تغییر fields ─── */
  useEffect(() => {
    if (!fields.length || bothEmpty) return;
    const valid = new Set(Array.from(fieldsMap.keys()));
    let changed = false;
    const updated = tableData.map((r) => {
      const val = String(r.SrcFieldID || "");
      if (val && !valid.has(val)) {
        changed = true;
        return { ...r, SrcFieldID: fields[0] ? String(fields[0].ID) : "" };
      }
      return r;
    });
    if (changed) emitTableData(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsSig, bothEmpty]);

  /* ─── نرمالایز DesField:
        1) اگر baseFields خالی شد، همه DesFieldID ها را خالی کن.
        2) اگر تغییر کرد و مقدار نامعتبر بود، به اولین مقدار معتبر برگردان (وقتی خالی نیست). */
  useEffect(() => {
    if (baseFields.length === 0) {
      const changed = tableData.some((r) => r.DesFieldID);
      if (changed) {
        const cleared = tableData.map((r) => ({ ...r, DesFieldID: "" }));
        emitTableData(cleared);
      }
      return;
    }
    if (!noDesOptions) {
      const valid = new Set(Array.from(baseFieldsMap.keys()));
      let changed = false;
      const updated = tableData.map((r) => {
        const val = String(r.DesFieldID || "");
        if (val && !valid.has(val)) {
          changed = true;
          return {
            ...r,
            DesFieldID: baseFields[0] ? String(baseFields[0].ID) : "",
          };
        }
        return r;
      });
      if (changed) emitTableData(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFieldsSig, noDesOptions]);

  /* ─── ستون‌ها ───
     ✅ وقتی getInformationFrom و WhatColumnToDisplay هر دو خالی‌اند، یا
       جدول FormsCommand1 (baseFields) خالی است:
       - سلکت آپشن‌های DesField باید خالی باشد
       - مقدار نمایشی DesField نیز خالی برگردد
     ✅ برای SrcField فقط شرط bothEmpty اعمال می‌شود. */
  const columnDefs = useMemo(
    () => [
      {
        headerName: t("LookUp.Columns.DesField"),
        field: "DesFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: () => ({
          values: noDesOptions ? [] : Array.from(baseFieldsMap.keys()),
        }),
        valueFormatter: (p: any) =>
          noDesOptions
            ? ""
            : (baseFieldsMap.get(String(p.value)) ?? String(p.value ?? "")),
      },
      {
        headerName: t("LookUp.Columns.Operation"),
        field: "FilterOpration",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: operationList.map((o) => o.value),
        },
        valueFormatter: (p: any) =>
          operationList.find((o) => o.value === String(p.value))?.label ||
          String(p.value ?? ""),
      },
      {
        headerName: t("LookUp.Columns.FilterText"),
        field: "FilterText",
        editable: true,
      },
      {
        headerName: t("LookUp.Columns.SrcField"),
        field: "SrcFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: () => ({
          values: bothEmpty ? [] : Array.from(fieldsMap.keys()),
        }),
        valueFormatter: (p: any) =>
          bothEmpty
            ? ""
            : (fieldsMap.get(String(p.value)) ?? String(p.value ?? "")),
      },
    ],
    [t, fieldsMap, baseFieldsMap, operationList, bothEmpty, noDesOptions]
  );

  /* ─── Render ─── */
  return (
    <div className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      <div className="flex gap-8">
        {/* ===== ستون چپ ===== */}
        <div className="flex flex-col space-y-6 w-1/2">
          <DynamicSelector
            name="getInformationFrom"
            label={t("LookUp.GetInformationFrom")}
            options={entities.map((e) => ({ value: String(e.ID), label: e.Name }))}
            selectedValue={meta.metaType1}
            onChange={(e) => {
              // تغییر منبع فقط روی فیلدهای پویا اثر دارد؛ baseFields ثابت می‌ماند
              pushMeta({ metaType1: e.target.value });
            }}
          />

          <DynamicSelector
            name="displayColumn"
            label={t("LookUp.WhatColumnToDisplay")}
            options={fields.map((f) => ({ value: String(f.ID), label: f.DisplayName }))}
            selectedValue={meta.metaType2}
            onChange={(e) => pushMeta({ metaType2: e.target.value })}
          />

          <DynamicSelector
            name="modes"
            label={t("LookUp.Modes")}
            options={modesList}
            selectedValue={meta.LookupMode}
            onChange={(e) => pushMeta({ LookupMode: e.target.value })}
          />

          <PostPickerList
            key={`pp-${meta.metaType1}|${meta.metaType2}|${meta.LookupMode}|${resetKey ?? 0}`}
            resetKey={resetKey}
            sourceType="projects"
            initialMetaType={meta.metaType5}
            data={{ metaType5: meta.metaType5 || undefined }}
            metaFieldKey="metaType5"
            onMetaChange={(o) => pushMeta(o)}
            label={t("LookUp.DefaultProjects")}
            fullWidth
          />
        </div>

        {/* ===== ستون راست ===== */}
        <div className="flex flex-col space-y-6 w-1/2">
          <div className="space-y-2">
            <label className="block font-medium">{t("LookUp.DisplayChoicesUsing")}</label>
            {(["drop", "radio", "check"] as const).map((typeKey) => (
              <label key={typeKey} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayType"
                  value={typeKey}
                  checked={meta.metaType3 === typeKey}
                  onChange={() => pushMeta({ metaType3: typeKey })}
                />
                <span>
                  {typeKey === "drop"
                    ? t("LookUp.DropDownMenu")
                    : typeKey === "radio"
                    ? t("LookUp.RadioButtons")
                    : t("LookUp.CheckboxesAllowMultiple")}
                </span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={removeSameName}
                onChange={(e) => toggleCheck("removeSameName", e.target.checked)}
              />
              {t("LookUp.RemoveSameName")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={oldLookup}
                onChange={(e) => toggleCheck("oldLookup", e.target.checked)}
              />
              {t("LookUp.OldLookup")}
            </label>
          </div>
        </div>
      </div>

      {/* ===== جدول ===== */}
      <div className="mt-4" style={{ height: 300, overflowY: "auto" }}>
        <DataTable
          key={`dt-${fieldsSig}-${baseFieldsSig}-${noDesOptions ? "noDes" : "hasDes"}-${bothEmpty ? "srcEmpty" : "srcHas"}`}
          columnDefs={columnDefs}
          rowData={tableData}
          showAddIcon
          onAdd={addRow}
          onCellValueChanged={onCellChange}
          domLayout="normal"
          showSearch={false}
          showEditIcon={false}
          showDeleteIcon={false}
          showDuplicateIcon={false}
          onRowDoubleClick={() => {}}
          gridOptions={{
            singleClickEdit: true,
            rowSelection: "single",
            stopEditingWhenCellsLoseFocus: true,
          }}
        />
      </div>
    </div>
  );
};

export default LookUp;
