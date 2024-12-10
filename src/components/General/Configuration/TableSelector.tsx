// src/components/Configuration/TableSelector.tsx

import React from 'react'
import DataTable from '../../TableDynamic/DataTable'

interface ColumnDef {
  headerName: string
  field: string
}

interface TableSelectorProps {
  columnDefs: ColumnDef[]
  rowData: any[]
  selectedRow: any
  onRowDoubleClick: (data: any) => void
  onRowClick: (data: any) => void
  onSelectButtonClick: () => void
  isSelectDisabled: boolean
}

const TableSelector: React.FC<TableSelectorProps> = ({
  columnDefs,
  rowData,
  selectedRow,
  onRowDoubleClick,
  onRowClick,
  onSelectButtonClick,
  isSelectDisabled
}) => {
  return (
    <div>
      <DataTable
        columnDefs={columnDefs}
        rowData={rowData}
        onRowDoubleClick={onRowDoubleClick}
        setSelectedRowData={onRowClick}
        showDuplicateIcon={false}
        onAdd={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onDuplicate={() => {}}
      />

      <div className='mt-4 flex justify-center'>
        <button
          className={`btn w-48 ${
            isSelectDisabled
              ? 'bg-blue-300 text-gray-500 cursor-not-allowed'
              : 'btn-primary'
          }`}
          onClick={onSelectButtonClick}
          disabled={isSelectDisabled}
        >
          Select
        </button>
      </div>
    </div>
  )
}

export default TableSelector
