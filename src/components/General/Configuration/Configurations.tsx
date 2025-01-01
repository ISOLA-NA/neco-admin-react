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

import { useAddEditDelete } from '../../../context/AddEditDeleteContext'

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
    // از کانتکست CRUD استفاده می‌کنیم
    const { handleSaveConfiguration } = useAddEditDelete()

    const [configData, setConfigData] = useState({
      id: selectedRow?.ID?.toString() || '',
      Name: selectedRow?.Name || '',
      FirstIDProgramTemplate: selectedRow?.FirstIDProgramTemplate || '',
      SelMenuIDForMain: selectedRow?.SelMenuIDForMain || '',
      Description: selectedRow?.Description || '',
      IsVisible: selectedRow?.IsVisible || true,
      LastModified: selectedRow?.LastModified || '',
      DefaultBtn: selectedRow?.DefaultBtn || '',
      LetterBtns: selectedRow?.LetterBtns || '',
      MeetingBtns: selectedRow?.MeetingBtns || '',
      EnityTypeIDForLessonLearn: selectedRow?.EnityTypeIDForLessonLearn || '',
      EnityTypeIDForTaskCommnet: selectedRow?.EnityTypeIDForTaskCommnet || '',
      EnityTypeIDForProcesure: selectedRow?.EnityTypeIDForProcesure || '',
      LessonLearnedAfTemplate: selectedRow?.LessonLearnedAfTemplate || "", // این خط اضافه شد

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

    // State for API data
    const [programTemplates, setProgramTemplates] = useState<
      ProgramTemplateItem[]
    >([])
    const [defaultRibbons, setDefaultRibbons] = useState<DefaultRibbonItem[]>(
      []
    )
    const [entityTypes, setEntityTypes] = useState<EntityTypeItem[]>([])
    const [wfTemplates, setWfTemplates] = useState<WfTemplateItem[]>([])
    const [afButtons, setAfButtons] = useState<AFBtnItem[]>([])

    // Loading state
    const [loading, setLoading] = useState<boolean>(true)

    // متدهای هندل تغییر مقدار فرم
    const handleChange = (
      field: keyof typeof configData,
      value: string | number
    ) => {
      setConfigData(prev => ({
        ...prev,
        [field]: value
      }))

      if (field === 'Description' && typeof value === 'string') {
        if (value.length < 10) {
          setDescriptionError(true)
        } else {
          setDescriptionError(false)
        }
      }
    }

    // map کردن نام ساب‌فرم (Dialog) به فیلد configData
    const selectorToFieldMap: { [key: string]: keyof typeof configData } = {
      DefaultBtn: 'DefaultBtn',
      LetterBtns: 'LetterBtns',
      MeetingBtns: 'MeetingBtns',
      FirstIDProgramTemplate: 'FirstIDProgramTemplate',
      SelMenuIDForMain: 'SelMenuIDForMain',
      'Lesson Learned Form': 'EnityTypeIDForLessonLearn',
      'Lesson Learned Af Template': 'SelMenuIDForMain',
      'Comment Form Template': 'EnityTypeIDForTaskCommnet',
      'Procedure Form Template': 'EnityTypeIDForProcesure'
    }

    // تابع کمکی برای ست کردن مقداری که از سطر انتخاب شده در مودال می‌آید
    const handleSelectionChange = (
      field: keyof typeof configData,
      selectedIds: (number | string)[]
    ) => {
      const idsString = selectedIds.join('|') + '|'
      handleChange(field, idsString)
    }

    // Handle row double click in ListSelector
    const handleSelectButtonClick = () => {
      if (selectedRowData && currentSelector) {
        const field = selectorToFieldMap[currentSelector]
        if (field) {
          const selectedId = selectedRowData.ID
          handleChange(field, selectedId.toString())
          handleCloseModal()
        }
      } else {
        console.warn('No row selected or selector is null')
      }
    }

    // hook جهت واکشی داده‌های لازم (Templates, Ribbons, EntityTypes و ...)
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

    // بروزرسانی configData زمانی که selectedRow تغییر می‌کند
    useEffect(() => {
      setConfigData({
        id: selectedRow?.ID?.toString() || "",
        Name: selectedRow?.Name || "",
        FirstIDProgramTemplate: selectedRow?.FirstIDProgramTemplate || "",
        SelMenuIDForMain: selectedRow?.SelMenuIDForMain || "",
        LessonLearnedAfTemplate: selectedRow?.LessonLearnedAfTemplate || "", // این خط اضافه شد
        Description: selectedRow?.Description || "",
        IsVisible: selectedRow?.IsVisible || true,
        LastModified: selectedRow?.LastModified || "",
        DefaultBtn: selectedRow?.DefaultBtn || "",
        LetterBtns: selectedRow?.LetterBtns || "",
        MeetingBtns: selectedRow?.MeetingBtns || "",
        EnityTypeIDForLessonLearn: selectedRow?.EnityTypeIDForLessonLearn || "",
        EnityTypeIDForTaskCommnet: selectedRow?.EnityTypeIDForTaskCommnet || "",
        EnityTypeIDForProcesure: selectedRow?.EnityTypeIDForProcesure || "",
      });
    }, [selectedRow]);
    

    // باز/بسته کردن مودال
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

    // تبدیل رشته pipe (مثلاً "2|5|") به آرایه اعداد
    const parseIds = (ids: string): number[] => {
      return ids
        .split('|')
        .map(id => parseInt(id))
        .filter(id => !isNaN(id))
    }

    // با توجه به selector کنونی، مشخص می‌کنیم چه داده‌ای را به TableSelector یا ListSelector پاس دهیم
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

    // برای نمایش ListSelector
    const defaultBtnIds = parseIds(configData.DefaultBtn)
    const letterBtnIds = parseIds(configData.LetterBtns)
    const meetingBtnIds = parseIds(configData.MeetingBtns)

    /**
     * تابعی که فراخوانی می‌شود تا از بیرون (TabContent) عمل Save انجام گردد.
     * از useImperativeHandle استفاده می‌کنیم تا والد بتواند با ref فراخوانی کند.
     */
    const handleSave = async (): Promise<ConfigurationItem | null> => {
      // اینجا فقط توابع کانتکست را صدا می‌زنیم
      // دادهٔ configData را پاس می‌دهیم
      const result = await handleSaveConfiguration(configData)
      return result
    }

    // useImperativeHandle => والد می‌تواند با ref بگوید: configurationRef.current?.save()
    useImperativeHandle(ref, () => ({
      save: handleSave
    }))

    return (
      <div>
        <TwoColumnLayout>
          {/* DynamicInput - Name */}
          <DynamicInput
            name='Name'
            type='text'
            value={configData.Name}
            onChange={e => handleChange('Name', e.target.value)}
            required
            loading={loading}
          />

          {/* CustomTextarea - Description */}
          <CustomTextarea
            name='Description'
            value={configData.Description}
            onChange={e => handleChange('Description', e.target.value)}
            placeholder=''
            className={`${
              descriptionError ? 'border-red-500' : 'border-gray-300'
            }`}
          />

          {/* DynamicSelector - Program Template */}
          <DynamicSelector
            name='FirstIDProgramTemplate'
            options={programTemplates.map(pt => ({
              value: pt.ID.toString(),
              label: pt.Name
            }))}
            selectedValue={configData.FirstIDProgramTemplate}
            onChange={e =>
              handleChange('FirstIDProgramTemplate', e.target.value)
            }
            label='Program Template'
            showButton={true}
            onButtonClick={() => handleOpenModal('FirstIDProgramTemplate')}
            loading={loading}
          />

          {/* DynamicSelector - Default Ribbon */}
          <DynamicSelector
            name='SelMenuIDForMain'
            options={defaultRibbons.map(dr => ({
              value: dr.ID.toString(),
              label: dr.Name
            }))}
            selectedValue={configData.SelMenuIDForMain}
            onChange={e => handleChange('SelMenuIDForMain', e.target.value)}
            label='Default Ribbon'
            showButton={true}
            onButtonClick={() => handleOpenModal('SelMenuIDForMain')}
            loading={loading}
          />

          {/* DynamicSelector - Lesson Learned Form */}
          <DynamicSelector
            name='EnityTypeIDForLessonLearn'
            options={entityTypes.map(llf => ({
              value: llf.ID.toString(),
              label: llf.Name
            }))}
            selectedValue={configData.EnityTypeIDForLessonLearn}
            onChange={e =>
              handleChange('EnityTypeIDForLessonLearn', e.target.value)
            }
            label='Lesson Learned Form'
            showButton={true}
            onButtonClick={() => handleOpenModal('Lesson Learned Form')}
            className='mt-7'
            loading={loading}
          />

          {/* DynamicSelector - Lesson Learned Af Template */}
          <DynamicSelector
            name='Lesson Learned Af Template'
            options={wfTemplates.map(wf => ({
              value: wf.ID.toString(),
              label: wf.Name
            }))}
            selectedValue={configData.LessonLearnedAfTemplate}
            onChange={e => handleChange('LessonLearnedAfTemplate', e.target.value)}
            label='Lesson Learned Af Template'
            showButton={true}
            onButtonClick={() => handleOpenModal('Lesson Learned Af Template')}
            className='mt-7'
            loading={loading}
          />

          {/* DynamicSelector - Comment Form Template */}
          <DynamicSelector
            name='EnityTypeIDForTaskCommnet'
            options={entityTypes.map(cft => ({
              value: cft.ID.toString(),
              label: cft.Name
            }))}
            selectedValue={configData.EnityTypeIDForTaskCommnet}
            onChange={e =>
              handleChange('EnityTypeIDForTaskCommnet', e.target.value)
            }
            label='Comment Form Template'
            showButton={true}
            onButtonClick={() => handleOpenModal('Comment Form Template')}
            className='mt-7'
            loading={loading}
          />

          {/* DynamicSelector - Procedure Form Template */}
          <DynamicSelector
            name='EnityTypeIDForProcesure'
            options={entityTypes.map(pft => ({
              value: pft.ID.toString(),
              label: pft.Name
            }))}
            selectedValue={configData.EnityTypeIDForProcesure}
            onChange={e =>
              handleChange('EnityTypeIDForProcesure', e.target.value)
            }
            label='Procedure Form Template'
            showButton={true}
            onButtonClick={() => handleOpenModal('Procedure Form Template')}
            className='mt-7'
            loading={loading}
          />

          {/* ListSelector - Default Action Buttons */}
          <ListSelector
            title='Default Action Buttons'
            className='mt-7'
            columnDefs={[
              { headerName: 'Name', field: 'Name' },
              { headerName: 'Tooltip', field: 'Tooltip' }
            ]}
            rowData={afButtons
              .filter(btn => btn.ID !== undefined)
              .map(btn => ({
                ID: btn.ID as number, // تایپ‌کست برای اطمینان از نوع
                Name: btn.Name
              }))}
            selectedIds={defaultBtnIds}
            onSelectionChange={selectedIds =>
              handleSelectionChange('DefaultBtn', selectedIds)
            }
            isGlobal={false}
            ModalContentComponent={ButtonComponent}
            modalContentProps={{
              columnDefs: [
                { headerName: 'Name', field: 'Name' },
                { headerName: 'Tooltip', field: 'Tooltip' }
              ],
              rowData: afButtons,
              onClose: handleCloseModal,
              onRowSelect: handleSelectButtonClick,
              onSelectFromButton: handleSelectButtonClick
            }}
            loading={loading}
          />

          {/* ListSelector - Letter Action Buttons */}
          <ListSelector
            title='Letter Action Buttons'
            className='mt-7'
            columnDefs={[
              { headerName: 'Name', field: 'Name' },
              { headerName: 'Tooltip', field: 'Tooltip' }
            ]}
            rowData={afButtons
              .filter(btn => btn.ID !== undefined)
              .map(btn => ({
                ID: btn.ID as number,
                Name: btn.Name
              }))}
            selectedIds={letterBtnIds}
            onSelectionChange={selectedIds =>
              handleSelectionChange('LetterBtns', selectedIds)
            }
            isGlobal={false}
            ModalContentComponent={ButtonComponent}
            modalContentProps={{
              columnDefs: [
                { headerName: 'Name', field: 'Name' },
                { headerName: 'Tooltip', field: 'Tooltip' }
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

          {/* ListSelector - Meeting Action Buttons */}
          <ListSelector
            title='Meeting Action Buttons'
            className='mt-7'
            columnDefs={[
              { headerName: 'Name', field: 'Name' },
              { headerName: 'Tooltip', field: 'Tooltip' }
            ]}
            rowData={afButtons
              .filter(btn => btn.ID !== undefined)
              .map(btn => ({
                ID: btn.ID as number,
                Name: btn.Name
              }))}
            selectedIds={meetingBtnIds}
            onSelectionChange={selectedIds =>
              handleSelectionChange('MeetingBtns', selectedIds)
            }
            isGlobal={false}
            ModalContentComponent={TableSelector}
            modalContentProps={{
              columnDefs: [
                { headerName: 'نام', field: 'Name' },
                { headerName: 'توضیحات', field: 'EntityCateADescription' }
              ],
              rowData: afButtons,
              selectedRow: selectedRowData,
              onRowDoubleClick: handleSelectButtonClick,
              onRowClick: handleRowClick,
              onSelectButtonClick: handleSelectButtonClick,
              isSelectDisabled: !selectedRowData
            }}
            loading={loading}
          />
        </TwoColumnLayout>

        {/* Modal کلی - برای انتخاب از جدول TableSelector */}
        <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
          <TableSelector
            columnDefs={[
              { headerName: 'نام', field: 'Name' },
              { headerName: 'توضیحات', field: 'EntityCateADescription' }
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
