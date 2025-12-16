// src/components/ControllerForms/LookUp/LookUpAdvanceTable.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import { useApi } from "../../../context/ApiContext";
import AppServices from "../../../services/api.services";
import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";
import { useTranslation } from "react-i18next";

interface LookUpAdvanceTableProps {
  data?: {
    metaType1?: string | number | null;
    metaType2?: string | number | null;
    metaType3?: string;
    metaType4?: string;
    metaType5?: string;
    LookupMode?: string | number | null;
    CountInReject?: boolean;
    BoolMeta1?: boolean;
    /** JSON متا؛ اینجا هم access و هم CombinedEntityType می‌آیند */
    metaTypeJson?: string | null;
    /** (اختیاری) ID نوع انتیتی فرم فعلی برای تأمین DesField وقتی srcFields پاس نشده */
    currentEntityTypeId?: string | number | null;
  };
  onMetaChange?: (updated: any) => void;
  onMetaExtraChange?: (updated: { metaType4: string }) => void;
  /** 🔑 سیگنال ریست از والد هنگام تغییر Type of Information */
  resetKey?: number | string;

  /** ✅ فهرست فیلدهای فرم فعلی (برای ستون DesField). اگر پاس شود، از همین استفاده می‌کنیم. */
  srcFields?: Array<{ ID: string | number; DisplayName: string }>;

  /** ✅ اگر srcFields پاس نشد، از این ID (یا data.currentEntityTypeId) برای واکشی فیلدهای فرم فعلی استفاده می‌کنیم */
  srcEntityTypeId?: string | number;
}

interface TableRow {
  ID: string;
  SrcFieldID: string;   // از فیلدهای EntityType منبع
  FilterOpration: string;
  FilterText: string;
  DesFieldID: string;   // از فیلدهای فرم فعلی (baseFields)
}

const genId = () =>
  typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : uuidv4();

const toStr = (v: any, fallback = "") =>
  v === undefined || v === null ? fallback : String(v);

const shallowEqualMeta = (a: any, b: any) => {
  return (
    a.metaType1 === b.metaType1 &&
    a.metaType2 === b.metaType2 &&
    a.metaType3 === b.metaType3 &&
    a.metaType4 === b.metaType4 &&
    a.metaType5 === b.metaType5 &&
    a.LookupMode === b.LookupMode
  );
};

const rowsEqual = (a: TableRow[], b: TableRow[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ra = a[i], rb = b[i];
    if (
      ra.ID !== rb.ID ||
      ra.SrcFieldID !== rb.SrcFieldID ||
      ra.FilterOpration !== rb.FilterOpration ||
      ra.FilterText !== rb.FilterText ||
      ra.DesFieldID !== rb.DesFieldID
    ) return false;
  }
  return true;
};

/* ─────────────────────────────
   دسترسی‌ها (چک‌باکس‌ها)
   ───────────────────────────── */

const ACCESS_FLAGS = [
  { key: "AddByActor", labelKey: "AdvanceLookupAdvanceTable.Access.AddByActor" },
  { key: "EditByActor", labelKey: "AdvanceLookupAdvanceTable.Access.EditByActor" },
  { key: "DeleteByActor", labelKey: "AdvanceLookupAdvanceTable.Access.DeleteByActor" },
  { key: "AddByApproval", labelKey: "AdvanceLookupAdvanceTable.Access.AddByApproval" },
  { key: "EditByApproval", labelKey: "AdvanceLookupAdvanceTable.Access.EditByApproval" },
  { key: "DeleteByApproval", labelKey: "AdvanceLookupAdvanceTable.Access.DeleteByApproval" }
];

const buildAccessString = (accessState: Record<string, boolean>) =>
  ACCESS_FLAGS.filter(a => accessState[a.key])
    .map(a => a.key + "-")
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

