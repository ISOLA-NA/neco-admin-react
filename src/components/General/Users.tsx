import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import DynamicSelector from "../utilities/DynamicSelector";
import FileUploadHandler from "../../services/FileUploadHandler";
import { useAddEditDelete } from "../../context/AddEditDeleteContext";
import type { User as UserType } from "../../services/api.services";
import AppServices from "../../services/api.services";
import DynamicConfirm from "../utilities/DynamicConfirm";
import { showAlert } from "../utilities/Alert/DynamicAlert";
import { useTranslation } from "react-i18next";

export interface UserHandle {
  save: () => Promise<UserType | null>;
  checkNameFilled: () => boolean;
}

interface UserProps {
  selectedRow: any;
}

const User2 = forwardRef<UserHandle, UserProps>(({ selectedRow }, ref) => {
  const { t } = useTranslation();
  const { handleSaveUser } = useAddEditDelete();

  const userTypeOptions = useMemo(
    () => [
      // { value: "", label: "" },
      { value: "7", label: t("User.UserTypeBoss") },
      { value: "6", label: t("User.UserTypeManager") },
      { value: "0", label: t("User.UserTypeEmployee") },
      { value: "8", label: t("User.UserTypeSysAdmin") },
    ],
    [t]
  );

  const [resetCounter, setResetCounter] = useState<number>(0);
  const [newPassword, setNewPassword] = useState("");

  // وضعیت مدیریت نمایش مدال برای پیام‌های خطا/اطلاع رسانی
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalVariant, setModalVariant] = useState<
    "add" | "edit" | "delete" | "notice" | "error"
  >("error");

  // مدال تایید تغییر پسورد
  const [passwordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState(false);

  const showModal = (
    message: string,
    title: string = t("User.ModalError"),
    variant: "add" | "edit" | "delete" | "notice" | "error" = "error"
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVariant(variant);
    setModalOpen(true);
  };

  // مقدار userType به صورت عددی نگهداری می‌شود
  const [userData, setUserData] = useState({
    ID: selectedRow?.ID || null,
    Username: selectedRow?.Username || "",
    Name: selectedRow?.Name || "",
    Family: selectedRow?.Family || "",
    Email: selectedRow?.Email || "",
    Mobile: selectedRow?.Mobile || "",
    Password: selectedRow?.Password || "",
    ConfirmPassword: "",
    Status: selectedRow?.Status || 0,
    MaxWrongPass: selectedRow?.MaxWrongPass || 5,
    Website: selectedRow?.Website || "",
    TTKK: selectedRow?.TTKK || "",
    // userType: selectedRow?.userType || 0,
    userType: selectedRow?.userType ?? "",
    Code: selectedRow?.Code || "",
    IsVisible: selectedRow?.IsVisible ?? true,
    UserImageId: selectedRow?.UserImageId || null,
    CreateDate: selectedRow?.CreateDate || null,
    LastLoginTime: selectedRow?.LastLoginTime || null,
  });

  useEffect(() => {
    if (selectedRow) {
      setUserData({
        ID: selectedRow.ID,
        Username: selectedRow.Username || "",
        Name: selectedRow.Name || "",
        Family: selectedRow.Family || "",
        Email: selectedRow.Email || "",
        Mobile: selectedRow.Mobile || "",
        Password: selectedRow.Password || "",
        ConfirmPassword: "",
        Status: selectedRow.Status || 0,
        MaxWrongPass: selectedRow.MaxWrongPass || 5,
        Website: selectedRow.Website || "",
        TTKK: selectedRow.TTKK || "",
        // userType: selectedRow.userType || 0,
        userType: selectedRow.userType ?? "",
        Code: selectedRow.Code || "",
        IsVisible: selectedRow.IsVisible ?? true,
        UserImageId: selectedRow.UserImageId || null,
        CreateDate: selectedRow.CreateDate || null,
        LastLoginTime: selectedRow.LastLoginTime || null,
      });
      setNewPassword("");
    } else {
      setUserData({
        ID: null,
        Username: "",
        Name: "",
        Family: "",
        Email: "",
        Mobile: "",
        Password: "",
        ConfirmPassword: "",
        Status: 0,
        MaxWrongPass: 5,
        Website: "",
        TTKK: "",
        userType: "",
        Code: "",
        IsVisible: true,
        UserImageId: null,
        CreateDate: null,
        LastLoginTime: null,
      });
      setResetCounter((prev) => prev + 1);
      setNewPassword("");
    }
  }, [selectedRow]);

  // تابع واقعی تغییر پسورد
  const doChangePassword = async () => {
    try {
      const payload = { UserId: selectedRow.ID, Password: newPassword };
      await AppServices.changePasswordByAdmin(payload);
      showModal(
        t("User.MsgPasswordChangedSuccessfully"),
        t("User.ModalSuccess"),
        "notice"
      );
      setNewPassword("");
    } catch (error: any) {
      showModal(
        `${t("User.MsgPasswordChangeFailed")} ${error?.message || error}`,
        t("User.ModalError"),
        "error"
      );
    }
  };

  // تابع مربوط به دکمه change password
  const handleChangePasswordClick = () => {
    if (!newPassword) {
      showModal(
        t("User.MsgNewPasswordCannotBeEmpty"),
        t("User.ModalValidationError"),
        "error"
      );
      return;
    }
    // باز کردن مدال تایید تغییر پسورد
    setPasswordConfirmModalOpen(true);
  };

  const handleChange = (field: keyof typeof userData, value: any) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUploadSuccess = (insertModel: any) => {
    handleChange("UserImageId", insertModel.ID);
  };

  const handleResetUpload = () => {
    setResetCounter((prev) => prev + 1);
    handleChange("UserImageId", null);
  };

  const validateForm = () => {
    if (!userData.Username) {
      showModal(
        t("User.MsgUsernameRequired"),
        t("User.ModalValidationError"),
        "error"
      );
      return false;
    }
    if (!userData.Name) {
      showModal(
        t("User.MsgNameRequired"),
        t("User.ModalValidationError"),
        "error"
      );
      return false;
    }
    if (!selectedRow && !userData.Password) {
      showModal(
        t("User.MsgPasswordRequiredForNewUser"),
        t("User.ModalValidationError"),
        "error"
      );
      return false;
    }
    if (!selectedRow && userData.Password !== userData.ConfirmPassword) {
      showModal(
        t("User.MsgPasswordConfirmMismatch"),
        t("User.ModalValidationError"),
        "error"
      );
      return false;
    }
    if (userData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.Email)) {
      showModal(
        t("User.MsgInvalidEmail"),
        t("User.ModalValidationError"),
        "error"
      );
      return false;
    }
    return true;
  };

  const save = async (): Promise<UserType | null> => {
    if (!validateForm()) {
      return null;
    }
    try {
      const dataToSave: UserType = {
        ...userData,
        LastModified: new Date().toISOString(),
        CreateDate: userData.CreateDate ?? null,
        LastLoginTime: userData.LastLoginTime ?? null,
        UserImageId: userData.UserImageId ?? null,
      };

      if (selectedRow) {
        if (!userData.Password) {
          delete dataToSave.Password;
        }
      } else {
        delete dataToSave.ID;
        dataToSave.ConfirmPassword = userData.ConfirmPassword;
      }

      const result = await handleSaveUser(dataToSave);
      return result;
    } catch (error: any) {
      const data = error.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.value?.message ||
            data?.message ||
            "خطایی در فرآیند ذخیره دستور رخ داده است.";
      showAlert("error", null, t("User.ModalError"), message);
      return null;
    }
  };

  useImperativeHandle(ref, () => ({
    save,
    checkNameFilled: () => {
      if (!userData.Name.trim()) {
        showModal(
          t("User.MsgNameCannotBeEmpty"),
          t("User.ModalWarning"),
          "error"
        );
        return false;
      }
      return true;
    },
  }));

  return (
    <TwoColumnLayout>
      {/* Row 1: User Name | ID */}
      <div>
        <DynamicInput
          name={t("User.Username")}
          type="text"
          value={userData.Username}
          onChange={(e) => handleChange("Username", e.target.value)}
          placeholder={t("User.PlaceholderUsername")}
          required
          disabled={!!selectedRow}
        />
      </div>
      <div>
        <DynamicInput
          name={t("User.Code")}
          type="text"
          value={userData.Code}
          onChange={(e) => handleChange("Code", e.target.value)}
          placeholder={t("User.PlaceholderCode")}
        />
      </div>

      {/* Row 2: Last Name | First Name */}
      <div>
        <DynamicInput
          name={t("User.Family")}
          type="text"
          value={userData.Family}
          onChange={(e) => handleChange("Family", e.target.value)}
          placeholder={t("User.PlaceholderFamily")}
          className="-mt-5"
        />
      </div>
      <div>
        <DynamicInput
          name={t("User.Name")}
          type="text"
          value={userData.Name}
          onChange={(e) => handleChange("Name", e.target.value)}
          placeholder={t("User.PlaceholderName")}
          className="-mt-5"
          required
        />
      </div>

      {/* Row 3: Email | Mobile */}
      <div>
        <DynamicInput
          name={t("User.Email")}
          type="text"
          value={userData.Email}
          onChange={(e) => handleChange("Email", e.target.value)}
          placeholder={t("User.PlaceholderEmail")}
          className="-mt-5"
        />
      </div>
      <div>
        <DynamicInput
          name={t("User.Mobile")}
          type="text"
          value={userData.Mobile}
          onChange={(e) => handleChange("Mobile", e.target.value)}
          placeholder={t("User.PlaceholderMobile")}
          className="-mt-5"
        />
      </div>

      {/* Row 4: Password | Confirm Password / Change Password */}
      {!selectedRow && (
        <>
          <div>
            <DynamicInput
              name={t("User.Password")}
              type="password"
              value={userData.Password}
              onChange={(e) => handleChange("Password", e.target.value)}
              placeholder={t("User.PlaceholderPassword")}
              className="-mt-5"
              required
            />
          </div>
          <div>
            <DynamicInput
              name={t("User.ConfirmPassword")}
              type="password"
              value={userData.ConfirmPassword}
              onChange={(e) => handleChange("ConfirmPassword", e.target.value)}
              placeholder={t("User.PlaceholderConfirmPassword")}
              className="-mt-5"
              required
            />
          </div>
        </>
      )}

      {selectedRow && (
        <>
          <div>
            <DynamicInput
              name={t("User.Password")}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("User.PlaceholderNewPassword")}
              className="-mt-5"
            />
          </div>
          <div className="flex items-end -mt-1">
            <button
              onClick={handleChangePasswordClick}
              className="px-5 py-2.5 border rounded bg-gradient-to-r from-[#e14aa7] via-[#6761f0] to-[#b23ace] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-[#b23ace] hover:via-[#6761f0] hover:to-[#e14aa7]"
            >
              {t("User.ChangePassword")}
            </button>
          </div>
        </>
      )}

      {/* Row 5: Web Site | User Type */}
      <div>
        <DynamicInput
          name={t("User.Website")}
          type="text"
          value={userData.Website}
          onChange={(e) => handleChange("Website", e.target.value)}
          placeholder={t("User.PlaceholderWebsite")}
          className="-mt-5"
        />
      </div>
      <div>
        <DynamicSelector
          name="User Type"
          options={userTypeOptions}
          selectedValue={userData.userType.toString()}
          onChange={(e) => handleChange("userType", parseInt(e.target.value))}
          label={t("User.UserType")}
          className="-mt-6"
        />
      </div>

      {/* Bottom Row: Image | Activate */}
      <div className="-mt-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium">
              {t("User.UserProfileImage")}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {t("User.ImageBestSize")}
            </p>
          </div>
          <div className="flex-1">
            <FileUploadHandler
              selectedFileId={userData.UserImageId}
              onUploadSuccess={handleImageUploadSuccess}
              resetCounter={resetCounter}
              onReset={handleResetUpload}
              isEditMode={!!selectedRow}
            />
          </div>
        </div>
      </div>
      <div className="-mt-2 flex items-center">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!userData.IsVisible}
            onChange={(e) => handleChange("IsVisible", e.target.checked)}
            className="h-5 w-5"
          />
          <span>{t("User.Activate")}</span>
        </label>
      </div>

      {/* Modal */}
      <DynamicConfirm
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        onConfirm={() => setModalOpen(false)}
        onClose={() => setModalOpen(false)}
        variant={modalVariant}
        hideCancelButton={true}
      />

      {/* Password Confirm Modal */}
      <DynamicConfirm
        isOpen={passwordConfirmModalOpen}
        title={t("User.ModalConfirm")}
        message={t("User.MsgConfirmPasswordChange")}
        onConfirm={async () => {
          setPasswordConfirmModalOpen(false);
          await doChangePassword();
        }}
        onClose={() => setPasswordConfirmModalOpen(false)}
        variant="notice"
      />
    </TwoColumnLayout>
  );
});

User2.displayName = "User2";

export default User2;
