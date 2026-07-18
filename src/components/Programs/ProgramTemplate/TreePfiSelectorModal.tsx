// src/components/Programs/ProgramTemplate/TreePfiSelectorModal.tsx

import React, { useEffect, useState, useCallback } from "react";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CircularProgress from "@mui/material/CircularProgress";
import DynamicModal from "../../utilities/DynamicModal";
import { useProgramDesigner } from "../../../context/ProgramDesignerContext";
import { ProgramDesignerRow } from "../../../services/programDesigner/types";

interface TreeNode extends ProgramDesignerRow {
  children?: TreeNode[];
  isExpanded?: boolean;
  childrenLoaded?: boolean;
  isLoadingChildren?: boolean;
}

export type PredecessorKind = "InItem" | "InSub";

interface TreePfiSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  programTemplateId: number;
  onSelect: (node: { GPIC: string; ID: string; Name: string }, kind: PredecessorKind) => void;
}

const TreePfiSelectorModal: React.FC<TreePfiSelectorModalProps> = ({
  isOpen,
  onClose,
  programTemplateId,
  onSelect,
}) => {
  const { getRootRows, getChildRows } = useProgramDesigner();
  const [rows, setRows] = useState<TreeNode[]>([]);
  const [isLoadingRoot, setIsLoadingRoot] = useState(false);
  const [selectedGPIC, setSelectedGPIC] = useState<string | null>(null);
  const [kind, setKind] = useState<PredecessorKind>("InItem");

  const loadRoot = useCallback(async () => {
    setIsLoadingRoot(true);
    try {
      const data = await getRootRows(programTemplateId);
      setRows(data.map((r) => ({ ...r })));
    } finally {
      setIsLoadingRoot(false);
    }
  }, [programTemplateId, getRootRows]);

  useEffect(() => {
    if (isOpen) {
      setSelectedGPIC(null);
      setKind("InItem");
      loadRoot();
    }
  }, [isOpen, loadRoot]);

  const updateNodeByGPIC = (
    nodes: TreeNode[],
    gpic: string,
    updater: (node: TreeNode) => TreeNode
  ): TreeNode[] => {
    return nodes.map((node) => {
      if (node.GPIC === gpic) {
        return updater(node);
      }
      if (node.children) {
        return {
          ...node,
          children: updateNodeByGPIC(node.children, gpic, updater),
        };
      }
      return node;
    });
  };

  const findNodeByGPIC = (
    nodes: TreeNode[],
    gpic: string
  ): TreeNode | undefined => {
    for (const node of nodes) {
      if (node.GPIC === gpic) return node;
      if (node.children) {
        const found = findNodeByGPIC(node.children, gpic);
        if (found) return found;
      }
    }
    return undefined;
  };

  const handleToggleExpand = async (node: TreeNode) => {
    if (node["Activity Type"] !== "InFPP") return;

    if (!node.childrenLoaded) {
      setRows((prev) =>
        updateNodeByGPIC(prev, node.GPIC, (n) => ({
          ...n,
          isLoadingChildren: true,
        }))
      );
      const children = await getChildRows(node.GPIC);
      setRows((prev) =>
        updateNodeByGPIC(prev, node.GPIC, (n) => ({
          ...n,
          children,
          childrenLoaded: true,
          isLoadingChildren: false,
          isExpanded: true,
        }))
      );
    } else {
      setRows((prev) =>
        updateNodeByGPIC(prev, node.GPIC, (n) => ({
          ...n,
          isExpanded: !n.isExpanded,
        }))
      );
    }
  };

  const handleConfirmSelect = () => {
    if (!selectedGPIC) return;
    const node = findNodeByGPIC(rows, selectedGPIC);
    if (!node) return;
    onSelect(
      { GPIC: node.GPIC, ID: node.ID, Name: node["Activity Name"] },
      kind
    );
    onClose();
  };

  const renderRow = (node: TreeNode, depth: number): React.ReactNode => {
    const isInFPP = node["Activity Type"] === "InFPP";
    const isSelected = selectedGPIC === node.GPIC;

    return (
      <React.Fragment key={node.GPIC}>
        <tr
          onClick={() => setSelectedGPIC(node.GPIC)}
          className={`cursor-pointer transition-colors border-b border-purple-100 ${
            isSelected
              ? "bg-gradient-to-r from-pink-100 to-purple-100"
              : "odd:bg-orange-50 even:bg-white hover:bg-purple-50"
          }`}
        >
          <td className="px-3 py-2 text-sm text-left">
            <div
              className="flex items-center gap-1"
              style={{ paddingLeft: depth * 20 }}
            >
              {isInFPP ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand(node);
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-purple-200 text-purple-600 shrink-0"
                >
                  {node.isLoadingChildren ? (
                    <CircularProgress size={14} />
                  ) : node.isExpanded ? (
                    <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />
                  )}
                </button>
              ) : (
                <span className="w-5 h-5 shrink-0" />
              )}
              <span className="truncate">{node.ID}</span>
            </div>
          </td>
          <td className="px-3 py-2 text-sm text-left">{node.Order}</td>
          <td className="px-3 py-2 text-sm text-left font-medium text-gray-700">
            {node["Activity Name"]}
          </td>
          <td className="px-3 py-2 text-sm text-left">
            {node["Persian Activity Name"]}
          </td>
          <td className="px-3 py-2 text-sm text-left">{node.Duration}</td>
        </tr>

        {node.isExpanded &&
          node.children?.map((child) => renderRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <DynamicModal isOpen={isOpen} onClose={onClose} size="large">
      <div className="flex flex-col h-full" dir="ltr">
        <h3 className="text-base font-semibold text-purple-700 mb-3">
          TreePfiSelector
        </h3>

        <div className="rounded-lg overflow-hidden border border-purple-200 shadow-sm mb-4">
          <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
            <table dir="ltr" className="w-full text-left">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                  <th className="px-3 py-2 text-sm font-semibold text-left">
                    ID
                  </th>
                  <th className="px-3 py-2 text-sm font-semibold text-left">
                    Order
                  </th>
                  <th className="px-3 py-2 text-sm font-semibold text-left">
                    Activity Name
                  </th>
                  <th className="px-3 py-2 text-sm font-semibold text-left">
                    Persian Activity Name
                  </th>
                  <th className="px-3 py-2 text-sm font-semibold text-left">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoadingRoot ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      <CircularProgress size={18} className="mr-2" />
                      در حال بارگذاری...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      هیچ فعالیتی ثبت نشده است
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => renderRow(row, 0))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="predecessorKind"
              checked={kind === "InItem"}
              onChange={() => setKind("InItem")}
              className="accent-purple-600"
            />
            InItemPredecessor
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="predecessorKind"
              checked={kind === "InSub"}
              onChange={() => setKind("InSub")}
              className="accent-purple-600"
            />
            InSubPredecessor
          </label>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleConfirmSelect}
            disabled={!selectedGPIC}
            className="px-8 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Select
          </button>
        </div>
      </div>
    </DynamicModal>
  );
};

export default TreePfiSelectorModal;