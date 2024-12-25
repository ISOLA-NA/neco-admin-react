// src/components/Views/tab/Configuration.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../../layout/TwoColumnLayout";
import CustomTextarea from "../../utilities/DynamicTextArea";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import ListSelector from "../../ListSelector/ListSelector";
import DynamicModal from "../../utilities/DynamicModal";
import TableSelector from "../Configuration/TableSelector";
import ButtonComponent from "../Configuration/ButtonComponent";

import AppServices, {
  EntityTypeItem,
  WfTemplateItem,
  ProgramTemplateItem,
  MenuItem,
  AFBtnItem,
} from "../../../services/api.services";

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
    EntityTypeIDForTaskComment: selectedRow?.EntityTypeIDForTaskComment || "",
    EntityTypeIDForProcedure: selectedRow?.EntityTypeIDForProcedure || "",
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

  // State for API data
  const [programTemplates, setProgramTemplates] = useState<
    ProgramTemplateItem[]
  >([]);
  const [defaultRibbons, setDefaultRibbons] = useState<MenuItem[]>([]);
  const [entityTypes, setEntityTypes] = useState<EntityTypeItem[]>([]);
  const [wfTemplates, setWfTemplates] = useState<WfTemplateItem[]>([]);
  const [afButtons, setAfButtons] = useState<AFBtnItem[]>([]);

  // Parsing function (could be moved to utils)
  const parseIds = (ids: string): number[] => {
    return ids
      .split("|")
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));
  };

  // Handle form changes
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

  // Map selectors to configData fields
  const selectorToFieldMap: { [key: string]: keyof typeof configData } = {
    DefaultBtn: "DefaultBtn",
    LetterBtns: "LetterBtns",
    MeetingBtns: "MeetingBtns",
    FirstIDProgramTemplate: "FirstIDProgramTemplate",
    SelMenuIDForMain: "SelMenuIDForMain",
    "Lesson Learned Form": "EntityTypeIDForLessonLearn",
    "Lesson Learned Af Template": "SelMenuIDForLessonLearnAfTemplate",
    "Comment Form Template": "EntityTypeIDForTaskComment",
    "Procedure Form Template": "EntityTypeIDForProcedure",
  };

  // Handle selection changes and update configData
  const handleSelectionChange = (
    field: keyof typeof configData,
    selectedIds: (number | string)[]
  ) => {
    const idsString = selectedIds.join("|") + "|";
    handleChange(field, idsString);
  };

  // Handle row double click in ListSelector
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
    } else {
      console.warn("No row selected or selector is null");
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [templates, ribbons, entities, wfTemplatesData, afButtonsData] =
          await Promise.all([
            AppServices.getAllProgramTemplates(),
            AppServices.getAllDefaultRibbons(),
            AppServices.getTableTransmittal(),
            AppServices.getAllWfTemplate(),
            AppServices.getAllAfbtn(), // Fetch AFBtn data
          ]);
        console.log("Program Templates:", templates);
        console.log("Default Ribbons:", ribbons);
        console.log("Entity Types:", entities);
        console.log("WF Templates:", wfTemplatesData);
        console.log("AF Buttons:", afButtonsData); // Log AF Buttons

        setProgramTemplates(templates);
        setDefaultRibbons(ribbons);
        setEntityTypes(entities);
        setWfTemplates(wfTemplatesData);
        setAfButtons(afButtonsData); // Correctly set AF Buttons
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  // بروزرسانی configData زمانی که selectedRow تغییر می‌کند
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
      EntityTypeIDForLessonLearn: selectedRow?.EnityTypeIDForLessonLearn || "",
      SelMenuIDForLessonLearnAfTemplate:
        selectedRow?.WFTemplateIDForLessonLearn || "",
      EntityTypeIDForTaskComment: selectedRow?.EnityTypeIDForTaskCommnet || "",
      EntityTypeIDForProcedure: selectedRow?.EnityTypeIDForProcesure || "",
    });
  }, [selectedRow]);

  // Open and close modal
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
    console.log(`Opening modal for selector: ${selector}`);
    setCurrentSelector(selector);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("Closing modal");
    setModalOpen(false);
    setSelectedRowData(null);
    setCurrentSelector(null);
  };

  // Handle row click in modal
  const handleRowClick = (rowData: any) => {
    console.log("Row clicked in modal:", rowData);
    setSelectedRowData(rowData);
  };

  // Get row data based on current selector
  const getRowData = (selector: string | null) => {
    if (!selector) return [];
    switch (selector) {
      case "FirstIDProgramTemplate":
        return programTemplates;
      case "SelMenuIDForMain":
        return defaultRibbons;
      case "Lesson Learned Form":
      case "Comment Form Template":
      case "Procedure Form Template":
        return entityTypes;
      case "Lesson Learned Af Template":
        return wfTemplates;
      case "DefaultBtn":
      case "LetterBtns":
      case "MeetingBtns":
        return afButtons;
      default:
        return [];
    }
  };


  // Parse the IDs
  const defaultBtnIds = parseIds(configData.DefaultBtn);
  const letterBtnIds = parseIds(configData.LetterBtns);
  const meetingBtnIds = parseIds(configData.MeetingBtns);

  return (
    <div>
      <TwoColumnLayout>
        {/* DynamicInput - Name */}
        <DynamicInput
          name="Name"
          type="text"
          value={configData.Name}
          onChange={(e) => handleChange("Name", e.target.value)}
          required
        />

        {/* CustomTextarea - Description */}
        <CustomTextarea
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
          options={programTemplates.map((pt) => ({
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
          options={defaultRibbons.map((dr) => ({
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
          options={entityTypes.map((llf) => ({
            value: llf.ID.toString(),
            label: llf.Name,
          }))}
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
          options={wfTemplates.map((wf) => ({
            value: wf.ID.toString(),
            label: wf.Name,
          }))}
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
          options={entityTypes.map((cft) => ({
            value: cft.ID.toString(),
            label: cft.Name,
          }))}
          selectedValue={configData.EntityTypeIDForTaskComment}
          onChange={(e) =>
            handleChange("EntityTypeIDForTaskComment", e.target.value)
          }
          label="Comment Form Template"
          showButton={true}
          onButtonClick={() => handleOpenModal("Comment Form Template")}
          className="mt-7"
        />

        {/* DynamicSelector - Procedure Form Template */}
        <DynamicSelector
          options={entityTypes.map((pft) => ({
            value: pft.ID.toString(),
            label: pft.Name,
          }))}
          selectedValue={configData.EntityTypeIDForProcedure}
          onChange={(e) =>
            handleChange("EntityTypeIDForProcedure", e.target.value)
          }
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
          rowData={afButtons} // Use afButtons instead of buttons
          selectedIds={defaultBtnIds} // Pass parsed IDs
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
            rowData: afButtons, // Ensure modal uses afButtons
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
          rowData={afButtons} // Use afButtons
          selectedIds={letterBtnIds} // Parsed IDs
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
            rowData: afButtons, // Ensure modal uses afButtons
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
          rowData={afButtons} // Use afButtons
          selectedIds={meetingBtnIds} // Parsed IDs
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
            rowData: afButtons, // Ensure modal uses afButtons
            selectedRow: selectedRowData,
            onRowDoubleClick: handleSelectButtonClick,
            onRowClick: handleRowClick,
            onSelectButtonClick: handleSelectButtonClick,
            isSelectDisabled: !selectedRowData,
          }}
        />
      </TwoColumnLayout>

      {/* General Modal */}
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
