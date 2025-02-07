// src/components/AddColumnForm.tsx
import React, { useState, useCallback } from "react";
import { useApi } from "../../context/ApiContext";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import DynamicSelector from "../utilities/DynamicSelector";

// Import dynamic controllers
import Component1 from "./ControllerForms/TextController";
import Component2 from "./ControllerForms/RichTextController";
import Component3 from "./ControllerForms/ChoiceController";
import Component4 from "./ControllerForms/NumberController";
import Component5 from "./ControllerForms/DateTimeEnglishController";
import Component6 from "./ControllerForms/DateTimePersianController";
import Component7 from "./ControllerForms/LookupController";
import Component8 from "./ControllerForms/PostPickerList";
import Component9 from "./ControllerForms/LookupRealValueController";
import Component10 from "./ControllerForms/LookUpAdvanceTable";
import Component11 from "./ControllerForms/AdvanceLookupAdvanceTable";
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

// نگاشت کامپوننت‌ها به شماره ColumnType مطابق با منطق initEntity شما
const columnTypeMapping: { [key: string]: number } = {
  component1: 15, // Text → case 15 (Input Text)
  component2: 1, // RichText → case 1 (Textarea)
  component3: 2, // Choice → case 2
  component4: 3, // Number → case 3
  component5: 4, // Date Time → case 4
  component6: 21, // Persian Date → case 21
  component7: 5, // Lookup → case 5
  component8: 19, // Post PickerList → case 19
  component9: 34, // Lookup RealValue → case 34
  component10: 35, // Lookup AdvanceTable → case 35
  component11: 17, // Advance LookupAdvanceTable → case 17
  component12: 30, // Lookup Image → case 30
  component13: 6, // Yes No → case 6
  component14: 9, // Attach File → case 9
  component15: 26, // Picture Box → case 26
  component16: 10, // Table → case 10
  component17: 16, // PFILookup → case 16
  component18: 20, // Seqnial Number → case 20
  component19: 22, // Advance Table → case 22
  component20: 24, // Word Panel → case 24
  component21: 25, // Excecl Panel → case 25
  component22: 27, // Calculated Field → case 27
  component23: 29, // Excel Calculator → case 29
  component24: 32, // Tab → case 32
  component25: 28, // Map → case 28
};

// نگاشت شناسه کامپوننت به کامپوننت مربوطه جهت رندر داینامیک
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
  component11: Component11,
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
};

// گزینه‌های "Type of Information" جهت انتخاب در فرم
const typeOfInformationOptions = [
  { value: "component1", label: "Text" },
  { value: "component2", label: "RichText" },
  { value: "component3", label: "Choice" },
  { value: "component4", label: "Number" },
  { value: "component5", label: "Date Time" },
  { value: "component6", label: "Persian Date" },
  { value: "component7", label: "Lookup" },
  { value: "component8", label: "Post PickerList" },
  { value: "component9", label: "Lookup RealValue" },
  { value: "component10", label: "Lookup AdvanceTable" },
  { value: "component11", label: "Advance LookupAdvanceTable" },
  { value: "component12", label: "Lookup Image" },
  { value: "component13", label: "Yes No" },
  { value: "component14", label: "Attach File" },
  { value: "component15", label: "Picture Box" },
  { value: "component16", label: "Table" },
  { value: "component17", label: "Pfi Lookup" },
  { value: "component18", label: "Seqnial Number" },
  { value: "component19", label: "Advance Table" },
  { value: "component20", label: "Word Panel" },
  { value: "component21", label: "Excecl Panel" },
  { value: "component22", label: "Calculated Field" },
  { value: "component23", label: "Excel Calculator" },
  { value: "component24", label: "Tab" },
  { value: "component25", label: "Map" },
];

interface AddColumnFormProps {
  onClose: () => void;
  isEdit?: boolean;
  existingData?: any;
}

