import React, { useEffect, useRef, useState } from "react";
import DataTable from "../TableDynamic/DataTable";

interface DynamicModalProps {
  onClose: () => void;
  onSelect: (selectedData: any) => void;
  modalOpen: boolean;
  rowData: any[]; // لیست داده‌های جدول
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  onClose,
  onSelect,
  modalOpen,
  rowData,
}) => {
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const columnDefs = [
    { field: "Name", headerName: "نام" },
    { field: "Description", headerName: "توضیحات" },
  ];

  // مدیریت دابل کلیک روی ردیف
  const handleRowDoubleClick = (data: any) => {
    setSelectedRow(data);
    onSelect(data); // ارسال اطلاعات ردیف به تابع onSelect
    handleClose(); // بستن دیالوگ
  };

  // مدیریت انتخاب یک ردیف
  const handleRowClick = (data: any) => {
    setSelectedRow(data);
  };

  // مدیریت کلیک روی دکمه انتخاب
  const handleSelectClick = () => {
    if (selectedRow) {
      onSelect(selectedRow); // ارسال اطلاعات ردیف به تابع onSelect
      handleClose(); // بستن دیالوگ
    }
  };

  // باز و بسته کردن دیالوگ
  useEffect(() => {
    if (modalOpen && dialogRef.current) {
      setSelectedRow(null); // بازنشانی انتخاب ردیف
      dialogRef.current.showModal();
    } else if (dialogRef.current) {
      dialogRef.current.close();
    }
  }, [modalOpen]);

  // بسته شدن دیالوگ با کلیک خارج از آن
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  // بستن دیالوگ
  const handleClose = () => {
    setSelectedRow(null); // بازنشانی انتخاب
    onClose(); // فراخوانی تابع بستن
  };

  const isSelectDisabled = !selectedRow;

  return (
    <dialog
      ref={dialogRef}
      className={`modal backdrop-blur-sm transition-all duration-300 transform ${
        modalOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      onClick={handleDialogClick}
    >
      <div
        className="modal-box w-11/12 max-w-5xl bg-white rounded-lg p-6 relative"
      >
        {/* دکمه بستن */}
        <button
          className="absolute top-4 right-4 btn btn-error btn-sm"
          onClick={handleClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* جدول داده‌ها */}
        <div className="mt-12">
          <DataTable
            columnDefs={columnDefs}
            rowData={rowData}
            onRowDoubleClick={handleRowDoubleClick}
            setSelectedRowData={handleRowClick}
          />
        </div>

        {/* دکمه انتخاب */}
        <div className="modal-action justify-center mt-6 space-x-4">
          <button
            className={`btn w-48 ${
              isSelectDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "btn-primary"
            }`}
            onClick={handleSelectClick}
            disabled={isSelectDisabled}
          >
            انتخاب
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default DynamicModal;
