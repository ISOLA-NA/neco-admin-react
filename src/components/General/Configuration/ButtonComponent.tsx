// src/components/Configuration/ButtonComponent.tsx

import React, { useState, useRef } from "react";
import DataTable from "../../TableDynamic/DataTable"; // فرض بر این است که این کامپوننت وجود دارد
import DynamicInput from "../../utilities/DynamicInput"; // فرض بر این است که این کامپوننت وجود دارد
import DynamicRadioGroup from "../../utilities/DynamicRadiogroup"; // فرض بر این است که این کامپوننت وجود دارد
import TwoColumnLayout from "../../layout/TwoColumnLayout"; // فرض بر این است که این کامپوننت وجود دارد
import DynamicButton from "../../utilities/DynamicButtons"; // فرض بر این است که این کامپوننت وجود دارد

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
    try {
      // تنظیم ردیف انتخاب شده
      setSelectedRow(data);
      onRowClick(data);
      setIsRowClicked(true);

      // تنظیم مقادیر ورودی‌ها
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

      // گام 1: پاکسازی تصویر آپلود شده
      if (fileUploadHandlerRef.current) {
        console.log("پاکسازی تصویر آپلود شده...");
        fileUploadHandlerRef.current.clearUploadedImage();
        console.log("تصویر آپلود شده پاکسازی شد.");
      } else {
        console.warn("fileUploadHandlerRef.current is null while trying to clear uploaded image.");
      }

      // افزودن یک تأخیر کوچک برای اطمینان از پاکسازی
      await new Promise((resolve) => setTimeout(resolve, 100));

      // گام 2: پاکسازی تصویر دانلود شده
      if (fileUploadHandlerRef.current) {
        console.log("پاکسازی تصویر دانلود شده...");
        fileUploadHandlerRef.current.clearDownloadedImage();
        console.log("تصویر دانلود شده پاکسازی شد.");
      } else {
        console.warn("fileUploadHandlerRef.current is null while trying to clear downloaded image.");
      }

      // گام 3: دانلود تصویر جدید
      if (data.IconImageId) {
        console.log("در حال دانلود تصویر جدید برای IconImageId:", data.IconImageId);
        await fileUploadHandlerRef.current?.handleFileDownload(data.IconImageId);
        console.log("تصویر جدید با موفقیت دانلود شد.");
      } else {
        console.log("IconImageId موجود نیست؛ دانلود تصویر جدید انجام نشد.");
      }
    } catch (error) {
      console.error("خطا در handleRowClickLocal:", error);
    }
  };

  // هندل کردن کلیک روی دکمه انتخاب
  const handleSelectButtonClickLocal = () => {
    onSelectButtonClick();
    onSelectFromButton();
    onClose();
    setIsRowClicked(false);
  };

  // تابع هندل کردن موفقیت‌آمیز بودن آپلود
  const handleUploadSuccess = (insertModel: any) => {
    if (selectedRow && selectedRow.IconImageId) {
      // فراخوانی متد دانلود فایل برای ردیف انتخاب شده
      fileUploadHandlerRef.current?.handleFileDownload(selectedRow.IconImageId);
    }
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
      </TwoColumnLayout>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
        {/* سمت چپ: رادیو باتن‌ها */}
        <div style={{ flex: "1" }} className="px-5">
          <DynamicRadioGroup
            key={`state-${isRowClicked ? "controlled" : "uncontrolled"}`}
            title="State:"
            name="stateGroup"
            options={RadioOptionsState}
            selectedValue={selectedState}
            onChange={(value) => setSelectedState(value)}
            isRowClicked={isRowClicked}
            className="mt-10"
          />

          <DynamicRadioGroup
            key={`command-${isRowClicked ? "controlled" : "uncontrolled"}`}
            title="Command:"
            name="commandGroup"
            options={RadioOptionsCommand}
            selectedValue={selectedCommand}
            onChange={(value) => setSelectedCommand(value)}
            isRowClicked={isRowClicked}
            className="mt-10"
          />
        </div>

        {/* سمت راست: آپلودر */}
        <FileUploadHandler
          ref={fileUploadHandlerRef}
          onUploadSuccess={handleUploadSuccess} // ارسال callback
        />
      </div>

      <div className="mt-4 flex justify-center">
        <DynamicButton
          text="Select"
          onClick={handleSelectButtonClickLocal}
          isDisabled={isSelectDisabled}
        />
      </div>
    </div>
  );
};

export default ButtonComponent;
