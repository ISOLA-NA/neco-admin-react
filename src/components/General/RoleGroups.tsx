// src/components/General/RoleGroups.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import ListSelector from "../ListSelector/ListSelector";
import TableSelector from "../General/Configuration/TableSelector"; // اطمینان از مسیر صحیح

interface RoleGroupsProps {
  selectedRow: any;
}

const projectsData = [
  {
    ID: "c5d86029-8b93-4578-824c-259a9124f18e",
    ProjectName: "My Idea TEST 1",
    Name: "My Idea TEST 1",
    IsVisible: true,
    IsIdea: true,
    State: "Started",
  },
  // سایر پروژه‌ها...
];

const membersData = [
  { ID: 1, Name: "User One" },
  { ID: 2, Name: "User Two" },
  { ID: 3, Name: "User Three" },
  { ID: 4, Name: "User Four" },
  { ID: 5, Name: "User Five" },
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

const RoleGroups: React.FC<RoleGroupsProps> = ({ selectedRow }) => {
  const [groupData, setGroupData] = useState<{
    ID: string | number;
    GroupName: string;
    Description: string;
    ProjectsStr: string;
    PostsStr: string;
    IsGlobal: boolean;
    GroupMembers: (string | number)[];
  }>({
    ID: "",
    GroupName: "",
    Description: "",
    ProjectsStr: "",
    PostsStr: "",
    IsGlobal: false,
    GroupMembers: [],
  });

  useEffect(() => {
    if (selectedRow) {
      const associatedProjects = getAssociatedProjects(
        selectedRow.ProjectsStr,
        projectsData
      );
      const selectedMembers = selectedRow.GroupMembers || [];

      setGroupData({
        ID: selectedRow.ID || "",
        GroupName: selectedRow.Name || "",
        Description: selectedRow.Description || "",
        ProjectsStr: selectedRow.ProjectsStr || "",
        PostsStr: selectedRow.PostsStr || "",
        IsGlobal: selectedRow.IsGlobal || false,
        GroupMembers: selectedMembers,
      });
    } else {
      setGroupData({
        ID: "",
        GroupName: "",
        Description: "",
        ProjectsStr: "",
        PostsStr: "",
        IsGlobal: false,
        GroupMembers: [],
      });
    }
  }, [selectedRow]);

  const handleChange = (
    field: keyof typeof groupData,
    value: string | boolean | (string | number)[]
  ) => {
    setGroupData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const projectColumnDefs = [{ field: "Name", headerName: "Project Name" }];
  const memberColumnDefs = [{ field: "Name", headerName: "Member Name" }];

  const handleProjectsChange = (selectedIds: (string | number)[]) => {
    const newProjectsStr =
      selectedIds.length > 0 ? selectedIds.join("|") + "|" : "";
    handleChange("ProjectsStr", newProjectsStr);
  };

  const handleMembersChange = (selectedIds: (string | number)[]) => {
    handleChange("GroupMembers", selectedIds);
  };

  const handleGlobalChange = (isGlobal: boolean) => {
    handleChange("IsGlobal", isGlobal);
  };

  const associatedProjects = getAssociatedProjects(
    groupData.ProjectsStr,
    projectsData
  );
  const selectedProjectIds = associatedProjects.map((p) => p.ID);

  return (
    <TwoColumnLayout>
      <DynamicInput
        name="Group Name"
        type="text"
        value={groupData.GroupName}
        placeholder=""
        onChange={(e) => handleChange("GroupName", e.target.value)}
      />

      <CustomTextarea
        id="Description"
        name="Description"
        value={groupData.Description}
        placeholder=""
        onChange={(e) => handleChange("Description", e.target.value)}
      />

      {/* ListSelector - Projects */}
      <ListSelector
        title="Projects"
        className="mt-4"
        columnDefs={projectColumnDefs}
        rowData={projectsData}
        selectedIds={selectedProjectIds}
        onSelectionChange={handleProjectsChange}
        showSwitcher={true}
        isGlobal={groupData.IsGlobal}
        onGlobalChange={handleGlobalChange}
        ModalContentComponent={TableSelector}
        modalContentProps={{
          columnDefs: projectColumnDefs,
          rowData: projectsData,
          selectedRows: associatedProjects, // ردیف‌های انتخاب شده
          onRowDoubleClick: (rows: any[]) => {
            handleProjectsChange(rows.map((row) => row.ID));
          },
          onRowClick: (rows: any[]) => {
            // برای انتخاب چندگانه، معمولاً از چک‌باکس‌ها استفاده می‌شود
            // اینجا می‌توانید ردیف‌های انتخاب شده را ذخیره کنید
          },
          onSelectButtonClick: () => {
            handleProjectsChange(selectedProjectIds);
          },
          isSelectDisabled: selectedProjectIds.length === 0,
          selectionMode: "multiple",
        }}
      />

      {/* ListSelector - Group Members */}
      <ListSelector
        title="Group Members"
        className="mt-4"
        columnDefs={memberColumnDefs}
        rowData={membersData}
        selectedIds={groupData.GroupMembers}
        onSelectionChange={handleMembersChange}
        showSwitcher={false}
        isGlobal={false} // برای Group Members سوئیچر نمایش داده نمی‌شود
        ModalContentComponent={TableSelector}
        modalContentProps={{
          columnDefs: memberColumnDefs,
          rowData: membersData,
          selectedRows: groupData.GroupMembers.map((id) =>
            membersData.find((m) => m.ID === id)
          ).filter(Boolean),
          onRowDoubleClick: (rows: any[]) => {
            handleMembersChange(rows.map((row) => row.ID));
          },
          onRowClick: (rows: any[]) => {
            // مشابه پروژه‌ها
          },
          onSelectButtonClick: () => {
            handleMembersChange(groupData.GroupMembers);
          },
          isSelectDisabled: groupData.GroupMembers.length === 0,
          selectionMode: "multiple",
        }}
      />
    </TwoColumnLayout>
  );
};

export default RoleGroups;
