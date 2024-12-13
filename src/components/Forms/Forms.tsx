// src/components/FormsCommand.tsx
import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import DynamicSelector from "../utilities/DynamicSelector";
import ListSelector from "../ListSelector/ListSelector";
import DynamicModal from "../utilities/DynamicModal";
import TableSelector from "../General/Configuration/TableSelector";
import HandlerUplodeExcellAccess from "../utilities/HandlerUplodeExcellAccess";

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
  { value: "1", label: "type1" },
  { value: "2", label: "type2" },
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

// توابع کمکی برای تبدیل شناسه‌ها
const parseIds = (ids: string): number[] => {
  return ids
    .split("|")
    .map((id) => parseInt(id))
    .filter((id) => !isNaN(id));
};

// استخراج شناسه پروژه‌ها از رشته‌
const extractProjectIds = (projectsStr: string): number[] => {
  // فرض: با توجه به داده‌های نمونه می‌توانید این را سفارشی کنید
  // در اینجا اگر ProjectsStr خالی نباشد، برای نمونه همان 101 را برمی‌گردانیم.
  if (!projectsStr) return [];
  // می‌توان با منطق واقعی تبدیل کرد. برای سادگی فرض می‌کنیم اگر مقداری داشت، پروژه 101
  return [101];
};

const getProjectStr = (id: number): string => {
  // این تابع بسته به پروژه واقعی باید بازنویسی شود.
  // اینجا فرضی است:
  if (id === 101) return "642bc0ce-4d93-474b-a869-6101211533d4|";
  if (id === 102) return "642bc0ce-4d93-474b-a869-6101211533d5|";
  if (id === 103) return "642bc0ce-4d93-474b-a869-6101211533d6|";
  return "";
};

const FormsCommand: React.FC<FormsCommandProps> = ({ selectedRow }) => {
  const [formData, setFormData] = useState({
    FormName: "",
    IsDoc: false,
    IsGlobal: false,
    ProjectsStr: "",
    EntityCateAName: "",
    EntityCateBName: "",
    Code: "",
    selectedProjects: [] as number[],
  });

  // وضعیت‌های مدال
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<"A" | "B" | null>(
    null
  );
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  // نگاشت میان Selector و فیلدهای formData
  const selectorToFieldMap: { [key in "A" | "B"]?: keyof typeof formData } = {
    A: "EntityCateAName",
    B: "EntityCateBName",
  };

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

  const handleProjectSelectionChange = (selectedIds: (string | number)[]) => {
    // تبدیل به آرایه number
    const numericIds = selectedIds
      .map((id) => Number(id))
      .filter((id) => !isNaN(id));
    handleChange("selectedProjects", numericIds);
    // تبدیل به استرینگ با توجه به ساختار
    const str = numericIds.map((id) => getProjectStr(id)).join("");
    handleChange("ProjectsStr", str);
  };

  const handleGlobalChange = (val: boolean) => {
    handleChange("IsGlobal", val);
  };

  // مدیریت باز کردن مدال انتخاب
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
      const field = selectorToFieldMap[currentSelector];
      if (field) {
        // چون در aCategoryOptions و bCategoryOptions ما value و label داریم
        // ما value را در فیلد ذخیره می‌کنیم
        handleChange(field, selectedRowData.value);
      }
      handleCloseModal();
    }
  };

  // گرفتن داده‌ها بر اساس selector فعلی
  const getRowData = (selector: "A" | "B" | null) => {
    if (selector === "A") {
      return aCategoryOptions;
    } else if (selector === "B") {
      return bCategoryOptions;
    }
    return [];
  };

  // مدیریت آپلود فایل ورد و اکسل
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  const handleWordUpload = (file: File) => {
    setWordFile(file);
    console.log("Word file selected:", file);
  };

  const handleExcelUpload = (file: File) => {
    setExcelFile(file);
    console.log("Excel file selected:", file);
  };

  return (
    <div>
      <TwoColumnLayout>
        <TwoColumnLayout.Item span={1}>
          <DynamicInput
            name="FormName"
            type="text"
            value={formData.FormName}
            placeholder=""
            onChange={(e) => handleChange("FormName", e.target.value)}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicInput
            name="Windows App Command"
            type="text"
            value={formData.Code}
            placeholder=""
            onChange={(e) => handleChange("Code", e.target.value)}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSelector
            options={aCategoryOptions}
            selectedValue={formData.EntityCateAName}
            onChange={(e) => handleChange("EntityCateAName", e.target.value)}
            label="ACategorization"
            showButton={true}
            onButtonClick={() => handleOpenModal("A")}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSelector
            options={bCategoryOptions}
            selectedValue={formData.EntityCateBName}
            onChange={(e) => handleChange("EntityCateBName", e.target.value)}
            label="BCategorization"
            showButton={true}
            onButtonClick={() => handleOpenModal("B")}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <CheckBox
            label="Transmital"
            checked={formData.IsDoc}
            onChange={(val) => handleChange("IsDoc", val)}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={2}>
          <ListSelector
            title="Related Projects"
            columnDefs={[{ field: "Name", headerName: "Project Name" }]}
            rowData={projectData}
            selectedIds={formData.selectedProjects}
            onSelectionChange={handleProjectSelectionChange}
            showSwitcher={true}
            isGlobal={formData.IsGlobal}
            onGlobalChange={handleGlobalChange}
            className="-mt-5"
            // شبیه Configuration - اضافه کردن ModalContentComponent و ...
            ModalContentComponent={TableSelector}
            modalContentProps={{
              columnDefs: [{ field: "Name", headerName: "Project Name" }],
              rowData: projectData,
              selectedRow: selectedRowData,
              onRowDoubleClick: () => {
                if (selectedRowData) {
                  // افزودن پروژه انتخابی
                  const newSelection = [
                    ...formData.selectedProjects,
                    selectedRowData.ID,
                  ];
                  handleProjectSelectionChange(newSelection);
                }
              },
              onRowClick: handleRowClick,
              onSelectButtonClick: () => {
                if (selectedRowData) {
                  const newSelection = [
                    ...formData.selectedProjects,
                    selectedRowData.ID,
                  ];
                  handleProjectSelectionChange(newSelection);
                }
              },
              isSelectDisabled: !selectedRowData,
            }}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={2}>
          <HandlerUplodeExcellAccess
            onWordUpload={handleWordUpload}
            onExcelUpload={handleExcelUpload}
          />
        </TwoColumnLayout.Item>
      </TwoColumnLayout>

      {/* مدال داینامیک برای انتخاب دسته‌بندی */}
      <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
        <TableSelector
          columnDefs={[{ headerName: "نام", field: "label" }]}
          rowData={getRowData(currentSelector)}
          selectedRow={selectedRowData}
          onRowDoubleClick={handleSelectButtonClick}
          onRowClick={handleRowClick}
          onSelectButtonClick={handleSelectButtonClick}
          isSelectDisabled={!selectedRowData}
        />
      </DynamicModal>
    </div>
  );
};

export default FormsCommand;
