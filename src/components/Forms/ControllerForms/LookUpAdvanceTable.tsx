// src/components/ControllerForms/LookupAdvanceTable.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "../../../context/ApiContext";
import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";
import AppServices, { EntityField, EntityType, GetEnumResponse } from "../../../services/api.services";

/**
 * پراپ‌های کامپوننت
 */
interface LookupAdvanceTableProps {
  data?: {
    metaType1?: string | number | null;  // ID مربوط به EntityType
    metaType2?: string | number | null;  // ID مربوط به فیلد نمایش
    metaType4?: string;                  // اطلاعات جدول به‌صورت JSON
    LookupMode?: string | number | null; // در صورت نیاز، حالت Lookup
    metaType5?: string;                  // برای نگهداری مقادیر پیش‌فرض به‌صورت Pipe-Separated
  };
  onMetaChange?: (updatedMeta: any) => void;
}

/**
 * ساختار هر ردیف در جدول فیلتر
 */
interface TableRow {
  ID: string;
  SrcFieldID: string | null;
  FilterOpration: string | null;
  FilterText: string;
  DesFieldID: string | null;
}

/**
 * کامپوننت LookupAdvanceTable
 */
const LookupAdvanceTable: React.FC<LookupAdvanceTableProps> = ({ data, onMetaChange }) => {
  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();

  // استیت اصلی جهت نگهداری مقادیر متا
  const [metaTypesLookUp, setMetaTypesLookUp] = useState<{
    metaType1: string;
    metaType2: string;
    metaType4: string;
    metaType5: string;
    LookupMode: string;
  }>({
    metaType1: data?.metaType1 != null ? String(data.metaType1) : "",
    metaType2: data?.metaType2 != null ? String(data.metaType2) : "",
    metaType4: data?.metaType4 ?? "",
    metaType5: data?.metaType5 ?? "",
    LookupMode: data?.LookupMode != null ? String(data.LookupMode) : "",
  });

  // مدیریت اطلاعات جدول فیلتر (metaType4) در قالب یک آرایه
  const [tableData, setTableData] = useState<TableRow[]>([]);

  /**
   * در اولین mount، اگر metaType4 رشتهٔ JSON معتبر داشته باشد، آن را به tableData تبدیل می‌کنیم
   */
  useEffect(() => {
    if (metaTypesLookUp.metaType4.trim()) {
      try {
        const parsed = JSON.parse(metaTypesLookUp.metaType4);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((item: any) => ({
            ID: item.ID ?? crypto.randomUUID(),
            SrcFieldID: item.SrcFieldID != null ? String(item.SrcFieldID) : "",
            FilterOpration: item.FilterOpration != null ? String(item.FilterOpration) : "",
            FilterText: item.FilterText ?? "",
            DesFieldID: item.DesFieldID != null ? String(item.DesFieldID) : "",
          }));
          setTableData(normalized);
        } else {
          setTableData([]);
        }
      } catch (err) {
        console.error("Error parsing metaType4 JSON:", err);
        setTableData([]);
      }
    } else {
      setTableData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * هر بار که tableData تغییر کند، آن را به JSON تبدیل کرده و در metaType4 قرار می‌دهیم
   * ضمن اینکه اگر onMetaChange وجود داشته باشد، آن را صدا می‌زنیم
   */
  useEffect(() => {
    try {
      const asString = JSON.stringify(tableData);
      updateMeta({ metaType4: asString });
    } catch (error) {
      console.error("Error serializing table data:", error);
    }
  }, [tableData]);

  /**
   * لیست موجودیت‌ها (برای سلکت "Get information from")
   */
  const [getInformationFromList, setGetInformationFromList] = useState<EntityType[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllEntityType();
        setGetInformationFromList(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error("Error fetching entity types:", error);
      }
    })();
  }, [getAllEntityType]);

  /**
   * فیلدهای موجودیت انتخاب‌شده در metaType1
   */
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
  }, [metaTypesLookUp.metaType1, getEntityFieldByEntityTypeId]);

  /**
   * دریافت Enum برای عملگرهای فیلتر (FilterOperation)
   * (در اینجا lookupMode را اگر خواستید می‌توانید اضافه کنید)
   */
  const [operationList, setOperationList] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const filterOperationResponse: GetEnumResponse = await AppServices.getEnum({
          str: "FilterOpration",
        });
        const ops = Object.entries(filterOperationResponse).map(([key, val]) => ({
          value: String(val),
          label: key,
        }));
        setOperationList(ops);
      } catch (error) {
        console.error("Error fetching FilterOpration:", error);
      }
    })();
  }, []);

  /**
   * تابع کمکی برای آپدیت state محلی و فراخوانی onMetaChange
   */
  const updateMeta = useCallback(
    (updatedFields: Partial<typeof metaTypesLookUp>) => {
      setMetaTypesLookUp((prev) => {
        const newState = { ...prev, ...updatedFields };
        if (onMetaChange) {
          onMetaChange({
            ...newState,
          });
        }
        return newState;
      });
    },
    [onMetaChange]
  );

  /**
   * مدیریت انتخاب‌ها در بالای فرم
   */
  const handleSelectInformationFrom = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMeta({ metaType1: e.target.value });
  };

  const handleSelectColumnDisplay = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMeta({ metaType2: e.target.value });
  };

  // اگر بخواهید LookupMode هم داشته باشید، مشابه زیر عمل کنید:
  // const handleSelectMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   updateMeta({ LookupMode: e.target.value });
  // };

  /**
   * افزودن ردیف جدید در جدول فیلتر
   */
  const onAddNew = () => {
    const newRow: TableRow = {
      ID: crypto.randomUUID(),
      SrcFieldID: "",
      FilterOpration: "",
      FilterText: "",
      DesFieldID: "",
    };
    setTableData((prev) => [...prev, newRow]);
  };

  /**
   * وقتی کاربر مقدار یکی از سلول‌ها را تغییر می‌دهد
   */
  const handleCellValueChanged = (event: any) => {
    const updatedRow = event.data as TableRow;
    setTableData((prev) => prev.map((row) => (row.ID === updatedRow.ID ? updatedRow : row)));
  };

  return (
    <div className="flex flex-col gap-8 p-2 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      {/* بخش بالای فرم */}
      <div className="flex gap-8">
        <div className="flex flex-col space-y-6 w-1/2">
          <DynamicSelector
            name="getInformationFrom"
            label="Get information from"
            options={getInformationFromList.map((ent) => ({
              value: String(ent.ID),
              label: ent.Name,
            }))}
            selectedValue={metaTypesLookUp.metaType1}
            onChange={handleSelectInformationFrom}
          />

          <DynamicSelector
            name="displayColumn"
            label="What Column To Display"
            options={columnDisplayList.map((field) => ({
              value: String(field.ID),
              label: field.DisplayName,
            }))}
            selectedValue={metaTypesLookUp.metaType2}
            onChange={handleSelectColumnDisplay}
          />

          {/*
            در صورت نیاز به سلکت lookupMode
            <DynamicSelector
              name="lookupMode"
              label="Lookup Mode"
              options={...}
              selectedValue={metaTypesLookUp.LookupMode}
              onChange={handleSelectMode}
            />
          */}

          {/* برای انتخاب پیش‌فرض پروژه‌ها از PostPickerList جدید استفاده می‌کنیم */}
          <PostPickerList
            sourceType="projects"
            initialMetaType={metaTypesLookUp.metaType5}
            metaFieldKey="metaType5"
            onMetaChange={(updatedObj) => {
              // مانند { metaType5: "4|5|9" }
              updateMeta(updatedObj);
            }}
            label="Default Projects"
            fullWidth
          />
        </div>

        <div className="flex flex-col space-y-6 w-1/2">
          {/* اینجا هر تنظیم اضافی مورد نیاز خود را قرار دهید */}
        </div>
      </div>

      {/* جدول فیلتر (metaType4) */}
      <div className="mt-4" style={{ height: "300px", overflowY: "auto" }}>
        <DataTable
          columnDefs={[
            {
              headerName: "Src Field",
              field: "SrcFieldID",
              editable: true,
              cellEditor: "agSelectCellEditor",
              cellEditorParams: {
                values: srcFieldList.map((f) => (f.ID ? String(f.ID) : "")),
              },
              valueFormatter: (params: any) => {
                const matched = srcFieldList.find(
                  (f) => f.ID && String(f.ID) === String(params.value)
                );
                return matched ? matched.DisplayName : params.value;
              },
            },
            {
              headerName: "Operation",
              field: "FilterOpration",
              editable: true,
              cellEditor: "agSelectCellEditor",
              cellEditorParams: {
                values: operationList.map((op) => op.value),
              },
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
              cellEditorParams: {
                values: desFieldList.map((f) => (f.ID ? String(f.ID) : "")),
              },
              valueFormatter: (params: any) => {
                const matched = desFieldList.find(
                  (f) => f.ID && String(f.ID) === String(params.value)
                );
                return matched ? matched.DisplayName : params.value;
              },
            },
          ]}
          rowData={tableData}
          setSelectedRowData={() => { } }
          showDuplicateIcon={false}
          showEditIcon={false}
          showAddIcon={true}
          onAdd={onAddNew}
          showDeleteIcon={false}
          onDelete={() => { } }
          onEdit={() => { } }
          onDuplicate={() => { } }
          onCellValueChanged={handleCellValueChanged}
          domLayout="autoHeight"
          showSearch={false} onRowDoubleClick={function (data: any): void {
            throw new Error("Function not implemented.");
          } }        />
      </div>
    </div>
  );
};

export default LookupAdvanceTable;
