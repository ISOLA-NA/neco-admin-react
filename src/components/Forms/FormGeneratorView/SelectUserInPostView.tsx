// src/components/SelectUserInPostView.tsx

import React, { useState, useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useApi } from "../../../context/ApiContext";
import { PostType, User } from "../../../services/api.services";

interface SelectUserInPostViewProps {
  data?: {
    metaType1?: string;      // ID انتخاب‌شده
    DisplayName?: string;    // در صورت نیاز
  };
}

const SelectUserInPostView: React.FC<SelectUserInPostViewProps> = ({ data }) => {
  const { getAllUsers, getAllPostTypes } = useApi();

  // استیت برای ذخیره لیست کاربران
  const [users, setUsers] = useState<User[]>([]);
  // استیت برای ذخیره لیست PostTypes
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  // استیت برای نمایش نام انتخاب‌شده در لیبل
  const [selectedName, setSelectedName] = useState<string>("");

  // گرفتن لیست کاربران
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [getAllUsers]);

  // گرفتن لیست PostTypes
  useEffect(() => {
    const fetchPostTypes = async () => {
      try {
        const postTypesData = await getAllPostTypes();
        setPostTypes(Array.isArray(postTypesData) ? postTypesData : []);
      } catch (error) {
        console.error("Error fetching post types:", error);
      }
    };
    fetchPostTypes();
  }, [getAllPostTypes]);

  // هروقت metaType1 عوض شد یا لیست postTypes تغییر کرد، برچسب را به‌روزرسانی کن
  useEffect(() => {
    if (data?.metaType1 && postTypes.length > 0) {
      const found = postTypes.find(pt => String(pt.ID) === String(data.metaType1));
      setSelectedName(found ? found.Name : "");
    } else {
      setSelectedName("");
    }
  }, [data, postTypes]);

  return (
    <div className="w-full">
      <DynamicSelector
        // در اینجا برچسب از postTypes آمده است:
        label={selectedName}  
        // در اینجا آپشن‌ها از users آمده است:
        options={users.map(u => ({
          value: String(u.ID),
          label: u.Family,  // نمایش نام خانوادگی کاربر
        }))}
        // مقدار انتخابی فعلی
        selectedValue={data?.metaType1 || ""}
        // می‌توانید تابع onChange را در صورت نیاز پیاده‌سازی کنید
        onChange={() => {}}
        onButtonClick={() => {}}
        disabled={false}
      />
    </div>
  );
};

export default SelectUserInPostView;
