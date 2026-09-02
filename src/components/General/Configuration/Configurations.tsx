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
import { useTranslation } from "react-i18next";

interface ConfigurationProps {
  selectedRow: any;
  onSave?: (data: ConfigurationItem) => void;
}

export interface ConfigurationHandle {
  save: () => Promise<ConfigurationItem | null>;
  checkNameFilled: () => boolean;
}

const Configuration = forwardRef<ConfigurationHandle, ConfigurationProps>(
  ({ selectedRow }, ref) => {
    const { t, i18n } = useTranslation();
    const api = useApi();

    const [configData, setConfigData] = useState({
      id: "",
      Name: "",
      FirstIDProgramTemplate: "",
      SelMenuIDForMain: "",
      Description: "",
      IsVisible: true,
      LastModified: "",
      DefaultBtn: "",
      LetterBtns: "",
      MeetingBtns: "",
      MeetingBtnsForSecondForm: "",
      EnityTypeIDForLessonLearn: "",
      EnityTypeIDForTaskCommnet: "",
      EnityTypeIDForProcesure: "",
      WFTemplateIDForLessonLearn: "",
    });

    const [descriptionError, setDescriptionError] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentSelector, setCurrentSelector] = useState<
      | "DefaultBtn"
      | "LetterBtns"
      | "MeetingBtns"
      | "MeetingBtnsForSecondForm"
      | "FirstIDProgramTemplate"
      | "SelMenuIDForMain"
      | "Lesson Learned Form"
      | "Lesson Learned Af Template"
      | "Comment Form Template"
      | "Procedure Form Template"
      | null
    >(null);

    const [selectedRowData, setSelectedRowData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const [programTemplates, setProgramTemplates] = useState<
      ProgramTemplateItem[]
    >([]);
    const [defaultRibbons, setDefaultRibbons] = useState<DefaultRibbonItem[]>(
      []
    );
    const [entityTypes, setEntityTypes] = useState<EntityTypeItem[]>([]);
    const [wfTemplates, setWfTemplates] = useState<WfTemplateItem[]>([]);
    const [afButtons, setAfButtons] = useState<AFBtnItem[]>([]);

    const mapWFStateForDeemedToRadio = (val?: number): string => {
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

    const mapWFCommandToRadio = (val?: number): string => {
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

    const buildDisplayName = (
      stateRadio: string,
      commandRadio: string,
      stateText: string
    ) => {
      const stateLabelMap: Record<string, string> = {
        accept: "Accept",
        reject: "Reject",
        close: "Close",
      };
      const cmdLabelMap: Record<string, string> = {
        accept: "Accept",
        reject: "Reject",
        close: "Close",
        client: "Previous State Client",
        admin: "Previous State Admin",
      };
      const stateLabel = stateLabelMap[stateRadio] ?? "";
      const commandLabel = cmdLabelMap[commandRadio] ?? "";
      const base = stateText?.trim() || stateLabel;
      return `${base} (State: ${stateLabel} - Command: ${commandLabel})`;
    };

    useImperativeHandle(ref, () => ({
      save: handleSave,
      checkNameFilled: () => configData.Name.trim().length > 0,
    }));

    const handleChange = (
      field: keyof typeof configData,
      value: string | number
    ) => {
      setConfigData((prev) => ({
        ...prev,
        [field]: value.toString(),
      }));
      if (field === "Description" && typeof value === "string") {
        setDescriptionError(value.length < 10);
      }
    };

    const handleSave = async (): Promise<ConfigurationItem | null> => {
      try {
        setLoading(true);

        const newConfig: ConfigurationItem = {
          ...(configData.id && { ID: parseInt(configData.id) }),
          Name: configData.Name,
          Description: configData.Description,
          DefaultBtn: configData.DefaultBtn,
          LetterBtns: configData.LetterBtns,
          MeetingBtns: configData.MeetingBtns,
          MeetingBtnsForSecondForm: configData.MeetingBtnsForSecondForm,
          FirstIDProgramTemplate:
            Number(configData.FirstIDProgramTemplate) || 0,
          SelMenuIDForMain: Number(configData.SelMenuIDForMain) || 0,
          IsVisible: configData.IsVisible,
          LastModified: new Date().toISOString(),
          EnityTypeIDForLessonLearn:
            Number(configData.EnityTypeIDForLessonLearn) || 0,
          EnityTypeIDForTaskCommnet:
            Number(configData.EnityTypeIDForTaskCommnet) || 0,
          EnityTypeIDForProcesure:
            Number(configData.EnityTypeIDForProcesure) || 0,
          WFTemplateIDForLessonLearn:
            Number(configData.WFTemplateIDForLessonLearn) || 0,
        };

        let updatedConfig: ConfigurationItem;
        if (newConfig.ID) {
          updatedConfig = await api.updateConfiguration(newConfig);
        } else {
          updatedConfig = await api.insertConfiguration(newConfig);
        }

        return updatedConfig;
      } catch (error: any) {
        throw error;
      } finally {
        setLoading(false);
      }
    };

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
        case "MeetingBtnsForSecondForm":
          return afButtons;
        default:
          return [];
      }
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
        const fieldMap: { [key: string]: keyof typeof configData } = {
          DefaultBtn: "DefaultBtn",
          LetterBtns: "LetterBtns",
          MeetingBtns: "MeetingBtns",
          MeetingBtnsForSecondForm: "MeetingBtnsForSecondForm",
          FirstIDProgramTemplate: "FirstIDProgramTemplate",
          SelMenuIDForMain: "SelMenuIDForMain",
          "Lesson Learned Form": "EnityTypeIDForLessonLearn",
          "Lesson Learned Af Template": "WFTemplateIDForLessonLearn",
          "Comment Form Template": "EnityTypeIDForTaskCommnet",
          "Procedure Form Template": "EnityTypeIDForProcesure",
        };
        const field = fieldMap[currentSelector];
        if (field) {
          const selectedId = selectedRowData.ID.toString();
          handleChange(field, selectedId);
          handleCloseModal();
        }
      }
    };

    const handleOpenModal = (
      selector:
        | "DefaultBtn"
        | "LetterBtns"
        | "MeetingBtns"
        | "MeetingBtnsForSecondForm"
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

    const handleRowClick = (rowData: any) => {
      setSelectedRowData(rowData);
    };

    const parseIds = (ids: string): number[] => {
      return ids
        .split("|")
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));
    };

    const defaultBtnIds = parseIds(configData.DefaultBtn);
    const letterBtnIds = parseIds(configData.LetterBtns);
    const meetingBtnIds = parseIds(configData.MeetingBtns);
    const meetingBtnsSecondFormIds = parseIds(
      configData.MeetingBtnsForSecondForm
    );

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

          const decoratedBtns: AFBtnItem[] = afButtonsData.map((b) => ({
            ...b,
            DisplayName: buildDisplayName(
              mapWFStateForDeemedToRadio(b.WFStateForDeemed),
              mapWFCommandToRadio(b.WFCommand),
              b.StateText ?? ""
            ),
          }));

          setProgramTemplates(templates);
          setDefaultRibbons(ribbons);
          setEntityTypes(entities);
          setWfTemplates(wfTemplatesData);
          setAfButtons(decoratedBtns);
        } catch (error) {
          console.error("Error fetching initial data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchInitialData();
    }, [api]);

    useEffect(() => {
      if (selectedRow) {
        setConfigData({
          id: selectedRow?.ID?.toString() || "",
          Name: selectedRow?.Name || "",
          FirstIDProgramTemplate: (selectedRow?.FirstIDProgramTemplate || "")
            .toString()
            .replace(/\|+$/, ""),
          SelMenuIDForMain: (selectedRow?.SelMenuIDForMain || "")
            .toString()
            .replace(/\|+$/, ""),
          Description: selectedRow?.Description || "",
          IsVisible: selectedRow?.IsVisible ?? true,
          LastModified: selectedRow?.LastModified || "",
          DefaultBtn: selectedRow?.DefaultBtn || "",
          LetterBtns: selectedRow?.LetterBtns || "",
          MeetingBtns: selectedRow?.MeetingBtns || "",
          MeetingBtnsForSecondForm: selectedRow?.MeetingBtnsForSecondForm || "",
          EnityTypeIDForLessonLearn: (
            selectedRow?.EnityTypeIDForLessonLearn || ""
          )
            .toString()
            .replace(/\|+$/, ""),
          EnityTypeIDForTaskCommnet: (
            selectedRow?.EnityTypeIDForTaskCommnet || ""
          )
            .toString()
            .replace(/\|+$/, ""),
          EnityTypeIDForProcesure: (selectedRow?.EnityTypeIDForProcesure || "")
            .toString()
            .replace(/\|+$/, ""),
          WFTemplateIDForLessonLearn: (
            selectedRow?.WFTemplateIDForLessonLearn || ""
          )
            .toString()
            .replace(/\|+$/, ""),
        });
      } else {
        setConfigData({
          id: "",
          Name: "",
          FirstIDProgramTemplate: "",
          SelMenuIDForMain: "",
          Description: "",
          IsVisible: true,
          LastModified: "",
          DefaultBtn: "",
          LetterBtns: "",
          MeetingBtns: "",
          MeetingBtnsForSecondForm: "",
          EnityTypeIDForLessonLearn: "",
          EnityTypeIDForTaskCommnet: "",
          EnityTypeIDForProcesure: "",
          WFTemplateIDForLessonLearn: "",
        });
      }
    }, [selectedRow]);

    const refreshButtons = async () => {
      const data = await api.getAllAfbtn();
      const decorated = data.map((b) => ({
        ...b,
        DisplayName: buildDisplayName(
          mapWFStateForDeemedToRadio(b.WFStateForDeemed),
          mapWFCommandToRadio(b.WFCommand),
          b.StateText ?? ""
        ),
      }));
      setAfButtons(decorated);
    };

    return (
      <div>
        <TwoColumnLayout>
          {/* Name */}
          <DynamicInput
            name={t("Configuration.Name")}
            type="text"
            value={configData.Name}
            onChange={(e) => handleChange("Name", e.target.value)}
            required
            loading={loading}
            maxLength={50}
            showCharCount={true}
            data-testid="new-config-name-input"
          />

          {/* Description */}
          <CustomTextarea
            name={t("Configuration.Description")}
            value={configData.Description}
            onChange={(e) => handleChange("Description", e.target.value)}
            placeholder=""
            className={descriptionError ? "border-red-500" : "border-gray-300"}
          />

          {/* Program Template */}
          <DynamicSelector
            name="FirstIDProgramTemplate"
            options={programTemplates.map((pt) => ({
              value: pt.ID.toString(),
              label: pt.Name,
            }))}
            selectedValue={configData.FirstIDProgramTemplate}
            onChange={(e) =>
              handleChange("FirstIDProgramTemplate", e.target.value)
            }
            label={t("Configuration.ProgramTemplate")}
            showButton={true}
            onButtonClick={() => handleOpenModal("FirstIDProgramTemplate")}
            loading={loading}
            className="mt-1"
          />

          {/* Default Ribbon */}
          <DynamicSelector
            name="SelMenuIDForMain"
            options={defaultRibbons.map((dr) => ({
              value: dr.ID.toString(),
              label: dr.Name,
            }))}
            selectedValue={configData.SelMenuIDForMain}
            onChange={(e) => handleChange("SelMenuIDForMain", e.target.value)}
            label={t("Configuration.DefaultRibbon")}
            showButton={true}
            onButtonClick={() => handleOpenModal("SelMenuIDForMain")}
            loading={loading}
            className="mt-1"
          />

          {/* Lesson Learned Form */}
          <DynamicSelector
            name="EnityTypeIDForLessonLearn"
            options={entityTypes.map((llf) => ({
              value: llf.ID.toString(),
              label: llf.Name,
            }))}
            selectedValue={configData.EnityTypeIDForLessonLearn}
            onChange={(e) =>
              handleChange("EnityTypeIDForLessonLearn", e.target.value)
            }
            label={t("Configuration.LessonLearnedForm")}
            showButton={true}
            onButtonClick={() => handleOpenModal("Lesson Learned Form")}
            className="mt-1"
            loading={loading}
          />

          {/* Lesson Learned Af Template */}
          <DynamicSelector
            name="WFTemplateIDForLessonLearn"
            options={wfTemplates.map((wf) => ({
              value: wf.ID.toString(),
              label: wf.Name,
            }))}
            selectedValue={configData.WFTemplateIDForLessonLearn}
            onChange={(e) =>
              handleChange("WFTemplateIDForLessonLearn", e.target.value)
            }
            label={t("Configuration.LessonLearnedAfTemplate")}
            showButton={true}
            onButtonClick={() => handleOpenModal("Lesson Learned Af Template")}
            className="mt-1"
            loading={loading}
          />

          {/* Comment Form Template */}
          <DynamicSelector
            name="EnityTypeIDForTaskCommnet"
            options={entityTypes.map((cft) => ({
              value: cft.ID.toString(),
              label: cft.Name,
            }))}
            selectedValue={configData.EnityTypeIDForTaskCommnet}
            onChange={(e) =>
              handleChange("EnityTypeIDForTaskCommnet", e.target.value)
            }
            label={t("Configuration.CommentFormTemplate")}
            showButton={true}
            onButtonClick={() => handleOpenModal("Comment Form Template")}
            className="mt-1"
            loading={loading}
          />

          {/* Procedure Form Template */}
          <DynamicSelector
            name="EnityTypeIDForProcesure"
            options={entityTypes.map((pft) => ({
              value: pft.ID.toString(),
              label: pft.Name,
            }))}
            selectedValue={configData.EnityTypeIDForProcesure}
            onChange={(e) =>
              handleChange("EnityTypeIDForProcesure", e.target.value)
            }
            label={t("Configuration.ProcedureFormTemplate")}
            showButton={true}
            onButtonClick={() => handleOpenModal("Procedure Form Template")}
            className="mt-1"
            loading={loading}
          />

          {/* Default Action Buttons */}
          <ListSelector
            title={t("Configuration.DefaultActionButtons")}
            className="mt-1"
            columnDefs={[
              { headerName: "Name", field: "Name" },
              { headerName: "Tooltip", field: "Tooltip" },
            ]}
            rowData={afButtons}
            selectedIds={defaultBtnIds}
            onSelectionChange={(selectedIds) =>
              handleSelectionChange("DefaultBtn", selectedIds)
            }
            showSwitcher={false}
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
              refreshButtons,
            }}
            loading={loading}
          />

          {/* Letter Action Buttons */}
          <ListSelector
            title={t("Configuration.LetterActionButtons")}
            className="mt-1"
            columnDefs={[
              { headerName: "Name", field: "Name" },
              { headerName: "Tooltip", field: "Tooltip" },
            ]}
            rowData={afButtons}
            selectedIds={letterBtnIds}
            onSelectionChange={(selectedIds) =>
              handleSelectionChange("LetterBtns", selectedIds)
            }
            showSwitcher={false}
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
              refreshButtons,
            }}
            loading={loading}
          />

          {/* Meeting Action Buttons For First Form (MeetingBtns) */}
          <ListSelector
            title={t("Configuration.MeetingActionButtonsFirstForm")}
            className="mt-1"
            columnDefs={[
              { headerName: "Name", field: "Name" },
              { headerName: "Tooltip", field: "Tooltip" },
            ]}
            rowData={afButtons}
            selectedIds={meetingBtnIds}
            onSelectionChange={(selectedIds) =>
              handleSelectionChange("MeetingBtns", selectedIds)
            }
            showSwitcher={false}
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
              refreshButtons,
            }}
            loading={loading}
          />

          {/* Meeting Action Buttons For Second Form (MeetingBtnsForSecondForm) */}
          <ListSelector
            title={t("Configuration.MeetingActionButtonsSecondForm")}
            className="mt-1"
            columnDefs={[
              { headerName: "Name", field: "Name" },
              { headerName: "Tooltip", field: "Tooltip" },
            ]}
            rowData={afButtons}
            selectedIds={meetingBtnsSecondFormIds}
            onSelectionChange={(selectedIds) =>
              handleSelectionChange("MeetingBtnsForSecondForm", selectedIds)
            }
            showSwitcher={false}
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
              refreshButtons,
            }}
            loading={loading}
          />
        </TwoColumnLayout>

        {/* Modal عمومی */}
        <DynamicModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          size="normal"
        >
          <TableSelector
            columnDefs={[
              {
                headerName: t("TableSelector.Name", {
                  defaultValue: i18n.language === "fa" ? "نام" : "Name",
                }),
                field: "Name",
              },
              {
                headerName: "IsDoc",
                field: "IsDoc",
                cellRenderer: "agCheckboxCellRenderer",
                cellRendererParams: { disabled: true },
                editable: false,
                maxWidth: 90,
              },
              {
                headerName: t("TableSelector.CateA", {
                  defaultValue: i18n.language === "fa" ? "دسته بندی A" : "Cat A",
                }),
                field: "EntityCateAName",
              },
              {
                headerName: t("TableSelector.CateB", {
                  defaultValue: i18n.language === "fa" ? "دسته بندی B" : "Cat B",
                }),
                field: "EntityCateBName",
              },
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