import React from "react";
import DynamicModal from "../utilities/DynamicModal";
import { classNames } from "primereact/utils";

interface ListSelectorProps {
  title: string;
  className?: string;
  columnDefs: any[];
  rowData?: { ID: string | number; Name: string }[];
  selectedIds: (string | number)[];
  onSelectionChange: (selectedIds: (string | number)[]) => void;
  showSwitcher?: boolean;
  isGlobal: boolean;
  onGlobalChange?: (isGlobal: boolean) => void;
  ModalContentComponent: React.FC<any>;
  modalContentProps?: any;
  loading?: boolean; // پروپ بارگذاری اضافه شده
}

const ListSelector: React.FC<ListSelectorProps> = ({
  title,
  className,
  columnDefs,
  rowData = [],
  selectedIds,
  onSelectionChange,
  showSwitcher = false,
  isGlobal = false,
  onGlobalChange,
  ModalContentComponent,
  modalContentProps = {},
  loading = false, // پیش‌فرض بارگذاری false
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);

  const handleRowSelect = (data: any) => {
    const id = data.ID;
    if (!selectedIds.includes(id)) {
      onSelectionChange([...selectedIds, id]);
    }
    setIsDialogOpen(false);
    setSelectedRow(null);
  };

  const handleRemoveName = (id: string | number) => {
    onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
  };

  // دریافت اسامی انتخاب شده
  const selectedNames = rowData
    .filter((row) => selectedIds.includes(row.ID))
    .map((row) => row.Name);

  return (
    <div className={classNames("w-full", className)}>
      <div className="flex justify-between items-center p-2 rounded-t-md bg-gradient-to-r from-purple-600 to-indigo-500 h-10">
        <div className="flex items-center gap-2">
          {showSwitcher && (
            <>
              <input
                type="checkbox"
                className="toggle toggle-info"
                checked={isGlobal}
                onChange={() => onGlobalChange && onGlobalChange(!isGlobal)}
                aria-label="Global Switch"
              />
              <span className="text-white text-xs">Global</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-white">{title}</h3>
          <button
  className={classNames(
    "bg-purple-600 text-white px-1 py-1 rounded text-xs transition-colors duration-300 h-7 w-7 flex items-center justify-center",
    "hover:bg-purple-500",
    isGlobal ? "disabled:opacity-50 disabled:cursor-not-allowed" : ""
  )}
  onClick={() => setIsDialogOpen(true)}
  aria-label={`افزودن ${title}`}
  disabled={isGlobal}
>
  +
</button>

        </div>
      </div>

      <div className="relative h-32 overflow-y-auto bg-gray-200 rounded-b-md p-3">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <svg
              className="animate-spin h-5 w-5 text-purple-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          </div>
        ) : selectedNames.length === 0 ? (
          <p className="text-gray-500 text-xs text-center">
            هیچ آیتمی انتخاب نشده است
          </p>
        ) : (
          <div className="space-y-2">
            {selectedNames.map((name, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                <span className="text-gray-700 text-xs">{name}</span>
                <button
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  onClick={() => {
                    const row = rowData.find((r) => r.Name === name);
                    if (row) handleRemoveName(row.ID);
                  }}
                  aria-label={`حذف ${name}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
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

      <DynamicModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      >
        <ModalContentComponent
          {...modalContentProps}
          columnDefs={columnDefs}
          rowData={rowData}
          selectedRow={selectedRow}
          onRowDoubleClick={(row: any) => {
            handleRowSelect(row);
          }}
          onRowClick={(row: any) => {
            setSelectedRow(row);
          }}
          onSelectButtonClick={() => {
            if (selectedRow) handleRowSelect(selectedRow);
          }}
          isSelectDisabled={!selectedRow}
        />
      </DynamicModal>
    </div>
  );
};

export default ListSelector;
