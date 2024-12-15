// src/components/General/ProgramTemplate.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../../layout/TwoColumnLayout";
import DynamicInput from "../../utilities/DynamicInput";
import ListSelector from "../../ListSelector/ListSelector";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicModal from "../../utilities/DynamicModal";
import TableSelector from "../../General/Configuration/TableSelector";
import DataTable from "../../TableDynamic/DataTable";
import AddProgramTemplate from "./AddProgramTemplate"; // اطمینان حاصل کنید که مسیر صحیح

interface ApprovalFlowProps {
  selectedRow: any;
}

// داده‌های نمونه برای پروژه‌ها
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
  // می‌توانید پروژه‌های بیشتری اضافه کنید
];

// تابع برای دریافت پروژه‌های مرتبط
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

// گزینه‌های مربوط به نوع برنامه
const typeOptions = [
  { value: "1", label: "Type 1" },
  { value: "2", label: "Type 2" },
  { value: "3", label: "Type 3" },
  { value: "4", label: "Type 4" },
  { value: "5", label: "Type 5" },
];

const ProgramTemplate: React.FC<ApprovalFlowProps> = ({ selectedRow }) => {
  const [programTemplateData, setProgramTemplateData] = useState<{
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
      setProgramTemplateData({
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
      setProgramTemplateData({
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
    value: any
  ) => {
    setProgramTemplateData((prev) => ({
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

  // مدیریت وضعیت مدال برای ProgramType
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<string>("ProgramType");
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  const handleOpenModal = () => {
    setSelectedRowData(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRowData(null);
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

  const getRowData = (selector: string) => {
    if (selector === "ProgramType") {
      return typeOptions.map((option) => ({
        value: option.value,
        label: option.label,
      }));
    }
    return [];
  };

  // مدیریت وضعیت مدال برای انتخاب پروژه‌ها (شبیه FormsCommand)
  const [selectedRowDataForProjects, setSelectedRowDataForProjects] =
    useState<any>(null);

  // مدیریت وضعیت مودال برای افزودن برنامه جدید
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    // در صورت نیاز، می‌توانید داده‌ها را مجدداً بارگذاری کنید
  };

  // تعریف ستون‌ها برای جدول جزئیات
  const detailColumnDefs = [
    { headerName: "ID", field: "ID", sortable: true, filter: true },
    { headerName: "Name", field: "Name", sortable: true, filter: true },
    {
      headerName: "Description",
      field: "Description",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Is Global",
      field: "IsGlobal",
      sortable: true,
      filter: true,
    },
    { headerName: "Duration", field: "Duration", sortable: true, filter: true },
    { headerName: "Cost", field: "PCost", sortable: true, filter: true },
    {
      headerName: "Program Type ID",
      field: "ProgramTypeID",
      sortable: true,
      filter: true,
    },
  ];

  // داده‌های جزئیات مرتبط
  const relatedDetailData = [
    {
      ID: programTemplateData.ID,
      Name: programTemplateData.Name,
      Description: programTemplateData.Description,
      IsGlobal: programTemplateData.IsGlobal,
      Duration: programTemplateData.Duration,
      PCost: programTemplateData.PCost,
      ProgramTypeID: programTemplateData.ProgramTypeID,
    },
    // می‌توانید داده‌های بیشتری اضافه کنید یا منطق مناسبی برای دریافت داده‌های مرتبط اضافه کنید
  ];

  return (
    <TwoColumnLayout>
      {/* فرم اصلی */}
      <TwoColumnLayout.Item>
        <DynamicInput
          name="Program Name"
          type="text"
          value={programTemplateData.Name}
          placeholder=""
          onChange={(e) => handleChange("Name", e.target.value)}
          required={true}
        />
      </TwoColumnLayout.Item>

      <TwoColumnLayout.Item>
        <DynamicInput
          name="Duration"
          type="number"
          value={programTemplateData.Duration}
          placeholder=""
          onChange={(e) => handleChange("Duration", e.target.value)}
          required={true}
        />
      </TwoColumnLayout.Item>

      <TwoColumnLayout.Item>
        <DynamicInput
          name="Cost"
          type="number"
          value={programTemplateData.PCost}
          placeholder=""
          onChange={(e) => handleChange("PCost", e.target.value)}
        />
      </TwoColumnLayout.Item>

      <TwoColumnLayout.Item>
        <ListSelector
          title="Related Projects"
          columnDefs={projectColumnDefs}
          rowData={relatedProjectsData}
          selectedIds={selectedProjectIds}
          onSelectionChange={handleProjectsChange}
          showSwitcher={true}
          isGlobal={programTemplateData.IsGlobal}
          onGlobalChange={handleGlobalChange}
          ModalContentComponent={TableSelector}
          modalContentProps={{
            columnDefs: projectColumnDefs,
            rowData: relatedProjectsData,
            selectedRow: selectedRowDataForProjects,
            onRowDoubleClick: () => {
              if (selectedRowDataForProjects) {
                const newSelection = [
                  ...selectedProjectIds,
                  selectedRowDataForProjects.ID,
                ];
                handleProjectsChange(newSelection);
              }
            },
            onRowClick: (row: any) => setSelectedRowDataForProjects(row),
            onSelectButtonClick: () => {
              if (selectedRowDataForProjects) {
                const newSelection = [
                  ...selectedProjectIds,
                  selectedRowDataForProjects.ID,
                ];
                handleProjectsChange(newSelection);
              }
            },
            isSelectDisabled: !selectedRowDataForProjects,
          }}
        />
      </TwoColumnLayout.Item>

      <TwoColumnLayout.Item>
        <DynamicSelector
          options={typeOptions}
          selectedValue={programTemplateData.ProgramTypeID}
          onChange={handleProgramTypeChange}
          label="Type"
          showButton={true}
          onButtonClick={handleOpenModal}
          className="-mt-24"
        />
      </TwoColumnLayout.Item>

      {/* مدال داینامیک برای انتخاب نوع برنامه شبیه FormsCommand */}
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

      {/* بخش جزئیات با استفاده از DataTable */}
      <TwoColumnLayout.Item span={1} className="md:col-span-2">
        <div className="-mt-12">
          <DataTable
            columnDefs={detailColumnDefs}
            rowData={relatedDetailData}
            onRowDoubleClick={() => {
              /* اعمال دلخواه برای دوبل کلیک */
            }}
            setSelectedRowData={() => {
              /* مدیریت انتخاب ردیف اگر نیاز است */
            }}
            showDuplicateIcon={false}
            showEditIcon={true}
            showAddIcon={true} // فعال کردن دکمه Add
            showDeleteIcon={true}
            onAdd={handleAddClick} // اتصال به تابع باز کردن مودال
            onEdit={() => {}}
            onDelete={() => {}}
            onDuplicate={() => {}}
            domLayout="autoHeight"
            isRowSelected={false} // می‌توانید این را بر اساس نیاز تغییر دهید
            showSearch={true} // جستجو در جزئیات غیر فعال
          />
        </div>
      </TwoColumnLayout.Item>

      {/* مودال داینامیک برای افزودن برنامه جدید */}
      <DynamicModal isOpen={isAddModalOpen} onClose={handleAddModalClose}>
        <AddProgramTemplate />
      </DynamicModal>
    </TwoColumnLayout>
  );
};

export default ProgramTemplate;
