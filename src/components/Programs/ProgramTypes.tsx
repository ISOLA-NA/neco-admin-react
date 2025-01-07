// src/components/Programs/ProgramType.tsx

import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import { showAlert } from "../utilities/Alert/DynamicAlert";
import { useApi } from "../../context/ApiContext";
import { ProgramType as IProgramType } from "../../services/api.services";

// Define handle interface for ref
export interface ProgramTypeHandle {
  save: () => Promise<boolean>;
}

// Define props interface
interface ProgramTypeProps {
  selectedRow: IProgramType | null;
}

// Implement the component
const ProgramType: ForwardRefRenderFunction<
  ProgramTypeHandle,
  ProgramTypeProps
> = ({ selectedRow }, ref) => {
  const api = useApi();

  // State with complete ProgramType interface
  const [programTypeData, setProgramTypeData] = useState<IProgramType>({
    Name: "",
    Describtion: "", // Note: This matches the API interface spelling
    IsVisible: true,
    ModifiedById: null,
    LastModified: undefined,
  });

  // Update data when selectedRow changes
  useEffect(() => {
    if (selectedRow) {
      setProgramTypeData({
        ID: selectedRow.ID,
        Name: selectedRow.Name,
        Describtion: selectedRow.Describtion,
        IsVisible: selectedRow.IsVisible,
        LastModified: selectedRow.LastModified,
        ModifiedById: selectedRow.ModifiedById,
      });
    } else {
      setProgramTypeData({
        Name: "",
        Describtion: "",
        IsVisible: true,
        ModifiedById: null,
        LastModified: undefined,
      });
    }
  }, [selectedRow]);

  // Handle input changes
  const handleChange = (field: keyof IProgramType, value: any) => {
    setProgramTypeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save method implementation
  const save = async (): Promise<boolean> => {
    try {
      // Validation
      if (!programTypeData.Name.trim()) {
        showAlert(
          "warning",
          null,
          "توجه",
          "نام نوع برنامه نمی‌تواند خالی باشد."
        );
        return false;
      }

      const dataToSave: IProgramType = {
        ...programTypeData,
        LastModified: new Date().toISOString(),
        IsVisible: programTypeData.IsVisible ?? true,
      };

      if (selectedRow?.ID) {
        // Update existing program type
        await api.updateProgramType({
          ...dataToSave,
          ID: selectedRow.ID,
        });
        showAlert(
          "success",
          null,
          "موفقیت",
          "نوع برنامه با موفقیت به‌روزرسانی شد."
        );
      } else {
        // Create new program type
        await api.insertProgramType(dataToSave);
        showAlert("success", null, "موفقیت", "نوع برنامه با موفقیت اضافه شد.");
      }
      return true;
    } catch (error) {
      console.error("Error saving ProgramType:", error);
      showAlert("error", null, "خطا", "ذخیره نوع برنامه با شکست مواجه شد.");
      return false;
    }
  };

  // Expose save method via ref
  useImperativeHandle(ref, () => ({
    save,
  }));

  return (
    <TwoColumnLayout>
      {/* Name Input */}
      <DynamicInput
        name="Program Name"
        type="text" // اصلاح نوع به "text"
        value={programTypeData.Name}
        placeholder=""
        onChange={(e) => handleChange("Name", e.target.value)} // اصلاح فیلد به "Name"
        required={true}
      />
      <DynamicInput
        name="Description"
        type="text"
        value={programTypeData.Describtion}
        placeholder=""
        onChange={(e) => handleChange("Describtion", e.target.value)}
        required={true}
      />
    </TwoColumnLayout>
  );
};

// Export the component with forwardRef
export default forwardRef(ProgramType);
