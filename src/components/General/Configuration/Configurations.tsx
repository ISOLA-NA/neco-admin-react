// src/components/General/Configurations.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../../layout/TwoColumnLayout";
import CustomTextarea from "../../utilities/DynamicTextArea";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import ListSelector from "../../ListSelector/ListSelector";
import { subTabDataMapping, buttons } from "../../Views/tab/tabData";
import DynamicModal from "../../utilities/DynamicModal"; // وارد کردن DynamicModal
import TableWithSelectButton from "../Configuration/TableSelector"; // وارد کردن TableWithSelectButton

interface ConfigurationProps {
  selectedRow: any;
}

const Configuration: React.FC<ConfigurationProps> = ({ selectedRow }) => {
  const [configData, setConfigData] = useState({
    id: selectedRow?.ID?.toString() || "",
    Name: selectedRow?.Name || "",
    FirstIDProgramTemplate: selectedRow?.FirstIDProgramTemplate || "",
    SelMenuIDForMain: selectedRow?.SelMenuIDForMain || "",
    Description: selectedRow?.Description || "",
    IsVisible: selectedRow?.IsVisible || true,
    LastModified: selectedRow?.LastModified || "",
    DefaultBtn: selectedRow?.DefaultBtn || "",
    LetterBtns: selectedRow?.LetterBtns || "",
    MeetingBtns: selectedRow?.MeetingBtns || "",
  });

  const [descriptionError, setDescriptionError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<"DefaultBtn" | "LetterBtns" | "MeetingBtns" | "FirstIDProgramTemplate" | "SelMenuIDForMain" | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  // تبدیل رشته شناسه‌ها به آرایه عددی
  const parseIds = (ids: string): number[] => {
    return ids
      .split("|")
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));
  };

  // مدیریت تغییرات در فرم
  const handleChange = (field: keyof typeof configData, value: string | number) => {
    setConfigData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "Description" && typeof value === "string") {
      if (value.length < 10) {
        setDescriptionError(true);
      } else {
        setDescriptionError(false);
      }
    }
  };

  // به‌روزرسانی شناسه‌های انتخاب شده برای هر ListSelector
  const handleSelectionChange = (field: "DefaultBtn" | "LetterBtns" | "MeetingBtns", selectedIds: number[]) => {
    const idsString = selectedIds.join("|") + "|";
    handleChange(field, idsString);
  };

  // تبدیل رشته شناسه‌ها به آرایه
  const defaultBtnIds = parseIds(configData.DefaultBtn);
  const letterBtnIds = parseIds(configData.LetterBtns);
  const meetingBtnIds = parseIds(configData.MeetingBtns);

  useEffect(() => {
    console.log("Selected Row in Configuration component:", selectedRow);
    setConfigData({
      id: selectedRow?.ID?.toString() || "",
      Name: selectedRow?.Name || "",
      FirstIDProgramTemplate: selectedRow?.FirstIDProgramTemplate || "",
      SelMenuIDForMain: selectedRow?.SelMenuIDForMain || "",
      Description: selectedRow?.Description || "",
      IsVisible: selectedRow?.IsVisible || true,
      LastModified: selectedRow?.LastModified || "",
      DefaultBtn: selectedRow?.DefaultBtn || "",
      LetterBtns: selectedRow?.LetterBtns || "",
      MeetingBtns: selectedRow?.MeetingBtns || "",
    });
  }, [selectedRow]);

  // مدیریت باز و بسته شدن مودال
  const handleOpenModal = (selector: "DefaultBtn" | "LetterBtns" | "MeetingBtns" | "FirstIDProgramTemplate" | "SelMenuIDForMain") => {
    setCurrentSelector(selector);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRowData(null);
    setCurrentSelector(null);
  };

  // مدیریت انتخاب ردیف در جدول مودال
  const handleRowClick = (rowData: any) => {
    setSelectedRowData(rowData);
  };

  // مدیریت کلیک دکمه انتخاب در مودال
  const handleSelectButtonClick = () => {
    if (selectedRowData && currentSelector) {
      // به‌روزرسانی configData بر اساس currentSelector
      // فرض می‌کنیم که هر ردیف دارای ID است
      const selectedId = selectedRowData.ID;
      handleChange(currentSelector, selectedId.toString());
      handleCloseModal();
    }
  };

  // گرفتن داده‌های ردیف‌ها بر اساس selector فعلی
  const getRowData = (selector: string | null) => {
    if (!selector) return [];
    switch (selector) {
      case "FirstIDProgramTemplate":
        return subTabDataMapping["ProgramTemplate"].rowData;
      case "SelMenuIDForMain":
        return subTabDataMapping["DefaultRibbon"].rowData;
      case "DefaultBtn":
      case "LetterBtns":
      case "MeetingBtns":
        return buttons;
      default:
        return [];
    }
  };

  return (
    <div>
      <TwoColumnLayout>
        {/* Input Name */}
        <DynamicInput
          name="Name"
          type="text"
          value={configData.Name}
          onChange={(e) => handleChange("Name", e.target.value)}
          required
        />

        {/* Input Description */}
        <CustomTextarea
          id="description"
          name="Description"
          value={configData.Description}
          onChange={(e) => handleChange("Description", e.target.value)}
          placeholder="Enter description (min 10 characters)"
          className={`${descriptionError ? "border-red-500" : "border-gray-300"}`}
        />
        {descriptionError && (
          <span className="text-red-500 text-sm">Description must be at least 10 characters.</span>
        )}

        {/* DynamicSelector - Program Template */}
        <DynamicSelector
          options={subTabDataMapping["ProgramTemplate"].rowData.map((pt) => ({
            value: pt.ID.toString(),
            label: pt.Name,
          }))}
          selectedValue={configData.FirstIDProgramTemplate}
          onChange={(e) => handleChange("FirstIDProgramTemplate", e.target.value)}
          label="Program Template"
          showButton={true}
          onButtonClick={() => handleOpenModal("FirstIDProgramTemplate")}
        />

        {/* DynamicSelector - Default Ribbon */}
        <DynamicSelector
          options={subTabDataMapping["DefaultRibbon"].rowData.map((dr) => ({
            value: dr.ID.toString(),
            label: dr.Name,
          }))}
          selectedValue={configData.SelMenuIDForMain}
          onChange={(e) => handleChange("SelMenuIDForMain", e.target.value)}
          label="Default Ribbon"
          showButton={true}
          onButtonClick={() => handleOpenModal("SelMenuIDForMain")}
        />

        {/* ListSelector - Default Action Buttons */}
        <ListSelector
          title="Default Action Buttons"
          className="mt-5"
          columnDefs={[
            { headerName: "Name", field: "Name" },
            { headerName: "Tooltip", field: "Tooltip" },
          ]}
          rowData={buttons}
          selectedIds={defaultBtnIds}
          onSelectionChange={(selectedIds) => handleSelectionChange("DefaultBtn", selectedIds)}
        />

        {/* ListSelector - Letter Action Buttons */}
        <ListSelector
          title="Letter Action Buttons"
          className="mt-5"
          columnDefs={[
            { headerName: "Name", field: "Name" },
            { headerName: "Tooltip", field: "Tooltip" },
          ]}
          rowData={buttons}
          selectedIds={letterBtnIds}
          onSelectionChange={(selectedIds) => handleSelectionChange("LetterBtns", selectedIds)}
        />

        {/* ListSelector - Meeting Action Buttons */}
        <ListSelector
          title="Meeting Action Buttons"
          className="mt-5"
          columnDefs={[
            { headerName: "Name", field: "Name" },
            { headerName: "Tooltip", field: "Tooltip" },
          ]}
          rowData={buttons}
          selectedIds={meetingBtnIds}
          onSelectionChange={(selectedIds) => handleSelectionChange("MeetingBtns", selectedIds)}
        />

        {/* نمایش DynamicModal با استفاده از TableWithSelectButton */}
        <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
          <TableWithSelectButton
            columnDefs={[
              { headerName: "نام", field: "Name" },
              { headerName: "توضیحات", field: "Description" },
            ]}
            rowData={getRowData(currentSelector)}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        </DynamicModal>
      </TwoColumnLayout>
    </div>
  );
};

export default Configuration;
