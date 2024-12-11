// src/components/General/User.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import DynamicSelector from "../utilities/DynamicSelector";
import ImageUploader from "../utilities/ImageUploader";

interface UserProps {
  selectedRow: any;
}

const User: React.FC<UserProps> = ({ selectedRow }) => {
  const [userData, setUserData] = useState({
    ID: "",
    Name: "",
    LastName: "",
    FirstName: "",
    Email: "",
    Mobile: "",
    Password: "",
    ConfirmPassword: "",
    NewPassword: "",
    Website: "",
    UserType: "0",
    UserImage: null as File | null,
  });

  useEffect(() => {
    if (selectedRow) {
      setUserData({
        ID: selectedRow.ID || "",
        Name: selectedRow.Name || "",
        LastName: selectedRow.LastName || "",
        FirstName: selectedRow.FirstName || "",
        Email: selectedRow.Email || "",
        Mobile: selectedRow.Mobile || "",
        Password: "", // در حالت ویرایش، رمز عبور خالی است
        ConfirmPassword: "", // در حالت ویرایش، تایید رمز عبور خالی است
        NewPassword: "", // فیلد جدید برای تغییر رمز عبور
        Website: selectedRow.Website || "",
        UserType:
          selectedRow.UserType !== undefined
            ? String(selectedRow.UserType)
            : "0",
        UserImage: null, // تصویر باید دوباره آپلود شود
      });
    } else {
      setUserData({
        ID: "",
        Name: "",
        LastName: "",
        FirstName: "",
        Email: "",
        Mobile: "",
        Password: "",
        ConfirmPassword: "",
        NewPassword: "",
        Website: "",
        UserType: "0",
        UserImage: null,
      });
    }
  }, [selectedRow]);

  const handleChange = (field: keyof typeof userData, value: string) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (file: File) => {
    setUserData((prev) => ({
      ...prev,
      UserImage: file,
    }));
  };

  const userTypes = [
    { value: "0", label: "Admin" },
    { value: "1", label: "Sysadmin" },
    { value: "2", label: "Employee" },
  ];

  return (
    <TwoColumnLayout>
      {/* ID */}
      <DynamicInput
        name="ID"
        type="text"
        value={userData.ID}
        placeholder=""
        onChange={(e) => handleChange("ID", e.target.value)}
      />

      {/* Name */}
      <DynamicInput
        name="Name"
        type="text"
        value={userData.Name}
        placeholder=""
        onChange={(e) => handleChange("Name", e.target.value)}
      />

      {/* Last Name */}
      <DynamicInput
        name="LastName"
        type="text"
        value={userData.LastName}
        placeholder=""
        onChange={(e) => handleChange("LastName", e.target.value)}
      />

      {/* First Name */}
      <DynamicInput
        name="FirstName"
        type="text"
        value={userData.FirstName}
        placeholder=""
        onChange={(e) => handleChange("FirstName", e.target.value)}
      />

      {/* Email */}
      <DynamicInput
        name="Email"
        type="text"
        value={userData.Email}
        placeholder=""
        onChange={(e) => handleChange("Email", e.target.value)}
      />

      {/* Mobile */}
      <DynamicInput
        name="Mobile"
        type="number"
        value={userData.Mobile}
        placeholder=""
        onChange={(e) => handleChange("Mobile", e.target.value)}
      />

      {/* Password و Confirm Password فقط در حالت افزودن نمایش داده می‌شوند */}
      {!selectedRow && (
        <>
          {/* Password */}
          <DynamicInput
            name="Password"
            type="password"
            value={userData.Password}
            placeholder=""
            onChange={(e) => handleChange("Password", e.target.value)}
          />

          {/* Confirm Password */}
          <DynamicInput
            name="ConfirmPassword"
            type="password"
            value={userData.ConfirmPassword}
            placeholder=""
            onChange={(e) => handleChange("ConfirmPassword", e.target.value)}
          />
        </>
      )}

      {/* New Password و دکمه Change Password فقط در حالت ویرایش نمایش داده می‌شوند */}
      {selectedRow && (
        <>
          {/* New Password */}
          <DynamicInput
            name="NewPassword"
            type="password"
            value={userData.NewPassword}
            placeholder=""
            onChange={(e) => handleChange("NewPassword", e.target.value)}
          />

          {/* دکمه Change Password */}
          <div className="mb-4">
            <button
              type="button"
              className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold rounded-md shadow-md hover:from-pink-600 hover:to-blue-600 transition-colors duration-300"
              onClick={() => {
                // عملکرد دکمه تغییر رمز عبور را در اینجا تعریف کنید
                console.log(
                  "Change Password clicked with new password:",
                  userData.NewPassword
                );
              }}
            >
              Change Password
            </button>
          </div>
        </>
      )}

      {/* Website */}
      <DynamicInput
        name="Website"
        type="text"
        value={userData.Website}
        placeholder=""
        onChange={(e) => handleChange("Website", e.target.value)}
      />

      {/* User Type */}
      <DynamicSelector
        options={userTypes}
        selectedValue={userData.UserType}
        onChange={(e) => handleChange("UserType", e.target.value)}
        label=""
      />

      {/* Image Uploader */}
      <ImageUploader onUpload={handleImageUpload} />
    </TwoColumnLayout>
  );
};

export default User;
