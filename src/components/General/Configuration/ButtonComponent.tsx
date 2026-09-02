import React, { useState, useEffect, useCallback } from "react";
import DataTable from "../../TableDynamic/DataTable";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicButton from "../../utilities/DynamicButtons";
import { useApi } from "../../../context/ApiContext";
import { AFBtnItem } from "../../../services/api.services";
import DynamicConfirm from "../../utilities/DynamicConfirm";
import { useTranslation } from "react-i18next";
import { FaPlus, FaPencilAlt, FaTrash, FaUndo, FaPaintBrush } from "react-icons/fa";
import FileUploadHandler from "../../../services/FileUploadHandler";

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
  // ✅ پیش‌فرض هر دو accept
  const [selectedState, setSelectedState] = useState<string>("accept");
  const [selectedCommand, setSelectedCommand] = useState<string>("accept");

  const [nameValue, setNameValue] = useState("");
  const [stateTextValue, setStateTextValue] = useState("");
  const [tooltipValue, setTooltipValue] = useState("");
  // ✅ پیش‌فرض Order مثل نمونه 1.0
  const [orderValue, setOrderValue] = useState("1");

  const [selectedRow, setSelectedRow] = useState<AFBtnItem | null>(null);
  const [isRowClicked, setIsRowClicked] = useState<boolean>(false);

  // ✅ پیش‌فرض: دکمه fa باشد + همان input با دکمه سوییچ بین Name و PersianName تغییر کند (بدون input جدید)
  // true => Name (FA), false => PersianName (EN)
  const [isFaMode, setIsFaMode] = useState(true);
  const [persianNameValue, setPersianNameValue] = useState("");
  const [persianStateTextValue, setPersianStateTextValue] = useState("");

  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

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

  const msg = (fa: string, en: string) => i18n.language === "fa" ? fa : en;

  // رادیوها
  const RadioOptionsState = [
    { value: "accept", label: t("Configuration.Accept", "Accept") },
    { value: "reject", label: t("Configuration.Reject", "Reject") },
    { value: "close", label: t("Configuration.Close", "Close") },
  ];
  const RadioOptionsCommand = [
    { value: "accept", label: t("Configuration.Accept", "Accept") },
    { value: "reject", label: t("Configuration.Reject", "Reject") },
    { value: "close", label: t("Configuration.Close", "Close") },
    {
      value: "client",
      label: t(
        "Configuration.GoToPreviousStateClient",
        "GoToPreviousStateClient"
      ),
    },
    {
      value: "admin",
      label: t(
        "Configuration.GoToPreviousStateAdmin",
        "GoToPreviousStateAdmin"
      ),
    },
  ];

  // برچسب انگلیسیِ ثابت فرمان برای نمایش داخل ستون جدول (مستقل از زبان رابط کاربری)
  const commandEnglishLabelMap: Record<string, string> = {
    accept: "Accept",
    reject: "Reject",
    close: "Close",
    client: "GoToPreviousStateClient",
    admin: "GoToPreviousStateAdmin",
  };

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

  const fetchAllAFBtn = async () => {
    try {
      const response = await api.getAllAfbtn();

      console.log("AFBtn raw response ➜", response);

      const decorated = response.map((item, idx) => {
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
      // openConfirm("error", "Error", "Failed to fetch data.", true);
      openConfirm("error", msg("خطا", "Error"), msg("دریافت اطلاعات با خطا مواجه شد.", "Failed to fetch data."), true);
    }
  };

  useEffect(() => {
    fetchAllAFBtn();
  }, [api]);

  const handleReset = useCallback(() => {
    setNameValue("");
    setStateTextValue("");
    setTooltipValue("");
    setOrderValue("1");
    setPersianNameValue("");
    setPersianStateTextValue("");

    // ✅ پیش‌فرض هر دو accept
    setSelectedState("accept");
    setSelectedCommand("accept");

    setSelectedFileId(null);
    setSelectedRow(null);
    setIsRowClicked(false);

    setResetCounter((prev) => prev + 1);
    setIsDeleteDisabled(true);
    setImageError(false);

    setIsFaMode(true); // ✅ پیش‌فرض FA (یعنی input = Name)
  }, []);

  // =========================
  //      ADD
  // =========================
  const handleAddClick = async () => {
    const nameTrim = nameValue.trim();
    const pNameTrim = persianNameValue.trim();

    // ✅ اگر هر دو خالی بودند -> هشدار زرد
    if (!nameTrim && !pNameTrim) {
      openConfirm(
        "notice",
        msg("هشدار", "Warning"),
        msg("نام یا نام فارسی باید وارد شود.", "Name or PersianName must be filled."),
        true
      );
      return;
    }

    try {
      const newAFBtn: AFBtnItem = {
        ID: 0,
        // ✅ اگر Name خالی بود، از PersianName برای Name استفاده کن
        Name: nameTrim || pNameTrim,
        PersianName: pNameTrim,
        Tooltip: tooltipValue,
        StateText: stateTextValue,
        PersianStateText: persianStateTextValue,
        Order: parseFloat(orderValue || "1"),
        WFStateForDeemed: radioToWFStateForDeemed(selectedState),
        WFCommand: radioToWFCommand(selectedCommand),
        IconImageId: selectedFileId,
        IsVisible: true,
        LastModified: null,
        ModifiedById: null,
      } as AFBtnItem;

      console.log("INSERT AFBtn payload ➜", newAFBtn);

      await api.insertAFBtn(newAFBtn);
      // openConfirm("add", "Success", "Item added successfully.", true);
      openConfirm("add", msg("موفق", "Success"), msg("آیتم با موفقیت اضافه شد.", "Item added successfully."), true);

      await fetchAllAFBtn();
      if (refreshButtons) refreshButtons();
      handleReset();
    } catch (error: any) {
      console.error("Error inserting AFBtn:", error);
      console.log("Insert error response ➜", error?.response?.data);
      // openConfirm("error", "Error", "Failed to add item.", true);
      openConfirm("error", msg("خطا", "Error"), msg("افزودن آیتم با خطا مواجه شد.", "Failed to add item."), true);
    }
  };

  // =========================
  //      EDIT
  // =========================
  const handleEditClick = async () => {
    if (!selectedRow || !selectedRow.ID) {
      // openConfirm("notice", "Warning", "Please select a row to edit.", true);
      openConfirm("notice", msg("هشدار", "Warning"), msg("لطفاً یک ردیف برای ویرایش انتخاب کنید.", "Please select a row to edit."), true);
      return;
    }

    const nameTrim = nameValue.trim();
    const pNameTrim = persianNameValue.trim();

    // ✅ اگر هر دو خالی بودند -> هشدار زرد
    if (!nameTrim && !pNameTrim) {
      openConfirm(
        "notice",
        msg("هشدار", "Warning"),
        msg("نام یا نام فارسی باید وارد شود.", "Name or PersianName must be filled."),
        true
      );
      return;
    }

    openConfirm(
      "edit",
      msg("تأیید ویرایش", "Edit Confirmation"),
      msg("آیا مطمئن هستید که می‌خواهید این آیتم را ویرایش کنید؟", "Are you sure you want to edit this item?"),
      false,
      async () => {
        try {
          const updatedAFBtn: AFBtnItem = {
            ID: selectedRow.ID,
            Name: nameTrim || pNameTrim,
            PersianName: pNameTrim,
            Tooltip: tooltipValue,
            StateText: stateTextValue,
            PersianStateText: persianStateTextValue,
            Order: parseFloat(orderValue || "1"),
            WFStateForDeemed: radioToWFStateForDeemed(selectedState),
            WFCommand: radioToWFCommand(selectedCommand),
            IconImageId: selectedFileId,
            IsVisible: true,
            LastModified: null,
            ModifiedById: null,
          } as AFBtnItem;

          console.log("UPDATE AFBtn payload ➜", updatedAFBtn);

          await api.updateAFBtn(updatedAFBtn);

          // openConfirm("notice", "Success", "Item updated successfully.", true);
          openConfirm("notice", msg("موفق", "Success"), msg("آیتم با موفقیت بروزرسانی شد.", "Item updated successfully."), true);
          setTimeout(() => {
            setConfirmOpen(false);
          }, 3000);

          await fetchAllAFBtn();
          if (refreshButtons) refreshButtons();
          handleReset();
        } catch (error: any) {
          console.error("Error updating AFBtn:", error);
          console.log("Update error response ➜", error?.response?.data);
          // openConfirm("error", "Error", "Failed to update item.", true);
          openConfirm("error", msg("خطا", "Error"), msg("بروزرسانی آیتم با خطا مواجه شد.", "Failed to update item."), true);
        }
      }
    );
  };

  // =========================
  //      DELETE
  // =========================
  const handleDeleteClick = async () => {
    if (!selectedRow || !selectedRow.ID) {
      // openConfirm("notice", "Warning", "Please select a row to delete.", true);
      openConfirm("notice", msg("هشدار", "Warning"), msg("لطفاً یک ردیف برای حذف انتخاب کنید.", "Please select a row to delete."), true);
      return;
    }

    openConfirm(
      "delete",
      msg("تأیید حذف", "Delete Confirmation"),
      msg("آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟", "Are you sure you want to delete this item?"),
      false,
      async () => {
        try {
          console.log("DELETE AFBtn ID ➜", selectedRow.ID);
          await api.deleteAFBtn(selectedRow.ID);

          openConfirm("notice", msg("موفق", "Success"), msg("آیتم با موفقیت حذف شد.", "Item deleted successfully."), true);
          await fetchAllAFBtn();
          if (refreshButtons) refreshButtons();
          handleReset();
        } catch (error: any) {
          console.error("Error deleting AFBtn:", error);
          console.log("Delete error response ➜", error?.response?.data);
          openConfirm("error", msg("خطا", "Error"), msg("حذف آیتم با خطا مواجه شد.", "Failed to delete item."), true);
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

  // =========================
  //      DESIGN (Select)
  // =========================
  // نکته: onSelectButtonClick همان تابعی است که ListSelector واقعاً
  // برای «انتخاب ردیف + بستن مودال» استفاده می‌کند (دقیقاً همان مسیری
  // که دابل‌کلیک روی ردیف طی می‌کند). onSelectFromButton یک پراپ دیگر
  // و نامرتبط بود که به اشتباه استفاده شده بود.
  const handleDesignClick = () => {
    if (!selectedRow) return;
    onSelectButtonClick();
  };

  // =========================
  //  Upload (مثل الگوی User2)
  // =========================
  const handleImageUploadSuccess = (insertModel: any) => {
    console.log("Upload success insertModel ➜", insertModel);

    const uploadedId =
      insertModel?.ID ?? insertModel?.Id ?? insertModel?.id ?? null;
    console.log("Resolved uploaded image ID ➜", uploadedId);

    setSelectedFileId(uploadedId);
    setImageError(false);

    // برای اینکه جدول/لیست هم آپدیت شود
    fetchAllAFBtn();
  };

  const handleResetUpload = () => {
    console.log("Upload reset triggered");
    setResetCounter((prev) => prev + 1);
    setSelectedFileId(null);
    setImageError(false);
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
    setPersianNameValue(data.PersianName ?? "");

    setStateTextValue(data.StateText || "");
    setPersianStateTextValue((data as any).PersianStateText ?? "");
    setTooltipValue(data.Tooltip || "");
    setOrderValue(
      data.Order !== undefined && data.Order !== null
        ? data.Order.toString()
        : "1"
    );

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

    if (data.IconImageId) {
      console.log("Row has IconImageId ➜", data.IconImageId);
      setSelectedFileId(data.IconImageId);
      setImageError(false);
    } else {
      console.log("Row has no IconImageId");
      setSelectedFileId(null);
      setImageError(false);
    }
  };

  const buildDisplayName = (
    stateRadio: string,
    commandRadio: string,
    stateText: string
  ) => {
    const stateLabel =
      RadioOptionsState.find((o) => o.value === stateRadio)?.label ?? "";
    const commandLabel =
      RadioOptionsCommand.find((o) => o.value === commandRadio)?.label ?? "";
    const base = stateText.trim() || stateLabel;

    return `${base} (State: ${stateLabel} - Command: ${commandLabel})`;
  };

  // ستون‌های جدول: Name, Persian Name, Command, State Text, Persian State Text, Order
  // (دقیقاً منطبق با ترتیب ستون‌های نرم‌افزار اصلی — نه ساختار قبلی که فقط Name/PersianName/Tooltip داشت)
  const columnDefsWithFa = React.useMemo(() => {
    return [
      {
        headerName: t("DataTable.Headers.Name", {
          defaultValue: i18n.language === "fa" ? "نام" : "Name",
        }),
        field: "Name",
        sortable: true,
        filter: true,
      },
      {
        headerName: t("Configuration.PersianName", "PersianName"),
        field: "PersianName",
        sortable: true,
        filter: true,
      },
      {
        headerName: t("DataTable.Headers.Command", {
          defaultValue: "Command",
        }),
        field: "WFCommand",
        sortable: true,
        filter: true,
        valueGetter: (params: any) =>
          commandEnglishLabelMap[mapWFCommandToRadio(params.data?.WFCommand)] ??
          "",
      },
      {
        headerName: t("Configuration.StateText", "State Text"),
        field: "StateText",
        sortable: true,
        filter: true,
      },
      {
        headerName: t("Configuration.PersianStateText", "Persian State Text"),
        field: "PersianStateText",
        sortable: true,
        filter: true,
      },
      {
        headerName: t("DataTable.Headers.Order", {
          defaultValue: i18n.language === "fa" ? "ترتیب" : "Order",
        }),
        field: "Order",
        sortable: true,
        filter: true,
      },
    ];
  }, [t, i18n.language]);

  // شمارنده‌ها (مثل عکس)
  const nameCount = (nameValue || "").length;
  const stateTextCount = (stateTextValue || "").length;
  const tooltipCount = (tooltipValue || "").length;

  const toPersian = (val: string | number): string => {
    if (!isFaMode) return String(val ?? "");
    return String(val ?? "").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
  };

  const fromPersian = (val: string): string =>
    val.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

  return (
    <>
      <style>{`
      .rtl input[type="radio"] {
        margin-left: 6px;
      }
    `}</style>

      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={`w-full h-full flex flex-col bg-white rounded-lg ${isRTL ? "rtl" : ""
          }`}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <DynamicConfirm
              isOpen={confirmOpen}
              variant={confirmVariant}
              title={confirmTitle}
              message={confirmMessage}
              onConfirm={handleConfirm}
              onClose={() => setConfirmOpen(false)}
              hideCancelButton={confirmHideCancel}
            />

            {/* ── جدول ── */}
            <div
              dir={isRTL ? "rtl" : "ltr"}
              className="w-full overflow-hidden mb-4"
              style={{ height: "400px", overflowY: "auto" }}
            >
              <DataTable
                key={isRTL ? "rtl" : "ltr"}
                direction={i18n.dir()}
                columnDefs={columnDefsWithFa}
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

            {/* ── فرم ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ستون چپ */}
              <div>
                {/* Name / PersianName با سوییچ FA/EN */}
                <div className="relative">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <DynamicInput
                        name={
                          isFaMode
                            ? t("AddApprovalFlows.Name")
                            : t("AddApprovalFlows.PersianName", "PersianName")
                        }
                        type="text"
                        value={isFaMode ? nameValue : persianNameValue}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (isFaMode) setNameValue(v);
                          else setPersianNameValue(v);
                        }}
                        className="w-full"
                        required={false}
                      />
                    </div>

                    <div className="h-10 flex items-center">
                      <button
                        type="button"
                        onClick={() => setIsFaMode((p) => !p)}
                        className={[
                          "shrink-0 inline-flex items-center justify-center h-10 px-4 rounded-xl",
                          "bg-gradient-to-r from-fuchsia-500 to-pink-500",
                          "text-white font-semibold tracking-wide",
                          "shadow-md shadow-pink-200/50",
                          "transition-all duration-200",
                          "hover:from-fuchsia-600 hover:to-pink-600 hover:shadow-lg hover:scale-[1.02]",
                          "active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-pink-300",
                        ].join(" ")}
                        title={
                          isFaMode
                            ? "Switch to EN (PersianName)"
                            : "Switch to FA (Name)"
                        }
                      >
                        {isFaMode ? "FA" : "EN"}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end text-xs mt-1">
                    {nameCount} / 50
                  </div>
                </div>

                {/* Tooltip */}
                <div className="mt-4">
                  <DynamicInput
                    name={t("Configuration.Tooltip")}
                    type="text"
                    value={tooltipValue}
                    onChange={(e) => setTooltipValue(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-end text-xs mt-1">
                    {tooltipCount} / 350
                  </div>
                </div>

                {/* ── Order ── */}
                <div className="mt-4">
                  <DynamicInput
                    name={t("Configuration.Order")}
                    type={i18n.language === "fa" ? "text" : "number"}
                    value={
                      i18n.language === "fa"
                        ? String(orderValue).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])
                        : orderValue  // ✅ برای EN مستقیم عدد لاتین
                    }
                    onChange={(e) => setOrderValue(fromPersian(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* ستون راست */}
              <div>
                {/* StateText / PersianStateText با همون سوییچ FA/EN بالا */}
                <div>
                  <DynamicInput
                    name={
                      isFaMode
                        ? t("Configuration.StateText")
                        : t("Configuration.PersianStateText", "Persian State Text")
                    }
                    type="text"
                    value={isFaMode ? stateTextValue : persianStateTextValue}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (isFaMode) setStateTextValue(v);
                      else setPersianStateTextValue(v);
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-end text-xs mt-1">
                    {stateTextCount} / 50
                  </div>
                </div>

                {/* State */}
                <div className="mt-4">
                  <div className="text-sm mb-2">{t("Configuration.State")}</div>
                  <div className="flex items-center gap-10">
                    {RadioOptionsState.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="wfState"
                          checked={selectedState === opt.value}
                          onChange={() => setSelectedState(opt.value)}
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Command */}
                <div className="mt-4">
                  <div className="text-sm mb-2">
                    {t("Configuration.Command")}
                  </div>

                  {/* accept / reject / close */}
                  <div className="flex items-center gap-10 mb-2">
                    {["accept", "reject", "close"].map((val) => {
                      const opt = RadioOptionsCommand.find(
                        (x) => x.value === val
                      );
                      if (!opt) return null;
                      return (
                        <label key={val} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="wfCommand"
                            checked={selectedCommand === val}
                            onChange={() => setSelectedCommand(val)}
                          />
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* client / admin */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                    <div className="flex flex-col gap-2">
                      {["client"].map((val) => {
                        const opt = RadioOptionsCommand.find(
                          (x) => x.value === val
                        );
                        if (!opt) return null;
                        return (
                          <label key={val} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="wfCommand"
                              checked={selectedCommand === val}
                              onChange={() => setSelectedCommand(val)}
                            />
                            <span className="text-sm">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex flex-col gap-2">
                      {["admin"].map((val) => {
                        const opt = RadioOptionsCommand.find(
                          (x) => x.value === val
                        );
                        if (!opt) return null;
                        return (
                          <label key={val} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="wfCommand"
                              checked={selectedCommand === val}
                              onChange={() => setSelectedCommand(val)}
                            />
                            <span className="text-sm">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div className="mt-6">
                  <div className="text-sm mb-2">
                    {t("Configuration.Image", "Image")}:
                  </div>

                  <FileUploadHandler
                    selectedFileId={selectedFileId}
                    onUploadSuccess={handleImageUploadSuccess}
                    resetCounter={resetCounter}
                    onReset={handleResetUpload}
                    isEditMode={!!selectedRow}
                  />

                  {selectedFileId && !imageError && (
                    <div className="mt-3">
                      <img
                        src={`/api/getImage/${selectedFileId}`}
                        alt="Selected"
                        className="w-32 h-32 object-cover"
                        onLoad={() =>
                          console.log("Preview image loaded ✅", selectedFileId)
                        }
                        onError={(e) => {
                          console.log("Preview image error ❌", {
                            selectedFileId,
                            src: `/api/getImage/${selectedFileId}`,
                            event: e,
                          });
                          setImageError(true);
                        }}
                      />
                    </div>
                  )}
                  {selectedFileId && imageError && (
                    <div className="mt-2 text-xs text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer Buttons ── */}
          {/* ترتیب دقیقاً مطابق نرم‌افزار اصلی: Design | Add/Edit (ادغام‌شده) | Delete | New */}
          <div className="bg-white/90 backdrop-blur mt-6 py-2">
            <div className="flex items-center justify-center gap-3">
              <DynamicButton
                text={t("AddApprovalFlows.Design", "Design")}
                onClick={handleDesignClick}
                isDisabled={!selectedRow}
                size="md"
                variant="orgBlue"
                leftIcon={<FaPaintBrush />}
              />

              {selectedRow ? (
                <DynamicButton
                  text={t("AddApprovalFlows.Edit", "Edit")}
                  onClick={handleEditClick}
                  size="md"
                  variant="orgYellow"
                  leftIcon={<FaPencilAlt />}
                />
              ) : (
                <DynamicButton
                  text={t("AddApprovalFlows.Add", "Add")}
                  onClick={handleAddClick}
                  size="md"
                  variant="orgGreen"
                  leftIcon={<FaPlus />}
                />
              )}

              <DynamicButton
                text={t("AddApprovalFlows.Delete", "Delete")}
                onClick={handleDeleteClick}
                isDisabled={isDeleteDisabled}
                size="md"
                variant="orgRed"
                leftIcon={<FaTrash />}
              />

              <DynamicButton
                text={t("AddApprovalFlows.New", "New")}
                onClick={handleNewClick}
                size="md"
                variant="orgBlue"
                leftIcon={<FaUndo />}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ButtonComponent;