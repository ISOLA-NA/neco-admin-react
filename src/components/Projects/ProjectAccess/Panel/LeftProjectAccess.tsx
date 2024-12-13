import React, { useState, useEffect } from "react";
import DataTable from "../../../TableDynamic/DataTable";
import DynamicSelector from "../../../utilities/DynamicSelector";
import { LeftProjectData, LeftItem } from "../../../Views/tab/tabData";

interface LeftProjectAccessProps {
  selectedRow: any;
  onDoubleClickSubItem: (data: LeftItem) => void; // اضافه شده
}

const LeftProjectAccess: React.FC<LeftProjectAccessProps> = ({
  selectedRow,
  onDoubleClickSubItem,
}) => {
  const [leftColumnDefs] = useState([
    {
      headerName: "Name",
      field: "name",
      filter: "agTextColumnFilter",
    },
  ]);

  const [leftRowData, setLeftRowData] = useState<LeftItem[]>([]);
  const [selectedSubItemRow, setSelectedSubItemRow] = useState<LeftItem | null>(
    null
  );

  useEffect(() => {
    if (selectedRow && selectedRow.ID) {
      const data = LeftProjectData[selectedRow.ID] || [];
      setLeftRowData(data);
      setSelectedSubItemRow(null);
    } else {
      setLeftRowData([]);
      setSelectedSubItemRow(null);
    }
  }, [selectedRow]);

  const handleSubItemClick = (data: LeftItem) => {
    setSelectedSubItemRow(data);
  };

  const handleSubItemDoubleClick = (data: LeftItem) => {
    setSelectedSubItemRow(data);
    onDoubleClickSubItem(data); // اینجا به TabContent اطلاع می‌دهیم
  };

  return (
    <div className="h-full p-4">
      <DynamicSelector
        label="نام"
        options={leftRowData.map((item) => ({
          value: item.name,
          label: item.name,
        }))}
        selectedValue={selectedSubItemRow ? selectedSubItemRow.name : ""}
        onChange={() => {}}
        className="w-full mb-8"
        error={false}
      />

      <DataTable
        columnDefs={leftColumnDefs}
        rowData={leftRowData}
        onRowDoubleClick={handleSubItemDoubleClick}
        setSelectedRowData={handleSubItemClick}
        onAdd={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onDuplicate={() => {}}
        isRowSelected={!!selectedSubItemRow}
      />
    </div>
  );
};

export default LeftProjectAccess;
