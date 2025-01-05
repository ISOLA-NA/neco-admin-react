import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import TwoColumnLayout from '../layout/TwoColumnLayout';
import DynamicInput from '../utilities/DynamicInput';
import DynamicSelector from '../utilities/DynamicSelector';
import FileUploadHandler from '../../services/FileUploadHandler';
import { useAddEditDelete } from '../../context/AddEditDeleteContext';
import type { GetEnumResponse, User as UserType } from '../../services/api.services';
import { showAlert } from '../utilities/Alert/DynamicAlert';
import AppServices from '../../services/api.services';

export interface UserHandle {
  save: () => Promise<UserType | null>;
}

interface UserProps {
  selectedRow: any;
}

const User2 = forwardRef<UserHandle, UserProps>(({ selectedRow }, ref) => {
  const { handleSaveUser } = useAddEditDelete();
  const [userTypeOptions, setUserTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [newPassword, setNewPassword] = useState(''); // Added state for new password

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
        const response: GetEnumResponse = await AppServices.getEnum({
          str: 'UserType',
        });
        const options = Object.entries(response).map(([key, val]) => ({
          value: val.toString(),
          label: key,
        }));
        setUserTypeOptions(options);
      } catch (error) {
        console.error('Error fetching UserType enums:', error);
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
      setNewPassword(''); // Reset new password when selected row changes
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

  // Added changePassword function
  const changePassword = async () => {
    if (!newPassword) {
      showAlert(
        'error',
        null,
        'Validation Error',
        'New password cannot be empty'
      );
      return;
    }

    try {
      const payload = {
        UserId: selectedRow.ID,
        Password: newPassword,
      };

      await AppServices.changePasswordByAdmin(payload);

      showAlert('success', null, 'Success', 'Password changed successfully');
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      showAlert(
        'error',
        null,
        'Error',
        'Failed to change password'
      );
    }
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
      showAlert('error', null, 'Validation Error', 'Username is required');
      return false;
    }

    if (!userData.Name) {
      showAlert('error', null, 'Validation Error', 'Name is required');
      return false;
    }

    if (!selectedRow && !userData.Password) {
      showAlert('error', null, 'Validation Error', 'Password is required for new users');
      return false;
    }

    if (userData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.Email)) {
      showAlert('error', null, 'Validation Error', 'Invalid email format');
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
        // If editing and no new password is entered, don't send password
        if (!userData.Password) {
          delete dataToSave.Password;
        }
      } else {
        // Creating new user
        delete dataToSave.ID;
        dataToSave.ConfirmPassword = userData.ConfirmPassword;
      }

      console.log('Data to Save:', dataToSave);

      const result = await handleSaveUser(dataToSave);

      if (result) {
        showAlert(
          'success',
          null,
          'Success',
          `User ${selectedRow ? 'updated' : 'created'} successfully`
        );
      }

      return result;
    } catch (error) {
      console.error('Error saving user:', error);
      showAlert(
        'error',
        null,
        'Error',
        `Failed to ${selectedRow ? 'update' : 'create'} user`
      );
      return null;
    }
  };

  useImperativeHandle(ref, () => ({
    save,
  }));

  return (
    <TwoColumnLayout>
      <DynamicInput
        name="Code"
        type="number"
        value={userData.Code}
        onChange={e => handleChange('Code', e.target.value)}
        disabled={!!selectedRow}
      />

      <DynamicInput
        name="Username"
        type="text"
        value={userData.Username}
        onChange={e => handleChange('Username', e.target.value)}
        required
        disabled={!!selectedRow}
      />

      <DynamicInput
        name="Name"
        type="text"
        value={userData.Name}
        onChange={e => handleChange('Name', e.target.value)}
        required
      />

      <DynamicInput
        name="Family"
        type="text"
        value={userData.Family}
        onChange={e => handleChange('Family', e.target.value)}
      />

      {!selectedRow && (
        <>
          <DynamicInput
            name="Password"
            type="password"
            value={userData.Password}
            onChange={e => handleChange('Password', e.target.value)}
            required
          />

          <DynamicInput
            name="Confirm Password"
            type="password"
            value={userData.ConfirmPassword}
            onChange={e => handleChange('ConfirmPassword', e.target.value)}
            required
          />
        </>
      )}

      {selectedRow && (
        <>
          <DynamicInput
            name="Password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter new password (optional)"
          />
          <button
            onClick={changePassword}
            className="mt-2 px-5 py-2.5 border-none rounded bg-gradient-to-r from-[#e14aa7] via-[#6761f0] to-[#b23ace] text-white cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-[#b23ace] hover:via-[#6761f0] hover:to-[#e14aa7]"
          >
            Change Password
          </button>
        </>
      )}

      <DynamicInput
        name="Email"
        type="text"
        value={userData.Email}
        onChange={e => handleChange('Email', e.target.value)}
      />

      <DynamicInput
        name="Mobile"
        type="text"
        value={userData.Mobile}
        onChange={e => handleChange('Mobile', e.target.value)}
      />

      <DynamicInput
        name="Website"
        type="text"
        value={userData.Website}
        onChange={e => handleChange('Website', e.target.value)}
      />

      <DynamicSelector
        name="User Type"
        options={userTypeOptions}
        selectedValue={userData.userType}
        onChange={e => handleChange('userType', parseInt(e.target.value))}
        label="User Type"
      />

      <div className="col-span-2 mt-4">
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
    </TwoColumnLayout>
  );
});

User2.displayName = 'User2';

export default User2;