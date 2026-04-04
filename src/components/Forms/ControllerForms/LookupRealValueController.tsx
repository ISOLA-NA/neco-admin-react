// src/components/ControllerForms/LookUpRealValue.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useApi } from "../../../context/ApiContext";
import AppServices from "../../../services/api.services";

import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";
import { useTranslation } from "react-i18next";

interface LookUpRealValueProps {
  data?: {
    metaType1?: string | number | null; // EntityType منبع
    metaType2?: string | number | null; // ستونی که نمایش داده می‌شود
    metaType3?: string;
    metaType4?: string; // JSON جدول نگاشت
    metaType5?: string;
    LookupMode?: string | number | null;
    BoolMeta1?: boolean;
    /** (اختیاری) ID نوع انتیتی فرم فعلی برای fallback تأمین DesField */
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

const LookUpRealValue: React.FC<LookUpRealValueProps> = ({
  data = {},
  onMetaChange,
  onMetaExtraChange,
  resetKey,
  srcFields,
  srcEntityTypeId,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const uiDir = i18n.dir() as "rtl" | "ltr";

  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();

  const initialModeRef = useRef(true);
  const baseFieldsLockedRef = useRef(false);

  const [meta, setMeta] = useState({
    metaType1: "", // EntityType منبع
    metaType2: "", // ستونی که نمایش داده می‌شود
    metaType3: "drop",
    metaType4: "[]", // JSON جدول
    metaType5: "",
    LookupMode: "",
  });

  // BoolMeta1 => set lookup if it is one
  const [oldLookup, setOldLookup] = useState(false);

  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [entities, setEntities] = useState<{ ID: any; Name: string }[]>([]);

  // ⭐️ fields (پویا): وابسته به metaType1
  const [fields, setFields] = useState<any[]>([]);
  // ⭐️ baseFields (ثابت): فیلدهای فرم فعلی برای DesField
  const [baseFields, setBaseFields] = useState<any[]>([]);

  const [modesList, setModesList] = useState<{ value: string; label: string }[]>(
    []
  );
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);

  // ✅ برای Delete: ردیف انتخاب‌شده جدول
  const [selectedTableRow, setSelectedTableRow] = useState<any>(null);
  // ✅ برای ریست کردن انتخاب DataTable بعد از Add/Delete (remount)
  const [tableGridKey, setTableGridKey] = useState<number>(0);

  /* ─── Ellipsis styles ─── */
  const ellipsisCellStyle = useMemo(() => {
    return isRtl
      ? ({
          textAlign: "right",
          direction: "rtl",
          unicodeBidi: "plaintext",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        } as React.CSSProperties)
      : ({
          textAlign: "left",
          direction: "ltr",
          unicodeBidi: "plaintext",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        } as React.CSSProperties);
  }, [isRtl]);

  const ellipsisHeaderStyle = useMemo(() => {
    return isRtl
      ? ({
          textAlign: "right",
          direction: "rtl",
          unicodeBidi: "plaintext",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        } as React.CSSProperties)
      : ({
          textAlign: "left",
          direction: "ltr",
          unicodeBidi: "plaintext",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        } as React.CSSProperties);
  }, [isRtl]);

  // ─── Sync from props.data ───
  useEffect(() => {
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(data.metaType4 || "[]");
    } catch {
      parsed = [];
    }

    setTableData(
      Array.isArray(parsed)
        ? parsed.map((item) => ({
            ID: toStr(item.ID, genId()),
            DesFieldID: toStr(item.DesFieldID),
            FilterOpration: toStr(item.FilterOpration),
            FilterText: toStr(item.FilterText),
            SrcFieldID: toStr(item.SrcFieldID),
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

    setOldLookup(!!data.BoolMeta1);
    initialModeRef.current = true;
  }, [data]);

  // ─── Load entities & enums once ───
  useEffect(() => {
    getAllEntityType()
      .then((res) => Array.isArray(res) && setEntities(res))
      .catch(console.error);

    AppServices.getEnum({ str: "lookMode" })
      .then((resp) =>
        setModesList(
          Object.entries(resp).map(([k, v]) => ({ value: String(v), label: k }))
        )
      )
      .catch(console.error);

    AppServices.getEnum({ str: "FilterOpration" })
      .then((resp) =>
        setOperationList(
          Object.entries(resp).map(([k, v]) => ({ value: String(v), label: k }))
        )
      )
      .catch(console.error);
  }, [getAllEntityType]);

  // ─── After modesList loads, apply initial LookupMode once ───
  useEffect(() => {
    if (initialModeRef.current && modesList.length && data.LookupMode != null) {
      const mv = String(data.LookupMode);
      if (modesList.some((m) => m.value === mv)) {
        setMeta((prev) => ({ ...prev, LookupMode: mv }));
      }
      initialModeRef.current = false;
    }
  }, [modesList, data.LookupMode]);

  // ─── Load fields when metaType1 changes (source entity fields) ───
  useEffect(() => {
    const entId = Number(meta.metaType1);
    if (!isNaN(entId) && entId > 0) {
      getEntityFieldByEntityTypeId(entId)
        .then((res) => setFields(Array.isArray(res) ? res : []))
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

  /* ─── اگر srcFields نبود، با srcEntityTypeId یا currentEntityTypeId واکشی کن ─── */
  useEffect(() => {
    if (baseFieldsLockedRef.current) return;
    const rawId = srcEntityTypeId ?? data.currentEntityTypeId ?? null;
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
          BoolMeta1: oldLookup,
        });
        return next;
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  // ─── Handlers ───
  const handleMetaChange = (partial: Partial<typeof meta>) => {
    const next = { ...meta, ...partial };
    setMeta(next);
    onMetaChange?.({
      ...data,
      ...next,
      BoolMeta1: oldLookup,
    });
  };

  const handleOldLookupChange = (checked: boolean) => {
    setOldLookup(checked);
    onMetaChange?.({
      ...data,
      ...meta,
      BoolMeta1: checked,
    });
  };

  const pushTable = (rows: TableRow[]) => {
    setTableData(rows);
    const json = JSON.stringify(rows);
    setMeta((prev) => ({ ...prev, metaType4: json }));
    onMetaExtraChange?.({ metaType4: json });
  };

  const bothEmpty = meta.metaType1.trim() === "" && meta.metaType2.trim() === "";
  const noDesOptions = bothEmpty || baseFields.length === 0;

  const handleAddRow = () => {
    const newRow: TableRow = {
      ID: genId(),
      DesFieldID: "",
      FilterOpration: "",
      FilterText: "",
      SrcFieldID: "",
    };
    pushTable([...tableData, newRow]);
    setSelectedTableRow(null);
    setTableGridKey((k) => k + 1);
  };

  const handleDeleteRow = () => {
    const id = selectedTableRow?.ID ? String(selectedTableRow.ID) : "";
    if (!id) return;

    const next = tableData.filter((r) => String(r.ID) !== id);
    pushTable(next);

    setSelectedTableRow(null);
    setTableGridKey((k) => k + 1);
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

  /* ─── نرمالایز SrcField ─── */
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

  // ─── AG-Grid columnDefs ───
  const columnDefs = useMemo(
    () => [
      {
        headerName: t("LookUpRealValue.Columns.SrcField"),
        field: "SrcFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: () => {
          const values = bothEmpty ? [] : Array.from(fieldsMap.keys());
          return {
            values,
            formatValue: (value: any) => {
              const key = String(value ?? "");
              return fieldsMap.get(key) ?? key;
            },
          };
        },
        valueFormatter: (p: any) =>
          bothEmpty ? "" : fieldsMap.get(String(p.value)) ?? String(p.value ?? ""),
        valueParser: (p: any) => String(p.newValue ?? ""),
        cellStyle: ellipsisCellStyle,
        headerStyle: ellipsisHeaderStyle,
      },
      {
        headerName: t("LookUpRealValue.Columns.Operation"),
        field: "FilterOpration",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: operationList.map((o) => o.value),
          formatValue: (value: any) => {
            const v = String(value ?? "");
            return operationList.find((o) => o.value === v)?.label ?? v;
          },
        },
        valueFormatter: (p: any) =>
          operationList.find((o) => o.value === String(p.value))?.label ||
          String(p.value ?? ""),
        valueParser: (p: any) => String(p.newValue ?? ""),
        cellStyle: ellipsisCellStyle,
        headerStyle: ellipsisHeaderStyle,
      },
      {
        headerName: t("LookUpRealValue.Columns.FilterText"),
        field: "FilterText",
        editable: true,
        valueParser: (p: any) => String(p.newValue ?? ""),
        cellStyle: ellipsisCellStyle,
        headerStyle: ellipsisHeaderStyle,
      },
      {
        headerName: t("LookUpRealValue.Columns.DesField"),
        field: "DesFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: () => {
          const values = noDesOptions ? [] : Array.from(baseFieldsMap.keys());
          return {
            values,
            formatValue: (value: any) => {
              const key = String(value ?? "");
              return baseFieldsMap.get(key) ?? key;
            },
          };
        },
        valueFormatter: (p: any) =>
          noDesOptions
            ? ""
            : baseFieldsMap.get(String(p.value)) ?? String(p.value ?? ""),
        valueParser: (p: any) => String(p.newValue ?? ""),
        cellStyle: ellipsisCellStyle,
        headerStyle: ellipsisHeaderStyle,
      },
    ],
    [
      t,
      fieldsMap,
      baseFieldsMap,
      operationList,
      bothEmpty,
      noDesOptions,
      ellipsisCellStyle,
      ellipsisHeaderStyle,
    ]
  );

  return (
    <div
      dir={uiDir}
      className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg"
    >
      <div className="flex gap-8">
        <div className="flex flex-col space-y-6 w-1/2">
          <DynamicSelector
            name="getInformationFrom"
            label={t("LookUpRealValue.Form.GetInformationFrom")}
            options={entities.map((e) => ({
              value: String(e.ID),
              label: e.Name,
            }))}
            selectedValue={meta.metaType1}
            onChange={(e) => handleMetaChange({ metaType1: e.target.value })}
          />

          <DynamicSelector
            name="displayColumn"
            label={t("LookUpRealValue.Form.WhatColumnToDisplay")}
            options={fields.map((f) => ({
              value: String(f.ID),
              label: f.DisplayName,
            }))}
            selectedValue={meta.metaType2}
            onChange={(e) => handleMetaChange({ metaType2: e.target.value })}
          />

          <div className="flex items-end gap-4 w-full">
            <div className="flex-1">
              <DynamicSelector
                name="modes"
                label={t("LookUpRealValue.Form.Modes")}
                options={modesList}
                selectedValue={meta.LookupMode}
                onChange={(e) => handleMetaChange({ LookupMode: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 whitespace-nowrap mb-2">
              <input
                type="checkbox"
                checked={oldLookup}
                onChange={(e) => handleOldLookupChange(e.target.checked)}
              />
              <span>set lookup if it is one</span>
            </label>
          </div>

          <PostPickerList
            key={`pp-rv-${meta.metaType1}|${meta.metaType2}|${meta.LookupMode}|${resetKey ?? 0}`}
            resetKey={resetKey}
            sourceType="projects"
            initialMetaType={meta.metaType5}
            metaFieldKey="metaType5"
            onMetaChange={(o) => handleMetaChange(o)}
            label={t("LookUpRealValue.Form.DefaultProjects")}
            fullWidth
          />
        </div>
      </div>

      <div className="mt-4" style={{ height: 300, overflowY: "auto" }}>
        <DataTable
          key={`dt-rv-${tableGridKey}-${fieldsSig}-${baseFieldsSig}-${noDesOptions ? "noDes" : "hasDes"}-${
            bothEmpty ? "srcEmpty" : "srcHas"
          }`}
          columnDefs={columnDefs}
          rowData={tableData}
          showAddIcon
          showDeleteIcon
          onAdd={handleAddRow}
          onDelete={handleDeleteRow}
          setSelectedRowData={setSelectedTableRow}
          onCellValueChanged={handleCellValueChanged}
          domLayout="normal"
          showSearch={false}
          showEditIcon={false}
          showDuplicateIcon={false}
          onRowDoubleClick={() => {}}
          gridOptions={{
            singleClickEdit: true,
            rowSelection: "single",
            stopEditingWhenCellsLoseFocus: true,
          }}
          direction={uiDir}
        />
      </div>
    </div>
  );
};

export default LookUpRealValue;