import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect,
} from "react";
import LeftProjectAccess from "./Panel/LeftProjectAccess";
import RightProjectAccess from "./Panel/RightProjectAccess";
import PAHeader from "./CustomPanelHeader";
import { AccessProject } from "../../../services/api.services";
import { useApi } from "../../../context/ApiContext";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import { useTranslation } from "react-i18next";

export interface ProjectAccessHandle {
  save: () => Promise<void>;
  update: () => Promise<void>;
}

interface ProjectAccessProps {
  selectedProject?: { ID: string };
}

const ProjectAccess = forwardRef<ProjectAccessHandle, ProjectAccessProps>(
  ({ selectedProject }, ref) => {
    const api = useApi();
    const { t, i18n } = useTranslation();
    const dir = i18n.dir();

    const blankAccess = useCallback(
      (): AccessProject => ({
        nProjectID: selectedProject?.ID,
        nPostID: "",
        PostName: "",
        AccessMode: 1,
        CreateLetter: true,
        CreateMeeting: true,
        CreateIssue: true,
        CreateKnowledge: true,
        CreateAlert: true,
        AlowToAllTask: true,
        AlowToEditRequest: true,
        AlowToWordPrint: true,
        Show_Approval: true,
        Show_Comment: true,
        Show_CheckList: true,
        Show_Procedure: true,
        Show_Logs: true,
        Show_Lessons: true,
        Show_Related: true,
        Show_Assignment: true,
        AllowToDownloadGroup: true,
      }),
      [selectedProject]
    );

    const [currentAccess, setCurrentAccess] = useState<AccessProject>(
      blankAccess()
    );
    const [editMode, setEditMode] = useState<"add" | "edit">("add");
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const persist = async () => {
      if (!currentAccess.nPostID?.trim()) {
        showAlert(
          "warning",
          null,
          t("ProjectAccess.Warning", { defaultValue: "Warning" }),
          t("ProjectAccess.SelectPostFirst", {
            defaultValue: "Select a post first.",
          })
        );
        return;
      }
      try {
        const isNew = !currentAccess.ID;
        const result = isNew
          ? await api.insertAccessProject({ ...currentAccess })
          : await api.updateAccessProject(currentAccess);

        showAlert(
          "success",
          null,
          isNew
            ? t("ProjectAccess.Inserted", { defaultValue: "Inserted" })
            : t("ProjectAccess.Updated", { defaultValue: "Updated" }),
          isNew
            ? t("ProjectAccess.AccessCreated", {
                defaultValue: "Access created.",
              })
            : t("ProjectAccess.AccessUpdated", {
                defaultValue: "Access updated.",
              })
        );

        setCurrentAccess(blankAccess());
        setEditMode("add");
        setRefreshTrigger((p) => p + 1);
      } catch {
        showAlert(
          "error",
          null,
          t("ProjectAccess.Error", { defaultValue: "Error" }),
          t("ProjectAccess.OperationFailed", {
            defaultValue: "Operation failed.",
          })
        );
      }
    };

    useImperativeHandle(ref, () => ({ save: persist, update: persist }));

    useEffect(() => {
      setCurrentAccess(blankAccess());
      setEditMode("add");
    }, [selectedProject, blankAccess]);

    return (
      <div
        className="flex flex-col h/full w/full bg-gray-50 rounded-md"
        dir={dir}
      >
        <PAHeader
          isEditMode={editMode === "edit"}
          onSave={persist}
          onUpdate={persist}
          onClose={() => {
            setCurrentAccess(blankAccess());
            setEditMode("add");
          }}
        />

        <div className="flex flex-1 gap-2 p-2">
          <div className="w-1/2 h-[95vh] bg-white rounded-md border border-gray-200 shadow-sm flex flex-col">
            <LeftProjectAccess
              selectedRow={selectedProject}
              editMode={editMode}
              currentAccess={currentAccess}
              onEditStart={(row) => {
                setCurrentAccess(row);
                setEditMode("edit");
              }}
              onAccessChange={(changes) => {
                setCurrentAccess((p) => ({ ...p, ...changes }));
              }}
              refreshTrigger={refreshTrigger}
            />
          </div>

          <div className="w-1/2 h-[95vh] bg-white rounded-md border border-gray-200 shadow-sm flex flex-col">
            <RightProjectAccess
              selectedRow={currentAccess}
              onRowChange={(changes) => {
                setCurrentAccess((p) => ({ ...p, ...changes }));
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default ProjectAccess;
