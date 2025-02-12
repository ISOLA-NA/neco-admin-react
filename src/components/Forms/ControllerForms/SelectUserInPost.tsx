// src/components/SelectUserInPost.tsx
import React, { useState, useEffect } from "react";
import { useApi } from "../../../context/ApiContext"; // مسیر مناسب به Context API را بررسی کنید
import { Role } from "../../../services/api.services"; // مسیر مناسب برای Role را بررسی کنید

interface SelectUserInPostProps {
  /**
   * onMetaChange: تابعی برای ارسال مقدار انتخاب شده به والد.
   * در این کامپوننت، metaType1 مقدار انتخاب شده (nPostTypeID نقش) خواهد بود.
   */
  onMetaChange: (meta: { metaType1: string }) => void;
  /**
   * data: (اختیاری) داده اولیه جهت مقداردهی در حالت ویرایش.
   * اگر موجود باشد، مقدار اولیه از data.metaType1 گرفته می‌شود.
   */
  data?: {
    metaType1?: string;
  };
  /**
   * isDisable: (اختیاری) اگر true باشد، سلکت غیرقابل تغییر می‌شود.
   */
  isDisable?: boolean;
}

const SelectUserInPost: React.FC<SelectUserInPostProps> = ({
  onMetaChange,
  data,
  isDisable = false,
}) => {
  const { getAllRoles } = useApi();
  const [roles, setRoles] = useState<Role[]>([]);
  // مقدار اولیه از data گرفته می‌شود (اگر موجود باشد)
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    data?.metaType1 || ""
  );

  // دریافت نقش‌ها (Roles) از API با استفاده از متد getAllRoles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getAllRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, [getAllRoles]);

  // هرگاه مقدار انتخاب شده تغییر کند، آن را به والد ارسال می‌کنیم.
  useEffect(() => {
    onMetaChange({ metaType1: selectedRoleId });
  }, [selectedRoleId, onMetaChange]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoleId(e.target.value);
  };

  return (
    <div className="my-4">
      <label className="block font-medium mb-2">Select Post Types</label>
      <select
        value={selectedRoleId}
        onChange={handleChange}
        disabled={isDisable}
        className="w-full p-2 border rounded"
      >
        <option value="">-- Select a role --</option>
        {roles.map((role) => (
          <option key={role.ID} value={role.nPostTypeID || ""}>
            {role.Name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectUserInPost;
