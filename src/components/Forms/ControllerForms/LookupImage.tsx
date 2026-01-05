// src/components/ControllerForms/LookUp/LookupUmage.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import { useApi } from "../../../context/ApiContext";
import DynamicSelector from "../../utilities/DynamicSelector";
import DataTable from "../../TableDynamic/DataTable";
import AppServices, {
  EntityField,
  EntityType,
  GetEnumResponse,
} from "../../../services/api.services";
import { useTranslation } from "react-i18next";

interface LookupUmageProps {
  data?: {
    metaType1?: string | number | null; // GetInformationFrom (EntityType ID)
    metaType2?: string | number | null; // WhatColumnToDisplay (Field ID inside source entity)

    // ✅ فقط همین: جدول باید اینجا ذخیره شود
    metaType4?: string; // ✅ JSON جدول فیلترها

    CountInReject?: boolean; // ✅ مقدار چک‌باکس Remove same name
    removeSameName?: boolean; // سازگاری قدیمی

    /** (اختیاری) ID نوع انتیتی فرم فعلی برای تأمین فهرست DesField وقتی srcFields پاس نشده */
    currentEntityTypeId?: string | number | null;
  };

  onMetaChange?: (updatedMeta: any) => void;

  // ✅ اینجا جدول را می‌فرستیم (metaType4)
  onMetaExtraChange?: (updated: { metaType4: string }) => void;

  /** ✅ اگر فهرست فیلدهای فرم فعلی را از والد دارید، برای ستون DesField پاس بدهید */
  srcFields?: Array<{ ID: string | number; DisplayName: string }>;
  /** ✅ اگر srcFields پاس ندهید، از این ID (یا data.currentEntityTypeId) برای واکشی فیلدهای فرم فعلی استفاده می‌شود */
  srcEntityTypeId?: string | number;
}

interface TableRow {
  ID: string;
  SrcFieldID: string; // از فیلدهای EntityType منبع (fields)
  FilterOpration: string;
  FilterText: string;
  DesFieldID: string; // از فیلدهای فرم فعلی (baseFields)
}

const genId = () =>
  typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : uuidv4();

const toStr = (v: any, fallback = "") =>
  v === undefined || v === null ? fallback : String(v);

