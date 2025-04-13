// File: Account.tsx

import React, { useState, useEffect } from 'react';
import { FaLock } from 'react-icons/fa';
import { IoIosRefresh } from "react-icons/io";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { RiLogoutCircleLine } from "react-icons/ri";

import projectService from '../../../../services/api.servicesFile';
import FileUploadHandler from '../../../../services/FileUploadHandler';

const Account: React.FC = () => {
  // state های مربوط به ورودی‌های ستون چپ
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const [lastName, setLastName] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');

  // state برای بخش Right Side
  const [activeRibbon, setActiveRibbon] = useState('Home');

  // گزینه‌های Select برای بخش Ribbon
  const ribbonOptions = ['Home', 'Dashboard', 'Profile'];

  // state مربوط به عکس کاربر
  const [userImageId, setUserImageId] = useState<string | null>('existing-user-image-id');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // متدهای دکمه‌ها
  const handleChangePassword = () => {
    alert('Change Password clicked!');
  };

  const handleUpdate = () => {
    alert('Update clicked!');
  };

  const handleSwitchAccount = () => {
    alert('Switch Account clicked!');
  };

  const handleSignOut = () => {
    alert('Sign Out clicked!');
  };

  // استفاده از useEffect برای فراخوانی متد getIdByUserToken
  useEffect(() => {
    const fetchUserTokenId = async () => {
      try {
        const res = await projectService.getIdByUserToken();
        console.log("Response Data:", res.data);
        // فرض بر این است که res.data شامل شناسه عکس کاربر به عنوان userImageId باشد
        if (res.data?.UserImageId) {
          setUserImageId(res.data.UserImageId);
        }
      } catch (error) {
        console.error("Error fetching user token ID:", error);
      }
    };

    fetchUserTokenId();
  }, []);

  return (
    <div className="container mx-auto mt-6 px-4">
      <h2 className="text-2xl font-bold mb-8">Account Information</h2>
      <div className="flex flex-col md:flex-row gap-6">
        {/* ستون سمت چپ: User Information */}
        <div className="w-full md:w-2/3">
          <div className="border rounded shadow p-4 h-[600px]">
            <h4 className="text-xl font-semibold mb-4">User Information</h4>

            {/* بخش آواتار و اطلاعات کاربر */}
            <div className="flex items-center gap-4 mb-4">
              {/* استفاده از FileUploadHandler */}
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <FileUploadHandler 
                  selectedFileId={userImageId} 
                  hideUploader={true}
                  onPreviewUrlChange={setPreviewUrl}
                  resetCounter={0}
                  onReset={() => {}}
                />
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="User Avatar" 
                    className="w-16 h-16 rounded-full object-cover" 
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100">
                    <p className="text-xs text-gray-500">Loading Image...</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-lg font-medium">Sepehr Hasanzade</p>
                <p className="text-sm text-gray-600">
                  Test Controller repo : test Actor2, test actor3...
                </p>
              </div>
            </div>

            <hr className="my-4" />

            {/* فرم به دو ستون */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border p-2 w-full rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 w-full rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Mobile</label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="border p-2 w-full rounded"
                  />
                </div>
              </div>

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
                    onClick={handleUpdate}
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
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border p-2 w-full rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">WebSite</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="border p-2 w-full rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Email</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 w-full rounded"
                  />
                </div>
              </div>
            </div>

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
              className="border p-2 w-full rounded"
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
