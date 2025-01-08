// src/components/Projects/Procedures.tsx

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import ListSelector from "../ListSelector/ListSelector";
import TableSelector from "../General/Configuration/TableSelector";
import { useApi } from "../../context/ApiContext";
import { EntityCollection, Project } from "../../services/api.services";
import { showAlert } from "../utilities/Alert/DynamicAlert";

export interface ProcedureHandle {
  save: () => Promise<boolean>;
}

interface ProcedureProps {
  selectedRow: EntityCollection | null;
}

// Helper functions for processing pipe-separated strings
const parseIds = (idsStr?: string): string[] => {
  if (!idsStr) return [];
  return idsStr.split("|").filter(Boolean);
};

const getAssociatedProjects = (
  projectsStr?: string,
  projectsData?: Array<{ ID: string; Name: string }>
) => {
  const projectIds = parseIds(projectsStr);
  return (projectsData || []).filter((project) =>
    projectIds.includes(String(project.ID))
  );
};

const Procedure = forwardRef<ProcedureHandle, ProcedureProps>(
  ({ selectedRow }, ref) => {
    const api = useApi();

    // Initial procedure data state
    const [procedureData, setProcedureData] = useState<EntityCollection>({
      Name: "",
      Description: "",
      Configuration: null,
      IsGlobal: false,
      IsVisible: true,
      ProjectsStr: "",
    });

    // Projects state from API
    const [projectsData, setProjectsData] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState<boolean>(false);

    // Selected items (IDs)
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

    // Fetch projects from API
    useEffect(() => {
      const fetchProjects = async () => {
        try {
          setLoadingProjects(true);
          const projects = await api.getAllProject();
          setProjectsData(projects);
        } catch (error) {
          console.error("Error fetching projects:", error);
          showAlert("error", null, "Error", "Failed to fetch projects");
        } finally {
          setLoadingProjects(false);
        }
      };
      fetchProjects();
    }, [api]);

    // Update state when selectedRow changes or projects load
    useEffect(() => {
      if (selectedRow) {
        console.log("Editing existing Procedure:", selectedRow);
        setProcedureData({
          ID: selectedRow.ID,
          Name: selectedRow.Name || "",
          Description: selectedRow.Description || "",
          Configuration: selectedRow.Configuration,
          IsGlobal: selectedRow.IsGlobal || false,
          IsVisible: selectedRow.IsVisible ?? true,
          LastModified: selectedRow.LastModified,
          ModifiedById: selectedRow.ModifiedById,
          ProjectsStr: selectedRow.ProjectsStr || "",
        });

        if (projectsData.length > 0) {
          const existingProjectIds = parseIds(
            selectedRow.ProjectsStr ?? undefined
          );
          setSelectedProjectIds(existingProjectIds);
          console.log("Existing Project IDs:", existingProjectIds);
        }
      } else {
        console.log("Creating a new Procedure");
        setProcedureData({
          Name: "",
          Description: "",
          Configuration: null,
          IsGlobal: false,
          IsVisible: true,
          ProjectsStr: "",
        });
        setSelectedProjectIds([]);
      }
    }, [selectedRow, projectsData]);

    useImperativeHandle(ref, () => ({
      async save() {
        try {
          if (!procedureData.Name.trim()) {
            showAlert(
              "error",
              null,
              "Validation Error",
              "Procedure name is required"
            );
            return false;
          }

          console.log("Final selected Project IDs:", selectedProjectIds);

          const dataToSave: EntityCollection = {
            ...procedureData,
            ProjectsStr:
              selectedProjectIds.join("|") +
              (selectedProjectIds.length > 0 ? "|" : ""),
            LastModified: new Date().toISOString(),
          };

          console.log("Data to be saved:", dataToSave);

          if (selectedRow && selectedRow.ID) {
            await api.updateEntityCollection(dataToSave);
            console.log("Procedure updated successfully");
          } else {
            await api.insertEntityCollection(dataToSave);
            console.log("Procedure inserted successfully");
          }
          return true;
        } catch (error) {
          console.error("Error saving procedure:", error);
          showAlert("error", null, "Error", "Failed to save procedure data");
          return false;
        }
      },
    }));

    const handleChange = (field: keyof EntityCollection, value: any) => {
      setProcedureData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const projectColumnDefs = [{ field: "Name", headerName: "Project Name" }];

    const handleProjectsChange = (selectedIds: (string | number)[]) => {
      setSelectedProjectIds(selectedIds.map(String));
      console.log("Projects selected:", selectedIds);
    };

    const handleGlobalChange = (isGlobal: boolean) => {
      handleChange("IsGlobal", isGlobal);
      console.log("IsGlobal changed to:", isGlobal);
    };

    const projectsListData = projectsData.map((proj) => ({
      ID: proj.ID,
      Name: proj.ProjectName,
    }));

    const selectedProjectsForModal = getAssociatedProjects(
      procedureData.ProjectsStr ?? undefined,
      projectsListData
    );

    return (
      <TwoColumnLayout>
        {/* Name Input */}
        <DynamicInput
          name="Name"
          type="text"
          value={procedureData.Name}
          onChange={(e) => handleChange("Name", e.target.value)}
          required
          className="mb-4"
        />

        {/* Description */}
        <CustomTextarea
          name="Description"
          value={procedureData.Description || ""}
          onChange={(e) => handleChange("Description", e.target.value)}
          className="mb-4"
        />

        <div className="-mt-10">
          {/* Projects Selector */}
          <ListSelector
            title="Projects"
            className="mb-4"
            columnDefs={projectColumnDefs}
            rowData={projectsListData}
            selectedIds={selectedProjectIds}
            onSelectionChange={handleProjectsChange}
            showSwitcher={true}
            isGlobal={procedureData.IsGlobal}
            onGlobalChange={handleGlobalChange}
            loading={loadingProjects}
            ModalContentComponent={TableSelector}
            modalContentProps={{
              columnDefs: projectColumnDefs,
              rowData: projectsListData,
              selectedRows: selectedProjectsForModal,
              onRowDoubleClick: (rows: any[]) =>
                handleProjectsChange(rows.map((row) => row.ID)),
              selectionMode: "multiple",
            }}
          />
        </div>
      </TwoColumnLayout>
    );
  }
);

Procedure.displayName = "Procedure";
export default Procedure;