const LookupUmage: React.FC<LookupUmageProps> = ({
  data = {},
  onMetaChange,
  onMetaExtraChange,
  srcFields,
  srcEntityTypeId,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const uiDir = i18n.dir() as "rtl" | "ltr";

  /* ---------------- state ---------------- */
  const [meta, setMeta] = useState({
    metaType1: data?.metaType1 != null ? String(data.metaType1) : "",
    metaType2: data?.metaType2 != null ? String(data.metaType2) : "",
  });

  const [removeSameName, setRemoveSameName] = useState<boolean>(
    (data as any)?.CountInReject ?? (data as any)?.removeSameName ?? false
  );

  const [tableData, setTableData] = useState<TableRow[]>([]);

  // ✅ مبنا فقط metaType4 است
  const prevMeta4Ref = useRef<string | undefined>(data?.metaType4);

  /* -------- dynamic lists -------- */
  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);

  // ⭐️ fields: فهرست فیلدهای EntityType منبع (وابسته به metaType1)
  const [fields, setFields] = useState<EntityField[]>([]);
  // ⭐️ baseFields: فهرست فیلدهای فرم فعلی (برای DesField)
  const [baseFields, setBaseFields] = useState<
    Array<{ ID: string | number; DisplayName: string }>
  >([]);
  const baseFieldsLockedRef = useRef(false);

  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);

  /* ─── Ellipsis styles (طبق تصویر 1 برای انگلیسی + طبق تصویر 3 برای فارسی) ─── */
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

  /* -------- sync props → state (فقط در صورت تفاوت) -------- */
  useEffect(() => {
    const nextMeta = {
      metaType1: data?.metaType1 != null ? String(data.metaType1) : "",
      metaType2: data?.metaType2 != null ? String(data.metaType2) : "",
    };

    setMeta((prev) =>
      prev.metaType1 === nextMeta.metaType1 && prev.metaType2 === nextMeta.metaType2
        ? prev
        : nextMeta
    );

    const incomingRemove =
      (data as any)?.CountInReject ?? (data as any)?.removeSameName ?? false;

    setRemoveSameName((prev) =>
      prev === !!incomingRemove ? prev : !!incomingRemove
    );

    // ✅ جدول فقط از metaType4
    const incomingMeta4 =
      typeof data?.metaType4 === "string" && data.metaType4.trim() !== ""
        ? data.metaType4
        : "[]";

    if (prevMeta4Ref.current !== incomingMeta4) {
      prevMeta4Ref.current = incomingMeta4;
      try {
        const parsed = JSON.parse(incomingMeta4);
        if (Array.isArray(parsed)) {
          const mapped = parsed.map((item: any) => ({
            ID: String(item.ID ?? genId()),
            SrcFieldID: item.SrcFieldID != null ? String(item.SrcFieldID) : "",
            FilterOpration: item.FilterOpration || "",
            FilterText: item.FilterText || "",
            DesFieldID: item.DesFieldID != null ? String(item.DesFieldID) : "",
          }));
          setTableData((prev) =>
            JSON.stringify(prev) === JSON.stringify(mapped) ? prev : mapped
          );
        } else {
          setTableData([]);
        }
      } catch {
        setTableData([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data?.metaType1,
    data?.metaType2,
    data?.metaType4,
    (data as any)?.CountInReject,
    (data as any)?.removeSameName,
  ]);

  /* -------- load static lists -------- */
  useEffect(() => {
    getAllEntityType()
      .then((res) => setEntityTypes(Array.isArray(res) ? res : []))
      .catch(console.error);
  }, [getAllEntityType]);

  useEffect(() => {
    AppServices.getEnum({ str: "FilterOpration" })
      .then((resp: GetEnumResponse) =>
        setOperationList(
          Object.entries(resp).map(([k, v]) => ({
            value: String(v),
            label: k,
          }))
        )
      )
      .catch(console.error);
  }, []);

  /* -------- load fields for source entity (metaType1) -------- */
  useEffect(() => {
    const id = Number(meta.metaType1);
    if (!isNaN(id) && id > 0) {
      getEntityFieldByEntityTypeId(id)
        .then((res) => setFields(Array.isArray(res) ? res : []))
        .catch(console.error);
    } else {
      setFields([]);
    }
  }, [meta.metaType1, getEntityFieldByEntityTypeId]);

  /* -------- lock baseFields from props if provided -------- */
  useEffect(() => {
    if (baseFieldsLockedRef.current) return;
    if (Array.isArray(srcFields) && srcFields.length > 0) {
      setBaseFields(srcFields.map((f) => ({ ID: f.ID, DisplayName: f.DisplayName })));
      baseFieldsLockedRef.current = true;
    }
  }, [srcFields]);

  /* -------- otherwise fetch baseFields via srcEntityTypeId or data.currentEntityTypeId -------- */
  useEffect(() => {
    if (baseFieldsLockedRef.current) return;
    const rawId =
      (typeof srcEntityTypeId !== "undefined" ? srcEntityTypeId : null) ??
      (typeof data?.currentEntityTypeId !== "undefined"
        ? (data?.currentEntityTypeId as any)
        : null);
    const idNum = rawId != null ? Number(rawId) : NaN;
    if (!isNaN(idNum) && idNum > 0) {
      getEntityFieldByEntityTypeId(idNum)
        .then((r) => {
          const arr = Array.isArray(r) ? r : [];
          // ⛔️ اگر خالی بود، عمداً baseFields را خالی می‌گذاریم تا DesField هم خالی باشد
          if (arr.length > 0) {
            setBaseFields(arr.map((f: any) => ({ ID: f.ID, DisplayName: f.DisplayName })));
            baseFieldsLockedRef.current = true;
          }
        })
        .catch(console.error);
    }
  }, [srcEntityTypeId, data?.currentEntityTypeId, getEntityFieldByEntityTypeId]);

  /* -------- propagate metaType1/metaType2 + checkbox to parent -------- */
  const pushMetaUp = (patch?: Partial<typeof meta>) => {
    const next = patch ? { ...meta, ...patch } : meta;
    onMetaChange?.({
      ...next,
      CountInReject: removeSameName,
    });
  };

  // وقتی checkbox عوض شد
  useEffect(() => {
    onMetaChange?.({
      ...meta,
      CountInReject: removeSameName,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removeSameName]);

  // ✅ هر زمان جدول تغییر کند: فقط metaType4 را بده
  useEffect(() => {
    const json = JSON.stringify(tableData);
    onMetaExtraChange?.({ metaType4: json });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);

  /* -------- maps & signatures -------- */
  const fieldsMap = useMemo(
    () => new Map(fields.map((f: any) => [String(f.ID), f.DisplayName])),
    [fields]
  );
  const baseFieldsMap = useMemo(
    () => new Map(baseFields.map((f: any) => [String(f.ID), f.DisplayName])),
    [baseFields]
  );
  const fieldsSig = useMemo(() => fields.map((f: any) => String(f.ID)).join("|"), [fields]);
  const baseFieldsSig = useMemo(() => baseFields.map((f: any) => String(f.ID)).join("|"), [baseFields]);

  /* -------- emptiness rules -------- */
  const bothEmpty =
    (meta.metaType1 ?? "").trim() === "" && (meta.metaType2 ?? "").trim() === "";
  const noDesOptions = bothEmpty || baseFields.length === 0;

  /* -------- normalize when lists change -------- */
  // SrcField normalization
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
    if (changed) setTableData(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsSig, bothEmpty]);

  // DesField normalization
  useEffect(() => {
    if (baseFields.length === 0) {
      const changed = tableData.some((r) => r.DesFieldID);
      if (changed) {
        const cleared = tableData.map((r) => ({ ...r, DesFieldID: "" }));
        setTableData(cleared);
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
      if (changed) setTableData(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFieldsSig, noDesOptions]);

  /* -------- DataTable columns -------- */
  const columnDefs = useMemo(
    () => [
      {
        headerName: t("LookupUmage.Columns.DesField"),
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
        cellStyle: ellipsisCellStyle,
        headerStyle: ellipsisHeaderStyle,
      },
      {
        headerName: t("LookupUmage.Columns.Operation"),
        field: "FilterOpration",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: operationList.map((o) => o.value) },
        valueFormatter: (p: any) =>
          operationList.find((o) => o.value === p.value)?.label || p.value,
        cellStyle: ellipsisCellStyle,
        headerStyle: ellipsisHeaderStyle,
      },
      {
        headerName: t("LookupUmage.Columns.FilterText"),
        field: "FilterText",
        editable: true,
        cellStyle: ellipsisCellStyle,
        headerStyle: ellipsisHeaderStyle,
      },
      {
        headerName: t("LookupUmage.Columns.SrcField"),
        field: "SrcFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: () => ({
          values: bothEmpty ? [] : Array.from(fieldsMap.keys()),
        }),
        valueFormatter: (p: any) =>
          bothEmpty ? "" : (fieldsMap.get(String(p.value)) ?? String(p.value ?? "")),
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

  /* -------- table row ops -------- */
  const addRow = () => {
    const defaultSrc = bothEmpty ? "" : (fields[0]?.ID ?? "");
    const defaultDes = noDesOptions ? "" : (baseFields[0]?.ID ?? "");
    const newRow: TableRow = {
      ID: genId(),
      SrcFieldID: defaultSrc ? String(defaultSrc) : "",
      FilterOpration: "",
      FilterText: "",
      DesFieldID: defaultDes ? String(defaultDes) : "",
    };
    setTableData([...tableData, newRow]);
  };

  const handleCellValueChanged = (e: any) => {
    const upd = e.data as TableRow;
    const next = tableData.map((r) =>
      r.ID === upd.ID
        ? {
            ...upd,
            SrcFieldID: upd.SrcFieldID != null ? String(upd.SrcFieldID) : "",
            DesFieldID: upd.DesFieldID != null ? String(upd.DesFieldID) : "",
          }
        : r
    );
    setTableData(next);
  };

  /* ---------------- render ---------------- */
  return (
    <div
      dir={uiDir}
      className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg"
    >
      {/* تنظیمات بالایی */}
      <div className="flex gap-8">
        <div className="flex flex-col w-1/2 space-y-6">
          <DynamicSelector
            name="getInformationFrom"
            label={t("LookupUmage.Form.GetInformationFrom")}
            options={entityTypes.map((ent) => ({
              value: String(ent.ID),
              label: ent.Name,
            }))}
            selectedValue={meta.metaType1}
            onChange={(e) =>
              setMeta((prev) => {
                const next = { ...prev, metaType1: e.target.value };
                pushMetaUp(next);
                return next;
              })
            }
          />

          <DynamicSelector
            name="displayColumn"
            label={t("LookupUmage.Form.WhatColumnToDisplay")}
            options={fields.map((f) => ({
              value: String(f.ID),
              label: f.DisplayName,
            }))}
            selectedValue={meta.metaType2}
            onChange={(e) =>
              setMeta((prev) => {
                const next = { ...prev, metaType2: e.target.value };
                pushMetaUp(next);
                return next;
              })
            }
          />
        </div>

        <div className="flex flex-col justify-center w-1/2">
          <label className="inline-flex gap-2 items-center cursor-pointer">
            <input
              type="checkbox"
              checked={removeSameName}
              onChange={(e) => setRemoveSameName(e.target.checked)}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <span className="text-gray-700 font-medium">
              {t("LookupUmage.Form.RemoveSameName")}
            </span>
          </label>
        </div>
      </div>

      {/* جدول پایین */}
      <DataTable
        key={`dt-umage-${fieldsSig}-${baseFieldsSig}-${noDesOptions ? "noDes" : "hasDes"}-${bothEmpty ? "srcEmpty" : "srcHas"}`}
        columnDefs={columnDefs}
        rowData={tableData}
        domLayout="autoHeight"
        showAddIcon
        showEditIcon={false}
        showDeleteIcon={false}
        showDuplicateIcon={false}
        showSearch={false}
        onAdd={addRow}
        onCellValueChanged={handleCellValueChanged}
        gridOptions={{
          singleClickEdit: true,
          rowSelection: "single",
          stopEditingWhenCellsLoseFocus: true,
        }}
        direction={uiDir}
        onRowDoubleClick={() => {}}
      />
    </div>
  );
};

export default LookupUmage;
