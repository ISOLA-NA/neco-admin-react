// src/components/General/Role.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import DynamicSwitcher from "../utilities/DynamicSwitcher";

interface RoleProps {
  selectedRow: any;
}

const Role: React.FC<RoleProps> = ({ selectedRow }) => {
  const [roleData, setRoleData] = useState({
    ID: "",
    Role: "",
    RoleCode: "",
    JobDescription: "",
    Responsibilities: "",
    Authorities: "",
    Competencies: "",
    Grade: "",
    Type: "",
    StaticPost: false,
  });

  useEffect(() => {
    console.log("Selected Row Data:", selectedRow); // برای دیباگ
    if (selectedRow) {
      setRoleData({
        ID: selectedRow.ID || "",
        Role: selectedRow.Name || "",
        RoleCode: selectedRow.PostCode || "",
        JobDescription: selectedRow.Description || "",
        Responsibilities: selectedRow.Responsibility || "",
        Authorities: selectedRow.Authorization || "",
        Competencies: selectedRow.Competencies || "",
        Grade: selectedRow.Grade || "",
        Type: selectedRow.Type || "",
        StaticPost: selectedRow.isStaticPost || false,
      });
    } else {
      setRoleData({
        ID: "",
        Role: "",
        RoleCode: "",
        JobDescription: "",
        Responsibilities: "",
        Authorities: "",
        Competencies: "",
        Grade: "",
        Type: "",
        StaticPost: false,
      });
    }
  }, [selectedRow]);

  const handleChange = (field: keyof typeof roleData, value: string | boolean) => {
    setRoleData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <TwoColumnLayout>
      {/* Role */}
      <DynamicInput
        name="Role"
        type="text"
        value={roleData.Role}
        placeholder=""
        onChange={(e) => handleChange("Role", e.target.value)}
      />

      {/* Role Code */}
      <DynamicInput
        name="Role Code"
        type="text"
        value={roleData.RoleCode}
        placeholder=""
        onChange={(e) => handleChange("RoleCode", e.target.value)}
      />

      {/* Job Description */}
      <CustomTextarea
        id="JobDescription"
        name="Job Description"
        value={roleData.JobDescription}
        placeholder=""
        onChange={(e) => handleChange("JobDescription", e.target.value)}
      />

      {/* Responsibilities */}
      <CustomTextarea
        id="Responsibilities"
        name="Responsibilities"
        value={roleData.Responsibilities}
        placeholder=""
        onChange={(e) => handleChange("Responsibilities", e.target.value)}
      />

      {/* Authorities */}
      <CustomTextarea
        id="Authorities"
        name="Authorities"
        value={roleData.Authorities}
        placeholder=""
        onChange={(e) => handleChange("Authorities", e.target.value)}
      />

      {/* Competencies */}
      <CustomTextarea
        id="Competencies"
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
          isChecked={roleData.StaticPost}
          onChange={() => handleChange("StaticPost", !roleData.StaticPost)}
          leftLabel=""
          rightLabel="Static Post"
        />
      </div>
    </TwoColumnLayout>
  );
};

export default Role;
