// src/components/LookUpForms.tsx
import React, { useState, useEffect } from "react";
import { useApi } from "../../../context/ApiContext";

// کامپوننت‌های سفارشی شما:
import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList";
import DataTable from "../../TableDynamic/DataTable";

// تایپ‌های موردنیاز
import {
  EntityField,
  EntityType,
  GetEnumResponse,
  Role,
} from "../../../services/api.services";

import AppServices from "../../../services/api.services";

interface LookUpFormsProps {
  data?: {
    metaType1?: string | null; // ID مربوط به EntityType
    metaType2?: string | null; // ID مربوط به فیلد نمایش
    metaType3?: string; // نوع نمایش (drop|radio|check)
    metaType4?: string; // اطلاعات جدول به‌صورت JSON
    LookupMode?: string | null;
    CountInReject?: boolean;
    BoolMeta1?: boolean;
    // اضافه کردن metaType5 برای حالت ویرایش
    metaType5?: string;
  };
  onMetaChange?: (updatedMeta: any) => void;
}

// شکل هر ردیف جدول Lookup (ساختار جدید)
interface TableRow {
  ID: string; // شناسه ردیف
  SrcFieldID: string | null; // ID فیلد مبدأ
  FilterOpration: string | null; // عملیات فیلتر (مثلاً 1، 2، …)
  FilterText: string; // متن فیلتر
  DesFieldID: string | null; // ID فیلد مقصد
}

