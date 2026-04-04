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
    metaType3?: string; // drop | radio | check
    metaType4?: string; // JSON جدول نگاشت
    metaType5?: string; // پروژه‌های پیش‌فرض
    LookupMode?: string | number | null;
    CountInReject?: boolean;
    BoolMeta1?: boolean;
    /** (اختیاری) ID نوع انتیتی فرم فعلی برای تأمین DesField وقتی srcFields پاس نشده */
    currentEntityTypeId?: string | number | null;
  };
  onMetaChange?: (updated: any) => void;
  onMetaExtraChange?: (updated: { metaType4: string }) => void;
  resetKey?: number | string;

  /** ✅ فهرست فیلدهای فرم فعلی (برای ستون DesField) */
  srcFields?: Array<{ ID: string | number; DisplayName: string }>;

  /** ✅ اگر srcFields پاس نشد، از این ID واکشی می‌کنیم */
  srcEntityTypeId?: string | number;
}

interface TableRow {
  ID: string;
  DesFieldID: string;
  FilterOpration: string;
  FilterText: string;
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
  const { t, i18n } = useTranslation();
  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();

  const uiDir = i18n.dir() as "rtl" | "ltr";
  const isRtl = uiDir === "rtl";

  const initialModeRef = useRef(true);
  const resetMountedRef = useRef(false);
  const baseFieldsLockedRef = useRef(false);

  const [meta, setMeta] = useState({
    metaType1: "",
    metaType2: "",
    metaType3: "drop",
    metaType4: "[]",
    metaType5: "",
    LookupMode: "",
  });

  // BoolMeta1 => set lookup if it is one
  const [oldLookup, setOldLookup] = useState(false);

  const [entities, setEntities] = useState<{ ID: any; Name: string }[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [baseFields, setBaseFields] = useState<any[]>([]);
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);
  const [modesList, setModesList] = useState<{ value: string; label: string }[]>(
    []
  );

  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [selectedTableRow, setSelectedTableRow] = useState<any>(null);
  const [tableGridKey, setTableGridKey] = useState<number>(0);

  // ─── Sync initial props.data ───
  useEffect(() => {
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

  // ─── Load entities & enums ───
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

  // ─── Load source fields ───
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

  // ─── ثابت‌سازی baseFields از srcFields ───
  useEffect(() => {
    if (baseFieldsLockedRef.current) return;
    if (Array.isArray(srcFields) && srcFields.length > 0) {
      setBaseFields(srcFields);
      baseFieldsLockedRef.current = true;
    }
  }, [srcFields]);

  // ─── fallback با srcEntityTypeId یا currentEntityTypeId ───
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

  // ─── Sync metaType2 with fields ───
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

  // ─── Helpers ───
  const pushMeta = (patch: Partial<typeof meta>) => {
    const next = { ...meta, ...patch };
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

  // ─── resetKey => metaType5 clear ───
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
        BoolMeta1: oldLookup,
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

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

  const columnDefs = useMemo(
    () => [
      {
        headerName: t("LookUpAdvanceTable.Columns.SrcField"),
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
        headerName: t("LookUpAdvanceTable.Columns.Operation"),
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
        headerName: t("LookUpAdvanceTable.Columns.FilterText"),
        field: "FilterText",
        editable: true,
        valueParser: (p: any) => String(p.newValue ?? ""),
        cellStyle: ellipsisCellStyle,
        headerStyle: ellipsisHeaderStyle,
      },
      {
        headerName: t("LookUpAdvanceTable.Columns.DesField"),
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

          <div className="flex items-end gap-4 w-full">
            <div className="flex-1">
              <DynamicSelector
                name="modes"
                label={t("LookUpAdvanceTable.Form.Modes")}
                options={modesList}
                selectedValue={meta.LookupMode}
                onChange={(e) => pushMeta({ LookupMode: e.target.value })}
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
            key={`pp-luat-${meta.metaType1}|${meta.metaType2}|${meta.LookupMode}|${resetKey ?? 0}`}
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
          key={`dt-luat-${tableGridKey}-${fieldsSig}-${baseFieldsSig}-${
            noDesOptions ? "noDes" : "hasDes"
          }-${bothEmpty ? "srcEmpty" : "srcHas"}`}
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

export default LookUpAdvanceTable;