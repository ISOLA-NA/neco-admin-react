// src/components/General/ProgramType.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";

interface ApprovalFlowProps {
  selectedRow: any;
}

const ProgramType: React.FC<ApprovalFlowProps> = ({ selectedRow }) => {
  const [programTemplateData, setApprovalFlowData] = useState<{
    ID: string | number;
    Name: string;
    Description: string;
  }>({
    ID: "",
    Name: "",
    Description: "",
  });

  useEffect(() => {
    if (selectedRow) {
      setApprovalFlowData({
        ID: selectedRow.ID || "",
        Name: selectedRow.Name || "",
        Description: selectedRow.Description || "",
      });
    } else {
      setApprovalFlowData({
        ID: "",
        Name: "",
        Description: "",
      });
    }
  }, [selectedRow]);

  const handleChange = (
    field: keyof typeof programTemplateData,
    value: string | boolean | (string | number)[]
  ) => {
    setApprovalFlowData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <TwoColumnLayout>
      {/* Approval Flow Name Input */}
      <DynamicInput
        name="Program Name"
        type="text" // اصلاح نوع به "text"
        value={programTemplateData.Name}
        placeholder=""
        onChange={(e) => handleChange("Name", e.target.value)} // اصلاح فیلد به "Name"
        required={true}
      />
      <DynamicInput
        name="Description"
        type="text"
        value={programTemplateData.Description}
        placeholder=""
        onChange={(e) => handleChange("Description", e.target.value)}
        required={true}
      />
    </TwoColumnLayout>
  );
};

export default ProgramType;
