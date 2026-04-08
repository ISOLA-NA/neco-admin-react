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
import { useAddEditDelete } from "../../context/AddEditDeleteContext";
import { CategoryItem } from "../../services/api.services";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const { handleSaveCatA, handleSaveCatB } = useAddEditDelete();

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
        setCategoryType(selectedCategoryType);
      } else {
        setFormData({
          ID: undefined,
          Name: "",
          Description: "",
          IsVisible: true,
          LastModified: new Date().toISOString(),
          ModifiedById: undefined,
        });
        setCategoryType(selectedCategoryType);
      }
    }, [selectedRow, selectedCategoryType]);

    useImperativeHandle(ref, () => ({
      save: async () => {
        const saveData = {
          ...formData,
          categoryType,
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

    return (
      <div className="p-4">
        <TwoColumnLayout>
          <TwoColumnLayout.Item span={2}>
            <DynamicInput
              name={t("Category.Name")}
              type="text"
              value={formData.Name}
              onChange={handleNameChange}
              placeholder={t("Category.NamePlaceholder")}
              required
            />
          </TwoColumnLayout.Item>

          <TwoColumnLayout.Item span={2}>
            <CustomTextarea
              name={t("Category.Description")}
              value={formData.Description}
              placeholder={t("Category.DescriptionPlaceholder")}
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