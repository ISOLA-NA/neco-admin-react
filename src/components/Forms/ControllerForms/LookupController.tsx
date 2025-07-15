// src/components/ControllerForms/LookUp.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import { useApi } from "../../../context/ApiContext";
import AppServices from "../../../services/api.services";

import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";

/* ──────────────── Types ──────────────── */
interface LookUpProps {
  data?: {
    metaType1?: string | number | null;
    metaType2?: string | number | null;
    metaType3?: string;
    metaType4?: string;
    metaType5?: string;
    LookupMode?: string | number | null;
    CountInReject?: boolean;
    BoolMeta1?: boolean;
  };
  onMetaChange?: (updated: any) => void;
  onMetaExtraChange?: (updated: { metaType4: string }) => void;
}

interface TableRow {
  ID: string;
  SrcFieldID: string;
  FilterOpration: string;
  FilterText: string;
  DesFieldID: string;
}

/* ──────────────── Component ──────────────── */
const LookUp: React.FC<LookUpProps> = ({
  data = {},
  onMetaChange,
  onMetaExtraChange,
}) => {
  /* helpers */
  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();
  const genId = () =>
    typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : uuidv4();

  /* refs */
  const initialModeRef = useRef(true);

  /* state */
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

  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [entities, setEntities] = useState<{ ID: any; Name: string }[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [modesList, setModesList] = useState<
    { value: string; label: string }[]
  >([]);
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);

  /* ─── sync from props.data (edit) ─── */
  useEffect(() => {
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(data.metaType4 || "[]");
    } catch {}

    setTableData(
      Array.isArray(parsed)
        ? parsed.map((it) => ({
            ID: String(it.ID ?? genId()),
            SrcFieldID: it.SrcFieldID || "",
            FilterOpration: it.FilterOpration || "",
            FilterText: it.FilterText || "",
            DesFieldID: it.DesFieldID || "",
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
  }, [getAllEntityType]);

  /* ─── after modes loaded, restore LookupMode ─── */
  useEffect(() => {
    if (
      initialModeRef.current &&
      modesList.length &&
      data.LookupMode != null
    ) {
      const mv = String(data.LookupMode);
      if (modesList.some((m) => m.value === mv)) {
        setMeta((p) => ({ ...p, LookupMode: mv }));
      }
      initialModeRef.current = false;
    }
  }, [modesList, data.LookupMode]);

  /* ─── load fields when metaType1 changes ─── */
  useEffect(() => {
    const id = Number(meta.metaType1);
    if (!isNaN(id) && id > 0) {
      getEntityFieldByEntityTypeId(id)
        .then((r) => setFields(Array.isArray(r) ? r : []))
        .catch(console.error);
    } else setFields([]);
  }, [meta.metaType1, getEntityFieldByEntityTypeId]);

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

  const toggleCheck = (
    key: "removeSameName" | "oldLookup",
    val: boolean
  ) => {
    if (key === "removeSameName") setRemoveSameName(val);
    else setOldLookup(val);

    onMetaChange?.({
      ...data,
      ...meta,
      CountInReject: key === "removeSameName" ? val : removeSameName,
      BoolMeta1: key === "oldLookup" ? val : oldLookup,
    });
  };

  const addRow = () => {
    const newRow: TableRow = {
      ID: genId(),
      SrcFieldID: "",
      FilterOpration: "",
      FilterText: "",
      DesFieldID: "",
    };
    const next = [...tableData, newRow];
    setTableData(next);
    const json = JSON.stringify(next);
    setMeta((p) => ({ ...p, metaType4: json }));
    onMetaExtraChange?.({ metaType4: json });
  };

  const onCellChange = (e: any) => {
    const upd = e.data as TableRow;
    const next = tableData.map((r) => (r.ID === upd.ID ? upd : r));
    setTableData(next);
    const json = JSON.stringify(next);
    setMeta((p) => ({ ...p, metaType4: json }));
    onMetaExtraChange?.({ metaType4: json });
  };

  /* ─── AG‑Grid columns ─── */
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

  /* ─── Render ─── */
  return (
    <div className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      <div className="flex gap-8">
        {/* ===== ستون چپ ===== */}
        <div className="flex flex-col space-y-6 w-1/2">
          <DynamicSelector
            name="getInformationFrom"
            label="Get information from"
            options={entities.map((e) => ({
              value: String(e.ID),
              label: e.Name,
            }))}
            selectedValue={meta.metaType1}
            onChange={(e) => pushMeta({ metaType1: e.target.value })}
          />

          <DynamicSelector
            name="displayColumn"
            label="What Column To Display"
            options={fields.map((f) => ({
              value: String(f.ID),
              label: f.DisplayName,
            }))}
            selectedValue={meta.metaType2}
            onChange={(e) => pushMeta({ metaType2: e.target.value })}
          />

          <DynamicSelector
            name="modes"
            label="Modes"
            options={modesList}
            selectedValue={meta.LookupMode}
            onChange={(e) => pushMeta({ LookupMode: e.target.value })}
          />

          <PostPickerList
            sourceType="projects"
            initialMetaType={meta.metaType5}
            data={{ metaType5: meta.metaType5 || undefined }}
            metaFieldKey="metaType5"
            onMetaChange={(o) => pushMeta(o)}
            label="Default Projects"
            fullWidth
          />
        </div>

        {/* ===== ستون راست ===== */}
        <div className="flex flex-col space-y-6 w-1/2">
          {/* --- نحوهٔ نمایش --- */}
          <div className="space-y-2">
            <label className="block font-medium">Display choices using:</label>
            {["drop", "radio", "check"].map((t) => (
              <label key={t} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayType"
                  value={t}
                  checked={meta.metaType3 === t}
                  onChange={() => pushMeta({ metaType3: t })}
                />
                {t === "drop"
                  ? "Drop‑Down Menu"
                  : t === "radio"
                  ? "Radio Buttons"
                  : "Checkboxes (allow multiple selections)"}
              </label>
            ))}
          </div>

          {/* --- چک‌باکس‌ها --- */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={removeSameName}
                onChange={(e) =>
                  toggleCheck("removeSameName", e.target.checked)
                }
              />
              Remove Same Name
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={oldLookup}
                onChange={(e) => toggleCheck("oldLookup", e.target.checked)}
              />
              Old Lookup
            </label>
          </div>
        </div>
      </div>

      {/* ===== جدول ===== */}
      <div className="mt-4" style={{ height: 300, overflowY: "auto" }}>
        <DataTable
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
        />
      </div>
    </div>
  );
};

export default LookUp;
