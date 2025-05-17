import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useApi } from "../../../context/ApiContext";
import DynamicSelector from "../../utilities/DynamicSelector";
import PostPickerList from "./PostPickerList/PostPickerList";
import DataTable from "../../TableDynamic/DataTable";
import AppServices from "../../../services/api.services";

interface LookUpFormsProps {
  data?: {
    metaType1?: string | number | null;
    metaType2?: string | number | null;
    metaType3?: string;
    metaType4?: string;
    metaType5?: string;
    LookupMode?: string | number | null;
    CountInReject?: boolean;
    BoolMeta1?: boolean;
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

const LookUpForms: React.FC<LookUpFormsProps> = ({
  data,
  onMetaChange,
  onMetaExtraChange,
}) => {
  const { getAllEntityType, getEntityFieldByEntityTypeId } = useApi();

  const [metaTypesLookUp, setMetaTypesLookUp] = useState<{
    metaType1: string;
    metaType2: string;
    metaType3: string;
    metaType4: string;
    metaType5: string;
    LookupMode: string;
  }>({
    metaType1: data?.metaType1 != null ? String(data.metaType1) : "",
    metaType2: data?.metaType2 != null ? String(data.metaType2) : "",
    metaType3: data?.metaType3 ?? "",
    metaType4: data?.metaType4 ?? "",
    metaType5: data?.metaType5 ?? "",
    LookupMode: data?.LookupMode != null ? String(data.LookupMode) : "",
  });

  const [removeSameName, setRemoveSameName] = useState<boolean>(
    data?.CountInReject ?? false
  );
  const [oldLookup, setOldLookup] = useState<boolean>(data?.BoolMeta1 ?? false);

  const [getInformationFromList, setGetInformationFromList] = useState<any[]>(
    []
  );
  const [columnDisplayList, setColumnDisplayList] = useState<any[]>([]);
  const [srcFieldList, setSrcFieldList] = useState<any[]>([]);
  const [desFieldList, setDesFieldList] = useState<any[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [modesList, setModesList] = useState<
    { value: string; label: string }[]
  >([]);
  const [operationList, setOperationList] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const incoming = data?.metaType4 ?? "";
    if (incoming !== metaTypesLookUp.metaType4) {
      setMetaTypesLookUp((prev) => ({
        ...prev,
        metaType4: incoming,
      }));
    }
  }, [data?.metaType4, metaTypesLookUp.metaType4]);

  const handleRemoveSameNameChange = (checked: boolean) => {
    console.log("↩️ CountInReject →", checked);
    setRemoveSameName(checked);
  };

  const handleOldLookupChange = (checked: boolean) => {
    console.log("↩️ BoolMeta1 →", checked);
    setOldLookup(checked);
  };

  const updateMeta = useCallback(
    (updatedFields: Partial<typeof metaTypesLookUp>) => {
      setMetaTypesLookUp((prev) => {
        const next = { ...prev, ...updatedFields };
        const changed = Object.keys(updatedFields).some(
          (key) =>
            (updatedFields as any)[key] !== undefined &&
            (updatedFields as any)[key] !== (prev as any)[key]
        );
        onMetaChange?.({
          ...data,
          ...next,
          CountInReject: removeSameName,
          BoolMeta1: oldLookup,
        });

        return changed ? next : prev;
      });
    },
    [onMetaChange, data, removeSameName, oldLookup]
  );

  useEffect(() => {
    updateMeta({});
  }, [removeSameName, oldLookup, updateMeta]);

  /**
   * بارگیری مقدار اولیهٔ جدول فیلترها از metaType4 (که در حالت ادیت ممکن است JSON ذخیره شده باشد)
   */
  const initialTableSync = useRef(true);

  useEffect(() => {
    // فقط دفعهٔ اول یا وقتی prop تغییر کرده باشه
    if (!initialTableSync.current || data?.metaType4) {
      try {
        const parsed = JSON.parse(data?.metaType4 || "[]");
        if (Array.isArray(parsed)) {
          const normalized: TableRow[] = parsed.map((item) => ({
            ID: String(item.ID ?? crypto.randomUUID()),
            SrcFieldID: item.SrcFieldID ? String(item.SrcFieldID) : "",
            FilterOpration: item.FilterOpration
              ? String(item.FilterOpration)
              : "",
            FilterText: item.FilterText || "",
            DesFieldID: item.DesFieldID ? String(item.DesFieldID) : "",
          }));
          setTableData(normalized);
        }
      } catch (e) {
        console.error("Error parsing initial metaType4:", e);
        setTableData([]);
      }
      initialTableSync.current = false;
    }
  }, [data?.metaType4]);

  /**
   * فراخوانی سرویس برای گرفتن فهرست موجودیت‌ها
   */
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
   * هربار که metaType1 (شناسهٔ موجودیت) تغییر کند، فیلدهای آن موجودیت را می‌گیریم
   */
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
   * گرفتن enumهای مورد نیاز (lookMode و FilterOpration) از سرور
   */
  useEffect(() => {
    (async () => {
      try {
        const lookModeResponse = await AppServices.getEnum({ str: "lookMode" });
        // lookModeResponse به شکل { Key1: value1, Key2: value2, ... } برمی‌گردد
        const modes = Object.entries(lookModeResponse).map(([key, val]) => ({
          value: String(val),
          label: key,
        }));
        setModesList(modes);
      } catch (error) {
        console.error("Error fetching lookMode:", error);
      }

      try {
        const filterOperationResponse = await AppServices.getEnum({
          str: "FilterOpration",
        });
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
  }, []);

  /**
   * هر بار که tableData تغییر کند، آن را به JSON تبدیل کرده
   * در metaType4 ذخیره می‌کنیم
   */
  // قبل از این: useEffect روی [tableData]
  useEffect(() => {
    try {
      const str = JSON.stringify(tableData);

      // ▶▶ فقط وقتی str با prop.data.metaType4 فرق داشت، آپدیت کن
      if (str !== data?.metaType4) {
        // ۱. به والد اطلاع بده
        updateMeta({ metaType4: str });
        if (onMetaExtraChange) {
          onMetaExtraChange({ metaType4: str });
        }
      }
    } catch (e) {
      console.error("Error serializing table data:", e);
    }
    // اضافه کن data?.metaType4 تا روی تغییر prop هم رصد کنیم در صورت لزوم
  }, [tableData, data?.metaType4, updateMeta, onMetaExtraChange]);

  /**
   * افزودن ردیف جدید به جدول
   */
  const handleAddNewRow = () => {
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
   * وقتی مقدار یک سلول در جدول تغییر می‌کند، دادهٔ همان ردیف را به‌روز می‌کنیم
   */
  const handleCellValueChanged = (event: any) => {
    const updatedRow = event.data as TableRow;
    setTableData((prev) =>
      prev.map((row) => (row.ID === updatedRow.ID ? updatedRow : row))
    );
  };

  /**
   * هندلر برای Selectهایی که در بالا داریم:
   * (Get information from, What column to display, Modes, ...)
   */
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

  const handleSelectMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMeta({ LookupMode: e.target.value });
  };

  /**
   *  تغییر در نحوهٔ نمایش انتخاب (radio, drop, check):
   */
  const handleDisplayTypeChange = (type: string) => {
    updateMeta({ metaType3: type });
  };

  // ⬇️ این قطعه را داخل کامپوننت LookUpForms و دقیقاً قبل از return قرار بده
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Src Field",
        field: "SrcFieldID",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: srcFieldList.map((f: any) => (f.ID ? String(f.ID) : "")),
        },
        valueFormatter: (params: any) => {
          const matched = srcFieldList.find(
            (f: any) => String(f.ID) === String(params.value)
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
          values: desFieldList.map((f: any) => (f.ID ? String(f.ID) : "")),
        },
        valueFormatter: (params: any) => {
          const matched = desFieldList.find(
            (f: any) => String(f.ID) === String(params.value)
          );
          return matched ? matched.DisplayName : params.value;
        },
      },
    ],
    [srcFieldList, desFieldList, operationList]
  );

  return (
    <div className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
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
            selectedValue={metaTypesLookUp.metaType1}
            onChange={handleSelectInformationFrom}
          />

          <DynamicSelector
            name="displayColumn"
            label="What Column To Display"
            options={columnDisplayList.map((field: any) => ({
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

          {/** در اینجا با استفاده از PostPickerList جدید، پروژه‌ها را در metaType5 نگه می‌داریم */}
          <PostPickerList
            sourceType="projects"
            initialMetaType={metaTypesLookUp.metaType5}
            metaFieldKey="metaType5"
            onMetaChange={(updatedObj) => {
              // مثلاً updatedObj = { metaType5: "2|5|10" }
              updateMeta(updatedObj);
            }}
            label="Default Projects"
            fullWidth
          />
        </div>

        {/* ستون سمت راست */}
        <div className="flex flex-col space-y-6 w-1/2">
          {/* نحوهٔ نمایش گزینه‌ها */}
          <div className="space-y-2">
            <label className="block font-medium">Display choices using:</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayType"
                  value="drop"
                  checked={metaTypesLookUp.metaType3 === "drop"}
                  onChange={() => handleDisplayTypeChange("drop")}
                />
                Drop-Down Menu
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayType"
                  value="radio"
                  checked={metaTypesLookUp.metaType3 === "radio"}
                  onChange={() => handleDisplayTypeChange("radio")}
                />
                Radio Buttons
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayType"
                  value="check"
                  checked={metaTypesLookUp.metaType3 === "check"}
                  onChange={() => handleDisplayTypeChange("check")}
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

      {/* جدول فیلترها (اطلاعات metaType4) */}
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
                  values: srcFieldList.map((f: any) =>
                    f.ID ? String(f.ID) : ""
                  ),
                },
                valueFormatter: (params: any) => {
                  const matched = srcFieldList.find(
                    (f: any) => String(f.ID) === String(params.value)
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
                  values: desFieldList.map((f: any) =>
                    f.ID ? String(f.ID) : ""
                  ),
                },
                valueFormatter: (params: any) => {
                  const matched = desFieldList.find(
                    (f: any) => String(f.ID) === String(params.value)
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
            onAdd={handleAddNewRow}
            onEdit={() => {}}
            onDelete={() => {}}
            onDuplicate={() => {}}
            onCellValueChanged={handleCellValueChanged}
            domLayout="normal"
            showSearch={false}
            onRowDoubleClick={function (data: any): void {
              throw new Error("Function not implemented.");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LookUpForms;
