// src/Views/TestProgramDesigner.tsx

import React, { useState } from "react";
import ProgramDesignerGrid from "../components/Programs/ProgramTemplate/ProgramDesignerGrid";
import AddEditProgramField from "../components/Programs/ProgramTemplate/AddEditProgramField";
import { useProgramDesigner } from "../context/ProgramDesignerContext";
import { SinglePFI } from "../services/programDesigner/types";

interface SelectedRowInfo {
  ID: string;
  GPIC: string;
  ActivityType: string;
}

const TestProgramDesigner: React.FC = () => {
  // ⚠️ موقتی: فقط برای تست، بعداً از selectedRow واقعی گرفته می‌شود
  const TEST_PROGRAM_TEMPLATE_ID = 2061;

  const { getSinglePFI } = useProgramDesigner();

  const [selectedRow, setSelectedRow] = useState<SelectedRowInfo | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalParentGPIC, setModalParentGPIC] = useState<string | null>(null);
  const [modalInitialData, setModalInitialData] = useState<SinglePFI | null>(
    null
  );

  const handleRowSelect = (row: any) => {
    setSelectedRow({
      ID: row.ID,
      GPIC: row.GPIC,
      ActivityType: row["Activity Type"],
    });
    setWarningMessage(null);
  };

  const handleAddRoot = () => {
    setModalMode("add");
    setModalParentGPIC(null);
    setModalInitialData(null);
    setModalOpen(true);
  };

  const handleAddChildForInFPP = () => {
    if (!selectedRow) {
      setWarningMessage("لطفاً ابتدا یک ردیف را انتخاب کنید.");
      return;
    }
    if (selectedRow.ActivityType !== "InFPP") {
      setWarningMessage(
        "برای افزودن زیرمجموعه، ردیف انتخاب‌شده باید از نوع InFPP باشد."
      );
      return;
    }
    setWarningMessage(null);
    setModalMode("add");
    setModalParentGPIC(selectedRow.GPIC);
    setModalInitialData(null);
    setModalOpen(true);
  };

  const handleRowDoubleClick = async (row: any) => {
    const fullData = await getSinglePFI(Number(row.ID));
    setModalMode("edit");
    setModalParentGPIC(null);
    setModalInitialData(fullData);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="p-6" dir="rtl">
      <h2 className="text-lg font-bold mb-4 text-purple-700">
        تست Program Designer (ProgramTemplateID = {TEST_PROGRAM_TEMPLATE_ID})
      </h2>

      <div className="flex gap-2 mb-3">
        <button
          onClick={handleAddRoot}
          className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
        >
          + Add Row
        </button>
        <button
          onClick={handleAddChildForInFPP}
          className="px-4 py-2 bg-pink-500 text-white text-sm rounded hover:bg-pink-600"
        >
          + Add Row For InFPP
        </button>
      </div>

      {warningMessage && (
        <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-300 text-yellow-700 text-sm rounded">
          {warningMessage}
        </div>
      )}

      <ProgramDesignerGrid
        programTemplateId={TEST_PROGRAM_TEMPLATE_ID}
        onRowSelect={handleRowSelect}
        onRowDoubleClick={handleRowDoubleClick}
        selectedRowId={selectedRow?.GPIC ?? null}
        refreshKey={refreshKey}
      />

      {modalOpen && (
        <AddEditProgramField
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          mode={modalMode}
          mainProgramId={TEST_PROGRAM_TEMPLATE_ID}
          parentGPIC={modalParentGPIC}
          initialData={modalInitialData}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default TestProgramDesigner;