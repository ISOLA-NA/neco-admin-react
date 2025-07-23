import React, { useState, useEffect, useCallback } from "react";
import DataTable from "../../TableDynamic/DataTable";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicRadioGroup from "../../utilities/DynamicRadiogroup";
import DynamicButton from "../../utilities/DynamicButtons";
import FileUploadHandler, {
  InsertModel,
} from "../../../services/FileUploadHandler";
import { useApi } from "../../../context/ApiContext";
import { AFBtnItem } from "../../../services/api.services";
import DynamicConfirm from "../../utilities/DynamicConfirm"; // اضافه کردن ایمپورت

interface ButtonComponentProps {
  columnDefs: { headerName: string; field: string }[];
  onRowDoubleClick: (data: AFBtnItem) => void;
  onRowClick: (data: AFBtnItem) => void;
  onSelectButtonClick: () => void;
  isSelectDisabled: boolean;
  onClose: () => void;
  onSelectFromButton: () => void;
  refreshButtons: () => void; // تابع برای به‌روز‌رسانی لیست دکمه‌ها
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  columnDefs,
  onRowDoubleClick,
  onRowClick,
  onSelectButtonClick,
  isSelectDisabled,
  onClose,
  onSelectFromButton,
  refreshButtons,
}) => {
  const api = useApi();

  // ----- state های فرم -----
  const [selectedState, setSelectedState] = useState<string>("accept");
  const [selectedCommand, setSelectedCommand] = useState<string>("accept");
  const [nameValue, setNameValue] = useState("");
  const [stateTextValue, setStateTextValue] = useState("");
  const [tooltipValue, setTooltipValue] = useState("");
  const [orderValue, setOrderValue] = useState("");

  const [selectedRow, setSelectedRow] = useState<AFBtnItem | null>(null);
  const [isRowClicked, setIsRowClicked] = useState<boolean>(false);

  // فایل آپلودی
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // شمارنده ریست
  const [resetCounter, setResetCounter] = useState<number>(0);

  // داده‌های جدول
  const [rowData, setRowData] = useState<AFBtnItem[]>([]);

  // برای دکمه Delete
  const [isDeleteDisabled, setIsDeleteDisabled] = useState<boolean>(true);

  // وضعیت خطای تصویر
  const [imageError, setImageError] = useState<boolean>(false);

  // رادیوها
  const RadioOptionsState = [
    { value: "accept", label: "Accept" },
    { value: "reject", label: "Reject" },
    { value: "close", label: "Close" },
  ];
  const RadioOptionsCommand = [
    { value: "accept", label: "Accept" },
    { value: "reject", label: "Reject" },
    { value: "close", label: "Close" },
    { value: "client", label: "Previous State Client" },
    { value: "admin", label: "Previous State Admin" },
  ];

  // ----- DynamicConfirm state -----
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVariant, setConfirmVariant] = useState<
    "add" | "edit" | "delete" | "notice" | "error"
  >("notice");
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmHideCancel, setConfirmHideCancel] = useState<boolean>(false);
  // تابع اکشنی که بعد از زدن دکمه "Confirm" اجرا می‌شود
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => { });

  // تابع کمکی برای بازکردن DynamicConfirm
  const openConfirm = (
    variant: "add" | "edit" | "delete" | "notice" | "error",
    title: string,
    message: string,
    hideCancelButton: boolean,
    action?: () => void
  ) => {
    setConfirmVariant(variant);
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmHideCancel(hideCancelButton);
    if (action) {
      setOnConfirmAction(() => action);
    } else {
      setOnConfirmAction(() => () => setConfirmOpen(false));
    }
    setConfirmOpen(true);
  };

  // وقتی دکمه Confirm در DynamicConfirm کلیک شد
  const handleConfirm = () => {
    onConfirmAction();
    setConfirmOpen(false);
  };

  // ==============================
  //       توابع اصلی CRUD
  // ==============================

  // گرفتن کل داده‌ها از API
  // const fetchAllAFBtn = async () => {
  //   try {
  //     const response = await api.getAllAfbtn();
  //     setRowData(response);
  //   } catch (error) {
  //     console.error("Error fetching AFBtn data:", error);
  //     openConfirm("error", "Error", "Failed to fetch data.", true);
  //   }
  // };

 const fetchAllAFBtn = async () => {
  try {
    const response = await api.getAllAfbtn();

    /* 🔵 اگر می‌خواهید کل آرایه را یک‌بار ببینید */
    console.log("AFBtn raw response ➜", response);

    const decorated = response.map((item, idx) => {
      /* 🔵 لاگ‌گرفتن از تک‌تک آیتم‌ها */
      console.log(`AFBtn item #${idx} ➜`, item);

      return {
        ...item,
        DisplayName: buildDisplayName(
          mapWFStateForDeemedToRadio(item.WFStateForDeemed),
          mapWFCommandToRadio(item.WFCommand),
          item.StateText ?? ""
        ),
      };
    });

    setRowData(decorated);
  } catch (error) {
    console.error("Error fetching AFBtn data:", error);
    openConfirm("error", "Error", "Failed to fetch data.", true);
  }
};



  useEffect(() => {
    fetchAllAFBtn();
  }, [api]);

  const handleReset = useCallback(() => {
    setNameValue("");
    setStateTextValue("");
    setTooltipValue("");
    setOrderValue("");
    setSelectedState(RadioOptionsState[0].value);
    setSelectedCommand(RadioOptionsCommand[0].value);
    setSelectedFileId(null);
    setSelectedRow(null);
    setIsRowClicked(false);
    setResetCounter((prev) => prev + 1);
    setIsDeleteDisabled(true);
    setImageError(false);
  }, [RadioOptionsState, RadioOptionsCommand]);

  // =========================
  //      ADD
  // =========================
  const handleAddClick = async () => {
    if (!nameValue.trim()) {
      openConfirm("notice", "Warning", "Name cannot be empty!", true);
      return;
    }

    const generatedName = buildDisplayName(
      selectedState,
      selectedCommand,
      stateTextValue
    );

    try {
      const newAFBtn: AFBtnItem = {
        ID: 0,
        Name: generatedName,
        Tooltip: tooltipValue,
        StateText: stateTextValue,
        Order: parseInt(orderValue || "0"),
        WFStateForDeemed: radioToWFStateForDeemed(selectedState),
        WFCommand: radioToWFCommand(selectedCommand),
        IconImageId: selectedFileId,
        IsVisible: true,
        LastModified: null,
        ModifiedById: null,
      };
      await api.insertAFBtn(newAFBtn);
      openConfirm("add", "Success", "Item added successfully.", true);
      await fetchAllAFBtn();
      if (refreshButtons) refreshButtons();
      handleReset();
    } catch (error) {
      console.error("Error inserting AFBtn:", error);
      openConfirm("error", "Error", "Failed to add item.", true);
    }
  };

  // =========================
  //      EDIT
  // =========================
  const handleEditClick = async () => {
    if (!selectedRow || !selectedRow.ID) {
      openConfirm("notice", "Warning", "Please select a row to edit.", true);
      return;
    }

    const generatedName = buildDisplayName(selectedState, selectedCommand, stateTextValue);

    // ابتدا یک Confirm برای ویرایش با پیام تایید نمایش داده می‌شود
    openConfirm(
      "edit",
      "Edit Confirmation",
      "Are you sure you want to edit this item?",
      false,
      async () => {
        try {
          const updatedAFBtn: AFBtnItem = {
            ID: selectedRow.ID,
            Name: generatedName,
            Tooltip: tooltipValue,
            StateText: stateTextValue,
            Order: parseInt(orderValue || "0"),
            WFStateForDeemed: radioToWFStateForDeemed(selectedState),
            WFCommand: radioToWFCommand(selectedCommand),
            IconImageId: selectedFileId,
            IsVisible: true,
            LastModified: null,
            ModifiedById: null,
          };
          await api.updateAFBtn(updatedAFBtn);
          // پس از موفقیت عملیات ویرایش، پیام تایید نمایش داده می‌شود که بعد از 3 ثانیه بسته می‌شود
          openConfirm("notice", "Success", "Item updated successfully.", true);
          setTimeout(() => {
            setConfirmOpen(false);
          }, 3000);
          await fetchAllAFBtn();
          if (refreshButtons) refreshButtons();
          handleReset();
        } catch (error) {
          console.error("Error updating AFBtn:", error);
          openConfirm("error", "Error", "Failed to update item.", true);
        }
      }
    );
  };

  // =========================
  //      DELETE
  // =========================
  const handleDeleteClick = async () => {
    if (!selectedRow || !selectedRow.ID) {
      openConfirm("notice", "Warning", "Please select a row to delete.", true);
      return;
    }

    // Confirm حذف با دکمه Cancel نمایش داده می‌شود
    openConfirm(
      "delete",
      "Delete Confirmation",
      "Are you sure you want to delete this item?",
      false,
      async () => {
        try {
          await api.deleteAFBtn(selectedRow.ID);
          openConfirm("notice", "Success", "Item deleted successfully.", true);
          await fetchAllAFBtn();
          if (refreshButtons) refreshButtons();
          handleReset();
        } catch (error) {
          console.error("Error deleting AFBtn:", error);
          openConfirm("error", "Error", "Failed to delete item.", true);
        }
      }
    );
  };

  // =========================
  //      NEW
  // =========================
  const handleNewClick = () => {
    handleReset();
  };

  // آپلود موفقیت‌آمیز
  const handleUploadSuccess = (insertModel: InsertModel) => {
    const newFileId = insertModel.ID || null;
    if (selectedRow) {
      const updatedRow = { ...selectedRow, IconImageId: newFileId };
      setSelectedRow(updatedRow);
    }
    setSelectedFileId(newFileId);
    fetchAllAFBtn();
  };

  useEffect(() => {
    if (selectedRow) {
      setIsDeleteDisabled(false);
    } else {
      setIsDeleteDisabled(true);
    }
  }, [selectedRow]);

  // =========================
  //  توابع کمکی مپ کردن WF
  // =========================
 const mapWFStateForDeemedToRadio = (val?: number): string => {
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


 const mapWFCommandToRadio = (val?: number): string => {
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

  const radioToWFStateForDeemed = (radioVal: string): number => {
    switch (radioVal) {
      case "accept":
        return 1;
      case "reject":
        return 2;
      case "close":
        return 3;
      default:
        return 1;
    }
  };
  const radioToWFCommand = (radioVal: string): number => {
    switch (radioVal) {
      case "accept":
        return 1;
      case "close":
        return 2;
      case "reject":
        return 3;
      case "client":
        return 4;
      case "admin":
        return 5;
      default:
        return 1;
    }
  };

  // رویدادهای جدول
  const handleRowDoubleClickLocal = (data: AFBtnItem) => {
    setSelectedRow(data);
    onRowDoubleClick(data);
  };

  const handleRowClickLocal = (data: AFBtnItem) => {
    setSelectedRow(data);
    onRowClick(data);
    setIsRowClicked(true);

    // پر کردن فرم
    setNameValue(data.Name || "");
    setStateTextValue(data.StateText || "");
    setTooltipValue(data.Tooltip || "");
    setOrderValue(data.Order?.toString() || "");

    if (data.WFStateForDeemed !== undefined) {
      setSelectedState(mapWFStateForDeemedToRadio(data.WFStateForDeemed));
    } else {
      setSelectedState(RadioOptionsState[0].value);
    }
    if (data.WFCommand !== undefined) {
      setSelectedCommand(mapWFCommandToRadio(data.WFCommand));
    } else {
      setSelectedCommand(RadioOptionsCommand[0].value);
    }
    if (data.IconImageId) {
      setSelectedFileId(data.IconImageId);
      setImageError(false);
    } else {
      setSelectedFileId(null);
      setImageError(false);
    }
  };

  const buildDisplayName = (
    stateRadio: string,
    commandRadio: string,
    stateText: string
  ) => {
    // تبدیل مقدار value رادیوها به برچسب نمایشی
    const stateLabel =
      RadioOptionsState.find((o) => o.value === stateRadio)?.label ?? "";
    const commandLabel =
      RadioOptionsCommand.find((o) => o.value === commandRadio)?.label ?? "";

    // اگر StateText پر شده باشد بگذارید اولِ اسم بیاید، وگرنه همان stateLabel
    const base = stateText.trim() || stateLabel;

    return `${base} (State: ${stateLabel} - Command: ${commandLabel})`;
  };


  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden bg-white rounded-lg p-4">
      {/* DynamicConfirm برای هشدارها */}
      <DynamicConfirm
        isOpen={confirmOpen}
        variant={confirmVariant}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={handleConfirm}
        onClose={() => setConfirmOpen(false)}
        hideCancelButton={confirmHideCancel}
      />

      {/* بخش جدول */}
      <div
        className="mb-4 w-full overflow-hidden"
        style={{ height: "400px", overflowY: "auto" }}
      >
        <DataTable
          columnDefs={columnDefs}
          rowData={rowData}
          onRowDoubleClick={handleRowDoubleClickLocal}
          setSelectedRowData={handleRowClickLocal}
          showDuplicateIcon={false}
          showEditIcon={false}
          showDeleteIcon={false}
          showAddIcon={false}
          onAdd={() => { }}
          onEdit={() => { }}
          onDelete={() => { }}
          onDuplicate={() => { }}
          domLayout="normal"
        />
      </div>

      {/* فرم ورودی‌ها */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <DynamicInput
              name="Name"
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className="sm:mr-2"
            />
            <DynamicInput
              name="StateText"
              type="text"
              value={stateTextValue}
              onChange={(e) => setStateTextValue(e.target.value)}
              className="sm:ml-2"
            />
            <DynamicInput
              name="Tooltip"
              type="text"
              value={tooltipValue}
              onChange={(e) => setTooltipValue(e.target.value)}
              className="sm:mr-2"
            />
            <DynamicInput
              name="Order"
              type="text"
              value={orderValue}
              onChange={(e) => setOrderValue(e.target.value)}
              className="sm:ml-2"
            />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            <DynamicRadioGroup
              key={`state-${isRowClicked ? "controlled" : "uncontrolled"}`}
              title="State:"
              name="stateGroup"
              options={RadioOptionsState}
              selectedValue={selectedState}
              onChange={(value) => setSelectedState(value)}
              isRowClicked={isRowClicked}
            />
            <DynamicRadioGroup
              key={`command-${isRowClicked ? "controlled" : "uncontrolled"}`}
              title="Command:"
              name="commandGroup"
              options={RadioOptionsCommand}
              selectedValue={selectedCommand}
              onChange={(value) => setSelectedCommand(value)}
              isRowClicked={isRowClicked}
            />
          </div>
        </div>

        {/* آپلود فایل */}
        <div className="lg:col-span-1 flex flex-col items-start mt-4 lg:mt-0">
          <FileUploadHandler
            selectedFileId={selectedFileId}
            onUploadSuccess={handleUploadSuccess}
            resetCounter={resetCounter}
            onReset={handleReset}
            isEditMode={selectedRow !== null}
          />
        </div>
      </div>

      {/* نمایش تصویر در صورت وجود */}
      <div className="mt-4">
        {selectedFileId ? (
          !imageError ? (
            <img
              src={`/api/getImage/${selectedFileId}`}
              alt="Selected"
              className="w-32 h-32 object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div />
          )
        ) : (
          <p />
        )}
      </div>

      {/* دکمه‌های عملیات */}
      <div className="mt-6 flex justify-start space-x-4">
        {/* دکمه Add: وقتی روی یک ردیف کلیک شده، دکمه Add غیرفعال می‌شود */}
        <DynamicButton
          text="Add"
          onClick={handleAddClick}
          isDisabled={isRowClicked}
        />

        {/* دکمه Edit: تنها در صورتی فعال است که ردیفی انتخاب شده باشد */}
        <DynamicButton
          text="Edit"
          onClick={handleEditClick}
          isDisabled={!selectedRow}
        />

        {/* دکمه New: همیشه فعال و فرم را ریست می‌کند */}
        <DynamicButton text="New" onClick={handleNewClick} isDisabled={false} />

        {/* دکمه Delete: تنها درصورتی فعال که ردیفی انتخاب شده باشد */}
        <DynamicButton
          text="Delete"
          onClick={handleDeleteClick}
          isDisabled={isDeleteDisabled}
        />
      </div>
    </div>
  );
};

export default ButtonComponent;
