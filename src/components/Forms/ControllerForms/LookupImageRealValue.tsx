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
    metaType1?: string | null;
    metaType2?: string | null;
    metaType4?: string;       // Program Meta (فقط ورودی/نمایش کاربر - دست نزن)
    metaTypeJson?: string;    // ✅ JSON جدول فیلترها (منبع/مقصد تنها)
    CountInReject?: boolean;  // ✅ مقدار چک‌باکس Remove same name
    removeSameName?: boolean; // سازگاری با نسخه‌های قدیمی
  };
  onMetaChange?: (updatedMeta: any) => void;
  // توجه: عمداً onMetaExtraChange استفاده نمی‌شود تا Program Meta پر/تغییر نشود
  onMetaExtraChange?: (updated: { metaType4: string }) => void;
}

interface TableRow {
  ID: string;
  SrcFieldID: string;
  FilterOpration: string;
  FilterText: string;
  DesFieldID: string;
}

const genId = () =>
  typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : uuidv4();

const LookupUmageRealValue: React.FC<LookupUmageProps> = ({
  data = {},
  onMetaChange,
}) => {
  const { t } = useTranslation();

  /* ---------------- state ---------------- */
  const [meta, setMeta] = useState({
    metaType1: data.metaType1 ? String(data.metaType1) : "",
    metaType2: data.metaType2 ? String(data.metaType2) : "",
  });

  const [removeSameName, setRemoveSameName] = useState(
    (data as any)?.CountInReject ?? data.removeSameName ?? false
  );

  const [tableData, setTableData] = useState<TableRow[]>([]);

  // مرجعِ آخرین JSON جدول (فقط metaTypeJson؛ نه metaType4)
  const prevJsonRef = useRef<string | undefined>(data?.metaTypeJson);

  /* -------- sync props → state (فقط در صورت تفاوت) -------- */
  useEffect(() => {
    const nextMeta = {
      metaType1: data?.metaType1 ? String(data.metaType1) : "",
      metaType2: data?.metaType2 ? String(data.metaType2) : "",
    };

    setMeta((prev) =>
      prev.metaType1 === nextMeta.metaType1 && prev.metaType2 === nextMeta.metaType2
        ? prev
        : nextMeta
    );

    const incomingRemove =
      (data as any)?.CountInReject ?? data?.removeSameName ?? false;

    setRemoveSameName((prev) =>
      prev === !!incomingRemove ? prev : !!incomingRemove
    );

    // ✅ تنها منبعِ جدول، metaTypeJson است
    const incomingJson =
      typeof data?.metaTypeJson === "string" && data.metaTypeJson.trim() !== ""
        ? data.metaTypeJson
        : "[]";

    if (prevJsonRef.current !== incomingJson) {
      prevJsonRef.current = incomingJson;
      try {
        const parsed = JSON.parse(incomingJson);
        if (Array.isArray(parsed)) {
          const mapped = parsed.map((item: any) => ({
            ID: String(item.ID ?? genId()),
            SrcFieldID: item.SrcFieldID || "",
            FilterOpration: item.FilterOpration || "",
            FilterText: item.FilterText || "",
            DesFieldID: item.DesFieldID || "",
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
  }, [
    data?.metaType1,
    data?.metaType2,
    data?.metaTypeJson,  // ← فقط این
    data?.CountInReject,
    data?.removeSameName,
  ]);

  /* -------- propagate changes to parent -------- */
  const pushUp = (metaPatch?: Partial<typeof meta>, overrideTable?: TableRow[]) =>
    onMetaChange?.({
      ...(metaPatch ? { ...meta, ...metaPatch } : meta),
      metaTypeJson: JSON.stringify(overrideTable ?? tableData), // ✅ فقط این فیلد
      CountInReject: removeSameName,                             // ✅ چک‌باکس
    });

  // هر زمان جدول یا چک‌باکس تغییر کند، مقادیر بالا داده شود
  useEffect(() => {
    const json = JSON.stringify(tableData);
    onMetaChange?.({
      ...meta,
      metaTypeJson: json,
      CountInReject: removeSameName,
    });
    // ⛔️ onMetaExtraChange را عمداً صدا نمی‌زنیم تا Program Meta دست‌نخورده بماند
  }, [tableData, removeSameName]); // eslint-disable-line react-hooks/exhaustive-deps

  /* -------- dynamic lists -------- */
  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();

  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const [fields, setFields] = useState<EntityField[]>([]);
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    getAllEntityType()
      .then((res) => setEntityTypes(Array.isArray(res) ? res : []))
      .catch(console.error);
  }, [getAllEntityType]);

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

  /* -------- DataTable columns -------- */
  const columnDefs = useMemo(
    () => [
      {
        headerName: t("LookupUmage.Columns.SrcField"),
        field: "SrcFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: fields.map((f) => String(f.ID)) },
        valueFormatter: (p: any) =>
          fields.find((f) => String(f.ID) === p.value)?.DisplayName || p.value,
      },
      {
        headerName: t("LookupUmage.Columns.Operation"),
        field: "FilterOpration",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: operationList.map((o) => o.value) },
        valueFormatter: (p: any) =>
          operationList.find((o) => o.value === p.value)?.label || p.value,
      },
      {
        headerName: t("LookupUmage.Columns.FilterText"),
        field: "FilterText",
        editable: true,
      },
      {
        headerName: t("LookupUmage.Columns.DesField"),
        field: "DesFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: fields.map((f) => String(f.ID)) },
        valueFormatter: (p: any) =>
          fields.find((f) => String(f.ID) === p.value)?.DisplayName || p.value,
      },
    ],
    [fields, operationList, t]
  );

  /* -------- table row ops -------- */
  const addRow = () => {
    const newRow: TableRow = {
      ID: genId(),
      SrcFieldID: "",
      FilterOpration: "",
      FilterText: "",
      DesFieldID: "",
    };
    setTableData((prev) => [...prev, newRow]);
  };

  const handleCellValueChanged = (e: any) => {
    const upd = e.data as TableRow;
    setTableData((prev) => prev.map((r) => (r.ID === upd.ID ? upd : r)));
  };

  /* ---------------- render ---------------- */
  return (
    <div className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
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
                pushUp(next);
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
                pushUp(next);
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
      />
    </div>
  );
};

export default LookupUmageRealValue;
