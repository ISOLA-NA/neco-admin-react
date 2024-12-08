// src/components/DynamicModal.tsx
import React, { useRef, useEffect } from "react";
import DataTable from "../TableDynamic/DataTable";

interface DynamicModalProps {
  onClose: () => void;
  onSelect: (selectedName: string) => void;
  selectedRowData: any;
  setSelectedRowData: (data: any) => void;
  modalOpen: boolean;
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  onClose,
  onSelect,
  selectedRowData,
  setSelectedRowData,
  modalOpen,
}) => {
  const columnDefs = [
    { field: "Name", headerName: "Name" },
    { field: "Description", headerName: "Description" },
  ];

  const rowData = [
    { Name: "Item 1", Description: "Description of Item 1" },
    { Name: "Item 2", Description: "Description of Item 2" },
    { Name: "Item 3", Description: "Description of Item 3" },
  ];

  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleRowDoubleClick = (data: any) => {
    onSelect(data.Name);
  };

  const handleSelectClick = () => {
    if (selectedRowData && selectedRowData.Name) {
      onSelect(selectedRowData.Name);
    }
  };

  useEffect(() => {
    if (modalOpen && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [modalOpen]);

  const handleClose = () => {
    if (dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
    onClose();
  };

  return (
    <dialog
      id="my_modal_5"
      className="modal modal-bottom sm:modal-middle"
      ref={dialogRef}
    >
      <div className="modal-box" style={{ width: "500px", height: "400px" }}>
        {/* عنوان مدال */}
        <h3 className="font-bold text-lg mb-4 text-[#7e3af2]">
          Select an Item
        </h3>

        {/* جدول داده‌ها */}
        <div style={{ height: "250px" }}>
          <DataTable
            columnDefs={columnDefs}
            rowData={rowData}
            onRowDoubleClick={handleRowDoubleClick}
            setSelectedRowData={setSelectedRowData}
          />
        </div>

        {/* دکمه‌های مدال */}
        <div className="modal-action mt-4">
          <button
            type="button"
            className="btn bg-[#7e3af2] text-white hover:bg-[#6366f1]"
            onClick={handleSelectClick}
          >
            Select
          </button>
          <button
            className="btn bg-[#f3f4f6] text-[#6366f1] hover:bg-[#e5e7eb]"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default DynamicModal;
