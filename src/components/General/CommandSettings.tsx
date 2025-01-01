// src/components/CommandSettings.tsx

import  {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle
} from 'react'
import TwoColumnLayout from '../layout/TwoColumnLayout'
import DynamicInput from '../utilities/DynamicInput'
import CustomTextarea from '../utilities/DynamicTextArea'
import DynamicSelector from '../utilities/DynamicSelector'
import { useAddEditDelete } from '../../context/AddEditDeleteContext'
import { CommandItem, GetEnumResponse } from '../../services/api.services'
import AppServices from '../../services/api.services'

export interface CommandHandle {
  save: () => Promise<CommandItem | null>
}

interface CommandProps {
  selectedRow: any
}

const CommandSettings = forwardRef<CommandHandle, CommandProps>(
  ({ selectedRow }, ref) => {
    const { handleSaveCommand } = useAddEditDelete()

    const [commandData, setCommandData] = useState({
      id: selectedRow?.ID?.toString() || '',
      Name: selectedRow?.Name || '',
      Describtion: selectedRow?.Describtion || '',
      MainColumnIDName: selectedRow?.MainColumnIDName || '',
      GroupName: selectedRow?.GroupName || '',
      gridCmd: selectedRow?.gridCmd || '',
      tabCmd: selectedRow?.tabCmd || '',
      QR: selectedRow?.QR || '',
      ViewMode: selectedRow?.ViewMode || '',
      DefaultColumns: selectedRow?.DefaultColumns || '',
      ReportParam: selectedRow?.ReportParam || '',
      ProjectIntensive:
        selectedRow?.ProjectIntensive === undefined
          ? true
          : selectedRow.ProjectIntensive,
      ColorColumn: selectedRow?.ColorColumn || '',
      InvisibleColumns: selectedRow?.InvisibleColumns || '',
      ApiColumns: selectedRow?.ApiColumns || '',
      SpParam: selectedRow?.SpParam || '',
      CmdType: selectedRow?.CmdType || ''
    })

    // وضعیت برای ViewModes و ApiModes
    const [viewModes, setViewModes] = useState<{ value: string; label: string }[]>([])
    const [apiModes, setApiModes] = useState<{ value: string; label: string }[]>([])

    const [loadingViewModes, setLoadingViewModes] = useState<boolean>(false)
    const [loadingApiModes, setLoadingApiModes] = useState<boolean>(false)

    const [, setErrorViewModes] = useState<string | null>(null)
    const [, setErrorApiModes] = useState<string | null>(null)

    // به‌روزرسانی داده‌های فرم هنگام تغییر selectedRow
    useEffect(() => {
      setCommandData({
        id: selectedRow?.ID?.toString() || '',
        Name: selectedRow?.Name || '',
        Describtion: selectedRow?.Describtion || '',
        MainColumnIDName: selectedRow?.MainColumnIDName || '',
        GroupName: selectedRow?.GroupName || '',
        gridCmd: selectedRow?.gridCmd || '',
        tabCmd: selectedRow?.tabCmd || '',
        QR: selectedRow?.QR || '',
        ViewMode: selectedRow?.ViewMode || '',
        DefaultColumns: selectedRow?.DefaultColumns || '',
        ReportParam: selectedRow?.ReportParam || '',
        ProjectIntensive:
          selectedRow?.ProjectIntensive === undefined
            ? true
            : selectedRow.ProjectIntensive,
        ColorColumn: selectedRow?.ColorColumn || '',
        InvisibleColumns: selectedRow?.InvisibleColumns || '',
        ApiColumns: selectedRow?.ApiColumns || '',
        SpParam: selectedRow?.SpParam || '',
        CmdType: selectedRow?.CmdType || ''
      })
    }, [selectedRow])

    // فراخوانی API‌ها برای دریافت enums
    useEffect(() => {
      const fetchEnums = async () => {
        // Fetch ViewMode
        setLoadingViewModes(true)
        setErrorViewModes(null)
        try {
          const response: GetEnumResponse = await AppServices.getEnum({ str: "ViewMode" })
          // تبدیل مقادیر به فرمت مناسب برای سلکتور
          const viewModeOptions = Object.entries(response).map(([key, val]) => ({
            value: val,   // اینجا مقدار عددی (یا استرینگ عددی) را می‌گذاریم
            label: key    // اینجا کلید را به‌عنوان برچسب نشان می‌دهیم
          }))
          
          setViewModes(viewModeOptions)
        } catch (error) {
          console.error("Error fetching ViewMode enums:", error)
          setErrorViewModes("خطا در دریافت ViewMode")
        } finally {
          setLoadingViewModes(false)
        }

        // Fetch CmdType
        setLoadingApiModes(true)
        setErrorApiModes(null)
        try {
          const response: GetEnumResponse = await AppServices.getEnum({ str: "CmdType" })
          const apiModeOptions = Object.entries(response).map(([key, val]) => ({
            value: val,
            label: key
          }))
          
          setApiModes(apiModeOptions)
        } catch (error) {
          console.error("Error fetching CmdType enums:", error)
          setErrorApiModes("خطا در دریافت CmdType")
        } finally {
          setLoadingApiModes(false)
        }
      }

      fetchEnums()
    }, [])

    const handleChange = (
      field: keyof typeof commandData,
      value: string | boolean | number | null
    ) => {
      setCommandData(prev => ({
        ...prev,
        [field]: value
      }))
    }

    // متد اصلی ذخیره (برای forwardRef)
    const save = async (): Promise<CommandItem | null> => {
      const result = await handleSaveCommand(commandData)
      return result
    }

    // Expose the `save` method to parent (TabContent) via ref
    useImperativeHandle(ref, () => ({
      save
    }))

    return (
      <TwoColumnLayout>
        {/* Name */}
        <DynamicInput
          name='Name'
          type='text'
          value={commandData.Name}
          placeholder=''
          onChange={e => handleChange('Name', e.target.value)}
        />

        {/* Describtion */}
        <CustomTextarea
          name='Describtion'
          value={commandData.Describtion || ''}
          placeholder=''
          onChange={e => handleChange('Describtion', e.target.value)}
        />

        {/* ViewMode */}
        <DynamicSelector
          name='View Mode'
          options={viewModes}
          selectedValue={commandData.ViewMode || ''}
          onChange={e => handleChange('ViewMode', e.target.value)}
          label='View Mode'
          loading={loadingViewModes}
        />

        {/* MainColumnIDName */}
        <DynamicInput
          name='Main Column IDName'
          type='text'
          value={commandData.MainColumnIDName || ''}
          placeholder=''
          onChange={e => handleChange('MainColumnIDName', e.target.value)}
        />

        {/* ColorColumn */}
        <DynamicInput
          name='Color Column'
          type='text'
          value={commandData.ColorColumn || ''}
          placeholder=''
          onChange={e => handleChange('ColorColumn', e.target.value)}
        />

        {/* GroupName */}
        <DynamicInput
          name='Group Name'
          type='text'
          value={commandData.GroupName || ''}
          placeholder=''
          onChange={e => handleChange('GroupName', e.target.value)}
        />

        {/* QR */}
        <CustomTextarea
          name='Query'
          value={commandData.QR || ''}
          placeholder=''
          onChange={e => handleChange('QR', e.target.value)}
        />

        {/* DefaultColumns */}
        <CustomTextarea
          name='Hidden Columns'
          value={commandData.DefaultColumns || ''}
          placeholder=''
          onChange={e => handleChange('DefaultColumns', e.target.value)}
        />

        {/* InvisibleColumns */}
        <CustomTextarea
          name='Invisible Columns'
          value={commandData.InvisibleColumns || ''}
          placeholder=''
          onChange={e => handleChange('InvisibleColumns', e.target.value)}
        />

        {/* ApiColumns */}
        <CustomTextarea
          name='Api Columns'
          value={commandData.ApiColumns || ''}
          placeholder=''
          onChange={e => handleChange('ApiColumns', e.target.value)}
        />

        {/* SpParam */}
        <CustomTextarea
          name='Sp Parameters'
          value={commandData.SpParam || ''}
          placeholder=''
          onChange={e => handleChange('SpParam', e.target.value)}
        />

        {/* Api Mode Selector */}
        <DynamicSelector
          name='Api Mode'
          options={apiModes}
          selectedValue={commandData.CmdType || ''}
          onChange={e => handleChange('CmdType', e.target.value)}
          label='Api Mode'
          loading={loadingApiModes}
        />

        {/* Grid Command */}
        <DynamicInput
          name='Grid Command'
          type='text'
          value={commandData.gridCmd || ''}
          placeholder=''
          onChange={e =>
            handleChange('gridCmd', e.target.value)
          }
        />

        {/* Report Command */}
        <DynamicInput
          name='Report Command'
          type='text'
          value={commandData.tabCmd || ''}
          placeholder=''
          onChange={e => handleChange('tabCmd', e.target.value)}
        />

        {/* ProjectIntensive (checkbox به عنوان نمونه) */}
        <div className='flex items-center mt-4 space-x-2'>
          <label htmlFor='ProjectIntensive' className='text-sm font-medium'>
            ProjectIntensive:
          </label>
          <input
            id='ProjectIntensive'
            type='checkbox'
            checked={commandData.ProjectIntensive}
            onChange={e => handleChange('ProjectIntensive', e.target.checked)}
          />
        </div>
      </TwoColumnLayout>
    )
  }
)

export default CommandSettings
