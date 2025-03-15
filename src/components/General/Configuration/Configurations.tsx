// src/components/Views/tab/Configuration.tsx

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import TwoColumnLayout from '../../layout/TwoColumnLayout'
import CustomTextarea from '../../utilities/DynamicTextArea'
import DynamicInput from '../../utilities/DynamicInput'
import DynamicSelector from '../../utilities/DynamicSelector'
import ListSelector from '../../ListSelector/ListSelector'
import DynamicModal from '../../utilities/DynamicModal'
import TableSelector from '../Configuration/TableSelector'
import ButtonComponent from '../Configuration/ButtonComponent'

import {
  useApi,
  EntityTypeItem,
  WfTemplateItem,
  ProgramTemplateItem,
  DefaultRibbonItem,
  AFBtnItem,
  ConfigurationItem
} from '../../../context/ApiContext'

interface ConfigurationProps {
  selectedRow: any
  onSave?: (data: ConfigurationItem) => void
}

export interface ConfigurationHandle {
  save: () => Promise<ConfigurationItem | null>
}

const Configuration = forwardRef<ConfigurationHandle, ConfigurationProps>(
  ({ selectedRow }, ref) => {
    const api = useApi()

    // مقداردهی اولیه state
    const [configData, setConfigData] = useState({
      id: '',
      Name: '',
      FirstIDProgramTemplate: '',
      SelMenuIDForMain: '',
      Description: '',
      IsVisible: true,
      LastModified: '',
      DefaultBtn: '',
      LetterBtns: '',
      MeetingBtns: '',
      EnityTypeIDForLessonLearn: '',
      EnityTypeIDForTaskCommnet: '',
      EnityTypeIDForProcesure: '',
      WFTemplateIDForLessonLearn: ''
    })

    const [descriptionError, setDescriptionError] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [currentSelector, setCurrentSelector] = useState<
      | 'DefaultBtn'
      | 'LetterBtns'
      | 'MeetingBtns'
      | 'FirstIDProgramTemplate'
      | 'SelMenuIDForMain'
      | 'Lesson Learned Form'
      | 'Lesson Learned Af Template'
      | 'Comment Form Template'
      | 'Procedure Form Template'
      | null
    >(null)
    const [selectedRowData, setSelectedRowData] = useState<any>(null)

    // داده‌هایی که از API می‌آیند
    const [programTemplates, setProgramTemplates] = useState<ProgramTemplateItem[]>([])
    const [defaultRibbons, setDefaultRibbons] = useState<DefaultRibbonItem[]>([])
    const [entityTypes, setEntityTypes] = useState<EntityTypeItem[]>([])
    const [wfTemplates, setWfTemplates] = useState<WfTemplateItem[]>([])
    const [afButtons, setAfButtons] = useState<AFBtnItem[]>([])

    const [loading, setLoading] = useState<boolean>(true)

    // متد ذخیره‌سازی با بررسی مقدار Name
    const handleSave = async (): Promise<ConfigurationItem | null> => {
      if (!configData.Name.trim()) {
        alert('لطفاً مقدار Name را پر کنید')
        return null
      }
      try {
        setLoading(true)

        const newConfig: ConfigurationItem = {
          ...(configData.id && { ID: parseInt(configData.id) }),
          Name: configData.Name,
          Description: configData.Description,
          DefaultBtn: configData.DefaultBtn,
          LetterBtns: configData.LetterBtns,
          MeetingBtns: configData.MeetingBtns,
          FirstIDProgramTemplate: Number(configData.FirstIDProgramTemplate) || 0,
          SelMenuIDForMain: Number(configData.SelMenuIDForMain) || 0,
          IsVisible: configData.IsVisible,
          LastModified: new Date().toISOString(),
          EnityTypeIDForLessonLearn: Number(configData.EnityTypeIDForLessonLearn) || 0,
          EnityTypeIDForTaskCommnet: Number(configData.EnityTypeIDForTaskCommnet) || 0,
          EnityTypeIDForProcesure: Number(configData.EnityTypeIDForProcesure) || 0,
          WFTemplateIDForLessonLearn: Number(configData.WFTemplateIDForLessonLearn) || 0
        }

        let updatedConfig: ConfigurationItem
        if (newConfig.ID) {
          // اگر ID داشته باشیم، رکورد را آپدیت می‌کنیم
          updatedConfig = await api.updateConfiguration(newConfig)
        } else {
          // در غیر این صورت، درج رکورد جدید
          updatedConfig = await api.insertConfiguration(newConfig)
        }

        return updatedConfig
      } catch (error) {
        console.error('Error saving configuration:', error)
        throw error
      } finally {
        setLoading(false)
      }
    }

    // امکان صدا زدن متد save از بیرون
    useImperativeHandle(ref, () => ({
      save: handleSave
    }))

    // تابع کمکی برای تغییر در state
    const handleChange = (
      field: keyof typeof configData,
      value: string | number
    ) => {
      setConfigData(prev => ({
        ...prev,
        [field]: value.toString()
      }))

      if (field === 'Description' && typeof value === 'string') {
        setDescriptionError(value.length < 10)
      }
    }

    // نگاشت فیلدها برای سلکتورها
    const selectorToFieldMap: { [key: string]: keyof typeof configData } = {
      DefaultBtn: 'DefaultBtn',
      LetterBtns: 'LetterBtns',
      MeetingBtns: 'MeetingBtns',
      FirstIDProgramTemplate: 'FirstIDProgramTemplate',
      SelMenuIDForMain: 'SelMenuIDForMain',
      'Lesson Learned Form': 'EnityTypeIDForLessonLearn',
      'Lesson Learned Af Template': 'WFTemplateIDForLessonLearn',
      'Comment Form Template': 'EnityTypeIDForTaskCommnet',
      'Procedure Form Template': 'EnityTypeIDForProcesure'
    }

    // در فیلدهای چندمقداری مثل اکشن‌باتن‌ها، مقدارها به صورت pipe ذخیره می‌شوند
    const handleSelectionChange = (
      field: keyof typeof configData,
      selectedIds: (number | string)[]
    ) => {
      const idsString = selectedIds.join('|') + '|'
      handleChange(field, idsString)
    }

    // وقتی از داخل مودال یک ردیف انتخاب می‌شود
    const handleSelectButtonClick = () => {
      if (selectedRowData && currentSelector) {
        const field = selectorToFieldMap[currentSelector]
        if (field) {
          const selectedId = selectedRowData.ID.toString()
          handleChange(field, selectedId)
          handleCloseModal()
        }
      } else {
        console.warn('No row selected or selector is null')
      }
    }

    // دریافت داده‌ها از API
    useEffect(() => {
      const fetchInitialData = async () => {
        try {
          setLoading(true)
          const [templates, ribbons, entities, wfTemplatesData, afButtonsData] =
            await Promise.all([
              api.getAllProgramTemplates(),
              api.getAllDefaultRibbons(),
              api.getTableTransmittal(),
              api.getAllWfTemplate(),
              api.getAllAfbtn()
            ])

          setProgramTemplates(templates)
          setDefaultRibbons(ribbons)
          setEntityTypes(entities)
          setWfTemplates(wfTemplatesData)
          setAfButtons(afButtonsData)
        } catch (error) {
          console.error('Error fetching initial data:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchInitialData()
    }, [api])

    // بروزرسانی state هنگام تغییر سطر انتخابی
    useEffect(() => {
      if (selectedRow) {
        setConfigData({
          id: selectedRow?.ID?.toString() || '',
          Name: selectedRow?.Name || '',
          FirstIDProgramTemplate: (selectedRow?.FirstIDProgramTemplate || '')
            .toString()
            .replace(/\|+$/, ''),
          SelMenuIDForMain: (selectedRow?.SelMenuIDForMain || '')
            .toString()
            .replace(/\|+$/, ''),
          Description: selectedRow?.Description || '',
          IsVisible: selectedRow?.IsVisible ?? true,
          LastModified: selectedRow?.LastModified || '',
          DefaultBtn: selectedRow?.DefaultBtn || '',
          LetterBtns: selectedRow?.LetterBtns || '',
          MeetingBtns: selectedRow?.MeetingBtns || '',
          EnityTypeIDForLessonLearn: (selectedRow?.EnityTypeIDForLessonLearn || '')
            .toString()
            .replace(/\|+$/, ''),
          EnityTypeIDForTaskCommnet: (selectedRow?.EnityTypeIDForTaskCommnet || '')
            .toString()
            .replace(/\|+$/, ''),
          EnityTypeIDForProcesure: (selectedRow?.EnityTypeIDForProcesure || '')
            .toString()
            .replace(/\|+$/, ''),
          WFTemplateIDForLessonLearn: (selectedRow?.WFTemplateIDForLessonLearn || '')
            .toString()
            .replace(/\|+$/, '')
        })
      } else {
        setConfigData({
          id: '',
          Name: '',
          FirstIDProgramTemplate: '',
          SelMenuIDForMain: '',
          Description: '',
          IsVisible: true,
          LastModified: '',
          DefaultBtn: '',
          LetterBtns: '',
          MeetingBtns: '',
          EnityTypeIDForLessonLearn: '',
          EnityTypeIDForTaskCommnet: '',
          EnityTypeIDForProcesure: '',
          WFTemplateIDForLessonLearn: ''
        })
      }
    }, [selectedRow])

    // مدیریت باز و بسته شدن مودال
    const handleOpenModal = (
      selector:
        | 'DefaultBtn'
        | 'LetterBtns'
        | 'MeetingBtns'
        | 'FirstIDProgramTemplate'
        | 'SelMenuIDForMain'
        | 'Lesson Learned Form'
        | 'Lesson Learned Af Template'
        | 'Comment Form Template'
        | 'Procedure Form Template'
    ) => {
      setCurrentSelector(selector)
      setModalOpen(true)
    }

    const handleCloseModal = () => {
      setModalOpen(false)
      setSelectedRowData(null)
      setCurrentSelector(null)
    }

    const handleRowClick = (rowData: any) => {
      setSelectedRowData(rowData)
    }

    // دریافت داده‌ها برای مودال بر اساس سلکتور
    const getRowData = (selector: string | null) => {
      if (!selector) return []
      switch (selector) {
        case 'FirstIDProgramTemplate':
          return programTemplates
        case 'SelMenuIDForMain':
          return defaultRibbons
        case 'Lesson Learned Form':
        case 'Comment Form Template':
        case 'Procedure Form Template':
          return entityTypes
        case 'Lesson Learned Af Template':
          return wfTemplates
        case 'DefaultBtn':
        case 'LetterBtns':
        case 'MeetingBtns':
          return afButtons
        default:
          return []
      }
    }

    // تابع کمکی برای پردازش مقادیر چند انتخابی
    const parseIds = (ids: string): number[] => {
      return ids
        .split('|')
        .map(id => parseInt(id))
        .filter(id => !isNaN(id))
    }

    const defaultBtnIds = parseIds(configData.DefaultBtn)
    const letterBtnIds = parseIds(configData.LetterBtns)
    const meetingBtnIds = parseIds(configData.MeetingBtns)

    return (
      <div>
        <TwoColumnLayout>
          {/* نام */}
          <DynamicInput
            name="Name"
            type="text"
            value={configData.Name}
            onChange={(e) => handleChange("Name", e.target.value)}
            required
            loading={loading}
          />

          {/* توضیحات */}
          <CustomTextarea
            name="Description"
            value={configData.Description}
            onChange={(e) => handleChange("Description", e.target.value)}
            placeholder=""
            className={descriptionError ? "border-red-500" : "border-gray-300"}
          />

          {/* Program Template -> تک مقداری */}
          <DynamicSelector
            name="FirstIDProgramTemplate"
            options={programTemplates.map((pt) => ({
              value: pt.ID.toString(),
              label: pt.Name
            }))}
            selectedValue={configData.FirstIDProgramTemplate}
            onChange={(e) =>
              handleChange("FirstIDProgramTemplate", e.target.value)
            }
            label="Program Template"
            showButton={true}
            onButtonClick={() => handleOpenModal("FirstIDProgramTemplate")}
            loading={loading}
            className="mt-1"
          />

          {/* Default Ribbon -> تک مقداری */}
          <DynamicSelector
            name="SelMenuIDForMain"
            options={defaultRibbons.map((dr) => ({
              value: dr.ID.toString(),
              label: dr.Name
            }))}
            selectedValue={configData.SelMenuIDForMain}
            onChange={(e) => handleChange("SelMenuIDForMain", e.target.value)}
            label="Default Ribbon"
            showButton={true}
            onButtonClick={() => handleOpenModal("SelMenuIDForMain")}
            loading={loading}
            className="mt-1"
          />

          {/* Lesson Learned Form -> تک مقداری */}
          <DynamicSelector
            name="EnityTypeIDForLessonLearn"
            options={entityTypes.map((llf) => ({
              value: llf.ID.toString(),
              label: llf.Name
            }))}
            selectedValue={configData.EnityTypeIDForLessonLearn}
            onChange={(e) =>
              handleChange("EnityTypeIDForLessonLearn", e.target.value)
            }
            label="Lesson Learned Form"
            showButton={true}
            onButtonClick={() => handleOpenModal("Lesson Learned Form")}
            className="mt-1"
            loading={loading}
          />

          {/* Lesson Learned Af Template -> تک مقداری */}
          <DynamicSelector
            name="WFTemplateIDForLessonLearn"
            options={wfTemplates.map((wf) => ({
              value: wf.ID.toString(),
              label: wf.Name
            }))}
            selectedValue={configData.WFTemplateIDForLessonLearn}
            onChange={(e) =>
              handleChange("WFTemplateIDForLessonLearn", e.target.value)
            }
            label="Lesson Learned Af Template"
            showButton={true}
            onButtonClick={() => handleOpenModal("Lesson Learned Af Template")}
            className="mt-1"
            loading={loading}
          />

          {/* Comment Form Template -> تک مقداری */}
          <DynamicSelector
            name="EnityTypeIDForTaskCommnet"
            options={entityTypes.map((cft) => ({
              value: cft.ID.toString(),
              label: cft.Name
            }))}
            selectedValue={configData.EnityTypeIDForTaskCommnet}
            onChange={(e) =>
              handleChange("EnityTypeIDForTaskCommnet", e.target.value)
            }
            label="Comment Form Template"
            showButton={true}
            onButtonClick={() => handleOpenModal("Comment Form Template")}
            className="mt-1"
            loading={loading}
          />

          {/* Procedure Form Template -> تک مقداری */}
          <DynamicSelector
            name="EnityTypeIDForProcesure"
            options={entityTypes.map((pft) => ({
              value: pft.ID.toString(),
              label: pft.Name
            }))}
            selectedValue={configData.EnityTypeIDForProcesure}
            onChange={(e) =>
              handleChange("EnityTypeIDForProcesure", e.target.value)
            }
            label="Procedure Form Template"
            showButton={true}
            onButtonClick={() => handleOpenModal("Procedure Form Template")}
            className="mt-1"
            loading={loading}
          />

          {/* Default Action Buttons -> چند مقداری */}
          <ListSelector
            title="Default Action Buttons"
            className="mt-1"
            columnDefs={[
              { headerName: "Name", field: "Name" },
              { headerName: "Tooltip", field: "Tooltip" }
            ]}
            rowData={afButtons}
            selectedIds={defaultBtnIds}
            onSelectionChange={(selectedIds) =>
              handleSelectionChange("DefaultBtn", selectedIds)
            }
            isGlobal={false}
            ModalContentComponent={ButtonComponent}
            modalContentProps={{
              columnDefs: [
                { headerName: "Name", field: "Name" },
                { headerName: "Tooltip", field: "Tooltip" }
              ],
              rowData: afButtons,
              onClose: handleCloseModal,
              onRowSelect: handleSelectButtonClick,
              onSelectFromButton: handleSelectButtonClick
            }}
            loading={loading}
          />

          {/* Letter Action Buttons -> چند مقداری */}
          <ListSelector
            title="Letter Action Buttons"
            className="mt-1"
            columnDefs={[
              { headerName: "Name", field: "Name" },
              { headerName: "Tooltip", field: "Tooltip" }
            ]}
            rowData={afButtons}
            selectedIds={letterBtnIds}
            onSelectionChange={(selectedIds) =>
              handleSelectionChange("LetterBtns", selectedIds)
            }
            isGlobal={false}
            ModalContentComponent={ButtonComponent}
            modalContentProps={{
              columnDefs: [
                { headerName: "Name", field: "Name" },
                { headerName: "Tooltip", field: "Tooltip" }
              ],
              rowData: afButtons,
              selectedRow: selectedRowData,
              onClose: handleCloseModal,
              onRowSelect: handleSelectButtonClick,
              onSelectFromButton: handleSelectButtonClick,
              isSelectDisabled: !selectedRowData
            }}
            loading={loading}
          />

          {/* Meeting Action Buttons -> چند مقداری (مشابه بقیه دکمه‌ها) */}
          <ListSelector
            title="Meeting Action Buttons"
            className="mt-1"
            columnDefs={[
              { headerName: "Name", field: "Name" },
              { headerName: "Tooltip", field: "Tooltip" }
            ]}
            rowData={afButtons}
            selectedIds={meetingBtnIds}
            onSelectionChange={(selectedIds) =>
              handleSelectionChange("MeetingBtns", selectedIds)
            }
            isGlobal={false}
            ModalContentComponent={ButtonComponent}
            modalContentProps={{
              columnDefs: [
                { headerName: "Name", field: "Name" },
                { headerName: "Tooltip", field: "Tooltip" }
              ],
              rowData: afButtons,
              selectedRow: selectedRowData,
              onClose: handleCloseModal,
              onRowSelect: handleSelectButtonClick,
              onSelectFromButton: handleSelectButtonClick,
              isSelectDisabled: !selectedRowData
            }}
            loading={loading}
          />
        </TwoColumnLayout>

        {/* مودال عمومی برای انتخاب از جدول */}
        <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
          <TableSelector
            columnDefs={[
              { headerName: "نام", field: "Name" },
              { headerName: "توضیحات", field: "EntityCateADescription" }
            ]}
            rowData={getRowData(currentSelector)}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        </DynamicModal>
      </div>
    )
  }
)

export default Configuration
