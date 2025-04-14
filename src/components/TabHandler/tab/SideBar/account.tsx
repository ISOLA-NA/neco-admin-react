// File: Account.tsx

import React, { useState, useEffect } from "react";
import { FaLock } from "react-icons/fa";
import { IoIosRefresh } from "react-icons/io";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { RiLogoutCircleLine } from "react-icons/ri";

// استفاده از getIdByUserToken از api.servicesFile
import projectServiceFile from "../../../../services/api.servicesFile";
// استفاده از postUser و editProfileUser از projectService
import projectService from "../../../../services/api.services";

// کامپوننت FileUploadHandler جهت دانلود و نمایش عکس کاربر
import FileUploadHandler from "../../../../services/FileUploadHandler";

// اگر اینترفیس در فایل دیگری تعریف شده است، آن را import کنید:
// import { EditProfileUserInterface } from "../../../../types/UserTypes";

// در اینجا اینترفیس EditProfileUserInterface را تعریف می‌کنیم (در صورت نیاز)
export interface EditProfileUserInterface {
  IsVisible: boolean;
  LastModified: string | null;
  ID: string;
  ModifiedById: null;
  Username: string;
  Password: string;
  Status: number;
  MaxWrongPass: number;
  Name: string;
  Family: string;
  Email: string;
  Website: string;
  Mobile: string;
  CreateDate: null;
  LastLoginTime: null;
  UserImageId: string;
  TTKK: string;
  userType: number;
  Code: string;
}

// اینترفیس نمونه برای UserToken
interface UserToken {
  ID: string;
  Name: string;
  Username: string;
  Family: string;
  Email: string;
  Website: string;
  Mobile: string;
  ModifiedById: string;
  CreateDate: string;
  LastLoginTime: string;
  UserImageId: string;
  Code?: string;
  // در صورت نیاز، اطلاعات بیشتری مانند RepoInfo و غیره...
}

