// src/components/TableController.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import CustomTextarea from "../../utilities/DynamicTextArea";
import DynamicModal from "../../utilities/DynamicModal";
import DataTable from "../../TableDynamic/DataTable";
import { useTranslation } from "react-i18next";

interface TableControllerProps {
  onMetaChange?: (meta: {
    metaType1: string;
    metaType2: string;
    metaType3: string;
  }) => void;
  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
  };
}

/* ---------- helpers ---------- */
const getHeadersFromMeta = (meta: string) => {
  if (meta.includes("|")) {
    return meta
      .split("|")
      .filter((p) => p.trim() !== "")
      .map((p, i) => ({ headerName: p, field: `a${i + 1}` }));
  }
  const cols = 3;
  const t = meta.trim();
  if (t.length && t.length % cols === 0) {
    const len = t.length / cols;
    return Array.from({ length: cols }, (_, i) => ({
      headerName: t.substring(i * len, (i + 1) * len),
      field: `a${i + 1}`,
    }));
  }
  return ["a1", "a2", "a3"].map((h) => ({ headerName: h, field: h }));
};

const TableController: React.FC<TableControllerProps> = ({
  onMetaChange,
  data = {},
}) => {
  const { t } = useTranslation();
  /* ---------- state ---------- */
  const [headerInput, setHeaderInput] = useState<string>(
    data.metaType1 ?? "a\nb\nc"
  );
  const computedHeader = useMemo(
    () => headerInput.replace(/\n/g, "|"),
    [headerInput]
  );

  const [isRowFixed, setIsRowFixed] = useState(!!data.metaType2);
  const [fixRowValue, setFixRowValue] = useState(data.metaType2 ?? "");

  const [tableData, setTableData] = useState<Record<string, any>[]>(() => {
    if (data.metaType3) {
      try {
        return JSON.parse(data.metaType3).map((r: any, i: number) => ({
          ...r,
          id: i,
        }));
      } catch {
        return [];
      }
    }
    return [];
  });
  const nextRowId = useRef(tableData.length);

  /* ---------- sync props→state ---------- */
  useEffect(() => {
    setHeaderInput((p) =>
      p === (data.metaType1 ?? "a\nb\nc") ? p : data.metaType1 ?? "a\nb\nc"
    );
    setIsRowFixed((prev) =>
      prev === !!data.metaType2 ? prev : !!data.metaType2
    );
    setFixRowValue((p) =>
      p === (data.metaType2 ?? "") ? p : data.metaType2 ?? ""
    );

    if (data.metaType3) {
      try {
        const parsed = JSON.parse(data.metaType3).map((r: any, i: number) => ({
          ...r,
          id: i,
        }));
        setTableData((prev) =>
          JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed
        );
        nextRowId.current = parsed.length;
      } catch {}
    }
  }, [data.metaType1, data.metaType2, data.metaType3]);

  /* ---------- memoized columnDefs ---------- */
  const columnDefs = useMemo(
    () =>
      getHeadersFromMeta(computedHeader).map((h) => ({
        ...h,
        editable: true,
      })),
    [computedHeader]
  );

  /* ---------- push meta up ---------- */
  const prevMetaRef = useRef("");
  useEffect(() => {
    const meta = {
      metaType1: headerInput.trim(),
      metaType2: isRowFixed ? fixRowValue : "",
      metaType3: JSON.stringify(
        tableData
          .filter((r) =>
            ["a1", "a2", "a3"].some((k) => r[k]?.toString().trim())
          )
          .map(({ a1, a2, a3 }) => ({ a1, a2, a3 }))
      ),
    };
    const s = JSON.stringify(meta);
    if (s !== prevMetaRef.current) {
      prevMetaRef.current = s;
      onMetaChange?.(meta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerInput, isRowFixed, fixRowValue, tableData]);

  /* ---------- handlers ---------- */
  const handleAddRow = () =>
    setTableData((p) => [
      ...p,
      { id: nextRowId.current++, a1: "", a2: "", a3: "" },
    ]);

  const handleCellChange = (e: any) =>
    setTableData((p) => p.map((r) => (r.id === e.data.id ? e.data : r)));

  /* ---------- modal ---------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    /* تیک بعدی: اجازه بده رویداد فعلی تمام شود */
    setTimeout(() => setIsModalOpen(true), 0);
  };

  /* ---------- UI ---------- */
  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex justify-center">
      <div className="p-4 w-full max-w-xl">
        {/* Fix Row */}
        <div className="mb-4">
          <div className="flex flex-nowrap items-center gap-4">
            <label className="inline-flex items-center gap-2 shrink-0 whitespace-nowrap">
              <input
                type="checkbox"
                checked={isRowFixed}
                onChange={(e) => setIsRowFixed(e.target.checked)}
              />
              <span className="whitespace-nowrap">
                {t("TableController.Labels.FixRow")}
              </span>
            </label>

            {/* اگر DynamicInput کلاس نمی‌گیرد، همین دیو بیرونی کافیست */}
            <div className="shrink-0">
              <DynamicInput
                name={t("TableController.Labels.FixRowValue")}
                type="number"
                value={fixRowValue}
                onChange={(e) => setFixRowValue(e.target.value)}
                /* اگر پشتیبانی می‌کند مفید است: className="w-24" */
              />
            </div>
          </div>
        </div>

        {/* textarea for headers */}
        <CustomTextarea
          name={t("TableController.Labels.ColumnTitles")}
          value={headerInput}
          onChange={(e) => setHeaderInput(e.target.value)}
          placeholder={t(
            "TableController.Placeholders.EnterEachHeaderOnNewLine"
          )}
          rows={headerInput.split("\n").length || 1}
        />

        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={openModal}
          type="button"
        >
          {t("TableController.Buttons.DefVal")}
        </button>

        {/* modal */}
        <DynamicModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <h2 className="text-lg font-bold mb-4">
            {t("TableController.Titles.DynamicTable")}
          </h2>

          <div style={{ height: 400, overflow: "auto" }}>
            <DataTable
              columnDefs={columnDefs}
              rowData={tableData}
              onCellValueChanged={handleCellChange}
              domLayout="autoHeight"
              showAddIcon={false}
              showEditIcon={false}
              showDeleteIcon={false}
              showDuplicateIcon={false}
              showSearch={false}
            />
            <div className="flex flex-col space-y-2 mt-4">
              <button
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                onClick={handleAddRow}
                type="button"
              >
                {t("TableController.Buttons.AddNew")}
              </button>
              <button
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                {t("TableController.Buttons.Save")}
              </button>
            </div>
          </div>
        </DynamicModal>
      </div>
    </div>
  );
};

export default TableController;
