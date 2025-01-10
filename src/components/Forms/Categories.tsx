// src/components/categories/Categories.tsx

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import DynamicSelector from "../utilities/DynamicSelector"; // وارد کردن DynamicSelector
import { useAddEditDelete } from "../../context/AddEditDeleteContext";
import { CategoryItem } from "../../services/api.services";

export interface CategoryHandle {
  save: () => Promise<any>;
  getData: () => any;
}

interface CategoriesProps {
  selectedRow: CategoryItem | null;
  selectedCategoryType: "cata" | "catb";
}

const Categories = forwardRef<CategoryHandle, CategoriesProps>(
  ({ selectedRow, selectedCategoryType }, ref) => {
    const { handleSaveCatA, handleSaveCatB } = useAddEditDelete();

    // وضعیت برای داده‌های فرم
    const [formData, setFormData] = useState<
      Omit<CategoryItem, "ID" | "ModifiedById"> & {
        ID?: number | undefined;
        ModifiedById?: number | undefined;
      }
    >({
      ID: undefined,
      Name: "",
      Description: "",
      IsVisible: true,
      LastModified: new Date().toISOString(),
      ModifiedById: undefined,
    });

    // وضعیت برای نوع دسته‌بندی
    const [categoryType, setCategoryType] = useState<"cata" | "catb">(
      selectedCategoryType
    );

    useEffect(() => {
      if (selectedRow) {
        setFormData({
          ID: selectedRow.ID ? Number(selectedRow.ID) : undefined,
          Name: selectedRow.Name || "",
          Description: selectedRow.Description || "",
          IsVisible: selectedRow.IsVisible ?? true,
          LastModified: selectedRow.LastModified || new Date().toISOString(),
          ModifiedById: selectedRow.ModifiedById
            ? Number(selectedRow.ModifiedById)
            : undefined,
        });
        setCategoryType(selectedCategoryType); // نوع دسته‌بندی ثابت در حالت ویرایش
      } else {
        setFormData({
          ID: undefined,
          Name: "",
          Description: "",
          IsVisible: true,
          LastModified: new Date().toISOString(),
          ModifiedById: undefined,
        });
        setCategoryType(selectedCategoryType); // مقدار اولیه نوع دسته‌بندی در حالت افزودن
      }
    }, [selectedRow, selectedCategoryType]);

    useImperativeHandle(ref, () => ({
      save: async () => {
        const saveData = {
          ...formData,
          categoryType, // استفاده از نوع دسته‌بندی فعلی
          LastModified: new Date().toISOString(),
        };

        try {
          if (categoryType === "cata") {
            return await handleSaveCatA(saveData);
          } else {
            return await handleSaveCatB(saveData);
          }
        } catch (error) {
          console.error("Error saving category:", error);
          throw error;
        }
      },
      getData: () => ({
        ...formData,
        categoryType,
      }),
    }));

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        Name: e.target.value,
      }));
    };

    const handleDescriptionChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      setFormData((prev) => ({
        ...prev,
        Description: e.target.value,
      }));
    };

    const handleCategoryTypeChange = (
      e: React.ChangeEvent<HTMLSelectElement>
    ) => {
      setCategoryType(e.target.value as "cata" | "catb");
    };

    // تعریف گزینه‌های دسته‌بندی با برچسب‌های فارسی
    const categoryOptions = [
      { value: "cata", label: "دسته‌بندی A" },
      { value: "catb", label: "دسته‌بندی B" },
    ];

    return (
      <div className="p-4">
        <TwoColumnLayout>
          <TwoColumnLayout.Item span={1}>
            <DynamicInput
              name="Name"
              type="text"
              value={formData.Name}
              onChange={handleNameChange}
              required
            />
          </TwoColumnLayout.Item>

          <TwoColumnLayout.Item span={1}>
            <DynamicSelector
              name="categoryType"
              label="نوع دسته‌بندی"
              options={categoryOptions}
              selectedValue={categoryType}
              onChange={handleCategoryTypeChange}
              disabled={!!selectedRow} // غیرفعال در حالت ویرایش
              className="mb-4"
            />
          </TwoColumnLayout.Item>

          <TwoColumnLayout.Item span={2}>
            <CustomTextarea
              name="Description"
              value={formData.Description}
              placeholder="توضیحات دسته‌بندی را وارد کنید"
              onChange={handleDescriptionChange}
              required
            />
          </TwoColumnLayout.Item>
        </TwoColumnLayout>
      </div>
    );
  }
);

Categories.displayName = "Categories";

export default Categories;
