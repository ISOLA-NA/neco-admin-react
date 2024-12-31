// src/components/General/CommandSettings.tsx

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import DynamicSelector from "../utilities/DynamicSelector";
import { useAddEditDelete } from "../../context/AddEditDeleteContext";
import { CommandItem } from "../../services/api.services";

export interface CommandHandle {
  save: () => Promise<CommandItem | null>;
}

interface CommandProps {
  selectedRow: any;
}

const CommandSettings = forwardRef<CommandHandle, CommandProps>(
  ({ selectedRow }, ref) => {
    const { handleSaveCommand } = useAddEditDelete();

    const [commandData, setCommandData] = useState({
      id: selectedRow?.ID?.toString() || "",
      Name: selectedRow?.Name || "",
      Describtion: selectedRow?.Describtion || "",
      MainColumnIDName: selectedRow?.MainColumnIDName || "",
      GroupName: selectedRow?.GroupName || "",
      gridCmd: selectedRow?.gridCmd || "",
      tabCmd: selectedRow?.tabCmd || "",
      QR: selectedRow?.QR || "",
      ViewMode: selectedRow?.ViewMode || null,
      DefaultColumns: selectedRow?.DefaultColumns || null,
      ReportParam: selectedRow?.ReportParam || null,
      projectIntensive:
        selectedRow?.projectIntensive === undefined
          ? true
          : selectedRow.projectIntensive,
      ColorColumn: selectedRow?.ColorColumn || "",
      InvisibleColumns: selectedRow?.InvisibleColumns || "",
      ApiColumns: selectedRow?.ApiColumns || "",
      SpParam: selectedRow?.SpParam || "",
      CmdType: selectedRow?.CmdType || 0,
    });

    useEffect(() => {
      setCommandData({
        id: selectedRow?.ID?.toString() || "",
        Name: selectedRow?.Name || "",
        Describtion: selectedRow?.Describtion || "",
        MainColumnIDName: selectedRow?.MainColumnIDName || "",
        GroupName: selectedRow?.GroupName || "",
        gridCmd: selectedRow?.gridCmd || "",
        tabCmd: selectedRow?.tabCmd || "",
        QR: selectedRow?.QR || "",
        ViewMode: selectedRow?.ViewMode || null,
        DefaultColumns: selectedRow?.DefaultColumns || null,
        ReportParam: selectedRow?.ReportParam || null,
        projectIntensive:
          selectedRow?.projectIntensive === undefined
            ? true
            : selectedRow.projectIntensive,
        ColorColumn: selectedRow?.ColorColumn || "",
        InvisibleColumns: selectedRow?.InvisibleColumns || "",
        ApiColumns: selectedRow?.ApiColumns || "",
        SpParam: selectedRow?.SpParam || "",
        CmdType: selectedRow?.CmdType || 0,
      });
    }, [selectedRow]);

    const handleChange = (
      field: keyof typeof commandData,
      value: string | boolean | number | null
    ) => {
      setCommandData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    // API Mode Selector نمونه
    const apiModes = [
      { value: "apiMode1", label: "API Mode 1" },
      { value: "apiMode2", label: "API Mode 2" },
    ];

    // View Mode Selector نمونه
    const viewModes = [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
      { value: "option3", label: "Option 3" },
    ];

    // متد اصلی ذخیره (برای forwardRef)
    const save = async (): Promise<CommandItem | null> => {
      const result = await handleSaveCommand(commandData);
      return result;
    };

    // Expose the `save` method to parent (TabContent) via ref
    useImperativeHandle(ref, () => ({
      save,
    }));

    return (
      <TwoColumnLayout>
        {/* Name */}
        <DynamicInput
          name="Name"
          type="text"
          value={commandData.Name}
          placeholder=""
          onChange={(e) => handleChange("Name", e.target.value)}
        />

        {/* Describtion */}
        <CustomTextarea
          name="Describtion"
          value={commandData.Describtion || ""}
          placeholder=""
          onChange={(e) => handleChange("Describtion", e.target.value)}
        />

        {/* ViewMode */}
        <DynamicSelector
          name="ViewMode"
          options={viewModes}
          selectedValue={commandData.ViewMode || ""}
          onChange={(e) => handleChange("ViewMode", e.target.value)}
          label="View Mode"
        />

        {/* MainColumnIDName */}
        <DynamicInput
          name="MainColumnIDName"
          type="text"
          value={commandData.MainColumnIDName || ""}
          placeholder=""
          onChange={(e) => handleChange("MainColumnIDName", e.target.value)}
        />

        {/* GroupName */}
        <DynamicInput
          name="GroupName"
          type="text"
          value={commandData.GroupName || ""}
          placeholder=""
          onChange={(e) => handleChange("GroupName", e.target.value)}
        />

        {/* gridCmd */}
        <DynamicInput
          name="gridCmd"
          type="text"
          value={commandData.gridCmd || ""}
          placeholder=""
          onChange={(e) => handleChange("gridCmd", e.target.value)}
        />

        {/* tabCmd */}
        <DynamicInput
          name="tabCmd"
          type="text"
          value={commandData.tabCmd || ""}
          placeholder=""
          onChange={(e) => handleChange("tabCmd", e.target.value)}
        />

        {/* QR */}
        <DynamicInput
          name="QR"
          type="text"
          value={commandData.QR || ""}
          placeholder=""
          onChange={(e) => handleChange("QR", e.target.value)}
        />

        {/* DefaultColumns */}
        <CustomTextarea
          name="DefaultColumns"
          value={commandData.DefaultColumns || ""}
          placeholder=""
          onChange={(e) => handleChange("DefaultColumns", e.target.value)}
        />

        {/* ReportParam */}
        <CustomTextarea
          name="ReportParam"
          value={commandData.ReportParam || ""}
          placeholder=""
          onChange={(e) => handleChange("ReportParam", e.target.value)}
        />

        {/* projectIntensive (checkbox به عنوان نمونه) */}
        <div className="flex items-center mt-4 space-x-2">
          <label htmlFor="projectIntensive" className="text-sm font-medium">
            projectIntensive:
          </label>
          <input
            id="projectIntensive"
            type="checkbox"
            checked={commandData.projectIntensive}
            onChange={(e) => handleChange("projectIntensive", e.target.checked)}
          />
        </div>

        {/* ColorColumn */}
        <DynamicInput
          name="ColorColumn"
          type="text"
          value={commandData.ColorColumn || ""}
          placeholder=""
          onChange={(e) => handleChange("ColorColumn", e.target.value)}
        />

        {/* InvisibleColumns */}
        <CustomTextarea
          name="InvisibleColumns"
          value={commandData.InvisibleColumns || ""}
          placeholder=""
          onChange={(e) => handleChange("InvisibleColumns", e.target.value)}
        />

        {/* ApiColumns */}
        <CustomTextarea
          name="ApiColumns"
          value={commandData.ApiColumns || ""}
          placeholder=""
          onChange={(e) => handleChange("ApiColumns", e.target.value)}
        />

        {/* SpParam */}
        <DynamicInput
          name="SpParam"
          type="text"
          value={commandData.SpParam || ""}
          placeholder=""
          onChange={(e) => handleChange("SpParam", e.target.value)}
        />

        {/* CmdType */}
        <DynamicInput
          name="CmdType"
          type="number"
          value={commandData.CmdType || 0}
          placeholder=""
          onChange={(e) =>
            handleChange("CmdType", parseInt(e.target.value || "0"))
          }
        />

        {/* نمونه انتخاب API Mode (اگر لازم است) */}
        <DynamicSelector
          name="ApiMode"
          options={apiModes}
          selectedValue="" // فعلاً فقط یک نمونه است
          onChange={(e) => console.log("API Mode changed:", e.target.value)}
          label="Api mode"
        />
      </TwoColumnLayout>
    );
  }
);

export default CommandSettings;
