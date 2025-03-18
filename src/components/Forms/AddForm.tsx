// src/components/AddColumnForm.tsx
import React, { useState, useEffect } from "react";
import { useApi } from "../../context/ApiContext";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import DynamicSelector from "../utilities/DynamicSelector";
import { showAlert } from "../utilities/Alert/DynamicAlert";

// Import dynamic controllers
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
import Component20 from "./ControllerForms/WordPanelController";
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
  component11: 17,
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
  component29:11,
  component30:12,
  component31:13,
  component32:18,
  component33:23
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
  component29:Component29,
  component30:Component30,
  component31:Component31,
  component32:Component32,
  component33:Component33,
};

const typeOfInformationOptions = [
  { value: "component1", label: "Text" },
  { value: "component2", label: "RichText" },
  { value: "component3", label: "Choice" },
  { value: "component4", label: "Number" },
  { value: "component5", label: "Date Time" },
  { value: "component6", label: "Persian Date" },
  { value: "component7", label: "Lookup" },
  { value: "component27", label: "Hyper Link" },
  { value: "component8", label: "Post PickerList" },
  { value: "component9", label: "Lookup RealValue" },
  { value: "component10", label: "Lookup AdvanceTable" },
  { value: "component26", label: "Advance Lookup AdvanceTable" },
  { value: "component29", label: "Title" },
  { value: "component30", label: "Section" },
  { value: "component31", label: "SubSection" },
  { value: "component12", label: "Lookup Image" },
  { value: "component28", label: "Select User In Post" },
  { value: "component13", label: "Yes No" },
  { value: "component14", label: "Attach File" },
  { value: "component15", label: "Picture Box" },
  { value: "component16", label: "Table" },
  { value: "component17", label: "Pfi Lookup" },
  { value: "component32", label: "MePostSelector" },
  { value: "component18", label: "Seqnial Number" },
  { value: "component19", label: "Advance Table" },
  { value: "component33", label: "Advance wf" },
  { value: "component20", label: "Word Panel" },
  { value: "component21", label: "Excecl Panel" },
  { value: "component22", label: "Calculated Field" },
  { value: "component23", label: "Excel Calculator" },
  { value: "component24", label: "Tab" },
  { value: "component25", label: "Map" },
];

interface AddColumnFormProps {
  onClose: () => void;
  onSave?: () => void;
  isEdit?: boolean;
  existingData?: any;
  entityTypeId?: string; // مقدار nEntityTypeID از selectedRow
}

