// src/components/General/ApprovalFlow.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import ListSelector from "../ListSelector/ListSelector";
import DynamicSelector from "../utilities/DynamicSelector";
import DynamicModal from "../utilities/DynamicModal";
import TableSelector from "../General/Configuration/TableSelector"; // فرض می‌کنیم که این مسیر صحیح است

interface ApprovalFlowProps {
  selectedRow: any;
}

const relatedProjectsData = [
  {
    ID: "642bc0ce-4d93-474b-a869-6101211533d4",
    ProjectName: "Project Alpha",
    Name: "Project Alpha",
    IsVisible: true,
    IsIdea: false,
    State: "Active",
  },
  {
    ID: "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    ProjectName: "Project Beta",
    Name: "Project Beta",
    IsVisible: true,
    IsIdea: false,
    State: "Planning",
  },
  // Add more projects as needed...
];

function getAssociatedProjects(
  projectsStr?: string,
  projectsData?: { ID: string; Name: string }[]
) {
  const safeProjectsData = projectsData || [];
  const safeProjectsStr = projectsStr || "";
  const projectsArray = safeProjectsStr.split("|").filter(Boolean);
  return safeProjectsData.filter((project) =>
    projectsArray.includes(project.ID)
  );
}

// اصلاح typeOptions برای مطابقت با nProgramTypeID
const typeOptions = [
  { value: "1", label: "Type 1" },
  { value: "2", label: "Type 2" },
  { value: "3", label: "Type 3" },
  { value: "4", label: "Type 4" },
  { value: "5", label: "Type 5" },
];

const ApprovalFlow: React.FC<ApprovalFlowProps> = ({ selectedRow }) => {
  const [programTemplateData, setApprovalFlowData] = useState<{
    ID: string | number;
    Name: string;
    Duration: number | null;
    PCost: number | null;
    Description: string;
    ProjectsStr: string;
    IsGlobal: boolean;
    ProgramTypeID: string;
  }>({
    ID: "",
    Name: "",
    Duration: null,
    PCost: null,
    Description: "",
    ProjectsStr: "",
    IsGlobal: false,
    ProgramTypeID: "",
  });

  useEffect(() => {
    if (selectedRow) {
      setApprovalFlowData({
        ID: selectedRow.ID || "",
        Name: selectedRow.Name || "",
        Duration: selectedRow.Duration || null,
        PCost: selectedRow.PCost || null,
        Description: selectedRow.Description || "",
        ProjectsStr: selectedRow.ProjectsStr || "",
        IsGlobal: selectedRow.IsGlobal || false,
        ProgramTypeID: selectedRow.nProgramTypeID
          ? String(selectedRow.nProgramTypeID)
          : "",
      });
    } else {
      setApprovalFlowData({
        ID: "",
        Name: "",
        Duration: null,
        PCost: null,
        Description: "",
        ProjectsStr: "",
        IsGlobal: false,
        ProgramTypeID: "",
      });
    }
  }, [selectedRow]);

  const handleChange = (
    field: keyof typeof programTemplateData,
    value: string | boolean | (string | number)[]
  ) => {
    setApprovalFlowData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const projectColumnDefs = [{ field: "Name", headerName: "Project Name" }];

  const handleProjectsChange = (selectedIds: (string | number)[]) => {
    const newProjectsStr =
      selectedIds.length > 0 ? selectedIds.join("|") + "|" : "";
    handleChange("ProjectsStr", newProjectsStr);
  };

  const handleGlobalChange = (isGlobal: boolean) => {
    handleChange("IsGlobal", isGlobal);
  };

  const handleProgramTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange("ProgramTypeID", e.target.value);
  };

  const associatedProjects = getAssociatedProjects(
    programTemplateData.ProjectsStr,
    relatedProjectsData
  );
  const selectedProjectIds = associatedProjects.map((p) => p.ID);

  // وضعیت برای مدیریت مدال
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<string>("ProgramType");
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  // توابع مدیریت مدال
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleRowClick = (rowData: any) => {
    setSelectedRowData(rowData);
  };

  const handleSelectButtonClick = () => {
    if (selectedRowData) {
      handleChange("ProgramTypeID", selectedRowData.value);
      handleCloseModal();
    }
  };

  // تابع برای دریافت داده‌های ردیف‌ها بر اساس انتخاب‌کننده فعلی
  const getRowData = (selector: string) => {
    // اینجا باید داده‌های مربوط به انتخاب‌کننده فعلی را برگردانید
    // برای مثال، اگر selector برابر با "ProgramType" باشد:
    if (selector === "ProgramType") {
      return typeOptions.map((option) => ({
        value: option.value,
        label: option.label,
      }));
    }
    // سایر انتخاب‌کننده‌ها را در صورت نیاز اضافه کنید
    return [];
  };

  return (
    <TwoColumnLayout>
      {/* Approval Flow Name Input */}
      <DynamicInput
        name="Program Name"
        type="text" // اصلاح نوع به "text"
        value={programTemplateData.Name}
        placeholder=""
        onChange={(e) => handleChange("Name", e.target.value)} // اصلاح فیلد به "Name"
        required={true}
      />
      <DynamicInput
        name="Duration"
        type="number"
        value={programTemplateData.Duration}
        placeholder=""
        onChange={(e) => handleChange("Duration", e.target.value)}
        required={true}
      />

      {/* Cost Input */}
      <DynamicInput
        name="Cost"
        type="number"
        value={programTemplateData.PCost}
        placeholder=""
        onChange={(e) => handleChange("PCost", e.target.value)}
      />
      {/* Related Projects List Selector */}
      <ListSelector
        title="Related Projects"
        columnDefs={projectColumnDefs}
        rowData={relatedProjectsData}
        selectedIds={selectedProjectIds}
        onSelectionChange={handleProjectsChange}
        showSwitcher={true}
        isGlobal={programTemplateData.IsGlobal}
        onGlobalChange={handleGlobalChange}
      />

      {/* Type Dynamic Selector */}
      <DynamicSelector
        options={typeOptions}
        selectedValue={programTemplateData.ProgramTypeID}
        onChange={handleProgramTypeChange}
        label="Type"
        showButton={true}
        onButtonClick={handleOpenModal} // باز کردن مدال هنگام کلیک دکمه
        // می‌توانید آیکون‌ها را در صورت نیاز اضافه کنید
        // leftIcon={<YourLeftIcon />}
        // rightIcon={<YourRightIcon />}
        // error={false}
        // errorMessage="Error message"
        className="-mt-24" // اضافه کردن فاصله بالا برای جدا کردن از سایر المان‌ها
      />

      {/* مدال داینامیک برای انتخاب دسته‌بندی */}
      <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
        <TableSelector
          columnDefs={[
            { headerName: "نام", field: "label" },
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
  );
};

export default ApprovalFlow;
