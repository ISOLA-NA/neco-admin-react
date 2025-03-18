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

// تعریف اینترفیس RoleHandle
export interface RoleHandle {
  save: () => Promise<void>;
  checkNameFilled: () => boolean;
}

interface RoleProps {
  selectedRow: any;
}

const Role = forwardRef<RoleHandle, RoleProps>(({ selectedRow }, ref) => {
  const { handleSaveRole } = useAddEditDelete(); // دسترسی به متد context
  const [roleData, setRoleData] = useState({
    ID: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
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
    // افزودن فیلدهای اضافی
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
    // فیلد ترتیب درج در سطح فرانت‌اند
    clientOrder: Date.now(),
  });

  // هنگام تغییر selectedRow: اگر رکورد انتخاب شده وجود دارد، از مقدار clientOrder آن استفاده شود؛ در غیر این صورت مقدار جدید تخصیص یابد.
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
        // افزودن فیلدهای اضافی
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
        // در حالت ویرایش، اگر clientOrder موجود است از آن استفاده شود؛ در غیر این صورت مقدار جدید اختصاص یابد
        clientOrder: selectedRow.clientOrder || Date.now(),
      });
    } else {
      // در حالت درج، مقدار clientOrder به صورت جدید تنظیم می‌شود
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

  const save = async () => {
    try {
      console.log("داده‌های ذخیره‌شده نقش:", roleData); // برای دیباگ
      // در اینجا roleData شامل فیلد clientOrder است
      await handleSaveRole(roleData);
      showAlert("success", null, "ذخیره شد", "نقش با موفقیت ذخیره شد.");
    } catch (error) {
      console.error("خطا در ذخیره‌سازی نقش:", error);
      showAlert("error", null, "خطا", "ذخیره نقش ناموفق بود.");
    }
  };

  // متد اعتبارسنجی که بررسی می‌کند نام خالی نباشد
  const checkNameFilled = () => {
    if (roleData.Name.trim().length === 0) {
      return false;
    }
    return true;
  };

  // expose the save and checkNameFilled methods to parent via ref
  useImperativeHandle(ref, () => ({
    save,
    checkNameFilled,
  }));

  return (
    <TwoColumnLayout>
      {/* Role */}
      <DynamicInput
        name="Role"
        type="text"
        value={roleData.Name}
        placeholder=""
        onChange={(e) => handleChange("Name", e.target.value)}
        required
      />

      {/* Role Code */}
      <DynamicInput
        name="Role Code"
        type="text"
        value={roleData.PostCode}
        placeholder=""
        onChange={(e) => handleChange("PostCode", e.target.value)}
      />

      {/* Job Description */}
      <CustomTextarea
        name="Job Description"
        value={roleData.Description}
        placeholder=""
        onChange={(e) => handleChange("Description", e.target.value)}
        className="-mt-5"
      />

      {/* Responsibilities */}
      <CustomTextarea
        name="Responsibilities"
        value={roleData.Responsibility}
        placeholder=""
        onChange={(e) => handleChange("Responsibility", e.target.value)}
        className="-mt-5"
      />

      {/* Authorities */}
      <CustomTextarea
        name="Authorities"
        value={roleData.Authorization}
        placeholder=""
        onChange={(e) => handleChange("Authorization", e.target.value)}
        className="-mt-5"
      />

      {/* Competencies */}
      <CustomTextarea
        name="Competencies"
        value={roleData.Competencies}
        placeholder=""
        onChange={(e) => handleChange("Competencies", e.target.value)}
        className="-mt-5"
      />

      {/* Grade */}
      <DynamicInput
        name="Grade"
        type="text"
        value={roleData.Grade}
        placeholder=""
        onChange={(e) => handleChange("Grade", e.target.value)}
        className="-mt-5"
      />

      {/* Type */}
      <DynamicInput
        name="Type"
        type="text"
        value={roleData.Type}
        placeholder="Type"
        onChange={(e) => handleChange("Type", e.target.value)}
        className="-mt-5"
      />

      {/* Static Post */}
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
