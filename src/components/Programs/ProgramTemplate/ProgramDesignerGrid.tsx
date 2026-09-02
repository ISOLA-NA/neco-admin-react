// src/components/Programs/ProgramTemplate/ProgramDesignerGrid.tsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { useTranslation } from "react-i18next";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CircularProgress from "@mui/material/CircularProgress";
import { useProgramDesigner } from "../../../context/ProgramDesignerContext";
import { ProgramDesignerRow } from "../../../services/programDesigner/types";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./ProgramDesignerGrid.css";

interface TreeNode extends ProgramDesignerRow {
  children?: TreeNode[];
  isExpanded?: boolean;
  childrenLoaded?: boolean;
  isLoadingChildren?: boolean;
}

// فقط برای رندر در AG Grid لازم است؛ به منطق اصلی درخت چیزی اضافه نمی‌کند.
interface FlatRow extends TreeNode {
  __depth: number;
  __parentGPIC: string | null;
}

export interface ProgramDesignerColumnDef {
  key: keyof ProgramDesignerRow;
  label: string;
  /** عرض حداقلی سفارشی برای ستون‌هایی با اسم طولانی/پیوسته */
  minWidth?: number;
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
    minWidth: 200,
  },
  { key: "Approval Budjet", label: "Approval Budget" },
  { key: "AF Duration", label: "AF Duration" },
  { key: "Program Type", label: "Program Type" },
  { key: "Program Duration", label: "Program Duration" },
  { key: "Program Approval Budget", label: "Program Approval Budget", minWidth: 180 },
  {
    key: "Program to plan Weight (%)",
    label: "Program To plan Weight",
    minWidth: 190,
  },
  { key: "Check LIST", label: "Check List" },
  { key: "Procedure", label: "Procedure" },
  { key: "GPIC", label: "GPIC" },
  { key: "PredecessorForItemStr", label: "Predecessor For Item Str", minWidth: 210 },
  { key: "PredecessorForSubStr", label: "Predecessor For Sub Str", minWidth: 210 },
  {
    key: "PredecessorForItemNames",
    label: "Predecessor For Item Names",
    minWidth: 230,
  },
  { key: "ParrentIC", label: "ParrentIC" },
];

export const DEFAULT_VISIBLE_COLUMN_KEYS: string[] =
  PROGRAM_DESIGNER_TOGGLEABLE_COLUMNS.map((col) => col.key as string);

interface ProgramDesignerGridProps {
  programTemplateId: number;
  onRowSelect?: (row: TreeNode) => void;
  onRowDoubleClick?: (row: TreeNode, parentGPIC: string | null) => void;
  selectedRowId?: string | null;
  refreshKey?: number;
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
  const isRtl = i18n.dir() === "rtl";

  const [rows, setRows] = useState<TreeNode[]>([]);
  const [isLoadingRoot, setIsLoadingRoot] = useState(false);
  const gridApiRef = useRef<any>(null);

  const activeColumnKeys =
    visibleColumnKeys ?? new Set(DEFAULT_VISIBLE_COLUMN_KEYS);
  const visibleColumns = PROGRAM_DESIGNER_TOGGLEABLE_COLUMNS.filter((col) =>
    activeColumnKeys.has(col.key as string)
  );

  /* ------------------------- بارگذاری داده (بدون تغییر منطق) ------------------------- */
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

  useEffect(() => {
    if (!gridApiRef.current) return;
    if (isLoadingRoot) gridApiRef.current.showLoadingOverlay();
    else gridApiRef.current.hideOverlay();
  }, [isLoadingRoot]);

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

  /* ------------------------- flatten درخت برای AG Grid ------------------------- */
  // فقط لایه‌ی نمایش را از تودرتو به فلَت تبدیل می‌کند؛ منطق expand/collapse
  // و lazy-load فرزندان دقیقاً همان چیزی است که قبلاً بود.
  const flattenTree = (
    nodes: TreeNode[],
    depth: number,
    parentGPIC: string | null
  ): FlatRow[] => {
    const out: FlatRow[] = [];
    for (const node of nodes) {
      out.push({ ...node, __depth: depth, __parentGPIC: parentGPIC });
      if (node.isExpanded && node.children) {
        out.push(...flattenTree(node.children, depth + 1, node.GPIC));
      }
    }
    return out;
  };

