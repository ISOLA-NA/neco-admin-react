import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import TwoColumnLayout from "../../layout/TwoColumnLayout";
import CustomTextarea from "../../utilities/DynamicTextArea";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import ListSelector from "../../ListSelector/ListSelector";
import DynamicModal from "../../utilities/DynamicModal";
import TableSelector from "../Configuration/TableSelector";
import ButtonComponent from "../Configuration/ButtonComponent";

import {
  useApi,
  EntityTypeItem,
  WfTemplateItem,
  ProgramTemplateItem,
  DefaultRibbonItem,
  AFBtnItem,
  ConfigurationItem,
} from "../../../context/ApiContext";

import { useAddEditDelete } from "../../../context/AddEditDeleteContext";

interface ConfigurationProps {
  selectedRow: any;
  onSave?: (data: ConfigurationItem) => void;
}

export interface ConfigurationHandle {
  save: () => Promise<ConfigurationItem | null>;
}

const Configuration = forwardRef<ConfigurationHandle, ConfigurationProps>(
  ({ selectedRow }, ref) => {
    const api = useApi();
    const { handleSaveConfiguration } = useAddEditDelete();

    // تابع کمکی: در صورتی که مقدار null، undefined یا 0 باشد، رشته خالی برگردانید
    const toValidString = (value: any): string => {
      if (value === null || value === undefined || value === 0) return "";
      return value.toString();
    };

    // مقداردهی اولیه state با استفاده از کلید اصلی WFTemplateIDForLessonLearn
    const [configData, setConfigData] = useState({
      id: toValidString(selectedRow?.ID),
      Name: selectedRow?.Name || "",
      FirstIDProgramTemplate: toValidString(selectedRow?.FirstIDProgramTemplate),
      SelMenuIDForMain: toValidString(selectedRow?.SelMenuIDForMain),
      Description: selectedRow?.Description || "",
      IsVisible: selectedRow?.IsVisible || true,
      LastModified: selectedRow?.LastModified || "",
      DefaultBtn: selectedRow?.DefaultBtn || "",
      LetterBtns: selectedRow?.LetterBtns || "",
      MeetingBtns: selectedRow?.MeetingBtns || "",
      EnityTypeIDForLessonLearn: toValidString(selectedRow?.EnityTypeIDForLessonLearn),
      EnityTypeIDForTaskCommnet: toValidString(selectedRow?.EnityTypeIDForTaskCommnet),
      EnityTypeIDForProcesure: toValidString(selectedRow?.EnityTypeIDForProcesure),
      WFTemplateIDForLessonLearn: toValidString(selectedRow?.WFTemplateIDForLessonLearn),
    });

    const [descriptionError, setDescriptionError] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentSelector, setCurrentSelector] = useState<
      | "DefaultBtn"
      | "LetterBtns"
      | "MeetingBtns"
      | "FirstIDProgramTemplate"
      | "SelMenuIDForMain"
      | "LessonLearnedForm"
      | "LessonLearnedAfTemplate"
      | "CommentFormTemplate"
      | "ProcedureFormTemplate"
      | null
    >(null);
    const [selectedRowData, setSelectedRowData] = useState<any>(null);

    // State for API data
    const [programTemplates, setProgramTemplates] = useState<ProgramTemplateItem[]>([]);
    const [defaultRibbons, setDefaultRibbons] = useState<DefaultRibbonItem[]>([]);
    const [entityTypes, setEntityTypes] = useState<EntityTypeItem[]>([]);
    const [wfTemplates, setWfTemplates] = useState<WfTemplateItem[]>([]);
    const [afButtons, setAfButtons] = useState<AFBtnItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const handleChange = (
      field: keyof typeof configData,
      value: string | number
    ) => {
      setConfigData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (field === "Description" && typeof value === "string") {
        setDescriptionError(value.length < 10);
      }
    };

    // نگاشت صحیح نام ساب‌فرم به فیلدهای configData
    const selectorToFieldMap: { [key: string]: keyof typeof configData } = {
      DefaultBtn: "DefaultBtn",
      LetterBtns: "LetterBtns",
      MeetingBtns: "MeetingBtns",
      FirstIDProgramTemplate: "FirstIDProgramTemplate",
      SelMenuIDForMain: "SelMenuIDForMain",
      LessonLearnedForm: "EnityTypeIDForLessonLearn",
      LessonLearnedAfTemplate: "WFTemplateIDForLessonLearn",
      CommentFormTemplate: "EnityTypeIDForTaskCommnet",
      ProcedureFormTemplate: "EnityTypeIDForProcesure",
    };

    const handleSelectionChange = (
      field: keyof typeof configData,
      selectedIds: (number | string)[]
    ) => {
      const idsString = selectedIds.join("|") + "|";
      handleChange(field, idsString);
    };

    const handleSelectButtonClick = () => {
      if (selectedRowData && currentSelector) {
        const field = selectorToFieldMap[currentSelector];
        if (field) {
          const selectedId = selectedRowData.ID;
          handleChange(field, selectedId.toString());
          handleCloseModal();
        }
      } else {
        console.warn("No row selected or selector is null");
      }
    };

    useEffect(() => {
      const fetchInitialData = async () => {
        try {
          setLoading(true);
          const [templates, ribbons, entities, wfTemplatesData, afButtonsData] =
            await Promise.all([
              api.getAllProgramTemplates(),
              api.getAllDefaultRibbons(),
              api.getTableTransmittal(),
              api.getAllWfTemplate(),
              api.getAllAfbtn(),
            ]);

          setProgramTemplates(templates);
          setDefaultRibbons(ribbons);
          setEntityTypes(entities);
          setWfTemplates(wfTemplatesData);
          setAfButtons(afButtonsData);
        } catch (error) {
          console.error("Error fetching initial data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchInitialData();
    }, [api]);

    // به‌روزرسانی configData هنگام تغییر selectedRow
    useEffect(() => {
      const newConfig = {
        id: toValidString(selectedRow?.ID),
        Name: selectedRow?.Name || "",
        FirstIDProgramTemplate: toValidString(selectedRow?.FirstIDProgramTemplate),
        SelMenuIDForMain: toValidString(selectedRow?.SelMenuIDForMain),
        WFTemplateIDForLessonLearn: toValidString(selectedRow?.WFTemplateIDForLessonLearn),
        Description: selectedRow?.Description || "",
        IsVisible: selectedRow?.IsVisible || true,
        LastModified: selectedRow?.LastModified || "",
        DefaultBtn: selectedRow?.DefaultBtn || "",
        LetterBtns: selectedRow?.LetterBtns || "",
        MeetingBtns: selectedRow?.MeetingBtns || "",
        EnityTypeIDForLessonLearn: toValidString(selectedRow?.EnityTypeIDForLessonLearn),
        EnityTypeIDForTaskCommnet: toValidString(selectedRow?.EnityTypeIDForTaskCommnet),
        EnityTypeIDForProcesure: toValidString(selectedRow?.EnityTypeIDForProcesure),
      };
      console.log("SelectedRow:", selectedRow);
      console.log("WFTemplateIDForLessonLearn:", newConfig.WFTemplateIDForLessonLearn);
      setConfigData(newConfig);
    }, [selectedRow]);

    const handleOpenModal = (
      selector:
        | "DefaultBtn"
        | "LetterBtns"
        | "MeetingBtns"
        | "FirstIDProgramTemplate"
        | "SelMenuIDForMain"
        | "LessonLearnedForm"
        | "LessonLearnedAfTemplate"
        | "CommentFormTemplate"
        | "ProcedureFormTemplate"
    ) => {
      setCurrentSelector(selector);
      setModalOpen(true);
    };

    const handleCloseModal = () => {
      setModalOpen(false);
      setSelectedRowData(null);
      setCurrentSelector(null);
    };

    const handleRowClick = (rowData: any) => {
      setSelectedRowData(rowData);
    };

    const parseIds = (ids: string): number[] => {
      return ids
        .split("|")
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));
    };

    const getRowData = (selector: string | null) => {
      if (!selector) return [];
      switch (selector) {
        case "FirstIDProgramTemplate":
          return programTemplates;
        case "SelMenuIDForMain":
          return defaultRibbons;
        case "LessonLearnedForm":
        case "CommentFormTemplate":
        case "ProcedureFormTemplate":
          return entityTypes;
        case "LessonLearnedAfTemplate":
          return wfTemplates;
        case "DefaultBtn":
        case "LetterBtns":
        case "MeetingBtns":
          return afButtons;
        default:
          return [];
      }
    };

    const defaultBtnIds = parseIds(configData.DefaultBtn);
    const letterBtnIds = parseIds(configData.LetterBtns);
    const meetingBtnIds = parseIds(configData.MeetingBtns);

    const handleSave = async (): Promise<ConfigurationItem | null> => {
      // حالا کلیدها به درستی در configData موجود هستند
      const result = await handleSaveConfiguration(configData);
      return result;
    };

    useImperativeHandle(ref, () => ({
      save: handleSave,
    }));

    return (
      <div>
        <TwoColumnLayout>
          <DynamicInput
            name="Name"
            type="text"
            value={configData.Name}
            onChange={(e) => handleChange("Name", e.target.value)}
            required
            loading={loading}
          />

          <CustomTextarea
            name="Description"
            value={configData.Description}
            onChange={(e) => handleChange("Description", e.target.value)}
            placeholder=""
            className={`${descriptionError ? "border-red-500" : "border-gray-300"}`}
          />

          <DynamicSelector
            name="FirstIDProgramTemplate"
            options={programTemplates.map((pt) => ({
              value: pt.ID.toString(),
              label: pt.Name,
            }))}
            selectedValue={configData.FirstIDProgramTemplate}
            onChange={(e) => handleChange("FirstIDProgramTemplate", e.target.value)}
            label="Program Template"
            showButton={true}
            onButtonClick={() => handleOpenModal("FirstIDProgramTemplate")}
            loading={loading}
            className="-mt-5"
          />

          <DynamicSelector
            name="SelMenuIDForMain"
            options={defaultRibbons.map((dr) => ({
              value: dr.ID.toString(),
              label: dr.Name,
            }))}
            selectedValue={configData.SelMenuIDForMain}
            onChange={(e) => handleChange("SelMenuIDForMain", e.target.value)}
            label="Default Ribbon"
            showButton={true}
            onButtonClick={() => handleOpenModal("SelMenuIDForMain")}
            loading={loading}
            className="-mt-5"
          />

          <DynamicSelector
            name="EnityTypeIDForLessonLearn"
            options={entityTypes.map((llf) => ({
              value: llf.ID.toString(),
              label: llf.Name,
            }))}
            selectedValue={configData.EnityTypeIDForLessonLearn}
            onChange={(e) => handleChange("EnityTypeIDForLessonLearn", e.target.value)}
            label="Lesson Learned Form"
            showButton={true}
            onButtonClick={() => handleOpenModal("LessonLearnedForm")}
            loading={loading}
            className="-mt-5"
          />

          <DynamicSelector
            name="WFTemplateIDForLessonLearn"
            options={wfTemplates.map((wf) => ({
              value: wf.ID.toString(),
              label: wf.Name,
            }))}
            selectedValue={configData.WFTemplateIDForLessonLearn}
            onChange={(e) => handleChange("WFTemplateIDForLessonLearn", e.target.value)}
            label="Lesson Learned Af Template"
            showButton={true}
            onButtonClick={() => handleOpenModal("LessonLearnedAfTemplate")}
            loading={loading}
            className="-mt-5"
          />

          <DynamicSelector
            name="EnityTypeIDForTaskCommnet"
            options={entityTypes.map((cft) => ({
              value: cft.ID.toString(),
              label: cft.Name,
            }))}
            selectedValue={configData.EnityTypeIDForTaskCommnet}
            onChange={(e) => handleChange("EnityTypeIDForTaskCommnet", e.target.value)}
            label="Comment Form Template"
            showButton={true}
            onButtonClick={() => handleOpenModal("CommentFormTemplate")}
            className="-mt-5"
            loading={loading}
          />

          <DynamicSelector
            name="EnityTypeIDForProcesure"
            options={entityTypes.map((pft) => ({
              value: pft.ID.toString(),
              label: pft.Name,
            }))}
            selectedValue={configData.EnityTypeIDForProcesure}
            onChange={(e) => handleChange("EnityTypeIDForProcesure", e.target.value)}
            label="Procedure Form Template"
            showButton={true}
            onButtonClick={() => handleOpenModal("ProcedureFormTemplate")}
            className="-mt-5"
            loading={loading}
          />

          <ListSelector
            title="Default Action Buttons"
            columnDefs={[
              { headerName: "Name", field: "Name" },
              { headerName: "Tooltip", field: "Tooltip" },
            ]}
            rowData={afButtons
              .filter((btn) => btn.ID !== undefined)
              .map((btn) => ({
                ID: btn.ID as number,
                Name: btn.Name,
              }))}
            selectedIds={defaultBtnIds}
            onSelectionChange={(selectedIds) => handleSelectionChange("DefaultBtn", selectedIds)}
            isGlobal={false}
            ModalContentComponent={ButtonComponent}
            modalContentProps={{
              columnDefs: [
                { headerName: "Name", field: "Name" },
                { headerName: "Tooltip", field: "Tooltip" },
              ],
              rowData: afButtons,
              onClose: handleCloseModal,
              onRowSelect: handleSelectButtonClick,
              onSelectFromButton: handleSelectButtonClick,
            }}
            loading={loading}
          />

          <ListSelector
            title="Letter Action Buttons"
            columnDefs={[
              { headerName: "Name", field: "Name" },
              { headerName: "Tooltip", field: "Tooltip" },
            ]}
            rowData={afButtons
              .filter((btn) => btn.ID !== undefined)
              .map((btn) => ({
                ID: btn.ID as number,
                Name: btn.Name,
              }))}
            selectedIds={letterBtnIds}
            onSelectionChange={(selectedIds) => handleSelectionChange("LetterBtns", selectedIds)}
            isGlobal={false}
            ModalContentComponent={ButtonComponent}
            modalContentProps={{
              columnDefs: [
                { headerName: "Name", field: "Name" },
                { headerName: "Tooltip", field: "Tooltip" },
              ],
              rowData: afButtons,
              selectedRow: selectedRowData,
              onClose: handleCloseModal,
              onRowSelect: handleSelectButtonClick,
              onSelectFromButton: handleSelectButtonClick,
              isSelectDisabled: !selectedRowData,
            }}
            loading={loading}
          />

          <ListSelector
            title="Meeting Action Buttons"
            columnDefs={[
              { headerName: "Name", field: "Name" },
              { headerName: "Tooltip", field: "Tooltip" },
            ]}
            rowData={afButtons
              .filter((btn) => btn.ID !== undefined)
              .map((btn) => ({
                ID: btn.ID as number,
                Name: btn.Name,
              }))}
            selectedIds={meetingBtnIds}
            onSelectionChange={(selectedIds) => handleSelectionChange("MeetingBtns", selectedIds)}
            isGlobal={false}
            ModalContentComponent={ButtonComponent}
            modalContentProps={{
              columnDefs: [
                { headerName: "نام", field: "Name" },
                { headerName: "توضیحات", field: "EntityCateADescription" },
              ],
              rowData: afButtons,
              selectedRow: selectedRowData,
              onRowDoubleClick: handleSelectButtonClick,
              onRowClick: handleRowClick,
              onSelectButtonClick: handleSelectButtonClick,
              isSelectDisabled: !selectedRowData,
            }}
            loading={loading}
          />
        </TwoColumnLayout>

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
  }
);

export default Configuration;
