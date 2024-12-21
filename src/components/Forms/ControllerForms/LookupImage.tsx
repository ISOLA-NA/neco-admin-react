// LookupUmage.tsx

import React, { useState, useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector"; // اطمینان حاصل کنید که مسیر صحیح است
import DataTable from "../../TableDynamic/DataTable"; // اطمینان حاصل کنید که مسیر صحیح است

const LookupUmage: React.FC = () => {
  // وضعیت برای Selectors
  const [infoSource, setInfoSource] = useState<string>(""); // مقدار انتخاب‌شده برای "Get Information From"
  const [displayColumn, setDisplayColumn] = useState<string>(""); // مقدار انتخاب‌شده برای "What Column To Display"
  const [removeSameName, setRemoveSameName] = useState<boolean>(false); // وضعیت چک‌باکس "Remove Same Name"

  // وضعیت برای Lookup Table
  const [lookupData, setLookupData] = useState<any[]>([]); // آرایه‌ای از اشیاء با فیلدهای مورد نیاز
  const [selectedLookupRow, setSelectedLookupRow] = useState<number | null>(
    null
  );

  // داده‌های تیبل سلکتور (برای مثال، اگر نیاز به انتخاب‌های خاصی دارید)
  const columnDefs = [{ headerName: "Position", field: "position" }];

  const rowData = [
    { position: "POS1" },
    { position: "POS2" },
    { position: "POS3" },
    { position: "POS4" },
  ];

  // تعریف ستون‌ها برای Lookup Table با srcField و desField به عنوان ویرایشگرهای انتخاب
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
    if (displayColumn) {
      const updatedLookupData = lookupData.map((row) => ({
        ...row,
        srcField: displayColumn,
        desField: displayColumn,
      }));
      setLookupData(updatedLookupData);
    }
  }, [displayColumn]);

  // هندلرها برای عملیات Lookup Table
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
      <div className="flex flex-col gap-6">
        {/* Get Information From */}
        <DynamicSelector
          name="infoSource"
          options={[
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
            { value: "option3", label: "Option 3" },
          ]}
          selectedValue={infoSource}
          onChange={(e) => setInfoSource(e.target.value)}
          label="Get Information From"
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

        {/* Remove Same Name */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="removeSameName"
            checked={removeSameName}
            onChange={(e) => setRemoveSameName(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="removeSameName" className="font-medium">
            Remove Same Name
          </label>
        </div>
      </div>

      {/* بخش پایینی: Lookup Table */}
      <div className="-mt-1">
        <DataTable
          columnDefs={lookupColumnDefs}
          rowData={lookupData}
          onRowDoubleClick={(data) => {
            // امکان ویرایش سطر با دوبار کلیک
            // اینجا می‌توانید یک مودال باز کنید یا ویرایش درون خطی را فعال کنید
          }}
          setSelectedRowData={(data) => {
            const rowIndex = lookupData.findIndex((row) => row === data);
            setSelectedLookupRow(rowIndex !== -1 ? rowIndex : null);
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

export default LookupUmage;
