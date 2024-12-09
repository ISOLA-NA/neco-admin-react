// src/utilities/DynamicModal.tsx
import React, { useEffect, useRef } from "react";
import DataTable from "../TableDynamic/DataTable";
import DynamicInput from "../utilities/DynamicInput";

interface DynamicModalProps {
  onClose: () => void;
  onSelect: (selectedData: any) => void;
  modalOpen: boolean;
  setSelectedRowData: (data: any) => void;
  selectedRowData: any;
  rowData: any[]; // لیست ردیف‌ها برای نمایش
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
    { headerName: "ID", field: "id" },
    { headerName: "Name", field: "name" },
    { headerName: "Description", field: "description" },
  ];

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const handleRowDoubleClick = (data: any) => {
    onSelect(data); // ارسال داده کامل ردیف انتخاب شده به onSelect
    onClose(); // بستن مدال
  };

  const handleSelectClick = () => {
    if (selectedRowData) {
      onSelect(selectedRowData); // ارسال داده کامل ردیف انتخاب شده
      onClose(); // بستن مدال
    }
  };

  // افزودن ورودی‌های دینامیک مشابه DynamicDialog
  const [inputValues, setInputValues] = React.useState({
    input1: "",
    input2: "",
    input3: "",
    input4: "",
  });

  const handleInputChange = (name: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (modalOpen && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (dialogRef.current) {
      dialogRef.current.close();
    }
  }, [modalOpen]);

  return (
    <dialog ref={dialogRef} className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl">
        {/* بخش جدول */}
        <div className="mb-6">
          <DataTable
            columnDefs={columnDefs}
            rowData={rowData} // ارسال لیست ردیف‌ها
            onRowDoubleClick={handleRowDoubleClick} // دابل کلیک برای انتخاب
            setSelectedRowData={setSelectedRowData} // بروزرسانی ردیف انتخاب شده در هنگام کلیک
          />
        </div>

        {/* بخش دکمه‌ها */}
        <div className="modal-action justify-between">
          <button
            className="btn bg-[#7e3af2] text-white hover:bg-[#6366f1]"
            onClick={handleSelectClick}
            disabled={!selectedRowData}
          >
            انتخاب
          </button>
          <button
            className="btn bg-[#f3f4f6] text-[#6366f1] hover:bg-[#e5e7eb]"
            onClick={onClose}
          >
            بستن
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default DynamicModal;
