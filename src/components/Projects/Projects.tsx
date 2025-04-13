import React, { useState, useEffect } from "react";
import DynamicInput from "../utilities/DynamicInput";

interface ProjectsProps {
  selectedRow: any;
}

const Projects: React.FC<ProjectsProps> = ({ selectedRow }) => {
  const [projectData, setProjectData] = useState({
    ID: "",
    ProjectName: "",
    State: "",
    CreateDate: "",
    TotalDuration: null,
    PCostAct: null,
    PCostAprov: null,
    IsIdea: false,
    calendarName: "",
    TaskNum: null,
    RolesNum: null,
    LettersNum: null,
    MeetingsNum: null,
    IssuesNum: null,
    KnowledgeNum: null,
  });

  useEffect(() => {
    if (selectedRow) {
      setProjectData({
        ID: selectedRow.ID || "",
        ProjectName: selectedRow.ProjectName || "",
        State: selectedRow.State || "",
        CreateDate: selectedRow.CreateDate
          ? formatDate(selectedRow.CreateDate)
          : "",
        TotalDuration: selectedRow.TotalDuration || null,
        PCostAct: selectedRow.PCostAct || null,
        PCostAprov: selectedRow.PCostAprov || null,
        IsIdea: selectedRow.IsIdea || false,
        calendarName: selectedRow.calendarName || "",
        TaskNum: selectedRow.TaskNum || null,
        RolesNum: selectedRow.RolesNum || null,
        LettersNum: selectedRow.LettersNum || null,
        MeetingsNum: selectedRow.MeetingsNum || null,
        IssuesNum: selectedRow.IssuesNum || null,
        KnowledgeNum: selectedRow.KnowledgeNum || null,
      });
    }
  }, [selectedRow]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-4">
      <div className="space-y-6">
        <DynamicInput
          name="Project Name"
          type="text"
          value={projectData.ProjectName}
          disabled={true}
        />

        <DynamicInput
          name="Configuration"
          type="text"
          value=""
          disabled={true}
        />

        <DynamicInput
          name="Idea Start Date"
          type="text"
          value={projectData.CreateDate}
          disabled={true}
        />

        <DynamicInput
          name="Idea Plan Duration"
          type="text"
          value=""
          disabled={true}
        />

        <DynamicInput
          name="Planning Execution Budget"
          type="text"
          value={projectData.PCostAct}
          disabled={true}
        />

        <DynamicInput
          name="Assigned Calendars"
          type="text"
          value={projectData.calendarName}
          disabled={true}
        />
      </div>

      <div className="space-y-6">
        <DynamicInput
          name="Status"
          type="text"
          value={projectData.State}
          disabled={true}
        />

        <DynamicInput
          name="Phase"
          type="text"
          value={projectData.IsIdea ? "IsIdea" : "Project"}
          disabled={true}
        />

        <DynamicInput
          name="Project Chartered Date"
          type="text"
          value=""
          disabled={true}
        />

        <DynamicInput
          name="Project Plan Duration"
          type="text"
          value={projectData.TotalDuration}
          disabled={true}
        />

        <DynamicInput
          name="Project Approval Budget"
          type="text"
          value={projectData.PCostAprov}
          disabled={true}
        />

        <div className="grid grid-cols-3 gap-4 mt-4">
          <DynamicInput
            name="Program Items"
            type="number"
            value=""
            disabled={true}
          />
          <DynamicInput
            name="Tasks"
            type="number"
            value={projectData.TaskNum}
            disabled={true}
          />
          <DynamicInput name="Files" type="number" value="" disabled={true} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <DynamicInput
            name="File Size"
            type="number"
            value=""
            disabled={true}
          />
          <DynamicInput
            name="Roles"
            type="number"
            value={projectData.RolesNum}
            disabled={true}
          />
          <DynamicInput
            name="Letters"
            type="number"
            value={projectData.LettersNum}
            disabled={true}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <DynamicInput
            name="Meetings"
            type="number"
            value={projectData.MeetingsNum}
            disabled={true}
          />
          <DynamicInput
            name="Issues"
            type="number"
            value={projectData.IssuesNum}
            disabled={true}
          />
          <DynamicInput
            name="Knowledge"
            type="number"
            value={projectData.KnowledgeNum}
            disabled={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Projects;
