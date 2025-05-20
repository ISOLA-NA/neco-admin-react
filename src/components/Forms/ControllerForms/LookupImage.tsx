import React, { useState, useEffect, useRef, useMemo } from "react";
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
    metaType1?: string | null;
    metaType2?: string | null;
    metaType4?: string;
    removeSameName?: boolean;
  };
  onMetaChange?: (updatedMeta: any) => void;
  onMetaExtraChange?: (updated: { metaType4: string }) => void;
}

interface TableRow {
  ID: string;
  SrcFieldID: string | null;
  FilterOpration: string | null;
  FilterText: string;
  DesFieldID: string | null;
}

const LookupUmage: React.FC<LookupUmageProps> = ({
  data,
  onMetaChange,
  onMetaExtraChange,
}) => {
  const { getAllEntityType, getEntityFieldByEntityTypeId, getEnum } = useApi();

  // state
  const [meta, setMeta] = useState({
    metaType1: data?.metaType1 ? String(data.metaType1) : "",
    metaType2: data?.metaType2 ? String(data.metaType2) : "",
  });
  const [removeSameName, setRemoveSameName] = useState(!!data?.removeSameName);
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // اولین بار فقط مقداردهی اولیه جدول را انجام بده!
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      try {
        const parsed = JSON.parse(data?.metaType4 || "[]");
        if (Array.isArray(parsed)) {
          setTableData(
            parsed.map((item: any) => ({
              ID: String(item.ID ?? crypto.randomUUID()),
              SrcFieldID: item.SrcFieldID || "",
              FilterOpration: item.FilterOpration || "",
              FilterText: item.FilterText || "",
              DesFieldID: item.DesFieldID || "",
            }))
          );
        }
      } catch {
        setTableData([]);
      }
      firstLoad.current = false;
    }
  }, [data?.metaType4]);

  // سینک تغییرات جدول به metaType4
  useEffect(() => {
    const meta4String = JSON.stringify(tableData);
    if (onMetaChange) {
      onMetaChange({
        ...meta,
        metaType4: meta4String,
        CountInReject: removeSameName,
      });
    }
    if (onMetaExtraChange) {
      onMetaExtraChange({ metaType4: meta4String });
    }
    // اینجا مقداردهی مجدد meta یا tableData انجام نده، فقط به بالا پاس بده!
    // وگرنه چرخه بی‌نهایت رخ میده
    // eslint-disable-next-line
  }, [tableData, removeSameName]);

  // سینک مقادیر سلکتورها (فقط روی تغییر کاربر)
  const handleMetaChange = (partial: Partial<typeof meta>) => {
    const next = { ...meta, ...partial };
    setMeta(next);
    if (onMetaChange) {
      onMetaChange({
        ...next,
        metaType4: JSON.stringify(tableData),
        CountInReject: removeSameName,
      });
    }
  };

  // بقیه stateها و لیست‌ها مثل قبل
  const [getInformationFromList, setGetInformationFromList] = useState<
    EntityType[]
  >([]);
  const [columnDisplayList, setColumnDisplayList] = useState<EntityField[]>([]);
  const [srcFieldList, setSrcFieldList] = useState<EntityField[]>([]);
  const [desFieldList, setDesFieldList] = useState<EntityField[]>([]);
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
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
  }, [getAllEntityType]);

  useEffect(() => {
    (async () => {
      const { metaType1 } = meta;
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
  }, [meta.metaType1, getEntityFieldByEntityTypeId]);

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

  // افزودن ردیف
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

  // تغییر سلول
  const handleCellValueChanged = (event: any) => {
    const updatedRow = event.data;
    setTableData((prev) =>
      prev.map((row) => (row.ID === updatedRow.ID ? updatedRow : row))
    );
  };

  // ---- Render ----
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
            selectedValue={meta.metaType1}
            onChange={(e) => handleMetaChange({ metaType1: e.target.value })}
          />
          <DynamicSelector
            name="displayColumn"
            label="What Column To Display"
            options={columnDisplayList.map((field) => ({
              value: String(field.ID),
              label: field.DisplayName,
            }))}
            selectedValue={meta.metaType2}
            onChange={(e) => handleMetaChange({ metaType2: e.target.value })}
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
