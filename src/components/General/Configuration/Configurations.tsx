import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../../layout/TwoColumnLayout";
import CustomTextarea from "../../utilities/DynamicTextArea";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import ListSelector from "../../ListSelector/ListSelector";
import { subTabDataMapping, buttons } from "../../Views/tab/tabData";
import DynamicModal from "../../utilities/DynamicModal";
import TableSelector from "../Configuration/TableSelector";
import ButtonComponent from "../Configuration/ButtonComponent";

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

  const parseIds = (ids: string): number[] => {
    return ids
      .split("|")
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));
  };

  const handleSelectionChange = (
    field: keyof typeof configData,
    selectedIds: (string | number)[]
  ) => {
    const idsString = selectedIds.join("|") + "|";
    handleChange(field, idsString);
  };

  const defaultBtnIds = parseIds(configData.DefaultBtn);
  const letterBtnIds = parseIds(configData.LetterBtns);
  const meetingBtnIds = parseIds(configData.MeetingBtns);

  useEffect(() => {
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
      EntityTypeIDForTaskComment: selectedRow?.EntityTypeIDForTaskComment || "",
      EntityTypeIDForProcedure: selectedRow?.EntityTypeIDForProcedure || "",
    });
  }, [selectedRow]);

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
          placeholder="Enter description (min 10 characters)"
          className={`${
            descriptionError ? "border-red-500" : "border-gray-300"
          }`}
        />

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
        />

        <DynamicSelector
          options={subTabDataMapping["DefaultRibbon"].rowData.map((dr) => ({
            value: dr.ID.toString(),
            label: dr.Name,
          }))}
          selectedValue={configData.SelMenuIDForMain}
          onChange={(e) => handleChange("SelMenuIDForMain", e.target.value)}
          label="Default Ribbon"
        />

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
          className="mt-7"
        />

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
          className="mt-7"
        />

        <DynamicSelector
          options={subTabDataMapping["Comment Form Template"].rowData.map(
            (cft) => ({
              value: cft.ID.toString(),
              label: cft.Name,
            })
          )}
          selectedValue={configData.EntityTypeIDForTaskComment}
          onChange={(e) =>
            handleChange("EntityTypeIDForTaskComment", e.target.value)
          }
          label="Comment Form Template"
          className="mt-7"
        />

        <DynamicSelector
          options={subTabDataMapping["Procedure Form Template"].rowData.map(
            (pft) => ({
              value: pft.ID.toString(),
              label: pft.Name,
            })
          )}
          selectedValue={configData.EntityTypeIDForProcedure}
          onChange={(e) =>
            handleChange("EntityTypeIDForProcedure", e.target.value)
          }
          label="Procedure Form Template"
          className="mt-7"
        />

        {/* Default Action Buttons with ButtonComponent */}
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
          }}
        />

        {/* Letter Action Buttons with ButtonComponent */}
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
          }}
        />

        {/* Meeting Action Buttons with TableSelector */}
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
          }}
        />
      </TwoColumnLayout>
    </div>
  );
};

export default Configuration;
