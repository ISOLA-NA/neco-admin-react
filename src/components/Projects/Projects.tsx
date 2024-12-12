// src/components/General/Projects.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";

interface EnterpriseDetailsProps {
  selectedRow: any;
}

const Projects: React.FC<EnterpriseDetailsProps> = ({ selectedRow }) => {
  const [projectData, setEnterpriseData] = useState<{
    ID: string | number;
    ProjectName: string;
    State: string;
    AcualStartTime: string;
    TotalDuration: number | null;
    PCostAct: number | null;
    PCostAprov: number | null;
    IsIdea: string;
    calendarName: string;
    TaskNum: number | null;
    RolesNum: number | null;
    LettersNum: number | null;
    MeetingsNum: number | null;
    IssuesNum: number | null;
    KnowledgeNum: number | null;
  }>({
    ID: "",
    ProjectName: "",
    State: "",
    AcualStartTime: "",
    TotalDuration: null,
    PCostAct: null,
    PCostAprov: null,
    IsIdea: "",
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
      setEnterpriseData({
        ID: selectedRow.ID || "",
        ProjectName: selectedRow.ProjectName || "",
        State: selectedRow.State || "",
        AcualStartTime: selectedRow.AcualStartTime || "",
        TotalDuration: selectedRow.TotalDuration || null,
        PCostAct: selectedRow.PCostAct || null,
        PCostAprov: selectedRow.PCostAprov || null,
        IsIdea: selectedRow.IsIdea || "",
        calendarName: selectedRow.calendarName || "",
        TaskNum: selectedRow.TaskNum || null,
        RolesNum: selectedRow.RolesNum || null,
        LettersNum: selectedRow.LettersNum || null,
        MeetingsNum: selectedRow.MeetingsNum || null,
        IssuesNum: selectedRow.IssuesNum || null,
        KnowledgeNum: selectedRow.KnowledgeNum || null,
      });
    } else {
      setEnterpriseData({
        ID: "",
        ProjectName: "",
        State: "",
        AcualStartTime: "",
        TotalDuration: null,
        PCostAct: null,
        PCostAprov: null,
        IsIdea: "",
        calendarName: "",
        TaskNum: null,
        RolesNum: null,
        LettersNum: null,
        MeetingsNum: null,
        IssuesNum: null,
        KnowledgeNum: null,
      });
    }
  }, [selectedRow]);

  return (
    <TwoColumnLayout>
      <DynamicInput
        name="ProjectName"
        type="text"
        value={projectData.ProjectName}
        placeholder=""
        disabled={true}
        className="-mt-1"
      />
      <DynamicInput
        name="State"
        type="text"
        value={projectData.State}
        placeholder=""
        disabled={true}
        className="-mt-1"
      />
      <DynamicInput
        name="Configuration"
        type="text"
        value=""
        placeholder=""
        disabled={true}
        className="-mt-7"
      />
      <DynamicInput
        name="Idea Start Date"
        type="text"
        value={projectData.AcualStartTime}
        placeholder=""
        disabled={true}
        className="-mt-7"
      />
      <DynamicInput
        name="Project Plan Duration"
        value={projectData.TotalDuration}
        type="text"
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="Budget Act"
        value={projectData.PCostAct}
        type="text"
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="Budget Approve"
        type="text"
        value={projectData.PCostAprov}
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="Phase"
        type="text"
        value={projectData.IsIdea}
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="Idea Plan Duration"
        type="text"
        value=""
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="Assigned Calendars"
        type="text"
        value={projectData.calendarName}
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="Project Chartered Date"
        type="text"
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="Program Items Number"
        type="text"
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="Tasks Number"
        type="number"
        value={projectData.TaskNum}
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="Files Number"
        type="number"
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="File Size Sum"
        type="number"
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="Roles"
        type="number"
        value={projectData.RolesNum}
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="Letters Number"
        value={projectData.LettersNum}
        type="number"
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="Meeting Number"
        value={projectData.MeetingsNum}
        type="number"
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="Issues"
        type="number"
        value={projectData.IssuesNum}
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
      <DynamicInput
        name="knowledges"
        type="number"
        value={projectData.KnowledgeNum}
        placeholder=""
        disabled={true}
        className="-mt-5"
      />
    </TwoColumnLayout>
  );
};

export default Projects;
