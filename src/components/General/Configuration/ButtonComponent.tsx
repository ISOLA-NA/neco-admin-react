// src/components/General/ButtonComponent.tsx

import React, { useState } from "react";
import DataTable from "../../TableDynamic/DataTable";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicRadioGroup from "../../utilities/DynamicRadiogroup";
import TwoColumnLayout from "../../layout/TwoColumnLayout";
import DynamicButton from "../../utilities/DynamicButtons";
import FileUploadHandler from "../../../services/FileUploadHandler";
import { useApi } from "../../../context/ApiContext";
import { AFBtnItem } from "../../../services/api.services";

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
  // این‌ها فعلاً اگر ضروری نیستند، می‌توانیم یا حذف کنیم یا نگه داریم
  onSelectButtonClick,
  isSelectDisabled,
  onClose,
  onSelectFromButton,
}) => {
  const api = useApi(); // برای متدهای API

  // وضعیت‌ها
  const [selectedState, setSelectedState] = useState<string>("accept");
  const [selectedCommand, setSelectedCommand] = useState<string>("accept");

  const [nameValue, setNameValue] = useState("");
  const [stateTextValue, setStateTextValue] = useState("");
  const [tooltipValue, setTooltipValue] = useState("");
  const [orderValue, setOrderValue] = useState("");

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isRowClicked, setIsRowClicked] = useState<boolean>(false);

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // رادیوآپشن‌ها
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

  // دوبار کلیک
  const handleRowDoubleClickLocal = (data: any) => {
    setSelectedRow(data);
    onRowDoubleClick(data);
  };

  // کلیک روی ردیف جدول
  const handleRowClickLocal = async (data: any) => {
    try {
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

      // تنظیم فایل آیدی
      if (data.IconImageId) {
        setSelectedFileId(data.IconImageId);
      } else {
        setSelectedFileId(null);
      }
    } catch (error) {
      console.error("خطا در handleRowClickLocal:", error);
    }
  };

  // تبدیل مقدار StateForDeemed به مقدار رادیو
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

  // تبدیل مقدار WFCommand به مقدار رادیو
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

  // هندل آپلود فایل موفق
  const handleUploadSuccess = (insertModel: InsertModel) => {
    if (selectedRow) {
      const updatedRow = { ...selectedRow, IconImageId: insertModel.ID };
      setSelectedRow(updatedRow);
      onRowClick(updatedRow); // اگر لازم است
    }
  };

  // کلیک دکمه Add
  const handleAddClick = async () => {
    try {
      // ساخت آبجکت AFBtn جدید
      const newAFBtn: AFBtnItem = {
        ID: 0, // درج جدید
        Name: nameValue,
        Tooltip: tooltipValue,
        StateText: stateTextValue,
        Order: parseInt(orderValue || "0"),
        WFStateForDeemed: radioToWFStateForDeemed(selectedState),
        WFCommand: radioToWFCommand(selectedCommand),
        IconImageId: selectedFileId,
        IsVisible: true,
        LastModified: null,
        ModifiedById: null,
      };

      await api.insertAFBtn(newAFBtn);
      alert("آیتم جدید با موفقیت درج شد.");
    } catch (error) {
      console.error("خطا در درج آیتم AFBtn:", error);
      alert("خطایی در درج رخ داد.");
    }
  };

  // کلیک دکمه Edit
  const handleEditClick = async () => {
    if (!selectedRow || !selectedRow.ID) {
      alert("لطفاً یک ردیف را از جدول انتخاب کنید.");
      return;
    }
    try {
      const updatedAFBtn: AFBtnItem = {
        ID: selectedRow.ID,
        Name: nameValue,
        Tooltip: tooltipValue,
        StateText: stateTextValue,
        Order: parseInt(orderValue || "0"),
        WFStateForDeemed: radioToWFStateForDeemed(selectedState),
        WFCommand: radioToWFCommand(selectedCommand),
        IconImageId: selectedFileId,
        IsVisible: true,
        LastModified: null,
        ModifiedById: null,
      };

      await api.updateAFBtn(updatedAFBtn);
      alert("آیتم با موفقیت ویرایش شد.");
    } catch (error) {
      console.error("خطا در ویرایش آیتم AFBtn:", error);
      alert("خطایی در ویرایش رخ داد.");
    }
  };

  // مبدل رادیو => WFStateForDeemed
  const radioToWFStateForDeemed = (radioVal: string): number => {
    switch (radioVal) {
      case "accept":
        return 1;
      case "reject":
        return 2;
      case "close":
        return 3;
      default:
        return 1;
    }
  };

  // مبدل رادیو => WFCommand
  const radioToWFCommand = (radioVal: string): number => {
    switch (radioVal) {
      case "accept":
        return 1;
      case "close":
        return 2;
      case "reject":
        return 3;
      case "client":
        return 4;
      case "admin":
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-white rounded-lg p-4">
      {/* جدول بالا */}
      <div className="mb-4 w-full overflow-hidden">
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

      {/* بخش فرم (دو ستونی + آپلود) */}
      <div className="flex flex-col sm:flex-row w-full gap-6">
        <div className="flex-1">
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
              name="StateText"
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

          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <DynamicRadioGroup
              key={`state-${isRowClicked ? "controlled" : "uncontrolled"}`}
              title="State:"
              name="stateGroup"
              options={RadioOptionsState}
              selectedValue={selectedState}
              onChange={(value) => setSelectedState(value)}
              isRowClicked={isRowClicked}
              className=""
            />
            <DynamicRadioGroup
              key={`command-${isRowClicked ? "controlled" : "uncontrolled"}`}
              title="Command:"
              name="commandGroup"
              options={RadioOptionsCommand}
              selectedValue={selectedCommand}
              onChange={(value) => setSelectedCommand(value)}
              isRowClicked={isRowClicked}
              className=""
            />
          </div>
        </div>

        {/* آپلودر سمت راست */}
        <div className="flex-1">
          <FileUploadHandler
            selectedFileId={selectedFileId}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>
      </div>

      {/* دکمه های پایین: Add و Edit (سمت چپ) */}
      <div className="mt-6 flex justify-start space-x-4">
        <DynamicButton text="Add" onClick={handleAddClick} isDisabled={false} />
        <DynamicButton
          text="Edit"
          onClick={handleEditClick}
          isDisabled={false}
        />
      </div>
    </div>
  );
};

export default ButtonComponent;
