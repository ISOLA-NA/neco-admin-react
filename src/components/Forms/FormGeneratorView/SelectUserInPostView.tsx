// src/components/SelectUserInPostView.tsx
import React, { useState, useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useApi } from "../../../context/ApiContext";
import { PostType, User } from "../../../services/api.services";

interface SelectUserInPostViewProps {
  data?: {
    metaType1?: string;
    DisplayName?: string;
    PersianName?: string;
  };
  isFaMode?: boolean;
}

const SelectUserInPostView: React.FC<SelectUserInPostViewProps> = ({
  data,
  isFaMode = false,
}) => {
  const { getAllUsers, getAllPostTypes } = useApi();

  const [users, setUsers] = useState<User[]>([]);
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [selectedName, setSelectedName] = useState<string>("");

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

  useEffect(() => {
    if (data?.metaType1 && postTypes.length > 0) {
      const found = postTypes.find(
        (pt) => String(pt.ID) === String(data.metaType1)
      );
      setSelectedName(found ? found.Name : "");
    } else {
      setSelectedName("");
    }
  }, [data, postTypes]);

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || ""
    : data?.DisplayName || data?.PersianName || "";

  return (
    <div className="w-full flex flex-col gap-3" dir={isFaMode ? "rtl" : "ltr"}>
      {label && <p className="text-xs font-semibold text-gray-800">{label}</p>}
      <DynamicSelector
        label={selectedName}
        options={users.map((u) => ({
          value: String(u.ID),
          label: u.Family,
        }))}
        selectedValue={data?.metaType1 || ""}
        onChange={() => {}}
        onButtonClick={() => {}}
        disabled={false}
      />
    </div>
  );
};

export default SelectUserInPostView;
