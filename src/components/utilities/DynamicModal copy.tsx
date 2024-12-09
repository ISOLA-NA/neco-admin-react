// src/utilities/DynamicModal.tsx
import React, { useEffect, useRef } from "react";
import DataTable from "../TableDynamic/DataTable";

interface DynamicModalProps {
  onClose: () => void;
  onSelect: (selectedName: string) => void;
  modalOpen: boolean;
  setSelectedRowData: (data: any) => void;
  selectedRowData: any;
  rowData: any[]; // List of rows to display
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  onClose,
  onSelect,
  modalOpen,
  setSelectedRowData,
  selectedRowData,
  rowData,
}) => {
  const columnDefs = [
    { field: "Name", headerName: "Name" },
    { field: "Description", headerName: "Description" },
  ];

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const handleRowDoubleClick = (data: any) => {
    onSelect(data.Name); // Send selected row's Name to onSelect
    onClose(); // Close modal
  };

  const handleSelectClick = () => {
    if (selectedRowData) {
      onSelect(selectedRowData.Name); // Send selected row's Name
      onClose(); // Close modal
    }
  };

  useEffect(() => {
    if (modalOpen && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (dialogRef.current) {
      dialogRef.current.close();
    }
  }, [modalOpen]);

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box" style={{ width: "500px", height: "400px" }}>
        <h3 className="font-bold text-lg mb-4 text-[#7e3af2]">
          Select an Item
        </h3>

        <div style={{ height: "250px" }}>
          <DataTable
            columnDefs={columnDefs}
            rowData={rowData} // Pass list of rows
            onRowDoubleClick={handleRowDoubleClick} // Double click to select
            setSelectedRowData={setSelectedRowData} // Update selected row on click
          />
        </div>

        <div className="modal-action mt-4">
          <button
            type="button"
            className="btn bg-[#7e3af2] text-white hover:bg-[#6366f1]"
            onClick={handleSelectClick} // Select on button click
            disabled={!selectedRowData} // Disable if no row is selected
          >
            Select
          </button>
          <button
            className="btn bg-[#f3f4f6] text-[#6366f1] hover:bg-[#e5e7eb]"
            onClick={onClose} // Close modal
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default DynamicModal;
