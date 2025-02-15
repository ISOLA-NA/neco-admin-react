// src/components/LookUpForms.tsx

import React, { useState, useEffect } from "react";
import { useApi } from "../../../context/ApiContext";

// کامپوننت‌های سفارشی شما:
import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";

// تایپ‌های موردنیاز
import {
  EntityField,
  EntityType,
  GetEnumResponse,
  Role,
  
} from "../../../services/api.services";

import AppServices from "../../../services/api.services"

// رابط برای props (مشابه props در Vue)
interface LookUpFormsProps {
  data?: {
    metaType1?: string | null;  // ID مربوط به EntityType (Get information from)
    metaType2?: string | null;  // ID مربوط به فیلد انتخاب‌شده (What Column To Display)
    metaType3?: string;         // نحوه‌ی نمایش (radio|drop|check)
    metaType4?: string;         // داده‌های جدول به‌صورت JSON
    LookupMode?: string | null; // مقدار انتخاب‌شده برای Modes
  };
  onMetaChange?: (updatedMeta: any) => void; 
  // اگر می‌خواهید تغییرات metaTypesLookUp را بیرون اطلاع دهید.
}

// شکل هر ردیف جدول Lookup
interface TableRow {
  ID: string;          // شناسه ردیف
  srcField: string | null;   // ID فیلد مبدأ
  operation: string | null;  // مقدار Operation (فیلتر)
  filterText: string;        // متن فیلتر
  desField: string | null;   // ID فیلد مقصد
}