const LookUpAdvanceTable: React.FC<LookUpAdvanceTableProps> = ({
  data = {},
  onMetaChange,
  onMetaExtraChange,
  resetKey,
  srcFields,
  srcEntityTypeId,
}) => {
  const { t } = useTranslation();
  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();

  const initialModeRef = useRef(true);
  const baseFieldsLockedRef = useRef(false);

  // ✅ مقداردهی اولیه از props
  const [meta, setMeta] = useState(() => ({
    metaType1: toStr(data.metaType1),
    metaType2: toStr(data.metaType2),
    metaType3: data.metaType3 || "drop",
    metaType4: data.metaType4 || "[]",
    metaType5: toStr(data.metaType5),
    LookupMode: toStr(data.LookupMode),
  }));
  const [removeSameName, setRemoveSameName] = useState(!!data.CountInReject);
  const [oldLookup, setOldLookup] = useState(!!data.BoolMeta1);

  const [entities, setEntities] = useState<{ ID: any; Name: string }[]>([]);
  const [fields, setFields] = useState<any[]>([]);      // ⭐ from GetInformationFrom
  const [baseFields, setBaseFields] = useState<any[]>([]); // ⭐ fields of current form (DesField)
  const [modesList, setModesList] = useState<{ value: string; label: string }[]>(
    []
  );
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);

  /* ───── metaTypeJson + access ───── */
  const [metaJsonObj, setMetaJsonObj] = useState<any>(() =>
    parseMetaJson(data.metaTypeJson)
  );

  const [accessState, setAccessState] = useState<Record<string, boolean>>(() => {
    const accessStr =
      typeof metaJsonObj?.access === "string" ? metaJsonObj.access : "";
    const st: Record<string, boolean> = {};
    ACCESS_FLAGS.forEach((f) => {
      st[f.key] = accessStr.includes(f.key + "-");
    });
    return st;
  });

  const emitMetaChange = (nextMeta: any, nextMetaJsonObj?: any) => {
    const jsonObj = nextMetaJsonObj ?? metaJsonObj ?? {};
    const metaTypeJsonStr = JSON.stringify(jsonObj);
    onMetaChange?.({
      ...data,
      ...nextMeta,
      CountInReject: removeSameName,
      BoolMeta1: oldLookup,
      metaTypeJson: metaTypeJsonStr,
    });
  };

  const updateAccess = (key: string, checked: boolean) => {
    const newAccessState = { ...accessState, [key]: checked };
    setAccessState(newAccessState);

    const accessStr = buildAccessString(newAccessState);
    const newMetaJson = { ...(metaJsonObj || {}), access: accessStr };
    setMetaJsonObj(newMetaJson);

    emitMetaChange(meta, newMetaJson);
  };

  const renderAccessCheckboxes = () => (
    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg shadow-sm border border-gray-200">
      {ACCESS_FLAGS.map((item) => (
        <label
          key={item.key}
          className="flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          <input
            type="checkbox"
            checked={!!accessState[item.key]}
            onChange={(e) => updateAccess(item.key, e.target.checked)}
            className="h-4 w-4 accent-pink-500 cursor-pointer"
          />
          <span>{t(item.labelKey)}</span>
        </label>
      ))}
    </div>
  );

  // ─── Sync from props.data (فقط در صورت تغییر واقعی) ───
  useEffect(() => {
    const nextMeta = {
      metaType1: toStr(data.metaType1),
      metaType2: toStr(data.metaType2),
      metaType3: data.metaType3 || "drop",
      metaType4: data.metaType4 || "[]",
      metaType5: toStr(data.metaType5),
      LookupMode: toStr(data.LookupMode),
    };

    // جدول
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(nextMeta.metaType4 || "[]");
    } catch {
      parsed = [];
    }
    const nextRows: TableRow[] = Array.isArray(parsed)
      ? parsed.map((item) => ({
          ID: toStr(item.ID, genId()),
          SrcFieldID: toStr(item.SrcFieldID),
          FilterOpration: toStr(item.FilterOpration),
          FilterText: toStr(item.FilterText),
          DesFieldID: toStr(item.DesFieldID),
        }))
      : [];

    const metaChanged = !shallowEqualMeta(meta, nextMeta);
    const rowsChanged = !rowsEqual(tableData, nextRows);

    if (metaChanged) setMeta(nextMeta);
    if (rowsChanged) setTableData(nextRows);

    // CountInReject / BoolMeta1
    if (removeSameName !== !!data.CountInReject)
      setRemoveSameName(!!data.CountInReject);
    if (oldLookup !== !!data.BoolMeta1) setOldLookup(!!data.BoolMeta1);

    if (metaChanged) {
      initialModeRef.current = true;
    }

    // sync metaTypeJson + access
    const mj = parseMetaJson(data.metaTypeJson);
    setMetaJsonObj(mj);
    const accessStr = typeof mj?.access === "string" ? mj.access : "";
    const nextAccess: Record<string, boolean> = {};
    ACCESS_FLAGS.forEach((f) => {
      nextAccess[f.key] = accessStr.includes(f.key + "-");
    });
    setAccessState(nextAccess);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // ─── Load entities & enums once ───
  useEffect(() => {
    getAllEntityType()
      .then((res) => Array.isArray(res) && setEntities(res))
      .catch(console.error);

    AppServices.getEnum({ str: "lookMode" })
      .then((resp) =>
        setModesList(
          Object.entries(resp).map(([k, v]) => ({
            value: String(v),
            label: k,
          }))
        )
      )
      .catch(console.error);

    AppServices.getEnum({ str: "FilterOpration" })
      .then((resp) =>
        setOperationList(
          Object.entries(resp).map(([k, v]) => ({
            value: String(v),
            label: k,
          }))
        )
      )
      .catch(console.error);
  }, [getAllEntityType]);

  // ─── After modesList loads, apply initial LookupMode once ───
  useEffect(() => {
    if (
      initialModeRef.current &&
      modesList.length > 0 &&
      data.LookupMode != null
    ) {
      const mv = String(data.LookupMode);
      if (modesList.some((m) => m.value === mv)) {
        setMeta((prev) => {
          if (prev.LookupMode === mv) return prev;
          return { ...prev, LookupMode: mv };
        });
      }
      initialModeRef.current = false;
    }
  }, [modesList, data.LookupMode]);

  // ─── Load fields on metaType1 (source entity fields) ───
  useEffect(() => {
    const etId = Number(meta.metaType1);
    if (!isNaN(etId) && etId > 0) {
      getEntityFieldByEntityTypeId(etId)
        .then((res) => setFields(Array.isArray(res) ? res : []))
        .catch(console.error);
    } else {
      setFields([]);
    }
  }, [meta.metaType1, getEntityFieldByEntityTypeId]);

  /* ─── ثابت‌سازی baseFields از srcFields (اگر پاس داده شده) ─── */
  useEffect(() => {
    if (baseFieldsLockedRef.current) return;
    if (Array.isArray(srcFields) && srcFields.length > 0) {
      setBaseFields(srcFields);
      baseFieldsLockedRef.current = true;
    }
  }, [srcFields]);

  /* ─── اگر srcFields نبود، با srcEntityTypeId یا currentEntityTypeId واکشی کن ─── */
  useEffect(() => {
    if (baseFieldsLockedRef.current) return;
    const rawId =
      (typeof srcEntityTypeId !== "undefined" ? srcEntityTypeId : null) ??
      (typeof data.currentEntityTypeId !== "undefined"
        ? (data.currentEntityTypeId as any)
        : null);
    const idNum = rawId != null ? Number(rawId) : NaN;
    if (!isNaN(idNum) && idNum > 0) {
      getEntityFieldByEntityTypeId(idNum)
        .then((r) => {
          const arr = Array.isArray(r) ? r : [];
          if (arr.length > 0) {
            setBaseFields(arr);
            baseFieldsLockedRef.current = true;
          }
        })
        .catch(console.error);
    }
  }, [srcEntityTypeId, data.currentEntityTypeId, getEntityFieldByEntityTypeId]);

  // ─── Helpers to push meta/table ───
  const pushMeta = (patch: Partial<typeof meta>) => {
    const next = { ...meta, ...patch };
    if (shallowEqualMeta(meta, next)) return;
    setMeta(next);
    emitMetaChange(next);
  };

  const toggleCheckbox = (
    key: "removeSameName" | "oldLookup",
    val: boolean
  ) => {
    if (key === "removeSameName") {
      if (removeSameName === val) return;
      setRemoveSameName(val);
    } else {
      if (oldLookup === val) return;
      setOldLookup(val);
    }
    emitMetaChange(meta);
  };

  const pushTable = (rows: TableRow[]) => {
    if (rowsEqual(tableData, rows)) return;
    setTableData(rows);
    const json = JSON.stringify(rows);
    if (meta.metaType4 === json) return;
    const next = { ...meta, metaType4: json };
    setMeta(next);
    onMetaExtraChange?.({ metaType4: json });
    emitMetaChange(next);
  };

  // ✅ وقتی هر دو فیلد «GetInformationFrom» و «WhatColumnToDisplay» خالی‌اند
  const bothEmpty = meta.metaType1.trim() === "" && meta.metaType2.trim() === "";
  // ✅ اگر جدول FormsCommand1 (baseFields) خالی باشد، DesField هم باید خالی باشد
  const noDesOptions = bothEmpty || baseFields.length === 0;

  const handleAddRow = () => {
    const defaultDes = noDesOptions ? "" : baseFields[0]?.ID ?? "";
    const defaultSrc = bothEmpty ? "" : fields[0]?.ID ?? "";
    const newRow: TableRow = {
      ID: genId(),
      SrcFieldID: defaultSrc ? String(defaultSrc) : "",
      FilterOpration: "",
      FilterText: "",
      DesFieldID: defaultDes ? String(defaultDes) : "",
    };
    pushTable([...tableData, newRow]);
  };

  const handleCellValueChanged = (e: any) => {
    const updated = e.data as TableRow;
    const next = tableData.map((r) =>
      r.ID === updated.ID
        ? {
            ...updated,
            SrcFieldID:
              updated.SrcFieldID != null ? String(updated.SrcFieldID) : "",
            DesFieldID:
              updated.DesFieldID != null ? String(updated.DesFieldID) : "",
          }
        : r
    );
    pushTable(next);
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

  /* ─── نرمالایز SrcField پس از تغییر fields ─── */
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
    if (changed) pushTable(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsSig, bothEmpty]);

  /* ─── نرمالایز DesField ─── */
  useEffect(() => {
    if (baseFields.length === 0) {
      const changed = tableData.some((r) => r.DesFieldID);
      if (changed) {
        const cleared = tableData.map((r) => ({ ...r, DesFieldID: "" }));
        pushTable(cleared);
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
      if (changed) pushTable(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFieldsSig, noDesOptions]);

  // ─── AG-Grid columns ───
  const columnDefs = useMemo(
    () => [
      {
        headerName: t("LookUpAdvanceTable.Columns.DesField"),
        field: "DesFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: () => ({
          values: noDesOptions ? [] : Array.from(baseFieldsMap.keys()),
        }),
        valueFormatter: (p: any) =>
          noDesOptions
            ? ""
            : baseFieldsMap.get(String(p.value)) ?? String(p.value ?? ""),
      },
      {
        headerName: t("LookUpAdvanceTable.Columns.Operation"),
        field: "FilterOpration",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: operationList.map((o) => o.value) },
        valueFormatter: (p: any) =>
          operationList.find((o) => o.value === String(p.value))?.label ||
          String(p.value ?? ""),
      },
      {
        headerName: t("LookUpAdvanceTable.Columns.FilterText"),
        field: "FilterText",
        editable: true,
      },
      {
        headerName: t("LookUpAdvanceTable.Columns.SrcField"),
        field: "SrcFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: () => ({
          values: bothEmpty ? [] : Array.from(fieldsMap.keys()),
        }),
        valueFormatter: (p: any) =>
          bothEmpty
            ? ""
            : fieldsMap.get(String(p.value)) ?? String(p.value ?? ""),
      },
    ],
    [t, fieldsMap, baseFieldsMap, operationList, bothEmpty, noDesOptions]
  );

  // ✅ کلید PostPickerList فقط به سیگنال‌های ساختاری وابسته است؛ نه به metaType5
  const ppKey = useMemo(
    () =>
      `pp-adv-${meta.metaType1}|${meta.metaType2}|${meta.LookupMode}|${
        resetKey ?? 0
      }`,
    [meta.metaType1, meta.metaType2, meta.LookupMode, resetKey]
  );

  return (
    <div className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      <div className="flex gap-8">
        <div className="flex flex-col space-y-6 w-1/2">
          <DynamicSelector
            name="getInformationFrom"
            label={t("LookUpAdvanceTable.Form.GetInformationFrom")}
            options={entities.map((e) => ({
              value: String(e.ID),
              label: e.Name,
            }))}
            selectedValue={meta.metaType1}
            onChange={(e) => pushMeta({ metaType1: e.target.value })}
          />

          <DynamicSelector
            name="displayColumn"
            label={t("LookUpAdvanceTable.Form.WhatColumnToDisplay")}
            options={fields.map((f: any) => ({
              value: String(f.ID),
              label: f.DisplayName,
            }))}
            selectedValue={meta.metaType2}
            onChange={(e) => pushMeta({ metaType2: e.target.value })}
          />

          <PostPickerList
            key={ppKey}
            resetKey={resetKey}
            sourceType="projects"
            initialMetaType={meta.metaType5}
            metaFieldKey="metaType5"
            onMetaChange={(o) => pushMeta(o)}
            label={t("LookUpAdvanceTable.Form.DefaultProjects")}
            fullWidth
          />
        </div>
      </div>

      {/* ✅ چک‌باکس‌های دسترسی که در metaTypeJson.access ذخیره می‌شوند */}
      {renderAccessCheckboxes()}

      <div className="mt-4" style={{ height: 300, overflowY: "auto" }}>
        <DataTable
          columnDefs={columnDefs}
          rowData={tableData}
          showAddIcon
          onAdd={handleAddRow}
          onCellValueChanged={handleCellValueChanged}
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

export default LookUpAdvanceTable;
