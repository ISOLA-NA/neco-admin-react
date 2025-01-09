import React, { forwardRef, useImperativeHandle, useState } from "react";
import LeftProjectAccess from "./Panel/LeftProjectAccess";
import RightProjectAccess from "./Panel/RightProjectAccess";
import { AccessProject } from "../../../services/api.services";

export interface ProjectAccessHandle {
  save: () => Promise<void>;
}

interface ProjectAccessProps {
  selectedProject?: any;
}

const ProjectAccess = forwardRef<ProjectAccessHandle, ProjectAccessProps>(
  ({ selectedProject }, ref) => {
    const [selectedPostAccess, setSelectedPostAccess] =
      useState<AccessProject | null>(null);

    useImperativeHandle(ref, () => ({
      async save() {
        console.log("ProjectAccess: save called.");
      },
    }));

    // وقتی از لفت داده‌ای (با دوبار کلیک یا از طریق +) می‌آید، در این استیت قرار می‌گیرد
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
