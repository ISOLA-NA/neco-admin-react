import React, {
  useState,
  useEffect,
  useLayoutEffect,
} from "react";

import {
  FaLock,
  FaRegUserCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import { IoIosRefresh } from "react-icons/io";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { RiLogoutCircleLine } from "react-icons/ri";
import { FiX } from "react-icons/fi";

import { useTranslation } from "react-i18next";

import projectServiceFile from "../../../../services/api.servicesFile";
import projectService from "../../../../services/api.services";
import FileUploadHandler from "../../../../services/FileUploadHandler";

import DynamicConfirm from "../../../../components/utilities/DynamicConfirm";
import { showAlert } from "../../../../components/utilities/Alert/DynamicAlert";

/* =========================================================
   Interfaces
========================================================= */

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

interface UserPostItem {
  ID: string;
  Name: string;

  ParrentName?: string;
  ParrentImageID?: string;

  Company?: {
    Name?: string;
    [key: string]: any;
  };

  PostCat?: Array<{
    ID: number;
    Name: string;
    [key: string]: any;
  }>;

  [key: string]: any;
}

/* =========================================================
   Confirm Action
========================================================= */

type ConfirmAction =
  | "update"
  | "signOut"
  | "switchAccount"
  | null;

/* =========================================================
   Change Password State
========================================================= */

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const EMPTY_PASSWORD_FORM: ChangePasswordForm = {
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

/* =========================================================
   RTL Detector
========================================================= */

const detectRTL = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const rootAttr =
    document.documentElement.getAttribute("dir");

  const bodyAttr =
    document.body.getAttribute("dir");

  const attrDir = (
    rootAttr ||
    bodyAttr ||
    ""
  ).toLowerCase();

  if (attrDir) {
    return attrDir === "rtl";
  }

  return (
    window.getComputedStyle(
      document.documentElement
    ).direction === "rtl" ||
    window.getComputedStyle(
      document.body
    ).direction === "rtl"
  );
};

/* =========================================================
   Component
========================================================= */

const Account: React.FC = () => {
  /* =======================================================
     Translation
  ======================================================= */

  const { t, i18n } = useTranslation();

  const isFa = (i18n.language || "")
    .toLowerCase()
    .startsWith("fa");

  /* =======================================================
     RTL
  ======================================================= */

  const [isRTL, setIsRTL] =
    useState<boolean>(detectRTL);

  useLayoutEffect(() => {
    const observer = new MutationObserver(() => {
      setIsRTL(detectRTL());
    });

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ["dir"],
      }
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  /* =======================================================
     Confirm
  ======================================================= */

  const [confirmAction, setConfirmAction] =
    useState<ConfirmAction>(null);

  /* =======================================================
     Change Password Modal
  ======================================================= */

  const [
    isChangePasswordOpen,
    setIsChangePasswordOpen,
  ] = useState(false);

  const [
    isChangingPassword,
    setIsChangingPassword,
  ] = useState(false);

  const [
    showOldPassword,
    setShowOldPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  /*
    IMPORTANT:
    رمز عبور به هیچ داده‌ای از API متصل نیست.
    state همیشه خالی شروع می‌شود.
  */
  const [
    changePasswordForm,
    setChangePasswordForm,
  ] = useState<ChangePasswordForm>({
    ...EMPTY_PASSWORD_FORM,
  });

  /* =======================================================
     User State
  ======================================================= */

  const [updated, setUpdated] = useState({
    IsVisible: true,
    LastModified: null,
    ID: "",
    ModifiedById: null,
    Username: "",

    /*
      این Password مربوط به مدل UpdateProfile است
      و به Modal تغییر رمز متصل نیست.
    */
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

  const [userInfo, setUserInfo] =
    useState<UserToken | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [userPosts, setUserPosts] =
    useState<UserPostItem[]>([]);

  const [
    superintendentPreviewUrl,
    setSuperintendentPreviewUrl,
  ] = useState<string | null>(null);

  /* =======================================================
     Load UserPosts
  ======================================================= */

  useEffect(() => {
    try {
      const rawPosts =
        localStorage.getItem("userPosts");

      setUserPosts(
        rawPosts ? JSON.parse(rawPosts) : []
      );
    } catch (error) {
      console.error(
        "Error parsing userPosts:",
        error
      );

      setUserPosts([]);
    }
  }, []);

  /* =======================================================
     User Posts Info
  ======================================================= */

  const primaryPost = userPosts[0];

  const superintendentName =
    primaryPost?.ParrentName || "";

  const postCatNames = (
    primaryPost?.PostCat || []
  )
    .map((c) => c.Name)
    .filter(
      (name) =>
        name &&
        name.trim() !== ""
    );

  const topRoleTags = [
    primaryPost?.Name,
    primaryPost?.Company?.Name,
  ].filter(
    (value): value is string =>
      !!value &&
      value.trim() !== ""
  );

  /* =======================================================
     Load Current User
  ======================================================= */

  useEffect(() => {
    const fetchUserTokenId = async () => {
      try {
        const res =
          await projectServiceFile.getIdByUserToken();

        const data =
          Array.isArray(res.data)
            ? res.data[0]
            : res.data;

        if (!data) {
          return;
        }

        setUpdated((prev) => ({
          ...prev,

          ID:
            data.ID ?? "",

          Username:
            data.Username ?? "",

          Name:
            data.Name ?? "",

          Mobile:
            data.Mobile ?? "",

          Family:
            data.Family ?? "",

          Website:
            data.Website ?? "",

          Email:
            data.Email ?? "",

          UserImageId:
            data.UserImageId ?? "",

          Code:
            data.Code ?? "",

          /*
            خیلی مهم:
            حتی اگر API مقدار Password = "string"
            بدهد، ما آن را وارد state نمی‌کنیم.
          */
          Password: "",
        }));

        setUserInfo(data);
      } catch (error) {
        console.error(
          "Error fetching user:",
          error
        );

        showAlert(
          "error",
          undefined,

          t("Alerts.Titles.Error", {
            defaultValue: isFa
              ? "خطا"
              : "Error",
          }),

          t(
            "Alerts.Messages.FailedToFetch",
            {
              defaultValue: isFa
                ? "واکشی اطلاعات کاربر ناموفق بود."
                : "Failed to fetch user information.",
            }
          )
        );
      }
    };

    fetchUserTokenId();
  }, [t, isFa]);

  /* =======================================================
     Account Input Change
  ======================================================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setUpdated((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================================================
     Account Validation
  ======================================================= */

  const validateAccount = (): boolean => {
    const regexMobile =
      /^(?:09\d{9})?$/;

    const regexEmail =
      /^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regexMobile.test(updated.Mobile)) {
      showAlert(
        "error",
        undefined,

        t("Alerts.Titles.Error", {
          defaultValue: isFa
            ? "خطا"
            : "Error",
        }),

        t(
          "Alerts.Messages.InvalidMobile",
          {
            defaultValue: isFa
              ? "شماره تلفن وارد شده صحیح نیست."
              : "The entered mobile number is invalid.",
          }
        )
      );

      return false;
    }

    if (!regexEmail.test(updated.Email)) {
      showAlert(
        "error",
        undefined,

        t("Alerts.Titles.Error", {
          defaultValue: isFa
            ? "خطا"
            : "Error",
        }),

        t(
          "Alerts.Messages.InvalidEmail",
          {
            defaultValue: isFa
              ? "ایمیل وارد شده صحیح نیست."
              : "The entered email address is invalid.",
          }
        )
      );

      return false;
    }

    return true;
  };

  /* =======================================================
     Update Click
  ======================================================= */

  const handleUpdateClick = () => {
    if (!validateAccount()) {
      return;
    }

    setConfirmAction("update");
  };

  /* =======================================================
     Execute Profile Update
  ======================================================= */

  const executeUpdate = async () => {
    const updateUser: EditProfileUserInterface = {
      ...updated,

      ID:
        userInfo?.ID ??
        updated.ID,

      Code:
        userInfo?.Code ??
        updated.Code ??
        "",

      /*
        نباید مقدار string یا رمز قبلی
        همراه UpdateProfile ارسال شود.
      */
      Password: "",
    };

    try {
      await projectService.editProfileUser(
        updateUser
      );

      setUserInfo((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,

          Name:
            updated.Name,

          Family:
            updated.Family,

          Mobile:
            updated.Mobile,

          Email:
            updated.Email,

          Website:
            updated.Website,
        };
      });

      showAlert(
        "success",
        undefined,

        t("Alerts.Titles.Success", {
          defaultValue: isFa
            ? "موفق"
            : "Success",
        }),

        t("Alerts.Updated.User", {
          defaultValue: isFa
            ? "کاربر با موفقیت به‌روزرسانی شد."
            : "User updated successfully.",
        })
      );
    } catch (error) {
      console.error(
        "Update user error:",
        error
      );

      showAlert(
        "error",
        undefined,

        t("Alerts.Titles.Error", {
          defaultValue: isFa
            ? "خطا"
            : "Error",
        }),

        t(
          "Alerts.Messages.UpdateFailed",
          {
            defaultValue: isFa
              ? "به‌روزرسانی اطلاعات کاربر ناموفق بود."
              : "Failed to update user information.",
          }
        )
      );
    }
  };

  /* =======================================================
     Reset Change Password
  ======================================================= */

  const resetChangePasswordForm = () => {
    /*
      حتماً یک object جدید تولید می‌کنیم.
    */
    setChangePasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  /* =======================================================
     Open Change Password
  ======================================================= */

  const openChangePasswordModal = () => {
    /*
      قبل از باز شدن Modal به زور
      هر سه مقدار خالی می‌شوند.
    */
    setChangePasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    /*
      برای جلوگیری از Autofill قبلی مرورگر
      Modal بعد از reset باز می‌شود.
    */
    setIsChangePasswordOpen(true);
  };

  /* =======================================================
     Close Change Password
  ======================================================= */

  const closeChangePasswordModal = () => {
    if (isChangingPassword) {
      return;
    }

    setIsChangePasswordOpen(false);

    resetChangePasswordForm();
  };

  /* =======================================================
     Password Input Change
  ======================================================= */

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setChangePasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================================================
     Change Password Submit
  ======================================================= */

  const handleChangePasswordSubmit =
    async () => {
      /*
        trim فقط برای بررسی خالی بودن است.

        خود Password اصلی را بدون trim
        برای API ارسال می‌کنیم، چون ممکن است
        space بخشی از رمز کاربر باشد.
      */

      const oldPasswordForCheck =
        changePasswordForm.oldPassword.trim();

      const newPasswordForCheck =
        changePasswordForm.newPassword.trim();

      const confirmPasswordForCheck =
        changePasswordForm.confirmNewPassword.trim();

      /* ===============================================
         Old Password Required
      =============================================== */

      if (!oldPasswordForCheck) {
        showAlert(
          "warning",
          undefined,

          t("Alerts.Titles.Warning", {
            defaultValue: isFa
              ? "هشدار"
              : "Warning",
          }),

          t(
            "account.ChangePassword.Validation.OldPasswordRequired",
            {
              defaultValue: isFa
                ? "لطفاً رمز عبور فعلی را وارد کنید."
                : "Please enter your current password.",
            }
          )
        );

        return;
      }

      /* ===============================================
         New Password Required
      =============================================== */

      if (!newPasswordForCheck) {
        showAlert(
          "warning",
          undefined,

          t("Alerts.Titles.Warning", {
            defaultValue: isFa
              ? "هشدار"
              : "Warning",
          }),

          t(
            "account.ChangePassword.Validation.NewPasswordRequired",
            {
              defaultValue: isFa
                ? "لطفاً رمز عبور جدید را وارد کنید."
                : "Please enter a new password.",
            }
          )
        );

        return;
      }

      /* ===============================================
         Confirm Required
      =============================================== */

      if (!confirmPasswordForCheck) {
        showAlert(
          "warning",
          undefined,

          t("Alerts.Titles.Warning", {
            defaultValue: isFa
              ? "هشدار"
              : "Warning",
          }),

          t(
            "account.ChangePassword.Validation.ConfirmPasswordRequired",
            {
              defaultValue: isFa
                ? "لطفاً تکرار رمز عبور جدید را وارد کنید."
                : "Please confirm your new password.",
            }
          )
        );

        return;
      }

      /* ===============================================
         Password Match
      =============================================== */

      if (
        changePasswordForm.newPassword !==
        changePasswordForm.confirmNewPassword
      ) {
        showAlert(
          "error",
          undefined,

          t("Alerts.Titles.Error", {
            defaultValue: isFa
              ? "خطا"
              : "Error",
          }),

          t(
            "account.ChangePassword.Validation.PasswordMismatch",
            {
              defaultValue: isFa
                ? "رمز عبور جدید و تکرار آن یکسان نیستند."
                : "New password and confirmation password do not match.",
            }
          )
        );

        return;
      }

      /* ===============================================
         API
      =============================================== */

      try {
        setIsChangingPassword(true);

        const payload = {
          LastPassword:
            changePasswordForm.oldPassword,

          Password:
            changePasswordForm.newPassword,

          ModifiedById: null,
        };

        console.log(
          "Change password request:",
          {
            LastPassword: "***",
            Password: "***",
            ModifiedById:
              payload.ModifiedById,
          }
        );

        await projectService.changeProfilePassword(
          payload
        );

        /*
          Modal ابتدا بسته می‌شود.
        */
        setIsChangePasswordOpen(false);

        /*
          سپس اطلاعات رمز پاک می‌شوند.
        */
        resetChangePasswordForm();

        showAlert(
          "success",
          undefined,

          t("Alerts.Titles.Success", {
            defaultValue: isFa
              ? "موفق"
              : "Success",
          }),

          t(
            "account.ChangePassword.Messages.Success",
            {
              defaultValue: isFa
                ? "رمز عبور با موفقیت تغییر کرد."
                : "Password changed successfully.",
            }
          )
        );
      } catch (error: any) {
        console.error(
          "Change password error:",
          error
        );

        const responseData =
          error?.response?.data;

        let serverMessage = "";

        if (
          typeof responseData === "string"
        ) {
          /*
            اگر API فقط string برگرداند
          */
          serverMessage =
            responseData === "string"
              ? ""
              : responseData;
        } else {
          serverMessage =
            responseData?.message ||
            responseData?.Message ||
            responseData?.msg ||
            responseData?.Msg ||
            "";
        }

        showAlert(
          "error",
          undefined,

          t("Alerts.Titles.Error", {
            defaultValue: isFa
              ? "خطا"
              : "Error",
          }),

          serverMessage ||
            t(
              "account.ChangePassword.Messages.Failed",
              {
                defaultValue: isFa
                  ? "تغییر رمز عبور ناموفق بود. لطفاً رمز عبور فعلی را بررسی کنید."
                  : "Failed to change password. Please check your current password.",
              }
            )
        );
      } finally {
        setIsChangingPassword(false);
      }
    };

  /* =======================================================
     Sign Out
  ======================================================= */

  const handleSignOut = () => {
    setConfirmAction("signOut");
  };

  /* =======================================================
     Switch Account
  ======================================================= */

  const handleSwitchAccount = () => {
    setConfirmAction(
      "switchAccount"
    );
  };

  /* =======================================================
     Confirm Data
  ======================================================= */

  const getConfirmData = () => {
    switch (confirmAction) {
      /* ===============================================
         Update
      =============================================== */

      case "update":
        return {
          title: t(
            "DynamicConfirm.Confirmations.Update.Title",
            {
              defaultValue: isFa
                ? "تأیید ویرایش"
                : "Update Confirmation",
            }
          ),

          message: t(
            "DynamicConfirm.Confirmations.Update.Message",
            {
              defaultValue: isFa
                ? "آیا از ویرایش اطلاعات حساب کاربری مطمئن هستید؟"
                : "Are you sure you want to update your account information?",
            }
          ),

          variant:
            "edit" as const,
        };

      /* ===============================================
         Sign Out
      =============================================== */

      case "signOut":
        return {
          title: t(
            "DynamicConfirm.Confirmations.SignOut.Title",
            {
              defaultValue: isFa
                ? "تأیید خروج از حساب"
                : "Sign Out Confirmation",
            }
          ),

          message: t(
            "DynamicConfirm.Confirmations.SignOut.Message",
            {
              defaultValue: isFa
                ? "آیا مطمئن هستید که می‌خواهید از حساب کاربری خارج شوید؟"
                : "Are you sure you want to sign out of your account?",
            }
          ),

          variant:
            "notice" as const,
        };

      /* ===============================================
         Switch Account
      =============================================== */

      case "switchAccount":
        return {
          title: t(
            "DynamicConfirm.Confirmations.SwitchAccount.Title",
            {
              defaultValue: isFa
                ? "تأیید تغییر حساب"
                : "Switch Account Confirmation",
            }
          ),

          message: t(
            "DynamicConfirm.Confirmations.SwitchAccount.Message",
            {
              defaultValue: isFa
                ? "آیا مطمئن هستید که می‌خواهید حساب کاربری را تغییر دهید؟"
                : "Are you sure you want to switch to another account?",
            }
          ),

          variant:
            "notice" as const,
        };

      default:
        return {
          title: "",
          message: "",
          variant:
            "notice" as const,
        };
    }
  };

  /* =======================================================
     Confirm Execution
  ======================================================= */

  const handleConfirm = async () => {
    const action = confirmAction;

    setConfirmAction(null);

    switch (action) {
      case "update":
        await executeUpdate();
        break;

      case "signOut":
        showAlert(
          "success",
          undefined,

          t("Alerts.Titles.Success", {
            defaultValue: isFa
              ? "موفق"
              : "Success",
          }),

          t(
            "Alerts.Messages.SignOutSelected",
            {
              defaultValue: isFa
                ? "عملیات خروج از حساب انتخاب شد."
                : "Sign out operation selected.",
            }
          )
        );

        break;

      case "switchAccount":
        showAlert(
          "info",
          undefined,

          t("Alerts.Titles.Info", {
            defaultValue: isFa
              ? "اطلاع"
              : "Information",
          }),

          t(
            "Alerts.Messages.SwitchAccountSelected",
            {
              defaultValue: isFa
                ? "عملیات تغییر حساب انتخاب شد."
                : "Switch account operation selected.",
            }
          )
        );

        break;

      default:
        break;
    }
  };

  const confirmData =
    getConfirmData();

  /* =========================================================
     Render
  ========================================================= */

  return (
    <>
      <div className="container mx-auto mt-3 mb-3 px-4">
        {/* ===================================================
            Account Information
        ==================================================== */}

        <h2 className="text-2xl font-bold mb-4">
          {t(
            "account.Titles.AccountInformation"
          )}
        </h2>

        {/* ===================================================
            User Image
        ==================================================== */}

        <FileUploadHandler
          selectedFileId={
            updated.UserImageId
          }
          resetCounter={0}
          onReset={() => {}}
          onPreviewUrlChange={
            setPreviewUrl
          }
          hideUploader={true}
        />

        {/* ===================================================
            Superintendent Image
        ==================================================== */}

        <FileUploadHandler
          selectedFileId={
            primaryPost?.ParrentImageID ??
            null
          }
          resetCounter={0}
          onReset={() => {}}
          onPreviewUrlChange={
            setSuperintendentPreviewUrl
          }
          hideUploader={true}
        />

        <div className="flex flex-col md:flex-row gap-6">
          {/* =================================================
              LEFT
          ================================================== */}

          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-md shadow p-4 h-[600px]">
              {/* User Information */}

              <h2 className="text-lg font-bold border-b pb-2 mb-3">
                {t(
                  "account.Titles.UserInformation"
                )}
              </h2>

              {/* =============================================
                  Avatar + User Info + Actions
              ============================================== */}

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  justify-between
                  gap-4
                  mb-4
                  pb-4
                  border-b
                "
              >
                {/* User */}

                <div className="flex items-center gap-4 min-w-0">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="User Avatar"
                      className="
                        w-16
                        h-16
                        rounded-full
                        object-cover
                        flex-shrink-0
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-16
                        h-16
                        rounded-full
                        bg-gray-200
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                      "
                    >
                      <FaRegUserCircle
                        size={40}
                        className="text-gray-400"
                      />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-base font-bold">
                      {userInfo
                        ? `${userInfo.Name} ${userInfo.Family}`
                        : t(
                            "account.Placeholders.UserName"
                          )}
                    </p>

                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {topRoleTags.length >
                      0
                        ? topRoleTags
                            .map(
                              (tag) =>
                                `${tag} ؛`
                            )
                            .join(" ")
                        : t(
                            "account.Messages.LoadingUserNames"
                          )}
                    </p>
                  </div>
                </div>

                {/* ===========================================
                    Change Password + Update
                ============================================ */}

                <div className="flex items-center gap-7 flex-shrink-0">
                  {/* Change Password */}

                  <button
                    type="button"
                    onClick={
                      openChangePasswordModal
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      text-gray-800
                      hover:text-blue-600
                      transition-colors
                      whitespace-nowrap
                    "
                  >
                    <FaLock size={14} />

                    <span>
                      {t(
                        "account.Buttons.ChangePassword"
                      )}
                    </span>
                  </button>

                  {/* Update */}

                  <button
                    type="button"
                    onClick={
                      handleUpdateClick
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      text-gray-800
                      hover:text-blue-600
                      transition-colors
                      whitespace-nowrap
                    "
                  >
                    <IoIosRefresh
                      size={17}
                    />

                    <span>
                      {t(
                        "account.Buttons.Update"
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* =============================================
                  FORM
              ============================================== */}

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-x-12
                  gap-y-4
                "
              >
                {/* Username */}

                <div className="w-full">
                  <label className="block mb-1 text-sm text-gray-600 h-5">
                    {t(
                      "account.Fields.Username"
                    )}
                  </label>

                  <input
                    type="text"
                    name="Username"
                    value={
                      updated.Username
                    }
                    disabled
                    placeholder={t(
                      "account.Placeholders.Username"
                    )}
                    className="
                      block
                      w-full
                      h-8
                      border-0
                      border-b
                      border-gray-300
                      bg-transparent
                      outline-none
                      text-sm
                      px-0
                      pb-1
                      disabled:opacity-100
                      disabled:text-gray-900
                    "
                  />
                </div>

                {/* Last Name */}

                <div className="w-full">
                  <label className="block mb-1 text-sm text-gray-600 h-5">
                    {t(
                      "account.Fields.LastName"
                    )}
                  </label>

                  <input
                    type="text"
                    name="Family"
                    value={
                      updated.Family
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={t(
                      "account.Placeholders.LastName"
                    )}
                    className="
                      block
                      w-full
                      h-8
                      border-0
                      border-b
                      border-gray-300
                      bg-transparent
                      outline-none
                      text-sm
                      px-0
                      pb-1
                    "
                  />
                </div>

                {/* Name */}

                <div className="w-full">
                  <label className="block mb-1 text-sm text-gray-600 h-5">
                    {t(
                      "account.Fields.Name"
                    )}
                  </label>

                  <input
                    type="text"
                    name="Name"
                    value={
                      updated.Name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={t(
                      "account.Placeholders.Name"
                    )}
                    className="
                      block
                      w-full
                      h-8
                      border-0
                      border-b
                      border-gray-300
                      bg-transparent
                      outline-none
                      text-sm
                      px-0
                      pb-1
                    "
                  />
                </div>

                {/* Website */}

                <div className="w-full">
                  <label className="block mb-1 text-sm text-gray-600 h-5">
                    {t(
                      "account.Fields.Website"
                    )}
                  </label>

                  <input
                    type="text"
                    name="Website"
                    value={
                      updated.Website
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={t(
                      "account.Placeholders.Website"
                    )}
                    className="
                      block
                      w-full
                      h-8
                      border-0
                      border-b
                      border-gray-300
                      bg-transparent
                      outline-none
                      text-sm
                      px-0
                      pb-1
                    "
                  />
                </div>

                {/* Mobile */}

                <div className="w-full">
                  <label className="block mb-1 text-sm text-gray-600 h-5">
                    {t(
                      "account.Fields.Mobile"
                    )}
                  </label>

                  <input
                    type="text"
                    name="Mobile"
                    value={
                      updated.Mobile
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Mobile"
                    className="
                      block
                      w-full
                      h-8
                      border-0
                      border-b
                      border-gray-300
                      bg-transparent
                      outline-none
                      text-sm
                      px-0
                      pb-1
                    "
                  />
                </div>

                {/* Email */}

                <div className="w-full">
                  <label className="block mb-1 text-sm text-gray-600 h-5">
                    {t(
                      "account.Fields.Email"
                    )}
                  </label>

                  <input
                    type="text"
                    name="Email"
                    value={
                      updated.Email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={t(
                      "account.Placeholders.Email"
                    )}
                    className="
                      block
                      w-full
                      h-8
                      border-0
                      border-b
                      border-gray-300
                      bg-transparent
                      outline-none
                      text-sm
                      px-0
                      pb-1
                    "
                  />
                </div>
              </div>

              {/* =============================================
                  Bottom Actions
              ============================================== */}

              <div className="mt-6 border border-blue-500 rounded p-4">
                <div
                  className={`flex items-center gap-6 ${
                    isRTL
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  {/* Sign Out */}

                  <button
                    type="button"
                    onClick={
                      handleSignOut
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      text-red-600
                      hover:opacity-70
                    "
                  >
                    <RiLogoutCircleLine
                      size={16}
                    />

                    <span>
                      {t(
                        "account.Buttons.SignOut"
                      )}
                    </span>
                  </button>

                  {/* Switch Account */}

                  <button
                    type="button"
                    onClick={
                      handleSwitchAccount
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      hover:opacity-70
                    "
                  >
                    <HiOutlineSwitchHorizontal
                      size={16}
                    />

                    <span>
                      {t(
                        "account.Buttons.SwitchAccount"
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT
          ================================================== */}

          <div
            className="
              w-full
              md:w-1/3
              flex
              flex-col
              gap-4
              h-[600px]
            "
          >
            {/* ===============================================
                Superintendent
            ================================================ */}

            <div className="flex-1 border rounded shadow p-4 bg-gray-200">
              <p className="font-semibold mb-2">
                {t(
                  "account.Side.Superintendent"
                )}
              </p>

              <div className="flex items-center gap-3">
                {superintendentPreviewUrl ? (
                  <img
                    src={
                      superintendentPreviewUrl
                    }
                    alt="Superintendent Avatar"
                    className="
                      w-9
                      h-9
                      rounded-full
                      object-cover
                      flex-shrink-0
                    "
                  />
                ) : (
                  <div
                    className="
                      w-9
                      h-9
                      rounded-full
                      bg-gray-300
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                    "
                  >
                    <FaRegUserCircle
                      size={22}
                      className="text-gray-500"
                    />
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  {superintendentName ||
                    t(
                      "account.Messages.NoData",
                      "—"
                    )}
                </p>
              </div>
            </div>

            {/* ===============================================
                Posts
            ================================================ */}

            <div className="flex-1 border rounded shadow p-4 bg-gray-200">
              <p className="font-semibold mb-2">
                {t(
                  "account.Side.Posts",
                  "Posts"
                )}
              </p>

              {postCatNames.length >
              0 ? (
                <div className="space-y-1">
                  {postCatNames.map(
                    (name, idx) => (
                      <p
                        key={idx}
                        className="text-sm text-gray-600"
                      >
                        {name}
                      </p>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  {t(
                    "account.Messages.NoData",
                    "—"
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          Dynamic Confirm
      ====================================================== */}

      <DynamicConfirm
        isOpen={
          confirmAction !== null
        }
        title={
          confirmData.title
        }
        message={
          confirmData.message
        }
        variant={
          confirmData.variant
        }
        onClose={() => {
          setConfirmAction(null);
        }}
        onConfirm={
          handleConfirm
        }
      />

      {/* =====================================================
          CHANGE PASSWORD MODAL
      ====================================================== */}

      {isChangePasswordOpen && (
        <div
          dir={isFa ? "rtl" : "ltr"}
          className="
            fixed
            inset-0
            z-[10000]
            flex
            items-center
            justify-center
            bg-black/25
            backdrop-blur-sm
            px-4
          "
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeChangePasswordModal();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-[460px]
              bg-white
              rounded-xl
              shadow-2xl
              border
              border-gray-200
              overflow-hidden
            "
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            {/* =============================================
                Header
            ============================================== */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                px-6
                py-4
                border-b
                border-gray-200
              "
            >
              <div className="flex items-center gap-2 text-blue-500">
                <FaLock size={18} />

                <h3 className="text-lg font-bold">
                  {t(
                    "account.ChangePassword.Title",
                    {
                      defaultValue:
                        isFa
                          ? "تغییر رمز عبور"
                          : "Change Password",
                    }
                  )}
                </h3>
              </div>

              <button
                type="button"
                disabled={
                  isChangingPassword
                }
                onClick={
                  closeChangePasswordModal
                }
                className="
                  text-gray-500
                  hover:text-gray-800
                  disabled:opacity-50
                  transition-colors
                "
              >
                <FiX size={22} />
              </button>
            </div>

            {/* =============================================
                Body
            ============================================== */}

            <div className="px-6 py-5 space-y-5">
              {/* ===========================================
                  Old Password
              ============================================ */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t(
                    "account.ChangePassword.Fields.OldPassword",
                    {
                      defaultValue:
                        isFa
                          ? "رمز عبور فعلی"
                          : "Enter Old Password",
                    }
                  )}
                </label>

                <div className="relative">
                  <input
                    key={`old-${isChangePasswordOpen}`}
                    type={
                      showOldPassword
                        ? "text"
                        : "password"
                    }
                    name="oldPassword"

                    /*
                      مهم:
                      هیچ وقت value="string"
                      نمی‌گیرد.
                    */
                    value={
                      changePasswordForm.oldPassword ||
                      ""
                    }

                    onChange={
                      handlePasswordInputChange
                    }

                    /*
                      برای کاهش Autofill مرورگر.
                    */
                    autoComplete="off"

                    data-lpignore="true"
                    data-form-type="other"

                    className="
                      w-full
                      h-11
                      rounded-md
                      border
                      border-gray-300
                      bg-white
                      px-3
                      pe-11
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-1
                      focus:ring-blue-500
                    "

                    placeholder={t(
                      "account.ChangePassword.Placeholders.OldPassword",
                      {
                        defaultValue:
                          isFa
                            ? "رمز عبور فعلی را وارد کنید"
                            : "Enter your old password",
                      }
                    )}
                  />

                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => {
                      setShowOldPassword(
                        (prev) => !prev
                      );
                    }}
                    className="
                      absolute
                      top-1/2
                      -translate-y-1/2
                      end-3
                      text-gray-500
                      hover:text-gray-800
                    "
                  >
                    {showOldPassword ? (
                      <FaEyeSlash
                        size={16}
                      />
                    ) : (
                      <FaEye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* ===========================================
                  New Password
              ============================================ */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t(
                    "account.ChangePassword.Fields.NewPassword",
                    {
                      defaultValue:
                        isFa
                          ? "رمز عبور جدید"
                          : "New Password",
                    }
                  )}
                </label>

                <div className="relative">
                  <input
                    key={`new-${isChangePasswordOpen}`}
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    name="newPassword"

                    value={
                      changePasswordForm.newPassword ||
                      ""
                    }

                    onChange={
                      handlePasswordInputChange
                    }

                    autoComplete="new-password"

                    data-lpignore="true"

                    className="
                      w-full
                      h-11
                      rounded-md
                      border
                      border-gray-300
                      bg-white
                      px-3
                      pe-11
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-1
                      focus:ring-blue-500
                    "

                    placeholder={t(
                      "account.ChangePassword.Placeholders.NewPassword",
                      {
                        defaultValue:
                          isFa
                            ? "رمز عبور جدید را وارد کنید"
                            : "Enter new password",
                      }
                    )}
                  />

                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => {
                      setShowNewPassword(
                        (prev) => !prev
                      );
                    }}
                    className="
                      absolute
                      top-1/2
                      -translate-y-1/2
                      end-3
                      text-gray-500
                      hover:text-gray-800
                    "
                  >
                    {showNewPassword ? (
                      <FaEyeSlash
                        size={16}
                      />
                    ) : (
                      <FaEye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* ===========================================
                  Confirm New Password
              ============================================ */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t(
                    "account.ChangePassword.Fields.ConfirmNewPassword",
                    {
                      defaultValue:
                        isFa
                          ? "تکرار رمز عبور جدید"
                          : "Confirm New Password",
                    }
                  )}
                </label>

                <div className="relative">
                  <input
                    key={`confirm-${isChangePasswordOpen}`}
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmNewPassword"

                    value={
                      changePasswordForm.confirmNewPassword ||
                      ""
                    }

                    onChange={
                      handlePasswordInputChange
                    }

                    autoComplete="new-password"

                    data-lpignore="true"

                    className="
                      w-full
                      h-11
                      rounded-md
                      border
                      border-gray-300
                      bg-white
                      px-3
                      pe-11
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-1
                      focus:ring-blue-500
                    "

                    placeholder={t(
                      "account.ChangePassword.Placeholders.ConfirmNewPassword",
                      {
                        defaultValue:
                          isFa
                            ? "رمز عبور جدید را دوباره وارد کنید"
                            : "Confirm your new password",
                      }
                    )}

                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !isChangingPassword
                      ) {
                        handleChangePasswordSubmit();
                      }
                    }}
                  />

                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => {
                      setShowConfirmPassword(
                        (prev) => !prev
                      );
                    }}
                    className="
                      absolute
                      top-1/2
                      -translate-y-1/2
                      end-3
                      text-gray-500
                      hover:text-gray-800
                    "
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash
                        size={16}
                      />
                    ) : (
                      <FaEye size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* =============================================
                Footer
            ============================================== */}

            <div
              className="
                flex
                items-center
                justify-end
                gap-3
                px-6
                py-4
                bg-gray-50
                border-t
                border-gray-200
              "
            >
              {/* Cancel */}

              <button
                type="button"
                disabled={
                  isChangingPassword
                }
                onClick={
                  closeChangePasswordModal
                }
                className="
                  min-w-[90px]
                  px-4
                  py-2
                  rounded-md
                  bg-gray-200
                  hover:bg-gray-300
                  text-gray-700
                  text-sm
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  transition-colors
                "
              >
                {t(
                  "account.ChangePassword.Buttons.Cancel",
                  {
                    defaultValue:
                      isFa
                        ? "انصراف"
                        : "Cancel",
                  }
                )}
              </button>

              {/* Change Password */}

              <button
                type="button"
                disabled={
                  isChangingPassword
                }
                onClick={
                  handleChangePasswordSubmit
                }
                className="
                  min-w-[120px]
                  px-4
                  py-2
                  rounded-md
                  bg-blue-500
                  hover:bg-blue-600
                  text-white
                  text-sm
                  font-medium
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  transition-colors
                "
              >
                {isChangingPassword
                  ? t(
                      "account.ChangePassword.Buttons.Changing",
                      {
                        defaultValue:
                          isFa
                            ? "در حال تغییر..."
                            : "Changing...",
                      }
                    )
                  : t(
                      "account.ChangePassword.Buttons.Change",
                      {
                        defaultValue:
                          isFa
                            ? "تغییر رمز عبور"
                            : "Change Password",
                      }
                    )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Account;