const LookUpForms: React.FC<LookUpFormsProps> = ({ data, onMetaChange }) => {
  // متدهای API از Context
  const {
    getAllEntityType,
    getEntityFieldByEntityTypeId,
    getEnum,
    getAllRoles,
  } = useApi();

  // state اصلی شبیه metaTypesLookUp در Vue
  const [metaTypesLookUp, setMetaTypesLookUp] = useState({
    metaType1: data?.metaType1 ?? null,  // EntityType ID
    metaType2: data?.metaType2 ?? null,  // Field ID
    metaType3: data?.metaType3 ?? "",    // نمایش drop|radio|check
    metaType4: data?.metaType4 ?? "",    // اطلاعات جدول (JSON string)
    LookupMode: data?.LookupMode ?? null // mode انتخاب‌شده
  });

  // چک‌باکس RemoveSameName و Old Lookup (طبق کد Vue)
  const [removeSameName, setRemoveSameName] = useState(false);
  const [oldLookup, setOldLookup] = useState(false);

  // 1) لیست EntityTypeها -> برای "Get information from"
  const [getInformationFromList, setGetInformationFromList] = useState<EntityType[]>([]);
  // 2) ستون‌هایی که نمایش داده می‌شوند -> برای "What Column To Display"
  const [columnDisplayList, setColumnDisplayList] = useState<EntityField[]>([]);
  // 3) ستون‌های srcField
  const [srcFieldList, setSrcFieldList] = useState<EntityField[]>([]);
  // 4) ستون‌های desField
  const [desFieldList, setDesFieldList] = useState<EntityField[]>([]);
  // 5) Modes (lookMode)
  const [modesList, setModesList] = useState<{ value: string; label: string }[]>([]);
  // 6) Operation (FilterOpration)
  const [operationList, setOperationList] = useState<{ value: string; label: string }[]>([]);

  // داده‌های جدول اصلی Lookup
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // داده‌های Default Value -> حالا می‌خواهیم از getAllRoles پر شود
  const [roleRows, setRoleRows] = useState<Role[]>([]);
  const [defaultValues, setDefaultValues] = useState<string[][]>([[]]); 
  // بسته به ساختار PostPickerList شما تغییر دهید.

  // -----------------------------
  // لود اولیه: parse metaType4 برای tableData
  // -----------------------------
  useEffect(() => {
    if (metaTypesLookUp.metaType4) {
      try {
        const parsed = JSON.parse(metaTypesLookUp.metaType4) as TableRow[];
        if (Array.isArray(parsed)) {
          setTableData(parsed);
        }
      } catch (err) {
        console.error("Error parsing metaType4 JSON:", err);
      }
    }
    // eslint-disable-next-line
  }, []);

  // -----------------------------
  // گرفتن لیست EntityTypeها
  // -----------------------------
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllEntityType();
        setGetInformationFromList(res); 
        // در Vue از getTableTransmittal استفاده می‌شد؛
        // اینجا فرض کردیم getAllEntityType همان داده را می‌دهد.
      } catch (error) {
        console.error("Error fetching entity types:", error);
      }
    })();
  }, [getAllEntityType]);

  // -----------------------------
  // هر زمان metaTypesLookUp.metaType1 تغییر کرد => بیا فیلدهای مرتبطش را دریافت کن
  // -----------------------------
  useEffect(() => {
    (async () => {
      const { metaType1 } = metaTypesLookUp;
      if (metaType1) {
        try {
          const idAsNumber = Number(metaType1);
          if (!isNaN(idAsNumber)) {
            const fields = await getEntityFieldByEntityTypeId(idAsNumber);
            // برای چهارتا منبع قرار می‌دهیم (What Column To Display, src, des)
            setColumnDisplayList(fields);
            setSrcFieldList(fields);
            setDesFieldList(fields);
          }
        } catch (error) {
          console.error("Error fetching fields by entity type ID:", error);
        }
      } else {
        // اگر خالی بود، آرایه را ریست کن
        setColumnDisplayList([]);
        setSrcFieldList([]);
        setDesFieldList([]);
      }
    })();
  }, [metaTypesLookUp.metaType1, getEntityFieldByEntityTypeId]);

  // -----------------------------
  // دریافت Mode (lookMode) و Operation (FilterOpration)
  // -----------------------------
  useEffect(() => {
    (async () => {
      try {
        // lookMode
        const lookModeResponse: GetEnumResponse = await AppServices.getEnum({ str: "lookMode" });
        // تبدیل به آرایهٔ [{value,label}]
        const modes = Object.entries(lookModeResponse).map(([key, val]) => ({
          value: val, // مقدار اصلی
          label: key  // برچسب 
        }));
        setModesList(modes);
      } catch (error) {
        console.error("Error fetching lookMode:", error);
      }

      try {
        // FilterOpration
        const filterOperationResponse: GetEnumResponse = await AppServices.getEnum({ str: "FilterOpration" });
        const ops = Object.entries(filterOperationResponse).map(([key, val]) => ({
          value: val,
          label: key
        }));
        setOperationList(ops);
      } catch (error) {
        console.error("Error fetching FilterOpration:", error);
      }
    })();
  }, [getEnum]);

  // -----------------------------
  // فراخوانی getAllRoles برای DefaultValues
  // -----------------------------
  useEffect(() => {
    (async () => {
      try {
        const roles = await getAllRoles();
        setRoleRows(roles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    })();
  }, [getAllRoles]);

  // -----------------------------
  // Watch شبیه Vue: هر تغییری در metaTypesLookUp => آن را به والد اطلاع می‌دهیم
  // -----------------------------
  useEffect(() => {
    if (onMetaChange) {
      const cloned = { ...metaTypesLookUp };
      // تبدیل به رشته در صورت نیاز
      cloned.metaType1 = cloned.metaType1 ? String(cloned.metaType1) : "";
      cloned.metaType2 = cloned.metaType2 ? String(cloned.metaType2) : "";
      onMetaChange(cloned);
    }
  }, [metaTypesLookUp, onMetaChange]);

  // ----------------------------------
  // متدهای مربوط به جدول Lookup
  // ----------------------------------
  const onAddItem = () => {
    const newRow: TableRow = {
      ID: crypto.randomUUID(), // شناسه یونیک
      srcField: null,
      operation: null,
      filterText: "",
      desField: null,
    };
    setTableData((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    setTableData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitRows = () => {
    try {
      const asString = JSON.stringify(tableData);
      // در metaType4 قرار می‌دهیم
      setMetaTypesLookUp((prev) => ({ ...prev, metaType4: asString }));
      alert("Table data saved to metaType4 successfully!");
    } catch (error) {
      console.error("Error serializing table data:", error);
      alert("Error in saving table data.");
    }
  };

  // ----------------------------------
  // هندل کردن Select در بخش بالا
  // ----------------------------------
  const handleSelectInformationFrom = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMetaTypesLookUp((prev) => ({ ...prev, metaType1: e.target.value || null }));
  };

  const handleSelectColumnDisplay = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMetaTypesLookUp((prev) => ({ ...prev, metaType2: e.target.value || null }));
  };

  const handleSelectMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMetaTypesLookUp((prev) => ({ ...prev, LookupMode: e.target.value || null }));
  };

  const handleChangeDisplayType = (type: string) => {
    setMetaTypesLookUp((prev) => ({ ...prev, metaType3: type }));
  };

  return (
    <div className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      {/* بخش بالایی: Selectors و تنظیمات */}
      <div className="flex gap-8">
        {/* بخش سمت چپ */}
        <div className="flex flex-col space-y-6 w-1/2">
          {/* Get information from */}
          <DynamicSelector
            name="getInformationFrom"
            label="Get information from"
            options={getInformationFromList.map((ent) => ({
              value: String(ent.ID),
              label: ent.Name
            }))}
            selectedValue={metaTypesLookUp.metaType1 || ""}
            onChange={handleSelectInformationFrom}
          />

          {/* What Column To Display */}
          <DynamicSelector
            name="displayColumn"
            label="What Column To Display"
            options={columnDisplayList.map((field) => ({
              value: String(field.ID),
              label: field.DisplayName
            }))}
            selectedValue={metaTypesLookUp.metaType2 || ""}
            onChange={handleSelectColumnDisplay}
          />

          {/* Modes */}
          <DynamicSelector
            name="modes"
            label="Modes"
            options={modesList} // [{value, label}]
            selectedValue={metaTypesLookUp.LookupMode || ""}
            onChange={handleSelectMode}
          />

          {/* Default Value با استفاده از نقش‌ها */}
          <PostPickerList
            defaultValues={defaultValues}
            setDefaultValues={setDefaultValues}
            columnDefs={[{ headerName: "Role Name", field: "Name" }]}
            rowData={roleRows} 
            // حالا به‌جای دادهٔ استاتیک، از getAllRoles
          />
        </div>

        {/* بخش سمت راست */}
        <div className="flex flex-col space-y-6 w-1/2">
          {/* Display choices using */}
          <div className="space-y-2">
            <label className="block font-medium">Display choices using:</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayType"
                  value="drop"
                  checked={metaTypesLookUp.metaType3 === "drop"}
                  onChange={() => handleChangeDisplayType("drop")}
                />
                Drop-Down Menu
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayType"
                  value="radio"
                  checked={metaTypesLookUp.metaType3 === "radio"}
                  onChange={() => handleChangeDisplayType("radio")}
                />
                Radio Buttons
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayType"
                  value="check"
                  checked={metaTypesLookUp.metaType3 === "check"}
                  onChange={() => handleChangeDisplayType("check")}
                />
                Checkboxes (allow multiple selections)
              </label>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={removeSameName}
                onChange={(e) => setRemoveSameName(e.target.checked)}
              />
              Remove Same Name
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={oldLookup}
                onChange={(e) => setOldLookup(e.target.checked)}
              />
              Old Lookup
            </label>
          </div>
        </div>
      </div>

      {/* بخش پایینی: جدول Lookup */}
      <div className="-mt-1">
        <DataTable
          columnDefs={[
            {
              headerName: "Src Field",
              field: "srcField",
              editable: true,
              cellEditor: "agSelectCellEditor",
              cellEditorParams: {
                // لیست IDها
                values: srcFieldList.map((f) => String(f.ID))
              },
              // اگر DataTable شما از AG-Grid یا مشابهش پشتیبانی کند:
              valueFormatter: (params: any) => {
                const matched = srcFieldList.find(
                  (f) => String(f.ID) === String(params.value)
                );
                return matched ? matched.DisplayName : params.value;
              },
            },
            {
              headerName: "Operation",
              field: "operation",
              editable: true,
              cellEditor: "agSelectCellEditor",
              cellEditorParams: {
                values: operationList.map((op) => op.value) 
                // چون در modesList/operationList => { value, label }
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
              field: "filterText",
              editable: true
            },
            {
              headerName: "Des Field",
              field: "desField",
              editable: true,
              cellEditor: "agSelectCellEditor",
              cellEditorParams: {
                values: desFieldList.map((f) => String(f.ID))
              },
              valueFormatter: (params: any) => {
                const matched = desFieldList.find(
                  (f) => String(f.ID) === String(params.value)
                );
                return matched ? matched.DisplayName : params.value;
              },
            }
          ]}
          rowData={tableData}
          // بسته به پیاده‌سازی DataTable سفارشی شما، پارامترهای زیر ممکن است متفاوت باشد
          setSelectedRowData={() => {}}
          showDuplicateIcon={false}
          showEditIcon={false}
          showAddIcon={false}
          showDeleteIcon={false}
          onAdd={onAddItem}
          onEdit={() => {}}
          onDelete={() => {}}
          onDuplicate={() => {}}
          domLayout="autoHeight"
          isRowSelected={false}
          showSearch={false}
          showAddNew={true} 
          onAddNew={onAddItem} 
        />
        <div className="mt-4 flex justify-between">
          <button
            onClick={onAddItem}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Add Item
          </button>

          <button
            onClick={handleSubmitRows}
            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
          >
            Submit Table
          </button>
        </div>
      </div>
    </div>
  );
};

export default LookUpForms;
