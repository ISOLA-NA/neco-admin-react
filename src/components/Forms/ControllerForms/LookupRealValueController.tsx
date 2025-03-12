// src/components/ControllerForms/Lookuprealvalue.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "../../../context/ApiContext";
import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";
import AppServices, { EntityField, EntityType, GetEnumResponse } from "../../../services/api.services";

/**
 * ساختار پراپ‌های کامپوننت
 */
interface LookuprealvalueProps {
  data?: {
    metaType1?: string | number | null;
    metaType2?: string | number | null;
    metaType4?: string;             // در این فیلد JSON جدول فیلتر ذخیره می‌شود
    metaType5?: string;             // مقادیر پیش‌فرض پروژه‌ها به صورت "4|5|6"
    LookupMode?: string | number | null;
    BoolMeta1?: boolean;            // برای oldLookup
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
 * کامپوننت اصلی: Lookuprealvalue
 */
const Lookuprealvalue: React.FC<LookuprealvalueProps> = ({ data, onMetaChange }) => {
  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();

  /**
   * state اصلی که اطلاعات Lookup را نگهداری می‌کند.
   */
  const [metaTypesLookUp, setMetaTypesLookUp] = useState<{
    metaType1: string;
    metaType2: string;
    metaType4: string;
    metaType5: string;
    LookupMode: string;
  }>({
    metaType1: data?.metaType1 != null ? String(data.metaType1) : "",
    metaType2: data?.metaType2 != null ? String(data.metaType2) : "",
    metaType4: data?.metaType4 ?? "",   // حاوی JSON جدول فیلترها
    metaType5: data?.metaType5 ?? "",   // حاوی آیدی‌های پروژه‌ها به شکل "4|5|6"
    LookupMode: data?.LookupMode != null ? String(data.LookupMode) : "",
  });

  /**
   * فیلد مربوط به BoolMeta1 که در دیتابیس نمایانگر oldLookup است.
   */
  const [oldLookup, setOldLookup] = useState<boolean>(data?.BoolMeta1 ?? false);

  /**
   * جدول فیلترها (metaType4) در قالب یک آرایه
   */
  const [tableData, setTableData] = useState<TableRow[]>([]);

  /**
   * در اولین mount، اگر data.metaType4 حاوی رشتهٔ JSON باشد، آن را به tableData تبدیل می‌کنیم.
   */
  useEffect(() => {
    if (metaTypesLookUp.metaType4.trim()) {
      try {
        const parsed = JSON.parse(metaTypesLookUp.metaType4);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((item: any) => ({
            ID: item.ID ?? crypto.randomUUID(),
            SrcFieldID: item.SrcFieldID ? String(item.SrcFieldID) : "",
            FilterOpration: item.FilterOpration ? String(item.FilterOpration) : "",
            FilterText: item.FilterText ?? "",
            DesFieldID: item.DesFieldID ? String(item.DesFieldID) : "",
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
   * هر بار که tableData تغییر کند، آن را مجدداً در metaType4 ذخیره کرده و
   * onMetaChange را صدا می‌زنیم (در صورت وجود).
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
   * لیست موجودیت‌ها (EntityType)
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
   * بارگیری فیلدهای مربوط به موجودیت انتخاب‌شده (metaType1)
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
   * گرفتن مقادیر enum برای LookMode و FilterOpration
   */
  const [modesList, setModesList] = useState<{ value: string; label: string }[]>([]);
  const [operationList, setOperationList] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // برای LookupMode
        const lookModeResponse: GetEnumResponse = await AppServices.getEnum({ str: "lookMode" });
        const modes = Object.entries(lookModeResponse).map(([key, val]) => ({
          value: String(val),
          label: key,
        }));
        setModesList(modes);

        // اگر مقدار LookupMode فعلی در لیست نبود، یکی را پیش‌فرض کن
        if (metaTypesLookUp.LookupMode && !modes.some((m) => m.value === metaTypesLookUp.LookupMode)) {
          updateMeta({ LookupMode: modes[0]?.value || "" });
        }
      } catch (error) {
        console.error("Error fetching lookMode:", error);
      }

      try {
        // برای FilterOperation
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
  }, [metaTypesLookUp.LookupMode]);

  /**
   * تابع کمکی برای به‌روزکردن state محلی و فراخوانی onMetaChange (اگر وجود داشته باشد)
   */
  const updateMeta = useCallback(
    (updatedFields: Partial<typeof metaTypesLookUp>) => {
      setMetaTypesLookUp((prev) => {
        const newState = { ...prev, ...updatedFields };
        if (onMetaChange) {
          // مقدار نهایی را به والد می‌فرستیم و oldLookup را هم اضافه می‌کنیم
          onMetaChange({
            ...newState,
            BoolMeta1: oldLookup,
          });
        }
        return newState;
      });
    },
    [oldLookup, onMetaChange]
  );

  /**
   * هندلرهایی برای selectهای بالا
   */
  const handleSelectInformationFrom = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMeta({ metaType1: e.target.value });
  };

  const handleSelectColumnDisplay = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMeta({ metaType2: e.target.value });
  };

  const handleSelectMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMeta({ LookupMode: e.target.value });
  };

  /**
   * چک‌باکس oldLookup
   */
  const handleOldLookupChange = (checked: boolean) => {
    setOldLookup(checked);
    // در اینجا کافی است updateMeta() را بدون مقدار دهی جدید صدا کنیم
    // تا در onMetaChange هم BoolMeta1 آپدیت شود
    updateMeta({});
  };

  /**
   * رویداد افزودن ردیف جدید به جدول
   */
  const onAddNewRow = () => {
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
   * وقتی مقدار یکی از سلول‌های جدول عوض می‌شود
   */
  const handleCellValueChanged = (event: any) => {
    const updatedRow = event.data as TableRow;
    setTableData((prev) => prev.map((row) => (row.ID === updatedRow.ID ? updatedRow : row)));
  };

  return (
    <div className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      <div className="flex gap-8">
        {/* ستون چپ */}
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

          <DynamicSelector
            name="modes"
            label="Modes"
            options={modesList}
            selectedValue={metaTypesLookUp.LookupMode}
            onChange={handleSelectMode}
          />

          {/**
           * نمایش پروژه‌های پیش‌فرض به کمک PostPickerList جدید
           * اگر می‌خواهید metaType5 را برای انتخاب پروژه‌ها استفاده کنید.
           */}
          <PostPickerList
            sourceType="projects"
            initialMetaType={metaTypesLookUp.metaType5}
            metaFieldKey="metaType5"
            onMetaChange={(updatedObj) => {
              // مثلاً updatedObj = { metaType5: "4|5|6" }
              updateMeta(updatedObj);
            }}
            label="Default Projects"
            fullWidth
          />
        </div>

        {/* ستون راست */}
        <div className="flex flex-col space-y-6 w-1/2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={oldLookup}
              onChange={(e) => handleOldLookupChange(e.target.checked)}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <label className="text-gray-700 font-medium">Old Lookup</label>
          </div>
        </div>
      </div>

      {/* جدول فیلترها (metaType4) */}
      <div style={{ height: "300px", overflowY: "auto" }}>
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
          onCellValueChanged={handleCellValueChanged}
          showDuplicateIcon={false}
          showEditIcon={false}
          showAddIcon
          onAdd={onAddNewRow}
          showDeleteIcon={false}
          onDelete={() => { } }
          onEdit={() => { } }
          onDuplicate={() => { } }
          domLayout="normal"
          showSearch={false} onRowDoubleClick={function (data: any): void {
            throw new Error("Function not implemented.");
          } }        />
      </div>
    </div>
  );
};

export default Lookuprealvalue;
