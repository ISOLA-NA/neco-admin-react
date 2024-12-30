import React, { useState } from "react";
import DataTable from "../../TableDynamic/DataTable"; // فرض بر این است که این کامپوننت وجود دارد
import DynamicInput from "../../utilities/DynamicInput"; // فرض بر این است که این کامپوننت وجود دارد
import DynamicRadioGroup from "../../utilities/DynamicRadiogroup"; // فرض بر این است که این کامپوننت وجود دارد
import TwoColumnLayout from "../../layout/TwoColumnLayout"; // فرض بر این است که این کامپوننت وجود دارد
import DynamicButton from "../../utilities/DynamicButtons"; // فرض بر این است که این کامپوننت وجود دارد
import FileUploadHandler from "../../../services/FileUploadHandler";

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

interface InsertModel {
  ID: string;
  gid: string;
  FileIQ: string;
  FileName: string;
  FileSize: number;
  FolderName: string;
  IsVisible: boolean;
  LastModified: Date | null;
  SenderID: string | null;
  FileType: string | null;
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
  // مدیریت وضعیت‌ها
  const [selectedState, setSelectedState] = useState<string>("accept");
  const [selectedCommand, setSelectedCommand] = useState<string>("accept");

  const [nameValue, setNameValue] = useState("");
  const [stateTextValue, setStateTextValue] = useState("");
  const [tooltipValue, setTooltipValue] = useState("");
  const [orderValue, setOrderValue] = useState("");

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isRowClicked, setIsRowClicked] = useState<boolean>(false);

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // گزینه‌های رادیو
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

      // تنظیم selectedFileId برای دانلود تصویر
      if (data.IconImageId) {
        console.log("تنظیم selectedFileId برای دانلود:", data.IconImageId);
        setSelectedFileId(data.IconImageId);
      } else {
        console.log("IconImageId موجود نیست؛ تنظیم selectedFileId به null.");
        setSelectedFileId(null);
      }
    } catch (error) {
      console.error("خطا در handleRowClickLocal:", error);
    }
  };

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

  // هندل کردن کلیک روی دکمه انتخاب
  const handleSelectButtonClickLocal = () => {
    onSelectButtonClick();
    onSelectFromButton();
    onClose();
    setIsRowClicked(false);
  };

  // هندل کردن موفقیت‌آمیز بودن آپلود
  const handleUploadSuccess = (insertModel: InsertModel) => {
    if (selectedRow) {
      // فرض بر این است که selectedRow دارای فیلدی به نام IconImageId است که باید به‌روزرسانی شود
      const updatedRow = { ...selectedRow, IconImageId: insertModel.ID };
      setSelectedRow(updatedRow);
      onRowClick(updatedRow);
      // در صورت نیاز، می‌توانید وضعیت‌های دیگر را نیز به‌روزرسانی کنید
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

      <div className="flex mt-4 gap-5">
        {/* سمت چپ: رادیو باتن‌ها */}
        <div className="flex-1 px-5">
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
          selectedFileId={selectedFileId}
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
