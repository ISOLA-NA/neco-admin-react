import { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import CustomTextarea from "../../utilities/DynamicTextArea";
import DynamicModal from "../../utilities/DynamicModal";
import DataTable from "../../TableDynamic/DataTable";

const TableController: React.FC = () => {
  const [isRowFixed, setIsRowFixed] = useState(false);
  const [fixRowValue, setFixRowValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableHeaders, setTableHeaders] = useState<
    { headerName: string; field: string }[]
  >([]);
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    const headers = textareaValue
      .split("\n")
      .filter((line) => line.trim() !== "");
    setTableHeaders(
      headers.map((header) => ({ headerName: header, field: header }))
    );
  }, [textareaValue]);

  const handleFixRowChange = () => {
    setIsRowFixed(!isRowFixed);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
  };

  const handleDefValClick = () => {
    setTableData([]); // Clear table data when opening a new table
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAddRow = () => {
    const newRow = tableHeaders.reduce((acc, header) => {
      acc[header.field] = ""; // Initialize new row with empty values
      return acc;
    }, {} as Record<string, any>);
    setTableData([...tableData, newRow]);
  };

  const handleCellChange = (event: any) => {
    const { rowIndex, colDef, newValue } = event;
    const updatedTableData = [...tableData];
    updatedTableData[rowIndex][colDef.field] = newValue;
    setTableData(updatedTableData);
  };

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100  rounded-lg flex items-center justify-center">
      <div className="p-4">
        {/* Fix Row Section */}
        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isRowFixed}
              onChange={handleFixRowChange}
            />
            <span>Fix Row</span>
          </label>
          <DynamicInput
            name="FixRowValue"
            type="number"
            value={fixRowValue}
            onChange={(e) => setFixRowValue(e.target.value)}
            disabled={!isRowFixed}
          />
        </div>

        {/* Textarea Section */}
        <CustomTextarea
          name="Type each Column Title on a separate line"
          value={textareaValue}
          onChange={handleTextareaChange}
          placeholder=""
          rows={2}
        />

        {/* Def Val Button */}
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleDefValClick}
        >
          Def Val
        </button>

        {/* Dynamic Modal */}
        <DynamicModal isOpen={isModalOpen} onClose={handleModalClose}>
          <h2 className="text-lg font-bold mb-4">Dynamic Table</h2>
          <div style={{ height: "400px", overflow: "auto" }}>
            <DataTable
              columnDefs={tableHeaders.map((header) => ({
                headerName: header.headerName,
                field: header.field,
                editable: true, // Enable editing for cells
              }))}
              rowData={tableData}
              onCellValueChanged={handleCellChange} // اضافه شد
              onRowDoubleClick={() => {}}
              setSelectedRowData={() => {}}
              showAddIcon={false}
              showEditIcon={false}
              showDeleteIcon={false}
              showDuplicateIcon={false}
              onAdd={handleAddRow}
              onEdit={() => {}}
              onDelete={() => {}}
              onDuplicate={() => {}}
              // isRowSelected={false}
              showSearch={false}
              showAddNew={true}
            />
            <button
              type="button"
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
              onClick={handleAddRow}
            >
              Add New
            </button>
          </div>
        </DynamicModal>
      </div>
    </div>
  );
};

export default TableController;
