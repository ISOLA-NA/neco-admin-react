import React, { useState } from "react";
import DynamicModal from "../utilities/DynamicModal";
import DynamicInput from "../utilities/DynamicInput";
import EditForm from "./AddForm";

interface RowData {
  ID: number;
  Name: string;
}

const sampleData: RowData[] = [
  { ID: 1, Name: "Apple" },
  { ID: 2, Name: "Banana" },
  { ID: 3, Name: "Cherry" },
];

const ModalFormTest: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);

  const handleRowClick = (row: RowData) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedRow(null);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4 font-bold">🧪 Modal Form Test</h2>
      <ul className="space-y-2">
        {sampleData.map((row) => (
          <li
            key={row.ID}
            className="p-2 border rounded cursor-pointer hover:bg-gray-100"
            onClick={() => handleRowClick(row)}
          >
            {row.Name}
          </li>
        ))}
      </ul>

      {/* Modal for Editing */}
      <DynamicModal isOpen={modalOpen} onClose={handleClose}>
        <EditForm
          key={selectedRow?.ID || "new"} // ✅ کلید برای ری‌رن شدن فرم
          initialData={selectedRow}
          onClose={handleClose}
        />
      </DynamicModal>
    </div>
  );
};

export default ModalFormTest;
