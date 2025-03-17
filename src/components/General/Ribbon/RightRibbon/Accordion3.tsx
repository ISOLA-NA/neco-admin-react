import React, { useState, useMemo, useEffect } from 'react'
import {
  FiCopy,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi'
import { FaSearch, FaSave, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import DynamicInput from '../../../utilities/DynamicInput'
import DynamicRadioGroup from '../../../utilities/DynamicRadiogroup'
import FileUploadHandler, {
  InsertModel
} from '../../../../services/FileUploadHandler'
import DataTable from '../../../TableDynamic/DataTable'
import { useSubTabDefinitions } from '../../../../context/SubTabDefinitionsContext'
import AppServices, { MenuItem } from '../../../../services/api.services'
import DynamicConfirm from '../../../utilities/DynamicConfirm'

interface Accordion3Props {
  selectedMenuGroupId: number | null
  onRowDoubleClick: (menuItemId: number) => void
  isOpen: boolean
  toggleAccordion: () => void
}

interface RowData3 {
  ID: number
  Name: string
  Command: string
  Description: string
  Order: number
  IsVisible?: boolean
  LastModified?: string | null
  ModifiedById?: string | null
  IconImageId?: string | null
}

const Accordion3: React.FC<Accordion3Props> = ({
  selectedMenuGroupId,
  onRowDoubleClick,
  isOpen,
  toggleAccordion
}) => {
  const { subTabDefinitions, fetchDataForSubTab } = useSubTabDefinitions()
  const [rowData, setRowData] = useState<RowData3[]>([])
  const [selectedRow, setSelectedRow] = useState<RowData3 | null>(null)
  const [searchText, setSearchText] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Whether user is in "edit" mode or "adding" mode. (Optional usage)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isAdding, setIsAdding] = useState<boolean>(false)

  // Form data for the item
  const [formData, setFormData] = useState<Partial<RowData3>>({
    Name: '',
    Command: '', // Now optional
    Description: '',
    Order: 0
  })

  // For radio and file upload
  const [selectedSize, setSelectedSize] = useState<string>('0')
  const [iconImageId, setIconImageId] = useState<string | null>(null)
  const [resetCounter, setResetCounter] = useState<number>(0)

  // Confirm dialogs (DynamicConfirm) states
  const [confirmInsertOpen, setConfirmInsertOpen] = useState<boolean>(false)
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState<boolean>(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false)
  const [errorConfirmOpen, setErrorConfirmOpen] = useState<boolean>(false)

  // Define columns for the DataTable
  const columnDefs = [
    ...(subTabDefinitions['MenuItem']?.columnDefs || []),
    {
      headerName: 'Actions',
      field: 'operations',
      sortable: false,
      filter: false,
      width: 150,
      cellRendererFramework: (params: any) => (
        <div className='flex space-x-2'>
          <button
            className='text-yellow-600 hover:text-yellow-800 transition'
            onClick={() => handleDuplicate(params.data)}
            title='Duplicate'
          >
            <FiCopy size={20} />
          </button>
          <button
            className='text-blue-600 hover:text-blue-800 transition'
            onClick={() => handleEdit(params.data)}
            title='Edit'
          >
            <FiEdit size={20} />
          </button>
          <button
            className='text-red-600 hover:text-red-800 transition'
            onClick={() => handleDelete(params.data)}
            title='Delete'
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      )
    }
  ]

  // Load row data whenever accordion is open and selectedMenuGroupId is not null
  const loadRowData = async () => {
    if (isOpen && selectedMenuGroupId !== null) {
      setIsLoading(true)
      try {
        const data: RowData3[] = await fetchDataForSubTab('MenuItem', {
          ID: selectedMenuGroupId
        })
        const sanitizedData = data.map(item => ({
          ...item,
          ModifiedById: item.ModifiedById === '' ? null : item.ModifiedById,
          IconImageId: item.IconImageId === '' ? null : item.IconImageId
        }))
        setRowData(sanitizedData)
      } catch (error) {
        console.error('Error fetching MenuItems:', error)
      } finally {
        setIsLoading(false)
      }
    } else {
      // If accordion is closed or no group selected, clear everything
      setRowData([])
      setSelectedRow(null)
      setIsEditing(false)
      setIsAdding(false)
      setFormData({ Name: '', Command: '', Description: '', Order: 0 })
      setSelectedSize('0')
      setIconImageId(null)
      setResetCounter(prev => prev + 1)
    }
  }

  useEffect(() => {
    loadRowData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedMenuGroupId])

  // Filter rows by search text
  const filteredRowData = useMemo(() => {
    if (!searchText) return rowData
    return rowData.filter(
      row =>
        row.Name.toLowerCase().includes(searchText.toLowerCase()) ||
        row.Command.toLowerCase().includes(searchText.toLowerCase()) ||
        row.Description.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [searchText, rowData])

  // Single-click on row -> fill the form in the accordion
  const handleRowClick = (row: RowData3) => {
    const sanitizedRow = {
      ...row,
      ModifiedById: row.ModifiedById === '' ? null : row.ModifiedById,
      IconImageId: row.IconImageId === '' ? null : row.IconImageId
    }
    setSelectedRow(sanitizedRow)
    setFormData(sanitizedRow)
    setSelectedSize(sanitizedRow.Order?.toString() || '0')
    setIconImageId(sanitizedRow.IconImageId || null)
    setIsEditing(false)
    setIsAdding(false)
  }

  // Double-click on row
  const handleRowDoubleClick = (row: RowData3) => {
    onRowDoubleClick(row.ID)
  }

  // Duplicate action
  const handleDuplicate = (row: RowData3) => {
    const duplicatedRow: RowData3 = {
      ...row,
      ID: 0,
      Name: `${row.Name} (Copy)`,
      ModifiedById: null,
      IconImageId: null
    }
    setFormData(duplicatedRow)
    setSelectedSize('0')
    setIconImageId(null)
    setIsAdding(true)
    setIsEditing(false)
    setSelectedRow(null)
    setResetCounter(prev => prev + 1)
  }

  // Edit action (from actions column)
  const handleEdit = (row: RowData3) => {
    setSelectedRow(row)
    setFormData(row)
    setSelectedSize(row.Order?.toString() || '0')
    setIconImageId(row.IconImageId || null)
    setIsEditing(true)
    setIsAdding(false)
  }

  // Delete action (from actions column)
  const handleDelete = (row: RowData3) => {
    setSelectedRow(row)
    setConfirmDeleteOpen(true)
  }

  // Delete button in the top area
  const handleDeleteClick = () => {
    if (!selectedRow) return
    setConfirmDeleteOpen(true)
  }

  // New button
  const handleNew = () => {
    if (selectedMenuGroupId === null) {
      setErrorConfirmOpen(true)
      return
    }
    const newRow: RowData3 = {
      ID: 0,
      Name: '',
      Command: '',
      Description: '',
      Order: 0,
      IsVisible: true,
      LastModified: null,
      ModifiedById: null,
      IconImageId: null
    }
    setSelectedRow(null)
    setFormData(newRow)
    setSelectedSize('0')
    setIconImageId(null)
    setIsAdding(true)
    setIsEditing(false)
    setResetCounter(prev => prev + 1)
  }

  // Validate the form (only Name is required now)
  const validateForm = (): boolean => {
    if (!formData.Name) {
      setErrorConfirmOpen(true)
      return false
    }
    return true
  }

  // Insert button
  const handleInsert = () => {
    if (!validateForm()) return
    setConfirmInsertOpen(true)
  }

  // Update button
  const handleUpdate = () => {
    if (!selectedRow) return
    if (!validateForm()) return
    setConfirmUpdateOpen(true)
  }

  // Handle form inputs
  const handleInputChange = (
    name: string,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Radio changes
  const handleRadioChange = (value: string) => {
    setSelectedSize(value)
    setFormData(prev => ({
      ...prev,
      Order: parseInt(value, 10)
    }))
  }

  // File upload success
  const handleUploadSuccess = (insertModel: InsertModel) => {
    setIconImageId(insertModel.ID || null)
    setFormData(prev => ({
      ...prev,
      IconImageId: insertModel.ID || null
    }))
  }

  // Confirm insert
  const confirmInsert = async () => {
    try {
      const newMenuItem: MenuItem = {
        ID: 0,
        Name: formData.Name!,
        Command: formData.Command || '',
        Description: formData.Description || '',
        Order: formData.Order || 0,
        nMenuGroupId: selectedMenuGroupId!,
        IsVisible: formData.IsVisible ?? true,
        LastModified: null,
        ModifiedById: formData.ModifiedById || null,
        IconImageId: iconImageId || null,
        CommandWeb: '',
        CommandMobile: '',
        HelpText: '',
        KeyTip: '',
        Size: formData.Order || 0
      }
      console.log('Inserting MenuItem:', newMenuItem)
      await AppServices.insertMenuItem(newMenuItem)
      await loadRowData()
      setFormData({ Name: '', Command: '', Description: '', Order: 0 })
      setSelectedSize('0')
      setIconImageId(null)
      setIsAdding(false)
      setResetCounter(prev => prev + 1)
    } catch (error) {
      console.error('Error inserting MenuItem:', error)
    } finally {
      setConfirmInsertOpen(false)
    }
  }

  // Confirm update
  const confirmUpdate = async () => {
    if (!selectedRow) return
    try {
      const updatedMenuItem: MenuItem = {
        ID: formData.ID!,
        Name: formData.Name!,
        Command: formData.Command || '',
        Description: formData.Description || '',
        Order: formData.Order || 0,
        nMenuGroupId: selectedMenuGroupId!,
        IsVisible: formData.IsVisible ?? true,
        LastModified: formData.LastModified || null,
        ModifiedById: formData.ModifiedById || null,
        IconImageId: formData.IconImageId || null,
        CommandWeb: '',
        CommandMobile: '',
        HelpText: '',
        KeyTip: '',
        Size: formData.Order || 0
      }
      console.log('Updating MenuItem:', updatedMenuItem)
      await AppServices.updateMenuItem(updatedMenuItem)
      await loadRowData()
      setIsEditing(false)
      setResetCounter(prev => prev + 1)
    } catch (error) {
      console.error('Error updating MenuItem:', error)
    } finally {
      setConfirmUpdateOpen(false)
    }
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedRow) return
    try {
      await AppServices.deleteMenuItem(selectedRow.ID)
      await loadRowData()
      setSelectedRow(null)
      setFormData({ Name: '', Command: '', Description: '', Order: 0 })
      setIsEditing(false)
      setIsAdding(false)
      setSelectedSize('0')
      setIconImageId(null)
      setResetCounter(prev => prev + 1)
    } catch (error) {
      console.error('Error deleting MenuItem:', error)
    } finally {
      setConfirmDeleteOpen(false)
    }
  }

  const closeErrorConfirm = () => {
    setErrorConfirmOpen(false)
  }

  return (
    <div className='mb-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 transition-all duration-300'>
      {/* Accordion header */}
      <div
        className='flex justify-between items-center p-4 bg-white border-b border-gray-300 rounded-t-lg cursor-pointer'
        onClick={toggleAccordion}
      >
        <span className='text-xl font-medium'>Menu Items</span>
        <div className='flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full'>
          {isOpen ? (
            <FiChevronUp className='text-gray-700' size={20} />
          ) : (
            <FiChevronDown className='text-gray-700' size={20} />
          )}
        </div>
      </div>

      {isOpen && (
        <div className='p-4 bg-white rounded-b-lg'>
          {selectedMenuGroupId !== null ? (
            <>
              {/* Search bar */}
              <div className='flex items-center justify-between mb-4'>
                <div className='relative max-w-sm'>
                  <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
                  <input
                    type='text'
                    placeholder='Search...'
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition'
                    style={{ fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              {/* DataTable */}
              <div style={{ height: '300px', overflowY: 'auto' ,marginTop:'-15px'}}>
                <DataTable
                  columnDefs={columnDefs}
                  rowData={filteredRowData}
                  onRowClick={handleRowClick}
                  onRowDoubleClick={data => handleRowDoubleClick(data)}
                  isLoading={isLoading}
                  showSearch={false}
                  domLayout='normal'
                  showAddIcon={false}
                  showEditIcon={false}
                  showDeleteIcon={false}
                  showDuplicateIcon={false}
                />
              </div>

              {/* The form */}
              <div className='mt-4 p-4 border rounded bg-gray-50 shadow-inner'>
                <div className='grid grid-cols-1 gap-6'>
                  <DynamicInput
                    name='Name'
                    type='text'
                    value={formData.Name || ''}
                    placeholder='Name'
                    onChange={e => handleInputChange('Name', e.target.value)}
                    className='mt-2'
                  />
                  <DynamicInput
                    name='Command'
                    type='text'
                    value={formData.Command || ''}
                    placeholder='Command (Optional)'
                    onChange={e => handleInputChange('Command', e.target.value)}
                    className='mt-2'
                  />
                  <DynamicInput
                    name='Description'
                    type='text'
                    value={formData.Description || ''}
                    placeholder='Description'
                    onChange={e =>
                      handleInputChange('Description', e.target.value)
                    }
                    className='mt-2'
                  />
                  <DynamicInput
                    name='Order'
                    type='number'
                    value={formData.Order || 0}
                    placeholder='Order'
                    onChange={e =>
                      handleInputChange(
                        'Order',
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    className='mt-2'
                  />
                  <div className='flex flex-col md:flex-row justify-between items-start gap-4'>
                    <DynamicRadioGroup
                      options={[
                        { value: '0', label: 'Large' },
                        { value: '1', label: 'Medium' },
                        { value: '2', label: 'Small' }
                      ]}
                      title='Size'
                      name='size'
                      selectedValue={selectedSize}
                      onChange={handleRadioChange}
                      className='w-full md:w-1/2'
                      isRowClicked={true}
                    />
                    <FileUploadHandler
                      selectedFileId={iconImageId}
                      onUploadSuccess={handleUploadSuccess}
                      resetCounter={resetCounter}
                      onReset={() => setResetCounter(prev => prev + 1)}
                    />
                  </div>
                </div>
                {/* Action buttons */}
                <div className='flex items-center gap-4 mt-4'>
                  <button
                    onClick={handleInsert}
                    className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition'
                  >
                    <FaSave /> Save
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={!selectedRow}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                      selectedRow
                        ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                        : 'bg-blue-300 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <FaEdit /> Update
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={!selectedRow}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                      selectedRow
                        ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
                        : 'bg-red-300 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <FaTrash /> Delete
                  </button>
                  <button
                    onClick={handleNew}
                    className='flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition'
                  >
                    <FaPlus /> New
                  </button>
                </div>
              </div>
            </>
          ) : (
            // If no MenuGroup is selected
            isOpen && (
              <p className='text-gray-500'>
                Please select a Menu Group in Accordion2 so the Menu Items will
                be displayed.
              </p>
            )
          )}
        </div>
      )}

      {/* Confirm Insert */}
      <DynamicConfirm
        isOpen={confirmInsertOpen}
        title='Insert Confirmation'
        message='Are you sure you want to add this Menu Item?'
        onConfirm={confirmInsert}
        onClose={() => setConfirmInsertOpen(false)}
        variant='add'
      />

      {/* Confirm Update */}
      <DynamicConfirm
        isOpen={confirmUpdateOpen}
        title='Update Confirmation'
        message='Are you sure you want to update this Menu Item?'
        onConfirm={confirmUpdate}
        onClose={() => setConfirmUpdateOpen(false)}
        variant='edit'
      />

      {/* Confirm Delete */}
      <DynamicConfirm
        isOpen={confirmDeleteOpen}
        title='Delete Confirmation'
        message={`Are you sure you want to delete Menu Item "${selectedRow?.Name}"?`}
        onConfirm={confirmDelete}
        onClose={() => setConfirmDeleteOpen(false)}
        variant='delete'
      />

      {/* Error message (only Name is required now) */}
      <DynamicConfirm
        isOpen={errorConfirmOpen}
        title='Error'
        message='Name is required.'
        onConfirm={closeErrorConfirm}
        onClose={closeErrorConfirm}
        variant='error'
        hideCancelButton={true}
      />
    </div>
  )
}

export default Accordion3