  const flatRows = useMemo(() => flattenTree(rows, 0, null), [rows]);

  const handleRowClicked = (event: any) => {
    if (!event?.data) return;
    onRowSelect?.(event.data);
  };

  const handleCellDoubleClicked = (event: any) => {
    if (!event?.data) return;
    onRowDoubleClick?.(event.data, event.data.__parentGPIC ?? null);
  };

  const getRowClass = (params: any) =>
    selectedRowId && params.data?.GPIC === selectedRowId ? "ag-row-selected" : "";

  /* ------------------------- ستون ID با آیکن Expand/Collapse ------------------------- */
  const IdCellRenderer = (params: any) => {
    const node: FlatRow = params.data;
    const isInFPP = node["Activity Type"] === "InFPP";
    return (
      <div
        className="flex items-center gap-1 h-full"
        style={{ paddingInlineStart: node.__depth * 20 }}
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
        <span className="truncate">{node.ID as React.ReactNode}</span>
      </div>
    );
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: "ID",
        field: "ID",
        cellRenderer: IdCellRenderer,
        minWidth: 90,
      },
      ...visibleColumns.map((col) => ({
        headerName: col.label,
        field: col.key as string,
        minWidth: col.minWidth ?? 110,
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleColumns]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      cellStyle: { textAlign: isRtl ? "right" : "left" },
      headerClass: isRtl ? "rtl-header" : "ltr-header",
    }),
    [isRtl]
  );

  const autoSizeAll = (api: any) => {
    if (!api) return;
    const ids: string[] = [];
    api.getColumns()?.forEach((c: any) => ids.push(c.getColId()));
    if (ids.length) api.autoSizeColumns(ids, false);
  };

  const onGridReady = (params: any) => {
    gridApiRef.current = params.api;
    requestAnimationFrame(() => {
      autoSizeAll(params.api);
      // اجرای دوباره بعد از لود کامل فونت‌ها، چون اندازه‌گیری اول
      // ممکن است کمی کمتر از عرض واقعی متن حساب شود (باعث بریده‌شدن
      // هدرهای طولانی مثل PredecessorForItemNames می‌شد).
      setTimeout(() => autoSizeAll(params.api), 150);
    });
    if (isLoadingRoot) params.api.showLoadingOverlay();
  };

  useEffect(() => {
    if (gridApiRef.current) {
      requestAnimationFrame(() => {
        autoSizeAll(gridApiRef.current);
        setTimeout(() => autoSizeAll(gridApiRef.current), 150);
      });
    }
  }, [columnDefs, flatRows]);

  return (
    <div dir={i18n.dir()} className="overflow-x-auto pb-2">
      <div
        className="program-designer-table-container w-full flex flex-col relative rounded-md shadow-md p-2"
        style={{ minWidth: "100%" }}
      >
        <div className="h-[330px] min-w-full flex flex-col justify-end">
          <div
            className={`ag-theme-quartz w-full h-full ${isRtl ? "ag-rtl" : "ag-ltr"}`}
          >
            <AgGridReact
              key={isRtl ? "rtl" : "ltr"}
              onGridReady={onGridReady}
              onGridSizeChanged={(p) => requestAnimationFrame(() => autoSizeAll(p.api))}
              columnDefs={columnDefs}
              rowData={flatRows}
              animateRows={true}
              domLayout="normal"
              onRowClicked={handleRowClicked}
              onCellDoubleClicked={handleCellDoubleClicked}
              enableRtl={isRtl}
              defaultColDef={defaultColDef}
              getRowClass={getRowClass}
              overlayLoadingTemplate={`<div class="custom-loading-overlay"><div style="margin-top:8px;font-weight:500;">در حال بارگذاری...</div></div>`}
              overlayNoRowsTemplate={`<div style="padding:2rem;color:#9ca3af;">هیچ فعالیتی ثبت نشده است</div>`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDesignerGrid;