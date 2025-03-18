// src/components/General/Role.tsx

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import DynamicSwitcher from "../utilities/DynamicSwitcher";
import { useAddEditDelete } from "../../context/AddEditDeleteContext";
import { showAlert } from "../utilities/Alert/DynamicAlert";

// تعریف اینترفیس RoleHandle به طوری که متد save مقدار boolean برگرداند
export interface RoleHandle {
  save: () => Promise<boolean>;
  checkNameFilled: () => boolean;
}

interface RoleProps {
  selectedRow: any;
}

const Role = forwardRef<RoleHandle, RoleProps>(({ selectedRow }, ref) => {
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
    clientOrder: Date.now(),
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
        LastModified: selectedRow.LastModified || "",
        ModifiedById: selectedRow.ModifiedById || "",
        CreateById: selectedRow.CreateById || null,
        CreateDate: selectedRow.CreateDate || "",
        OwnerID: selectedRow.OwnerID || null,
        ParrentId: selectedRow.ParrantId || null,
        nCompanyID: selectedRow.nCompanyID || null,
        nMenuID: selectedRow.nMenuID || null,
        nPostTypeID: selectedRow.nPostTypeID || null,
        nProjectID: selectedRow.nProjectID || null,
        status: selectedRow.status || 0,
        clientOrder: selectedRow.clientOrder || Date.now(),
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
        clientOrder: Date.now(),
      });
    }
  }, [selectedRow]);

  // تغییر مقدار فیلدهای roleData
  const handleChange = (field: keyof typeof roleData, value: string | boolean) => {
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
      showAlert("success", null, "ذخیره شد", "نقش با موفقیت ذخیره شد.");
      return true;
    } catch (error) {
      console.error("خطا در ذخیره‌سازی نقش:", error);
      showAlert("error", null, "خطا", "ذخیره نقش ناموفق بود.");
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
        name="Role"
        type="text"
        value={roleData.Name}
        placeholder="Enter role name"
        onChange={(e) => handleChange("Name", e.target.value)}
        required
      />
      {/* ورودی کد نقش */}
      <DynamicInput
        name="Role Code"
        type="text"
        value={roleData.PostCode}
        placeholder="Enter role code"
        onChange={(e) => handleChange("PostCode", e.target.value)}
      />
      {/* توضیحات شغلی */}
      <CustomTextarea
        name="Job Description"
        value={roleData.Description}
        placeholder="Enter job description"
        onChange={(e) => handleChange("Description", e.target.value)}
      />
      {/* مسئولیت‌ها */}
      <CustomTextarea
        name="Responsibilities"
        value={roleData.Responsibility}
        placeholder="Enter responsibilities"
        onChange={(e) => handleChange("Responsibility", e.target.value)}
      />
      {/* اختیارات */}
      <CustomTextarea
        name="Authorities"
        value={roleData.Authorization}
        placeholder="Enter authorities"
        onChange={(e) => handleChange("Authorization", e.target.value)}
      />
      {/* شایستگی‌ها */}
      <CustomTextarea
        name="Competencies"
        value={roleData.Competencies}
        placeholder="Enter competencies"
        onChange={(e) => handleChange("Competencies", e.target.value)}
      />
      {/* سطح */}
      <DynamicInput
        name="Grade"
        type="text"
        value={roleData.Grade}
        placeholder="Enter grade"
        onChange={(e) => handleChange("Grade", e.target.value)}
      />
      {/* نوع */}
      <DynamicInput
        name="Type"
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
          rightLabel="Static Post"
        />
      </div>
    </TwoColumnLayout>
  );
});

export default Role;
