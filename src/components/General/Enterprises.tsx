// src/components/General/EnterPrise.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";

interface RoleGroupsProps {
  selectedRow: any;
}

const EnterPrise: React.FC<RoleGroupsProps> = ({ selectedRow }) => {
  const [groupData, setGroupData] = useState<{
    ID: string | number;
    Name: string;
    Describtion: string;
    Type: string;
    Information: string;
    GroupMembers: (string | number)[];
  }>({
    ID: "",
    Name: "",
    Describtion: "",
    Type: "",
    Information: "",
    GroupMembers: [],
  });

  useEffect(() => {
    if (selectedRow) {
      const selectedMembers = selectedRow.GroupMembers || [];

      setGroupData({
        ID: selectedRow.ID || "",
        Name: selectedRow.Name || "",
        Describtion: selectedRow.Describtion || "",
        Type: selectedRow.Type || "",
        Information: selectedRow.Information || false,
        GroupMembers: selectedMembers,
      });
    } else {
      setGroupData({
        ID: "",
        Name: "",
        Describtion: "",
        Type: "",
        Information: "",
        GroupMembers: [],
      });
    }
  }, [selectedRow]);

  const handleChange = (
    field: keyof typeof groupData,
    value: string | string | (string | number)[]
  ) => {
    setGroupData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <TwoColumnLayout>
      <DynamicInput
        name="EnterPrise"
        type="text"
        value={groupData.Name}
        placeholder=""
        onChange={(e) => handleChange("Name", e.target.value)}
      />

      <DynamicInput
        name="Description"
        type="text"
        value={groupData.Describtion}
        placeholder=""
        onChange={(e) => handleChange("Describtion", e.target.value)}
      />
      <DynamicInput
        name="Type"
        type="text"
        value={groupData.Type}
        placeholder=""
        onChange={(e) => handleChange("Type", e.target.value)}
      />

      <DynamicInput
        name="Information"
        type="text"
        value={groupData.Information}
        placeholder=""
        onChange={(e) => handleChange("Information", e.target.value)}
      />
    </TwoColumnLayout>
  );
};

export default EnterPrise;
