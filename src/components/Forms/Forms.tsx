import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback
} from 'react'

// کامپوننت چیدمان دو ستونی واکنش‌گرا
import TwoColumnLayout from '../layout/TwoColumnLayout'

// سایر کامپوننت‌ها و کتابخانه‌ها
import DynamicInput from '../utilities/DynamicInput'
import DynamicSelector from '../utilities/DynamicSelector'
import ListSelector from '../ListSelector/ListSelector'
import DynamicModal from '../utilities/DynamicModal'
import TableSelector from '../General/Configuration/TableSelector'
import DataTable from '../TableDynamic/DataTable'
import AddColumnForm from './AddForm'
import FormGeneratorView from './FormGeneratorView/FormGeneratorView'
import UploadFilesPanel from './UploadFilesPanel'
import DynamicSwitcher from '../utilities/DynamicSwitcher'

import { useAddEditDelete } from '../../context/AddEditDeleteContext'
import { useApi } from '../../context/ApiContext'
import { showAlert } from '../utilities/Alert/DynamicAlert'

import apiService from '../../services/api.services'
import fileService from '../../services/api.servicesFile'
import { v4 as uuidv4 } from 'uuid'

/**
 * نوع (interface) فیلدهای فرم
 */
interface IFormData {
  ID: string
  Name: string
  Code: string
  IsDoc: boolean
  IsMegaForm: boolean
  IsVisible: boolean
  LastModified: string
  ModifiedById: number | null
  ProjectsStr: string
  TemplateDocID: string | null
  TemplateExcelID: string | null
  nEntityCateAID: number | null
  nEntityCateBID: number | null
}

interface CategoryOption {
  value: string
  label: string
}

interface FormsCommand1Props {
  selectedRow: any
}

/**
 * نگاشت typeOfInformation (ستون‌های فرم) برای تبدیل شناسه عددی به نام مرتبط
 */
const columnTypeMapping: { [key: string]: number } = {
  component1: 15,
  component2: 1,
  component3: 2,
  component4: 3,
  component5: 4,
  component6: 21,
  component7: 5,
  component8: 19,
  component9: 34,
  component10: 35,
  component11: 17,
  component12: 30,
  component13: 6,
  component14: 9,
  component15: 26,
  component16: 10,
  component17: 16,
  component18: 20,
  component19: 22,
  component20: 24,
  component21: 25,
  component22: 27,
  component23: 29,
  component24: 32,
  component25: 28,
  component26: 36,
  component27: 7,
  component28: 8,
  component29: 11,
  component30: 12,
  component31: 13,
  component32: 14,
  component33: 18,
  component34: 23
}

const typeOfInformationOptions = [
  { value: 'component1', label: 'Text' },
  { value: 'component2', label: 'RichText' },
  { value: 'component3', label: 'Choice' },
  { value: 'component4', label: 'Number' },
  { value: 'component5', label: 'Date Time' },
  { value: 'component6', label: 'Persian Date' },
  { value: 'component7', label: 'Lookup' },
  { value: 'component27', label: 'Hyper Link' },
  { value: 'component8', label: 'Post PickerList' },
  { value: 'component9', label: 'Lookup RealValue' },
  { value: 'component10', label: 'Lookup AdvanceTable' },
  { value: 'component26', label: 'Advance Lookup AdvanceTable' },
  { value: 'component12', label: 'Lookup Image' },
  { value: 'component28', label: 'Select User In Post' },
  { value: 'component13', label: 'Yes No' },
  { value: 'component14', label: 'Attach File' },
  { value: 'component15', label: 'Picture Box' },
  { value: 'component16', label: 'Table' },
  { value: 'component17', label: 'Pfi Lookup' },
  { value: 'component18', label: 'Seqnial Number' },
  { value: 'component19', label: 'Advance Table' },
  { value: 'component20', label: 'Word Panel' },
  { value: 'component21', label: 'Excecl Panel' },
  { value: 'component22', label: 'Calculated Field' },
  { value: 'component23', label: 'Excel Calculator' },
  { value: 'component24', label: 'Tab' },
  { value: 'component25', label: 'Map' },
  { value: 'component29', label: 'Title' },
  { value: 'component30', label: 'Section' },
  { value: 'component31', label: 'Sub Section' },
  { value: 'component32', label: 'New Line' },
  { value: 'component33', label: 'Mepost Selector' },
  { value: 'component34', label: 'Advance WF' }
]