const AddColumnForm: React.FC<AddColumnFormProps> = ({
  onClose,
  onSave,
  isEdit = false,
  existingData = null,
  entityTypeId
}) => {
  const { insertEntityField, updateEntityField } = useApi();

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

  // در حالت ویرایش فرم را مقداردهی اولیه می‌کنیم
  useEffect(() => {
    if (isEdit) {
      setFormData(getInitialFormData());
    } else {
      // اگر حالت جدید است
      setFormData({
        formName: "",
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, existingData]);

  // تغییر مقادیر فرم
  const handleChange = (field: keyof typeof formData, value: any) => {
    if (field === "command") {
      const exists = commandOptions.find(opt => opt.value === value);
      if (exists) {
        setFormData((prev) => ({ ...prev, [field]: exists.value }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ذخیره فرم (Submit)
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

    // اگر از کنترلر فرزند هم چیزی می‌خواهید (مثلا lookupMode)، بگیرید
    // ولی اینجا فعلا مهم نیست
    const lookupModeValue =
      dynamicMeta.LookupMode == null || dynamicMeta.LookupMode === ""
        ? null
        : Number(dynamicMeta.LookupMode);

    const metaType5Value = dynamicMeta.metaType5 || null;

    const payload: any = {
      DisplayName: formData.formName,
      IsShowGrid: formData.showInListView,
      IsEditableInWF: formData.isEditableInWf,
      WFBOXName: formData.allowedWfBoxName,
      nEntityTypeID: entityTypeId,
      ColumnType: columnTypeMapping[formData.typeOfInformation],
      Code: formData.command || null,
      Description: formData.description,
      metaType1: dynamicMeta.metaType1 || "",
      metaType2: dynamicMeta.metaType2 || "",
      metaType3: dynamicMeta.metaType3 || "",
      metaType4: dynamicMeta.metaType4 || "",
      metaTypeJson: dynamicMeta.metaTypeJson || null,
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
      CreatedTime: isEdit && existingData
        ? existingData.CreatedTime
        : new Date().toISOString(),
      ModifiedTime: currentTimestamp,
      ModifiedById: isEdit && existingData
        ? existingData.ModifiedById || "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c"
        : "d36eda78-5de1-4f70-bc99-d5a2c26a5f8c",
      LookupMode: lookupModeValue,
      BoolMeta1: dynamicMeta.oldLookup ? true : false,
      // اینجا مقدار چک‌باکس مربوط به CountInReject را هم می‌گذاریم:
      CountInReject: formData.countInReject,
      metaType5: metaType5Value,
      ID: isEdit && existingData ? existingData.ID : 0,
      IsVisible: true,
      LastModified: currentTimestamp,
    };

    try {
      if (isEdit) {
        await updateEntityField(payload);
        // showAlert("success", undefined, "Success", "Edited successfully");
      } else {
        await insertEntityField(payload);
        showAlert("success", undefined, "Success", "Added successfully");
      }
      setIsLoading(false);

      // موفقیت
      if (onSave) onSave();
      onClose();
    } catch (error: any) {
      setIsLoading(false);
      setErrors({ form: "An error occurred." });
      console.error(error);
      showAlert("error", undefined, "Error", "Something went wrong");
    }
  };

  // رندر کنترلر داینامیک (مثلاً Lookup, SeqnialNumber, ...)
  const renderSelectedComponent = () => {
    const SelectedComponent = componentMapping[formData.typeOfInformation];
    if (!SelectedComponent) return null;
    const dataForChild = {
      metaType1: existingData?.metaType1 || "",
      metaType2: existingData?.metaType2 || "",
      metaType3: existingData?.metaType3 || "",
      metaType4: existingData?.metaType4 || "",
      LookupMode: existingData?.LookupMode || "",
      CountInReject: existingData?.CountInReject || false,
      BoolMeta1: existingData?.BoolMeta1 || false,
      metaType5: existingData?.metaType5 || "",
      removeSameName: existingData?.CountInReject || false,
      metaTypeJson: existingData?.metaTypeJson || "",
    };
    return (
      <SelectedComponent
        onMetaChange={setDynamicMeta}
        data={isEdit ? dataForChild : undefined}
      />
    );
  };

  // تعیین نوع‌های اطلاعاتی که در آن‌ها فیلد Program Meta Column Name نشان داده نشود
  const hiddenTypesForProgramMeta = [
    "component9",  // Lookup RealValue
    "component7",  // Lookup
    "component26", // Advance Lookup AdvanceTable
    "component19", // Advance Table
    "component10", // Lookup AdvanceTable
    "component18", // Seqnial Number
    "component16", // Table
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {isLoading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div>
      )}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {isEdit ? "Edit Column" : "Add New Column"}
        </h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          {/* Column Name */}
          <DynamicInput
            name="formName"
            type="text"
            value={formData.formName}
            placeholder="Column Name"
            onChange={(e) => handleChange("formName", e.target.value)}
            required={true}
          />
          {errors.formName && (
            <p className="text-red-500 md:col-span-2">{errors.formName}</p>
          )}

          {/* Order */}
          <DynamicInput
            name="order"
            type="number"
            value={formData.order}
            placeholder="Order"
            onChange={(e) => handleChange("order", e.target.value)}
          />

          {/* Description */}
          <CustomTextarea
            name="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Description"
            className="md:col-span-1"
          />

          {/* Command selector با امکان تایپ دلخواه */}
          <DynamicSelector
            name="command"
            options={commandOptions}
            selectedValue={formData.command}
            onChange={(e) => handleChange("command", e.target.value)}
            label="Command"
            allowCustom={true}
            className="md:col-span-1"
          />

          {/* Required in Workflow */}
          <div className="flex items-center md:col-span-1">
            <input
              type="checkbox"
              id="isRequiredInWf"
              name="isRequiredInWf"
              checked={formData.isRequiredInWf}
              onChange={(e) => handleChange("isRequiredInWf", e.target.checked)}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="isRequiredInWf" className="ml-3 text-gray-700 font-medium">
              Required in Workflow
            </label>
          </div>

          {/* PrintCode */}
          <DynamicInput
            name="printCode"
            type="text"
            value={formData.printCode}
            placeholder="Print Code"
            onChange={(e) => handleChange("printCode", e.target.value)}
          />

          {/* Editable in Workflow, Workflow Box, Show in Alert */}
          <div className="md:col-span-2 flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
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
                <label htmlFor="isEditableInWf" className="ml-3 text-gray-700 font-medium">
                  Editable in Workflow
                </label>
              </div>
              <DynamicInput
                name="allowedWfBoxName"
                type="text"
                value={formData.allowedWfBoxName}
                placeholder="Workflow Box Name"
                onChange={(e) =>
                  handleChange("allowedWfBoxName", e.target.value)
                }
                className="flex-1"
              />
              <div className="flex items-center">
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
                <label htmlFor="showInAlert" className="ml-3 text-gray-700 font-medium">
                  Show in Alert
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
            label="Type of Information"
            className="md:col-span-2"
          />

          {/* چند چک‌باکس در یک ردیف */}
          <div className="flex flex-wrap md:col-span-2 space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                name="required"
                checked={formData.required}
                onChange={(e) => handleChange("required", e.target.checked)}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="required" className="ml-3 text-gray-700 font-medium">
                Required
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
              <label htmlFor="mainColumns" className="ml-3 text-gray-700 font-medium">
                Main Columns
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
              <label htmlFor="showInListView" className="ml-3 text-gray-700 font-medium">
                Show in List
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
              <label htmlFor="rightToLeft" className="ml-3 text-gray-700 font-medium">
                Right to Left
              </label>
            </div>
          </div>

          {/* چک‌باکس جدید برای Count In Reject */}
          <div className="flex items-center md:col-span-2">
            <input
              type="checkbox"
              id="countInReject"
              name="countInReject"
              checked={formData.countInReject}
              onChange={(e) => handleChange("countInReject", e.target.checked)}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="countInReject" className="ml-3 text-gray-700 font-medium">
              Count In Reject
            </label>
          </div>

          {/* ردیف Read Only, Show in Tab و Program Meta Column Name */}
          <div className="flex flex-wrap md:col-span-2 space-x-4 items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="readOnly"
                name="readOnly"
                checked={formData.readOnly}
                onChange={(e) => handleChange("readOnly", e.target.checked)}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="readOnly" className="ml-3 text-gray-700 font-medium">
                Read Only
              </label>
            </div>
            <DynamicInput
              name="showInTab"
              type="text"
              value={formData.showInTab}
              onChange={(e) => handleChange("showInTab", e.target.value)}
              placeholder="Show in Tab"
              className="flex-1"
            />
            {/* در برخی نوع‌ها metaType4 پنهان می‌ماند */}
            {!hiddenTypesForProgramMeta.includes(formData.typeOfInformation) && (
              <DynamicInput
                name="programMetaColumnName"
                type="text"
                value={dynamicMeta.metaType4 || ""}
                placeholder="Program Meta Column Name"
                onChange={(e) =>
                  setDynamicMeta((prev: any) => ({
                    ...prev,
                    metaType4: e.target.value
                  }))
                }
                className="flex-1"
              />
            )}
          </div>

          {/* کنترلر داینامیک (مثلاً Lookup, SeqnialNumber, ...) */}
          <div className="md:col-span-2">
            {renderSelectedComponent()}
          </div>

          {/* دکمه‌های Cancel و Submit */}
          <div className="md:col-span-2 flex justify-center space-x-6">
            <button
              type="button"
              className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition duration-200"
              onClick={() => {
                setFormData({
                  formName: "",
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
                onClose();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition duration-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading
                ? isEdit
                  ? "Updating..."
                  : "Adding..."
                : isEdit
                ? "Update Column"
                : "Add Column"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddColumnForm;
