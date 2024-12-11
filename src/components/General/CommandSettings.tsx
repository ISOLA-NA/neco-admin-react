// src/components/General/Command.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import DynamicSelector from "../utilities/DynamicSelector";

interface CommandProps {
  selectedRow: any;
}

const Command: React.FC<CommandProps> = ({ selectedRow }) => {
  const [commandData, setCommandData] = useState({
    name: "",
    description: "",
    viewMode: "",
    mainColumnId: "",
    colorColumns: "",
    groupName: "",
    query: "",
    hiddenColumns: "",
    defaultColumns: "",
    apiColumns: "",
    spParameters: "",
    apiMode: "",
    gridCommand: "",
    reportCommand: "",
  });

  useEffect(() => {
    console.log("Selected Row:", selectedRow); // برای دیباگ
    if (selectedRow) {
      setCommandData({
        name: selectedRow.name || "",
        description: selectedRow.description || "",
        viewMode: selectedRow.viewMode || "",
        mainColumnId: selectedRow.mainColumnId || "",
        colorColumns: selectedRow.colorColumns || "",
        groupName: selectedRow.groupName || "",
        query: selectedRow.query || "",
        hiddenColumns: selectedRow.hiddenColumns || "",
        defaultColumns: selectedRow.defaultColumns || "",
        apiColumns: selectedRow.apiColumns || "",
        spParameters: selectedRow.spParameters || "",
        apiMode: selectedRow.apiMode || "",
        gridCommand: selectedRow.gridCommand || "",
        reportCommand: selectedRow.reportCommand || "",
      });
    } else {
      setCommandData({
        name: "",
        description: "",
        viewMode: "",
        mainColumnId: "",
        colorColumns: "",
        groupName: "",
        query: "",
        hiddenColumns: "",
        defaultColumns: "",
        apiColumns: "",
        spParameters: "",
        apiMode: "",
        gridCommand: "",
        reportCommand: "",
      });
    }
  }, [selectedRow]);

  const handleChange = (field: keyof typeof commandData, value: string) => {
    setCommandData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const apiModes = [
    { value: "apiMode1", label: "API Mode 1" },
    { value: "apiMode2", label: "API Mode 2" },
  ];

  const viewModes = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ];

  return (
    <TwoColumnLayout>
      {/* Command Name */}
      <DynamicInput
        name="name"
        type="text"
        value={commandData.name}
        placeholder=""
        onChange={(e) => handleChange("name", e.target.value)}
      />

      {/* Command Description */}
      <CustomTextarea
        id="description"
        name="description"
        value={commandData.description}
        placeholder=""
        onChange={(e) => handleChange("description", e.target.value)}
      />

      {/* View Mode Selector */}
      <DynamicSelector
        options={viewModes}
        selectedValue={commandData.viewMode}
        onChange={(e) => handleChange("viewMode", e.target.value)}
        label="View Mode"
      />

      {/* سایر فیلدها به همین صورت */}
      <DynamicInput
        name="mainColumnId"
        type="text"
        value={commandData.mainColumnId}
        placeholder=""
        onChange={(e) => handleChange("mainColumnId", e.target.value)}
      />

      <DynamicInput
        name="colorColumns"
        type="text"
        value={commandData.colorColumns}
        placeholder=""
        onChange={(e) => handleChange("colorColumns", e.target.value)}
      />

      <DynamicInput
        name="groupName"
        type="text"
        value={commandData.groupName}
        placeholder=""
        onChange={(e) => handleChange("groupName", e.target.value)}
      />

      <CustomTextarea
        id="query"
        name="query"
        value={commandData.query}
        placeholder=""
        onChange={(e) => handleChange("query", e.target.value)}
      />

      <CustomTextarea
        id="hiddenColumns"
        name="hiddenColumns"
        value={commandData.hiddenColumns}
        placeholder=""
        onChange={(e) => handleChange("hiddenColumns", e.target.value)}
      />

      <CustomTextarea
        id="defaultColumns"
        name="defaultColumns"
        value={commandData.defaultColumns}
        placeholder=""
        onChange={(e) => handleChange("defaultColumns", e.target.value)}
      />

      <CustomTextarea
        id="apiColumns"
        name="apiColumns"
        value={commandData.apiColumns}
        placeholder=""
        onChange={(e) => handleChange("apiColumns", e.target.value)}
      />

      <CustomTextarea
        id="spParameters"
        name="spParameters"
        value={commandData.spParameters}
        placeholder=""
        onChange={(e) => handleChange("spParameters", e.target.value)}
      />

      {/* API Mode Selector */}
      <DynamicSelector
        options={apiModes}
        selectedValue={commandData.apiMode}
        onChange={(e) => handleChange("apiMode", e.target.value)}
        label="Api mode"
      />

      {/* Grid Command */}
      <DynamicInput
        name="gridCommand"
        type="text"
        value={commandData.gridCommand}
        placeholder=""
        onChange={(e) => handleChange("gridCommand", e.target.value)}
      />

      {/* Report Command */}
      <DynamicInput
        name="reportCommand"
        type="text"
        value={commandData.reportCommand}
        placeholder=""
        onChange={(e) => handleChange("reportCommand", e.target.value)}
      />
    </TwoColumnLayout>
  );
};

export default Command;
