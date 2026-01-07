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
import DynamicConfirm from "../../utilities/DynamicConfirm";
import { useTranslation } from "react-i18next";
import { FaPlus, FaPencilAlt, FaTrash, FaUndo } from "react-icons/fa";
import i18n from "../../../i18n";

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

  const { t } = useTranslation();

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

  // ----- DynamicConfirm state -----
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVariant, setConfirmVariant] = useState<
    "add" | "edit" | "delete" | "notice" | "error"
  >("notice");
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmHideCancel, setConfirmHideCancel] = useState<boolean>(false);
  // تابع اکشنی که بعد از زدن دکمه "Confirm" اجرا می‌شود
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

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
    setOrderValue("1");
    setPersianNameValue("");

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
        t("Global.Warning", "Warning"),
        t(
          "Configuration.NameOrPersianNameRequired",
          "Name or PersianName must be filled."
        ),
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
        Order: parseFloat(orderValue || "1"),
        WFStateForDeemed: radioToWFStateForDeemed(selectedState),
        WFCommand: radioToWFCommand(selectedCommand),
        IconImageId: selectedFileId,
        IsVisible: true,
        LastModified: null,
        ModifiedById: null,
      };

      console.log("INSERT AFBtn payload ➜", newAFBtn);

      await api.insertAFBtn(newAFBtn);
      openConfirm("add", "Success", "Item added successfully.", true);

      await fetchAllAFBtn();
      if (refreshButtons) refreshButtons();
      handleReset();
    } catch (error: any) {
      console.error("Error inserting AFBtn:", error);
      console.log("Insert error response ➜", error?.response?.data);
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

    const nameTrim = nameValue.trim();
    const pNameTrim = persianNameValue.trim();

    // ✅ اگر هر دو خالی بودند -> هشدار زرد
    if (!nameTrim && !pNameTrim) {
      openConfirm(
        "notice",
        t("Global.Warning", "Warning"),
        t(
          "Configuration.NameOrPersianNameRequired",
          "Name or PersianName must be filled."
        ),
        true
      );
      return;
    }

    openConfirm(
      "edit",
      "Edit Confirmation",
      "Are you sure you want to edit this item?",
      false,
      async () => {
        try {
          const updatedAFBtn: AFBtnItem = {
            ID: selectedRow.ID,
            Name: nameTrim || pNameTrim,
            PersianName: pNameTrim,
            Tooltip: tooltipValue,
            StateText: stateTextValue,
            Order: parseFloat(orderValue || "1"),
            WFStateForDeemed: radioToWFStateForDeemed(selectedState),
            WFCommand: radioToWFCommand(selectedCommand),
            IconImageId: selectedFileId,
            IsVisible: true,
            LastModified: null,
            ModifiedById: null,
          };

          console.log("UPDATE AFBtn payload ➜", updatedAFBtn);

          await api.updateAFBtn(updatedAFBtn);

          openConfirm("notice", "Success", "Item updated successfully.", true);
          setTimeout(() => {
            setConfirmOpen(false);
          }, 3000);

          await fetchAllAFBtn();
          if (refreshButtons) refreshButtons();
          handleReset();
        } catch (error: any) {
          console.error("Error updating AFBtn:", error);
          console.log("Update error response ➜", error?.response?.data);
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

    openConfirm(
      "delete",
      "Delete Confirmation",
      "Are you sure you want to delete this item?",
      false,
      async () => {
        try {
          console.log("DELETE AFBtn ID ➜", selectedRow.ID);
          await api.deleteAFBtn(selectedRow.ID);

          openConfirm("notice", "Success", "Item deleted successfully.", true);
          await fetchAllAFBtn();
          if (refreshButtons) refreshButtons();
          handleReset();
        } catch (error: any) {
          console.error("Error deleting AFBtn:", error);
          console.log("Delete error response ➜", error?.response?.data);
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

  // =========================
  //  Upload (مثل الگوی User2)
  // =========================
  const handleImageUploadSuccess = (insertModel: any) => {
    console.log("Upload success insertModel ➜", insertModel);

    const uploadedId = insertModel?.ID ?? insertModel?.Id ?? insertModel?.id ?? null;
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

  // ستون‌های ورودی از والد رو با PersianName غنی کنیم
  const columnDefsWithFa = React.useMemo(() => {
    const defs = Array.isArray(columnDefs) ? [...columnDefs] : [];
    const hasFa = defs.some((c) => (c.field ?? "").toString() === "PersianName");
    if (hasFa) return defs;

    const faCol = {
      headerName: "PersianName",
      field: "PersianName",
      sortable: true,
      filter: true,
      resizable: true,
    };

    const nameIdx = defs.findIndex(
      (c) => (c.field ?? "").toString().toLowerCase() === "name"
    );
    if (nameIdx === -1) return [...defs, faCol];

    const before = defs.slice(0, nameIdx + 1);
    const after = defs.slice(nameIdx + 1);
    return [...before, faCol, ...after];
  }, [columnDefs]);

  // شمارنده‌ها (مثل عکس)
  const nameCount = (nameValue || "").length;
  const stateTextCount = (stateTextValue || "").length;
  const tooltipCount = (tooltipValue || "").length;

  return (
    <>
      {/* استایل داخلی برای همهٔ رادیوباتن‌ها در حالت RTL */}
      <style>{`
        .rtl input[type="radio"] {
          margin-left: 6px;
        }
      `}</style>

      {/* ظرف کلی: بدون min-h-screen تا فاصله‌ی اضافی ته کارت ایجاد نشود */}
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={`w-full h-full flex flex-col bg-white rounded-lg ${
          isRTL ? "rtl" : ""
        }`}
      >
        {/* لایهٔ اسکرول: محتوا + فوتر استیکی هر دو داخل این هستند */}
        <div className="flex-1 overflow-y-auto">
          {/* پدینگ افقی ثابت برای کل محتوا */}
          <div className="p-4">
            {/* ✅ DynamicConfirm برای هشدارها */}
            <DynamicConfirm
              isOpen={confirmOpen}
              variant={confirmVariant}
              title={confirmTitle}
              message={confirmMessage}
              onConfirm={handleConfirm}
              onClose={() => setConfirmOpen(false)}
              hideCancelButton={confirmHideCancel}
            />

            {/* ✅ جدول آیتم‌ها */}
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
                onAdd={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                onDuplicate={() => {}}
                domLayout="normal"
              />
            </div>

            {/* ✅ فرم (چینش مطابق عکس: چپ Name/Tooltip/Order | راست StateText + State + Command + Image) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ستون چپ */}
              <div>
                {/* ✅ فقط یک input: با سوییچ FA/EN همان input بین Name و PersianName عوض می‌شود */}
                <div className="relative">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <DynamicInput
                        name={
                          isFaMode
                            ? t("Configuration.Name")
                            : t("Configuration.PersianName", "PersianName")
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

                    {/* ✅ دکمه EN/FA وسط‌چین عمودی دقیق */}
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

                {/* Order */}
                <div className="mt-4">
                  <DynamicInput
                    name={t("Configuration.Order")}
                    type="text"
                    value={orderValue}
                    onChange={(e) => setOrderValue(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* ستون راست */}
              <div>
                {/* StateText */}
                <div>
                  <DynamicInput
                    name={t("Configuration.StateText")}
                    type="text"
                    value={stateTextValue}
                    onChange={(e) => setStateTextValue(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-end text-xs mt-1">
                    {stateTextCount} / 50
                  </div>
                </div>

                {/* State: */}
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

                {/* Command: */}
                <div className="mt-4">
                  <div className="text-sm mb-2">{t("Configuration.Command")}</div>

                  {/* accept/reject/close یک خط */}
                  <div className="flex items-center gap-10 mb-2">
                    {["accept", "reject", "close"].map((val) => {
                      const opt = RadioOptionsCommand.find((x) => x.value === val);
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

                  {/* client/admin */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                    <div className="flex flex-col gap-2">
                      {["client"].map((val) => {
                        const opt = RadioOptionsCommand.find((x) => x.value === val);
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
                        const opt = RadioOptionsCommand.find((x) => x.value === val);
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

                {/* Image: */}
                <div className="mt-6">
                  <div className="text-sm mb-2">
                    {t("Configuration.Image", "Image")}:
                  </div>

                  {/* ✅ الگو مثل User2: پاس دادن selectedFileId + resetCounter + onReset + isEditMode */}
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
                        onLoad={() => console.log("Preview image loaded ✅", selectedFileId)}
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
                    <div className="mt-2 text-xs text-red-600">
                      {/* Image preview failed to load. Check console logs. */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="bg-white/90 backdrop-blur mt-6 py-2">
            <div className="flex items-center justify-center gap-3">
              <DynamicButton
                text={t("Global.Add", "Add")}
                onClick={handleAddClick}
                isDisabled={isRowClicked}
                size="md"
                variant="orgGreen"
                leftIcon={<FaPlus />}
              />

              <DynamicButton
                text={t("Global.Edit", "Edit")}
                onClick={handleEditClick}
                isDisabled={!selectedRow}
                size="md"
                variant="orgYellow"
                leftIcon={<FaPencilAlt />}
              />

              <DynamicButton
                text={t("Global.New", "New")}
                onClick={handleNewClick}
                size="md"
                variant="orgBlue"
                leftIcon={<FaUndo />}
              />

              <DynamicButton
                text={t("Global.Delete", "Delete")}
                onClick={handleDeleteClick}
                isDisabled={isDeleteDisabled}
                size="md"
                variant="orgRed"
                leftIcon={<FaTrash />}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ButtonComponent;
