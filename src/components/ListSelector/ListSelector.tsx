// src/components/ListSelector/ListSelector.tsx
import React, { useState } from "react";
import DynamicModal from "../utilities/DynamicModal"; // وارد کردن صحیح
import ButtonComponent from "../General/Configuration/ButtonComponent"; // وارد کردن صحیح
import { classNames } from "primereact/utils";

interface ListSelectorProps {
  title: string;
  className?: string; // افزودن پراپ className
}

const ListSelector: React.FC<ListSelectorProps> = ({ title, className }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // تعریف ستون‌ها و داده‌های جدول (می‌توانید این‌ها را از پراپ‌ها یا API دریافت کنید)
  const columnDefs = [
    { headerName: "نام", field: "name" },
    { headerName: "سن", field: "age" },
    // ستون‌های دیگر
  ];

  const rowData = [
    { name: "جان دو", age: 30 },
    { name: "جین اسمیت", age: 25 },
    // داده‌های دیگر
  ];

  const handleRowSelect = (data: any) => {
    const name = data.name;
    if (!selectedNames.includes(name)) {
      setSelectedNames([...selectedNames, name]);
    }
    setIsDialogOpen(false);
    setSelectedRow(null);
  };

  const handleRemoveName = (name: string) => {
    setSelectedNames(selectedNames.filter((n) => n !== name));
  };

  const handleRowClick = (data: any) => {
    setSelectedRow(data);
  };

  const handleSelectFromButton = (data: any, state: string, image?: File) => {
    handleRowSelect(data);
  };

  const handleSelectButtonClick = () => {
    if (selectedRow) {
      handleRowSelect(selectedRow);
    }
  };

  return (
    <div className={classNames("w-full", className)}>
      {/* هدر */}
      <div className="flex justify-between items-center p-2 rounded-t-md bg-gradient-to-r from-purple-600 to-indigo-500 h-10">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <button
          className="btn btn-sm btn-primary text-white bg-purple-600 hover:bg-indigo-500 px-2 py-1 rounded-md flex-shrink-0 h-6 w-6 flex items-center justify-center text-sm transition-colors duration-300"
          onClick={() => setIsDialogOpen(true)}
          aria-label={`افزودن ${title}`}
        >
          +
        </button>
      </div>

      {/* محتوای انتخاب شده‌ها */}
      <div className="h-32 overflow-y-auto bg-gray-50 rounded-b-md p-3">
        {selectedNames.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">
            هیچ آیتمی انتخاب نشده است
          </p>
        ) : (
          <div className="space-y-2">
            {selectedNames.map((name, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                <span className="text-gray-700">{name}</span>
                <button
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  onClick={() => handleRemoveName(name)}
                  aria-label={`حذف ${name}`}
                >
                  {/* استفاده از آیکون ضربدر */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95a1 1 0 011.414-1.414L10 8.586z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* دیالوگ با استفاده از ButtonComponent */}
      <DynamicModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      >
        <ButtonComponent
          columnDefs={[
            { headerName: "نام", field: "name" },
            { headerName: "سن", field: "age" },
          ]}
          rowData={rowData}
          onClose={() => setIsDialogOpen(false)}
          onRowSelect={handleRowSelect}
          onSelectFromButton={handleSelectFromButton}
        />
      </DynamicModal>
    </div>
  );
};

export default ListSelector;
