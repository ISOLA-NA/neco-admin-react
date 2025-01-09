import React, { forwardRef, useImperativeHandle, useState } from "react";
import LeftProjectAccess from "./Panel/LeftProjectAccess";
import RightProjectAccess from "./Panel/RightProjectAccess";
import { AccessProject } from "../../../services/api.services";
import { useApi } from "../../../context/ApiContext";
import { showAlert } from "../../utilities/Alert/DynamicAlert";

export interface ProjectAccessHandle {
  save: () => Promise<void>;
  update: () => Promise<void>;
}

interface ProjectAccessProps {
  selectedProject?: any;
  onAddFromLeft?: () => void;
  onEditFromLeft?: () => void;
}

const ProjectAccess = forwardRef<ProjectAccessHandle, ProjectAccessProps>(
  ({ selectedProject, onAddFromLeft, onEditFromLeft }, ref) => {
    const api = useApi();
    const [selectedPostAccess, setSelectedPostAccess] = useState<AccessProject | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useImperativeHandle(ref, () => ({
      async save() {
        try {
          if (!selectedPostAccess) {
            showAlert("warning", null, "Warning", "No project access selected to save.");
            return;
          }

          let result: AccessProject;
          if (!selectedPostAccess.ID || selectedPostAccess.ID.startsWith("TEMP_")) {
            result = await api.insertAccessProject(selectedPostAccess);
            showAlert("success", null, "Inserted", "Project access inserted successfully.");
          } else {
            result = await api.updateAccessProject(selectedPostAccess);
            showAlert("success", null, "Updated", "Project access updated successfully.");
          }
          
          setSelectedPostAccess(result);
          setRefreshTrigger(prev => prev + 1);
        } catch (error) {
          console.error("Error saving project access:", error);
          showAlert("error", null, "Error", "Failed to save project access.");
        }
      },

      async update() {
        try {
          if (!selectedPostAccess) {
            showAlert("warning", null, "Warning", "No project access selected to update.");
            return;
          }
          const result = await api.updateAccessProject(selectedPostAccess);
          setSelectedPostAccess(result);
          setRefreshTrigger(prev => prev + 1);
          showAlert("success", null, "Updated", "Project access updated successfully.");
        } catch (error) {
          console.error("Error updating project access:", error);
          showAlert("error", null, "Error", "Failed to update project access.");
        }
      },
    }));

    const handleRightPanelChange = (updatedRow: AccessProject) => {
      setSelectedPostAccess(updatedRow);
    };

    const handleLeftDoubleClick = (data: AccessProject) => {
      setSelectedPostAccess(data);
      if (onEditFromLeft) {
        onEditFromLeft();
      }
    };

    return (
      <div className="flex h-full w-full gap-4">
        <div className="w-1/2 bg-white rounded-lg shadow-lg">
          <LeftProjectAccess
            selectedRow={selectedProject}
            onDoubleClickSubItem={handleLeftDoubleClick}
            onAddFromLeft={onAddFromLeft}
            onEditFromLeft={onEditFromLeft}
            refreshTrigger={refreshTrigger}
          />
        </div>

        <div className="w-1/2 bg-white rounded-lg shadow-lg">
          {selectedPostAccess ? (
            <RightProjectAccess 
              selectedRow={selectedPostAccess} 
              onRowChange={handleRightPanelChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a post to view access settings
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default ProjectAccess;
