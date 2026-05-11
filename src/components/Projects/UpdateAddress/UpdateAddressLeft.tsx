import React, { useEffect } from "react";
import { FiChevronRight, FiChevronLeft, FiChevronDown } from "react-icons/fi";
import { useUpdateAddress } from "./UpdateAddressContext";
import { useTranslation } from "react-i18next";

export type UaPickPayload = { gid?: string; id?: number; address?: string };

type Props = {
  onPick?: (payload: UaPickPayload) => void;
};

const UpdateAddressLeft: React.FC<Props> = ({ onPick }) => {
  const { t, i18n } = useTranslation();

  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    roots,
    loadingRoot,
    selectedNode,
    loadRoots,
    toggleExpand,
    selectNode,
  } = useUpdateAddress();

  const isRtl = i18n.dir() === "rtl" || i18n.language === "fa";

  const toPersianDigits = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "";

    return value.toString().replace(/\d/g, (digit) => {
      return "۰۱۲۳۴۵۶۷۸۹"[Number(digit)];
    });
  };

  const localizeText = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "";
    return i18n.language === "fa" ? toPersianDigits(value) : value.toString();
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadRoots(selectedProjectId);
      onPick?.({ gid: selectedProjectId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const handleSelectProject = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProjectId(e.target.value);
  };

  const handleSelectNode = (node: any) => {
    selectNode(node);
    onPick?.({ gid: selectedProjectId, id: node.ID, address: node.Address });
  };

  const renderExpandIcon = (node: any) => {
    if (node._expanded) return <FiChevronDown />;

    return isRtl ? <FiChevronLeft /> : <FiChevronRight />;
  };

  const renderNode = (node: any, depth = 0) => (
    <div
      key={`${node.ID}-${node.ChildProgramID}-${depth}`}
      className="select-none"
    >
      <div
        className={[
          "flex items-center gap-2 px-2 py-1 rounded-md",
          selectedNode &&
          selectedNode.ID === node.ID &&
          selectedNode.ChildProgramID === node.ChildProgramID
            ? "bg-blue-50 ring-1 ring-blue-200"
            : "hover:bg-gray-50",
        ].join(" ")}
        style={{
          paddingInlineStart: 8 + depth * 16,
          paddingInlineEnd: 8,
        }}
      >
        <button
          type="button"
          className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-600"
          onClick={() => toggleExpand(node)}
          title={
            node._expanded
              ? t("UpdateAddress.Collapse", { defaultValue: "Collapse" })
              : t("UpdateAddress.Expand", { defaultValue: "Expand" })
          }
        >
          {renderExpandIcon(node)}
        </button>

        <div
          className="flex-1 cursor-pointer min-w-0"
          onClick={() => handleSelectNode(node)}
        >
          <div className="text-sm font-medium text-gray-800 truncate">
            {localizeText(node.Name)}
          </div>
          <div className="text-xs text-gray-500 break-all">
            {localizeText(node.Address)}
          </div>
        </div>
      </div>

      {node._expanded && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((ch: any) => renderNode(ch, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 h-full" dir={isRtl ? "rtl" : "ltr"}>
      <div className="w-full">
        <label className="block text-xs text-gray-500 mb-1">
          {t("UpdateAddress.Project", { defaultValue: "Project" })}
        </label>
        <select
          className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
          value={selectedProjectId || ""}
          onChange={handleSelectProject}
          dir={isRtl ? "rtl" : "ltr"}
        >
          {(projects ?? []).map((p) => (
            <option key={p.ID} value={p.ID}>
              {localizeText(p.ProjectName)}
            </option>
          ))}
        </select>
      </div>

      <div
        className="flex-1 overflow-auto bg-white rounded-lg border border-gray-200 p-2"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {loadingRoot ? (
          <div className="text-xs text-gray-400 py-1">
            {t("UpdateAddress.Loading", { defaultValue: "Loading…" })}
          </div>
        ) : roots.length === 0 ? (
          <div className="text-sm text-gray-500">
            {t("UpdateAddress.NoData", { defaultValue: "No data" })}
          </div>
        ) : (
          roots.map((n) => renderNode(n))
        )}
      </div>
    </div>
  );
};

export default UpdateAddressLeft;