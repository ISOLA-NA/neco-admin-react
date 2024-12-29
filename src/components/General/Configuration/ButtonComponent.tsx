// src/components/Configuration/ButtonComponent.tsx

import React, { useState, useRef } from "react";
import DataTable from "../../TableDynamic/DataTable";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicRadioGroup from "../../utilities/DynamicRadiogroup";
import TwoColumnLayout from "../../layout/TwoColumnLayout";
import DynamicButton from "../../utilities/DynamicButtons";

// Import FileUploadHandler and its ref type
import FileUploadHandler, {
  FileUploadHandlerRef,
} from "../../../services/FileUploadHandler";

interface ButtonComponentProps {
  columnDefs: { headerName: string; field: string }[];
  rowData: any[];
  onRowDoubleClick: (data: any) => void;
  onRowClick: (data: any) => void;
  onSelectButtonClick: () => void;
  isSelectDisabled: boolean;
  onClose: () => void;
  onSelectFromButton: () => void;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  columnDefs,
  rowData,
  onRowDoubleClick,
  onRowClick,
  onSelectButtonClick,
  isSelectDisabled,
  onClose,
  onSelectFromButton,
}) => {
  // ریف برای دسترسی به متدهای FileUploadHandler
  const fileUploadHandlerRef = useRef<FileUploadHandlerRef>(null);

  // گزینه‌های رادیو برای وضعیت
  const RadioOptionsState = [
    { value: "accept", label: "Accept" },
    { value: "reject", label: "Reject" },
    { value: "close", label: "Close" },
  ];

  const RadioOptionsCommand = [
    { value: "accept", label: "Accept" },
    { value: "reject", label: "Reject" },
    { value: "close", label: "Close" },
    { value: "client", label: "Previous State Client" },
    { value: "admin", label: "Previous State Admin" },
  ];

  // State management
  const [selectedState, setSelectedState] = useState<string>(
    RadioOptionsState[0].value
  );
  const [selectedCommand, setSelectedCommand] = useState<string>(
    RadioOptionsCommand[0].value
  );

  const [nameValue, setNameValue] = useState("");
  const [stateTextValue, setStateTextValue] = useState("");
  const [tooltipValue, setTooltipValue] = useState("");
  const [orderValue, setOrderValue] = useState("");

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isRowClicked, setIsRowClicked] = useState<boolean>(false);

  // توابع کمکی برای تبدیل مقادیر
  const mapWFStateForDeemedToRadio = (val: number) => {
    switch (val) {
      case 1:
        return "accept";
      case 2:
        return "reject";
      case 3:
        return "close";
      default:
        return "accept";
    }
  };

  const mapWFCommandToRadio = (val: number) => {
    switch (val) {
      case 1:
        return "accept";
      case 2:
        return "close";
      case 3:
        return "reject";
      case 4:
        return "client";
      case 5:
        return "admin";
      default:
        return "accept";
    }
  };

  // هندل کردن دوبار کلیک روی ردیف
  const handleRowDoubleClickLocal = (data: any) => {
    setSelectedRow(data);
    onRowDoubleClick(data);
  };

  // هندل کردن کلیک روی ردیف
  const handleRowClickLocal = async (data: any) => {
    setSelectedRow(data);
    onRowClick(data);
    setIsRowClicked(true);

    setNameValue(data.Name || "");
    setStateTextValue(data.StateText || "");
    setTooltipValue(data.Tooltip || "");
    setOrderValue(data.Order || "");

    if (data.WFStateForDeemed !== undefined) {
      setSelectedState(mapWFStateForDeemedToRadio(data.WFStateForDeemed));
    } else {
      setSelectedState(RadioOptionsState[0].value);
    }

    if (data.WFCommand !== undefined) {
      setSelectedCommand(mapWFCommandToRadio(data.WFCommand));
    } else {
      setSelectedCommand(RadioOptionsCommand[0].value);
    }

    // اگر ردیف دارای IconImageId باشد، تصویر را دانلود کن
    if (data.IconImageId) {
      try {
        await fileUploadHandlerRef.current?.handleFileDownload(data.IconImageId);
      } catch (err) {
        console.error("خطا در دانلود فایل", err);
      }
    } else {
      // اگر IconImageId خالی بود، پیش‌نمایش تصویر را پاک کن
      fileUploadHandlerRef.current?.clearDownloadedImage();
    }
  };

  // هندل کردن کلیک روی دکمه انتخاب
  const handleSelectButtonClickLocal = () => {
    onSelectButtonClick();
    onSelectFromButton();
    onClose();
    setIsRowClicked(false);
  };

  return (
    <div className="bg-white rounded-lg p-4 flex flex-col h-full">
      <div className="mb-4">
        <DataTable
          columnDefs={columnDefs}
          rowData={rowData}
          onRowDoubleClick={handleRowDoubleClickLocal}
          setSelectedRowData={handleRowClickLocal}
          showDuplicateIcon={false}
          onAdd={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onDuplicate={() => {}}
          domLayout="autoHeight"
        />
      </div>

      <TwoColumnLayout>
        <DynamicInput
          name="Name"
          type="text"
          value={nameValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNameValue(e.target.value)
          }
        />
        <DynamicInput
          name="State Text"
          type="text"
          value={stateTextValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setStateTextValue(e.target.value)
          }
        />
        <DynamicInput
          name="Tooltip"
          type="text"
          value={tooltipValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTooltipValue(e.target.value)
          }
        />
        <DynamicInput
          name="Order"
          type="text"
          value={orderValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setOrderValue(e.target.value)
          }
        />

        {/* گروه رادیو برای وضعیت */}
        <DynamicRadioGroup
          key={`state-${isRowClicked ? "controlled" : "uncontrolled"}`}
          title="State:"
          name="stateGroup"
          options={RadioOptionsState}
          selectedValue={selectedState}
          onChange={(value) => setSelectedState(value)}
          isRowClicked={isRowClicked}
        />

        {/* اتصال ref به FileUploadHandler */}
        <FileUploadHandler ref={fileUploadHandlerRef} />

        {/* گروه رادیو برای فرمان */}
        <DynamicRadioGroup
          key={`command-${isRowClicked ? "controlled" : "uncontrolled"}`}
          title="Command:"
          name="commandGroup"
          options={RadioOptionsCommand}
          selectedValue={selectedCommand}
          onChange={(value) => setSelectedCommand(value)}
          className="-mt-20"
          isRowClicked={isRowClicked}
        />
      </TwoColumnLayout>

      <div className="mt-4 flex justify-center">
        <DynamicButton
          text="Select"
          onClick={handleSelectButtonClickLocal}
          isDisabled={isSelectDisabled}
          className="w-48"
        />
      </div>
    </div>
  );
};

export default ButtonComponent;
