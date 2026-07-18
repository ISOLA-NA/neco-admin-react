// src/components/Programs/ProgramTemplate/ProgramDesignerGrid.tsx

import React, { useEffect, useState, useCallback } from "react";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CircularProgress from "@mui/material/CircularProgress";
import { useProgramDesigner } from "../../../context/ProgramDesignerContext";
import { ProgramDesignerRow } from "../../../services/programDesigner/types";

interface TreeNode extends ProgramDesignerRow {
  children?: TreeNode[];
  isExpanded?: boolean;
  childrenLoaded?: boolean;
  isLoadingChildren?: boolean;
}

interface ProgramDesignerGridProps {
  programTemplateId: number;
  onRowSelect?: (row: TreeNode) => void;
  onRowDoubleClick?: (row: TreeNode) => void;
  selectedRowId?: string | null;
  refreshKey?: number; // برای بازخوانی اجباری از بیرون
}

const ProgramDesignerGrid: React.FC<ProgramDesignerGridProps> = ({
  programTemplateId,
  onRowSelect,
  onRowDoubleClick,
  selectedRowId,
  refreshKey,
}) => {
  const { getRootRows, getChildRows } = useProgramDesigner();
  const [rows, setRows] = useState<TreeNode[]>([]);
  const [isLoadingRoot, setIsLoadingRoot] = useState(false);

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
    loadRoot();
  }, [loadRoot, refreshKey]);

  // به‌روزرسانی بازگشتی یک نود مشخص در درخت بر اساس GPIC
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

  const renderRow = (node: TreeNode, depth: number): React.ReactNode => {
    const isInFPP = node["Activity Type"] === "InFPP";
    const isSelected = selectedRowId === node.GPIC;

    return (
      <React.Fragment key={node.GPIC}>
        <tr
          onClick={() => onRowSelect?.(node)}
          onDoubleClick={() => onRowDoubleClick?.(node)}
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
          <td className="px-3 py-2 text-sm text-left">
            {node["Activity Code"]}
          </td>
          <td className="px-3 py-2 text-sm text-left">{node.Order}</td>
          <td className="px-3 py-2 text-sm text-left font-medium text-gray-700">
            {node["Activity Name"]}
          </td>
          <td className="px-3 py-2 text-sm text-left">
            {node["Persian Activity Name"]}
          </td>
          <td className="px-3 py-2 text-sm text-left">{node.Duration}</td>
          <td className="px-3 py-2 text-sm text-left">
            {node["Responsible Post"]}
          </td>
        </tr>

        {node.isExpanded &&
          node.children?.map((child) => renderRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="rounded-lg overflow-hidden border border-purple-200 shadow-sm">
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table dir="ltr" className="w-full text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              <th className="px-3 py-2 text-sm font-semibold text-left">
                ID
              </th>
              <th className="px-3 py-2 text-sm font-semibold text-left">
                Activity Code
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
              <th className="px-3 py-2 text-sm font-semibold text-left">
                Responsible Post
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoadingRoot ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  <CircularProgress size={18} className="mr-2" />
                  در حال بارگذاری...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
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
  );
};

export default ProgramDesignerGrid;