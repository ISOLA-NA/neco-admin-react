// ButtonComponent.tsx

import React, { useState } from 'react';
import DataTable from '../../TableDynamic/DataTable';
import DynamicInput from '../../utilities/DynamicInput';
import DynamicRadioGroup from '../../utilities/DynamicRadiogroup';
import ImageUploader from '../../utilities/ImageUploader';
import TwoColumnLayout from '../../layout/TwoColumnLayout';
import DynamicButton from '../../utilities/DynamicButtons'; // مسیر صحیح به DynamicButton را تنظیم کنید
import { FaCheck, FaTimes } from 'react-icons/fa'; // مثال برای آیکون‌ها

interface ButtonComponentProps {
  onClose: () => void;
  onRowSelect: (data: any) => void;
  onSelectFromButton: (data: any, state: string, image?: File) => void;
  columnDefs: { headerName: string; field: string }[];
  rowData: any[];
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  onClose,
  onRowSelect,
  onSelectFromButton,
  columnDefs,
  rowData
}) => {
  const radioOptions = [
    { value: 'accept', label: 'Accept' },
    { value: 'reject', label: 'Reject' },
    { value: 'close', label: 'Close' }
  ];

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<string>(
    radioOptions.length > 0 ? radioOptions[0].value : ''
  );
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const handleRowDoubleClick = (data: any) => {
    setSelectedRow(data);
    onRowSelect(data);
  };

  const handleRowClick = (data: any) => {
    setSelectedRow(data);
  };

  const handleSelectButtonClick = () => {
    if (selectedRow && selectedState) {
      onSelectFromButton(selectedRow, selectedState, uploadedImage || undefined);
      onClose();
    }
  };

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
  };

  const isSelectDisabled = !selectedRow || !selectedState;

  return (
    <div className='bg-white rounded-lg p-4 flex flex-col h-full'>
      {/* بخش جدول با تنظیم ارتفاع به "autoHeight" */}
      <div className='mb-4'>
        <DataTable
          columnDefs={columnDefs}
          rowData={rowData}
          onRowDoubleClick={handleRowDoubleClick}
          setSelectedRowData={handleRowClick}
          showDuplicateIcon={false}
          onAdd={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onDuplicate={() => {}}
          domLayout="autoHeight" // تنظیم domLayout به "autoHeight"
        />
      </div>
      
      {/* بخش فرم‌ها و ورودی‌ها */}
      <TwoColumnLayout>
        <DynamicInput name='Input 1' type='text' value='' onChange={() => {}} />
        <DynamicInput name='Input 2' type='text' value='' onChange={() => {}} />
        <DynamicInput
          name='Input 3'
          type='number'
          value=''
          onChange={() => {}}
        />
        <DynamicInput name='Input 4' type='text' value='' onChange={() => {}} />
        <DynamicRadioGroup
          title='State:'
          name='stateGroup'
          options={radioOptions}
          selectedValue={selectedState}
          onChange={value => setSelectedState(value)}
        />
        <ImageUploader onUpload={handleImageUpload} />
      </TwoColumnLayout>
      
      {/* دکمه انتخاب */}
      <div className='mt-4 flex justify-center'>
        <DynamicButton
          text="Select"
          onClick={handleSelectButtonClick}
          isDisabled={isSelectDisabled}
          className="w-48"
        />
      </div>
    </div>
  );
};

export default ButtonComponent;
