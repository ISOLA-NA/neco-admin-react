// src/components/General/Procedure.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import ListSelector from "../ListSelector/ListSelector";
import DynamicModal from "../utilities/DynamicModal";
import TableSelector from "../General/Configuration/TableSelector"; // Ensure the path is correct

interface ProcedureProps {
  selectedRow: any;
}

const relatedProjectsData = [
  {
    ID: "1",
    ProjectName: "Project Alpha",
    Name: "Project Alpha",
    IsVisible: true,
    IsIdea: false,
    State: "Active",
  },
  {
    ID: "2",
    ProjectName: "Project Beta",
    Name: "Project Beta",
    IsVisible: true,
    IsIdea: false,
    State: "Planning",
  },
  // Add more projects as needed...
];

function getAssociatedProjects(
  projectsStr?: string,
  projectsData?: { ID: string | number; Name: string }[]
) {
  const safeProjectsData = projectsData || [];
  const safeProjectsStr = projectsStr || "";
  const projectsArray = safeProjectsStr.split("|").filter(Boolean);
  return safeProjectsData.filter(
    (project) => projectsArray.includes(String(project.ID)) // Convert project.ID to string
  );
}

const Procedure: React.FC<ProcedureProps> = ({ selectedRow }) => {
  const [procedureData, setProcedureData] = useState<{
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

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<string>("Projects");
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  useEffect(() => {
    if (selectedRow) {
      setProcedureData({
        ID: selectedRow.ID || "",
        Name: selectedRow.Name || "",
        Description: selectedRow.Description || "",
        ProjectsStr: selectedRow.ProjectsStr || "",
        IsGlobal: selectedRow.IsGlobal || false,
      });
    } else {
      setProcedureData({
        ID: "",
        Name: "",
        Description: "",
        ProjectsStr: "",
        IsGlobal: false,
      });
    }
  }, [selectedRow]);

  const handleChange = (
    field: keyof typeof procedureData,
    value: string | boolean | (string | number)[]
  ) => {
    setProcedureData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const projectColumnDefs = [
    { field: "Name", headerName: "Project Name" },
    { field: "Description", headerName: "Description" },
  ];

  const handleProjectsChange = (selectedIds: (string | number)[]) => {
    const uniqueSelectedIds = Array.from(new Set(selectedIds.map(String)));
    const newProjectsStr =
      uniqueSelectedIds.length > 0 ? uniqueSelectedIds.join("|") + "|" : "";
    handleChange("ProjectsStr", newProjectsStr);
  };

  const handleGlobalChange = (isGlobal: boolean) => {
    handleChange("IsGlobal", isGlobal);
  };

  const associatedProjects = getAssociatedProjects(
    procedureData.ProjectsStr,
    relatedProjectsData
  );
  const selectedProjectIds = associatedProjects.map((p) => p.ID);

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentSelector("Projects");
    setSelectedRowData(null);
  };

  const handleRowClick = (row: any) => {
    setSelectedRowData(row);
  };

  const handleSelectButtonClick = () => {
    if (selectedRowData) {
      // Add the selected project to the list
      const currentSelectedIds = selectedProjectIds.map((id) => String(id));
      if (!currentSelectedIds.includes(String(selectedRowData.ID))) {
        const newSelection = [
          ...currentSelectedIds,
          String(selectedRowData.ID),
        ];
        handleProjectsChange(newSelection);
      }
      handleCloseModal();
    }
  };

  const handleRowDoubleClick = () => {
    handleSelectButtonClick();
  };

  return (
    <div>
      <TwoColumnLayout>
        {/* Name Input */}
        <DynamicInput
          name="Name"
          type="text"
          value={procedureData.Name}
          placeholder=""
          onChange={(e) => handleChange("Name", e.target.value)}
          required={true}
        />

        {/* Description Textarea */}
        <CustomTextarea
          id="Description"
          name="Description"
          value={procedureData.Description}
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
          isGlobal={procedureData.IsGlobal}
          onGlobalChange={handleGlobalChange}
          ModalContentComponent={TableSelector}
          modalContentProps={{
            columnDefs: projectColumnDefs,
            rowData: relatedProjectsData,
            selectedRow: selectedRowData,
            onRowDoubleClick: handleRowDoubleClick,
            onRowClick: handleRowClick,
            onSelectButtonClick: handleSelectButtonClick,
            isSelectDisabled: !selectedRowData,
            onClose: handleCloseModal,
            onSelectFromButton: handleSelectButtonClick,
          }}
        />
      </TwoColumnLayout>

      {/* Dynamic Modal for Selecting Projects */}
      <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
        {currentSelector === "Projects" && (
          <TableSelector
            columnDefs={projectColumnDefs}
            rowData={relatedProjectsData}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleRowDoubleClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        )}
      </DynamicModal>
    </div>
  );
};

export default Procedure;
