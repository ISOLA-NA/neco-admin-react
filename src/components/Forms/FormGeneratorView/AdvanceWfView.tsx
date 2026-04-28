import React, { useEffect, useState } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useApi } from "../../../context/ApiContext";

interface AdvanceWfViewProps {
  data?: {
    DisplayName?: string;
    PersianName?: string;
  };
  isFaMode?: boolean;
}

const AdvanceWfView: React.FC<AdvanceWfViewProps> = ({
  data,
  isFaMode = false,
}) => {
  const { getAllRoles } = useApi();
  const [roles, setRoles] = useState<Array<{ ID: string; Name: string }>>([]);
  const [selectedRole, setSelectedRole] = useState("");

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || "انتخاب نقش"
    : data?.DisplayName || data?.PersianName || "Select Role";

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getAllRoles();
        const validRoles = res.filter(
          (role: any) => role.Name && role.Name.trim() !== ""
        );
        setRoles(
          validRoles.map((role: any) => ({
            ID: role.ID,
            Name: role.Name,
          }))
        );
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, [getAllRoles]);

  const roleOptions = roles.map((role) => ({
    value: role.ID,
    label: role.Name,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    console.log("Selected Role ID:", e.target.value);
  };

  return (
    <div
      dir={isFaMode ? "rtl" : "ltr"}
    >
      <DynamicSelector
        name="roles"
        label={label}
        options={roleOptions}
        selectedValue={selectedRole}
        onChange={handleChange}
      />
    </div>
  );
};

export default AdvanceWfView;
