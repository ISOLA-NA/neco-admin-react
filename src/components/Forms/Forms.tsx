import React, { useState, useEffect, useRef } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import DynamicSelector from "../utilities/DynamicSelector";
import ListSelector from "../ListSelector/ListSelector";
import DynamicModal from "../utilities/DynamicModal";
import TableSelector from "../General/Configuration/TableSelector"; // فرض بر این است که این کامپوننت وجود دارد
// فرض بر این است که این کامپوننت وجود دارد

// یک چک‌باکس ساده
const CheckBox = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  return (
    <div className="flex items-center space-x-2 mb-6">
      <input
        type="checkbox"
        className="form-checkbox h-4 w-4 text-purple-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        id={label}
      />
      <label htmlFor={label} className="text-gray-800 text-sm">
        {label}
      </label>
    </div>
  );
};

interface FormsCommandProps {
  selectedRow: any; // اطلاعات سطر انتخاب شده
}

// داده‌های نمونه برای DynamicSelector مربوط به ACategory و BCategory
const aCategoryOptions = [
  { value: "Start up", label: "Start up" },
  { value: "Development", label: "Development" },
];
const bCategoryOptions = [
  { value: "", label: "None" },
  { value: "Category B1", label: "Category B1" },
  { value: "Category B2", label: "Category B2" },
];

// داده‌های نمونه برای ProjectsStr:
const projectData = [
  { ID: 101, Name: "Project A" },
  { ID: 102, Name: "Project B" },
  { ID: 103, Name: "Project C" },
];