const LookUpForms: React.FC<LookUpFormsProps> = ({ data, onMetaChange }) => {
  const {
    getAllEntityType,
    getEntityFieldByEntityTypeId,
    getEnum,
    getAllProject,
  } = useApi();

  // state اصلی metaTypesLookUp
  const [metaTypesLookUp, setMetaTypesLookUp] = useState({
    metaType1: data?.metaType1 ?? null,
    metaType2: data?.metaType2 ?? null,
    metaType3: data?.metaType3 ?? "",
    metaType4: data?.metaType4 ?? "",
    LookupMode: data?.LookupMode ?? "",
  });

  // مقداردهی اولیه چک‌باکس‌ها
  const [removeSameName, setRemoveSameName] = useState(
    data?.CountInReject ?? false
  );
  const [oldLookup, setOldLookup] = useState(data?.BoolMeta1 ?? false);

  // مدیریت metaType5 (Pipe-Separated IDs)
  const [defaultValueIDs, setDefaultValueIDs] = useState<string[]>(
    data?.metaType5 ? data.metaType5.split("|") : []
  );

  useEffect(() => {
    setMetaTypesLookUp((prev) => ({
      ...prev,
      metaType5: defaultValueIDs.join("|"),
    }));
  }, [defaultValueIDs]);

  // لیست‌های مربوط به EntityType و فیلدها
  const [getInformationFromList, setGetInformationFromList] = useState<
    EntityType[]
  >([]);
  const [columnDisplayList, setColumnDisplayList] = useState<EntityField[]>([]);
  const [srcFieldList, setSrcFieldList] = useState<EntityField[]>([]);
  const [desFieldList, setDesFieldList] = useState<EntityField[]>([]);
  const [modesList, setModesList] = useState<
    { value: string; label: string }[]
  >([]);
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);
  // داده‌های جدول
  const [tableData, setTableData] = useState<TableRow[]>([]);
  // لیست Roles (مثال)
  const [roleRows, setRoleRows] = useState<Role[]>([]);

  // ★ تغییر: مقداردهی اولیه tableData از داده‌های props (تنها یک بار در mount یا زمان تغییر data)
  useEffect(() => {
    if (data && data.metaType4 && data.metaType4.trim() !== "") {
      try {
        const parsed = JSON.parse(data.metaType4);
        const normalized = Array.isArray(parsed)
          ? parsed.map((item: any) => ({
              ...item,
              SrcFieldID:
                item.SrcFieldID != null ? String(item.SrcFieldID) : "",
              FilterOpration:
                item.FilterOpration != null ? String(item.FilterOpration) : "",
              DesFieldID:
                item.DesFieldID != null ? String(item.DesFieldID) : "",
              FilterText: item.FilterText || "",
            }))
          : [];
        setTableData(normalized);
      } catch (err) {
        console.error("Error parsing data.metaType4 JSON:", err);
        setTableData([]);
      }
    }
  }, [data]);

  // حذف اثر وابسته به metaTypesLookUp.metaType4 (برای جلوگیری از همگام‌سازی دوجانبه)
  // در نتیجه تنها از tableData به metaTypesLookUp.metaType4 همگام‌سازی می‌کنیم:

  // به‌روز رسانی metaType4 با تغییر tableData (در صورت تغییر مقدار)
  useEffect(() => {
    try {
      const asString = JSON.stringify(tableData);
      if (asString !== metaTypesLookUp.metaType4) {
        setMetaTypesLookUp((prev) => ({ ...prev, metaType4: asString }));
      }
    } catch (error) {
      console.error("Error serializing table data:", error);
    }
  }, [tableData, metaTypesLookUp.metaType4]);

  // دریافت EntityType ها
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

  // دریافت فیلدهای مربوط به EntityType انتخاب‌شده
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

  // دریافت Mode (lookMode) و Operation (FilterOpration)
  useEffect(() => {
    (async () => {
      try {
        const lookModeResponse: GetEnumResponse = await AppServices.getEnum({
          str: "lookMode",
        });
        const modes = Object.entries(lookModeResponse).map(([key, val]) => ({
          value: String(val),
          label: key,
        }));
        setModesList(modes);
      } catch (error) {
        console.error("Error fetching lookMode:", error);
      }

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
  }, [getEnum]);

  // دریافت Roles (برای PostPickerList)
  useEffect(() => {
    (async () => {
      try {
        const roles = await getAllProject();
        console.log("Fetched roles:", roles);
        setRoleRows(roles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    })();
  }, [getAllProject]);

  // ارسال مقادیر به والد
  useEffect(() => {
    if (onMetaChange) {
      const cloned = { ...metaTypesLookUp };
      cloned.metaType1 = cloned.metaType1 ? String(cloned.metaType1) : "";
      cloned.metaType2 = cloned.metaType2 ? String(cloned.metaType2) : "";
      cloned.LookupMode = cloned.LookupMode ?? "";
      cloned.removeSameName = removeSameName;
      cloned.oldLookup = oldLookup;
      onMetaChange(cloned);
    }
  }, [metaTypesLookUp, removeSameName, oldLookup, onMetaChange]);

  // افزودن ردیف جدید (آیکون +)
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

  // callback برای به‌روز رسانی سلول‌ها هنگام تغییر مقدار در AG‑Grid
  const handleCellValueChanged = (event: any) => {
    const updatedRow = event.data;
    setTableData((prev) =>
      prev.map((row) => (row.ID === updatedRow.ID ? updatedRow : row))
    );
  };

  // Event handlers برای Selectها
  const handleSelectInformationFrom = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setMetaTypesLookUp((prev) => ({
      ...prev,
      metaType1: e.target.value || null,
    }));
  };

  const handleSelectColumnDisplay = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setMetaTypesLookUp((prev) => ({
      ...prev,
      metaType2: e.target.value || null,
    }));
  };

  const handleSelectMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLookupMode = e.target.value || "";
    setMetaTypesLookUp((prev) => ({
      ...prev,
      LookupMode: newLookupMode,
    }));
  };

  const handleChangeDisplayType = (type: string) => {
    setMetaTypesLookUp((prev) => ({ ...prev, metaType3: type }));
  };

  // مدیریت نام‌های پیش‌فرض (برای PostPickerList)
  const [defaultValueNames, setDefaultValueNames] = useState<string[]>([]);
  useEffect(() => {
    const newNames = defaultValueIDs.map((id) => {
      const found = roleRows.find((r) => String(r.ID) === String(id));
      return found ? found.ProjectName : `Unknown ID ${id}`;
    });
    setDefaultValueNames(newNames);
  }, [defaultValueIDs, roleRows]);

  const handleAddDefaultValueID = (id: string) => {
    setDefaultValueIDs((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };
  const handleRemoveDefaultValueIndex = (index: number) => {
    setDefaultValueIDs((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  return (
    <div className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      {/* بخش بالایی: تنظیمات و Select ها */}
      <div className="flex gap-8">
        {/* سمت چپ */}
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

          <DynamicSelector
            name="modes"
            label="Modes"
            options={modesList}
            selectedValue={metaTypesLookUp.LookupMode || ""}
            onChange={handleSelectMode}
          />

          <PostPickerList
            defaultValues={defaultValueNames}
            onAddID={handleAddDefaultValueID}
            onRemoveIndex={handleRemoveDefaultValueIndex}
            fullWidth={true}
          />
        </div>

        {/* سمت راست */}
        <div className="flex flex-col space-y-6 w-1/2">
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
      <div className="mt-4">
        <DataTable
          columnDefs={[
            {
              headerName: "Src Field",
              field: "SrcFieldID",
              editable: true,
              cellEditor: "agSelectCellEditor",
              cellEditorParams: {
                values: srcFieldList.map((f) => String(f.ID)),
              },
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
                values: desFieldList.map((f) => String(f.ID)),
              },
              valueFormatter: (params: any) => {
                const matched = desFieldList.find(
                  (f) => String(f.ID) === String(params.value)
                );
                return matched ? matched.DisplayName : params.value;
              },
            },
          ]}
          rowData={tableData}
          setSelectedRowData={() => {}}
          showDuplicateIcon={false}
          showEditIcon={false}
          showAddIcon={true} // آیکون + در نوار ابزار دیتا تیبل
          showDeleteIcon={false}
          onAdd={onAddNew} // افزودن ردیف جدید از طریق آیکون +
          onEdit={() => {}}
          onDelete={() => {}}
          onDuplicate={() => {}}
          onCellValueChanged={handleCellValueChanged}
          domLayout="autoHeight"
          isRowSelected={false}
          showSearch={false}
        />
      </div>
    </div>
  );
};

export default LookUpForms;
