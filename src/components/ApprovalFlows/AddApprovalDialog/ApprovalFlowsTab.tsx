// ApprovalFlowsTab.tsx

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle
} from 'react'
import DynamicInput from '../../utilities/DynamicInput'
import DynamicSelector from '../../utilities/DynamicSelector'
import DynamicModal from '../../utilities/DynamicModal'
import TableSelector from '../../General/Configuration/TableSelector'
import DataTable from '../../TableDynamic/DataTable'
import { FaPlus, FaTimes, FaEdit } from 'react-icons/fa'
import BoxPredecessor from './BoxPredecessor '
import ListSelector from '../../ListSelector/ListSelector'
import ButtonComponent from '../../General/Configuration/ButtonComponent'
import { v4 as uuidv4 } from 'uuid'
import { BoxTemplate, AFBtnItem } from '../../../services/api.services'
import { useApi } from '../../../context/ApiContext'
import DeemedSection from './BoxDeemed'
import { showAlert } from '../../utilities/Alert/DynamicAlert'

import 'react-toastify/dist/ReactToastify.css'  // فقط درصورت نیاز برای استایل

export interface Role {
  ID: string | number
  Name: string
  isStaticPost?: boolean
}

export interface TableRow {
  id: string
  nPostID: string
  cost1: number
  cost2: number
  cost3: number
  weight1: number
  weight2: number
  weight3: number
  required: boolean
  veto: boolean
  code: number
  originalID?: number
}

export interface ApprovalFlowsTabData {
  nameValue: string
  minAcceptValue: string
  minRejectValue: string
  actDurationValue: string
  orderValue: string
  acceptChecked: boolean
  rejectChecked: boolean
  tableData: TableRow[]
  selectedPredecessors: number[]
  selectedDefaultBtnIds: number[]
  deemDayValue: string
  deemConditionValue: string
  deemActionValue: string
  previewsStateIdValue: string
  goToPreviousStateIDValue: string
  isStage: boolean
  deemedEnabled: boolean
  actionBtnID: number | null
}

export interface ApprovalFlowsTabRef {
  getFormData: () => ApprovalFlowsTabData
  validateMinFields: () => boolean
}

interface ApprovalFlowsTabProps {
  editData?: BoxTemplate | null
  boxTemplates?: BoxTemplate[]
}

