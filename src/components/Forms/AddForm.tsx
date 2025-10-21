import React, { useState, useEffect } from "react";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";

// UI utilities
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import DynamicSelector from "../utilities/DynamicSelector";

// Controllers
import Component1 from "./ControllerForms/TextController";
import Component2 from "./ControllerForms/RichTextController";
import Component3 from "./ControllerForms/ChoiceController";
import Component4 from "./ControllerForms/NumberController";
import Component5 from "./ControllerForms/DateTimeEnglishController";
import Component6 from "./ControllerForms/DateTimePersianController";
import Component7 from "./ControllerForms/LookupController";
import Component8 from "./ControllerForms/PostPickerList/PostPickerList";
import Component9 from "./ControllerForms/LookupRealValueController";
import Component10 from "./ControllerForms/LookUpAdvanceTable";
import Component12 from "./ControllerForms/LookupImage";
import Component13 from "./ControllerForms/YesNoController";
import Component14 from "./ControllerForms/AttachFileController";
import Component15 from "./ControllerForms/PictureBoxController";
import Component16 from "./ControllerForms/TableController";
import Component17 from "./ControllerForms/PfiLookUpController";
import Component18 from "./ControllerForms/SeqnialNumber";
import Component19 from "./ControllerForms/AdvanceTableController";
import Component20 from "./ControllerForms/wordpanell/WordPanelController";
import Component21 from "./ControllerForms/ExceclPanelController";
import Component22 from "./ControllerForms/CalculatedField";
import Component23 from "./ControllerForms/ExcelCalculator";
import Component24 from "./ControllerForms/TabController";
import Component25 from "./ControllerForms/MapController";
import Component26 from "./ControllerForms/AdvanceLookupAdvanceTable";
import Component27 from "./ControllerForms/HyperLinkController";
import Component28 from "./ControllerForms/SelectUserInPost";
import Component29 from "./ControllerForms/TitleController";
import Component30 from "./ControllerForms/SectionController";
import Component31 from "./ControllerForms/SubSectionController";
import Component32 from "./ControllerForms/MePostSelectorController";
import Component33 from "./ControllerForms/AdvanceWf";
import Component34 from "./ControllerForms/LookupImageRealValue";
import InventoryController from "./ControllerForms/InventoryController";
import InventoryFieldController from "./ControllerForms/InventoryFieldController";


import { showAlert } from "../utilities/Alert/DynamicAlert";

import apiService from "../../services/api.services";

// Mapping of column types
const columnTypeMapping: { [key: string]: number } = {
  component1: 15,
  component2: 1,
  component3: 2,
  component4: 3,
  component5: 4,
  component6: 21,
  component7: 5,
  component8: 19,
  component9: 34,
  component10: 35,
  component11: 17, // (reserved)
  component12: 30,
  component13: 6,
  component14: 9,
  component15: 26,
  component16: 10,
  component17: 16,
  component18: 20,
  component19: 22,
  component20: 24,
  component21: 25,
  component22: 27,
  component23: 29,
  component24: 32,
  component25: 28,
  component26: 36,
  component27: 7,
  component28: 8,
  component29: 11,
  component30: 12,
  component31: 13,
  component32: 18,
  component33: 23,
  component34: 37,
  component36: 38, // Inventory
  component37: 39, // InventoryField

};

// Mapping of component keys to components
const componentMapping: { [key: string]: React.FC<any> } = {
  component1: Component1,
  component2: Component2,
  component3: Component3,
  component4: Component4,
  component5: Component5,
  component6: Component6,
  component7: Component7,
  component8: Component8,
  component9: Component9,
  component10: Component10,
  component12: Component12,
  component13: Component13,
  component14: Component14,
  component15: Component15,
  component16: Component16,
  component17: Component17,
  component18: Component18,
  component19: Component19,
  component20: Component20,
  component21: Component21,
  component22: Component22,
  component23: Component23,
  component24: Component24,
  component25: Component25,
  component26: Component26,
  component27: Component27,
  component28: Component28,
  component29: Component29,
  component30: Component30,
  component31: Component31,
  component32: Component32,
  component33: Component33,
  component34: Component34,
  component36: InventoryController,
  component37: InventoryFieldController,

};

