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
  });

  useEffect(() => {
    console.log("Selected Row Data:", selectedRow); // برای دیباگ
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
      });
    }
  }, [selectedRow]);

  const handleChange = (
    field: keyof typeof roleData,
    value: string | boolean
  ) => {
    setRoleData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // متد save که توسط context فراخوانی می‌شود
  const save = async () => {
    try {
      await handleSaveRole(roleData);
      // در صورت نیاز می‌توانید عملیات دیگری نیز انجام دهید
      showAlert("success", null, "Saved", "Role saved successfully.");
    } catch (error) {
      // مدیریت خطا
      console.error("Error saving role:", error);
      showAlert("error", null, "Error", "Failed to save role.");
    }
  };

  // expose the save method to parent via ref
  useImperativeHandle(ref, () => ({
    save,
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
      />

      {/* Responsibilities */}
      <CustomTextarea
        name="Responsibilities"
        value={roleData.Responsibility}
        placeholder=""
        onChange={(e) => handleChange("Responsibility", e.target.value)}
      />

      {/* Authorities */}
      <CustomTextarea
        name="Authorities"
        value={roleData.Authorization}
        placeholder=""
        onChange={(e) => handleChange("Authorization", e.target.value)}
      />

      {/* Competencies */}
      <CustomTextarea
        name="Competencies"
        value={roleData.Competencies}
        placeholder=""
        onChange={(e) => handleChange("Competencies", e.target.value)}
      />

      {/* Grade */}
      <DynamicInput
        name="Grade"
        type="text"
        value={roleData.Grade}
        placeholder=""
        onChange={(e) => handleChange("Grade", e.target.value)}
      />

      {/* Type */}
      <DynamicInput
        name="Type"
        type="text"
        value={roleData.Type}
        placeholder="Type"
        onChange={(e) => handleChange("Type", e.target.value)}
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
