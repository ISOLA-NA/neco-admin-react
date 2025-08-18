// AdvanceLookupAdvanceTable.tsx

import React, { useState, useEffect, useRef, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import { useApi } from "../../../context/ApiContext";
import AppServices from "../../../services/api.services";

import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";
import { useTranslation } from "react-i18next";

interface LookUpFormsProps {
  data?: {
    metaType1?: string | number | null;
    metaType2?: string | number | null;
    metaType3?: string;
    metaType4?: string;
    metaType5?: string;
    LookupMode?: string | number | null;
    isEdit?: boolean;
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

const AdvanceLookupAdvanceTable: React.FC<LookUpFormsProps> = ({
  data = {},
  onMetaChange,
  onMetaExtraChange,
}) => {
  const { t } = useTranslation();

  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();

  // generate stable IDs
  const generateId = () =>
    typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : uuidv4();

  const initialModeRef = useRef<boolean>(true);

  const [meta, setMeta] = useState({
    metaType1: "",
    metaType2: "",
    metaType3: "drop",
    metaType4: "[]",
    metaType5: "",
    LookupMode: "",
  });

  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [entities, setEntities] = useState<{ ID: any; Name: string }[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [modesList, setModesList] = useState<
    { value: string; label: string }[]
  >([]);
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);

  // sync from props.data on first load or data change
  useEffect(() => {
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(data.metaType4 || "[]");
    } catch {}

    setTableData(
      Array.isArray(parsed)
        ? parsed.map((item) => ({
            ID: String(item.ID ?? generateId()),
            SrcFieldID: item.SrcFieldID || "",
            FilterOpration: item.FilterOpration || "",
            FilterText: item.FilterText || "",
            DesFieldID: item.DesFieldID || "",
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

    initialModeRef.current = true;
  }, [data]);

  // load entities and enums once
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

  // apply initial LookupMode once after modesList loads
  useEffect(() => {
    if (initialModeRef.current && modesList.length && data.LookupMode != null) {
      const mv = String(data.LookupMode);
      if (modesList.some((m) => m.value === mv)) {
        setMeta((prev) => ({ ...prev, LookupMode: mv }));
      }
      initialModeRef.current = false;
    }
  }, [modesList, data.LookupMode]);

  // load fields when metaType1 changes
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

  // generic meta change handler
  const handleMetaChange = (partial: Partial<typeof meta>) => {
    const next = { ...meta, ...partial };
    setMeta(next);
    onMetaChange?.({
      ...data,
      ...next,
    });
  };

  const handleAddRow = () => {
    const newRow: TableRow = {
      ID: generateId(),
      SrcFieldID: "",
      FilterOpration: "",
      FilterText: "",
      DesFieldID: "",
    };
    const next = [...tableData, newRow];
    setTableData(next);

    const json = JSON.stringify(next);
    setMeta((prev) => ({ ...prev, metaType4: json }));
    onMetaExtraChange?.({ metaType4: json });
  };

  const handleCellValueChanged = (e: any) => {
    const updated = e.data as TableRow;
    const next = tableData.map((r) => (r.ID === updated.ID ? updated : r));
    setTableData(next);

    const json = JSON.stringify(next);
    setMeta((prev) => ({ ...prev, metaType4: json }));
    onMetaExtraChange?.({ metaType4: json });
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: t("AdvanceLookupAdvanceTable.Columns.SrcField"),
        field: "SrcFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: fields.map((f) => String(f.ID)) },
        valueFormatter: (p: any) =>
          fields.find((f) => String(f.ID) === p.value)?.DisplayName || p.value,
      },
      {
        headerName: t("AdvanceLookupAdvanceTable.Columns.Operation"),
        field: "FilterOpration",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: operationList.map((o) => o.value) },
        valueFormatter: (p: any) =>
          operationList.find((o) => o.value === p.value)?.label || p.value,
      },
      {
        headerName: t("AdvanceLookupAdvanceTable.Columns.FilterText"),
        field: "FilterText",
        editable: true,
      },
      {
        headerName: t("AdvanceLookupAdvanceTable.Columns.DesField"),
        field: "DesFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: fields.map((f) => String(f.ID)) },
        valueFormatter: (p: any) =>
          fields.find((f) => String(f.ID) === p.value)?.DisplayName || p.value,
      },
    ],
    [t, fields, operationList]
  );

  const isEdit = !!data.isEdit;

  return (
    <div className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      {/* selectors and pickers */}
      <div className="flex gap-8">
        <div className="flex flex-col space-y-6 w-1/2">
          <DynamicSelector
            name="metaType1"
            label={t(
              "AdvanceLookupAdvanceTable.Form.ForFirstFormGetInformationFrom"
            )}
            options={entities.map((e) => ({
              value: String(e.ID),
              label: e.Name,
            }))}
            selectedValue={meta.metaType1}
            onChange={(e) => handleMetaChange({ metaType1: e.target.value })}
            disabled={isEdit}
          />

          <DynamicSelector
            name="metaType2"
            label={t(
              "AdvanceLookupAdvanceTable.Form.ForSecondFormGetInformationFrom"
            )}
            options={entities.map((e) => ({
              value: String(e.ID),
              label: e.Name,
            }))}
            selectedValue={meta.metaType2}
            onChange={(e) => handleMetaChange({ metaType2: e.target.value })}
            disabled={isEdit}
          />

          <DynamicSelector
            name="LookupMode"
            label={t("AdvanceLookupAdvanceTable.Form.LookupMode")}
            options={modesList}
            selectedValue={meta.LookupMode}
            onChange={(e) => handleMetaChange({ LookupMode: e.target.value })}
          />

          <PostPickerList
            sourceType="projects"
            initialMetaType={meta.metaType5}
            metaFieldKey="metaType5"
            onMetaChange={(o) => handleMetaChange(o)}
            label={t("AdvanceLookupAdvanceTable.Form.ShowColumnsOfFirstForm")}
            fullWidth
          />
        </div>
      </div>

      {/* table */}
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
        />
      </div>
    </div>
  );
};

export default AdvanceLookupAdvanceTable;
