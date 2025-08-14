// src/components/General/Role.tsx

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import DynamicSwitcher from "../utilities/DynamicSwitcher";
import { useAddEditDelete } from "../../context/AddEditDeleteContext";
import { showAlert } from "../utilities/Alert/DynamicAlert";
import { useTranslation } from "react-i18next";

// تعریف اینترفیس RoleHandle به طوری که متد save مقدار boolean برگرداند
export interface RoleHandle {
  save: () => Promise<boolean>;
  checkNameFilled: () => boolean;
}

interface RoleProps {
  selectedRow: any;
}

const Role = forwardRef<RoleHandle, RoleProps>(({ selectedRow }, ref) => {
  const { t } = useTranslation();
  const { handleSaveRole } = useAddEditDelete();
  const [roleData, setRoleData] = useState({
    ID: "",
    Name: "",
    Description: "",
    IsVisible: false,
    Type: "",
    Grade: "",
    Competencies: "",
    Authorization: "",
    Responsibility: "",
    PostCode: "",
    isStaticPost: false,
    isAccessCreateProject: false,
    isHaveAddressbar: false,
    LastModified: "",
    ModifiedById: "",
    CreateById: null,
    CreateDate: "",
    OwnerID: null,
    ParrentId: null,
    nCompanyID: null,
    nMenuID: null,
    nPostTypeID: null,
    nProjectID: null,
    status: 0,
  });

  // به روزرسانی state بر اساس selectedRow؛ در حالت ویرایش اطلاعات قبلی و در حالت درج مقدارهای اولیه تنظیم می‌شود
  useEffect(() => {
    if (selectedRow) {
      setRoleData({
        ID: selectedRow.ID || "",
        Name: selectedRow.Name || "",
        Description: selectedRow.Description || "",
        IsVisible: selectedRow.IsVisible || false,
        Type: selectedRow.Type || "",
        Grade: selectedRow.Grade || "",
        Competencies: selectedRow.Competencies || "",
        Authorization: selectedRow.Authorization || "",
        Responsibility: selectedRow.Responsibility || "",
        PostCode: selectedRow.PostCode || "",
        isStaticPost: selectedRow.isStaticPost || false,
        isAccessCreateProject: selectedRow.isAccessCreateProject || false,
        isHaveAddressbar: selectedRow.isHaveAddressbar || false,
        LastModified: selectedRow.LastModified || null,
        ModifiedById: selectedRow.ModifiedById || null,
        CreateById: selectedRow.CreateById || null,
        CreateDate: selectedRow.CreateDate || null,
        OwnerID: selectedRow.OwnerID || null,
        ParrentId: selectedRow.ParrantId || null,
        nCompanyID: selectedRow.nCompanyID || null,
        nMenuID: selectedRow.nMenuID || null,
        nPostTypeID: selectedRow.nPostTypeID || null,
        nProjectID: selectedRow.nProjectID || null,
        status: selectedRow.status || 0,
      });
    } else {
      setRoleData({
        ID: "",
        Name: "",
        Description: "",
        IsVisible: false,
        Type: "",
        Grade: "",
        Competencies: "",
        Authorization: "",
        Responsibility: "",
        PostCode: "",
        isStaticPost: false,
        isAccessCreateProject: false,
        isHaveAddressbar: false,
        LastModified: "",
        ModifiedById: "",
        CreateById: null,
        CreateDate: "",
        OwnerID: null,
        ParrentId: null,
        nCompanyID: null,
        nMenuID: null,
        nPostTypeID: null,
        nProjectID: null,
        status: 0,
      });
    }
  }, [selectedRow]);

  // تغییر مقدار فیلدهای roleData
  const handleChange = (
    field: keyof typeof roleData,
    value: string | boolean
  ) => {
    setRoleData((prev) => {
      const updated = { ...prev, [field]: value };
      console.log(`فیلد ${field} به مقدار ${value} تغییر کرد`);
      return updated;
    });
  };

  // متد ذخیره‌سازی که پس از ذخیره موفق، مقدار true برمی‌گرداند
  const save = async (): Promise<boolean> => {
    try {
      console.log("داده‌های ذخیره‌شده نقش:", roleData);
      await handleSaveRole(roleData);
      // showAlert("success", null, "", "Role Added successfully.");
      return true;
    } catch (error: any) {
      console.error("خطا در ذخیره‌سازی نقش:", error);
      const data = error.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.value?.message ||
            data?.message ||
            "خطایی در فرآیند ذخیره دستور رخ داده است.";
      showAlert("error", null, "خطا", message);
      return false;
    }
  };

  // بررسی اینکه فیلد Name خالی نباشد
  const checkNameFilled = () => {
    return roleData.Name.trim().length > 0;
  };

  // متدهای save و checkNameFilled را از طریق ref در دسترس پدر قرار می‌دهیم
  useImperativeHandle(ref, () => ({
    save,
    checkNameFilled,
  }));

  return (
    <TwoColumnLayout>
      {/* ورودی نام نقش */}
      <DynamicInput
        name={t("Roles.Role")}
        type="text"
        value={roleData.Name}
        placeholder="Enter role name"
        onChange={(e) => handleChange("Name", e.target.value)}
        required
      />
      {/* ورودی کد نقش */}
      <DynamicInput
        name={t("Roles.RoleCode")}
        type="text"
        value={roleData.PostCode}
        placeholder="Enter role code"
        onChange={(e) => handleChange("PostCode", e.target.value)}
      />
      {/* توضیحات شغلی */}
      <CustomTextarea
        name={t("Roles.JobDescription")}
        value={roleData.Description}
        placeholder="Enter job description"
        onChange={(e) => handleChange("Description", e.target.value)}
      />
      {/* مسئولیت‌ها */}
      <CustomTextarea
        name={t("Roles.Responsibilities")}
        value={roleData.Responsibility}
        placeholder="Enter responsibilities"
        onChange={(e) => handleChange("Responsibility", e.target.value)}
      />
      {/* اختیارات */}
      <CustomTextarea
        name={t("Roles.Authorities")}
        value={roleData.Authorization}
        placeholder="Enter authorities"
        onChange={(e) => handleChange("Authorization", e.target.value)}
      />
      {/* شایستگی‌ها */}
      <CustomTextarea
        name={t("Roles.Competencies")}
        value={roleData.Competencies}
        placeholder="Enter competencies"
        onChange={(e) => handleChange("Competencies", e.target.value)}
      />
      {/* سطح */}
      <DynamicInput
        name={t("Roles.Grade")}
        type="text"
        value={roleData.Grade}
        placeholder="Enter grade"
        onChange={(e) => handleChange("Grade", e.target.value)}
      />
      {/* نوع */}
      <DynamicInput
        name={t("Roles.Type")}
        type="text"
        value={roleData.Type}
        placeholder="Enter type"
        onChange={(e) => handleChange("Type", e.target.value)}
      />
      {/* سوئیچر مربوط به Static Post */}
      <div className="mb-4">
        <DynamicSwitcher
          isChecked={roleData.isStaticPost}
          onChange={() => handleChange("isStaticPost", !roleData.isStaticPost)}
          leftLabel=""
          rightLabel={t("Roles.StaticPost")}
        />
      </div>
    </TwoColumnLayout>
  );
});

export default Role;
