import React, { useState, useEffect } from "react";
import DynamicInput from "../utilities/DynamicInput";
import { useTranslation } from "react-i18next";

interface ProjectsProps {
  selectedRow: any;
}

const Projects: React.FC<ProjectsProps> = ({ selectedRow }) => {
  const { t, i18n } = useTranslation();

  const isFaMode = i18n.language === "fa";

  const toPersian = (val: string | number | null): string => {
    if (val === null || val === undefined || val === "") return "";
    if (!isFaMode) return String(val);
    return String(val).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
  };

  const [projectData, setProjectData] = useState({
    ID: "",
    ProjectName: "",
    State: "",
    CreateDate: "",
    TotalDuration: null as number | null,
    PCostAct: null as number | null,
    PCostAprov: null as number | null,
    IsIdea: false,
    calendarName: "",
    TaskNum: null as number | null,
    RolesNum: null as number | null,
    LettersNum: null as number | null,
    MeetingsNum: null as number | null,
    IssuesNum: null as number | null,
    KnowledgeNum: null as number | null,
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
      {/* ── ستون چپ ── */}
      <div className="space-y-6">
        <DynamicInput
          name={t("Projects.ProjectName")}
          type="text"
          value={projectData.ProjectName}
          disabled={true}
        />

        <DynamicInput
          name={t("Projects.Configuration")}
          type="text"
          value=""
          disabled={true}
        />

        <DynamicInput
          name={t("Projects.IdeaStartDate")}
          type="text"
          value={toPersian(projectData.CreateDate)}
          disabled={true}
        />

        <DynamicInput
          name={t("Projects.IdeaPlanDuration")}
          type="text"
          value=""
          disabled={true}
        />

        <DynamicInput
          name={t("Projects.PlanningExecutionBudget")}
          type="text"
          value={toPersian(projectData.PCostAct)}
          disabled={true}
        />

        <DynamicInput
          name={t("Projects.AssignedCalendars")}
          type="text"
          value={projectData.calendarName}
          disabled={true}
        />
      </div>

      {/* ── ستون راست ── */}
      <div className="space-y-6">
        <DynamicInput
          name={t("Projects.Status")}
          type="text"
          value={projectData.State}
          disabled={true}
        />

        <DynamicInput
          name={t("Projects.Phase")}
          type="text"
          value={
            projectData.IsIdea
              ? t("Projects.IsIdea")
              : t("Projects.Project")
          }
          disabled={true}
        />

        <DynamicInput
          name={t("Projects.ProjectCharteredDate")}
          type="text"
          value=""
          disabled={true}
        />

        <DynamicInput
          name={t("Projects.ProjectPlanDuration")}
          type="text"
          value={toPersian(projectData.TotalDuration)}
          disabled={true}
        />

        <DynamicInput
          name={t("Projects.ProjectApprovalBudget")}
          type="text"
          value={toPersian(projectData.PCostAprov)}
          disabled={true}
        />

        <div className="grid grid-cols-3 gap-4 mt-4">
          <DynamicInput
            name={t("Projects.ProgramItems")}
            type="text"
            value=""
            disabled={true}
          />
          <DynamicInput
            name={t("Projects.Tasks")}
            type="text"
            value={toPersian(projectData.TaskNum)}
            disabled={true}
          />
          <DynamicInput
            name={t("Projects.Files")}
            type="text"
            value=""
            disabled={true}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <DynamicInput
            name={t("Projects.FileSize")}
            type="text"
            value=""
            disabled={true}
          />
          <DynamicInput
            name={t("Projects.Roles")}
            type="text"
            value={toPersian(projectData.RolesNum)}
            disabled={true}
          />
          <DynamicInput
            name={t("Projects.Letters")}
            type="text"
            value={toPersian(projectData.LettersNum)}
            disabled={true}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <DynamicInput
            name={t("Projects.Meetings")}
            type="text"
            value={toPersian(projectData.MeetingsNum)}
            disabled={true}
          />
          <DynamicInput
            name={t("Projects.Issues")}
            type="text"
            value={toPersian(projectData.IssuesNum)}
            disabled={true}
          />
          <DynamicInput
            name={t("Projects.Knowledge")}
            type="text"
            value={toPersian(projectData.KnowledgeNum)}
            disabled={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Projects;