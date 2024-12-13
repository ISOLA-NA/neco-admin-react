// src/components/General/ApprovalFlow.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import ListSelector from "../ListSelector/ListSelector";
import TableSelector from "../General/Configuration/TableSelector"; // فرض بر اینکه TableSelector در این مسیر قرار دارد

interface ApprovalFlowProps {
  selectedRow: any;
}

const relatedProjectsData = [
  {
    ID: "642bc0ce-4d93-474b-a869-6101211533d4",
    ProjectName: "Project Alpha",
    Name: "Project Alpha",
    IsVisible: true,
    IsIdea: false,
    State: "Active",
  },
  {
    ID: "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    ProjectName: "Project Beta",
    Name: "Project Beta",
    IsVisible: true,
    IsIdea: false,
    State: "Planning",
  },
  // پروژه‌های بیشتر در صورت نیاز...
];

function getAssociatedProjects(
  projectsStr?: string,
  projectsData?: { ID: string; Name: string }[]
) {
  const safeProjectsData = projectsData || [];
  const safeProjectsStr = projectsStr || "";
  const projectsArray = safeProjectsStr.split("|").filter(Boolean);
  return safeProjectsData.filter((project) =>
    projectsArray.includes(project.ID)
  );
}

const ApprovalFlow: React.FC<ApprovalFlowProps> = ({ selectedRow }) => {
  const [approvalFlowData, setApprovalFlowData] = useState<{
    ID: string | number;
    Name: string;
    Description: string;
    ProjectsStr: string;
    IsGlobal: boolean;
  }>({
    ID: "",
    Name: "",
    Description: "",
    ProjectsStr: "",
    IsGlobal: false,
  });

  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  useEffect(() => {
    if (selectedRow) {
      setApprovalFlowData({
        ID: selectedRow.ID || "",
        Name: selectedRow.Name || "",
        Description: selectedRow.Description || "",
        ProjectsStr: selectedRow.ProjectsStr || "",
        IsGlobal: selectedRow.IsGlobal || false,
      });
    } else {
      setApprovalFlowData({
        ID: "",
        Name: "",
        Description: "",
        ProjectsStr: "",
        IsGlobal: false,
      });
    }
  }, [selectedRow]);

  const handleChange = (
    field: keyof typeof approvalFlowData,
    value: string | boolean | (string | number)[]
  ) => {
    setApprovalFlowData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const projectColumnDefs = [{ field: "Name", headerName: "Project Name" }];

  const handleProjectsChange = (selectedIds: (string | number)[]) => {
    const newProjectsStr =
      selectedIds.length > 0 ? selectedIds.join("|") + "|" : "";
    handleChange("ProjectsStr", newProjectsStr);
  };

  const handleGlobalChange = (isGlobal: boolean) => {
    handleChange("IsGlobal", isGlobal);
  };

  const associatedProjects = getAssociatedProjects(
    approvalFlowData.ProjectsStr,
    relatedProjectsData
  );
  const selectedProjectIds = associatedProjects.map((p) => p.ID);

  // مدیریت انتخاب سطر در مودال ListSelector
  const handleRowClick = (row: any) => {
    setSelectedRowData(row);
  };

  const handleSelectButtonClick = () => {
    if (selectedRowData) {
      // افزودن پروژه انتخابی به لیست
      const currentSelectedIds = selectedProjectIds.map((id) => id.toString());
      // جلوگیری از اضافه شدن تکراری
      if (!currentSelectedIds.includes(selectedRowData.ID)) {
        const newSelection = [...currentSelectedIds, selectedRowData.ID];
        handleProjectsChange(newSelection);
      }
      setSelectedRowData(null);
    }
  };

  const handleRowDoubleClick = () => {
    handleSelectButtonClick();
  };

  return (
    <TwoColumnLayout>
      {/* Approval Flow Name Input */}
      <DynamicInput
        name="Approval Flow Name"
        type="text"
        value={approvalFlowData.Name}
        placeholder=""
        onChange={(e) => handleChange("Name", e.target.value)}
        required={true}
      />

      {/* Description Textarea */}
      <CustomTextarea
        id="Description"
        name="Description"
        value={approvalFlowData.Description}
        placeholder=""
        onChange={(e) => handleChange("Description", e.target.value)}
      />

      {/* Related Projects List Selector */}
      <ListSelector
        title="Related Projects"
        columnDefs={projectColumnDefs}
        rowData={relatedProjectsData}
        selectedIds={selectedProjectIds}
        onSelectionChange={handleProjectsChange}
        showSwitcher={true}
        isGlobal={approvalFlowData.IsGlobal}
        onGlobalChange={handleGlobalChange}
        // اضافه کردن رفتار مشابه Configuration
        ModalContentComponent={TableSelector}
        modalContentProps={{
          columnDefs: projectColumnDefs,
          rowData: relatedProjectsData,
          selectedRow: selectedRowData,
          onRowDoubleClick: handleRowDoubleClick,
          onRowClick: handleRowClick,
          onSelectButtonClick: handleSelectButtonClick,
          isSelectDisabled: !selectedRowData,
        }}
      />
    </TwoColumnLayout>
  );
};

export default ApprovalFlow;
