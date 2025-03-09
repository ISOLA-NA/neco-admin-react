// src/components/ControllerForms/AdvanceLookupAdvanceTable.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "../../../context/ApiContext";
import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";
import AppServices from "../../../services/api.services";
import {
  EntityField,
  EntityType,
  GetEnumResponse,
  Role,
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

const AdvanceLookupAdvanceTable: React.FC<LookupAdvanceTableProps> = ({ data, onMetaChange }) => {
  const { getAllEntityType, getEntityFieldByEntityTypeId, getEnum, getAllProject } = useApi();

  // مقداردهی اولیه state تنها یکبار (در mount)
  const [metaTypesLookUp, setMetaTypesLookUp] = useState({
    metaType1: data && data.metaType1 != null ? String(data.metaType1) : "",
    metaType2: data && data.metaType2 != null ? String(data.metaType2) : "",
    metaType4: data?.metaType4 ?? "",
    metaType5: data?.metaType5 ?? "",
  });

  // سایر state ها (فقط در mount)
  const [defaultValueIDs, setDefaultValueIDs] = useState<string[]>(
    data?.metaType5 ? data.metaType5.split("|") : []
  );
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // مقداردهی اولیه tableData از data.metaType4 (فقط یکبار)
  useEffect(() => {
    if (data && data.metaType4 && data.metaType4.trim() !== "") {
      try {
        const parsed = JSON.parse(data.metaType4);
        const normalized = Array.isArray(parsed)
          ? parsed.map((item: any) => ({
              ...item,
              SrcFieldID: item.SrcFieldID != null ? String(item.SrcFieldID) : "",
              FilterOpration: item.FilterOpration != null ? String(item.FilterOpration) : "",
              DesFieldID: item.DesFieldID != null ? String(item.DesFieldID) : "",
              FilterText: item.FilterText || "",
            }))
          : [];
        setTableData(normalized);
      } catch (err) {
        console.error("Error parsing data.metaType4 JSON:", err);
        setTableData([]);
      } finally {
        setInitialDataLoaded(true);
      }
    } else {
      setTableData([]);
      setInitialDataLoaded(true);
    }
  }, []); // فقط یکبار

  // به‌روز‌رسانی metaType4 تنها وابسته به tableData
  useEffect(() => {
    try {
      const asString = JSON.stringify(tableData);
      setMetaTypesLookUp((prev) => ({ ...prev, metaType4: asString }));
    } catch (error) {
      console.error("Error serializing table data:", error);
    }
  }, [tableData]);

  // دریافت لیست EntityType ها
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

  // دریافت فیلدهای مربوط به EntityType انتخاب‌شده
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

  // دریافت Enums برای FilterOpration
  const [operationList, setOperationList] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const filterOperationResponse: GetEnumResponse = await AppServices.getEnum({ str: "FilterOpration" });
        const ops = Object.entries(filterOperationResponse).map(([key, val]) => ({
          value: String(val),
          label: key,
        }));
        setOperationList(ops);
      } catch (error) {
        console.error("Error fetching FilterOpration:", error);
      }
    })();
  }, [getEnum]);

  // دریافت Roles (لیست پروژه‌ها) برای PostPickerList
  const [roleRows, setRoleRows] = useState<Role[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const roles = await getAllProject();
        setRoleRows(roles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    })();
  }, [getAllProject]);

  // به‌روز‌رسانی نام‌های پیش‌فرض برای PostPickerList
  const [defaultValueNames, setDefaultValueNames] = useState<string[]>([]);
  useEffect(() => {
    const newNames = defaultValueIDs.map((id) => {
      const found = roleRows.find((r) => String(r.ID) === String(id));
      return found ? found.ProjectName : `Unknown ID ${id}`;
    });
    setDefaultValueNames(newNames);
  }, [defaultValueIDs, roleRows]);

  // ارسال مقادیر به والد هنگام تغییر stateهای اصلی
  useEffect(() => {
    if (onMetaChange) {
      onMetaChange({
        ...metaTypesLookUp,
        metaType5: defaultValueIDs.join("|"),
        metaType4: JSON.stringify(tableData),
      });
    }
  }, [metaTypesLookUp, defaultValueIDs, tableData, onMetaChange]);

  // تابع به‌روز‌رسانی state metaTypesLookUp و فراخوانی onMetaChange
  const updateMeta = useCallback(
    (updatedFields: Partial<typeof metaTypesLookUp>) => {
      setMetaTypesLookUp((prev) => {
        const newState = { ...prev, ...updatedFields };
        if (onMetaChange) {
          onMetaChange({
            ...newState,
            metaType5: defaultValueIDs.join("|"),
            metaType4: JSON.stringify(tableData),
          });
        }
        return newState;
      });
    },
    [onMetaChange, defaultValueIDs, tableData]
  );

  // Event handlers برای تغییر Select ها
  const handleSelectInformationFrom = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMeta({ metaType1: e.target.value });
  };

  const handleSelectColumnDisplay = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMeta({ metaType2: e.target.value });
  };

  // توابع مربوط به PostPickerList
  const handleAddDefaultValueID = (id: string) => {
    setDefaultValueIDs((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleRemoveDefaultValueIndex = (index: number) => {
    setDefaultValueIDs((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  // توابع مربوط به جدول Lookup
  const onAddNew = () => {
    const newRow: TableRow = {
      ID: crypto.randomUUID(),
      SrcFieldID: "",
      FilterOpration: "",
      FilterText: "",
      DesFieldID: "",
    };
    updateMeta({});
    setTableData((prev) => [...prev, newRow]);
  };

  const handleCellValueChanged = (event: any) => {
    const updatedRow = event.data;
    const newData = tableData.map((row) =>
      row.ID === updatedRow.ID ? updatedRow : row
    );
    updateMeta({});
    setTableData(newData);
  };

  return (
    <div className="flex flex-col gap-8 p-2 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      {/* بخش بالایی: تنظیمات و Selectors */}
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
          <PostPickerList
            sourceType="projects"
            defaultValues={defaultValueNames}
            onAddID={handleAddDefaultValueID}
            onRemoveIndex={handleRemoveDefaultValueIndex}
            fullWidth={true}
          />
        </div>
        {/* سمت راست: (در صورت نیاز تنظیمات اضافی) */}
        <div className="flex flex-col space-y-6 w-1/2">
          {/* تنظیمات اضافی در صورت نیاز */}
        </div>
      </div>
      {/* بخش پایینی: جدول Lookup در ظرف با ارتفاع 600 پیکسلی و اسکرول */}
      <div className="mt-4" style={{ height: "600px", overflowY: "auto" }}>
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

export default AdvanceLookupAdvanceTable;
