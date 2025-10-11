// src/components/Projects/UpdateAddress/UpdateAddressLeft.tsx
import React, { useEffect } from "react";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { useUpdateAddress } from "./UpdateAddressContext";

export type UaPickPayload = { gid?: string; id?: number; address?: string };

type Props = {
  onPick?: (payload: UaPickPayload) => void;
};

const UpdateAddressLeft: React.FC<Props> = ({ onPick }) => {
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

  // اگر پروژه‌ای انتخاب شد/تغییر کرد، ریشه‌ها را لود کن
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

  const renderNode = (node: any, depth = 0) => (
    <div key={`${node.ID}-${node.ChildProgramID}-${depth}`} className="select-none">
      <div
        className={[
          "flex items-center gap-2 px-2 py-1 rounded-md",
          selectedNode && selectedNode.ID === node.ID && selectedNode.ChildProgramID === node.ChildProgramID
            ? "bg-blue-50 ring-1 ring-blue-200"
            : "hover:bg-gray-50",
        ].join(" ")}
        style={{ marginInlineStart: depth * 12 }}
      >
        <button
          className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-600"
          onClick={() => toggleExpand(node)}
          title={node._expanded ? "Collapse" : "Expand"}
        >
          {node._expanded ? <FiChevronDown /> : <FiChevronRight />}
        </button>

        <div className="flex-1 cursor-pointer" onClick={() => handleSelectNode(node)}>
          <div className="text-sm font-medium text-gray-800">{node.Name}</div>
          <div className="text-xs text-gray-500 break-all">{node.Address}</div>
        </div>
      </div>

      {node._expanded && node.children && node.children.length > 0 && (
        <div className="pl-4">{node.children.map((ch: any) => renderNode(ch, depth + 1))}</div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* سلکت پروژه */}
      <div className="w-full">
        <label className="block text-xs text-gray-500 mb-1">Project</label>
        <select
          className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
          value={selectedProjectId || ""}
          onChange={handleSelectProject}
        >
          {(projects ?? []).map((p) => (
            <option key={p.ID} value={p.ID}>
              {p.ProjectName}
            </option>
          ))}
        </select>
      </div>

      {/* درخت */}
      <div className="flex-1 overflow-auto bg-white rounded-lg border border-gray-200 p-2">
        {loadingRoot ? (
          <div className="text-xs text-gray-400 py-1">Loading…</div>
        ) : roots.length === 0 ? (
          <div className="text-sm text-gray-500">No data</div>
        ) : (
          roots.map((n) => renderNode(n))
        )}
      </div>
    </div>
  );
};

export default UpdateAddressLeft;
