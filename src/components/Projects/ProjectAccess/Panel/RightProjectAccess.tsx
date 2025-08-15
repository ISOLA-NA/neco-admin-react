/* ----------------------------------------------------------
   src/components/Projects/ProjectAccess/Panel/RightProjectAccess.tsx
   ---------------------------------------------------------- */
import React from "react";
import DynamicSwitcher from "../../../utilities/DynamicSwitcher";
import { AccessProject } from "../../../../services/api.services";
import { useTranslation } from "react-i18next";

interface RightProps {
  selectedRow: AccessProject;
  onRowChange: (updated: Partial<AccessProject>) => void;
}

const RightProjectAccess: React.FC<RightProps> = ({
  selectedRow,
  onRowChange,
}) => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isRtl = dir === "rtl";

  // ثابت‌های خوانایی
  const READ_MODE = 1;
  const WRITE_MODE = 2;

  // 1 = Read، 2 = Write
  const isRead = selectedRow.AccessMode === READ_MODE;
  const modeLabel = isRead
    ? t("ProjectAccess.Read", { defaultValue: "Read" })
    : t("ProjectAccess.Write", { defaultValue: "Write" });
  const labelClass = isRead ? "text-gray-500" : "text-blue-600 font-semibold";

  // نگاشت فیلدهای بولی → کلید ترجمه
  const keyToI18n: Record<string, string> = {
    CreateMeeting: "ProjectAccess.CreateMeeting",
    CreateLetter: "ProjectAccess.CreateLetter",
    CreateKnowledge: "ProjectAccess.CreateKnowledge",
    CreateIssue: "ProjectAccess.CreateIssue",
    CreateAlert: "ProjectAccess.CreateAlert",
    AlowToAllTask: "ProjectAccess.AllowToAllTask",
    AllowToAllTask: "ProjectAccess.AllowToAllTask",
    AlowToEditRequest: "ProjectAccess.AllowToEditRequest",
    AllowToEditRequest: "ProjectAccess.AllowToEditRequest",
    AlowToWordPrint: "ProjectAccess.AllowToWordPrint",
    AllowToWordPrint: "ProjectAccess.AllowToWordPrint",
    Show_Comment: "ProjectAccess.ShowComment",
    Show_Approval: "ProjectAccess.ShowApproval",
    Show_Procedure: "ProjectAccess.ShowProcedure",
    Show_CheckList: "ProjectAccess.ShowCheckList",
    Show_Logs: "ProjectAccess.ShowLogs",
    Show_Lessons: "ProjectAccess.ShowLessons",
    Show_Related: "ProjectAccess.ShowRelated",
    Show_Assignment: "ProjectAccess.ShowAssignment",
    AllowToDownloadGroup: "ProjectAccess.AllowToDownloadGroup",
  };

  const booleanKeys = Object.keys(selectedRow).filter(
    (k) => typeof (selectedRow as any)[k] === "boolean"
  );

  const getLabel = (key: string) => {
    const i18nKey = keyToI18n[key];
    return i18nKey ? t(i18nKey) : key.replace(/_/g, " ");
  };

  return (
    <div
      className="p-2 h-full flex flex-col gap-3 bg-gradient-to-b from-blue-50 to-pink-50 rounded-md overflow-auto"
      dir={dir}
    >
      {/* Mode switcher */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-semibold">
          {t("ProjectAccess.Mode", { defaultValue: "Mode" })}
        </span>
        <DynamicSwitcher
          isChecked={isRead}
          onChange={() =>
            onRowChange({
              AccessMode: isRead ? WRITE_MODE : READ_MODE,
            })
          }
          leftLabel=""
          rightLabel=""
        />
        <span className={`text-sm ${labelClass}`}>{modeLabel}</span>
      </div>

      <h2 className="text-center text-lg font-semibold">
        {t("ProjectAccess.Access", { defaultValue: "Access" })}
      </h2>

      <div className="grid grid-cols-2 gap-2 pb-4">
        {booleanKeys.map((key) => (
          <label
            key={key}
            className={`relative border rounded bg-white ${
              isRtl ? "pr-8" : "pl-8"
            } px-2 py-1 flex items-center`}
          >
            {/* چک‌باکس با موقعیت مطلق → می‌چسبد به لبهٔ راست در RTL و لبهٔ چپ در LTR */}
            <input
              type="checkbox"
              checked={(selectedRow as any)[key]}
              onChange={() =>
                onRowChange({ [key]: !(selectedRow as any)[key] })
              }
              className={`h-4 w-4 shrink-0 absolute top-1/2 -translate-y-1/2 ${
                isRtl ? "right-2" : "left-2"
              }`}
            />

            {/* متن با ترازبندی درست و فضای مناسب */}
            <span
              className={`text-xs truncate w-full ${
                isRtl ? "text-right" : "text-left"
              }`}
              title={getLabel(key)}
            >
              {getLabel(key)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RightProjectAccess;
