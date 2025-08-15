/* ----------------------------------------------------------
   src/components/Projects/ProjectAccess/ProjectAccess.tsx
   ---------------------------------------------------------- */
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

    /* ---------- helpers ---------- */
    const blankAccess = useCallback(
      (): AccessProject => ({
        nProjectID: selectedProject?.ID,
        nPostID: "",
        PostName: "",
        AccessMode: 1,
        CreateLetter: false,
        CreateMeeting: false,
        CreateIssue: false,
        CreateKnowledge: false,
        CreateAlert: false,
        AlowToAllTask: false,
        AlowToEditRequest: false,
        AlowToWordPrint: false,
        Show_Approval: false,
        Show_Comment: false,
        Show_CheckList: false,
        Show_Procedure: false,
        Show_Logs: false,
        Show_Lessons: false,
        Show_Related: false,
        Show_Assignment: false,
        AllowToDownloadGroup: false,
      }),
      [selectedProject]
    );

    /* ---------- state ---------- */
    const [currentAccess, setCurrentAccess] = useState<AccessProject>(
      blankAccess()
    );
    const [editMode, setEditMode] = useState<"add" | "edit">("add");
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    /* ---------- save / update ---------- */
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
        const isNew = !currentAccess.ID; // ثبت یا به‌روزرسانی؟
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
        setCurrentAccess(result);
        setEditMode("edit"); // پس از ذخیره در حالت ویرایش
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

    /* ---------- expose to parent ---------- */
    useImperativeHandle(ref, () => ({ save: persist, update: persist }));

    /* ---------- reset when project changes ---------- */
    useEffect(() => {
      setCurrentAccess(blankAccess());
      setEditMode("add");
    }, [selectedProject, blankAccess]);

    /* ---------- UI ---------- */
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
          {/* Left panel */}
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
                /* در حالت add می‌مانیم تا ذخیره شود */
              }}
              refreshTrigger={refreshTrigger}
            />
          </div>

          {/* Right panel */}
          <div className="w-1/2 h-[95vh] bg-white rounded-md border border-gray-200 shadow-sm flex flex-col">
            <RightProjectAccess
              selectedRow={currentAccess}
              onRowChange={(changes) => {
                setCurrentAccess((p) => ({ ...p, ...changes }));
                /* فقط وقتی رکورد موجود است حالت edit باقی می‌ماند */
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default ProjectAccess;