interface AddColumnFormProps {
  onClose: () => void;
  onSave?: (newField: { ID: number; Name: string }) => void;
  isEdit?: boolean;
  existingData?: any;
  entityTypeId?: string; // مقدار nEntityTypeID از selectedRow

  /* ✅ اضافه شد: برای اینکه LookUp بتواند فیلدهای فرمِ جاری را در DesField نشان دهد */
  srcFields?: Array<{ ID: string | number; DisplayName: string }>;
  srcEntityTypeId?: string | number;
}

interface MetaCore {
  metaType1: string;
  metaType2: string | null;
  metaType3: string | null;
  LookupMode: string | null;
  oldLookup: boolean;
  metaType5: string | null;
  metaTypeJson: string | null;
}

const AddColumnForm: React.FC<AddColumnFormProps> = ({
  onClose,
  onSave,
  isEdit = false,
  existingData = null,
  entityTypeId,

  /* ✅ پراپ‌های جدید دریافتی از FormsCommand1 */
  srcFields,
  srcEntityTypeId,
}) => {
  const { t, i18n } = useTranslation();
  const { insertEntityField, updateEntityField } = useApi();

  const typeOfInformationOptions = [
    { value: "component1", label: t("ColumnTypes.Text") },
    { value: "component2", label: t("ColumnTypes.RichText") },
    { value: "component3", label: t("ColumnTypes.Choice") },
    { value: "component4", label: t("ColumnTypes.Number") },
    { value: "component5", label: t("ColumnTypes.DateTime") },
    { value: "component6", label: t("ColumnTypes.PersianDate") },
    { value: "component7", label: t("ColumnTypes.Lookup") },
    { value: "component27", label: t("ColumnTypes.HyperLink") },
    { value: "component8", label: t("ColumnTypes.PostPickerList") },
    { value: "component9", label: t("ColumnTypes.LookupRealValue") },
    { value: "component10", label: t("ColumnTypes.LookupAdvanceTable") },
    { value: "component26", label: t("ColumnTypes.AdvanceLookupAdvanceTable") },
    { value: "component29", label: t("ColumnTypes.Title") },
    { value: "component30", label: t("ColumnTypes.Section") },
    { value: "component31", label: t("ColumnTypes.SubSection") },
    { value: "component12", label: t("ColumnTypes.LookupImage") },
    { value: "component28", label: t("ColumnTypes.SelectUserInPost") },
    { value: "component13", label: t("ColumnTypes.YesNo") },
    { value: "component14", label: t("ColumnTypes.AttachFile") },
    { value: "component15", label: t("ColumnTypes.PictureBox") },
    { value: "component16", label: t("ColumnTypes.Table") },
    { value: "component17", label: t("ColumnTypes.PfiLookup") },
    { value: "component32", label: t("ColumnTypes.MePostSelector") },
    { value: "component18", label: t("ColumnTypes.SeqnialNumber") },
    { value: "component19", label: t("ColumnTypes.AdvanceTable") },
    { value: "component33", label: t("ColumnTypes.Advancewf") },
    { value: "component20", label: t("ColumnTypes.WordPanel") },
    { value: "component21", label: t("ColumnTypes.ExceclPanel") },
    { value: "component22", label: t("ColumnTypes.CalculatedField") },
    { value: "component23", label: t("ColumnTypes.ExcelCalculator") },
    { value: "component24", label: t("ColumnTypes.Tab") },
    { value: "component25", label: t("ColumnTypes.Map") },
    { value: "component34", label: t("ColumnTypes.LookUpRealValueImg") },
    { value: "component36", label: t("ColumnTypes.Inventory") || "Inventory" },
    { value: "component37", label: t("ColumnTypes.InventoryField") || "Inventory Field" },
  ];

  // گزینه‌های Command با امکان انتخاب دلخواه
  const initialCommandOptions = [
    {
      value: "@title",
      label: "Command : @title , info : For Letter Title",
    },
    {
      value: "@to",
      label: "Command : @to , info : For Letter To",
    },
    {
      value: "@cc",
      label: "Command : @cc , info : For Letter Cc",
    },
    {
      value: "@wf",
      label: "Command : @wf , info : For Letter Wf",
    },
  ];
  const [commandOptions] = useState(initialCommandOptions);

  // استخراج اطلاعات اصلی فرم
  const getInitialFormData = () => ({
    formName: existingData ? existingData.DisplayName : "",
    PersianName: existingData ? existingData.PersianName || "" : "",
    order: existingData ? String(existingData.orderValue) : "",
    description: existingData ? existingData.Description : "",
    command: existingData ? existingData.Code : "",
    isRequiredInWf: existingData ? existingData.IsRequireInWf : false,
    printCode: existingData ? existingData.PrintCode : "",
    isEditableInWf: existingData ? existingData.IsEditableInWF : false,
    allowedWfBoxName: existingData ? existingData.WFBOXName : "",
    showInAlert: existingData ? existingData.ShowInAlert : false,
    typeOfInformation: existingData
      ? Object.keys(columnTypeMapping).find(
        (key) => columnTypeMapping[key] === existingData.ColumnType
      ) || "component1"
      : "component1",
    required: existingData ? existingData.IsRequire : false,
    mainColumns: existingData ? existingData.IsMainColumn : false,
    showInListView: existingData ? existingData.IsShowGrid : false,
    rightToLeft: existingData ? existingData.IsRTL : false,
    readOnly: existingData ? existingData.IsForceReadOnly : false,
    metaColumnName: "",
    showInTab: existingData ? existingData.ShowInTab : "",
    // این فیلد جدید برای وضعیت CountInReject:
    countInReject: existingData ? existingData.CountInReject : false,
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [dynamicMeta, setDynamicMeta] = useState<any>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFaMode, setIsFaMode] = useState(false); // EN=false, FA=true

  const [metaCore, setMetaCore] = useState<MetaCore>({
    metaType1: "",
    metaType2: null,
    metaType3: null,
    LookupMode: null,
    oldLookup: false,
    metaType5: null,
    metaTypeJson: null,
  });

  const [metaExtra, setMetaExtra] = useState({
    metaType4: "",
  });

  const DEFAULT_META_CORE: MetaCore = {
    metaType1: "",
    metaType2: null,
    metaType3: "",
    LookupMode: "",
    oldLookup: false,
    metaType5: null,
    metaTypeJson: null,
  };

  const DEFAULT_META_EXTRA = {
    metaType4: "",
  };

  // --- Helpers برای نرمال‌سازی مقادیر ---
  const toStr = (v: any, empty = "") => (v != null ? String(v) : empty);
  const toStrOrNull = (v: any) =>
    v != null && String(v).trim() !== "" ? String(v) : null;

  // 🔑 کلید ریست برای کنترلرها و PostPickerList
  const [controllerResetKey, setControllerResetKey] = useState(0);

  useEffect(() => {
    if (isEdit && existingData) {
      setFormData(getInitialFormData());

      // مقداردهی اولیه metaCore (ایمن و نرمال)
      setMetaCore({
        metaType1: toStr(existingData.metaType1, ""),
        metaType2: toStrOrNull(existingData.metaType2),
        metaType3: toStr(existingData.metaType3, "drop"),
        LookupMode: toStr(existingData.LookupMode, ""),
        oldLookup: !!existingData.BoolMeta1,
        metaType5: toStrOrNull(existingData.metaType5),
        metaTypeJson:
          typeof existingData.metaTypeJson === "string" &&
            existingData.metaTypeJson.trim() !== ""
            ? existingData.metaTypeJson
            : null,
      });

      // مقداردهی اولیه metaExtra (اگر کنترلرهایی که جدول دارند اجرا شوند)
      setMetaExtra({
        metaType4:
          typeof existingData.metaType4 === "string" &&
            existingData.metaType4.trim() !== ""
            ? existingData.metaType4
            : "",
      });

      setErrors({});
    } else {
      setFormData({
        formName: "",
        PersianName: "",
        order: "",
        description: "",
        command: "",
        isRequiredInWf: false,
        printCode: "",
        isEditableInWf: false,
        allowedWfBoxName: "",
        showInAlert: false,
        typeOfInformation: "component1",
        required: false,
        mainColumns: false,
        showInListView: false,
        rightToLeft: false,
        readOnly: false,
        metaColumnName: "",
        showInTab: "",
        countInReject: false,
      });

      setMetaCore(DEFAULT_META_CORE);
      setMetaExtra(DEFAULT_META_EXTRA);
      setErrors({});
    }
  }, [isEdit, existingData]);

  // ریست متاها هنگام تغییر نوع کنترلر (برای جلوگیری از نشت state)
  useEffect(() => {
    if (!isEdit) {
      setMetaCore(DEFAULT_META_CORE);
      setMetaExtra(DEFAULT_META_EXTRA);

      // در صورت نیاز برخی فیلدهای عمومی را هم ریست کن
      setFormData((prev) => ({
        ...prev,
        command: "",
        countInReject: false,
        rightToLeft: false,
        readOnly: false,
        showInTab: "",
      }));

      // 🔁 هر بار نوع اطلاعات عوض شد، کلید ریست را افزایش بده
      setControllerResetKey((k) => k + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.typeOfInformation]);

  // تغییر مقادیر فرم
  const handleChange = (field: keyof typeof formData, value: any) => {
    if (field === "command") {
      const exists = commandOptions.find((opt) => opt.value === value);
      if (exists) {
        setFormData((prev) => ({ ...prev, [field]: exists.value }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!formData.formName.trim()) {
      setErrors({ formName: "Column Name is required." });
      setIsLoading(false);
      return;
    }

    const currentTimestamp = new Date().toISOString();

    const lookupModeValue =
      metaCore.LookupMode === undefined ||
        metaCore.LookupMode === null ||
        metaCore.LookupMode === ""
        ? null
        : Number(metaCore.LookupMode);

    const metaType5Value = metaCore.metaType5 || null;

    // از mutation مستقیم state جلوگیری کنیم
    let metaCoreForSubmit: MetaCore = {
      ...metaCore,
      LookupMode: metaCore.LookupMode ?? "",
    };

    const nameTrim = (formData.formName || "").trim();
    const pNameTrim = (formData.PersianName || "").trim();

    if (!nameTrim && pNameTrim) {
      setErrors({ formName: "Please fill English Column Name." });
      setIsLoading(false);
      return;
    }
    if (!nameTrim) {
      setErrors({ formName: "Column Name is required." });
      setIsLoading(false);
      return;
    }

    if (
      formData.typeOfInformation === "component26" &&
      metaCore.metaType1 &&
      metaCore.metaType2 &&
      !isEdit
    ) {
      const combinedEntityType = {
        IsVisible: false,
        IsGlobal: true,
        Name: "EntityType For AdvanceLookupAdvanceTable",
        OriginEntityTypes: `${metaCore.metaType1}|${metaCore.metaType2}|`,
      };

      try {
        const res = await apiService.insertEntityType(combinedEntityType);
        if (res?.ID) {
          metaCoreForSubmit = {
            ...metaCoreForSubmit,
            metaTypeJson: JSON.stringify({ CombinedEntityType: res.ID }),
          };
        }
      } catch (error) {
        console.error("❌ خطا در ایجاد EntityType ترکیبی:", error);
        setIsLoading(false);
        setErrors({ form: "خطا در ایجاد EntityType ترکیبی" });
        return;
      }
    }

    // اطمینان از معتبر بودن metaType4:
    const normalizedMetaType4 =
      metaExtra.metaType4 != null ? String(metaExtra.metaType4) : "[]";

    // ✅ ساخت payload
    const payload: any = {
      DisplayName: formData.formName,
      PersianName: (formData.PersianName || "").trim(),
      IsShowGrid: formData.showInListView,
      IsEditableInWF: formData.isEditableInWf,
      WFBOXName: formData.allowedWfBoxName,
      nEntityTypeID:
        entityTypeId && !isNaN(Number(entityTypeId))
          ? Number(entityTypeId)
          : null,
      ColumnType: columnTypeMapping[formData.typeOfInformation],
      Code: formData.command || null,
      Description: formData.description,
      ...metaCoreForSubmit,
      metaType4: normalizedMetaType4,
      metaType5: metaType5Value,
      PrintCode: formData.printCode,
      IsForceReadOnly: formData.readOnly,
      IsUnique: false,
      IsRequire: formData.required,
      IsMainColumn: formData.mainColumns,
      IsRequireInWf: formData.isRequiredInWf,
      IsRTL: formData.rightToLeft,
      orderValue: parseFloat(formData.order) || 0,
      ShowInAlert: formData.showInAlert,
      ShowInTab: formData.showInTab,
      CreatedTime:
        isEdit && existingData ? existingData.CreatedTime : currentTimestamp,
      ModifiedTime: currentTimestamp,
      ModifiedById:
        isEdit && existingData
          ? existingData.ModifiedById || "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c"
          : "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
      LookupMode: lookupModeValue,
      BoolMeta1: metaCore.oldLookup ? true : false,
      CountInReject: formData.countInReject,
      ID: isEdit && existingData ? existingData.ID : 0,
      IsVisible: true,
      LastModified: currentTimestamp,
      IsGlobal: true,
    };

    try {
      let newId = 0;

      if (isEdit) {
        await updateEntityField(payload);
        newId = payload.ID;
      } else {
        const response = await insertEntityField(payload);
        newId = response?.ID ?? payload.ID;
      }

      setIsLoading(false);

      const newField = {
        ID: newId,
        Name: formData.formName,
      };

      if (onSave) onSave(newField);
      onClose();
    } catch (error: any) {
      console.error(error);
      setIsLoading(false);
      setErrors({ form: "خطا در ذخیره اطلاعات." });
      window.alert("خطا: " + (error?.message || "مشکلی پیش آمد."));
    }
  };

  // این متد را کنترلرها برای metaType4 (JSON جدول‌ها) صدا می‌زنند
  const handleMetaExtraChange = (updated: { metaType4: string }) => {
    setMetaExtra((prev) => ({
      ...prev,
      metaType4: updated.metaType4 ?? prev.metaType4,
    }));
  };

  // نوع‌هایی که ProgramMetaColumnName ندارد
  const hiddenTypesForProgramMeta = [
    "component9", // Lookup RealValue
    "component7", // Lookup
    "component26", // Advance Lookup AdvanceTable
    "component19", // Advance Table
    "component10", // Lookup AdvanceTable
    "component18", // Seqnial Number
    "component16", // Table
  ];

  // رندر کنترلر داینامیک
  const renderSelectedComponent = () => {
    const SelectedComponent = componentMapping[formData.typeOfInformation];
    if (!SelectedComponent) return null;

    const baseProps: any = {
      key: `${formData.typeOfInformation}-${controllerResetKey}`,
      resetKey: controllerResetKey,
      onMetaChange: (updated: any) => {
        setMetaCore((prev) => ({
          ...prev,
          metaType1: updated.metaType1 ?? prev.metaType1,
          metaType2: updated.metaType2 ?? prev.metaType2,
          metaType3: updated.metaType3 ?? prev.metaType3,
          LookupMode:
            updated.LookupMode !== undefined
              ? updated.LookupMode
              : prev.LookupMode,
          metaType5: updated.metaType5 ?? prev.metaType5,
          metaTypeJson: updated.metaTypeJson ?? prev.metaTypeJson, // ✅ فقط JSON جدول
          oldLookup:
            updated.BoolMeta1 !== undefined
              ? !!updated.BoolMeta1
              : prev.oldLookup,
        }));
        setFormData((prev) => ({
          ...prev,
          countInReject:
            typeof updated.CountInReject === "boolean"
              ? updated.CountInReject
              : prev.countInReject,
        }));
      },
      data: {
        ...metaCore,
        metaType4: metaExtra.metaType4, // Program Meta را فقط نشان بده
        BoolMeta1: metaCore.oldLookup,
        CountInReject: formData.countInReject,
        isEdit: isEdit,
        /* ✅ این مقدار برای fallback در LookUp */
        currentEntityTypeId:
          entityTypeId && !isNaN(Number(entityTypeId))
            ? Number(entityTypeId)
            : null,
      },
    };

    // ⛔️ برای component34 عمداً onMetaExtraChange را پاس نده
    const maybeExtra =
      formData.typeOfInformation !== "component34"
        ? { onMetaExtraChange: handleMetaExtraChange }
        : {};

    /* ✅ اگر کنترلر Lookup است، فیلدهای فرمِ جاری و entityTypeId را هم پاس بده */
    const maybeLookupBridge =
      formData.typeOfInformation === "component7"
        ? {
          srcFields: Array.isArray(srcFields) ? srcFields : undefined,
          srcEntityTypeId: (srcEntityTypeId ?? entityTypeId) as any,
        }
        : {};

    return (
      <SelectedComponent
        {...baseProps}
        {...maybeExtra}
        {...maybeLookupBridge}
      />
    );
  };

  return (
    <div className="flex items-center justify-center">
      <style>{`
        [dir="rtl"] label.ml-3 { margin-right: .75rem; margin-left: 0; }
      `}</style>

      {isLoading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div>
      )}

      <div className="w-full max-w-3xl bg-white rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {isEdit ? t("AddForms.EditColumn") : t("AddForms.AddNewColumn")}
        </h2>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
          onSubmit={handleSubmit}
        >
          {/* Column Name (EN/FA) */}
          {/* Column Name (EN/FA) */}
          <div className="md:col-span-1">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <DynamicInput
                  name={isFaMode ? "PersianName" : t("AddForms.ColumnName")}
                  type="text"
                  value={
                    isFaMode
                      ? formData.PersianName || ""
                      : formData.formName || ""
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData((prev) =>
                      isFaMode
                        ? { ...prev, PersianName: v }
                        : { ...prev, formName: v }
                    );
                  }}
                  labelClassName="text-gray-700 font-medium"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsFaMode((p) => !p)}
                className={[
                  "shrink-0 inline-flex items-center justify-center",
                  "h-8 px-3 rounded-lg self-end mb-[2px]", // ← کوچک‌تر + هم‌ترازی ته
                  "bg-gradient-to-r from-fuchsia-500 to-pink-500",
                  "text-white text-xs font-semibold tracking-wide", // ← فونت کوچک‌تر
                  "shadow shadow-pink-200/50",
                  "transition-all duration-200",
                  "hover:from-fuchsia-600 hover:to-pink-600 hover:shadow-md hover:scale-[1.01]",
                  "active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-pink-300",
                ].join(" ")}
                title={
                  isFaMode
                    ? "Switch to EN (formName)"
                    : "Switch to FA (PersianName)"
                }
              >
                {isFaMode ? "FA" : "EN"}
              </button>
            </div>

            {/* خطای اعتبارسنجی با ارتفاع ثابت */}
            <p
              className={`mt-1 text-xs ${errors.formName ? "text-red-500" : "invisible"
                } h-4`}
            >
              {errors.formName || "placeholder"}
            </p>
          </div>
          <div className="md:col-span-1">
            <DynamicInput
              name={t("AddForms.Order")}
              type="number"
              value={formData.order}
              onChange={(e) => handleChange("order", e.target.value)}
              labelClassName="text-gray-700 font-medium"
            />
            {/* فضای کمکی برای هم‌ارتفاع‌شدن با Column Name */}
            <p className="mt-1 text-xs invisible h-4">placeholder</p>
          </div>

          {/* Description */}
          <CustomTextarea
            name={t("AddForms.Description")}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="md:col-span-1 -mt-3"
            labelClassName="text-gray-700 font-medium"
          />

          {/* Command */}
          <DynamicSelector
            name="command"
            options={commandOptions}
            selectedValue={formData.command}
            onChange={(e) => handleChange("command", e.target.value)}
            label={t("AddForms.Command")}
            allowCustom={true}
            className="md:col-span-1 -mt-3"
            labelClassName="text-gray-700 font-medium"
          />

          {/* Required in Workflow */}
          <div className="flex items-center md:col-span-1 translate-y-[24px] -mt-12">
            <input
              type="checkbox"
              id="isRequiredInWf"
              name="isRequiredInWf"
              checked={formData.isRequiredInWf}
              onChange={(e) => handleChange("isRequiredInWf", e.target.checked)}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <label
              htmlFor="isRequiredInWf"
              className="ml-3 text-gray-700 font-medium"
            >
              {t("AddForms.IsRequiredInWf")}
            </label>
          </div>

          <DynamicInput
            name={t("AddForms.PrintCode")}
            type="text"
            value={formData.printCode}
            onChange={(e) => handleChange("printCode", e.target.value)}
            className="-mt-3"
            labelClassName="text-gray-700 font-medium"
          />

          {/* Editable in Workflow, Workflow Box, Show in Alert */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center translate-y-[10px]">
                <input
                  type="checkbox"
                  id="isEditableInWf"
                  name="isEditableInWf"
                  checked={formData.isEditableInWf}
                  onChange={(e) =>
                    handleChange("isEditableInWf", e.target.checked)
                  }
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="isEditableInWf"
                  className="ml-3 text-gray-700 font-medium"
                >
                  {t("AddForms.IsEditableInWorkflow")}
                </label>
              </div>

              <DynamicInput
                name={t("AddForms.AllowedWfBoxName")}
                type="text"
                value={formData.allowedWfBoxName}
                placeholder=""
                onChange={(e) =>
                  handleChange("allowedWfBoxName", e.target.value)
                }
                className="flex-1"
                labelClassName="text-gray-700 font-medium"
              />

              <div className="flex items-center translate-y-[10px]">
                <input
                  type="checkbox"
                  id="showInAlert"
                  name="showInAlert"
                  checked={formData.showInAlert}
                  onChange={(e) =>
                    handleChange("showInAlert", e.target.checked)
                  }
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="showInAlert"
                  className="ml-3 text-gray-700 font-medium"
                >
                  {t("AddForms.ShowInAlert")}
                </label>
              </div>
            </div>
          </div>

          {/* Type of Information */}
          <DynamicSelector
            name="typeOfInformation"
            options={typeOfInformationOptions}
            selectedValue={formData.typeOfInformation}
            onChange={(e) => handleChange("typeOfInformation", e.target.value)}
            label={t("AddForms.TypeOfInformation")}
            className="md:col-span-2"
            disabled={isEdit}
            labelClassName="text-gray-700 font-medium"
          />

          {/* checkbox row */}
          <div className="flex flex-wrap md:col-span-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                name="required"
                checked={formData.required}
                onChange={(e) => handleChange("required", e.target.checked)}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
              />
              <label
                htmlFor="required"
                className="ml-3 text-gray-700 font-medium"
              >
                {t("AddForms.Required")}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="mainColumns"
                name="mainColumns"
                checked={formData.mainColumns}
                onChange={(e) => handleChange("mainColumns", e.target.checked)}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
              />
              <label
                htmlFor="mainColumns"
                className="ml-3 text-gray-700 font-medium"
              >
                {t("AddForms.MainColumns")}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showInListView"
                name="showInListView"
                checked={formData.showInListView}
                onChange={(e) =>
                  handleChange("showInListView", e.target.checked)
                }
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
              />
              <label
                htmlFor="showInListView"
                className="ml-3 text-gray-700 font-medium"
              >
                {t("AddForms.ShowInList")}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rightToLeft"
                name="rightToLeft"
                checked={formData.rightToLeft}
                onChange={(e) => handleChange("rightToLeft", e.target.checked)}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
              />
              <label
                htmlFor="rightToLeft"
                className="ml-3 text-gray-700 font-medium"
              >
                {t("AddForms.RightToLeft")}
              </label>
            </div>
          </div>

          {/* Count In Reject + ReadOnly */}
          <div className="flex items-center md:col-span-2">
            <input
              type="checkbox"
              id="readOnly"
              name="readOnly"
              checked={formData.readOnly}
              onChange={(e) => handleChange("readOnly", e.target.checked)}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <label
              htmlFor="readOnly"
              className="ml-3 text-gray-700 font-medium"
            >
              {t("AddForms.ReadOnly")}
            </label>
          </div>

          {/* Read Only / Show in Tab / Program Meta Column Name */}
          <div className="flex flex-wrap md:col-span-2 gap-4 items-center">
            <div className="flex items-center translate-y-[10px]"></div>

            <DynamicInput
              name={t("AddForms.ShowInTab")}
              type="text"
              value={formData.showInTab}
              onChange={(e) => handleChange("showInTab", e.target.value)}
              placeholder=""
              className="flex-1"
              labelClassName="text-gray-700 font-medium"
            />

            {!hiddenTypesForProgramMeta.includes(
              formData.typeOfInformation
            ) && (
                <DynamicInput
                  name={t("AddForms.ProgramMetaColumnName")}
                  type="text"
                  value={metaExtra.metaType4}
                  onChange={(e) =>
                    setMetaExtra((prev) => ({
                      ...prev,
                      metaType4: e.target.value, // متن ساده، نه JSON
                    }))
                  }
                  className="flex-1"
                  labelClassName="text-gray-700 font-medium"
                />
              )}
          </div>

          {/* Dynamic controller */}
          <div className="md:col-span-2">{renderSelectedComponent()}</div>

          {/* Actions */}
          <div className="md:col-span-2 flex justify-center gap-6">
            <button
              type="button"
              className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition duration-200"
              onClick={() => {
                setFormData({
                  formName: "",
                  PersianName: "",
                  order: "",
                  description: "",
                  command: "",
                  isRequiredInWf: false,
                  printCode: "",
                  isEditableInWf: false,
                  allowedWfBoxName: "",
                  showInAlert: false,
                  typeOfInformation: "component1",
                  required: false,
                  mainColumns: false,
                  showInListView: false,
                  rightToLeft: false,
                  readOnly: false,
                  metaColumnName: "",
                  showInTab: "",
                  countInReject: false,
                });
                setDynamicMeta({});
                setErrors({});
                setMetaCore(DEFAULT_META_CORE);
                setMetaExtra(DEFAULT_META_EXTRA);
                onClose();
              }}
            >
              {t("Global.Cancel")}
            </button>

            <button
              type="submit"
              className={`px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={isLoading}
            >
              {isLoading
                ? isEdit
                  ? t("AddForms.Updating")
                  : t("AddForms.Adding")
                : isEdit
                  ? t("AddForms.UpdateColumn")
                  : t("AddForms.AddColumn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddColumnForm;