/**
 * تابع کمکی برای واکشی نام فایل با استفاده از FileID
 */
async function fetchFileNameById(fileId: string) {
  if (!fileId) return ''
  try {
    const response = await fileService.getFile(fileId)
    if (response && response.status === 200 && response.data) {
      return response.data.FileName || ''
    }
  } catch (error) {
    console.error('Error fetching file info:', error)
  }
  return ''
}

/**
 * کامپوننت اصلی: FormsCommand1
 */
const FormsCommand1 = forwardRef(({ selectedRow }: FormsCommand1Props, ref) => {
  const { handleSaveForm } = useAddEditDelete()
  const api = useApi()

  // تشخیص حالت ویرایش یا جدید
  const isEditMode = Boolean(selectedRow?.ID)

  // استیت شناسه کاربر
  const [userId, setUserId] = useState<string | null>(null)

  // استیت اصلی فرم
  const [formData, setFormData] = useState<IFormData>({
    ID: '',
    Name: '',
    Code: '',
    IsDoc: false,
    IsMegaForm: false,
    IsVisible: true,
    LastModified: new Date().toISOString(),
    ModifiedById: null,
    ProjectsStr: '',
    TemplateDocID: null,
    TemplateExcelID: null,
    nEntityCateAID: null,
    nEntityCateBID: null
  })

  // نام فایل‌های ورد و اکسل (جهت نمایش و دانلود)
  const [wordFileName, setWordFileName] = useState<string>('')
  const [excelFileName, setExcelFileName] = useState<string>('')

  // داده‌های پروژه (جهت انتخاب پروژه)
  const [projectData, setProjectData] = useState<{ ID: string; Name: string }[]>(
    []
  )

  // استیت فیلدهای انتیتی
  const [entityFields, setEntityFields] = useState<any[]>([])

  // مدیریت نمایش مودال‌های مختلف
  const [modalOpen, setModalOpen] = useState(false)
  const [currentSelector, setCurrentSelector] = useState<'A' | 'B' | null>(null)
  const [selectedRowData, setSelectedRowData] = useState<any>(null)

  // مودال افزودن/ویرایش ستون
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingData, setEditingData] = useState<any>(null)

  // مودال نمایش فرم جنریت شده
  const [viewModalOpen, setViewModalOpen] = useState(false)

  // state برای Category A و B که از API گرفته می‌شود
  const [catAOptions, setCatAOptions] = useState<CategoryOption[]>([])
  const [catBOptions, setCatBOptions] = useState<CategoryOption[]>([])

  /**
   * واکشی شناسه کاربر
   */
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await apiService.getIdByUserToken()
        if (res && res.length > 0) {
          setUserId(res[0].ID.toString())
        }
      } catch (err) {
        console.error('Error fetching user id:', err)
      }
    }
    fetchUserId()
  }, [])

  /**
   * واکشی گزینه‌های Category A
   */
  useEffect(() => {
    const fetchCatAOptions = async () => {
      try {
        const response = await apiService.getAllCatA()
        const options = response.map((cat: any) => ({
          value: cat.ID?.toString() || '',
          label: cat.Name
        }))
        setCatAOptions(options)
      } catch (error) {
        console.error('Error fetching Category A options:', error)
      }
    }
    fetchCatAOptions()
  }, [])

  /**
   * واکشی گزینه‌های Category B
   */
  useEffect(() => {
    const fetchCatBOptions = async () => {
      try {
        const response = await apiService.getAllCatB()
        const options = response.map((cat: any) => ({
          value: cat.ID?.toString() || '',
          label: cat.Name
        }))
        setCatBOptions(options)
      } catch (error) {
        console.error('Error fetching Category B options:', error)
      }
    }
    fetchCatBOptions()
  }, [])

  /**
   * واکشی لیست پروژه‌ها
   */
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await api.getAllProject()
        const mappedProjects = projects.map((p: any) => ({
          ID: p.ID,
          Name: p.ProjectName
        }))
        setProjectData(mappedProjects)
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }
    fetchProjects()
  }, [api])

  /**
   * در صورت ویرایش، فرم را با داده‌های انتخاب‌شده به‌روزرسانی می‌کند
   * و همچنین نام فایل‌های ورد و اکسل را می‌گیرد
   */
  useEffect(() => {
    const updateFormDataAndFiles = async () => {
      if (selectedRow) {
        setFormData({
          ID: selectedRow.ID || '',
          Name: selectedRow.Name || '',
          Code: selectedRow.Code || '',
          IsDoc: !!selectedRow.IsDoc,
          IsMegaForm: !!selectedRow.IsMegaForm,
          IsVisible: !!selectedRow.IsVisible,
          LastModified: selectedRow.LastModified || new Date().toISOString(),
          ModifiedById: selectedRow.ModifiedById || null,
          ProjectsStr: selectedRow.ProjectsStr || '',
          TemplateDocID: selectedRow.TemplateDocID || null,
          TemplateExcelID: selectedRow.TemplateExcelID || null,
          nEntityCateAID: selectedRow.nEntityCateAID || null,
          nEntityCateBID: selectedRow.nEntityCateBID || null
        })

        // واکشی نام فایل ورد
        if (selectedRow.TemplateDocID) {
          const name = await fetchFileNameById(selectedRow.TemplateDocID)
          setWordFileName(name)
        } else {
          setWordFileName('')
        }

        // واکشی نام فایل اکسل
        if (selectedRow.TemplateExcelID) {
          const name = await fetchFileNameById(selectedRow.TemplateExcelID)
          setExcelFileName(name)
        } else {
          setExcelFileName('')
        }
      } else {
        // اگر حالت جدید باشد
        setFormData({
          ID: '',
          Name: '',
          Code: '',
          IsDoc: false,
          IsMegaForm: false,
          IsVisible: true,
          LastModified: new Date().toISOString(),
          ModifiedById: null,
          ProjectsStr: '',
          TemplateDocID: null,
          TemplateExcelID: null,
          nEntityCateAID: null,
          nEntityCateBID: null
        })
        setWordFileName('')
        setExcelFileName('')
      }
    }
    updateFormDataAndFiles()
  }, [selectedRow])

  /**
   * در صورت تغییر TemplateDocID، نام فایل ورد را مجدد می‌گیرد
   */
  useEffect(() => {
    const getDocName = async () => {
      if (formData.TemplateDocID) {
        const name = await fetchFileNameById(formData.TemplateDocID)
        setWordFileName(name)
      } else {
        setWordFileName('')
      }
    }
    getDocName()
  }, [formData.TemplateDocID])

  /**
   * در صورت تغییر TemplateExcelID، نام فایل اکسل را مجدد می‌گیرد
   */
  useEffect(() => {
    const getExcelName = async () => {
      if (formData.TemplateExcelID) {
        const name = await fetchFileNameById(formData.TemplateExcelID)
        setExcelFileName(name)
      } else {
        setExcelFileName('')
      }
    }
    getExcelName()
  }, [formData.TemplateExcelID])

  /**
   * در صورت وجود ID فرم، فیلدهای انتیتی را واکشی می‌کند
   */
  const refreshEntityFields = useCallback(async () => {
    if (formData.ID) {
      try {
        const fields = await api.getEntityFieldByEntityTypeId(formData.ID)
        setEntityFields(fields)
      } catch (error) {
        console.error('Error fetching entity fields:', error)
      }
    } else {
      setEntityFields([])
    }
  }, [api, formData.ID])

  useEffect(() => {
    refreshEntityFields()
  }, [refreshEntityFields])

  /**
   * تابع هندل تغییر در فرم
   */
  const handleChange = (field: keyof IFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  /**
   * بازکردن مدال انتخاب برای Category A یا B
   */
  const handleOpenModal = (selector: 'A' | 'B') => {
    setCurrentSelector(selector)
    setSelectedRowData(null)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setCurrentSelector(null)
    setSelectedRowData(null)
  }

  const handleRowClick = (row: any) => {
    setSelectedRowData(row)
  }

  const handleSelectButtonClick = () => {
    if (selectedRowData && currentSelector) {
      if (currentSelector === 'A') {
        handleChange(
          'nEntityCateAID',
          selectedRowData.value ? parseInt(selectedRowData.value) : null
        )
      } else {
        handleChange(
          'nEntityCateBID',
          selectedRowData.value ? parseInt(selectedRowData.value) : null
        )
      }
      handleCloseModal()
    }
  }

  /**
   * تابع کمکی آپلود فایل و ذخیره رکورد آن در دیتابیس
   */
  const handleFileUpload = async (file: File, allowedExtensions: string[]) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new Error(
        `تنها فایل‌های با پسوند ${allowedExtensions.join(', ')} مجاز هستند.`
      )
    }
    const ID = uuidv4()
    const FileIQ = uuidv4()
    const folderName = new Date().toISOString().split('T')[0]
    const generatedFileName = `${FileIQ}.${fileExtension}`

    const formDataFile = new FormData()
    formDataFile.append('FileName', generatedFileName)
    formDataFile.append('FolderName', folderName)
    formDataFile.append('file', file)

    const uploadRes = await fileService.uploadFile(formDataFile)
    if (uploadRes && uploadRes.status === 200) {
      const { FileSize } = uploadRes.data
      const insertModel = {
        ID,
        FileIQ,
        FileName: generatedFileName,
        FileSize: FileSize || file.size,
        FolderName: folderName,
        IsVisible: true,
        LastModified: null,
        SenderID: userId,
        FileType: `.${fileExtension}`
      }
      const insertRes = await fileService.insert(insertModel)
      if (insertRes && insertRes.status === 200) {
        return insertRes.data
      }
      throw new Error('خطا در درج رکورد فایل در دیتابیس.')
    } else {
      throw new Error('آپلود فایل با خطا مواجه شد.')
    }
  }

  /**
   * آپلود فایل ورد
   */
  const handleWordUpload = async (file: File) => {
    try {
      const result = await handleFileUpload(file, ['doc', 'docx'])
      handleChange('TemplateDocID', result.ID)
      setWordFileName(result.FileName)
      showAlert('success', undefined, 'موفقیت', 'فایل ورد با موفقیت آپلود شد.')
    } catch (error: any) {
      showAlert(
        'error',
        undefined,
        'خطا',
        error.message || 'آپلود فایل ورد با خطا مواجه شد.'
      )
    }
  }

  /**
   * آپلود فایل اکسل
   */
  const handleExcelUpload = async (file: File) => {
    try {
      const result = await handleFileUpload(file, ['xls', 'xlsx'])
      handleChange('TemplateExcelID', result.ID)
      setExcelFileName(result.FileName)
      showAlert('success', undefined, 'موفقیت', 'فایل اکسل با موفقیت آپلود شد.')
    } catch (error: any) {
      showAlert(
        'error',
        undefined,
        'خطا',
        error.message || 'آپلود فایل اکسل با خطا مواجه شد.'
      )
    }
  }

  /**
   * حذف فایل ورد
   */
  const handleDeleteWord = () => {
    handleChange('TemplateDocID', null)
    setWordFileName('')
  }

  /**
   * حذف فایل اکسل
   */
  const handleDeleteExcel = () => {
    handleChange('TemplateExcelID', null)
    setExcelFileName('')
  }

  /**
   * دانلود فایل (ورد یا اکسل)
   */
  const handleDownloadFile = async (templateId: string | null) => {
    if (!templateId) {
      showAlert('error', undefined, 'خطا', 'فایلی انتخاب نشده است.')
      return
    }
    try {
      const fileInfoRes = await fileService.getFile(templateId)
      if (fileInfoRes && fileInfoRes.status === 200 && fileInfoRes.data) {
        const { FileIQ, FileType, FolderName, FileName } = fileInfoRes.data
        const model = { FileName: FileIQ + FileType, FolderName }
        const downloadRes = await fileService.download(model)

        const blob = new Blob([downloadRes.data], {
          type: 'application/octet-stream'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = FileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      showAlert('error', undefined, 'خطا', 'دانلود فایل با خطا مواجه شد.')
    }
  }

  const handleDownloadWord = () => {
    handleDownloadFile(formData.TemplateDocID)
  }

  const handleDownloadExcel = () => {
    handleDownloadFile(formData.TemplateExcelID)
  }

  /**
   * رویدادهای افزودن، ویرایش و حذف فیلدهای انتیتی
   */
  const handleAddClick = () => {
    setEditingData(null)
    setIsAddModalOpen(true)
  }

  const handleEditClick = (rowData: any) => {
    const dataToEdit = selectedRowData || rowData
    setEditingData(dataToEdit)
    setIsAddModalOpen(true)
  }

  const handleAddModalClose = () => {
    setIsAddModalOpen(false)
    setEditingData(null)
  }

  /**
   * در این متد فقط مقدار در state آپدیت می‌شود
   * تا تغییرات در جدول نمایش داده شود
   * ولی فراخوانی آپدیت سرور انجام نمی‌دهیم.
   */
  const handleCellValueChanged = (params: any) => {
    if (!params?.data || !params.colDef?.field) return

    const updatedFieldName = params.colDef.field
    const updatedFieldValue = params.newValue

    const updatedData = {
      ...params.data,
      [updatedFieldName]: updatedFieldValue
    }

    const rowIndex = entityFields.findIndex(f => f.ID === updatedData.ID)
    if (rowIndex !== -1) {
      const newFields = [...entityFields]
      newFields[rowIndex] = updatedData
      setEntityFields(newFields)
    }
    setSelectedRowData(updatedData)
  }

  /**
   * متد اصلی ذخیره فرم (برای فراخوانی از والد، چون این کامپوننت با forwardRef فرستاده شده)
   */
  useImperativeHandle(ref, () => ({
    save: async () => {
      try {
        const payload = { ...formData }
        await handleSaveForm(payload)
        showAlert('success', undefined, 'Success', 'Form saved successfully!')
      } catch (error) {
        console.error('Error saving form:', error)
        showAlert('error', undefined, 'Error', 'Failed to save form.')
      }
    }
  }))

  /**
   * ستون‌های DataTable برای نمایش فیلدهای انتیتی
   */
  const newColumnDefs = [
    {
      headerName: 'Order',
      field: 'orderValue',
      editable: true,
      sortable: true,
      filter: true
    },
    {
      headerName: 'Column Name',
      field: 'DisplayName',
      editable: true,
      sortable: true,
      filter: true
    },
    {
      headerName: 'Type',
      field: 'ColumnType',
      editable: false,
      sortable: true,
      filter: true,
      valueGetter: (params: any) => {
        const option = typeOfInformationOptions.find(
          opt => columnTypeMapping[opt.value] === params.data.ColumnType
        )
        return option ? option.label : params.data.ColumnType
      }
    },
    {
      headerName: 'Command',
      field: 'Code',
      editable: true,
      sortable: true,
      filter: true
    },
    {
      headerName: 'Show In List',
      field: 'IsShowGrid',
      editable: true,
      sortable: true,
      filter: true,
      cellRendererFramework: (params: any) => (
        <input
          type='checkbox'
          checked={!!params.value}
          readOnly
          style={{ margin: 0 }}
        />
      ),
      cellEditor: 'agCheckboxCellEditor',
      cellEditorParams: {
        checkboxTrueValue: true,
        checkboxFalseValue: false
      }
    },
    {
      headerName: 'Required',
      field: 'IsRequire',
      editable: true,
      sortable: true,
      filter: true,
      cellRendererFramework: (params: any) => (
        <input
          type='checkbox'
          checked={!!params.value}
          readOnly
          style={{ margin: 0 }}
        />
      ),
      cellEditor: 'agCheckboxCellEditor',
      cellEditorParams: {
        checkboxTrueValue: true,
        checkboxFalseValue: false
      }
    },
    {
      headerName: 'Main Column',
      field: 'IsMainColumn',
      editable: true,
      sortable: true,
      filter: true,
      cellRendererFramework: (params: any) => (
        <input
          type='checkbox'
          checked={!!params.value}
          readOnly
          style={{ margin: 0 }}
        />
      ),
      cellEditor: 'agCheckboxCellEditor',
      cellEditorParams: {
        checkboxTrueValue: true,
        checkboxFalseValue: false
      }
    },
    {
      headerName: 'Is Rtl',
      field: 'IsRTL',
      editable: true,
      sortable: true,
      filter: true,
      cellRendererFramework: (params: any) => (
        <input
          type='checkbox'
          checked={!!params.value}
          readOnly
          style={{ margin: 0 }}
        />
      ),
      cellEditor: 'agCheckboxCellEditor',
      cellEditorParams: {
        checkboxTrueValue: true,
        checkboxFalseValue: false
      }
    },
    {
      headerName: 'Count In Reject',
      field: 'CountInReject',
      editable: true,
      sortable: true,
      filter: true,
      cellRendererFramework: (params: any) => (
        <input
          type='checkbox'
          checked={!!params.value}
          readOnly
          style={{ margin: 0 }}
        />
      ),
      cellEditor: 'agCheckboxCellEditor',
      cellEditorParams: {
        checkboxTrueValue: true,
        checkboxFalseValue: false
      }
    }
  ]

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <TwoColumnLayout>
        <TwoColumnLayout.Item span={1}>
          <DynamicInput
            name='Name'
            type='text'
            value={formData.Name}
            placeholder='Enter form name'
            onChange={e => handleChange('Name', e.target.value)}
            required={true}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicInput
            name='Command'
            type='text'
            value={formData.Code}
            placeholder='Enter command'
            onChange={e => handleChange('Code', e.target.value)}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSelector
            options={catAOptions}
            selectedValue={
              formData.nEntityCateAID ? formData.nEntityCateAID.toString() : ''
            }
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              handleChange(
                'nEntityCateAID',
                e.target.value ? parseInt(e.target.value) : null
              )
            }}
            label='Category A'
            showButton={true}
            onButtonClick={() => handleOpenModal('A')}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSelector
            options={catBOptions}
            selectedValue={
              formData.nEntityCateBID ? formData.nEntityCateBID.toString() : ''
            }
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              handleChange(
                'nEntityCateBID',
                e.target.value ? parseInt(e.target.value) : null
              )
            }}
            label='Category B'
            showButton={true}
            onButtonClick={() => handleOpenModal('B')}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSwitcher
            isChecked={formData.IsDoc}
            onChange={() => handleChange('IsDoc', !formData.IsDoc)}
            leftLabel='Transmitaal'
            rightLabel=''
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSwitcher
            isChecked={formData.IsMegaForm}
            onChange={() => {
              if (!isEditMode) {
                handleChange('IsMegaForm', !formData.IsMegaForm)
              }
            }}
            leftLabel='Is Mega Form'
            rightLabel=''
            disabled={isEditMode}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={2} className='mt-5'>
          <UploadFilesPanel
            onWordUpload={handleWordUpload}
            onExcelUpload={handleExcelUpload}
            wordFileName={wordFileName}
            excelFileName={excelFileName}
            onDeleteWord={handleDeleteWord}
            onDeleteExcel={handleDeleteExcel}
            onDownloadWord={handleDownloadWord}
            onDownloadExcel={handleDownloadExcel}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1} className='mt-10'>
          <ListSelector
            title='Related Projects'
            columnDefs={[{ field: 'Name', headerName: 'Project Name' }]}
            rowData={projectData}
            selectedIds={formData.ProjectsStr.split('|').filter(Boolean)}
            onSelectionChange={selectedIds => {
              const str = selectedIds.map(String).join('|') + '|'
              handleChange('ProjectsStr', str)
            }}
            showSwitcher={true}
            isGlobal={formData.IsVisible}
            onGlobalChange={val => handleChange('IsVisible', val)}
            className='-mt-5'
            ModalContentComponent={TableSelector}
            modalContentProps={{
              columnDefs: [{ headerName: 'Project Name', field: 'Name' }],
              rowData: projectData,
              selectedRow: selectedRowData,
              onRowDoubleClick: handleSelectButtonClick,
              onRowClick: handleRowClick,
              onSelectButtonClick: handleSelectButtonClick,
              isSelectDisabled: !selectedRowData
            }}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={2}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              height: 'calc(100vh - 600px)'
            }}
          >
            <DataTable
              columnDefs={newColumnDefs}
              rowData={entityFields}
              setSelectedRowData={setSelectedRowData}
              gridOptions={{
                singleClickEdit: true
              }}
              onCellClicked={params => {
                setSelectedRowData(params.data)
              }}
              onCellValueChanged={handleCellValueChanged} 
              onAdd={handleAddClick}
              onEdit={() => {
                if (selectedRowData) {
                  handleEditClick(selectedRowData)
                } else {
                  showAlert('error', undefined, 'Error', 'No row is selected!')
                }
              }}
              onDelete={async () => {
                if (!selectedRowData) {
                  showAlert(
                    'error',
                    undefined,
                    'Error',
                    'No row selected for deletion'
                  )
                  return
                }
                try {
                  await api.deleteEntityField(selectedRowData.ID)
                  showAlert('success', undefined, 'Success', 'Deleted successfully')
                  setSelectedRowData(null)
                  refreshEntityFields()
                } catch (error) {
                  showAlert('error', undefined, 'Error', 'Delete failed!')
                }
              }}
              showDuplicateIcon={false}
              showEditIcon={true}
              showAddIcon={true}
              showDeleteIcon={true}
              showViewIcon={true}
              onView={() => setViewModalOpen(true)}
              domLayout='autoHeight'
              showSearch={true}
              onRowDoubleClick={rowData => handleEditClick(rowData)}
              onDuplicate={() => {
                // فقط در صورت نیاز
              }}
            />
          </div>
        </TwoColumnLayout.Item>
      </TwoColumnLayout>

      {/* مدال انتخاب Category A / B */}
      <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
        <TableSelector
          columnDefs={[{ headerName: 'Name', field: 'label' }]}
          rowData={
            currentSelector === 'A'
              ? catAOptions.map(opt => ({
                  value: opt.value,
                  label: opt.label
                }))
              : currentSelector === 'B'
              ? catBOptions.map(opt => ({
                  value: opt.value,
                  label: opt.label
                }))
              : []
          }
          selectedRow={selectedRowData}
          onRowClick={handleRowClick}
          onRowDoubleClick={handleSelectButtonClick}
          onSelectButtonClick={handleSelectButtonClick}
          isSelectDisabled={!selectedRowData}
        />
      </DynamicModal>

      {/* مدال افزودن/ویرایش فیلد */}
      <DynamicModal isOpen={isAddModalOpen} onClose={handleAddModalClose}>
        <AddColumnForm
          existingData={editingData}
          isEdit={!!editingData}
          entityTypeId={formData.ID}
          onClose={handleAddModalClose}
          onSave={() => {
            refreshEntityFields()
            handleAddModalClose()
          }}
        />
      </DynamicModal>

      {/* مدال نمایش فرم ساخته‌شده */}
      <FormGeneratorView
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        entityFields={entityFields}
        selectedRow={selectedRow}
      />
    </div>
  )
})

FormsCommand1.displayName = 'FormsCommand1'
export default FormsCommand1
