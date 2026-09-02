// src/components/Programs/ProgramTemplate/ProgramDesignerGrid.tsx

import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
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

/**
 * ستون ID همیشه نمایش داده می‌شود (چون آیکون Expand/Collapse درخت رویش
 * سوار است) و در Column Chooser قابل حذف نیست. بقیه‌ی ستون‌ها این‌جا
 * تعریف شده‌اند تا هم در گرید و هم در Column Chooser (که در صفحه‌ی بالاتر
 * رندر می‌شود) استفاده‌ی مشترک داشته باشند.
 */
export interface ProgramDesignerColumnDef {
  key: keyof ProgramDesignerRow;
  label: string;
}

export const PROGRAM_DESIGNER_TOGGLEABLE_COLUMNS: ProgramDesignerColumnDef[] = [
  { key: "Activity Code", label: "Activity Code" },
  { key: "Activity Name", label: "Activity Name" },
  { key: "Persian Activity Name", label: "Persian Activity Name" },
  { key: "Duration", label: "Duration" },
  { key: "Responsible Post", label: "Responsible Post" },
  { key: "Approval Flow", label: "Approval Flow" },
  { key: "Lag", label: "Lag" },
  { key: "Activity Type", label: "Activity Type" },
  { key: "Form Name", label: "Form Name" },
  { key: "Weight", label: "Weight" },
  { key: "Activity Budget", label: "Activity Budget" },
  {
    key: "Approval to execution Weight (%)",
    label: "Approval to Execution Weight",
  },
  { key: "Approval Budjet", label: "Approval Budget" },
  { key: "AF Duration", label: "AF Duration" },
  { key: "Program Type", label: "Program Type" },
  { key: "Program Duration", label: "Program Duration" },
  { key: "Program Approval Budget", label: "Program Approval Budget" },
  { key: "Program to plan Weight (%)", label: "Program To plan Weight" },
  { key: "Check LIST", label: "Check List" },
  { key: "Procedure", label: "Procedure" },
  { key: "GPIC", label: "GPIC" },
  { key: "PredecessorForItemStr", label: "PredecessorForItemStr" },
  { key: "PredecessorForSubStr", label: "PredecessorForSubStr" },
  { key: "PredecessorForItemNames", label: "PredecessorForItemNames" },
  { key: "ParrentIC", label: "ParrentIC" },
];

/**
 * ستون‌های پیش‌فرض نمایش‌داده‌شده: همه‌ی ستون‌ها (دقیقاً مطابق نسخه‌ی
 * ویندوزی که همه‌ی چک‌باکس‌ها از اول تیک‌خورده بودند). با Column Chooser
 * می‌شود هرکدام را که لازم نیست مخفی کرد.
 */
export const DEFAULT_VISIBLE_COLUMN_KEYS: string[] =
  PROGRAM_DESIGNER_TOGGLEABLE_COLUMNS.map((col) => col.key as string);

interface ProgramDesignerGridProps {
  programTemplateId: number;
  onRowSelect?: (row: TreeNode) => void;
  onRowDoubleClick?: (row: TreeNode, parentGPIC: string | null) => void;
  selectedRowId?: string | null;
  refreshKey?: number;
  /** کلیدهای ستون‌های قابل‌نمایش (از PROGRAM_DESIGNER_TOGGLEABLE_COLUMNS) */
  visibleColumnKeys?: Set<string>;
}

const ProgramDesignerGrid: React.FC<ProgramDesignerGridProps> = ({
  programTemplateId,
  onRowSelect,
  onRowDoubleClick,
  selectedRowId,
  refreshKey,
  visibleColumnKeys,
}) => {
  const { getRootRows, getChildRows } = useProgramDesigner();
  const { i18n } = useTranslation();
  const alignClass = i18n.dir() === "rtl" ? "text-right" : "text-left";
  const [rows, setRows] = useState<TreeNode[]>([]);
  const [isLoadingRoot, setIsLoadingRoot] = useState(false);

  const activeColumnKeys =
    visibleColumnKeys ?? new Set(DEFAULT_VISIBLE_COLUMN_KEYS);
  const visibleColumns = PROGRAM_DESIGNER_TOGGLEABLE_COLUMNS.filter((col) =>
    activeColumnKeys.has(col.key as string)
  );

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

  // parentGPIC: GPIC والد مستقیم این ردیف در درخت (null اگر ردیف در لایه‌ی ریشه باشد)
  const renderRow = (
    node: TreeNode,
    depth: number,
    parentGPIC: string | null
  ): React.ReactNode => {
    const isInFPP = node["Activity Type"] === "InFPP";
    const isSelected = selectedRowId === node.GPIC;

    return (
      <React.Fragment key={node.GPIC}>
        <tr
          onClick={() => onRowSelect?.(node)}
          onDoubleClick={() => onRowDoubleClick?.(node, parentGPIC)}
          className={`cursor-pointer transition-colors border-b border-purple-100 ${
            isSelected
              ? "bg-gradient-to-r from-pink-100 to-purple-100"
              : "odd:bg-orange-50 even:bg-white hover:bg-purple-50"
          }`}
        >
          <td className={`px-3 py-2 text-sm ${alignClass}`}>
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

          {visibleColumns.map((col) => (
            <td
              key={col.key as string}
              className={`px-3 py-2 text-sm ${alignClass}`}
            >
              {node[col.key] as React.ReactNode}
            </td>
          ))}
        </tr>

        {node.isExpanded &&
          node.children?.map((child) =>
            renderRow(child, depth + 1, node.GPIC)
          )}
      </React.Fragment>
    );
  };

  return (
    <div className="rounded-lg overflow-hidden border border-purple-200 shadow-sm">
      <div className="overflow-x-auto overflow-y-auto min-h-[450px] max-h-[600px]">
        <table dir={i18n.dir()} className={`w-full ${alignClass}`}>
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              <th className={`px-3 py-2 text-sm font-semibold ${alignClass}`}>
                ID
              </th>
              {visibleColumns.map((col) => (
                <th
                  key={col.key as string}
                  className={`px-3 py-2 text-sm font-semibold whitespace-nowrap ${alignClass}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoadingRoot ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="text-center py-8 text-gray-400"
                >
                  <CircularProgress size={18} className="mr-2" />
                  در حال بارگذاری...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="text-center py-8 text-gray-400"
                >
                  هیچ فعالیتی ثبت نشده است
                </td>
              </tr>
            ) : (
              rows.map((row) => renderRow(row, 0, null))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgramDesignerGrid;