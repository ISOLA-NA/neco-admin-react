// src/components/ControllerForms/TableController.tsx
import React, { useState, useEffect, useRef } from "react";
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
}

const TableController: React.FC<TableControllerProps> = ({
  onMetaChange,
  data,
}) => {
  // ثابت: عناوین ستون‌ها (a1, a2, a3)
  const fixedHeaders = [
    { headerName: "a1", field: "a1" },
    { headerName: "a2", field: "a2" },
    { headerName: "a3", field: "a3" },
  ];

  // تابعی برای مرتب‌سازی یک ردیف دریافتی طبق fixedHeaders
  const reorderRow = (row: any): Record<string, any> => {
    const newRow: Record<string, any> = {};
    fixedHeaders.forEach((header) => {
      newRow[header.field] = row[header.field] || "";
    });
    return newRow;
  };

  // در حالت ادیت، اگر metaType3 موجود باشد، داده‌ها پارس شده و به همراه یک شناسه (id) به آرایه تبدیل می‌شوند.
  const initialTableData: Record<string, any>[] =
    data?.metaType3 && data.metaType3.trim() !== ""
      ? JSON.parse(data.metaType3).map((row: any, index: number) => ({
          ...reorderRow(row),
          id: index,
        }))
      : [];

  // نگهداری شمارنده برای id ردیف‌های جدید
  const nextRowId = useRef(initialTableData.length);

  // تکست اریا: اگر metaType1 موجود نباشد، پیش‌فرض "a1\na2\na3" در نظر گرفته می‌شود.
  const initialTextarea = data?.metaType1
    ? data.metaType1
    : fixedHeaders.map((h) => h.field).join("\n");

  const [isRowFixed, setIsRowFixed] = useState<boolean>(
    data?.metaType2 ? true : false
  );
  const [fixRowValue, setFixRowValue] = useState<string>(data?.metaType2 || "");
  const [textareaValue, setTextareaValue] = useState<string>(initialTextarea);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [tableData, setTableData] =
    useState<Record<string, any>[]>(initialTableData);

  // به‌روزرسانی meta هر زمان که مقادیر تغییر کنند
  useEffect(() => {
    // metaType1: همان متنی که در تکست اریا نوشته شده (با جداکننده "\n")
    const computedMeta1 = textareaValue
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "")
      .join("\n");

    // metaType2: مقدار Fix Row (اگر تیک انتخاب شده باشد)
    const computedMeta2 = isRowFixed ? fixRowValue : "";

    // فیلتر کردن ردیف‌هایی که همه سلول‌هایشان خالی است
    const filteredTableData = tableData.filter((row) =>
      fixedHeaders.some((header) => row[header.field]?.toString().trim() !== "")
    );

    // metaType3: ساخت ردیف‌های جدول با کلیدهای ثابت a1، a2 و a3 (id در خروجی لحاظ نمی‌شود)
    const computedMeta3 = JSON.stringify(
      filteredTableData.map((row) => {
        const newRow: Record<string, any> = {};
        fixedHeaders.forEach((header) => {
          newRow[header.field] = row[header.field];
        });
        return newRow;
      })
    );

    if (onMetaChange) {
      onMetaChange({
        metaType1: computedMeta1,
        metaType2: computedMeta2,
        metaType3: computedMeta3,
      });
    }
  }, [
    isRowFixed,
    fixRowValue,
    textareaValue,
    tableData,
    onMetaChange,
    fixedHeaders,
  ]);

  // تغییر وضعیت تیک Fix Row
  const handleFixRowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsRowFixed(e.target.checked);
  };

  // تغییر مقدار ورودی Fix Row
  const handleFixRowValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFixRowValue(e.target.value);
  };

  // تغییر مقدار تکست اریا (عنوان ستون‌ها)
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
  };

  // باز کردن مودال جدول
  const handleDefValClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  // بستن مودال جدول (دکمه Save)
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // افزودن ردیف جدید به جدول با کلیدهای ثابت (a1, a2, a3)
  const handleAddRow = () => {
    const newRow: Record<string, any> = { id: nextRowId.current };
    fixedHeaders.forEach((header) => {
      newRow[header.field] = "";
    });
    nextRowId.current += 1;
    setTableData([...tableData, newRow]);
  };

  // تغییر مقدار سلول‌های جدول
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
            <input
              type="checkbox"
              checked={isRowFixed}
              onChange={handleFixRowChange}
            />
            <span>Fix Row</span>
          </label>
          <DynamicInput
            name="FixRowValue"
            type="number"
            value={fixRowValue}
            onChange={handleFixRowValueChange}
          />
        </div>

        {/* تکست اریا برای عنوان ستون‌ها */}
        <CustomTextarea
          name="columnTitles"
          value={textareaValue}
          onChange={handleTextareaChange}
          placeholder="Enter each column title on a separate line"
          rows={3}
        />

        {/* دکمه Def Val */}
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
              columnDefs={fixedHeaders.map((header) => ({
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
              showAddNew={false} // غیرفعال کردن اضافه شدن خودکار ردیف خالی
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
