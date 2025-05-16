// src/components/ControllerForms/AdvanceLookupAdvanceTable.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useApi } from "../../../context/ApiContext";
import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";
import AppServices, {
  EntityField,
  EntityType,
  GetEnumResponse,
} from "../../../services/api.services";

interface LookupAdvanceTableProps {
  data?: {
    metaType1?: string | number | null; // ID مربوط به EntityType
    metaType2?: string | number | null; // ID مربوط به فیلد نمایش
    metaType4?: string; // اطلاعات جدول به‌صورت JSON
    metaType5?: string; // مقادیر پیش‌فرض (به صورت Pipe-Separated)
  };
  onMetaChange?: (updatedMeta: any) => void;
}

interface TableRow {
  ID: string;
  SrcFieldID: string | null;
  FilterOpration: string | null;
  FilterText: string;
  DesFieldID: string | null;
}

const AdvanceLookupAdvanceTable: React.FC<LookupAdvanceTableProps> = ({
  data,
  onMetaChange,
}) => {
  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();

  // state اصلی برای metaType‌ها
  const [metaTypesLookUp, setMetaTypesLookUp] = useState({
    metaType1: data?.metaType1 != null ? String(data.metaType1) : "",
    metaType2: data?.metaType2 != null ? String(data.metaType2) : "",
    metaType4: data?.metaType4 ?? "",
    metaType5: data?.metaType5 ?? "",
  });

  // state مربوط به مقادیر پیش‌فرض (آیدی‌های انتخاب‌شده)
  const [defaultValueIDs, setDefaultValueIDs] = useState<string[]>(
    data?.metaType5 ? data.metaType5.split("|").filter(Boolean) : []
  );

  // state جدول فیلترها (metaType4)
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // مقداردهی اولیه tableData از data.metaType4 (فقط در mount)
  useEffect(() => {
    console.count("effect-1");
    if (data && data.metaType4 && data.metaType4.trim() !== "") {
      try {
        const parsed = JSON.parse(data.metaType4);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((item: any) => ({
            ID: item.ID ?? crypto.randomUUID(),
            SrcFieldID: item.SrcFieldID != null ? String(item.SrcFieldID) : "",
            FilterOpration:
              item.FilterOpration != null ? String(item.FilterOpration) : "",
            FilterText: item.FilterText || "",
            DesFieldID: item.DesFieldID != null ? String(item.DesFieldID) : "",
          }));
          setTableData(normalized);
        } else {
          setTableData([]);
        }
      } catch (err) {
        console.error("Error parsing data.metaType4 JSON:", err);
        setTableData([]);
      } finally {
      }
    } else {
      setTableData([]);
    }
  }, []); // فقط یکبار

  // هر بار که tableData تغییر کند، metaType4 را به‌روز‌رسانی می‌کنیم
  useEffect(() => {
    console.count("effect-2");
    const str = JSON.stringify(tableData);
    if (str !== metaTypesLookUp.metaType4) {
      updateMeta({ metaType4: str });

      onMetaChange?.({
        ...metaTypesLookUp,
        metaType4: str,
        metaType5: defaultValueIDs.join("|"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]); // updateMeta در وابستگی نیست

  // دریافت EntityTypeها
  const [getInformationFromList, setGetInformationFromList] = useState<
    EntityType[]
  >([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllEntityType();
        setGetInformationFromList(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error("Error fetching entity types:", error);
      }
    })();
    console.count("effect-3");
  }, []);

  // دریافت فیلدهای مربوط به EntityType انتخاب‌شده (metaType1)
  const [columnDisplayList, setColumnDisplayList] = useState<EntityField[]>([]);
  const [srcFieldList, setSrcFieldList] = useState<EntityField[]>([]);
  const [desFieldList, setDesFieldList] = useState<EntityField[]>([]);
  useEffect(() => {
    (async () => {
      const { metaType1 } = metaTypesLookUp;
      if (metaType1) {
        try {
          const idAsNumber = Number(metaType1);
          if (!isNaN(idAsNumber)) {
            const fields = await getEntityFieldByEntityTypeId(idAsNumber);
            setColumnDisplayList(fields);
            setSrcFieldList(fields);
            setDesFieldList(fields);
          }
        } catch (error) {
          console.error("Error fetching fields by entity type ID:", error);
        }
      } else {
        setColumnDisplayList([]);
        setSrcFieldList([]);
        setDesFieldList([]);
      }
    })();
    console.count("effect-4");
  }, [metaTypesLookUp.metaType1]);

  // دریافت Enum برای FilterOpration
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);
  useEffect(() => {
    (async () => {
      try {
        const filterOperationResponse: GetEnumResponse =
          await AppServices.getEnum({ str: "FilterOpration" });
        const ops = Object.entries(filterOperationResponse).map(
          ([key, val]) => ({
            value: String(val),
            label: key,
          })
        );
        setOperationList(ops);
      } catch (error) {
        console.error("Error fetching FilterOpration:", error);
      }
    })();
    console.count("effect-5");
  }, []);

  // تابع به‌روز‌رسانی state metaTypesLookUp و فراخوانی onMetaChange
  const updateMeta = useCallback(
    (updatedFields: Partial<typeof metaTypesLookUp>) => {
      setMetaTypesLookUp((prev) => {
        /* ❶ فقط وقتی واقعاً تغییری باشد setState بزنیم */
        let changed = false;
        const next = { ...prev };
        for (const key in updatedFields) {
          const k = key as keyof typeof metaTypesLookUp;
          if (updatedFields[k] !== undefined && updatedFields[k] !== prev[k]) {
            next[k] = updatedFields[k] as any;
            changed = true;
          }
        }
        if (!changed) return prev; // ⏹ خروج، جلوگیری از رندر اضافی
        return next;
      });
    },
    [onMetaChange]
  );

  // Event handlers برای تغییر Select ها
  const handleSelectInformationFrom = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateMeta({ metaType1: e.target.value });
  };

  const handleSelectColumnDisplay = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateMeta({ metaType2: e.target.value });
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Src Field",
        field: "SrcFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: srcFieldList.map((f) => String(f.ID)) },
        valueFormatter: (params: any) => {
          const matched = srcFieldList.find(
            (f) => String(f.ID) === String(params.value)
          );
          return matched ? matched.DisplayName : params.value;
        },
      },
      {
        headerName: "Operation",
        field: "FilterOpration",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: operationList.map((op) => op.value) },
        valueFormatter: (params: any) => {
          const matched = operationList.find(
            (op) => String(op.value) === String(params.value)
          );
          return matched ? matched.label : params.value;
        },
      },
      {
        headerName: "Filter Text",
        field: "FilterText",
        editable: true,
      },
      {
        headerName: "Des Field",
        field: "DesFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: desFieldList.map((f) => String(f.ID)) },
        valueFormatter: (params: any) => {
          const matched = desFieldList.find(
            (f) => String(f.ID) === String(params.value)
          );
          return matched ? matched.DisplayName : params.value;
        },
      },
    ],
    [srcFieldList, desFieldList, operationList]
  );

  const onAddNew = useCallback(() => {
    setTableData((prev) => [
      ...prev,
      {
        ID: crypto.randomUUID(),
        SrcFieldID: "",
        FilterOpration: "",
        FilterText: "",
        DesFieldID: "",
      },
    ]);
  }, []);

  const handleCellValueChanged = useCallback((event: any) => {
    const updatedRow = event.data as TableRow;
    setTableData((prev) =>
      prev.map((row) => (row.ID === updatedRow.ID ? updatedRow : row))
    );
  }, []);

  return (
    <div className="flex flex-col gap-8 p-2 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      {/* بخش بالایی: تنظیمات و Selectors */}
      <div className="flex gap-8">
        {/* ستون سمت چپ */}
        <div className="flex flex-col space-y-6 w-1/2">
          <DynamicSelector
            name="getInformationFrom"
            label="Get information from"
            options={getInformationFromList.map((ent) => ({
              value: String(ent.ID),
              label: ent.Name,
            }))}
            selectedValue={metaTypesLookUp.metaType1 || ""}
            onChange={handleSelectInformationFrom}
          />
          <DynamicSelector
            name="displayColumn"
            label="What Column To Display"
            options={columnDisplayList.map((field) => ({
              value: String(field.ID),
              label: field.DisplayName,
            }))}
            selectedValue={metaTypesLookUp.metaType2 || ""}
            onChange={handleSelectColumnDisplay}
          />
          {/* استفاده از PostPickerList برای انتخاب پیش‌فرض پروژه‌ها */}
          <PostPickerList
            sourceType="projects"
            initialMetaType={metaTypesLookUp.metaType5}
            metaFieldKey="metaType5"
            onMetaChange={(obj) => {
              /* obj = { metaType5: "4|5|9" } */
              updateMeta(obj);

              const ids = obj.metaType5
                ? obj.metaType5.split("|").filter(Boolean)
                : [];
              setDefaultValueIDs(ids);

              onMetaChange?.({
                ...metaTypesLookUp,
                ...obj,
                metaType4: JSON.stringify(tableData),
              });
            }}
            label="Default Projects"
            fullWidth
          />
        </div>
        {/* ستون سمت راست: (در صورت نیاز تنظیمات اضافی) */}
        <div className="flex flex-col space-y-6 w-1/2">
          {/* تنظیمات اضافی در صورت نیاز */}
        </div>
      </div>
      {/* بخش پایینی: جدول Lookup */}
      <div className="mt-4" style={{ height: "300px", overflowY: "auto" }}>
        <DataTable
          columnDefs={columnDefs}
          rowData={tableData}
          showDuplicateIcon={false}
          showEditIcon={false}
          showAddIcon={true}
          showDeleteIcon={false}
          onAdd={onAddNew}
          onCellValueChanged={handleCellValueChanged}
          domLayout="autoHeight"
          showSearch={false}
          onRowDoubleClick={function (data: any): void {
            throw new Error("Function not implemented.");
          }}
        />
      </div>
    </div>
  );
};

export default AdvanceLookupAdvanceTable;
