// src/components/LookUpForms.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "../../../context/ApiContext";

// Custom components:
import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";

// Types from API services
import {
  EntityField,
  EntityType,
  GetEnumResponse,
  Role,
} from "../../../services/api.services";

import AppServices from "../../../services/api.services";

interface LookUpFormsProps {
  data?: {
    metaType1?: string | number | null;
    metaType2?: string | number | null;
    metaType3?: string;
    metaType4?: string;
    LookupMode?: string | number | null;
    CountInReject?: boolean;
    BoolMeta1?: boolean;
    metaType5?: string;
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

const LookUpForms: React.FC<LookUpFormsProps> = ({ data, onMetaChange }) => {
  const {
    getAllEntityType,
    getEntityFieldByEntityTypeId,
    getEnum,
    getAllProject,
  } = useApi();

  // مقداردهی اولیه state تنها یکبار (در mount)؛
  // در اینجا تمامی مقادیر به صورت رشته تنظیم می‌شوند.
  const [metaTypesLookUp, setMetaTypesLookUp] = useState({
    metaType1: data && data.metaType1 != null ? String(data.metaType1) : "",
    metaType2: data && data.metaType2 != null ? String(data.metaType2) : "",
    metaType3: data?.metaType3 ?? "",
    LookupMode: data && data.LookupMode != null ? String(data.LookupMode) : "",
    // metaType4 به صورت جداگانه مدیریت می‌شود
    metaType5: data?.metaType5 ?? "",
  });

  // فقط در mount، state اولیه از data را تنظیم می‌کنیم (برای جلوگیری از override تغییرات کاربر)
  useEffect(() => {
    if (data) {
      setMetaTypesLookUp({
        metaType1: data.metaType1 != null ? String(data.metaType1) : "",
        metaType2: data.metaType2 != null ? String(data.metaType2) : "",
        metaType3: data.metaType3 ?? "",
        LookupMode: data.LookupMode != null ? String(data.LookupMode) : "",
        metaType5: data.metaType5 ?? "",
      });
    }
  }, []); // یکبار اجرا می‌شود

  const [removeSameName, setRemoveSameName] = useState(data?.CountInReject ?? false);
  const [oldLookup, setOldLookup] = useState(data?.BoolMeta1 ?? false);
  const [defaultValueIDs, setDefaultValueIDs] = useState<string[]>(
    data?.metaType5 ? data.metaType5.split("|") : []
  );
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // مقداردهی اولیه tableData از data.metaType4 فقط یکبار در mount
  useEffect(() => {
    if (data && data.metaType4 && data.metaType4.trim() !== "") {
      try {
        const parsed = JSON.parse(data.metaType4);
        const normalized = Array.isArray(parsed)
          ? parsed.map((item: any) => ({
              ...item,
              SrcFieldID: item.SrcFieldID ? String(item.SrcFieldID) : null,
              FilterOpration: item.FilterOpration ? String(item.FilterOpration) : null,
              DesFieldID: item.DesFieldID ? String(item.DesFieldID) : null,
              FilterText: item.FilterText || "",
            }))
          : [];
        setTableData(normalized);
      } catch (err) {
        console.error("Error parsing data.metaType4 JSON:", err);
        setTableData([]);
      }
    } else {
      setTableData([]);
    }
  }, []); // فقط mount

  // همگام‌سازی metaType4 در state بر اساس tableData؛ وابسته تنها به tableData
  useEffect(() => {
    try {
      const asString = JSON.stringify(tableData);
      setMetaTypesLookUp((prev) => ({ ...prev, metaType4: asString }));
    } catch (error) {
      console.error("Error serializing table data:", error);
    }
  }, [tableData]);

  const [getInformationFromList, setGetInformationFromList] = useState<EntityType[]>([]);
  const [columnDisplayList, setColumnDisplayList] = useState<EntityField[]>([]);
  const [srcFieldList, setSrcFieldList] = useState<EntityField[]>([]);
  const [desFieldList, setDesFieldList] = useState<EntityField[]>([]);
  const [modesList, setModesList] = useState<{ value: string; label: string }[]>([]);
  const [operationList, setOperationList] = useState<{ value: string; label: string }[]>([]);
  const [roleRows, setRoleRows] = useState<Role[]>([]);

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

  useEffect(() => {
    (async () => {
      try {
        const lookModeResponse: GetEnumResponse = await AppServices.getEnum({ str: "lookMode" });
        const modes = Object.entries(lookModeResponse).map(([key, val]) => ({
          value: String(val),
          label: key,
        }));
        setModesList(modes);
      } catch (error) {
        console.error("Error fetching lookMode:", error);
      }
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
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const projects = await getAllProject();
        setRoleRows(projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    })();
  }, [getAllProject]);

  // به‌روز‌رسانی نام‌های پیش‌فرض بر اساس defaultValueIDs
  const [defaultValueNames, setDefaultValueNames] = useState<string[]>([]);
  useEffect(() => {
    const newNames = defaultValueIDs.map((id) => {
      const found = roleRows.find((r) => String(r.ID) === String(id));
      return found ? found.ProjectName : `Unknown ID ${id}`;
    });
    setDefaultValueNames(newNames);
  }, [defaultValueIDs, roleRows]);

  // تابع کمکی برای به‌روز‌رسانی state و اطلاع والد
  const updateMeta = useCallback(
    (updatedFields: Partial<typeof metaTypesLookUp>) => {
      setMetaTypesLookUp((prev) => {
        const newState = { ...prev, ...updatedFields };
        if (onMetaChange) {
          onMetaChange({
            ...newState,
            CountInReject: removeSameName,
            BoolMeta1: oldLookup,
            metaType5: defaultValueIDs.join("|"),
            metaType4: JSON.stringify(tableData),
          });
        }
        return newState;
      });
    },
    [onMetaChange, removeSameName, oldLookup, defaultValueIDs, tableData]
  );

  const handleSelectInformationFrom = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMeta({ metaType1: e.target.value });
  };

  const handleSelectColumnDisplay = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMeta({ metaType2: e.target.value });
  };

  const handleSelectMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMeta({ LookupMode: e.target.value });
  };

