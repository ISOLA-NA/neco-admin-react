import React, { useState, useEffect, useRef, useMemo } from "react";
import { useApi } from "../../../context/ApiContext";
import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";
import AppServices from "../../../services/api.services";

interface LookUpFormsProps {
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
  SrcFieldID: string | null;
  FilterOpration: string | null;
  FilterText: string;
  DesFieldID: string | null;
}

const LookUpForms: React.FC<LookUpFormsProps> = ({
  data,
  onMetaChange,
  onMetaExtraChange,
}) => {
  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();

  // ------ local state ------
  const [meta, setMeta] = useState({
    metaType1: data?.metaType1 ? String(data.metaType1) : "",
    metaType2: data?.metaType2 ? String(data.metaType2) : "",
    metaType3: data?.metaType3 || "drop",
    metaType4: data?.metaType4 || "[]",
    metaType5: data?.metaType5 || "",
    LookupMode: data?.LookupMode ? String(data.LookupMode) : "",
  });
  const [removeSameName, setRemoveSameName] = useState(!!data?.CountInReject);
  const [oldLookup, setOldLookup] = useState(!!data?.BoolMeta1);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [entities, setEntities] = useState<{ ID: any; Name: string }[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [modesList, setModesList] = useState<
    { value: string; label: string }[]
  >([]);
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);

  const isFirstLoad = useRef(true);

  // ------ initialize once on mount ------
  useEffect(() => {
    // 1. بارگذاری جدول اولیه از prop.data.metaType4
    try {
      const parsed = JSON.parse(data?.metaType4 || "[]");
      if (Array.isArray(parsed)) {
        setTableData(
          parsed.map((item: any) => ({
            ID: String(item.ID ?? crypto.randomUUID()),
            SrcFieldID: item.SrcFieldID || "",
            FilterOpration: item.FilterOpration || "",
            FilterText: item.FilterText || "",
            DesFieldID: item.DesFieldID || "",
          }))
        );
      }
    } catch {
      setTableData([]);
    }

    // 2. fetch entity types
    getAllEntityType()
      .then((res) => Array.isArray(res) && setEntities(res))
      .catch(console.error);

    // 3. fetch enums
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

    // اعلام اولیه‌ی meta
    onMetaChange?.({
      ...data,
      ...meta,
      CountInReject: removeSameName,
      BoolMeta1: oldLookup,
    });

    isFirstLoad.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialModeRef = useRef(true);

  // فقط یک‌بار که modesList اومد و data.LookupMode وجود داشت، مقدار اولیه رو ست کن
  useEffect(() => {
    if (
      initialModeRef.current &&
      modesList.length > 0 &&
      data?.LookupMode != null
    ) {
      const modeValue = String(data.LookupMode);
      // مطمئن شو این گزینه توی لیست هست
      if (modesList.some((m) => m.value === modeValue)) {
        setMeta((prev) => ({ ...prev, LookupMode: modeValue }));
        // اگر می‌خواهی والد رو هم فوراً مطلع کنی:
        onMetaChange?.({
          ...data,
          ...meta,
          LookupMode: modeValue,
          CountInReject: removeSameName,
          BoolMeta1: oldLookup,
        });
      }
      initialModeRef.current = false;
    }
  }, [
    modesList,
    data?.LookupMode,
    onMetaChange,
    data,
    meta,
    removeSameName,
    oldLookup,
  ]);

  // ------ sync fields when metaType1 changes ------
  useEffect(() => {
    const id = Number(meta.metaType1);
    if (!isNaN(id) && id) {
      getEntityFieldByEntityTypeId(id)
        .then((res) => setFields(Array.isArray(res) ? res : []))
        .catch(console.error);
    } else {
      setFields([]);
    }
  }, [meta.metaType1, getEntityFieldByEntityTypeId]);

  // ------ handlers ------
  const handleMetaChange = (partial: Partial<typeof meta>) => {
    const next = { ...meta, ...partial };
    setMeta(next);
    onMetaChange?.({
      ...data,
      ...next,
      CountInReject: removeSameName,
      BoolMeta1: oldLookup,
    });
  };

  const handleCheckbox = (
    name: "removeSameName" | "oldLookup",
    value: boolean
  ) => {
    if (name === "removeSameName") {
      setRemoveSameName(value);
      onMetaChange?.({
        ...data,
        ...meta,
        CountInReject: value,
        BoolMeta1: oldLookup,
      });
    } else {
      setOldLookup(value);
      onMetaChange?.({
        ...data,
        ...meta,
        CountInReject: removeSameName,
        BoolMeta1: value,
      });
    }
  };

  const handleAddRow = () => {
    const newRow: TableRow = {
      ID: crypto.randomUUID(),
      SrcFieldID: "",
      FilterOpration: "",
      FilterText: "",
      DesFieldID: "",
    };
    const next = [...tableData, newRow];
    setTableData(next);
    onMetaExtraChange?.({ metaType4: JSON.stringify(next) });
  };

  const handleCellValueChanged = (event: any) => {
    const updatedRow = event.data as TableRow;
    const next = tableData.map((r) =>
      r.ID === updatedRow.ID ? updatedRow : r
    );
    setTableData(next);
    onMetaExtraChange?.({ metaType4: JSON.stringify(next) });
  };

  // ------ table column defs ------
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

  return (
    <div className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      <div className="flex gap-8">
        <div className="flex flex-col space-y-6 w-1/2">
          <DynamicSelector
            name="getInformationFrom"
            label="Get information from"
            options={entities.map((e) => ({
              value: String(e.ID),
              label: e.Name,
            }))}
            selectedValue={meta.metaType1}
            onChange={(e) => handleMetaChange({ metaType1: e.target.value })}
          />

          <DynamicSelector
            name="displayColumn"
            label="What Column To Display"
            options={fields.map((f: any) => ({
              value: String(f.ID),
              label: f.DisplayName,
            }))}
            selectedValue={meta.metaType2}
            onChange={(e) => handleMetaChange({ metaType2: e.target.value })}
          />

          <DynamicSelector
            name="modes"
            label="Modes"
            options={modesList}
            selectedValue={meta.LookupMode}
            onChange={(e) => handleMetaChange({ LookupMode: e.target.value })}
          />

          <PostPickerList
            sourceType="projects"
            initialMetaType={meta.metaType5}
            metaFieldKey="metaType5"
            onMetaChange={(o) => handleMetaChange(o)}
            label="Default Projects"
            fullWidth
          />
        </div>

        <div className="flex flex-col space-y-6 w-1/2">
          <div className="space-y-2">
            <label className="block font-medium">Display choices using:</label>
            {["drop", "radio", "check"].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayType"
                  value={type}
                  checked={meta.metaType3 === type}
                  onChange={() => handleMetaChange({ metaType3: type })}
                />
                {type === "drop"
                  ? "Drop-Down Menu"
                  : type === "radio"
                  ? "Radio Buttons"
                  : "Checkboxes (multiple)"}
              </label>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={removeSameName}
                onChange={(e) =>
                  handleCheckbox("removeSameName", e.target.checked)
                }
              />
              Remove Same Name
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={oldLookup}
                onChange={(e) => handleCheckbox("oldLookup", e.target.checked)}
              />
              Old Lookup
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4" style={{ height: 300, overflowY: "auto" }}>
        {fields.length > 0 && (
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
          />
        )}
      </div>
    </div>
  );
};

export default LookUpForms;
