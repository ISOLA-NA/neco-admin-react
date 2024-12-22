// LookUpForms.tsx

import React, { useState, useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector"; // اطمینان حاصل کنید که مسیر صحیح است
import PostPickerList from "./PostPickerList"; // Ensure correct path
import DataTable from "../../TableDynamic/DataTable"; // Ensure correct path

const LookUpForms: React.FC = () => {
  const [infoSource, setInfoSource] = useState<string>(""); // مقدار انتخاب‌شده برای "Get information from"
  const [displayColumn, setDisplayColumn] = useState<string>(""); // مقدار انتخاب‌شده برای "What Column To Display"
  const [mode, setMode] = useState<string>(""); // مقدار انتخاب‌شده برای "Modes"
  const [defaultValues, setDefaultValues] = useState<string[][]>([[]]); // مقادیر انتخاب‌شده

  // وضعیت برای Lookup Table
  const [lookupData, setLookupData] = useState<any[]>([]); // آرایه‌ای از اشیاء با فیلدهای مورد نیاز
  const [selectedLookupRow, setSelectedLookupRow] = useState<any>(null);

  // داده‌های تیبل سلکتور
  const columnDefs = [{ headerName: "Position", field: "position" }];

  const rowData = [
    { position: "POS1" },
    { position: "POS2" },
    { position: "POS3" },
    { position: "POS4" },
  ];

  // Define columns for Lookup Table with srcField and desField as select editors
  const lookupColumnDefs = [
    {
      headerName: "Src Field",
      field: "srcField",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Column1", "Column2", "Column3"], // مقادیر دلخواه خود را وارد کنید
      },
    },
    {
      headerName: "Operation",
      field: "operation",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Equal", "NotEqual"],
      },
    },
    {
      headerName: "Filter Text",
      field: "filterText",
      editable: true,
    },
    {
      headerName: "Des Field",
      field: "desField",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Column1", "Column2", "Column3"], // مقادیر دلخواه خود را وارد کنید
      },
    },
  ];

  // به‌روزرسانی srcField و desField بر اساس displayColumn
  useEffect(() => {
    const updatedLookupData = lookupData.map((row) => ({
      ...row,
      srcField: displayColumn,
      desField: displayColumn,
    }));
    setLookupData(updatedLookupData);
  }, [displayColumn]);

  // Handlers for Lookup Table operations
  const handleAddLookup = () => {
    if (!displayColumn) {
      alert("لطفاً قبل از افزودن یک ستون برای نمایش، یک گزینه را انتخاب کنید.");
      return;
    }

    const newRow = {
      srcField: displayColumn,
      operation: "Equal",
      filterText: "",
      desField: displayColumn,
    };
    setLookupData([...lookupData, newRow]);
  };

  const handleEditLookup = () => {
    // اگر سطری انتخاب شده باشد، می‌توانید ویرایش کنید
    // با استفاده از ویرایش درون خطی در DataTable
  };

  const handleDeleteLookup = () => {
    if (selectedLookupRow !== null) {
      const updatedData = lookupData.filter(
        (_, index) => index !== selectedLookupRow
      );
      setLookupData(updatedData);
      setSelectedLookupRow(null);
    }
  };

  const handleDuplicateLookup = () => {
    if (selectedLookupRow !== null) {
      const rowToDuplicate = lookupData[selectedLookupRow];
      const duplicatedRow = { ...rowToDuplicate };
      setLookupData([...lookupData, duplicatedRow]);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded shadow-lg">
      {/* بخش بالایی: Selectors و تنظیمات */}
      <div className="flex gap-8">
        {/* بخش سمت چپ: Selectors */}
        <div className="flex flex-col space-y-6 w-1/2">
          {/* Get information from */}
          <DynamicSelector
            name="infoSource"
            options={[
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
              { value: "option3", label: "Option 3" },
            ]}
            selectedValue={infoSource}
            onChange={(e) => setInfoSource(e.target.value)}
            label="Get information from"
          />

          {/* What Column To Display */}
          <DynamicSelector
            name="displayColumn"
            options={[
              { value: "Column1", label: "Column 1" },
              { value: "Column2", label: "Column 2" },
              { value: "Column3", label: "Column 3" },
            ]}
            selectedValue={displayColumn}
            onChange={(e) => setDisplayColumn(e.target.value)}
            label="What Column To Display"
          />

          {/* Modes */}
          <DynamicSelector
            name="mode"
            options={[
              { value: "mode1", label: "Mode 1" },
              { value: "mode2", label: "Mode 2" },
              { value: "mode3", label: "Mode 3" },
            ]}
            selectedValue={mode}
            onChange={(e) => setMode(e.target.value)}
            label="Modes"
          />

          {/* Default Values Section */}
          <PostPickerList
            defaultValues={defaultValues}
            setDefaultValues={setDefaultValues}
            columnDefs={columnDefs}
            rowData={rowData}
          />
        </div>

        {/* بخش سمت راست: تنظیمات اضافی */}
        <div className="flex flex-col space-y-6 w-1/2">
          {/* Display choices using */}
          <div className="space-y-2">
            <label className="block font-medium">Display choices using:</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayType"
                  value="dropdown"
                  checked={false}
                  onChange={() => {}}
                />
                Drop-Down Menu
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayType"
                  value="radio"
                  checked={false}
                  onChange={() => {}}
                />
                Radio Buttons
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="displayType"
                  value="checkbox"
                  checked={false}
                  onChange={() => {}}
                />
                Checkboxes (allow multiple selections)
              </label>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={false} onChange={() => {}} />
              Remove Same Name
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={false} onChange={() => {}} />
              Old Lookup
            </label>
          </div>
        </div>
      </div>

      {/* بخش پایینی: Lookup Table */}
      <div className="-mt-1">
        <DataTable
          columnDefs={lookupColumnDefs}
          rowData={lookupData}
          onRowDoubleClick={() => {
            // امکان ویرایش سطر با دوبار کلیک
            // اینجا می‌توانید یک مودال باز کنید یا ویرایش درون خطی را فعال کنید
          }}
          setSelectedRowData={(data) => {
            const rowIndex = lookupData.findIndex((row) => row === data);
            setSelectedLookupRow(rowIndex);
          }}
          showDuplicateIcon={false}
          showEditIcon={false} // اگر ویرایش درون خطی دارید، نیازی به دکمه ویرایش نیست
          showAddIcon={false} // ما یک دکمه افزودن جداگانه خواهیم داشت
          showDeleteIcon={false}
          onAdd={handleAddLookup}
          onEdit={handleEditLookup}
          onDelete={handleDeleteLookup}
          onDuplicate={handleDuplicateLookup}
          domLayout="autoHeight"
          isRowSelected={selectedLookupRow !== null}
          showSearch={false} // اگر نیاز دارید می‌توانید فعال کنید
          showAddNew={true} // نمایش دکمه "Add New"
        />
      </div>
    </div>
  );
};

export default LookUpForms;
