// src/components/TableControllerView.tsx
import React, { useMemo } from "react";
import DataTable from "../../TableDynamic/DataTable";

interface TableControllerViewProps {
  data?: {
    metaType1?: string; // به صورت ذخیره‌شده بدون newline، مثلاً "alimammadhabib" یا ممکن است شامل \n هم باشد (برای ویرایش)
    metaType3?: string; // داده‌های جدول به صورت JSON؛ مثلاً: [{"a1":"11","a2":"22","a3":"23"},{"a1":"44","a2":"55","a3":"66"}]
    DisplayName?: string;
  };
}

// تابع کمکی برای تولید هدرهای جدول
// اگر meta شامل newline باشد، آن را با تقسیم بر newline دریافت می‌کنیم؛ در غیر این صورت به صورت مساوی تقسیم می‌شود.
const getHeadersFromMeta = (meta: string) => {
  if (meta.includes("\n")) {
    const parts = meta.split("\n").filter((part) => part.trim() !== "");
    return parts.map((p, i) => ({ headerName: p, field: `a${i + 1}` }));
  } else {
    // اگر meta به صورت پیوسته باشد؛ تقسیم به 3 بخش
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
    // fallback
    const approx = Math.floor(trimmed.length / columns);
    return [
      { headerName: trimmed.substring(0, approx), field: "a1" },
      { headerName: trimmed.substring(approx, approx * 2), field: "a2" },
      { headerName: trimmed.substring(approx * 2), field: "a3" },
    ];
  }
};

const TableControllerView: React.FC<TableControllerViewProps> = ({ data }) => {
  // metaType1 برای ذخیره‌سازی معمولاً بدون newline است؛ اما برای نمایش، اگر newline داشته باشد، همان استفاده شود.
  // در صورتی که metaType1 شامل newline نباشد، برای نمایش آن را به صورت multiline تبدیل می‌کنیم.
  const metaHeaderStored = data?.metaType1 || "";
  // برای نمایش، اگر metaHeaderStored شامل "|" (delimiter) نباشد، می‌توانیم به صورت پیش‌فرض هر 2 کاراکتر را جدا کنیم؛
  // اما در اینجا فرض می‌کنیم اگر newline وجود نداشته باشد، همان مقدار نمایش داده شود.
  const headerDisplay = metaHeaderStored.includes("\n")
    ? metaHeaderStored
    : metaHeaderStored; // می‌توانید در صورت نیاز، تقسیم‌بندی دلخواه انجام دهید.

  // استخراج هدرها از metaType1 (یا headerDisplay)
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

  // پارس کردن metaType3 به آرایه‌ای از اشیاء
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

  // ساخت داده‌های جدول جهت نمایش؛ به ازای هر ردیف، کلیدهای آن از هدرهای استخراج‌شده گرفته می‌شود.
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

  // تعریف ستون‌ها برای DataTable
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
      {data?.DisplayName && (
        <div className="mb-2 text-sm font-medium text-gray-700">
          {data.DisplayName}
        </div>
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
