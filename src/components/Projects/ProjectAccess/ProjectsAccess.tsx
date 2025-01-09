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
  onAddFromLeft?: () => void; // پراپ جدید برای افزودن
  onEditFromLeft?: () => void; // پراپ جدید برای ویرایش
}

const ProjectAccess = forwardRef<ProjectAccessHandle, ProjectAccessProps>(
  ({ selectedProject, onAddFromLeft, onEditFromLeft }, ref) => {
    const api = useApi();
    const [selectedPostAccess, setSelectedPostAccess] =
      useState<AccessProject | null>(null);

    // تعریف متدهای save و update با تشخیص insert/update
    useImperativeHandle(ref, () => ({
      async save() {
        try {
          if (!selectedPostAccess) {
            showAlert(
              "warning",
              null,
              "Warning",
              "No project access selected to save."
            );
            return;
          }

          // اگر آی‌دی نداشت یا با TEMP شروع می‌شد => insert
          if (
            !selectedPostAccess.ID ||
            selectedPostAccess.ID.startsWith("TEMP_")
          ) {
            const inserted = await api.insertAccessProject(selectedPostAccess);
            showAlert(
              "success",
              null,
              "Inserted",
              "Project access inserted successfully."
            );
            setSelectedPostAccess(inserted);
          } else {
            // در غیر این صورت update
            await api.updateAccessProject(selectedPostAccess);
            showAlert(
              "success",
              null,
              "Updated",
              "Project access updated successfully."
            );
          }
        } catch (error) {
          console.error("Error saving project access:", error);
          showAlert("error", null, "Error", "Failed to save project access.");
        }
      },

      async update() {
        // این متد اگر می‌خواهید فقط همیشه حالت ویرایش باشد
        // در صورت تمایل می‌توانید همان منطق را تکرار کنید
        try {
          if (!selectedPostAccess) {
            showAlert(
              "warning",
              null,
              "Warning",
              "No project access selected to update."
            );
            return;
          }
          await api.updateAccessProject(selectedPostAccess);
          showAlert(
            "success",
            null,
            "Updated",
            "Project access updated successfully."
          );
        } catch (error) {
          console.error("Error updating project access:", error);
          showAlert("error", null, "Error", "Failed to update project access.");
        }
      },
    }));

    // Handler برای دوبار کلیک در سمت چپ
    const handleLeftDoubleClick = (data: AccessProject) => {
      setSelectedPostAccess(data);
      // فراخوانی پراپ مربوط به ویرایش
      if (onEditFromLeft) {
        onEditFromLeft();
      }
    };

    return (
      <div className="flex h-full w-full gap-4">
        {/* ستون چپ */}
        <div className="w-1/2 bg-white rounded-lg shadow-lg">
          <LeftProjectAccess
            selectedRow={selectedProject}
            onDoubleClickSubItem={handleLeftDoubleClick}
            onAddFromLeft={onAddFromLeft}
            onEditFromLeft={onEditFromLeft}
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
