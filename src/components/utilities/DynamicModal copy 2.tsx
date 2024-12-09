// src/utilities/DynamicModal.tsx
import React, { useEffect, useRef } from "react";
import DataTable from "../TableDynamic/DataTable";

interface DynamicModalProps {
  onClose: () => void;
  onSelect: (selectedName: string) => void;
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
    { field: "Name", headerName: "نام" },
    { field: "Description", headerName: "توضیحات" },
  ];

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const handleRowDoubleClick = (data: any) => {
    onSelect(data.Name); // ارسال نام ردیف انتخاب شده به onSelect
    onClose(); // بستن مدال
  };

  const handleSelectClick = () => {
    if (selectedRowData) {
      onSelect(selectedRowData.Name); // ارسال نام ردیف انتخاب شده
      onClose(); // بستن مدال
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
    <dialog ref={dialogRef} className="modal modal-open sm:modal-middle">
      <div className="modal-box w-11/12 max-w-5xl" >

        <div className="mb-6">
          <DataTable
            columnDefs={columnDefs}
            rowData={rowData} // ارسال لیست ردیف‌ها
            onRowDoubleClick={handleRowDoubleClick} // دابل کلیک برای انتخاب
            setSelectedRowData={setSelectedRowData} // بروزرسانی ردیف انتخاب شده در هنگام کلیک
          />
        </div>

        <div className="modal-action mt-4">
          <button
            type="button"
            className="btn bg-[#7e3af2] text-white hover:bg-[#6366f1]"
            onClick={handleSelectClick} // انتخاب با کلیک روی دکمه
            disabled={!selectedRowData} // غیرفعال اگر هیچ ردیفی انتخاب نشده باشد
          >
            انتخاب
          </button>
          <button
            type="button"
            className="btn bg-[#f3f4f6] text-[#6366f1] hover:bg-[#e5e7eb]"
            onClick={onClose} // بستن مدال
          >
            بستن
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default DynamicModal;
