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
import { showAlert } from "../utilities/Alert/DynamicAlert";
import { useApi } from "../../context/ApiContext";
import { ProgramType as IProgramType } from "../../services/api.services";

// Define handle interface for ref
export interface ProgramTypeHandle {
  save: () => Promise<boolean>;
  checkNameFilled: () => boolean;
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
    Describtion: "", // توجه: این نام فیلد با املا در API مطابقت دارد
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

  // متد بررسی خالی نبودن نام
  const checkNameFilled = () => {
    if (!programTypeData.Name.trim()) {
      return false;
    }
    return true;
  };

  // Save method implementation
  const save = async (): Promise<boolean> => {
    try {
      // اعتبارسنجی نام با استفاده از checkNameFilled
      if (!checkNameFilled()) {
        return false;
      }

      const dataToSave: IProgramType = {
        ...programTypeData,
        LastModified: new Date().toISOString(),
        IsVisible: programTypeData.IsVisible ?? true,
      };

      if (selectedRow?.ID) {
        // بروزرسانی نوع برنامه موجود
        await api.updateProgramType({
          ...dataToSave,
          ID: selectedRow.ID,
        });
        showAlert(
          "success",
          null,
          "موفقیت",
          " برنامه با موفقیت به‌روزرسانی شد."
        );
      } else {
        // ایجاد نوع برنامه جدید
        await api.insertProgramType(dataToSave);
        // showAlert(
        //   "success",
        //   null,
        //   "موفقیت",
        //   "نوع برنامه با موفقیت اضافه شد."
        // );
      }
      return true;
    } catch (error) {
      console.error("Error saving ProgramType:", error);
      showAlert("error", null, "خطا", "ذخیره نوع برنامه با شکست مواجه شد.");
      return false;
    }
  };

  // Expose save and checkNameFilled methods via ref
  useImperativeHandle(ref, () => ({
    save,
    checkNameFilled,
  }));

  return (
    <TwoColumnLayout>
      {/* Name Input */}
      <DynamicInput
        name="Program Name"
        type="text"
        value={programTypeData.Name}
        placeholder=""
        onChange={(e) => handleChange("Name", e.target.value)}
        required={true}
      />
      <DynamicInput
        name="Description"
        type="text"
        value={programTypeData.Describtion}
        placeholder=""
        onChange={(e) => handleChange("Describtion", e.target.value)}
      />
    </TwoColumnLayout>
  );
};

export default forwardRef(ProgramType);