  const handleChangeDisplayType = (type: string) => {
    updateMeta({ metaType3: type });
  };

  const handleRemoveSameNameChange = (checked: boolean) => {
    setRemoveSameName(checked);
    updateMeta({});
  };

  const handleOldLookupChange = (checked: boolean) => {
    setOldLookup(checked);
    updateMeta({});
  };

  const handleTableDataChange = (newTableData: TableRow[]) => {
    setTableData(newTableData);
    updateMeta({});
  };

  const onAddNew = () => {
    const newRow: TableRow = {
      ID: crypto.randomUUID(),
      SrcFieldID: "",
      FilterOpration: "",
      FilterText: "",
      DesFieldID: "",
    };
    handleTableDataChange([...tableData, newRow]);
  };

  const handleCellValueChanged = (event: any) => {
    const updatedRow = event.data;
    const newData = tableData.map((row) =>
      row.ID === updatedRow.ID ? updatedRow : row
    );
    handleTableDataChange(newData);
  };

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
      {/* تنظیمات و Select ها */}
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

          <DynamicSelector
            name="modes"
            label="Modes"
            options={modesList}
            selectedValue={metaTypesLookUp.LookupMode}
            onChange={handleSelectMode}
          />

          <PostPickerList
            sourceType="projects"
            defaultValues={defaultValueNames}
            onAddID={handleAddDefaultValueID}
            onRemoveIndex={handleRemoveDefaultValueIndex}
            fullWidth={true}
          />
        </div>

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
                onChange={(e) => handleRemoveSameNameChange(e.target.checked)}
              />
              Remove Same Name
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={oldLookup}
                onChange={(e) => handleOldLookupChange(e.target.checked)}
              />
              Old Lookup
            </label>
          </div>
        </div>
      </div>

      {/* جدول Lookup در ظرف با ارتفاع 600 پیکسلی و اسکرول */}
      <div className="mt-4" style={{ height: "300px", overflowY: "auto" }}>
        <div className="flex-grow h-full">
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
            domLayout="normal"
            isRowSelected={false}
            showSearch={false}
          />
        </div>
      </div>
    </div>
  );
};

export default LookUpForms;
