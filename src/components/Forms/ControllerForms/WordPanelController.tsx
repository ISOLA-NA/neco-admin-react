import React, { useState, useEffect } from 'react'
import DynamicInput from '../../utilities/DynamicInput'
import { FaTrash, FaEye } from 'react-icons/fa'

// سرویس مربوط به فایل‌ها (گرفتن اطلاعات و دانلود)
import fileService from '../../../services/api.servicesFile'
// فایل آپلود هندلر
import FileUploadHandler, {
  InsertModel
} from '../../../services/FileUploadHandler'

interface WordPanelProps {
  /**
   * تابعی برای ارسال تغییرات به فرم پدر
   * اگر در حالت ویرایش باشیم، مقدار قبلی را می‌خواند
   */
  onMetaChange?: (data: any) => void
  /**
   * اگر در حالت ادیت باشیم، این آبجکت داده‌های قبلی را شامل می‌شود
   * که در آن ممکن است metaType4 موجود باشد
   */
  data?: any
}

const WordPanel: React.FC<WordPanelProps> = ({ data, onMetaChange }) => {
  // فایل انتخاب‌شده یا آپلودشده را بر اساس metaType4 نگه می‌داریم
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    data?.metaType4 || null
  )

  // نمایش نام فایل در فیلد
  const [fileName, setFileName] = useState<string>(data?.fileName || '')

  // شمارنده برای ریست کردن FileUploadHandler
  const [resetCounter, setResetCounter] = useState<number>(0)

  // وقتی کامپوننت لود شد یا selectedFileId تغییر کرد، اطلاعات فایل را از سرور می‌گیریم
  useEffect(() => {
    if (selectedFileId) {
      fileService
        .getFile(selectedFileId)
        .then(res => {
          // فرض می‌کنیم سرور FileName را برمی‌گرداند
          setFileName(res.data.FileName)
        })
        .catch(err => {
          console.error('Error fetching file info:', err)
        })
    } else {
      setFileName('')
    }
  }, [selectedFileId])

  /**
   * وقتی آپلود فایل با موفقیت انجام شد
   * سرویس FileUploadHandler یک مدل InsertModel را برمی‌گرداند
   * که حاوی اطلاعات فایل آپلودشده در دیتابیس است
   */
  const handleUploadSuccess = (insertedModel: InsertModel) => {
    setSelectedFileId(insertedModel.ID || null)
    setFileName(insertedModel.FileName)

    // به والد اعلام کنیم metaType4 به این آیدی تغییر کرد
    if (onMetaChange) {
      onMetaChange({ metaType4: insertedModel.ID || null })
    }
  }

  /**
   * وقتی کاربر روی دکمهٔ Reset (زباله‌دان) کلیک می‌کند
   * فایل موجود را پاک کرده و فایل جدید جایگزین نمی‌کنیم
   */
  const handleReset = () => {
    setSelectedFileId(null)
    setFileName('')
    setResetCounter(prev => prev + 1)

    if (onMetaChange) {
      onMetaChange({ metaType4: null })
    }
  }

  /**
   * وقتی روی دکمهٔ Show کلیک می‌شود، فایل موجود را دانلود کنیم
   */
  const handleDownloadFile = async () => {
    if (!selectedFileId) {
      alert('No file to download.')
      return
    }

    try {
      // ابتدا اطلاعات متادیتای فایل را از سرور می‌گیریم
      const infoRes = await fileService.getFile(selectedFileId)
      const { FileIQ, FileType, FolderName, FileName } = infoRes.data

      // برای دانلود لازم است در خواست دانلود بسازیم
      const downloadingFileObject = {
        FileName: FileIQ + FileType, // مثلاً 123e4567.doc
        FolderName: FolderName,
        cacheBust: Date.now()
      }

      const downloadRes = await fileService.download(downloadingFileObject)
      const uint8Array = new Uint8Array(downloadRes.data)

      // نوع MIME مناسب برای ورد
      let mimeType = 'application/octet-stream'
      if (FileType === '.doc') {
        mimeType = 'application/msword'
      } else if (FileType === '.docx') {
        mimeType =
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }

      // ساخت یک آبجکت Blob و ایجاد URL موقت
      const blob = new Blob([uint8Array], { type: mimeType })
      const blobUrl = (window.URL || window.webkitURL).createObjectURL(blob)

      // شبیه‌سازی کلیک روی لینک دانلود
      const link = document.createElement('a')
      link.href = blobUrl
      // می‌توانید از FileName اصلی یا هر نام دلخواه استفاده کنید
      link.download = FileName
      link.click()

      // بعد از دانلود می‌توانید URL blob را آزاد کنید
      ;(window.URL || window.webkitURL).revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Error downloading file:', err)
      alert('Failed to download file.')
    }
  }

  return (
    <div className='flex flex-col items-center w-full mt-10'>
      {/* ردیف بالایی: آیکن حذف فایل، ورودی نام فایل، و دکمه Show */}
      <div className='flex items-center gap-2 w-full'>
        {/* دکمه حذف فایل در صورتی که فایل انتخاب شده باشد */}
        {selectedFileId && (
          <button
            type='button'
            onClick={handleReset}
            title='Reset file'
            className='bg-red-500 text-white p-1 rounded hover:bg-red-700 transition duration-300'
          >
            <FaTrash size={16} />
          </button>
        )}

        {/* نمایش نام فایل به صورت فقط خواندنی */}
        <DynamicInput
          name='fileName'
          type='text'
          value={fileName || ''}
          placeholder='No file selected'
          className='flex-grow -mt-6'
        />

        {/* دکمه Show برای دانلود فایل */}
        <button
          type='button'
          onClick={handleDownloadFile}
          className={`flex items-center px-2 py-1 bg-purple-500 text-white font-semibold rounded transition duration-300 ${
            selectedFileId
              ? 'hover:bg-purple-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!selectedFileId}
        >
          {/* <FaEye size={16} className='mr-1' /> */}
          Download
        </button>
      </div>

      {/* بخش آپلود فایل ورد (doc, docx)
          این بخش تنها در حالت افزودن (عدم وجود داده‌های قبلی) نمایش داده می‌شود */}
        <div className='w-full mt-4'>
          <FileUploadHandler
            selectedFileId={selectedFileId}
            resetCounter={resetCounter}
            onReset={() => {}}
            onUploadSuccess={handleUploadSuccess}
            // در اینجا فرمت‌های مجاز را فقط doc و docx تعیین می‌کنیم:
            allowedExtensions={['doc', 'docx']}
          />
        </div>
    </div>
  )
}

export default WordPanel