const AddColumnForm: React.FC<AddColumnFormProps> = ({
  onClose,
  isEdit = false,
  existingData = null,
}) => {
  const { insertEntityField, updateEntityField } = useApi();

  // حالت اولیه فرم (در حالت ادیت از existingData استفاده می‌شود)
  const [formData, setFormData] = useState({
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
    metaColumnName: existingData ? existingData.metaType1 : "",
    showInTab: existingData ? existingData.ShowInTab : "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // متادیتای داینامیک دریافتی از کامپوننت‌های فرزند (مثلاً NumberController)
  const [dynamicMeta, setDynamicMeta] = useState<any>({});

  // استفاده از useCallback برای ثابت نگه داشتن مرجع تابع handleMetaChange
  const handleMetaChange = useCallback((meta: any) => {
    setDynamicMeta(meta);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // رندر کامپوننت داینامیک (مثلاً NumberController)
  const renderSelectedComponent = () => {
    const SelectedComponent = componentMapping[formData.typeOfInformation];
    return SelectedComponent ? (
      <SelectedComponent onMetaChange={handleMetaChange} />
    ) : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload: any = {
      DisplayName: formData.formName,
      IsShowGrid: formData.showInListView,
      IsEditableInWF: formData.isEditableInWf,
      CountInReject: null,
      WFBOXName: formData.allowedWfBoxName,
      nEntityTypeID: 5,
      ColumnType: columnTypeMapping[formData.typeOfInformation],
      Code: formData.command || null,
      Description: formData.description,
      // در صورت انتخاب Number (component4) مقادیر متادیتا به رشته تبدیل می‌شوند
      metaType1:
        formData.typeOfInformation === "component4"
          ? dynamicMeta.defaultValue != null
            ? dynamicMeta.defaultValue.toString()
            : ""
          : formData.metaColumnName || "",
      metaType2:
        formData.typeOfInformation === "component4"
          ? dynamicMeta.minValue != null
            ? dynamicMeta.minValue.toString()
            : ""
          : "",
      metaType3:
        formData.typeOfInformation === "component4"
          ? dynamicMeta.maxValue != null
            ? dynamicMeta.maxValue.toString()
            : ""
          : "",
      metaType4: formData.showInTab || "",
      metaTypeJson: null,
      PrintCode: formData.printCode,
      IsForceReadOnly: formData.readOnly,
      IsUnique: false,
      IsRequire: formData.required,
      IsMainColumn: formData.mainColumns,
      IsRequireInWf: formData.isRequiredInWf,
      IsRTL: formData.rightToLeft,
      orderValue: parseFloat(formData.order),
      ShowInAlert: formData.showInAlert,
      ShowInTab: formData.showInTab,
      CreatedTime: new Date().toISOString(),
      ModifiedTime: new Date().toISOString(),
      ModifiedById: null,
      LookupMode: null,
      BoolMeta1: false,
      metaType5: null,
      ID: 0,
      IsVisible: true,
      LastModified: null,
    };

    try {
      if (isEdit) {
        await updateEntityField(payload);
      } else {
        await insertEntityField(payload);
      }
      setIsLoading(false);
      onClose();
    } catch (error: any) {
      setIsLoading(false);
      setErrors({ form: "An error occurred." });
      console.error(error);
    }
  };

  const commandOptions = [
    { value: "command1", label: "Command 1" },
    { value: "command2", label: "Command 2" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4 -mt-16">
      {isLoading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div>
      )}

      <div className="w-full bg-white rounded-lg overflow-auto flex flex-col">
        <h2 className="text-3xl font-semibold mb-8 text-center">
          Add New Column
        </h2>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-12 flex-grow"
          onSubmit={handleSubmit}
        >
          <DynamicInput
            name="formName"
            type="text"
            value={formData.formName}
            placeholder="Column Name"
            onChange={handleChange}
            required
            error={!!errors.formName}
            errorMessage={errors.formName}
            className="md:col-span-1"
          />
          <DynamicInput
            name="order"
            type="number"
            value={formData.order}
            placeholder="Order"
            onChange={handleChange}
            required
            error={!!errors.order}
            errorMessage={errors.order}
            className="md:col-span-1"
          />
          <CustomTextarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            required
            label="Description"
            error={!!errors.description}
            errorMessage={errors.description}
            className="md:col-span-1 -mt-10"
          />
          <DynamicSelector
            name="command"
            options={commandOptions}
            selectedValue={formData.command}
            onChange={handleSelectChange}
            label="Command"
            error={!!errors.command}
            errorMessage={errors.command}
            className="md:col-span-1 -mt-16"
          />
          <div className="flex items-center md:col-span-1 -mt-8">
            <input
              type="checkbox"
              id="isRequiredInWf"
              name="isRequiredInWf"
              checked={formData.isRequiredInWf}
              onChange={handleChange}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <label
              htmlFor="isRequiredInWf"
              className="ml-3 text-gray-700 font-medium"
            >
              Required in Workflow
            </label>
          </div>
          <DynamicInput
            name="printCode"
            type="text"
            value={formData.printCode}
            placeholder="Print Code"
            onChange={handleChange}
            required
            error={!!errors.printCode}
            errorMessage={errors.printCode}
            className="md:col-span-1 -mt-8"
          />
          <div className="flex flex-col md:col-span-2 space-y-4 -mt-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isEditableInWf"
                  name="isEditableInWf"
                  checked={formData.isEditableInWf}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="isEditableInWf"
                  className="ml-3 text-gray-700 font-medium"
                >
                  Editable in Workflow
                </label>
              </div>
              <DynamicInput
                name="allowedWfBoxName"
                type="text"
                value={formData.allowedWfBoxName}
                placeholder="Workflow Box Name"
                onChange={handleChange}
                required
                error={!!errors.allowedWfBoxName}
                errorMessage={errors.allowedWfBoxName}
                className="flex-1"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInAlert"
                  name="showInAlert"
                  checked={formData.showInAlert}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="showInAlert"
                  className="ml-3 text-gray-700 font-medium"
                >
                  Show in Alert
                </label>
              </div>
            </div>
          </div>
          <DynamicSelector
            name="typeOfInformation"
            options={typeOfInformationOptions}
            selectedValue={formData.typeOfInformation}
            onChange={handleSelectChange}
            label="Type of Information"
            error={!!errors.typeOfInformation}
            errorMessage={errors.typeOfInformation}
            className="md:col-span-2 -mt-2"
          />
          <div className="flex flex-wrap md:col-span-2 space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                name="required"
                checked={formData.required}
                onChange={handleChange}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
              />
              <label
                htmlFor="required"
                className="ml-3 text-gray-700 font-medium"
              >
                Required
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="mainColumns"
                name="mainColumns"
                checked={formData.mainColumns}
                onChange={handleChange}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
              />
              <label
                htmlFor="mainColumns"
                className="ml-3 text-gray-700 font-medium"
              >
                Main Columns
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showInListView"
                name="showInListView"
                checked={formData.showInListView}
                onChange={handleChange}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
              />
              <label
                htmlFor="showInListView"
                className="ml-3 text-gray-700 font-medium"
              >
                Show in List
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rightToLeft"
                name="rightToLeft"
                checked={formData.rightToLeft}
                onChange={handleChange}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
              />
              <label
                htmlFor="rightToLeft"
                className="ml-3 text-gray-700 font-medium"
              >
                Right to Left
              </label>
            </div>
          </div>
          <div className="flex flex-wrap md:col-span-2 space-x-4 -mt-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="readOnly"
                name="readOnly"
                checked={formData.readOnly}
                onChange={handleChange}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
              />
              <label
                htmlFor="readOnly"
                className="ml-3 text-gray-700 font-medium"
              >
                Read Only
              </label>
            </div>
            <DynamicInput
              name="metaColumnName"
              type="text"
              value={formData.metaColumnName}
              onChange={handleChange}
              placeholder="Meta Column Name"
              required
              error={!!errors.metaColumnName}
              errorMessage={errors.metaColumnName}
              className="flex-1"
            />
            <DynamicInput
              name="showInTab"
              type="text"
              value={formData.showInTab}
              onChange={handleChange}
              placeholder="Show in Tab"
              required
              error={!!errors.showInTab}
              errorMessage={errors.showInTab}
              className="flex-1"
            />
          </div>
          {/* رندر کامپوننت داینامیک (مثلاً NumberController) */}
          <div className="mb-8 w-full md:col-span-2 -mt-8">
            {renderSelectedComponent()}
          </div>
          <div className="flex justify-center md:col-span-2 space-x-4 -mt-8">
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
                });
                setErrors({});
                setDynamicMeta({});
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
              {isLoading ? "Adding..." : "Add Column"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddColumnForm;
