// src/components/DynamicDialog.tsx
import React, { useEffect, useRef, useState } from "react";
import DataTable from "../TableDynamic/DataTable";
import DynamicInput from "../utilities/DynamicInput";

interface DynamicDialogProps {
  onClose: () => void;
  onRowSelect: (data: any) => void;
  onSelectFromButton: (data: any) => void;
}

const DynamicDialog: React.FC<DynamicDialogProps> = ({
  onClose,
  onRowSelect,
  onSelectFromButton,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

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
    setSelectedRow(data);
    onRowSelect(data);
  };

  const handleRowClick = (data: any) => {
    setSelectedRow(data);
  };

  const handleSelectButtonClick = () => {
    if (selectedRow) {
      onSelectFromButton(selectedRow);
      closeModal();
    }
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Duration matches CSS transition
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dialogRef.current &&
      !dialogRef.current.contains(event.target as Node)
    ) {
      closeModal();
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.showModal();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isSelectDisabled = !selectedRow;

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      closeModal();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={`modal backdrop-blur-sm transition-all duration-300 transform ${
        isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
      onClick={handleDialogClick}
    >
      <div
        className={`modal-box w-11/12 max-w-5xl relative bg-white rounded-lg p-6 transform transition-transform duration-300 ${
          isClosing ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <button
          className="absolute top-4 right-4 btn btn-error btn-sm"
          onClick={closeModal}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mt-12">
          <DataTable
            columnDefs={columnDefs}
            rowData={rowData}
            onRowDoubleClick={handleRowDoubleClick}
            setSelectedRowData={handleRowClick}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-12">
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

        <div className="modal-action justify-center mt-6 space-x-4">
          <button
            className={`btn w-48 ${
              isSelectDisabled
                ? "bg-blue-300 text-gray-500 cursor-not-allowed"
                : "btn-primary"
            }`}
            onClick={handleSelectButtonClick}
            disabled={isSelectDisabled}
          >
            Select
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default DynamicDialog;