const Account: React.FC = () => {
  // در ابتدا از یک مقدار پیش‌فرض خالی برای ID استفاده می‌کنیم تا بعد از دریافت از API مقداردهی شود.
  const [updated, setUpdated] = useState({
    IsVisible: true,
    LastModified: null, 
    ID: "", // مقدار پیش‌فرض خالی، تا بعد از دریافت از API مقداردهی شود.
    ModifiedById: null,
    Username: "",
    Password: "",
    Status: 0,
    MaxWrongPass: 6,
    Name: "",
    Family: "",
    Email: "",
    Website: "",
    Mobile: "",
    CreateDate: null,
    LastLoginTime: null,
    UserImageId: "",
    TTKK: "",
    userType: 0,
    Code: "" // مقدار اولیه Code به عنوان رشته خالی
  });

  // state برای ذخیره اطلاعات کاربر دریافتی
  const [userInfo, setUserInfo] = useState<UserToken | null>(null);

  // state برای URL عکس پروفایل
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // state مربوط به بخش Right Side (برای تب‌بندی)
  const [activeRibbon, setActiveRibbon] = useState("Home");
  const ribbonOptions = ["Home", "Dashboard", "Profile"];

  // state برای ذخیره نام‌های دریافتی از postUser
  const [userNames, setUserNames] = useState<string[]>([]);

  // متدهای دکمه‌ها
  const handleChangePassword = () => {
    alert("Change Password clicked!");
  };

  const handleSwitchAccount = () => {
    alert("Switch Account clicked!");
  };

  const handleSignOut = () => {
    alert("Sign Out clicked!");
  };

  // دریافت اطلاعات کاربر از API با استفاده از getIdByUserToken
  useEffect(() => {
    const fetchUserTokenId = async () => {
      try {
        const res = await projectServiceFile.getIdByUserToken();
        console.log("Response Data from getIdByUserToken:", res.data);
        // اگر res.data آرایه باشد، عنصر اول را در نظر بگیرید؛ در غیر این صورت از res.data استفاده کنید.
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (data) {
          // مقدار Code و همچنین ID به صورت مستقیم از داده دریافتی تنظیم می‌شود
          setUpdated((prev) => ({
            ...prev,
            ID: data.ID, // به روزرسانی فیلد ID
            Username: data.Username,
            Name: data.Name,
            Mobile: data.Mobile,
            Family: data.Family,
            Website: data.Website,
            Email: data.Email,
            UserImageId: data.UserImageId,
            Code: data.Code // مقدار Code از API دریافت می‌شود
          }));
          setUserInfo(data);
        }
      } catch (error) {
        console.error("Error fetching user token ID:", error);
      }
    };

    fetchUserTokenId();
  }, []);

  // دریافت نام‌های کاربری از API با استفاده از postUser (مثالی برای نمایش نام‌ها)
  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        const res: any = await projectService.postUser();
        console.log("Response Data from postUser:", res);
        if (res && Array.isArray(res)) {
          const names = res.map((user: any) => user.Name);
          setUserNames(names);
        } else {
          console.warn("postUser did not return an array:", res);
        }
      } catch (error) {
        console.error("Error fetching user names:", error);
      }
    };

    fetchUserNames();
  }, []);

  // تابع ویرایش حساب کاربری با استفاده از API editProfileUser
  const editAccount = () => {
    const regexMobile = /^(?:09\d{9})?$/;
    const regexEmail = /^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexMobile.test(updated.Mobile)) {
      alert("شماره تلفن وارد شده صحیح نیست!");
      return;
    }
    if (!regexEmail.test(updated.Email)) {
      alert("ایمیل وارد شده صحیح نیست!");
      return;
    }
    
    // ساخت payload آپدیت به همراه منطق Code و ID از اطلاعات دریافتی (userInfo)
    const updateUser: EditProfileUserInterface = {
      ...updated,
      // استفاده از مقدار Code و ID گرفته شده از API (در userInfo) در صورت موجود بودن.
      ID: userInfo?.ID ?? updated.ID,
      Code: userInfo?.Code ?? updated.Code ?? ""
    };

    console.log("Sending updated data:", updateUser);
    
    projectService
      .editProfileUser(updateUser)
      .then((res: any) => {
        alert("اطلاعات مورد نظر آپدیت شد");
        console.log("Response after update:", res);
      })
      .catch((err: any) => {
        console.error(err);
        alert("خطا در آپدیت اطلاعات");
      });
  };

  // هندل تغییر ورودی‌های فرم
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdated((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto mt-6 px-4">
      <h2 className="text-2xl font-bold mb-8">Account Information</h2>

      {/* استفاده از FileUploadHandler جهت دانلود عکس پروفایل */}
      <FileUploadHandler
        selectedFileId={updated.UserImageId}
        resetCounter={0}
        onReset={() => {}}
        onPreviewUrlChange={setPreviewUrl}
        hideUploader={true}
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* ستون سمت چپ: User Information */}
        <div className="w-full md:w-2/3">
          <div className="border rounded shadow p-4 h-[600px]">
            <h4 className="text-xl font-semibold mb-4">User Information</h4>

            {/* بخش آواتار و اطلاعات کاربر */}
            <div className="flex items-center gap-4 mb-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <p className="text-xs text-gray-500">Loading...</p>
                </div>
              )}
              <div>
                <p className="text-lg font-medium">
                  {userInfo ? userInfo.Name : "User Name"}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userNames.filter((uname) => uname && uname.trim() !== "").length > 0 ? (
                    userNames
                      .filter((uname) => uname && uname.trim() !== "")
                      .map((uname, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 border border-gray-200 p-2 rounded shadow"
                        >
                          <p className="text-sm text-gray-700">{uname}</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-600">Loading user names...</p>
                  )}
                </div>
              </div>
            </div>

            <hr className="my-4" />

            {/* فرم به دو ستون */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* ستون فرم سمت چپ */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Username</label>
                  <input
                    type="text"
                    name="Username"
                    value={updated.Username}
                    disabled
                    placeholder="Username"
                    className="border px-2 py-1 w-full rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1">Name</label>
                  <input
                    type="text"
                    name="Name"
                    value={updated.Name}
                    onChange={handleChange}
                    placeholder="Name"
                    className="border px-2 py-1 w-full rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1">Mobile</label>
                  <input
                    type="text"
                    name="Mobile"
                    value={updated.Mobile}
                    onChange={handleChange}
                    placeholder="Mobile"
                    className="border px-2 py-1 w-full rounded text-sm"
                  />
                </div>
              </div>
              {/* ستون فرم سمت راست */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={handleChangePassword}
                    className="flex items-center border rounded px-3 py-2 hover:bg-gray-100"
                  >
                    <FaLock size={16} />
                    <span className="ml-2">Change Password</span>
                  </button>
                  <button
                    onClick={editAccount}
                    className="flex items-center border rounded px-3 py-2 hover:bg-gray-100"
                  >
                    <IoIosRefresh size={16} />
                    <span className="ml-2">Update</span>
                  </button>
                </div>
                <div>
                  <label className="block mb-1">Last Name</label>
                  <input
                    type="text"
                    name="Family"
                    value={updated.Family}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="border px-2 py-1 w-full rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1">WebSite</label>
                  <input
                    type="text"
                    name="Website"
                    value={updated.Website}
                    onChange={handleChange}
                    placeholder="Website"
                    className="border px-2 py-1 w-full rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1">Email</label>
                  <input
                    type="text"
                    name="Email"
                    value={updated.Email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="border px-2 py-1 w-full rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* بخش باکس پایین با بردر آبی */}
            <div className="mt-6 border border-blue-500 rounded p-4">
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleSwitchAccount}
                  className="flex items-center border rounded px-3 py-2 hover:bg-gray-100"
                >
                  <HiOutlineSwitchHorizontal size={16} />
                  <span className="ml-2">Switch Account</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center border rounded px-3 py-2 hover:bg-gray-100 text-red-600"
                >
                  <RiLogoutCircleLine size={16} />
                  <span className="ml-2">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ستون سمت راست: سه باکس با ارتفاع مساوی */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 h-[600px]">
          <div className="flex-1 border rounded shadow p-4 bg-gray-200">
            <p className="font-semibold mb-2">Superintendent</p>
            <p className="text-sm text-gray-600">
              این قسمت می‌تواند اطلاعات مربوط به Superintendent را نشان دهد...
            </p>
          </div>
          <div className="flex-1 border rounded shadow p-4 bg-gray-200">
            <p className="font-semibold mb-2">Admins</p>
            <p className="text-sm text-gray-600">
              این قسمت می‌تواند اطلاعات مربوط به Adminها را نشان دهد...
            </p>
          </div>
          <div className="flex-1 border rounded shadow p-4 bg-gray-200">
            <p className="font-semibold mb-2">Change Active Ribbon</p>
            <select
              value={activeRibbon}
              onChange={(e) => setActiveRibbon(e.target.value)}
              className="border p-2 w-full rounded text-sm"
            >
              {ribbonOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