const FormsCommand: React.FC<FormsCommandProps> = ({ selectedRow }) => {
  const [formData, setFormData] = useState({
    FormName: "",
    IsDoc: false,
    IsGlobal: false,
    ProjectsStr: "",
    EntityCateAName: "",
    EntityCateBName: "",
    Code: "",
    selectedProjects: [] as number[], // برای ListSelector
  });

  // وضعیت‌های مدال
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<"A" | "B" | null>(
    null
  );
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  // وضعیت‌های آپلود فایل
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  // مراجع به input های فایل
  const wordInputRef = useRef<HTMLInputElement | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        FormName: selectedRow.Name || "",
        IsDoc: selectedRow.IsDoc || false,
        IsGlobal: selectedRow.IsGlobal || false,
        ProjectsStr: selectedRow.ProjectsStr || "",
        EntityCateAName: selectedRow.EntityCateAName || "",
        EntityCateBName: selectedRow.EntityCateBName || "",
        Code: selectedRow.Code || "",
        selectedProjects: extractProjectIds(selectedRow.ProjectsStr),
      });
    } else {
      setFormData({
        FormName: "",
        IsDoc: false,
        IsGlobal: false,
        ProjectsStr: "",
        EntityCateAName: "",
        EntityCateBName: "",
        Code: "",
        selectedProjects: [],
      });
    }
  }, [selectedRow]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProjectSelectionChange = (selectedIds: number[]) => {
    handleChange("selectedProjects", selectedIds);
    // تبدیل IDs به استرینگ با | در انتها (همانند داده‌های اصلی)
    const str = selectedIds.map((id) => getProjectStr(id)).join("");
    handleChange("ProjectsStr", str);
  };

  const handleGlobalChange = (val: boolean) => {
    handleChange("IsGlobal", val);
  };

  const extractProjectIds = (projectsStr: string): number[] => {
    if (!projectsStr) return [];
    const parts = projectsStr.split("|").filter((p) => p.trim() !== "");
    if (parts.length > 0) {
      return [101]; // با توجه به داده‌های نمونه
    }
    return [];
  };

  const getProjectStr = (id: number): string => {
    if (id === 101) return "642bc0ce-4d93-474b-a869-6101211533d4|";
    else return "";
  };

  // توابع مدیریت مدال
  const handleOpenModal = (selector: "A" | "B") => {
    setCurrentSelector(selector);
    setSelectedRowData(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentSelector(null);
    setSelectedRowData(null);
  };

  const handleRowClick = (row: any) => {
    setSelectedRowData(row);
  };

  const handleSelectButtonClick = () => {
    if (selectedRowData && currentSelector) {
      if (currentSelector === "A") {
        handleChange("EntityCateAName", selectedRowData.value);
      } else if (currentSelector === "B") {
        handleChange("EntityCateBName", selectedRowData.value);
      }
      handleCloseModal();
    }
  };

  // دریافت داده‌های ردیف بر اساس دسته‌بندی
  const getRowData = (selector: "A" | "B" | null) => {
    if (selector === "A") {
      return aCategoryOptions;
    } else if (selector === "B") {
      return bCategoryOptions;
    }
    return [];
  };

  // توابع مدیریت آپلود فایل‌ها
  const handleWordUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setWordFile(e.target.files[0]);
      // انجام عملیات مورد نیاز با فایل ورد (مثلاً آپلود به سرور)
      console.log("Word file selected:", e.target.files[0]);
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
      // انجام عملیات مورد نیاز با فایل اکسل (مثلاً آپلود به سرور)
      console.log("Excel file selected:", e.target.files[0]);
    }
  };

  return (
    <div className="relative">
      <TwoColumnLayout>
        {/* FormName */}
        <DynamicInput
          name="FormName"
          type="text"
          value={formData.FormName}
          placeholder=""
          onChange={(e) => handleChange("FormName", e.target.value)}
        />

        {/* Windows App Command */}
        <DynamicInput
          name="Windows App Command"
          type="text"
          value={formData.Code}
          placeholder=""
          onChange={(e) => handleChange("Code", e.target.value)}
        />

        {/* ACategorization با showButton */}
        <DynamicSelector
          options={aCategoryOptions}
          selectedValue={formData.EntityCateAName}
          onChange={(e) => handleChange("EntityCateAName", e.target.value)}
          label="ACategorization"
          showButton={true}
          onButtonClick={() => handleOpenModal("A")}
        />

        {/* BCategorization با showButton */}
        <DynamicSelector
          options={bCategoryOptions}
          selectedValue={formData.EntityCateBName}
          onChange={(e) => handleChange("EntityCateBName", e.target.value)}
          label="BCategorization"
          showButton={true}
          onButtonClick={() => handleOpenModal("B")}
        />

        {/* Transmital (CheckBox) */}
        <CheckBox
          label="Transmital"
          checked={formData.IsDoc}
          onChange={(val) => handleChange("IsDoc", val)}
        />

        {/* Related Projects با سوییچر Global */}
        <div>
          <ListSelector
            title="Related Projects"
            columnDefs={[{ field: "Name", headerName: "Project Name" }]}
            rowData={projectData}
            selectedIds={formData.selectedProjects}
            onSelectionChange={handleProjectSelectionChange}
            showSwitcher={true}
            isGlobal={formData.IsGlobal}
            onGlobalChange={handleGlobalChange}
            className="mt-10"
          />
        </div>

        {/* ردیف جدید: Template Word File با دو دکمه گرادیانتی */}
        <div className="flex items-center justify-between mb-6 absolute top-80">
          {/* عنوان */}
          <span className="text-gray-800 text-sm font-medium mr-5">
            Template Word File
          </span>

          {/* دکمه‌ها */}
          <div className="flex space-x-4">
            {/* دکمه آپلود ورد */}
            <button
              type="button"
              onClick={() => wordInputRef.current?.click()}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-800 transition-colors duration-300"
            >
              آپلود ورد
            </button>
            <input
              type="file"
              accept=".doc,.docx"
              ref={wordInputRef}
              className="hidden"
              onChange={handleWordUpload}
            />

            {/* دکمه آپلود اکسل */}
            <button
              type="button"
              onClick={() => excelInputRef.current?.click()}
              className="bg-gradient-to-r from-pink-500 to-pink-700 text-white px-4 py-2 rounded-lg shadow hover:from-pink-600 hover:to-pink-800 transition-colors duration-300"
            >
              آپلود اکسل
            </button>
            <input
              type="file"
              accept=".xls,.xlsx"
              ref={excelInputRef}
              className="hidden"
              onChange={handleExcelUpload}
            />
          </div>
        </div>

        {/* مدال داینامیک برای انتخاب دسته‌بندی */}
        <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
          <TableSelector
            columnDefs={[
              { headerName: "نام", field: "label" }, // assuming label نشان دهنده نام است
              // اگر توضیحاتی نیز وجود دارد، می‌توانید فیلد مربوطه را اضافه کنید
            ]}
            rowData={getRowData(currentSelector)}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        </DynamicModal>
      </TwoColumnLayout>
    </div>
  );
};

export default FormsCommand;
