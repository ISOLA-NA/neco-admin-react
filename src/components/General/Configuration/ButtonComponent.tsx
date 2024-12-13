// src/components/Configuration/ButtonComponent.tsx
import React, { useState } from "react";
import DataTable from "../../TableDynamic/DataTable";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicRadioGroup from "../../utilities/DynamicRadiogroup";
import ImageUploader from "../../utilities/ImageUploader";
import TwoColumnLayout from "../../layout/TwoColumnLayout";
import DynamicButton from "../../utilities/DynamicButtons";

interface ButtonComponentProps {
  columnDefs: { headerName: string; field: string }[];
  rowData: any[];
  onRowDoubleClick: (data: any) => void;
  onRowClick: (data: any) => void;
  onSelectButtonClick: () => void;
  isSelectDisabled: boolean;
  onClose: () => void; // اضافه شده
  onSelectFromButton: () => void; // اضافه شده
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  columnDefs,
  rowData,
  onRowDoubleClick,
  onRowClick,
  onSelectButtonClick,
  isSelectDisabled,
  onClose, // اضافه شده
  onSelectFromButton, // اضافه شده
}) => {
  const radioOptions = [
    { value: "accept", label: "Accept" },
    { value: "reject", label: "Reject" },
    { value: "close", label: "Close" },
  ];

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<string>(
    radioOptions[0].value
  );
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const handleRowDoubleClickLocal = (data: any) => {
    setSelectedRow(data);
    onRowDoubleClick(data);
  };

  const handleRowClickLocal = (data: any) => {
    setSelectedRow(data);
    onRowClick(data);
  };

  const handleSelectButtonClickLocal = () => {
    // ابتدا داده انتخابی را ثبت می‌کنیم
    onSelectButtonClick();
    // سپس مانند TableSelector، اگر نیاز داریم از onSelectFromButton استفاده کنیم:
    onSelectFromButton();
    // و در صورت نیاز، دیالوگ را ببندیم
    onClose();
  };

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
  };

  return (
    <div className="bg-white rounded-lg p-4 flex flex-col h-full">
      <div className="mb-4">
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
          domLayout="autoHeight"
          isRowSelected={false}
        />
      </div>

      <TwoColumnLayout>
        <DynamicInput name="Input 1" type="text" value="" onChange={() => {}} />
        <DynamicInput name="Input 2" type="text" value="" onChange={() => {}} />
        <DynamicInput
          name="Input 3"
          type="number"
          value=""
          onChange={() => {}}
        />
        <DynamicInput name="Input 4" type="text" value="" onChange={() => {}} />
        <DynamicRadioGroup
          title="State:"
          name="stateGroup"
          options={radioOptions}
          selectedValue={selectedState}
          onChange={(value) => setSelectedState(value)}
        />
        <ImageUploader onUpload={handleImageUpload} />
      </TwoColumnLayout>

      <div className="mt-4 flex justify-center">
        <DynamicButton
          text="Select"
          onClick={handleSelectButtonClickLocal}
          isDisabled={isSelectDisabled}
          className="w-48"
        />
      </div>
    </div>
  );
};

export default ButtonComponent;
