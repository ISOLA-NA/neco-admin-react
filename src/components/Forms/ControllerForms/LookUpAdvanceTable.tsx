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
    metaType1?: string | number | null; // EntityType منبع (GetInformationFrom)
    metaType2?: string | number | null; // ستونی که نمایش داده می‌شود (WhatColumnToDisplay)
    metaType3?: string;                 // drop | radio | check (برای یکسانی نگه داشته شده)
    metaType4?: string;                 // JSON جدول نگاشت
    metaType5?: string;                 // پروژه‌های پیش‌فرض
    LookupMode?: string | number | null; // (UI ندارد)
    CountInReject?: boolean;            // (UI ندارد)
    BoolMeta1?: boolean;                // (UI ندارد)
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
  /** ✅ DesField (ستون چپ): از فیلدهای فرم فعلی (baseFields) */
  DesFieldID: string;
  FilterOpration: string;
  FilterText: string;
  /** ✅ SrcField (ستون راست): از فیلدهای EntityType منبع (fields) */
  SrcFieldID: string;
}

const genId = () =>
  typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : uuidv4();

const toStr = (v: any, fallback = "") =>
  v === undefined || v === null ? fallback : String(v);

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

  // ─── Refs ────────────────────────────────────────────────
  const initialModeRef = useRef(true);
  const resetMountedRef = useRef(false);
  const baseFieldsLockedRef = useRef(false);

  // ─── State ───────────────────────────────────────────────
  const [meta, setMeta] = useState({
    metaType1: "",
    metaType2: "",
    metaType3: "drop",
    metaType4: "[]",
    metaType5: "",
    LookupMode: "", // UI ندارد
  });

  const [entities, setEntities] = useState<{ ID: any; Name: string }[]>([]);
  // ⭐️ fields (پویا): وابسته به metaType1
  const [fields, setFields] = useState<any[]>([]);
  // ⭐️ baseFields (ثابت): فیلدهای فرم فعلی برای DesField
  const [baseFields, setBaseFields] = useState<any[]>([]);
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);

  const [tableData, setTableData] = useState<TableRow[]>([]);

  // ─── Sync initial props.data on mount & when data changes ───
  useEffect(() => {
    // parse metaType4 into tableData
    let rows: any[] = [];
    try {
      rows = JSON.parse(data.metaType4 || "[]");
    } catch {}
    setTableData(
      Array.isArray(rows)
        ? rows.map((item) => ({
            ID: toStr(item.ID, genId()),
            DesFieldID: toStr(item.DesFieldID),
            FilterOpration: toStr(item.FilterOpration),
            FilterText: toStr(item.FilterText),
            SrcFieldID: toStr(item.SrcFieldID),
          }))
        : []
    );

    // sync other meta
    setMeta({
      metaType1: toStr(data.metaType1),
      metaType2: toStr(data.metaType2),
      metaType3: data.metaType3 || "drop",
      metaType4: data.metaType4 || "[]",
      metaType5: toStr(data.metaType5),
      LookupMode: toStr(data.LookupMode),
    });

    initialModeRef.current = true;
  }, [data]);

  // ─── Load entities & enums (فقط FilterOpration) ───────────
  useEffect(() => {
    getAllEntityType()
      .then((res) => Array.isArray(res) && setEntities(res))
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

  // ─── Load available fields when metaType1 changes (source entity fields) ───
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
    const rawId = srcEntityTypeId ?? data.currentEntityTypeId ?? null;
    const idNum = rawId != null ? Number(rawId) : NaN;
    if (!isNaN(idNum) && idNum > 0) {
      getEntityFieldByEntityTypeId(idNum)
        .then((r) => {
          const arr = Array.isArray(r) ? r : [];
          // ⛔️ اگر خالی بود، عمداً baseFields را خالی نگه می‌داریم (طبق نیاز)
          if (arr.length > 0) {
            setBaseFields(arr);
            baseFieldsLockedRef.current = true;
          }
        })
        .catch(console.error);
    }
  }, [srcEntityTypeId, data.currentEntityTypeId, getEntityFieldByEntityTypeId]);

  /* ⛔️ هیچ fallback دیگری وجود ندارد: از fields (پویا) هرگز برای DesField استفاده نمی‌کنیم. */

  // ─── Sync metaType2 with fields (ensure valid) ───
  useEffect(() => {
    if (!fields.length) return;
    setMeta((prev) => {
      if (prev.metaType2 && !fields.some((f) => String(f.ID) === prev.metaType2)) {
        const nextVal = fields[0] ? String(fields[0].ID) : "";
        const next = { ...prev, metaType2: nextVal };
        onMetaChange?.({
          ...data,
          ...next,
        });
        return next;
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  // ─── Helpers ──────────────────────────────────────────────
  const pushMeta = (patch: Partial<typeof meta>) => {
    const next = { ...meta, ...patch };
    setMeta(next);
    onMetaChange?.({
      ...data,
      ...next,
    });
  };

  const pushTable = (rows: TableRow[]) => {
    setTableData(rows);
    const json = JSON.stringify(rows);
    setMeta((prev) => ({ ...prev, metaType4: json }));
    onMetaExtraChange?.({ metaType4: json });
  };

  // ✅ شرط: وقتی هر دو فیلد «GetInformationFrom» و «WhatColumnToDisplay» خالی‌اند
  const bothEmpty = meta.metaType1.trim() === "" && meta.metaType2.trim() === "";
  // ✅ شرط: اگر جدول FormsCommand1 خالی باشد، DesField هم باید خالی باشد
  const noDesOptions = bothEmpty || baseFields.length === 0;

  const handleAddRow = () => {
    const defaultDes = noDesOptions ? "" : (baseFields[0]?.ID ?? "");
    const defaultSrc = bothEmpty ? "" : (fields[0]?.ID ?? "");
    const newRow: TableRow = {
      ID: genId(),
      DesFieldID: defaultDes ? String(defaultDes) : "",
      FilterOpration: "",
      FilterText: "",
      SrcFieldID: defaultSrc ? String(defaultSrc) : "",
    };
    pushTable([...tableData, newRow]);
  };

  const handleCellValueChanged = (e: any) => {
    const updated = e.data as TableRow;
    const next = tableData.map((r) =>
      r.ID === updated.ID
        ? {
            ...updated,
            DesFieldID: updated.DesFieldID != null ? String(updated.DesFieldID) : "",
            SrcFieldID: updated.SrcFieldID != null ? String(updated.SrcFieldID) : "",
          }
        : r
    );
    pushTable(next);
  };

  // ─── با تغییر resetKey از والد، metaType5 را هم خالی کن (بعد از mount) ───
  useEffect(() => {
    if (!resetMountedRef.current) {
      resetMountedRef.current = true;
      return;
    }
    setMeta((p) => {
      if (!p.metaType5) return p;
      const next = { ...p, metaType5: "" };
      onMetaChange?.({
        ...data,
        ...next,
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

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

  /* ─── نرمالایز DesField:
        1) اگر baseFields خالی شد، همه DesFieldID ها را خالی کن.
        2) اگر baseFields موجود بود و مقدار نامعتبر بود، به اولین مقدار برگردان. */
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

  // ─── AG-Grid columnDefs ────────────────────────────────────
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
            : (baseFieldsMap.get(String(p.value)) ?? String(p.value ?? "")),
      },
      {
        headerName: t("LookUpAdvanceTable.Columns.Operation"),
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
            : (fieldsMap.get(String(p.value)) ?? String(p.value ?? "")),
      },
    ],
    [t, fieldsMap, baseFieldsMap, operationList, bothEmpty, noDesOptions]
  );

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      <div className="flex gap-8">
        <div className="flex flex-col space-y-6 w-1/2">
          {/* Get Information From */}
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

          {/* What Column To Display */}
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

          {/* Default Projects (مثل دیگر کامپوننت‌ها) */}
          <PostPickerList
            key={`pp-luat-${meta.metaType1}|${meta.metaType2}|${resetKey ?? 0}`}
            resetKey={resetKey}
            sourceType="projects"
            initialMetaType={meta.metaType5}
            data={{ metaType5: meta.metaType5 || undefined }}
            metaFieldKey="metaType5"
            onMetaChange={(o) => pushMeta(o)}
            label={t("LookUpAdvanceTable.Form.DefaultProjects")}
            fullWidth
          />
        </div>
      </div>

      <div className="mt-4" style={{ height: 300, overflowY: "auto" }}>
        <DataTable
          key={`dt-luat-${fieldsSig}-${baseFieldsSig}-${noDesOptions ? "noDes" : "hasDes"}-${bothEmpty ? "srcEmpty" : "srcHas"}`}
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
