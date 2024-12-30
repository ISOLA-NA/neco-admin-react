// src/components/Configuration/ButtonComponent.tsx

import React, { useState, useEffect } from "react";
import DataTable from "../../TableDynamic/DataTable"; // فرض بر این است که این کامپوننت وجود دارد
import DynamicInput from "../../utilities/DynamicInput"; // فرض بر این است که این کامپوننت وجود دارد
import DynamicRadioGroup from "../../utilities/DynamicRadiogroup"; // فرض بر این است که این کامپوننت وجود دارد
import TwoColumnLayout from "../../layout/TwoColumnLayout"; // فرض بر این است که این کامپوننت وجود دارد
import DynamicButton from "../../utilities/DynamicButtons"; // فرض بر این است که این کامپوننت وجود دارد

import ImageUploader from "../../utilities/ImageUploader";

import fileService from "../../../services/api.servicesFile"; // اطمینان از مسیر صحیح
import apiService from "../../../services/api.services";      // اطمینان از مسیر صحیح

interface InsertModel {
  ID: string;
  gid: string;
  FileIQ: string;
  FileName: string;
  FileSize: number;
  FolderName: string;
  IsVisible: boolean;
  LastModified: Date | null;
  SenderID: string | null;
  FileType: string | null;
}

interface ButtonComponentProps {
  columnDefs: { headerName: string; field: string }[];
  rowData: any[];
  onRowDoubleClick: (data: any) => void;
  onRowClick: (data: any) => void;
  onSelectButtonClick: () => void;
  isSelectDisabled: boolean;
  onClose: () => void;
  onSelectFromButton: () => void;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  columnDefs,
  rowData,
  onRowDoubleClick,
  onRowClick,
  onSelectButtonClick,
  isSelectDisabled,
  onClose,
  onSelectFromButton,
}) => {
  // State management
  const [selectedState, setSelectedState] = useState<string>("accept");
  const [selectedCommand, setSelectedCommand] = useState<string>("accept");

  const [nameValue, setNameValue] = useState("");
  const [stateTextValue, setStateTextValue] = useState("");
  const [tooltipValue, setTooltipValue] = useState("");
  const [orderValue, setOrderValue] = useState("");

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isRowClicked, setIsRowClicked] = useState<boolean>(false);

  const [uploadedFileInfo, setUploadedFileInfo] = useState<InsertModel | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [downloadedPreviewUrl, setDownloadedPreviewUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  // قالب‌بندی تاریخ
  const dateFormat = (inputDate: Date, format: string): string => {
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    let formatted = format.replace("MM", month.toString().padStart(2, "0"));

    if (formatted.includes("yyyy")) {
      formatted = formatted.replace("yyyy", year.toString());
    } else if (formatted.includes("yy")) {
      formatted = formatted.replace("yy", year.toString().substr(2, 2));
    }

    formatted = formatted.replace("dd", day.toString().padStart(2, "0"));
    return formatted;
  };

  // تولید UUID ساده
  const uuid = (): string => {
    let uuidValue = "",
      k,
      randomValue;
    for (k = 0; k < 32; k++) {
      randomValue = (Math.random() * 16) | 0;
      if (k === 8 || k === 12 || k === 16 || k === 20) {
        uuidValue += "-";
      }
      uuidValue +=
        k === 12
          ? "4"
          : k === 16
          ? ((randomValue & 3) | 8).toString(16)
          : randomValue.toString(16);
    }
    return uuidValue;
  };

  // دریافت ID کاربر از سرور
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await apiService.getIdByUserToken();
        if (res && res.length > 0) {
          setUserId(res[0].ID.toString());
        }
      } catch (err: any) {
        console.error("خطا در دریافت ID کاربر:", err);
        setErrorMessage("خطا در دریافت اطلاعات کاربر.");
      }
    };
    fetchUserId();
  }, []);

  /**
   * متد آپلود فایل
   */
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setDownloadedPreviewUrl(null); // پاک کردن تصویر دانلود شده هنگام آپلود فایل جدید

    try {
      // اعتبارسنجی پسوند فایل
      const allowedExtensions = ["jpg", "jpeg", "png"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setErrorMessage(
          "لطفاً فقط فایل‌های با پسوند jpg، jpeg یا png را انتخاب کنید."
        );
        setIsLoading(false);
        return;
      }

      // تولید UUID برای gid و سایر شناسه‌ها
      const UUID = uuid();
      const folderName = dateFormat(new Date(), "yy-MM-dd");

      // ایجاد FormData
      const formData = new FormData();
      formData.append("gid", UUID); // افزودن gid به payload
      formData.append("FileName", `${UUID}.${fileExtension}`);
      formData.append("FolderName", folderName);
      formData.append("file", file); // کلید "file" مطابق نیاز سرویس

      // آپلود فایل
      const uploadResponse = await fileService.uploadFile(formData);

      if (uploadResponse && uploadResponse.data) {
        const { FileIQ, FileName, FileSize } = uploadResponse.data;

        // ایجاد مدل برای درج در دیتابیس
        const insertModel: InsertModel = {
          ID: UUID,
          gid: UUID, // اختصاص gid
          FileIQ: FileIQ || UUID,
          FileName: FileName || file.name,
          FileSize: FileSize || file.size,
          FolderName: folderName,
          IsVisible: true,
          LastModified: null,
          SenderID: userId,
          FileType: `.${fileExtension}`,
        };

        // درج اطلاعات فایل در دیتابیس
        await fileService.insert(insertModel);

        // به‌روزرسانی وضعیت‌ها
        setUploadedFileInfo(insertModel);

        // استفاده از FileReader برای تبدیل فایل آپلود شده به Data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        alert("فایل با موفقیت آپلود و درج شد.");

        // فراخوانی callback پس از موفقیت‌آمیز بودن آپلود
        handleUploadSuccess(insertModel);
      }
    } catch (error: any) {
      console.error("خطا در آپلود یا درج فایل:", error);
      setErrorMessage("خطا در آپلود یا درج فایل.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * متد دانلود فایل
   * @param userImg شناسه فایل (مثلاً IconImageId) ارسال شده به سرور
   */
  const handleFileDownload = async (userImg: string) => {
    if (!userImg) {
      setDownloadedPreviewUrl(null); // پاک کردن تصویر اگر userImg خالی باشد
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setUploadedPreviewUrl(null); // پاک کردن تصویر آپلود شده هنگام دانلود فایل جدید

    try {
      // دریافت جزئیات فایل با استفاده از userImg
      const res = await fileService.getFile(userImg);

      if (!res.data) {
        setErrorMessage("فایل مورد نظر یافت نشد.");
        setIsLoading(false);
        return;
      }

      // استخراج داده‌های مورد نیاز
      const { FileIQ, FileType, FolderName } = res.data;
      const obj = {
        FileName: `${FileIQ}${FileType}`,
        FolderName: FolderName,
      };

      // دانلود فایل به صورت باینری
      const downloadResponse = await fileService.download(obj);

      // تبدیل آرایه بایت به Blob
      const blob = new Blob([downloadResponse.data], { type: "application/octet-stream" });

      // استفاده از FileReader برای تبدیل Blob به Data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setDownloadedPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error("خطا در دانلود فایل:", err);
      setErrorMessage("خطا در دانلود فایل.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * هندل کردن دوبار کلیک روی ردیف
   */
  const handleRowDoubleClickLocal = (data: any) => {
    setSelectedRow(data);
    onRowDoubleClick(data);
  };

  /**
   * هندل کردن کلیک روی ردیف
   */
  const handleRowClickLocal = async (data: any) => {
    try {
      // تنظیم ردیف انتخاب شده
      setSelectedRow(data);
      onRowClick(data);
      setIsRowClicked(true);

      // تنظیم مقادیر ورودی‌ها
      setNameValue(data.Name || "");
      setStateTextValue(data.StateText || "");
      setTooltipValue(data.Tooltip || "");
      setOrderValue(data.Order || "");

      if (data.WFStateForDeemed !== undefined) {
        setSelectedState(mapWFStateForDeemedToRadio(data.WFStateForDeemed));
      } else {
        setSelectedState("accept");
      }

      if (data.WFCommand !== undefined) {
        setSelectedCommand(mapWFCommandToRadio(data.WFCommand));
      } else {
        setSelectedCommand("accept");
      }

      // گام 1: پاکسازی تصویر آپلود شده
      setUploadedPreviewUrl(null);
      console.log("پاکسازی تصویر آپلود شده.");

      // گام 2: پاکسازی تصویر دانلود شده
      setDownloadedPreviewUrl(null);
      console.log("پاکسازی تصویر دانلود شده.");

      // گام 3: دانلود تصویر جدید
      if (data.IconImageId) {
        console.log("در حال دانلود تصویر جدید برای IconImageId:", data.IconImageId);
        await handleFileDownload(data.IconImageId);
        console.log("تصویر جدید با موفقیت دانلود شد.");
      } else {
        console.log("IconImageId موجود نیست؛ دانلود تصویر جدید انجام نشد.");
      }
    } catch (error) {
      console.error("خطا در handleRowClickLocal:", error);
    }
  };

  /**
   * هندل کردن موفقیت‌آمیز بودن آپلود
   */
  const handleUploadSuccess = (insertModel: InsertModel) => {
    if (selectedRow && selectedRow.IconImageId) {
      // فراخوانی متد دانلود فایل برای ردیف انتخاب شده
      handleFileDownload(selectedRow.IconImageId);
    }
  };

  // توابع کمکی برای تبدیل مقادیر
  const mapWFStateForDeemedToRadio = (val: number) => {
    switch (val) {
      case 1:
        return "accept";
      case 2:
        return "reject";
      case 3:
        return "close";
      default:
        return "accept";
    }
  };

  const mapWFCommandToRadio = (val: number) => {
    switch (val) {
      case 1:
        return "accept";
      case 2:
        return "close";
      case 3:
        return "reject";
      case 4:
        return "client";
      case 5:
        return "admin";
      default:
        return "accept";
    }
  };

  // هندل کردن کلیک روی دکمه انتخاب
  const handleSelectButtonClickLocal = () => {
    onSelectButtonClick();
    onSelectFromButton();
    onClose();
    setIsRowClicked(false);
  };

  return (
    <div className="bg-white rounded-lg p-4 flex flex-col h-full">
      <div className="mb-4">
        <DataTable
          columnDefs={columnDefs}
          rowData={rowData}
          onRowDoubleClick={handleRowDoubleClickLocal}
          setSelectedRowData={handleRowClickLocal}
          showDuplicateIcon={false}
          onAdd={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onDuplicate={() => {}}
          domLayout="autoHeight"
        />
      </div>

      <TwoColumnLayout>
        <DynamicInput
          name="Name"
          type="text"
          value={nameValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNameValue(e.target.value)
          }
        />
        <DynamicInput
          name="State Text"
          type="text"
          value={stateTextValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setStateTextValue(e.target.value)
          }
        />
        <DynamicInput
          name="Tooltip"
          type="text"
          value={tooltipValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTooltipValue(e.target.value)
          }
        />
        <DynamicInput
          name="Order"
          type="text"
          value={orderValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setOrderValue(e.target.value)
          }
        />
      </TwoColumnLayout>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
        {/* سمت چپ: رادیو باتن‌ها */}
        <div style={{ flex: "1" }} className="px-5">
          <DynamicRadioGroup
            key={`state-${isRowClicked ? "controlled" : "uncontrolled"}`}
            title="State:"
            name="stateGroup"
            options={[
              { value: "accept", label: "Accept" },
              { value: "reject", label: "Reject" },
              { value: "close", label: "Close" },
            ]}
            selectedValue={selectedState}
            onChange={(value) => setSelectedState(value)}
            isRowClicked={isRowClicked}
            className="mt-10"
          />

          <DynamicRadioGroup
            key={`command-${isRowClicked ? "controlled" : "uncontrolled"}`}
            title="Command:"
            name="commandGroup"
            options={[
              { value: "accept", label: "Accept" },
              { value: "reject", label: "Reject" },
              { value: "close", label: "Close" },
              { value: "client", label: "Previous State Client" },
              { value: "admin", label: "Previous State Admin" },
            ]}
            selectedValue={selectedCommand}
            onChange={(value) => setSelectedCommand(value)}
            isRowClicked={isRowClicked}
            className="mt-10"
          />
        </div>

        {/* سمت راست: آپلودر */}
        <ImageUploader
          onUpload={handleFileUpload}
          externalPreviewUrl={downloadedPreviewUrl}
        />
      </div>

      {/* نمایش اطلاعات فایل آپلود شده (اختیاری) */}
      {uploadedFileInfo && (
        <div className="w-full bg-green-100 p-4 rounded-lg mt-4">
          <h3 className="text-md font-semibold">فایل آپلودشده:</h3>
          <p>
            <strong>GID:</strong> {uploadedFileInfo.gid}
          </p>
          <p>
            <strong>File IQ:</strong> {uploadedFileInfo.FileIQ}
          </p>
          <p>
            <strong>File Name:</strong> {uploadedFileInfo.FileName}
          </p>
          <p>
            <strong>File Size:</strong> {uploadedFileInfo.FileSize} bytes
          </p>
          <p>
            <strong>Folder Name:</strong> {uploadedFileInfo.FolderName}
          </p>
          <p>
            <strong>Sender ID:</strong> {uploadedFileInfo.SenderID}
          </p>
          <p>
            <strong>File Type:</strong> {uploadedFileInfo.FileType}
          </p>
        </div>
      )}

      {/* نمایش پیام در حال بارگذاری */}
      {isLoading && <p className="text-blue-500 mt-4">در حال آپلود یا دانلود...</p>}

      {/* نمایش پیام خطا */}
      {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}

      <div className="mt-4 flex justify-center">
        <DynamicButton
          text="Select"
          onClick={handleSelectButtonClickLocal}
          isDisabled={isSelectDisabled}
        />
      </div>
    </div>
  );
};

export default ButtonComponent;
