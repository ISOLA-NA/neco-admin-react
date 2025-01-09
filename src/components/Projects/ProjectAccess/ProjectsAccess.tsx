// src/components/ProjectsAccess/ProjectAccess.tsx

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
}

const ProjectAccess = forwardRef<ProjectAccessHandle, ProjectAccessProps>(
  ({ selectedProject }, ref) => {
    const api = useApi();
    const [selectedPostAccess, setSelectedPostAccess] =
      useState<AccessProject | null>(null);

    // تعریف متدهای save و update
    useImperativeHandle(ref, () => ({
      async save() {
        try {
          if (selectedPostAccess) {
            await api.updateAccessProject(selectedPostAccess);
            showAlert(
              "success",
              null,
              "Saved",
              "Project access saved successfully."
            );
          } else {
            showAlert(
              "warning",
              null,
              "Warning",
              "No project access selected to save."
            );
          }
        } catch (error) {
          console.error("Error saving project access:", error);
          showAlert("error", null, "Error", "Failed to save project access.");
        }
      },
      async update() {
        try {
          if (selectedPostAccess) {
            await api.updateAccessProject(selectedPostAccess);
            showAlert(
              "success",
              null,
              "Updated",
              "Project access updated successfully."
            );
          } else {
            showAlert(
              "warning",
              null,
              "Warning",
              "No project access selected to update."
            );
          }
        } catch (error) {
          console.error("Error updating project access:", error);
          showAlert("error", null, "Error", "Failed to update project access.");
        }
      },
    }));

    // Handler برای دوبار کلیک در سمت چپ
    const handleLeftDoubleClick = (data: AccessProject) => {
      setSelectedPostAccess(data);
    };

    return (
      <div className="flex h-full w-full gap-4">
        {/* ستون چپ */}
        <div className="w-1/2 bg-white rounded-lg shadow-lg">
          <LeftProjectAccess
            selectedRow={selectedProject}
            onDoubleClickSubItem={handleLeftDoubleClick}
          />
        </div>

        {/* ستون راست */}
        <div className="w-1/2 bg-white rounded-lg shadow-lg">
          {selectedPostAccess ? (
            <RightProjectAccess selectedRow={selectedPostAccess} />
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
