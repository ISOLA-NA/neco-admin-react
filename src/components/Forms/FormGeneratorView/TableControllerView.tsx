// src/components/TableControllerView.tsx
import React, { useMemo } from "react";
import DataTable from "../../TableDynamic/DataTable";
import { useTranslation } from "react-i18next";

interface TableControllerViewProps {
  data?: {
    metaType1?: string;
    metaType3?: string;
    DisplayName?: string;
    PersianName?: string;
  };
  isFaMode?: boolean;
}

const getHeadersFromMeta = (meta: string) => {
  if (meta.includes("\n")) {
    const parts = meta.split("\n").filter((part) => part.trim() !== "");
    return parts.map((p, i) => ({ headerName: p, field: `a${i + 1}` }));
  } else {
    const columns = 3;
    const trimmed = meta.trim();
    if (trimmed.length % columns === 0 && trimmed.length !== 0) {
      const partLength = trimmed.length / columns;
      const parts: string[] = [];
      for (let i = 0; i < columns; i++) {
        parts.push(trimmed.substring(i * partLength, (i + 1) * partLength));
      }
      return [
        { headerName: parts[0], field: "a1" },
        { headerName: parts[1], field: "a2" },
        { headerName: parts[2], field: "a3" },
      ];
    }
    const approx = Math.floor(trimmed.length / columns);
    return [
      { headerName: trimmed.substring(0, approx), field: "a1" },
      { headerName: trimmed.substring(approx, approx * 2), field: "a2" },
      { headerName: trimmed.substring(approx * 2), field: "a3" },
    ];
  }
};

const TableControllerView: React.FC<TableControllerViewProps> = ({
  data,
  isFaMode = false,
}) => {
  const { t } = useTranslation();

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || ""
    : data?.DisplayName || data?.PersianName || "";

  const metaHeaderStored = data?.metaType1 || "";
  const headerDisplay = metaHeaderStored;

  const headers = useMemo(() => {
    if (headerDisplay) {
      return getHeadersFromMeta(headerDisplay);
    }
    return [
      { headerName: "a1", field: "a1" },
      { headerName: "a2", field: "a2" },
      { headerName: "a3", field: "a3" },
    ];
  }, [headerDisplay]);

  const tableDataRaw = useMemo(() => {
    if (data?.metaType3 && data.metaType3.trim() !== "") {
      try {
        return JSON.parse(data.metaType3);
      } catch (error) {
        console.error("Error parsing metaType3:", error);
        return [];
      }
    }
    return [];
  }, [data?.metaType3]);

  const tableDataForShow = useMemo(() => {
    return tableDataRaw.map((row: any) => {
      const values = Object.values(row);
      const newRow: Record<string, any> = {};
      headers.forEach((header, i) => {
        newRow[header.headerName] = values[i] !== undefined ? values[i] : "";
      });
      return newRow;
    });
  }, [tableDataRaw, headers]);

  const columns = useMemo(() => {
    if (tableDataForShow.length > 0) {
      return Object.keys(tableDataForShow[0]).map((key) => ({
        headerName: key,
        field: key,
        editable: false,
      }));
    }
    return headers.map((header) => ({
      headerName: header.headerName,
      field: header.headerName,
      editable: false,
    }));
  }, [tableDataForShow, headers]);

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-300">
      {label && (
        <div className="mb-2 text-xs font-semibold text-gray-700">{label}</div>
      )}
      <div className="ag-theme-quartz h-40">
        <DataTable
          columnDefs={columns}
          rowData={tableDataForShow}
          onRowDoubleClick={() => {}}
          setSelectedRowData={() => {}}
          showDuplicateIcon={false}
          showEditIcon={false}
          showAddIcon={false}
          showDeleteIcon={false}
          onAdd={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onDuplicate={() => {}}
          showSearch={false}
          showAddNew={false}
          isLoading={false}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};

export default TableControllerView;
