import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../../layout/TwoColumnLayout";
import CustomTextarea from "../../utilities/DynamicTextArea";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import ListSelector from "../../ListSelector/ListSelector";
import { subTabDataMapping, buttons } from "../../Views/tab/tabData";
import DynamicModal from "../../utilities/DynamicModal"; // وارد کردن DynamicModal
import TableSelector from "../Configuration/TableSelector"; // اصلاح مسیر واردات
import ButtonComponent from "../Configuration/ButtonComponent"; // وارد کردن ButtonComponent

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
    EntityTypeIDForLessonLearn: selectedRow?.EntityTypeIDForLessonLearn || "",
    SelMenuIDForLessonLearnAfTemplate:
      selectedRow?.SelMenuIDForLessonLearnAfTemplate || "",
    EntityTypeIDForTaskComment: selectedRow?.EntityTypeIDForTaskComment || "", // اصلاح نام کلید
    EntityTypeIDForProcedure: selectedRow?.EntityTypeIDForProcedure || "", // اصلاح نام کلید
  });

  const [descriptionError, setDescriptionError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<
    | "DefaultBtn"
    | "LetterBtns"
    | "MeetingBtns"
    | "FirstIDProgramTemplate"
    | "SelMenuIDForMain"
    | "Lesson Learned Form"
    | "Lesson Learned Af Template"
    | "Comment Form Template"
    | "Procedure Form Template"
    | null
  >(null);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  // تبدیل رشته شناسه‌ها به آرایه عددی
  const parseIds = (ids: string): number[] => {
    return ids
      .split("|")
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));
  };

  // مدیریت تغییرات در فرم
  const handleChange = (
    field: keyof typeof configData,
    value: string | number
  ) => {
    console.log(`Updating field ${field} with value ${value}`);
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

  // نگاشت بین سلکتورها و کلیدهای configData
  const selectorToFieldMap: { [key: string]: keyof typeof configData } = {
    DefaultBtn: "DefaultBtn",
    LetterBtns: "LetterBtns",
    MeetingBtns: "MeetingBtns",
    FirstIDProgramTemplate: "FirstIDProgramTemplate",
    SelMenuIDForMain: "SelMenuIDForMain",
    "Lesson Learned Form": "EntityTypeIDForLessonLearn",
    "Lesson Learned Af Template": "SelMenuIDForLessonLearnAfTemplate",
    "Comment Form Template": "EntityTypeIDForTaskComment", // اصلاح نام کلید
    "Procedure Form Template": "EntityTypeIDForProcedure", // اصلاح نام کلید
  };

  // به‌روزرسانی شناسه‌های انتخاب شده برای هر ListSelector
  const handleSelectionChange = (
    field: keyof typeof configData,
    selectedIds: (string | number)[]
  ) => {
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
      EntityTypeIDForLessonLearn: selectedRow?.EntityTypeIDForLessonLearn || "",
      SelMenuIDForLessonLearnAfTemplate:
        selectedRow?.SelMenuIDForLessonLearnAfTemplate || "",
      EntityTypeIDForTaskComment: selectedRow?.EntityTypeIDForTaskComment || "", // اصلاح نام کلید
      EntityTypeIDForProcedure: selectedRow?.EntityTypeIDForProcedure || "", // اصلاح نام کلید
    });
  }, [selectedRow]);

  // مدیریت باز و بسته شدن مودال
  const handleOpenModal = (
    selector:
      | "DefaultBtn"
      | "LetterBtns"
      | "MeetingBtns"
      | "FirstIDProgramTemplate"
      | "SelMenuIDForMain"
      | "Lesson Learned Form"
      | "Lesson Learned Af Template"
      | "Comment Form Template"
      | "Procedure Form Template"
  ) => {
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
      const field = selectorToFieldMap[currentSelector];
      console.log(
        `Selected Selector: ${currentSelector}, Mapped Field: ${field}`
      );
      console.log(`Selected ID: ${selectedRowData.ID}`);
      if (field) {
        const selectedId = selectedRowData.ID;
        handleChange(field, selectedId.toString());
        handleCloseModal();
      }
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
      case "Lesson Learned Form":
        return subTabDataMapping["Lesson Learned Form"].rowData;
      case "Lesson Learned Af Template":
        return subTabDataMapping["Lesson Learned Af Template"].rowData;
      case "Comment Form Template":
        return subTabDataMapping["Comment Form Template"].rowData;
      case "Procedure Form Template":
        return subTabDataMapping["Procedure Form Template"].rowData;
      default:
        return [];
    }
  };

  useEffect(() => {
    console.log("Configuration Data Updated:", configData);
  }, [configData]);

  return (
    <div>
      <TwoColumnLayout>
        <DynamicInput
          name="Name"
          type="text"
          value={configData.Name}
          onChange={(e) => handleChange("Name", e.target.value)}
          required
        />

        <CustomTextarea
          id="description"
          name="Description"
          value={configData.Description}
          onChange={(e) => handleChange("Description", e.target.value)}
          placeholder=""
          className={`${
            descriptionError ? "border-red-500" : "border-gray-300"
          }`}
        />

        {/* DynamicSelector - Program Template */}
        <DynamicSelector
          options={subTabDataMapping["ProgramTemplate"].rowData.map((pt) => ({
            value: pt.ID.toString(),
            label: pt.Name,
          }))}
          selectedValue={configData.FirstIDProgramTemplate}
          onChange={(e) =>
            handleChange("FirstIDProgramTemplate", e.target.value)
          }
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

        {/* DynamicSelector - Lesson Learned Form */}
        <DynamicSelector
          options={subTabDataMapping["Lesson Learned Form"].rowData.map(
            (llf) => ({
              value: llf.ID.toString(),
              label: llf.Name,
            })
          )}
          selectedValue={configData.EntityTypeIDForLessonLearn}
          onChange={(e) =>
            handleChange("EntityTypeIDForLessonLearn", e.target.value)
          }
          label="Lesson Learned Form"
          showButton={true}
          onButtonClick={() => handleOpenModal("Lesson Learned Form")}
          className="mt-7"
        />

        {/* DynamicSelector - Lesson Learned Af Template */}
        <DynamicSelector
          options={subTabDataMapping["Lesson Learned Af Template"].rowData.map(
            (llat) => ({
              value: llat.ID.toString(),
              label: llat.Name,
            })
          )}
          selectedValue={configData.SelMenuIDForLessonLearnAfTemplate}
          onChange={(e) =>
            handleChange("SelMenuIDForLessonLearnAfTemplate", e.target.value)
          }
          label="Lesson Learned Af Template"
          showButton={true}
          onButtonClick={() => handleOpenModal("Lesson Learned Af Template")}
          className="mt-7"
        />

        {/* DynamicSelector - Comment Form Template */}
        <DynamicSelector
          options={subTabDataMapping["Comment Form Template"].rowData.map(
            (cft) => ({
              value: cft.ID.toString(),
              label: cft.Name,
            })
          )}
          selectedValue={configData.EntityTypeIDForTaskComment} // اصلاح نام کلید
          onChange={(e) =>
            handleChange("EntityTypeIDForTaskComment", e.target.value)
          } // اصلاح نام کلید
          label="Comment Form Template"
          showButton={true}
          onButtonClick={() => handleOpenModal("Comment Form Template")}
          className="mt-7"
        />

        {/* DynamicSelector - Procedure Form Template */}
        <DynamicSelector
          options={subTabDataMapping["Procedure Form Template"].rowData.map(
            (pft) => ({
              value: pft.ID.toString(),
              label: pft.Name,
            })
          )}
          selectedValue={configData.EntityTypeIDForProcedure} // اصلاح نام کلید
          onChange={(e) =>
            handleChange("EntityTypeIDForProcedure", e.target.value)
          } // اصلاح نام کلید
          label="Procedure Form Template"
          showButton={true}
          onButtonClick={() => handleOpenModal("Procedure Form Template")}
          className="mt-7"
        />

        {/* ListSelector - Default Action Buttons */}
        <ListSelector
          title="Default Action Buttons"
          className="mt-7"
          columnDefs={[
            { headerName: "Name", field: "Name" },
            { headerName: "Tooltip", field: "Tooltip" },
          ]}
          rowData={buttons}
          selectedIds={defaultBtnIds}
          onSelectionChange={(selectedIds) =>
            handleSelectionChange("DefaultBtn", selectedIds)
          }
          isGlobal={false}
          ModalContentComponent={ButtonComponent}
          modalContentProps={{
            columnDefs: [
              { headerName: "Name", field: "Name" },
              { headerName: "Tooltip", field: "Tooltip" },
            ],
            rowData: buttons,
            onClose: handleCloseModal,
            onRowSelect: handleSelectButtonClick,
            onSelectFromButton: handleSelectButtonClick,
          }}
        />

        {/* ListSelector - Letter Action Buttons */}
        <ListSelector
          title="Letter Action Buttons"
          className="mt-7"
          columnDefs={[
            { headerName: "Name", field: "Name" },
            { headerName: "Tooltip", field: "Tooltip" },
          ]}
          rowData={buttons}
          selectedIds={letterBtnIds}
          onSelectionChange={(selectedIds) =>
            handleSelectionChange("LetterBtns", selectedIds)
          }
          isGlobal={false}
          ModalContentComponent={ButtonComponent}
          modalContentProps={{
            columnDefs: [
              { headerName: "Name", field: "Name" },
              { headerName: "Tooltip", field: "Tooltip" },
            ],
            rowData: buttons,
            selectedRow: selectedRowData,
            onClose: handleCloseModal,
            onRowSelect: handleSelectButtonClick,
            onSelectFromButton: handleSelectButtonClick,
            isSelectDisabled: !selectedRowData,
          }}
        />

        {/* ListSelector - Meeting Action Buttons */}
        <ListSelector
          title="Meeting Action Buttons"
          className="mt-7"
          columnDefs={[
            { headerName: "Name", field: "Name" },
            { headerName: "Tooltip", field: "Tooltip" },
          ]}
          rowData={buttons}
          selectedIds={meetingBtnIds}
          onSelectionChange={(selectedIds) =>
            handleSelectionChange("MeetingBtns", selectedIds)
          }
          isGlobal={false}
          ModalContentComponent={TableSelector}
          modalContentProps={{
            columnDefs: [
              { headerName: "نام", field: "Name" },
              { headerName: "توضیحات", field: "EntityCateADescription" },
            ],
            rowData: buttons,
            selectedRow: selectedRowData,
            onRowDoubleClick: handleSelectButtonClick,
            onRowClick: handleRowClick,
            onSelectButtonClick: handleSelectButtonClick,
            isSelectDisabled: !selectedRowData,
          }}
        />
      </TwoColumnLayout>

      {/* مودال عمومی برای سلکتورها */}
      <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
        <TableSelector
          columnDefs={[
            { headerName: "نام", field: "Name" },
            { headerName: "توضیحات", field: "EntityCateADescription" },
          ]}
          rowData={getRowData(currentSelector)}
          selectedRow={selectedRowData}
          onRowDoubleClick={handleSelectButtonClick}
          onRowClick={handleRowClick}
          onSelectButtonClick={handleSelectButtonClick}
          isSelectDisabled={!selectedRowData}
        />
      </DynamicModal>
    </div>
  );
};

export default Configuration;
