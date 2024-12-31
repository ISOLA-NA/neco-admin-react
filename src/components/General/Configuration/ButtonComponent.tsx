// src/components/General/ButtonComponent.tsx

import React, { useState, useCallback } from 'react';
import DataTable from '../../TableDynamic/DataTable';
import DynamicInput from '../../utilities/DynamicInput';
import DynamicRadioGroup from '../../utilities/DynamicRadiogroup';
import DynamicButton from '../../utilities/DynamicButtons';
import FileUploadHandler from '../../../services/FileUploadHandler';
import { useApi } from '../../../context/ApiContext';
import { AFBtnItem } from '../../../services/api.services';

interface ButtonComponentProps {
  columnDefs: { headerName: string; field: string }[];
  rowData: any[];
  onRowDoubleClick: (data: any) => void;
  onRowClick: (data: any) => void;
  onSelectButtonClick: () => void;
  isSelectDisabled: boolean;
  onClose: () => void;
  onSelectFromButton: () => void;
}

interface InsertModel {
  ID: string;
  gid: string;
  FileIQ: string;
  FileName: string;
  FileSize: number;
  FolderName: string;
  IsVisible: boolean;
  LastModified: Date | null;
  SenderID: string | null;
  FileType: string | null;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  columnDefs,
  rowData,
  onRowDoubleClick,
  onRowClick,
}) => {
  const api = useApi(); // برای متدهای API

  // وضعیت‌ها
  const [selectedState, setSelectedState] = useState<string>('accept');
  const [selectedCommand, setSelectedCommand] = useState<string>('accept');

  const [nameValue, setNameValue] = useState('');
  const [stateTextValue, setStateTextValue] = useState('');
  const [tooltipValue, setTooltipValue] = useState('');
  const [orderValue, setOrderValue] = useState('');

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isRowClicked, setIsRowClicked] = useState<boolean>(false);

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // وضعیت ریست کردن preview با استفاده از شمارنده
  const [resetCounter, setResetCounter] = useState<number>(0);

  // رادیوآپشن‌ها
  const RadioOptionsState = [
    { value: 'accept', label: 'Accept' },
    { value: 'reject', label: 'Reject' },
    { value: 'close', label: 'Close' },
  ];

  const RadioOptionsCommand = [
    { value: 'accept', label: 'Accept' },
    { value: 'reject', label: 'Reject' },
    { value: 'close', label: 'Close' },
    { value: 'client', label: 'Previous State Client' },
    { value: 'admin', label: 'Previous State Admin' },
  ];

  // دوبار کلیک
  const handleRowDoubleClickLocal = (data: any) => {
    setSelectedRow(data);
    onRowDoubleClick(data);
  };

  // کلیک روی ردیف جدول
  const handleRowClickLocal = async (data: any) => {
    try {
      setSelectedRow(data);
      onRowClick(data);
      setIsRowClicked(true);

      // پرکردن فیلدهای فرم با مقدار سطر انتخاب شده
      setNameValue(data.Name || '');
      setStateTextValue(data.StateText || '');
      setTooltipValue(data.Tooltip || '');
      setOrderValue(data.Order || '');

      if (data.WFStateForDeemed !== undefined) {
        setSelectedState(mapWFStateForDeemedToRadio(data.WFStateForDeemed));
      } else {
        setSelectedState(RadioOptionsState[0].value);
      }

      if (data.WFCommand !== undefined) {
        setSelectedCommand(mapWFCommandToRadio(data.WFCommand));
      } else {
        setSelectedCommand(RadioOptionsCommand[0].value);
      }

      // اگر این سطر آیکن (تصویر) نداشت، fileId را خالی بگذاریم و preview را ریست کنیم
      if (data.IconImageId) {
        setSelectedFileId(data.IconImageId);
      } else {
        setSelectedFileId(null);
        handleReset(); // ریست کردن ImageUploader
      }
    } catch (error) {
      console.error('خطا در handleRowClickLocal:', error);
    }
  };

  // تبدیل مقدار StateForDeemed به مقدار رادیو
  const mapWFStateForDeemedToRadio = (val: number) => {
    switch (val) {
      case 1:
        return 'accept';
      case 2:
        return 'reject';
      case 3:
        return 'close';
      default:
        return 'accept';
    }
  };

  // تبدیل مقدار WFCommand به مقدار رادیو
  const mapWFCommandToRadio = (val: number) => {
    switch (val) {
      case 1:
        return 'accept';
      case 2:
        return 'close';
      case 3:
        return 'reject';
      case 4:
        return 'client';
      case 5:
        return 'admin';
      default:
        return 'accept';
    }
  };

  // مبدل رادیو => WFStateForDeemed
  const radioToWFStateForDeemed = (radioVal: string): number => {
    switch (radioVal) {
      case 'accept':
        return 1;
      case 'reject':
        return 2;
      case 'close':
        return 3;
      default:
        return 1;
    }
  };

  // مبدل رادیو => WFCommand
  const radioToWFCommand = (radioVal: string): number => {
    switch (radioVal) {
      case 'accept':
        return 1;
      case 'close':
        return 2;
      case 'reject':
        return 3;
      case 'client':
        return 4;
      case 'admin':
        return 5;
      default:
        return 1;
    }
  };

  // تعریف تابع برای ریست کردن با استفاده از useCallback
  const handleReset = useCallback(() => {
    setResetCounter((prev) => prev + 1);
  }, []);

  // کلیک دکمه Add
  const handleAddClick = async () => {
    try {
      // ساخت آبجکت AFBtn جدید
      const newAFBtn: AFBtnItem = {
        ID: 0, // درج جدید
        Name: nameValue,
        Tooltip: tooltipValue,
        StateText: stateTextValue,
        Order: parseInt(orderValue || '0'),
        WFStateForDeemed: radioToWFStateForDeemed(selectedState),
        WFCommand: radioToWFCommand(selectedCommand),
        IconImageId: selectedFileId,
        IsVisible: true,
        LastModified: null,
        ModifiedById: null,
      };

      await api.insertAFBtn(newAFBtn);
      alert('آیتم جدید با موفقیت درج شد.');

      // ریست کردن preview بعد از افزودن
      handleReset();
    } catch (error) {
      console.error('خطا در درج آیتم AFBtn:', error);
      alert('خطایی در درج رخ داد.');
    }
  };

  // کلیک دکمه Edit
  const handleEditClick = async () => {
    if (!selectedRow || !selectedRow.ID) {
      alert('لطفاً یک ردیف را از جدول انتخاب کنید.');
      return;
    }
    try {
      const updatedAFBtn: AFBtnItem = {
        ID: selectedRow.ID,
        Name: nameValue,
        Tooltip: tooltipValue,
        StateText: stateTextValue,
        Order: parseInt(orderValue || '0'),
        WFStateForDeemed: radioToWFStateForDeemed(selectedState),
        WFCommand: radioToWFCommand(selectedCommand),
        IconImageId: selectedFileId,
        IsVisible: true,
        LastModified: null,
        ModifiedById: null,
      };

      await api.updateAFBtn(updatedAFBtn);
      alert('آیتم با موفقیت ویرایش شد.');

      // ریست کردن preview بعد از ویرایش
      handleReset();
    } catch (error) {
      console.error('خطا در ویرایش آیتم AFBtn:', error);
      alert('خطایی در ویرایش رخ داد.');
    }
  };

  // هندل آپلود موفقیت‌آمیز در FileUploadHandler
  const handleUploadSuccess = (insertModel: InsertModel) => {
    if (selectedRow) {
      const updatedRow = { ...selectedRow, IconImageId: insertModel.ID };
      setSelectedRow(updatedRow);

      // برای یکسان‌سازی با دیتای جدول و جلوگیری از ناسازگاری
      // می‌توانید اینجا onRowClick(updatedRow) را دوباره صدا بزنید یا
      // در صورت نیاز در دیتاست rowData نیز آپدیت کنید

      // مهم‌تر از همه، selectedFileId را برابر insertModel.ID بگذاریم
      setSelectedFileId(insertModel.ID);

      // ریست کردن preview بعد از آپلود موفقیت‌آمیز
      handleReset();
    }
  };

  return (
    <div className='w-full h-full flex flex-col overflow-x-hidden bg-white rounded-lg p-4'>
      {/* جدول بالا */}
      <div className='mb-4 w-full overflow-hidden'>
        <DataTable
          columnDefs={columnDefs}
          rowData={rowData}
          onRowDoubleClick={handleRowDoubleClickLocal}
          setSelectedRowData={handleRowClickLocal}
          showDuplicateIcon={false}
          onAdd={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onDuplicate={() => {}}
          domLayout='autoHeight'
        />
      </div>

      {/* بخش فرم */}
      <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* ستون اینپوت‌ها */}
        <div className='lg:col-span-2'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            {/* ردیف اول: Name و StateText */}
            <DynamicInput
              name='Name'
              type='text'
              value={nameValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNameValue(e.target.value)
              }
              className='sm:mr-2'
            />
            <DynamicInput
              name='StateText'
              type='text'
              value={stateTextValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setStateTextValue(e.target.value)
              }
              className='sm:ml-2'
            />

            {/* ردیف دوم: Tooltip و Order */}
            <DynamicInput
              name='Tooltip'
              type='text'
              value={tooltipValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTooltipValue(e.target.value)
              }
              className='sm:mr-2'
            />
            <DynamicInput
              name='Order'
              type='text'
              value={orderValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setOrderValue(e.target.value)
              }
              className='sm:ml-2'
            />
          </div>

          {/* رادیو گروپ‌ها */}
          <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-2'>
            <DynamicRadioGroup
              key={`state-${isRowClicked ? 'controlled' : 'uncontrolled'}`}
              title='State:'
              name='stateGroup'
              options={RadioOptionsState}
              selectedValue={selectedState}
              onChange={(value) => setSelectedState(value)}
              isRowClicked={isRowClicked}
              className=''
            />
            <DynamicRadioGroup
              key={`command-${isRowClicked ? 'controlled' : 'uncontrolled'}`}
              title='Command:'
              name='commandGroup'
              options={RadioOptionsCommand}
              selectedValue={selectedCommand}
              onChange={(value) => setSelectedCommand(value)}
              isRowClicked={isRowClicked}
              className=''
            />
          </div>
        </div>

        {/* آپلودر سمت راست */}
        <div className='lg:col-span-1 flex flex-col items-start mt-4 lg:mt-0'>
          <FileUploadHandler
            selectedFileId={selectedFileId}
            onUploadSuccess={handleUploadSuccess}
            resetCounter={resetCounter} // ارسال شمارنده به فرزند
            onReset={handleReset} // ارسال تابع ریست
          />
        </div>
      </div>

      {/* دکمه های پایین */}
      <div className='mt-6 flex justify-start space-x-4'>
        <DynamicButton text='Add' onClick={handleAddClick} isDisabled={false} />
        <DynamicButton text='Edit' onClick={handleEditClick} isDisabled={false} />
      </div>
    </div>
  );
};

export default ButtonComponent;
