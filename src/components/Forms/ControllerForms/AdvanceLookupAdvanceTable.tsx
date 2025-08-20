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
  };
  onMetaChange?: (updated: any) => void;
  onMetaExtraChange?: (updated: { metaType4: string }) => void;
  /** 🔑 سیگنال ریست از والد هنگام تغییر Type of Information */
  resetKey?: number | string;
}

interface TableRow {
  ID: string;
  SrcFieldID: string;
  FilterOpration: string;
  FilterText: string;
  DesFieldID: string;
}

const LookUpAdvanceTable: React.FC<LookUpAdvanceTableProps> = ({
  data = {},
  onMetaChange,
  onMetaExtraChange,
  resetKey,
}) => {
  const { t } = useTranslation();
  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();
  const genId = () =>
    typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : uuidv4();

  const initialModeRef = useRef(true);
  const resetMountedRef = useRef(false);

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
  const [fields, setFields] = useState<any[]>([]);
  const [modesList, setModesList] = useState<
    { value: string; label: string }[]
  >([]);
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
  }, []);

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

  const handleAddRow = () => {
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

  const ppKey = useMemo(
    () => `${meta.metaType1}|${meta.metaType2}|${resetKey ?? 0}`,
    [meta.metaType1, meta.metaType2, resetKey]
  );

  // columns
  const columnDefs = useMemo(
    () => [
      {
        headerName: t("LookUpAdvanceTable.Columns.SrcField"),
        field: "SrcFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: fields.map((f) => String(f.ID)) },
        valueFormatter: (p: any) =>
          fields.find((f) => String(f.ID) === p.value)?.DisplayName || p.value,
      },
      {
        headerName: t("LookUpAdvanceTable.Columns.Operation"),
        field: "FilterOpration",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: operationList.map((o) => o.value) },
        valueFormatter: (p: any) =>
          operationList.find((o) => o.value === p.value)?.label || p.value,
      },
      {
        headerName: t("LookUpAdvanceTable.Columns.FilterText"),
        field: "FilterText",
        editable: true,
      },
      {
        headerName: t("LookUpAdvanceTable.Columns.DesField"),
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
        />
      </div>
    </div>
  );
};

export default LookUpAdvanceTable;
