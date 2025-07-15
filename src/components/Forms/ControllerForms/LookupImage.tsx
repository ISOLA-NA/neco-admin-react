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

interface LookupUmageProps {
  data?: {
    metaType1?: string | null;
    metaType2?: string | null;
    metaType4?: string;
    removeSameName?: boolean;
  };
  onMetaChange?: (updatedMeta: any) => void;
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

const LookupUmage: React.FC<LookupUmageProps> = ({
  data = {},
  onMetaChange,
  onMetaExtraChange,
}) => {
  /* ---------------- state ---------------- */
  const [meta, setMeta] = useState({
    metaType1: data.metaType1 ? String(data.metaType1) : "",
    metaType2: data.metaType2 ? String(data.metaType2) : "",
  });
  const [removeSameName, setRemoveSameName] = useState(
    !!data.removeSameName
  );
  const [tableData, setTableData] = useState<TableRow[]>([]);

  /* برای مقایسهٔ metaType4 قبلی */
  const prevMeta4Ref = useRef<string | undefined>(data.metaType4);

  /* -------- sync props → state (فقط در صورت تفاوت) -------- */
  useEffect(() => {
    const nextMeta = {
      metaType1: data.metaType1 ? String(data.metaType1) : "",
      metaType2: data.metaType2 ? String(data.metaType2) : "",
    };
    setMeta((prev) =>
      prev.metaType1 === nextMeta.metaType1 &&
      prev.metaType2 === nextMeta.metaType2
        ? prev
        : nextMeta
    );

    setRemoveSameName((prev) =>
      prev === !!data.removeSameName ? prev : !!data.removeSameName
    );

    if (prevMeta4Ref.current !== data.metaType4) {
      prevMeta4Ref.current = data.metaType4;
      try {
        const parsed = JSON.parse(data.metaType4 || "[]");
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
    data.metaType1,
    data.metaType2,
    data.metaType4,
    data.removeSameName,
  ]);

  /* -------- propagate changes to parent -------- */
  const pushUp = (metaPatch?: Partial<typeof meta>, overrideTable?: TableRow[]) =>
    onMetaChange?.({
      ...(metaPatch ? { ...meta, ...metaPatch } : meta),
      metaType4: JSON.stringify(overrideTable ?? tableData),
      CountInReject: removeSameName,
    });

  /* whenever tableData or checkbox changes */
  useEffect(() => {
    const json = JSON.stringify(tableData);
    onMetaChange?.({
      ...meta,
      metaType4: json,
      CountInReject: removeSameName,
    });
    onMetaExtraChange?.({ metaType4: json });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData, removeSameName]);

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
        headerName: "Src Field",
        field: "SrcFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: fields.map((f) => String(f.ID)) },
        valueFormatter: (p: any) =>
          fields.find((f) => String(f.ID) === p.value)?.DisplayName || p.value,
      },
      {
        headerName: "Operation",
        field: "FilterOpration",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: operationList.map((o) => o.value) },
        valueFormatter: (p: any) =>
          operationList.find((o) => o.value === p.value)?.label || p.value,
      },
      { headerName: "Filter Text", field: "FilterText", editable: true },
      {
        headerName: "Des Field",
        field: "DesFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: fields.map((f) => String(f.ID)) },
        valueFormatter: (p: any) =>
          fields.find((f) => String(f.ID) === p.value)?.DisplayName || p.value,
      },
    ],
    [fields, operationList]
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
    setTableData((prev) =>
      prev.map((r) => (r.ID === upd.ID ? upd : r))
    );
  };

  /* ---------------- render ---------------- */
  return (
    <div className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      {/* تنظیمات بالایی */}
      <div className="flex gap-8">
        <div className="flex flex-col w-1/2 space-y-6">
          <DynamicSelector
            name="getInformationFrom"
            label="Get Information From"
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
            label="What Column To Display"
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
              Remove Same Name
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

export default LookupUmage;
