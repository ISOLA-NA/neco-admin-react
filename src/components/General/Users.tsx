import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import TwoColumnLayout from '../layout/TwoColumnLayout';
import DynamicInput from '../utilities/DynamicInput';
import DynamicSelector from '../utilities/DynamicSelector';
import FileUploadHandler from '../../services/FileUploadHandler';
import { useAddEditDelete } from '../../context/AddEditDeleteContext';
import type { GetEnumResponse, User as UserType } from '../../services/api.services';
import AppServices from '../../services/api.services';
import DynamicConfirm from '../utilities/DynamicConfirm';

export interface UserHandle {
  save: () => Promise<UserType | null>;
  checkNameFilled: () => boolean;
}

interface UserProps {
  selectedRow: any;
}

const User2 = forwardRef<UserHandle, UserProps>(({ selectedRow }, ref) => {
  const { handleSaveUser } = useAddEditDelete();
  
  const [userTypeOptions, setUserTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [newPassword, setNewPassword] = useState('');

  // وضعیت مدیریت نمایش مدال برای پیام‌های خطا/اطلاع رسانی
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalVariant, setModalVariant] = useState<"add" | "edit" | "delete" | "notice" | "error">("error");

  // مدال تایید تغییر پسورد
  const [passwordConfirmModalOpen, setPasswordConfirmModalOpen] = useState(false);

  const showModal = (
    message: string,
    title: string = 'Error',
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
    Username: selectedRow?.Username || '',
    Name: selectedRow?.Name || '',
    Family: selectedRow?.Family || '',
    Email: selectedRow?.Email || '',
    Mobile: selectedRow?.Mobile || '',
    Password: selectedRow?.Password || '',
    ConfirmPassword: '',
    Status: selectedRow?.Status || 0,
    MaxWrongPass: selectedRow?.MaxWrongPass || 5,
    Website: selectedRow?.Website || '',
    TTKK: selectedRow?.TTKK || '',
    userType: selectedRow?.userType || 0,
    Code: selectedRow?.Code || '',
    IsVisible: selectedRow?.IsVisible ?? true,
    UserImageId: selectedRow?.UserImageId || null,
    CreateDate: selectedRow?.CreateDate || null,
    LastLoginTime: selectedRow?.LastLoginTime || null,
  });

  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const response: GetEnumResponse = await AppServices.getEnum({ str: 'UserType' });
        // تبدیل مقادیر به رشته برای نمایش در selector
        const options = Object.entries(response).map(([key, val]) => ({
          value: val.toString(),
          label: key,
        }));
        setUserTypeOptions(options);
      } catch (error: any) {
        showModal('Error fetching UserType enums: ' + (error?.message || error), 'Error', 'error');
      }
    };
    fetchUserTypes();
  }, []);

  useEffect(() => {
    if (selectedRow) {
      setUserData({
        ID: selectedRow.ID,
        Username: selectedRow.Username || '',
        Name: selectedRow.Name || '',
        Family: selectedRow.Family || '',
        Email: selectedRow.Email || '',
        Mobile: selectedRow.Mobile || '',
        Password: selectedRow.Password || '',
        ConfirmPassword: '',
        Status: selectedRow.Status || 0,
        MaxWrongPass: selectedRow.MaxWrongPass || 5,
        Website: selectedRow.Website || '',
        TTKK: selectedRow.TTKK || '',
        userType: selectedRow.userType || 0,
        Code: selectedRow.Code || '',
        IsVisible: selectedRow.IsVisible ?? true,
        UserImageId: selectedRow.UserImageId || null,
        CreateDate: selectedRow.CreateDate || null,
        LastLoginTime: selectedRow.LastLoginTime || null,
      });
      setNewPassword('');
    } else {
      setUserData({
        ID: null,
        Username: '',
        Name: '',
        Family: '',
        Email: '',
        Mobile: '',
        Password: '',
        ConfirmPassword: '',
        Status: 0,
        MaxWrongPass: 5,
        Website: '',
        TTKK: '',
        userType: 0,
        Code: '',
        IsVisible: true,
        UserImageId: null,
        CreateDate: null,
        LastLoginTime: null,
      });
      setResetCounter(prev => prev + 1);
      setNewPassword('');
    }
  }, [selectedRow]);

  // تابع واقعی تغییر پسورد
  const doChangePassword = async () => {
    try {
      const payload = { UserId: selectedRow.ID, Password: newPassword };
      await AppServices.changePasswordByAdmin(payload);
      showModal('Password changed successfully', 'Success', 'notice');
      setNewPassword('');
    } catch (error: any) {
      showModal('Failed to change password: ' + (error?.message || error), 'Error', 'error');
    }
  };

  // تابع مربوط به دکمه change password
  const handleChangePasswordClick = () => {
    if (!newPassword) {
      showModal('New password cannot be empty', 'Validation Error', 'error');
      return;
    }
    // باز کردن مدال تایید تغییر پسورد
    setPasswordConfirmModalOpen(true);
  };

  const handleChange = (field: keyof typeof userData, value: any) => {
    setUserData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUploadSuccess = (insertModel: any) => {
    handleChange('UserImageId', insertModel.ID);
  };

  const handleResetUpload = () => {
    setResetCounter(prev => prev + 1);
    handleChange('UserImageId', null);
  };

  const validateForm = () => {
    if (!userData.Username) {
      showModal('Username is required', 'Validation Error', 'error');
      return false;
    }
    if (!userData.Name) {
      showModal('Name is required', 'Validation Error', 'error');
      return false;
    }
    if (!selectedRow && !userData.Password) {
      showModal('Password is required for new users', 'Validation Error', 'error');
      return false;
    }
    if (userData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.Email)) {
      showModal('Invalid email format', 'Validation Error', 'error');
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
      showModal(`Failed to ${selectedRow ? 'update' : 'create'} user: ` + (error?.message || error), 'Error', 'error');
      return null;
    }
  };

  useImperativeHandle(ref, () => ({
    save,
    checkNameFilled: () => {
      if (!userData.Name.trim()) {
        showModal('Name cannot be empty', 'Warning', 'error');
        return false;
      }
      return true;
    },
  }));

  return (
    <TwoColumnLayout>
      <div >
        <DynamicInput
          name="Username"
          type="text"
          value={userData.Username}
          onChange={e => handleChange('Username', e.target.value)}
          required
          disabled={!!selectedRow}
        />
      </div>
      <div >
        <DynamicInput
          name="Code"
          type="number"
          value={userData.Code}
          onChange={e => handleChange('Code', e.target.value)}
          disabled={!!selectedRow}
        />
      </div>
      <div >
        <DynamicInput
          name="Name"
          type="text"
          value={userData.Name}
          onChange={e => handleChange('Name', e.target.value)}
          className='-mt-5'
          required
        />
      </div>
      <div >
        <DynamicInput
          name="Family"
          type="text"
          value={userData.Family}
          onChange={e => handleChange('Family', e.target.value)}
          className='-mt-5'
        />
      </div>
      {!selectedRow && (
        <>
          <div >
            <DynamicInput
              name="Password"
              type="password"
              value={userData.Password}
              onChange={e => handleChange('Password', e.target.value)}
              className='-mt-5'
              required
            />
          </div>
          <div >
            <DynamicInput
              name="Confirm Password"
              type="password"
              value={userData.ConfirmPassword}
              onChange={e => handleChange('ConfirmPassword', e.target.value)}
              className='-mt-5'
              required
            />
          </div>
        </>
      )}
      {selectedRow && (
        <>
          <div >
            <DynamicInput
              name="Password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password (optional)"
              className='-mt-5'
            />
          </div>
          <div >
            <button
              onClick={handleChangePasswordClick}
              className="px-5 py-2.5 border rounded bg-gradient-to-r from-[#e14aa7] via-[#6761f0] to-[#b23ace] text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-[#b23ace] hover:via-[#6761f0] hover:to-[#e14aa7]"
            >
              Change Password
            </button>
          </div>
        </>
      )}
      <div >
        <DynamicInput
          name="Email"
          type="text"
          value={userData.Email}
          onChange={e => handleChange('Email', e.target.value)}
          className='-mt-5'
        />
      </div>
      <div >
        <DynamicInput
          name="Mobile"
          type="text"
          value={userData.Mobile}
          onChange={e => handleChange('Mobile', e.target.value)}
          className='-mt-5'
        />
      </div>
      <div >
        <DynamicInput
          name="Website"
          type="text"
          value={userData.Website}
          onChange={e => handleChange('Website', e.target.value)}
          className='-mt-5'
        />
      </div>
      <div >
        <DynamicSelector
          name="User Type"
          options={userTypeOptions}
          selectedValue={userData.userType.toString()}
          onChange={e => handleChange('userType', parseInt(e.target.value))}
          label="User Type"
          className='-mt-6'
        />
      </div>
      <div >
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-4">User Profile Image</h3>
          <FileUploadHandler
            selectedFileId={userData.UserImageId}
            onUploadSuccess={handleImageUploadSuccess}
            resetCounter={resetCounter}
            onReset={handleResetUpload}
          />
        </div>
      </div>
      {/* مدال پیام (برای خطا یا اطلاع رسانی) */}
      <DynamicConfirm
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        onConfirm={() => setModalOpen(false)}
        onClose={() => setModalOpen(false)}
        variant={modalVariant}
        hideCancelButton={true}
      />
      {/* مدال تایید تغییر پسورد */}
      <DynamicConfirm
        isOpen={passwordConfirmModalOpen}
        title="Confirm"
        message="Are you sure you want to change password?"
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

User2.displayName = 'User2';

export default User2;
