import React, { useEffect, useState } from "react";
import DynamicSelector from "../../utilities/DynamicSelector"; // مسیر صحیح ایمپورت را مطابق پروژه تنظیم کنید
import { useApi } from "../../../context/ApiContext";

interface AdvanceWfViewProps {
  data?: {
    DisplayName?: string;
  };
}

const AdvanceWfView: React.FC<AdvanceWfViewProps> = ({ data }) => {
  const { getAllRoles } = useApi();
  const [roles, setRoles] = useState<Array<{ ID: string; Name: string }>>([]);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getAllRoles();
        // فیلتر کردن نقش‌هایی که فیلد Name معتبر دارند
        const validRoles = res.filter((role: any) => role.Name && role.Name.trim() !== "");
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

  // تبدیل نقش‌ها به گزینه‌های مورد نیاز DynamicSelector
  const roleOptions = roles.map((role) => ({
    value: role.ID, // استفاده از ID به عنوان value (در صورت نیاز می‌توانید Name هم قرار دهید)
    label: role.Name,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    console.log("Selected Role ID:", e.target.value);
  };

  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
      <DynamicSelector
        name="roles"
        label={data?.DisplayName ? data.DisplayName : "Select Role"}
        options={roleOptions}
        selectedValue={selectedRole}
        onChange={handleChange}
      />
    </div>
  );
};

export default AdvanceWfView;
