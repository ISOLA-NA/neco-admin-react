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
  const genId = () =>
    typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : uuidv4();

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
  const [removeSameName, setRemoveSameName] = useState(false);
  const [oldLookup, setOldLookup] = useState(false);

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

  // sync from props
  useEffect(() => {
    let rows: any[] = [];
    try {
      rows = JSON.parse(data.metaType4 || "[]");
    } catch {}
    setTableData(
      Array.isArray(rows)
        ? rows.map((item) => ({
            ID: String(item.ID ?? genId()),
            SrcFieldID: item.SrcFieldID ? String(item.SrcFieldID) : "",
            FilterOpration: item.FilterOpration || "",
            FilterText: item.FilterText || "",
            DesFieldID: item.DesFieldID ? String(item.DesFieldID) : "",
          }))
        : []
    );

    setMeta({
      metaType1: data.metaType1 != null ? String(data.metaType1) : "",
      metaType2: data.metaType2 != null ? String(data.metaType2) : "",
      metaType3: data.metaType3 || "drop",
      metaType4: data.metaType4 || "[]",
      metaType5: data.metaType5 || "",
      LookupMode: data.LookupMode != null ? String(data.LookupMode) : "",
    });
    setRemoveSameName(!!data.CountInReject);
    setOldLookup(!!data.BoolMeta1);

    initialModeRef.current = true;
  }, [data]);

  // load entities & enums
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

  // restore LookupMode
  useEffect(() => {
    if (initialModeRef.current && modesList.length > 0 && data.LookupMode != null) {
      const mv = String(data.LookupMode);
      if (modesList.some((m) => m.value === mv)) {
        setMeta((prev) => ({ ...prev, LookupMode: mv }));
      }
      initialModeRef.current = false;
    }
  }, [modesList, data.LookupMode]);

  // Load fields on metaType1
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
          // ⛔️ اگر خالی بود، عمداً baseFields را خالی نگه می‌داریم
          if (arr.length > 0) {
            setBaseFields(arr);
            baseFieldsLockedRef.current = true;
          }
        })
        .catch(console.error);
    }
  }, [srcEntityTypeId, data.currentEntityTypeId, getEntityFieldByEntityTypeId]);

  const pushMeta = (patch: Partial<typeof meta>) => {
    const next = { ...meta, ...patch };
    setMeta(next);
    onMetaChange?.({
      ...data,
      ...next,
      CountInReject: removeSameName,
      BoolMeta1: oldLookup,
    });
  };

  const toggleCheckbox = (key: "removeSameName" | "oldLookup", val: boolean) => {
    if (key === "removeSameName") setRemoveSameName(val);
    else setOldLookup(val);
    onMetaChange?.({
      ...data,
      ...meta,
      CountInReject: key === "removeSameName" ? val : removeSameName,
      BoolMeta1: key === "oldLookup" ? val : oldLookup,
    });
  };

  const pushTable = (rows: TableRow[]) => {
    setTableData(rows);
    const json = JSON.stringify(rows);
    setMeta((prev) => ({ ...prev, metaType4: json }));
    onMetaExtraChange?.({ metaType4: json });
  };

  // ✅ وقتی هر دو فیلد «GetInformationFrom» و «WhatColumnToDisplay» خالی‌اند
  const bothEmpty =
    meta.metaType1.trim() === "" && meta.metaType2.trim() === "";
  // ✅ اگر جدول FormsCommand1 (baseFields) خالی باشد، DesField هم باید خالی باشد
  const noDesOptions = bothEmpty || baseFields.length === 0;

  const handleAddRow = () => {
    const defaultDes = noDesOptions ? "" : (baseFields[0]?.ID ?? "");
    const defaultSrc = bothEmpty ? "" : (fields[0]?.ID ?? "");
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

  // --- FIX: ریست PostPickerList روی تغییر selectها ---
  const prevSigRef = useRef<string>("");
  useEffect(() => {
    const sig = `${meta.metaType1}|${meta.metaType2}`;
    if (prevSigRef.current && prevSigRef.current !== sig) {
      setMeta((p) => {
        if (!p.metaType5) return p;
        const next = { ...p, metaType5: "" };
        onMetaChange?.({
          ...data,
          ...next,
          CountInReject: removeSameName,
          BoolMeta1: oldLookup,
        });
        return next;
      });
    }
    prevSigRef.current = sig;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.metaType1, meta.metaType2]);

  // 🔁 با تغییر resetKey از والد، metaType5 را هم خالی کن (بعد از mount)
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
        CountInReject: removeSameName,
        BoolMeta1: oldLookup,
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

  // columns
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
            : (fieldsMap.get(String(p.value)) ?? String(p.value ?? "")),
      },
    ],
    [t, fieldsMap, baseFieldsMap, operationList, bothEmpty, noDesOptions]
  );

  const ppKey = useMemo(
    () => `${meta.metaType1}|${meta.metaType2}|${resetKey ?? 0}`,
    [meta.metaType1, meta.metaType2, resetKey]
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
