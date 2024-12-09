// src/components/DynamicDialog.tsx
import React from "react";
import DataTable from "../TableDynamic/DataTable";
import DynamicInput from "../utilities/DynamicInput";

interface DynamicDialogProps {
  onClose: () => void;
  onRowSelect: (data: any) => void;
  onSelectFromButton: (data: any) => void; // دریافت تابع از ListSelector
}

const DynamicDialog: React.FC<DynamicDialogProps> = ({
  onClose,
  onRowSelect,
  onSelectFromButton, // استفاده از تابع
}) => {
  const columnDefs = [
    { headerName: "ID", field: "id" },
    { headerName: "Name", field: "name" },
  ];

  const rowData = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
    { id: 4, name: "Item 4" },
  ];

  const handleRowDoubleClick = (data: any) => {
    onRowSelect(data);
  };

  // تابع جدید برای اجرای انتخاب از دکمه
  const handleSelectButtonClick = (data: any) => {
    onSelectFromButton(data);
  };

  return (
    <dialog id="dynamic_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl">
        {/* Table Section */}
        <div className="mb-6">
          <DataTable
            columnDefs={columnDefs}
            rowData={rowData}
            onRowDoubleClick={handleRowDoubleClick}
            setSelectedRowData={() => {}}
          />
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-2 gap-4">
          <DynamicInput
            name="Input 1"
            type="text"
            value=""
            onChange={() => {}}
          />
          <DynamicInput
            name="Input 2"
            type="text"
            value=""
            onChange={() => {}}
          />
          <DynamicInput
            name="Input 3"
            type="number"
            value=""
            onChange={() => {}}
          />
          <DynamicInput
            name="Input 4"
            type="text"
            value=""
            onChange={() => {}}
          />
        </div>

        {/* Action Buttons */}
        <div className="modal-action justify-between mt-6">
          <button className="btn" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleSelectButtonClick(rowData[0])} // مثال: انتخاب اولین ردیف
          >
            Select
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default DynamicDialog;
