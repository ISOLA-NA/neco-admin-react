// src/components/User.tsx

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import TwoColumnLayout from '../layout/TwoColumnLayout'
import DynamicInput from '../utilities/DynamicInput'
import DynamicSelector from '../utilities/DynamicSelector'
import { useAddEditDelete } from '../../context/AddEditDeleteContext'
import type { User as UserType } from '../../services/api.services'
import { showAlert } from '../utilities/Alert/DynamicAlert'

export interface UserHandle {
  save: () => Promise<UserType | null>
}

interface UserProps {
  selectedRow: any
}

const User = forwardRef<UserHandle, UserProps>(({ selectedRow }, ref) => {
  const { handleSaveUser } = useAddEditDelete()

  const [userData, setUserData] = useState({
    ID: selectedRow?.ID || null,
    Username: selectedRow?.Username || '',
    Name: selectedRow?.Name || '',
    Family: selectedRow?.Family || '',
    Email: selectedRow?.Email || '',
    Mobile: selectedRow?.Mobile || '',
    Password: '', // همیشه خالی است
    ConfirmPassword: '', // همیشه خالی است
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
  })

  useEffect(() => {
    if (selectedRow) {
      setUserData({
        ID: selectedRow.ID,
        Username: selectedRow.Username || '',
        Name: selectedRow.Name || '',
        Family: selectedRow.Family || '',
        Email: selectedRow.Email || '',
        Mobile: selectedRow.Mobile || '',
        Password: '', // همیشه خالی است
        ConfirmPassword: '', // همیشه خالی است
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
      })
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
      })
    }
  }, [selectedRow])

  const handleChange = (field: keyof typeof userData, value: any) => {
    setUserData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = () => {
    if (!userData.Username) {
      showAlert('error', null, 'Validation Error', 'Username is required')
      return false
    }

    if (!selectedRow && !userData.Password) {
      showAlert(
        'error',
        null,
        'Validation Error',
        'Password is required for new users'
      )
      return false
    }

    if (!userData.Name) {
      showAlert('error', null, 'Validation Error', 'Name is required')
      return false
    }

    if (!selectedRow && userData.Password !== userData.ConfirmPassword) {
      showAlert('error', null, 'Validation Error', 'Passwords do not match')
      return false
    }

    if (selectedRow && userData.Password) {
      if (userData.Password !== userData.ConfirmPassword) {
        showAlert(
          'error',
          null,
          'Validation Error',
          'New passwords do not match'
        )
        return false
      }
    }

    if (userData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.Email)) {
      showAlert('error', null, 'Validation Error', 'Invalid email format')
      return false
    }

    return true
  }

  const save = async (): Promise<UserType | null> => {
    if (!validateForm()) {
      return null
    }

    try {
      // آماده‌سازی داده‌ها برای ذخیره‌سازی
      const dataToSave: UserType = {
        ...userData,
        LastModified: new Date().toISOString(),
        CreateDate: userData.CreateDate ?? null,
        LastLoginTime: userData.LastLoginTime ?? null,
        UserImageId: userData.UserImageId ?? null,
      }

      if (selectedRow) {
        // ویرایش کاربر موجود
        if (userData.Password) {
          // اگر رمز عبور جدید وارد شده باشد
          dataToSave.Password = userData.Password
          dataToSave.ConfirmPassword = userData.ConfirmPassword
        } else {
          // حذف فیلدهای رمز عبور اگر رمز عبور جدید وارد نشده باشد
          delete dataToSave.Password
          delete dataToSave.ConfirmPassword
        }
      } else {
        // ایجاد کاربر جدید
        dataToSave.Password = userData.Password
        dataToSave.ConfirmPassword = userData.ConfirmPassword
      }

      // اگر کاربر جدید است، مطمئن شویم که ID تعریف نشده است
      if (!selectedRow) {
        delete dataToSave.ID
      }

      const result = await handleSaveUser(dataToSave)

      if (result) {
        showAlert(
          'success',
          null,
          'Success',
          `User ${selectedRow ? 'updated' : 'created'} successfully`
        )
      }

      return result
    } catch (error) {
      console.error('Error saving user:', error)
      showAlert(
        'error',
        null,
        'Error',
        `Failed to ${selectedRow ? 'update' : 'create'} user`
      )
      return null
    }
  }

  useImperativeHandle(ref, () => ({
    save,
  }))

  const userTypes = [
    { value: '0', label: 'Admin' },
    { value: '1', label: 'Sysadmin' },
    { value: '2', label: 'Employee' },
  ]

  const statusOptions = [
    { value: '0', label: 'Active' },
    { value: '1', label: 'Inactive' },
    { value: '2', label: 'Suspended' },
  ]

  return (
    <TwoColumnLayout>
      {/* Code Field - Always visible but disabled in edit mode */}
      <DynamicInput
        name='Code'
        type='number'
        value={userData.Code}
        onChange={e => handleChange('Code', e.target.value)}
        disabled={!!selectedRow}
      />

      <DynamicInput
        name='Username'
        type='text'
        value={userData.Username}
        onChange={e => handleChange('Username', e.target.value)}
        required
        disabled={!!selectedRow}
      />

      <DynamicInput
        name='Name'
        type='text'
        value={userData.Name}
        onChange={e => handleChange('Name', e.target.value)}
        required
      />

      <DynamicInput
        name='Family'
        type='text'
        value={userData.Family}
        onChange={e => handleChange('Family', e.target.value)}
      />

      {!selectedRow && (
        <>
          {/* برای ایجاد کاربر جدید */}
          <DynamicInput
            name='Password'
            type='password'
            value={userData.Password}
            onChange={e => handleChange('Password', e.target.value)}
            required
          />

          <DynamicInput
            name='Confirm Password'
            type='password'
            value={userData.ConfirmPassword}
            onChange={e => handleChange('ConfirmPassword', e.target.value)}
            required
          />
        </>
      )}

      {selectedRow && (
        <>
          {/* برای ویرایش کاربر موجود */}
          <DynamicInput
            name='Password'
            type='password'
            value={userData.Password}
            onChange={e => handleChange('Password', e.target.value)}
            placeholder='Enter new password (optional)'
          />

          <DynamicInput
            name='Confirm Password'
            type='password'
            value={userData.ConfirmPassword}
            onChange={e => handleChange('ConfirmPassword', e.target.value)}
            placeholder='Confirm new password'
            disabled={!userData.Password}
          />
        </>
      )}

      <DynamicInput
        name='Email'
        type='text'
        value={userData.Email}
        onChange={e => handleChange('Email', e.target.value)}
      />

      <DynamicInput
        name='Mobile'
        type='text'
        value={userData.Mobile}
        onChange={e => handleChange('Mobile', e.target.value)}
      />

      <DynamicInput
        name='Website'
        type='text'
        value={userData.Website}
        onChange={e => handleChange('Website', e.target.value)}
      />

      <DynamicSelector
        name='User Type'
        options={userTypes}
        selectedValue={userData.userType.toString()}
        onChange={e => handleChange('userType', parseInt(e.target.value))}
        label='User Type'
      />

      <DynamicSelector
        name='Status'
        options={statusOptions}
        selectedValue={userData.Status.toString()}
        onChange={e => handleChange('Status', parseInt(e.target.value))}
        label='Status'
      />

      <DynamicInput
        name='TTKK'
        type='text'
        value={userData.TTKK}
        onChange={e => handleChange('TTKK', e.target.value)}
      />

      <div className='flex items-center gap-2 mt-2'>
        <label htmlFor='isVisible' className='text-sm font-medium'>
          Is Visible:
        </label>
        <input
          id='isVisible'
          type='checkbox'
          checked={userData.IsVisible}
          onChange={e => handleChange('IsVisible', e.target.checked)}
          className='form-checkbox h-4 w-4'
        />
      </div>
    </TwoColumnLayout>
  )
})

User.displayName = 'User'

export default User
