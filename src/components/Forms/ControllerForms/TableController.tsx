// src/components/TableController.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import CustomTextarea from "../../utilities/DynamicTextArea";
import DynamicModal from "../../utilities/DynamicModal";
import DataTable from "../../TableDynamic/DataTable";

interface TableControllerProps {
  onMetaChange?: (meta: {
    metaType1: string;
    metaType2: string;
    metaType3: string;
  }) => void;
  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
  };
};

// تابع تولید هدرها: اگر رشته دارای delimiter "|" باشد، آن را تقسیم می‌کند؛ در غیر این صورت fallback به تقسیم مساوی
const getHeadersFromMeta = (meta: string) => {
  if (meta.includes("|")) {
    const parts = meta.split("|").filter((part) => part.trim() !== "");
    return parts.map((p, i) => ({ headerName: p, field: `a${i + 1}` }));
  }
  const columns = 3;
  const trimmed = meta.trim();
  if (trimmed.length % columns === 0 && trimmed.length !== 0) {
    const partLength = trimmed.length / columns;
    const parts: string[] = [];
    for (let i = 0; i < columns; i++) {
      parts.push(trimmed.substring(i * partLength, (i + 1) * partLength));
    }
    return [
      { headerName: parts[0], field: "a1" },
      { headerName: parts[1], field: "a2" },
      { headerName: parts[2], field: "a3" },
    ];
  }
  return [
    { headerName: "a1", field: "a1" },
    { headerName: "a2", field: "a2" },
    { headerName: "a3", field: "a3" },
  ];
};

const TableController: React.FC<TableControllerProps> = ({ onMetaChange, data }) => {
  // مقدار اولیه هدرها از data.metaType1 (با newlineها) یا مقدار پیش‌فرض
  const initialMetaType1 = data?.metaType1 ? data.metaType1 : "a\nb\nc";
  const [displayHeaderInput, setDisplayHeaderInput] = useState<string>(initialMetaType1);

  // برای تولید هدرهای جدول، متن multiline را به صورت delimiter "|" تبدیل می‌کنیم.
  const computedHeaderForTable = displayHeaderInput.replace(/\n/g, "|");
  const dynamicHeaders = useMemo(() => getHeadersFromMeta(computedHeaderForTable), [computedHeaderForTable]);

  // Fix Row
  const [isRowFixed, setIsRowFixed] = useState<boolean>(!!data?.metaType2);
  const [fixRowValue, setFixRowValue] = useState<string>(data?.metaType2 || "");

  // داده‌های جدول: اگر data.metaType3 موجود باشد، آن را به صورت JSON پارس می‌کنیم.
  let initialTableData: Record<string, any>[] = [];
  if (data?.metaType3 && data.metaType3.trim() !== "") {
    try {
      initialTableData = JSON.parse(data.metaType3).map((row: any, index: number) => ({
        ...row,
        id: index,
      }));
    } catch (err) {
      console.error("Error parsing data.metaType3 JSON:", err);
      initialTableData = [];
    }
  }
  const [tableData, setTableData] = useState<Record<string, any>[]>(initialTableData);
  const nextRowId = useRef(initialTableData.length);

  // به‌روزرسانی metaها: در اینجا metaType1 همان متن multiline (با \n) حفظ می‌شود.
  useEffect(() => {
    const computedMeta1 = displayHeaderInput.trim(); // newlineها حفظ می‌شوند
    const computedMeta2 = isRowFixed ? fixRowValue : "";
    const filteredTableData = tableData.filter((row) =>
      ["a1", "a2", "a3"].some((key) => row[key]?.toString().trim() !== "")
    );
    const computedMeta3 = JSON.stringify(
      filteredTableData.map((row) => ({
        a1: row.a1,
        a2: row.a2,
        a3: row.a3,
      }))
    );
    if (onMetaChange) {
      onMetaChange({
        metaType1: computedMeta1,
        metaType2: computedMeta2,
        metaType3: computedMeta3,
      });
    }
  }, [isRowFixed, fixRowValue, displayHeaderInput, tableData, onMetaChange]);

  const handleFixRowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsRowFixed(e.target.checked);
  };

  const handleFixRowValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFixRowValue(e.target.value);
  };

  // تغییر ورودی تکست اریا: مقدار وارد شده را به صورت multiline نگه می‌دارد.
  const handleHeaderInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDisplayHeaderInput(e.target.value);
  };

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const handleDefValClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAddRow = () => {
    const newRow: Record<string, any> = { id: nextRowId.current, a1: "", a2: "", a3: "" };
    nextRowId.current += 1;
    setTableData([...tableData, newRow]);
  };

  const handleCellChange = (event: any) => {
    const { rowIndex, colDef, newValue } = event;
    const updatedTableData = [...tableData];
    updatedTableData[rowIndex][colDef.field] = newValue;
    setTableData(updatedTableData);
  };

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex items-center justify-center">
      <div className="p-4">
        {/* Fix Row */}
        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={isRowFixed} onChange={handleFixRowChange} />
            <span>Fix Row</span>
          </label>
          <DynamicInput
            name="FixRowValue"
            type="number"
            value={fixRowValue}
            onChange={handleFixRowValueChange}
          />
        </div>

        {/* تکست اریا برای هدرهای جدول به صورت multiline */}
        <CustomTextarea
          name="columnTitles"
          value={displayHeaderInput}
          onChange={handleHeaderInputChange}
          placeholder="Enter each header on a new line"
          rows={displayHeaderInput.split("\n").length || 1}
        />

        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleDefValClick}
        >
          Def Val
        </button>

        {/* مودال جدول */}
        <DynamicModal isOpen={isModalOpen} onClose={handleModalClose}>
          <h2 className="text-lg font-bold mb-4">Dynamic Table</h2>
          <div style={{ height: "400px", overflow: "auto" }}>
            <DataTable
              columnDefs={getHeadersFromMeta(computedHeaderForTable).map((header) => ({
                headerName: header.headerName,
                field: header.field,
                editable: true,
              }))}
              rowData={tableData}
              onCellValueChanged={handleCellChange}
              onRowDoubleClick={() => {}}
              setSelectedRowData={() => {}}
              showAddIcon={false}
              showEditIcon={false}
              showDeleteIcon={false}
              showDuplicateIcon={false}
              onAdd={handleAddRow}
              onEdit={() => {}}
              onDelete={() => {}}
              onDuplicate={() => {}}
              showSearch={false}
              showAddNew={false}
              domLayout="autoHeight"
            />
            <div className="flex flex-col space-y-2 mt-4">
              <button
                type="button"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                onClick={handleAddRow}
              >
                Add New
              </button>
              <button
                type="button"
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
                onClick={handleModalClose}
              >
                Save
              </button>
            </div>
          </div>
        </DynamicModal>
      </div>
    </div>
  );
};

export default TableController;
