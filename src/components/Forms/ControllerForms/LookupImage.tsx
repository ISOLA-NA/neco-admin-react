// src/components/ControllerForms/LookupUmage.tsx

import React, { useState, useEffect } from "react";
import { useApi } from "../../../context/ApiContext";
import DynamicSelector from "../../utilities/DynamicSelector";
import DataTable from "../../TableDynamic/DataTable";
import AppServices, {
  EntityField,
  EntityType,
  GetEnumResponse,
} from "../../../services/api.services";

interface LookupUmageProps {
  data?: {
    metaType1?: string | null; // ID مربوط به EntityType
    metaType2?: string | null; // ID مربوط به فیلد نمایش
    metaType4?: string; // اطلاعات جدول به‌صورت JSON (در حالت ویرایش)
    removeSameName?: boolean; // حالا اینجا همان چیزی است که والد پاس می‌دهد
  };
  onMetaChange?: (updatedMeta: any) => void;
}

// شکل هر ردیف جدول
interface TableRow {
  ID: string;
  SrcFieldID: string | null;
  FilterOpration: string | null;
  FilterText: string;
  DesFieldID: string | null;
}

const LookupUmage: React.FC<LookupUmageProps> = ({ data, onMetaChange }) => {
  const { getAllEntityType, getEntityFieldByEntityTypeId, getEnum } = useApi();

  // اطلاعات انتخابی برای metaTypesLookUp
  const [metaTypesLookUp, setMetaTypesLookUp] = useState({
    metaType1: data?.metaType1 ?? null,
    metaType2: data?.metaType2 ?? null,
    metaType4: data?.metaType4 ?? "",
  });

  // چک‌باکس Remove Same Name
  const [removeSameName, setRemoveSameName] = useState<boolean>(
    data?.removeSameName ?? false
  );

  // داده‌های جدول
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // برای جلو‌گیری از چندبار مقداردهی اولیه
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // مقداردهی اولیه از data (در حالت ویرایش)
  useEffect(() => {
    if (data && !initialDataLoaded) {
      setMetaTypesLookUp({
        metaType1: data.metaType1 ?? null,
        metaType2: data.metaType2 ?? null,
        metaType4: data.metaType4 ?? "",
      });
      // مقدار چک‌باکس
      setRemoveSameName(data.removeSameName ?? false);
      setInitialDataLoaded(true);
    }
  }, [data, initialDataLoaded]);

  // اگر metaType4 مقداری داشت، آن را به شکل JSON پارس کرده و در جدول قرار می‌دهیم
  useEffect(() => {
    if (
      data &&
      data.metaType4 &&
      data.metaType4.trim() !== "" &&
      tableData.length === 0
    ) {
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
  }, [data, tableData.length]);

  // همگام‌سازی tableData => metaType4
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

  // لیست‌ها برای EntityType و فیلدها و ...
  const [getInformationFromList, setGetInformationFromList] = useState<
    EntityType[]
  >([]);
  const [columnDisplayList, setColumnDisplayList] = useState<EntityField[]>([]);
  const [srcFieldList, setSrcFieldList] = useState<EntityField[]>([]);
  const [desFieldList, setDesFieldList] = useState<EntityField[]>([]);
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);

  // دریافت همه موجودیت‌ها
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

  // دریافت فیلدهای یک موجودیت خاص
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
          console.error("Error fetching fields:", error);
        }
      } else {
        setColumnDisplayList([]);
        setSrcFieldList([]);
        setDesFieldList([]);
      }
    })();
  }, [metaTypesLookUp.metaType1, getEntityFieldByEntityTypeId]);

  // دریافت enum مربوط به FilterOpration برای جدول
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
  }, [getEnum]);

  // ارسال تغییرات به والد
  useEffect(() => {
    if (onMetaChange) {
      onMetaChange({
        metaType1: metaTypesLookUp.metaType1,
        metaType2: metaTypesLookUp.metaType2,
        metaType4: metaTypesLookUp.metaType4,
        // این همان فیلدی است که والد باید بگیرد
        removeSameName: removeSameName,
      });
    }
  }, [metaTypesLookUp, removeSameName, onMetaChange]);

  // هندل تغییر select برای موجودیت
  const handleSelectInformationFrom = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setMetaTypesLookUp((prev) => ({
      ...prev,
      metaType1: e.target.value || null,
    }));
  };

  // هندل تغییر select برای انتخاب ستون نمایشی
  const handleSelectColumnDisplay = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setMetaTypesLookUp((prev) => ({
      ...prev,
      metaType2: e.target.value || null,
    }));
  };

  // افزودن ردیف به جدول
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

  // موقع تغییر مقدار یک سلول در جدول
  const handleCellValueChanged = (event: any) => {
    const updatedRow = event.data;
    setTableData((prev) =>
      prev.map((row) => (row.ID === updatedRow.ID ? updatedRow : row))
    );
  };

  return (
    <div className="flex flex-col gap-8 p-2 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      {/* بخش تنظیمات بالا */}
      <div className="flex gap-8">
        <div className="flex flex-col space-y-6 w-1/2">
          <DynamicSelector
            name="getInformationFrom"
            label="Get Information From"
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
        </div>
        <div className="flex flex-col justify-center w-1/2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={removeSameName}
              onChange={(e) => setRemoveSameName(e.target.checked)}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <label className="text-gray-700 font-medium">
              Remove Same Name
            </label>
          </div>
        </div>
      </div>

      {/* جدول پایین */}
      <div className="mb-100">
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
          showAddIcon={true}
          showDeleteIcon={false}
          onAdd={onAddNew}
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

export default LookupUmage;
