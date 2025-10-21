// src/components/ControllerForms/InventoryController.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useApi } from "../../../context/ApiContext";
import AppServices from "../../../services/api.services";
import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";
import { useTranslation } from "react-i18next";


/* ───────── Types ───────── */
interface InventoryProps {
  data?: {
    metaType1?: string | number | null; // Get from (source EntityType)
    metaType2?: string | number | null; // Set field as name (NameEntityFieldID)
    metaType3?: string | number | null;
    metaType4?: string;                 // table JSON
    metaType5?: string;                 // default projects (PostPickerList)
    LookupMode?: string | number | null;

    metaTypeJson?: string;              // inventory settings json
    currentEntityTypeId?: string | number | null; // for DesField list in grid

    CountInReject?: boolean | null;
    BoolMeta1?: boolean | null;
  };
  onMetaChange?: (updated: any) => void;
  onMetaExtraChange?: (updated: { metaType4: string }) => void;
  resetKey?: number | string;

  /** optional: form fields to use for DesField column in grid */
  srcFields?: Array<{ ID: string | number; DisplayName: string }>;
  srcEntityTypeId?: string | number;
}

interface TableRow {
  ID: string;
  DesFieldID: string;
  FilterOpration: string;
  FilterText: string;
  SrcFieldID: string;
}

type MetaJson = {
  NameEntityFieldID?: number | string;
  InventorWfBoxName?: string;
  Action?: 0 | 1 | 2;

  InventorySumEntityFieldID?: number | string;
  Inventory1EntityFieldID?: number | string;
  Inventory2EntityFieldID?: number | string;
  Inventory3EntityFieldID?: number | string;
  Inventory4EntityFieldID?: number | string;
  Inventory5EntityFieldID?: number | string;

  Unit1EntityFieldID?: number | string;
  Unit2EntityFieldID?: number | string;
  Unit3EntityFieldID?: number | string;
  Unit4EntityFieldID?: number | string;
  Unit5EntityFieldID?: number | string;

  Unit1Ratio?: number; // always 1 (disabled)
  Unit2RatioEntityFieldID?: number | string;
  Unit3RatioEntityFieldID?: number | string;
  Unit4RatioEntityFieldID?: number | string;
  Unit5RatioEntityFieldID?: number | string;

  ReserveEntityFieldID?: number | string;
};

/* ───────── Helpers ───────── */
const genId = () =>
  typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : uuidv4();

const toStr = (v: any, fallback = "") =>
  v === undefined || v === null ? fallback : String(v);

const parseJson = (s?: string | null): MetaJson => {
  try {
    const j = s ? JSON.parse(s) : {};
    return typeof j === "object" && j ? j : {};
  } catch {
    return {};
  }
};

