import React, { useState, useEffect, useLayoutEffect } from "react";
import { FaLock, FaRegUserCircle } from "react-icons/fa";
import { IoIosRefresh } from "react-icons/io";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useTranslation } from "react-i18next";

import projectServiceFile from "../../../../services/api.servicesFile";
import projectService from "../../../../services/api.services";
import FileUploadHandler from "../../../../services/FileUploadHandler";

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
}

// تشخیص جهت RTL
const detectRTL = (): boolean => {
  if (typeof window === "undefined") return false;
  const rootAttr = document.documentElement.getAttribute("dir");
  const bodyAttr = document.body.getAttribute("dir");
  const attrDir = (rootAttr || bodyAttr || "").toLowerCase();
  if (attrDir) return attrDir === "rtl";
  return (
    window.getComputedStyle(document.documentElement).direction === "rtl" ||
    window.getComputedStyle(document.body).direction === "rtl"
  );
};

const Account: React.FC = () => {
  const { t } = useTranslation();

  const [isRTL, setIsRTL] = useState<boolean>(detectRTL);

  useLayoutEffect(() => {
    const observer = new MutationObserver(() => {
      setIsRTL(detectRTL());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });
    return () => observer.disconnect();
  }, []);

  const [updated, setUpdated] = useState({
    IsVisible: true,
    LastModified: null,
    ID: "",
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
    Code: "",
  });

  const [userInfo, setUserInfo] = useState<UserToken | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeRibbon, setActiveRibbon] = useState("Home");
  const ribbonOptions = ["Home", "Dashboard", "Profile"];
  const [userNames, setUserNames] = useState<string[]>([]);

  const handleChangePassword = () => {
    alert("Change Password clicked!");
  };

  const handleSwitchAccount = () => {
    alert("Switch Account clicked!");
  };

  const handleSignOut = () => {
    alert("Sign Out clicked!");
  };

  useEffect(() => {
    const fetchUserTokenId = async () => {
      try {
        const res = await projectServiceFile.getIdByUserToken();
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (data) {
          setUpdated((prev) => ({
            ...prev,
            ID: data.ID,
            Username: data.Username,
            Name: data.Name,
            Mobile: data.Mobile,
            Family: data.Family,
            Website: data.Website,
            Email: data.Email,
            UserImageId: data.UserImageId,
            Code: data.Code,
          }));
          setUserInfo(data);
        }
      } catch (error) {
        console.error("Error fetching user token ID:", error);
      }
    };
    fetchUserTokenId();
  }, []);

  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        const res: any = await projectService.postUser();
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

    const updateUser: EditProfileUserInterface = {
      ...updated,
      ID: userInfo?.ID ?? updated.ID,
      Code: userInfo?.Code ?? updated.Code ?? "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdated((prev) => ({ ...prev, [name]: value }));
  };

  const roleTags = userNames.filter((uname) => uname && uname.trim() !== "");

  return (
    <div className="container mx-auto mt-3 mb-3 px-4">
      <h2 className="text-2xl font-bold mb-4">
        {t("account.Titles.AccountInformation")}
      </h2>

      <FileUploadHandler
        selectedFileId={updated.UserImageId}
        resetCounter={0}
        onReset={() => {}}
        onPreviewUrlChange={setPreviewUrl}
        hideUploader={true}
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* ستون چپ: اطلاعات کاربر */}
        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-md shadow p-4 h-[600px]">
            <h2 className="text-lg font-bold border-b pb-2 mb-3">
              {t("account.Titles.UserInformation")}
            </h2>

            {/* بخش آواتار + نام + نقش‌ها */}
            <div className="flex items-start gap-4 mb-3 pb-3 border-b">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <FaRegUserCircle size={40} className="text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-base font-bold">
                  {userInfo
                    ? `${userInfo.Name} ${userInfo.Family}`
                    : t("account.Placeholders.UserName")}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {roleTags.length > 0
                    ? roleTags.map((uname) => `${uname} ؛`).join(" ")
                    : t("account.Messages.LoadingUserNames")}
                </p>
              </div>
            </div>

            {/* فرم — گرید واحد دو‌ستونه تا ردیف‌ها دقیقاً هم‌تراز باشند */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {/* ردیف ۱: Username | دکمه‌ها */}
              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  {t("account.Fields.Username")}
                </label>
                <input
                  type="text"
                  name="Username"
                  value={updated.Username}
                  disabled
                  placeholder={t("account.Placeholders.Username")}
                  className="border-b border-gray-300 bg-transparent outline-none w-full text-sm pb-1"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600 invisible">
                  .
                </label>
                <div className="flex items-center justify-end gap-6 pb-1">
                  <button
                    onClick={handleChangePassword}
                    className="flex items-center gap-1 text-sm hover:opacity-70"
                  >
                    <FaLock size={14} />
                    <span>{t("account.Buttons.ChangePassword")}</span>
                  </button>
                  <button
                    onClick={editAccount}
                    className="flex items-center gap-1 text-sm hover:opacity-70"
                  >
                    <IoIosRefresh size={16} />
                    <span>{t("account.Buttons.Update")}</span>
                  </button>
                </div>
              </div>

              {/* ردیف ۲: Name | Last Name */}
              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  {t("account.Fields.Name")}
                </label>
                <input
                  type="text"
                  name="Name"
                  value={updated.Name}
                  onChange={handleChange}
                  placeholder={t("account.Placeholders.Name")}
                  className="border-b border-gray-300 bg-transparent outline-none w-full text-sm pb-1"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  {t("account.Fields.LastName")}
                </label>
                <input
                  type="text"
                  name="Family"
                  value={updated.Family}
                  onChange={handleChange}
                  placeholder={t("account.Placeholders.LastName")}
                  className="border-b border-gray-300 bg-transparent outline-none w-full text-sm pb-1"
                />
              </div>

              {/* ردیف ۳: Mobile | Website */}
              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  {t("account.Fields.Mobile")}
                </label>
                <input
                  type="text"
                  name="Mobile"
                  value={updated.Mobile}
                  onChange={handleChange}
                  placeholder="Mobile"
                  className="border-b border-gray-300 bg-transparent outline-none w-full text-sm pb-1"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  {t("account.Fields.Website")}
                </label>
                <input
                  type="text"
                  name="Website"
                  value={updated.Website}
                  onChange={handleChange}
                  placeholder={t("account.Placeholders.Website")}
                  className="border-b border-gray-300 bg-transparent outline-none w-full text-sm pb-1"
                />
              </div>

              {/* ردیف ۴: (خالی) | Email */}
              <div className="hidden md:block" />
              <div>
                <label className="block mb-1 text-sm text-gray-600">
                  {t("account.Fields.Email")}
                </label>
                <input
                  type="text"
                  name="Email"
                  value={updated.Email}
                  onChange={handleChange}
                  placeholder={t("account.Placeholders.Email")}
                  className="border-b border-gray-300 bg-transparent outline-none w-full text-sm pb-1"
                />
              </div>
            </div>

            {/* بخش پایین با بردر آبی — در RTL دکمه‌ها به راست می‌روند */}
            <div className="mt-6 border border-blue-500 rounded p-4">
              <div
                className={`flex gap-6 ${
                  isRTL ? "justify-start" : "justify-end"
                }`}
              >
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm text-red-600 hover:opacity-70"
                >
                  <RiLogoutCircleLine size={16} />
                  <span>{t("account.Buttons.SignOut")}</span>
                </button>
                <button
                  onClick={handleSwitchAccount}
                  className="flex items-center gap-2 text-sm hover:opacity-70"
                >
                  <HiOutlineSwitchHorizontal size={16} />
                  <span>{t("account.Buttons.SwitchAccount")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ستون راست: سه باکس */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 h-[600px]">
          <div className="flex-1 border rounded shadow p-4 bg-gray-200">
            <p className="font-semibold mb-2">
              {t("account.Side.Superintendent")}
            </p>
            <p className="text-sm text-gray-600"></p>
          </div>
          <div className="flex-1 border rounded shadow p-4 bg-gray-200">
            <p className="font-semibold mb-2">{t("account.Side.Admin")}</p>
            <p className="text-sm text-gray-600"></p>
          </div>
          <div className="flex-1 border rounded shadow p-4 bg-gray-200">
            <p className="font-semibold mb-2">
              {t("account.Side.ChangeActiveRibbon")}
            </p>
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