const ApprovalFlowsTab = forwardRef<ApprovalFlowsTabRef, ApprovalFlowsTabProps>(
  ({ editData, boxTemplates = [] }, ref) => {
    const api = useApi()

    const [allRoles, setAllRoles] = useState<Role[]>([])
    const [nameValue, setNameValue] = useState<string>('')
    const [minAcceptValue, setMinAcceptValue] = useState<string>('1')
    const [minRejectValue, setMinRejectValue] = useState<string>('')
    const [actDurationValue, setActDurationValue] = useState<string>('')
    const [orderValue, setOrderValue] = useState<string>('')
    const [acceptChecked, setAcceptChecked] = useState<boolean>(false)
    const [rejectChecked, setRejectChecked] = useState<boolean>(false)

    const [staticPostValue, setStaticPostValue] = useState<string>('')
    const [selectedStaticPost, setSelectedStaticPost] = useState<Role | null>(null)

    const [cost1, setCost1] = useState<string>('')
    const [cost2, setCost2] = useState<string>('')
    const [cost3, setCost3] = useState<string>('')

    const [weight1, setWeight1] = useState<string>('')
    const [weight2, setWeight2] = useState<string>('')
    const [weight3, setWeight3] = useState<string>('')

    const [vetoChecked, setVetoChecked] = useState<boolean>(false)
    const [requiredChecked, setRequiredChecked] = useState<boolean>(false)
    const [codeValue, setCodeValue] = useState<string>('')

    const [tableData, setTableData] = useState<TableRow[]>([])
    const [selectedRow, setSelectedRow] = useState<TableRow | null>(null)
    const [selectedPredecessors, setSelectedPredecessors] = useState<number[]>([])
    const [initialized, setInitialized] = useState<boolean>(false)

    const [btnList, setBtnList] = useState<AFBtnItem[]>([])
    const [selectedDefaultBtnIds, setSelectedDefaultBtnIds] = useState<number[]>([])

    const [deemDay, setDeemDay] = useState<number>(0)
    const [deemCondition, setDeemCondition] = useState<number>(0)
    const [deemAction, setDeemAction] = useState<number>(0)
    const [previewsStateId, setPreviewsStateId] = useState<number | null>(null)
    const [goToPreviousStateID, setGoToPreviousStateID] = useState<number | null>(null)

    const [isStage, setIsStage] = useState<boolean>(false)
    const [isDeemed, setIsDeemed] = useState<boolean>(true)

    const [actionBtnOptions, setActionBtnOptions] = useState<{ value: number; label: string }[]>([])
    const [actionBtnID, setActionBtnID] = useState<number | null>(null)
    const [approvalContextLoading, setApprovalContextLoading] = useState<boolean>(false)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    // گرفتن لیست نقش‌ها
    useEffect(() => {
      const fetchRoles = async () => {
        try {
          const res = await api.getAllRoles()
          setAllRoles(Array.isArray(res) ? res : res.data || [])
        } catch (error) {
          console.error('Error fetching roles:', error)
          showAlert('error', null, 'Error', 'An error occurred while fetching roles')
        }
      }
      fetchRoles()
    }, [api])

    // گرفتن لیست تمام دکمه‌ها
    useEffect(() => {
      const fetchButtons = async () => {
        try {
          const res = await api.getAllAfbtn()
          setBtnList(res)
        } catch (error) {
          console.error('Error fetching buttons:', error)
          showAlert('error', null, 'Error', 'An error occurred while fetching buttons')
        }
      }
      fetchButtons()
    }, [api])

    // گرفتن تنظیمات مربوط به دکمه اکشن
    useEffect(() => {
      const fetchConfigurations = async () => {
        try {
          const res = await api.getAllConfigurations()
          const options = res.map((conf: any) => ({
            value: conf.ID,
            label: conf.Name
          }))
          setActionBtnOptions(options)
        } catch (error) {
          console.error('Error fetching configurations:', error)
          showAlert('error', null, 'Error', 'An error occurred while fetching Action Button configurations')
        }
      }
      fetchConfigurations()
    }, [api])

    const columnDefs = [
      {
        headerName: 'Post',
        field: 'nPostID',
        sortable: true,
        filter: true,
        valueGetter: (params: any) => {
          const role = allRoles.find(r => r.ID.toString() === params.data.nPostID)
          return role && role.Name ? role.Name : params.data.nPostID || ''
        }
      },
      { headerName: 'Cost1', field: 'cost1', sortable: true, filter: true },
      { headerName: 'Cost2', field: 'cost2', sortable: true, filter: true },
      { headerName: 'Cost3', field: 'cost3', sortable: true, filter: true },
      { headerName: 'Weight1', field: 'weight1', sortable: true, filter: true },
      { headerName: 'Weight2', field: 'weight2', sortable: true, filter: true },
      { headerName: 'Weight3', field: 'weight3', sortable: true, filter: true },
      {
        headerName: 'Required',
        field: 'required',
        cellRendererFramework: (params: any) => (
          <input type='checkbox' checked={params.value} readOnly className='h-4 w-4' />
        )
      },
      {
        headerName: 'Veto',
        field: 'veto',
        cellRendererFramework: (params: any) => (
          <input type='checkbox' checked={params.value} readOnly className='h-4 w-4' />
        )
      },
      { headerName: 'Code', field: 'code', sortable: true, filter: true }
    ]

    const rolesColumnDefs = [
      { headerName: 'ID', field: 'ID', sortable: true, filter: true },
      { headerName: 'Name', field: 'Name', sortable: true, filter: true }
    ]

    // مقداردهی اولیه در صورت editData
    useEffect(() => {
      if (editData) {
        setNameValue(editData.Name || '')
        setActDurationValue(String(editData.MaxDuration || ''))
        setOrderValue(editData.Order ? editData.Order.toString() : '')
        setMinAcceptValue(editData.ActionMode ? editData.ActionMode.toString() : '1')
        setMinRejectValue(editData.MinNumberForReject ? editData.MinNumberForReject.toString() : '')
        setAcceptChecked(!!editData.ActionMode)
        setRejectChecked(!!editData.MinNumberForReject)
        setDeemDay(editData.DeemDay || 0)
        setDeemCondition(editData.DeemCondition || 0)
        setDeemAction(editData.DeemAction || 0)
        setPreviewsStateId(editData.PreviewsStateId || null)
        setGoToPreviousStateID(editData.GoToPreviousStateID || null)
        setActionBtnID(typeof editData.ActionBtnID === 'number' ? editData.ActionBtnID : null)

        // فقط یک بار داده‌های جدول Approval Context را می‌گیریم
        if (!initialized) {
          if (editData.PredecessorStr) {
            const numericIds = editData.PredecessorStr.split('|')
              .filter(Boolean)
              .map(idStr => parseInt(idStr, 10))
            setSelectedPredecessors(numericIds)
          } else {
            setSelectedPredecessors([])
          }
          if (editData.BtnIDs) {
            const numericBtnIds = editData.BtnIDs.split('|')
              .filter(Boolean)
              .map(x => parseInt(x, 10))
            setSelectedDefaultBtnIds(numericBtnIds)
          } else {
            setSelectedDefaultBtnIds([])
          }
          setApprovalContextLoading(true)
          api
            .getApprovalContextData(editData.ID)
            .then(approvalData => {
              const mappedRows: TableRow[] = approvalData.map(item => ({
                id: item.ID.toString(),
                nPostID: item.nPostID,
                cost1: item.PCost,
                cost2: 0,
                cost3: 0,
                weight1: item.Weight,
                weight2: 0,
                weight3: 0,
                required: item.IsRequired,
                veto: item.IsVeto,
                code: item.Code === '' ? 0 : Number(item.Code),
                originalID: item.ID
              }))
              setTableData(mappedRows)
            })
            .catch(err => {
              console.error('Error fetching approval context data:', err)
              showAlert('error', null, 'Error', 'An error occurred while fetching approval context data')
              setTableData([])
            })
            .finally(() => setApprovalContextLoading(false))
          setInitialized(true)
        }

        // ریست فرم مربوط به افزودن/ویرایش سطر
        setCost1('')
        setCost2('')
        setCost3('')
        setWeight1('')
        setWeight2('')
        setWeight3('')
        setRequiredChecked(false)
        setVetoChecked(false)
        setCodeValue('')
        setStaticPostValue('')
        setSelectedStaticPost(null)
      } else {
        // حالت افزودن BoxTemplate جدید
        setNameValue('')
        setMinAcceptValue('1')
        setMinRejectValue('')
        setActDurationValue('')
        setOrderValue('')
        setAcceptChecked(false)
        setRejectChecked(false)
        setCost1('')
        setCost2('')
        setCost3('')
        setWeight1('')
        setWeight2('')
        setWeight3('')
        setVetoChecked(false)
        setRequiredChecked(false)
        setCodeValue('')
        setStaticPostValue('')
        setSelectedStaticPost(null)
        setSelectedPredecessors([])
        setSelectedDefaultBtnIds([])
        setTableData([])
        setSelectedRow(null)
        setInitialized(false)
        setDeemDay(0)
        setDeemCondition(0)
        setDeemAction(0)
        setPreviewsStateId(null)
        setGoToPreviousStateID(null)
        setActionBtnID(null)
      }
    }, [editData, initialized, api])

    const staticPostOptions = allRoles.map(role => ({
      value: role.ID,
      label: role.Name
    }))

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    const handleRoleSelect = (data: Role) => {
      setSelectedStaticPost(data)
      setStaticPostValue(data.ID.toString())
      closeModal()
    }

    // اعتبارسنجی
    const validateMinFields = (): boolean => {
      if (!acceptChecked && !rejectChecked) {
        showAlert('error', null, 'Error', 'Please select at least one of Min Accept or Min Reject and enter a valid value.')
        return false
      }
      if (acceptChecked && !isStage) {
        const val = parseInt(minAcceptValue, 10)
        if (!minAcceptValue || isNaN(val) || val === 0) {
          showAlert('error', null, 'Error', 'Invalid Min Accept value.')
          return false
        }
      }
      if (rejectChecked) {
        const val = parseInt(minRejectValue, 10)
        if (!minRejectValue || isNaN(val) || val === 0) {
          showAlert('error', null, 'Error', 'Invalid Min Reject value.')
          return false
        }
      }
      return true
    }

    // افزودن یا ویرایش ردیف جدول
    const handleAddOrUpdateRow = () => {
      if (!staticPostValue) {
        showAlert('error', null, 'Error', 'Static Post is empty!')
        return
      }
      if (!validateMinFields()) return

      if (selectedRow) {
        // ویرایش سطر
        const updated = tableData.map(r =>
          r.id === selectedRow.id
            ? {
                ...r,
                nPostID: selectedStaticPost ? selectedStaticPost.ID.toString() : '',
                cost1: Number(cost1) || 0,
                cost2: Number(cost2) || 0,
                cost3: Number(cost3) || 0,
                weight1: Number(weight1) || 0,
                weight2: Number(weight2) || 0,
                weight3: Number(weight3) || 0,
                required: requiredChecked,
                veto: vetoChecked,
                code: Number(codeValue) || 0
              }
            : r
        )
        setTableData(updated)
        resetForm()
        showAlert('success', null, 'Success', 'Row Updated Successfully')
      } else {
        // افزودن سطر جدید
        const newRow: TableRow = {
          id: uuidv4(),
          nPostID: selectedStaticPost ? selectedStaticPost.ID.toString() : '',
          cost1: Number(cost1) || 0,
          cost2: Number(cost2) || 0,
          cost3: Number(cost3) || 0,
          weight1: Number(weight1) || 0,
          weight2: Number(weight2) || 0,
          weight3: Number(weight3) || 0,
          required: requiredChecked,
          veto: vetoChecked,
          code: Number(codeValue) || 0
        }
        setTableData([...tableData, newRow])
        showAlert('success', null, 'Success', 'Row Added Successfully')
      }
    }

    // حذف ردیف
    const handleDeleteRow = () => {
      if (!selectedRow) {
        showAlert('error', null, 'Error', 'No row is selected.')
        return
      }
      setTableData(tableData.filter(r => r.id !== selectedRow.id))
      resetForm()
      showAlert('success', null, 'Success', 'Row Deleted Successfully')
    }

    // تکثیر ردیف
    const handleDuplicateRow = () => {
      if (!selectedRow) {
        showAlert('error', null, 'Error', 'No row is selected for duplicate.')
        return
      }
      const duplicated: TableRow = { ...selectedRow, id: uuidv4() }
      setTableData([...tableData, duplicated])
      showAlert('success', null, 'Success', 'Row Duplicated Successfully')
    }

    // انتخاب ردیف
    const handleSelectRow = (data: TableRow) => {
      setSelectedRow(data)
      setStaticPostValue(data.nPostID)
      const foundRole = allRoles.find(r => r.ID.toString() === data.nPostID)
      setSelectedStaticPost(foundRole || null)
      setCost1(String(data.cost1))
      setCost2(String(data.cost2))
      setCost3(String(data.cost3))
      setWeight1(String(data.weight1))
      setWeight2(String(data.weight2))
      setWeight3(String(data.weight3))
      setRequiredChecked(data.required)
      setVetoChecked(data.veto)
      setCodeValue(String(data.code))
    }

    // ریست فرم
    const resetForm = () => {
      setStaticPostValue('')
      setSelectedStaticPost(null)
      setCost1('')
      setCost2('')
      setCost3('')
      setWeight1('')
      setWeight2('')
      setWeight3('')
      setRequiredChecked(false)
      setVetoChecked(false)
      setCodeValue('')
      setSelectedRow(null)
    }

    // مدیریت انتخاب در ListSelector
    const handleSelectionChange = (type: string, selectedIds: (string | number)[]) => {
      if (type === 'DefaultBtn') {
        const numericIds = selectedIds.map(x => (typeof x === 'string' ? parseInt(x, 10) : x))
        setSelectedDefaultBtnIds(numericIds as number[])
      }
    }

    // متدهایی که والد (مدال) نیاز دارد
    useImperativeHandle(ref, () => ({
      getFormData: () => ({
        nameValue,
        minAcceptValue,
        minRejectValue,
        actDurationValue,
        orderValue,
        acceptChecked,
        rejectChecked,
        tableData,
        selectedPredecessors,
        selectedDefaultBtnIds,
        deemDayValue: deemDay.toString(),
        deemConditionValue: deemCondition.toString(),
        deemActionValue: deemAction.toString(),
        previewsStateIdValue: previewsStateId !== null ? previewsStateId.toString() : '',
        goToPreviousStateIDValue: goToPreviousStateID !== null ? goToPreviousStateID.toString() : '',
        isStage,
        deemedEnabled: isDeemed,
        actionBtnID
      }),
      validateMinFields: () => validateMinFields()
    }))

    return (
      <div className='flex flex-col md:flex-row h-full relative'>
        {/* دیگر اینجا ToastContainer نداریم تا دوبار پیام نمایش داده نشود */}

        {/* بخش اصلی */}
        <main className='flex-1 p-4 bg-white overflow-auto'>
          <div className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 items-center'>
            <DynamicInput
              name='Name'
              type='text'
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              className='w-full'
            />

            {!isStage && (
              <div>
                <label className='flex items-center text-sm text-gray-700 mb-1'>
                  <input
                    type='checkbox'
                    checked={acceptChecked}
                    onChange={e => setAcceptChecked(e.target.checked)}
                    className='h-4 w-4 mr-2'
                  />
                  Min Accept
                </label>
                <DynamicInput
                  name=''
                  type='number'
                  value={minAcceptValue}
                  onChange={e => setMinAcceptValue(e.target.value)}
                  disabled={!acceptChecked}
                  className='w-full'
                />
              </div>
            )}

            <div>
              <label className='flex items-center text-sm text-gray-700 mb-1'>
                <input
                  type='checkbox'
                  checked={rejectChecked}
                  onChange={e => setRejectChecked(e.target.checked)}
                  className='h-4 w-4 mr-2'
                />
                Min Reject
              </label>
              <DynamicInput
                name=''
                type='number'
                value={minRejectValue}
                onChange={e => setMinRejectValue(e.target.value)}
                disabled={!rejectChecked}
                className='w-full'
              />
            </div>

            <DynamicInput
              name='Act Duration'
              type='number'
              value={actDurationValue}
              onChange={e => setActDurationValue(e.target.value)}
              className='w-full'
            />
            <DynamicInput
              name='Order'
              type='number'
              value={orderValue}
              onChange={e => setOrderValue(e.target.value)}
              className='w-full'
            />
          </div>

          <div className='mt-6'>
            <label className='flex items-center text-sm text-gray-700'>
              <input
                type='checkbox'
                checked={isStage}
                onChange={e => setIsStage(e.target.checked)}
                className='h-4 w-4'
              />
              <span className='ml-2'>Is Stage</span>
            </label>
          </div>

          {/* Approval Context */}
          <div className='mt-8 p-4 bg-gray-100 rounded-lg'>
            <div className='flex justify-between items-center mb-4'>
              <span className='text-lg font-semibold text-gray-700'>
                Approval Context:
              </span>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={handleAddOrUpdateRow}
                  className='flex items-center bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors'
                >
                  {selectedRow ? (
                    <>
                      <FaEdit className='mr-2' /> Edit
                    </>
                  ) : (
                    <>
                      <FaPlus className='mr-2' /> Add
                    </>
                  )}
                </button>

                <button
                  type='button'
                  onClick={handleDeleteRow}
                  disabled={!selectedRow}
                  className={`flex items-center bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors ${
                    !selectedRow && 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4'>
              {/* Static Post */}
              <div>
                <label className='block text-sm text-gray-700'>
                  Static Post
                </label>
                <DynamicSelector
                  options={staticPostOptions}
                  selectedValue={staticPostValue}
                  onChange={e => {
                    const val = e.target.value
                    setStaticPostValue(val)
                    const found = allRoles.find(r => r.ID.toString() === val)
                    setSelectedStaticPost(found || null)
                  }}
                  label=''
                  showButton
                  onButtonClick={openModal}
                  disabled={false}
                />
              </div>

              {/* گرید سه ستونه برای وزن و هزینه */}
              <div className='grid grid-cols-3 gap-2'>
                <div className='flex flex-col gap-1'>
                  <DynamicInput
                    name='Weight1'
                    type='number'
                    value={weight1}
                    onChange={e => setWeight1(e.target.value)}
                    className='w-full'
                  />
                  <DynamicInput
                    name='Cost1'
                    type='number'
                    value={cost1}
                    onChange={e => setCost1(e.target.value)}
                    className='w-full'
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <DynamicInput
                    name='Weight2'
                    type='number'
                    value={weight2}
                    onChange={e => setWeight2(e.target.value)}
                    className='w-full'
                  />
                  <DynamicInput
                    name='Cost2'
                    type='number'
                    value={cost2}
                    onChange={e => setCost2(e.target.value)}
                    className='w-full'
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <DynamicInput
                    name='Weight3'
                    type='number'
                    value={weight3}
                    onChange={e => setWeight3(e.target.value)}
                    className='w-full'
                  />
                  <DynamicInput
                    name='Cost3'
                    type='number'
                    value={cost3}
                    onChange={e => setCost3(e.target.value)}
                    className='w-full'
                  />
                </div>
              </div>

              {/* بخش Code، Veto و Required */}
              <div className="flex items-center justify-center mt-2 space-x-5">
                <div className="w-1/3">
                  <DynamicInput
                    name="Code"
                    type="number"
                    value={codeValue}
                    onChange={e => setCodeValue(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center space-x-5 mt-4">
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={vetoChecked}
                      onChange={e => setVetoChecked(e.target.checked)}
                      className="h-4 w-4 mr-1"
                    />
                    Veto
                  </label>
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={requiredChecked}
                      onChange={e => setRequiredChecked(e.target.checked)}
                      className="h-4 w-4 mr-1"
                    />
                    Required
                  </label>
                </div>
              </div>
            </div>

            {/* جدول نمایش داده‌ها (فقط اگر Stage نباشد) */}
            {!isStage && (
              <div className='mt-4 h-[33vh]'>
                {approvalContextLoading ? (
                  <p className='text-center text-sm text-gray-600'>
                    Loading Approval Context...
                  </p>
                ) : (
                  <DataTable
                    columnDefs={columnDefs}
                    rowData={tableData}
                    onRowDoubleClick={handleSelectRow}
                    setSelectedRowData={handleSelectRow}
                    showDuplicateIcon={false}
                    showEditIcon={false}
                    showAddIcon={false}
                    showDeleteIcon={false}
                    onAdd={() => {}}
                    onEdit={() => {}}
                    onDelete={handleDeleteRow}
                    onDuplicate={handleDuplicateRow}
                    domLayout='normal'
                  />
                )}
              </div>
            )}
          </div>

          <div className='mt-6'>
            <label className='flex items-center text-sm text-gray-700'>
              <input
                type='checkbox'
                checked={isDeemed}
                onChange={e => setIsDeemed(e.target.checked)}
                className='h-4 w-4'
              />
              <span className='ml-2'>Deemed as Approved Or Reject</span>
            </label>
          </div>

          <DeemedSection
            deemDay={deemDay}
            setDeemDay={setDeemDay}
            deemCondition={deemCondition}
            setDeemCondition={setDeemCondition}
            deemAction={deemAction}
            setDeemAction={setDeemAction}
            previewsStateId={previewsStateId}
            setPreviewsStateId={setPreviewsStateId}
            goToPreviousStateID={goToPreviousStateID}
            setGoToPreviousStateID={setGoToPreviousStateID}
            boxTemplates={boxTemplates}
            disableMain={!isDeemed}
            showAdminSection={true}
            actionBtnOptions={actionBtnOptions}
            actionBtnID={actionBtnID}
            setActionBtnID={setActionBtnID}
          />
        </main>

        {/* بخش کناری (Predecessor ها و لیست دکمه‌ها) */}
        <aside className='w-full md:w-64 bg-gray-100 p-4 border-t md:border-l border-gray-300 overflow-auto mt-4 md:mt-0'>
          <BoxPredecessor
            boxTemplates={boxTemplates}
            selectedPredecessors={selectedPredecessors}
            onSelectionChange={setSelectedPredecessors}
            currentBoxId={editData ? editData.ID : 0}
          />
          <ListSelector
            title='Button'
            columnDefs={[
              { headerName: 'Name', field: 'Name' },
              { headerName: 'Tooltip', field: 'Tooltip' }
            ]}
            rowData={btnList}
            selectedIds={selectedDefaultBtnIds}
            onSelectionChange={(selectedIds: (string | number)[]) =>
              handleSelectionChange('DefaultBtn', selectedIds)
            }
            showSwitcher={false}
            isGlobal={false}
            ModalContentComponent={ButtonComponent}
            modalContentProps={{
              columnDefs: [
                { headerName: 'Name', field: 'Name' },
                { headerName: 'Tooltip', field: 'Tooltip' }
              ],
              rowData: btnList,
              onRowDoubleClick: () => {},
              onRowClick: () => {},
              onSelectButtonClick: () => {},
              isSelectDisabled: false,
              onClose: () => {},
              onSelectFromButton: () => {}
            }}
          />
        </aside>

        {/* مودال انتخاب پست (Static Post) */}
        <DynamicModal isOpen={isModalOpen} onClose={closeModal}>
          <TableSelector
            columnDefs={rolesColumnDefs}
            rowData={allRoles}
            onRowDoubleClick={handleRoleSelect}
            onRowClick={(data: Role) => setSelectedStaticPost(data)}
            onSelectButtonClick={() => {
              if (selectedStaticPost) {
                setStaticPostValue(selectedStaticPost.ID.toString())
                closeModal()
              } else {
                showAlert('error', null, 'Error', 'No row is selected.')
              }
            }}
            isSelectDisabled={!selectedStaticPost}
          />
        </DynamicModal>
      </div>
    )
  }
)

ApprovalFlowsTab.displayName = 'ApprovalFlowsTab'
export default ApprovalFlowsTab;