/* ───────── Component ───────── */
const InventoryController: React.FC<InventoryProps> = ({
  data = {},
  onMetaChange,
  onMetaExtraChange,
  resetKey,
  srcFields,
  srcEntityTypeId,
}) => {
  const { t } = useTranslation("Inventory");

  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();

  const initialModeRef = useRef(true);
  const baseFieldsLockedRef = useRef(false);

  // meta (header area)
  const [meta, setMeta] = useState({
    metaType1: "",
    metaType2: "",
    metaType3: toStr(data.metaType3),
    metaType4: "[]",
    metaType5: "",
    LookupMode: "",
  });
  const [metaJson, setMetaJson] = useState<MetaJson>({
    Unit1Ratio: 1,
    Action: 0,
  });

  // grid
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // lists
  const [entities, setEntities] = useState<{ ID: any; Name: string }[]>([]);
  const [fields, setFields] = useState<any[]>([]);      // source fields for top selectors
  const [baseFields, setBaseFields] = useState<any[]>([]); // current form fields for DesField in grid

  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);
  const [modesList, setModesList] = useState<
    { value: string; label: string }[]
  >([]);

  /* sync from props */
  useEffect(() => {
    // grid rows
    let parsedTbl: any[] = [];
    try {
      parsedTbl = JSON.parse(data.metaType4 || "[]");
    } catch {
      parsedTbl = [];
    }
    setTableData(
      Array.isArray(parsedTbl)
        ? parsedTbl.map((it) => ({
            ID: toStr(it.ID, genId()),
            DesFieldID: it.DesFieldID != null ? toStr(it.DesFieldID) : "",
            FilterOpration: toStr(it.FilterOpration),
            FilterText: toStr(it.FilterText),
            SrcFieldID: it.SrcFieldID != null ? toStr(it.SrcFieldID) : "",
          }))
        : []
    );

    setMeta({
      metaType1: toStr(data.metaType1),
      metaType2: toStr(data.metaType2),
      metaType3: toStr(data.metaType3),
      metaType4: data.metaType4 || "[]",
      metaType5: toStr(data.metaType5),
      LookupMode: toStr(data.LookupMode),
    });

    const j = parseJson(data.metaTypeJson);
    setMetaJson({
      Unit1Ratio: 1,
      Action: 0,
      ...j,
      NameEntityFieldID: data.metaType2 ?? j?.NameEntityFieldID ?? "",
    });

    initialModeRef.current = true;
  }, [data]);

  /* enums + entities */
  useEffect(() => {
    getAllEntityType()
      .then((r) => Array.isArray(r) && setEntities(r))
      .catch(console.error);

    AppServices.getEnum({ str: "FilterOpration" })
      .then((r) =>
        setOperationList(
          Object.entries(r).map(([k, v]) => ({ value: String(v), label: k }))
        )
      )
      .catch(console.error);

    AppServices.getEnum({ str: "lookMode" })
      .then((r) =>
        setModesList(
          Object.entries(r).map(([k, v]) => ({ value: String(v), label: k }))
        )
      )
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* restore LookupMode if available */
  useEffect(() => {
    if (initialModeRef.current && modesList.length && data.LookupMode != null) {
      const mv = String(data.LookupMode);
      if (modesList.some((m) => m.value === mv))
        setMeta((p) => ({ ...p, LookupMode: mv }));
      initialModeRef.current = false;
    }
  }, [modesList, data.LookupMode]);

  /* fetch source fields on metaType1 */
  useEffect(() => {
    const id = Number(meta.metaType1);
    if (!isNaN(id) && id > 0) {
      getEntityFieldByEntityTypeId(id)
        .then((r) => setFields(Array.isArray(r) ? r : []))
        .catch(console.error);
    } else {
      setFields([]);
    }
  }, [meta.metaType1, getEntityFieldByEntityTypeId]);

  /* lock baseFields from srcFields (once) */
  useEffect(() => {
    if (baseFieldsLockedRef.current) return;
    if (Array.isArray(srcFields) && srcFields.length > 0) {
      setBaseFields(srcFields);
      baseFieldsLockedRef.current = true;
    }
  }, [srcFields]);

  /* if not provided, fetch baseFields via current form entityTypeId */
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

  /* keep metaType2 valid vs fields, and mirror to NameEntityFieldID */
  useEffect(() => {
    if (!fields.length) return;
    setMeta((prev) => {
      if (prev.metaType2 && !fields.some((f) => String(f.ID) === prev.metaType2)) {
        const nextVal = fields[0] ? String(fields[0].ID) : "";
        const next = { ...prev, metaType2: nextVal };
        const j: MetaJson = { ...metaJson, NameEntityFieldID: nextVal };
        setMetaJson(j);
        pushAll({ ...data, ...next }, j);
        return next;
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  /* helpers */
  const pushAll = (nextMeta: any, nextJson: MetaJson) => {
    setMeta(nextMeta);
    setMetaJson(nextJson);
    onMetaChange?.({
      ...data,
      ...nextMeta,
      metaTypeJson: JSON.stringify(nextJson ?? {}),
    });
  };

  const pushMeta = (partial: Partial<typeof meta>) => {
    const next = { ...meta, ...partial };
    pushAll(next, metaJson);
  };

  const pushJson = (partial: Partial<MetaJson>) => {
    const nextJson = { ...metaJson, ...partial };
    onMetaChange?.({
      ...data,
      ...meta,
      metaTypeJson: JSON.stringify(nextJson),
    });
    setMetaJson(nextJson);
  };

  // grid serialization
  const emitTableData = (rows: TableRow[]) => {
    setTableData(rows);
    const json = JSON.stringify(rows);
    setMeta((p) => ({ ...p, metaType4: json }));
    onMetaExtraChange?.({ metaType4: json });
  };

  // grid guards
  const bothEmpty = meta.metaType1.trim() === "" && meta.metaType2.trim() === "";
  const noDesOptions = bothEmpty || baseFields.length === 0;

  // grid actions
  const addRow = () => {
    const defaultDes = noDesOptions ? "" : (baseFields[0]?.ID ?? "");
    const defaultSrc = bothEmpty ? "" : (fields[0]?.ID ?? "");
    const newRow: TableRow = {
      ID: genId(),
      DesFieldID: defaultDes ? String(defaultDes) : "",
      FilterOpration: "",
      FilterText: "",
      SrcFieldID: defaultSrc ? String(defaultSrc) : "",
    };
    emitTableData([...tableData, newRow]);
  };

  const onCellChange = (e: any) => {
    const upd = e.data as TableRow;
    const next = tableData.map((r) =>
      r.ID === upd.ID
        ? {
            ...upd,
            DesFieldID: upd.DesFieldID != null ? String(upd.DesFieldID) : "",
            SrcFieldID: upd.SrcFieldID != null ? String(upd.SrcFieldID) : "",
          }
        : r
    );
    emitTableData(next);
  };

  /* maps & sigs */
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

  /* normalize grid values on list changes */
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
    if (changed) emitTableData(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsSig, bothEmpty]);

  useEffect(() => {
    if (baseFields.length === 0) {
      const changed = tableData.some((r) => r.DesFieldID);
      if (changed) {
        const cleared = tableData.map((r) => ({ ...r, DesFieldID: "" }));
        emitTableData(cleared);
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
      if (changed) emitTableData(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFieldsSig, noDesOptions]);

  /* grid columns */
  const columnDefs = useMemo(
    () => [
      {
        headerName: t("LookUp.Columns.DesField"),
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
        headerName: t("LookUp.Columns.Operation"),
        field: "FilterOpration",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: operationList.map((o) => o.value),
        },
        valueFormatter: (p: any) =>
          operationList.find((o) => o.value === String(p.value))?.label ||
          String(p.value ?? ""),
      },
      {
        headerName: t("LookUp.Columns.FilterText"),
        field: "FilterText",
        editable: true,
      },
      {
        headerName: t("LookUp.Columns.SrcField"),
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

  const selectorOptions = fields.map((f) => ({
    value: String(f.ID),
    label: f.DisplayName,
  }));

  /* ───────── Render ───────── */
 return (
  <div className="w-full min-w-0" data-inventory-form>
    <div className="flex flex-col gap-4">
      {/* Row 1: Get from | Set field as name */}
      <div className="grid grid-cols-2 gap-4 min-w-0">
        <DynamicSelector
          name="getFrom"
          label={t("GetFrom")}
          options={entities.map((e) => ({ value: String(e.ID), label: e.Name }))}
          selectedValue={meta.metaType1}
          onChange={(e) => pushMeta({ metaType1: e.target.value })}
        />
        <DynamicSelector
          name="setFieldAsName"
          label={t("SetFieldAsName")}
          options={selectorOptions}
          selectedValue={meta.metaType2}
          onChange={(e) => {
            const v = e.target.value;
            setMeta((p) => ({ ...p, metaType2: v }));
            pushJson({ NameEntityFieldID: v });
          }}
        />
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-2 gap-6 min-w-0">
        {/* LEFT column (Inventories) */}
        <div className="flex flex-col gap-3 min-w-0">
          {/* L1: inventory sum | inventory 1 | inventory 2 */}
          <div className="grid grid-cols-3 gap-3 min-w-0">
            <DynamicSelector
              name="inventorySum"
              label={t("InventorySum")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.InventorySumEntityFieldID)}
              onChange={(e) => pushJson({ InventorySumEntityFieldID: e.target.value })}
            />
            <DynamicSelector
              name="inventory1"
              label={t("Inventory1")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Inventory1EntityFieldID)}
              onChange={(e) => pushJson({ Inventory1EntityFieldID: e.target.value })}
            />
            <DynamicSelector
              name="inventory2"
              label={t("Inventory2")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Inventory2EntityFieldID)}
              onChange={(e) => pushJson({ Inventory2EntityFieldID: e.target.value })}
            />
          </div>

          {/* L2: inventory 3 | inventory 4 | inventory 5 */}
          <div className="grid grid-cols-3 gap-3 min-w-0">
            <DynamicSelector
              name="inventory3"
              label={t("Inventory3")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Inventory3EntityFieldID)}
              onChange={(e) => pushJson({ Inventory3EntityFieldID: e.target.value })}
            />
            <DynamicSelector
              name="inventory4"
              label={t("Inventory4")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Inventory4EntityFieldID)}
              onChange={(e) => pushJson({ Inventory4EntityFieldID: e.target.value })}
            />
            <DynamicSelector
              name="inventory5"
              label={t("Inventory5")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Inventory5EntityFieldID)}
              onChange={(e) => pushJson({ Inventory5EntityFieldID: e.target.value })}
            />
          </div>

          {/* L3: reserve | Action radios (horiz) */}
          <div className="grid grid-cols-3 gap-3 min-w-0 items-end">
            <DynamicSelector
              name="reserve"
              label={t("Reserve")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.ReserveEntityFieldID)}
              onChange={(e) => pushJson({ ReserveEntityFieldID: e.target.value })}
            />
            <div className="col-span-2 min-w-0">
              <div className="flex items-center gap-1 pt-6">
                {[
                  { txt: "Additive", val: 0 as 0 },
                  { txt: "Reducer",  val: 1 as 1 },
                  { txt: "Updater",  val: 2 as 2 },
                ].map((o) => (
                  <label key={o.val} className="inline-flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      className="h-3 w-3"
                      name="inventoryAction"
                      value={o.val}
                      checked={(metaJson.Action ?? 0) === o.val}
                      onChange={() => pushJson({ Action: o.val })}
                    />
                    <span>{o.txt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT column (Units) — سه‌تایی‌ها */}
        <div className="flex flex-col gap-3 min-w-0 pr-2">
          {/* U1: unit 1 name | unit 2 name | unit 3 name */}
          <div className="grid grid-cols-3 gap-3 min-w-0">
            <DynamicSelector
              name="unit1name"
              label={t("Unit1Name")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Unit1EntityFieldID)}
              onChange={(e) => pushJson({ Unit1EntityFieldID: e.target.value })}
            />
            <DynamicSelector
              name="unit2name"
              label={t("Unit2Name")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Unit2EntityFieldID)}
              onChange={(e) => pushJson({ Unit2EntityFieldID: e.target.value })}
            />
            <DynamicSelector
              name="unit3name"
              label={t("Unit3Name")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Unit3EntityFieldID)}
              onChange={(e) => pushJson({ Unit3EntityFieldID: e.target.value })}
            />
          </div>

          {/* U2: unit 4 name | unit 5 name | unit 2 ratio */}
          <div className="grid grid-cols-3 gap-3 min-w-0">
            <DynamicSelector
              name="unit4name"
              label={t("Unit4Name")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Unit4EntityFieldID)}
              onChange={(e) => pushJson({ Unit4EntityFieldID: e.target.value })}
            />
            <DynamicSelector
              name="unit5name"
              label={t("Unit5Name")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Unit5EntityFieldID)}
              onChange={(e) => pushJson({ Unit5EntityFieldID: e.target.value })}
            />
            <DynamicSelector
              name="unit2ratio"
              label={t("Unit2Ratio")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Unit2RatioEntityFieldID)}
              onChange={(e) => pushJson({ Unit2RatioEntityFieldID: e.target.value })}
            />
          </div>

          {/* U3: unit 3 ratio | unit 4 ratio | unit 5 ratio */}
          <div className="grid grid-cols-3 gap-3 min-w-0">
            <DynamicSelector
              name="unit3ratio"
              label={t("Unit3Ratio")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Unit3RatioEntityFieldID)}
              onChange={(e) => pushJson({ Unit3RatioEntityFieldID: e.target.value })}
            />
            <DynamicSelector
              name="unit4ratio"
              label={t("Unit4Ratio")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Unit4RatioEntityFieldID)}
              onChange={(e) => pushJson({ Unit4RatioEntityFieldID: e.target.value })}
            />
            <DynamicSelector
              name="unit5ratio"
              label={t("Unit5Ratio")}
              options={selectorOptions}
              selectedValue={toStr(metaJson.Unit5RatioEntityFieldID)}
              onChange={(e) => pushJson({ Unit5RatioEntityFieldID: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Row: Modes (left) | WFBoxName (right) */}
      <div className="grid grid-cols-2 gap-6 min-w-0 items-end">
        <DynamicSelector
          name="modes"
          label={t("Modes")}
          options={modesList}
          selectedValue={meta.LookupMode}
          onChange={(e) => pushMeta({ LookupMode: e.target.value })}
        />
        <div className="min-w-0">
          <label className="block text-sm font-medium">{t("WFBoxName")}</label>
          <input
            className="w-full rounded border px-2 py-1"
            value={metaJson.InventorWfBoxName ?? ""}
            onChange={(e) => pushJson({ InventorWfBoxName: e.target.value })}
          />
        </div>
      </div>

      {/* Row: PostPickerList (full width, its own row) */}
      <div className="min-w-0">
        <PostPickerList
          key={`pp-${meta.metaType1}|${meta.metaType2}|${meta.LookupMode}|${resetKey ?? 0}`}
          resetKey={resetKey}
          sourceType="projects"
          initialMetaType={meta.metaType5}
          data={{ metaType5: meta.metaType5 || undefined }}
          metaFieldKey="metaType5"
          onMetaChange={(o) => setMeta((p) => ({ ...p, ...o }))}
          label={t("DefaultProjects")}
          fullWidth
        />
      </div>

      {/* Table */}
      <div className="mt-2" style={{ height: 300, overflowY: "auto" }}>
        <DataTable
          key={`dt-${fieldsSig}-${baseFieldsSig}-${noDesOptions ? "noDes" : "hasDes"}-${bothEmpty ? "srcEmpty" : "srcHas"}`}
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
          gridOptions={{
            singleClickEdit: true,
            rowSelection: "single",
            stopEditingWhenCellsLoseFocus: true,
          }}
        />
      </div>
    </div>
  </div>
);


};

export default InventoryController;
