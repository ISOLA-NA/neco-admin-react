// src/components/General/ApprovalCheCkList.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import ListSelector from "../ListSelector/ListSelector";
import DynamicModal from "../utilities/DynamicModal";
import TableSelector from "../General/Configuration/TableSelector"; // مسیر صحیح را تنظیم کنید

interface ApprovalCheCkListProps {
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
  // پروژه‌های بیشتر در صورت نیاز...
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

const ApprovalCheCkList: React.FC<ApprovalCheCkListProps> = ({
  selectedRow,
}) => {
  const [approvalCheCkListData, setApprovalCheCkListData] = useState<{
    ID: string | number;
    Name: string;
    Description: string;
    ProjectsStr: string;
    IsGlobal: boolean;
  }>({
    ID: "",
    Name: "",
    Description: "",
    ProjectsStr: "",
    IsGlobal: false,
  });

  // وضعیت‌های مودال
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<"Projects" | null>(
    null
  );
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  useEffect(() => {
    if (selectedRow) {
      setApprovalCheCkListData({
        ID: selectedRow.ID || "",
        Name: selectedRow.Name || "",
        Description: selectedRow.Description || "",
        ProjectsStr: selectedRow.ProjectsStr || "",
        IsGlobal: selectedRow.IsGlobal || false,
      });
    } else {
      setApprovalCheCkListData({
        ID: "",
        Name: "",
        Description: "",
        ProjectsStr: "",
        IsGlobal: false,
      });
    }
  }, [selectedRow]);

  const handleChange = (
    field: keyof typeof approvalCheCkListData,
    value: string | boolean | (string | number)[]
  ) => {
    setApprovalCheCkListData((prev) => ({
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

  const associatedProjects = getAssociatedProjects(
    approvalCheCkListData.ProjectsStr,
    relatedProjectsData
  );
  const selectedProjectIds = associatedProjects.map((p) => p.ID);

  // مدیریت انتخاب سطر در مودال ListSelector
  const handleRowClick = (row: any) => {
    setSelectedRowData(row);
  };

  const handleSelectButtonClick = () => {
    if (selectedRowData) {
      // افزودن پروژه انتخابی به لیست
      const currentSelectedIds = selectedProjectIds.map((id) => id.toString());
      // جلوگیری از اضافه شدن تکراری
      if (!currentSelectedIds.includes(selectedRowData.ID)) {
        const newSelection = [...currentSelectedIds, selectedRowData.ID];
        handleProjectsChange(newSelection);
      }
      setSelectedRowData(null);
      handleCloseModal();
    }
  };

  const handleRowDoubleClick = () => {
    handleSelectButtonClick();
  };


  // مدیریت بستن مودال
  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentSelector(null);
    setSelectedRowData(null);
  };

  return (
    <div>
      <TwoColumnLayout>
        {/* Approval Flow Name Input */}
        <DynamicInput
          name="Approval Flow Name"
          type="text"
          value={approvalCheCkListData.Name}
          placeholder=""
          onChange={(e) => handleChange("Name", e.target.value)}
          required={true}
        />

        {/* Description Textarea */}
        <CustomTextarea
          id="Description"
          name="Description"
          value={approvalCheCkListData.Description}
          placeholder=""
          onChange={(e) => handleChange("Description", e.target.value)}
        />

        {/* Related Projects List Selector */}
        <ListSelector
          title="Related Projects"
          columnDefs={projectColumnDefs}
          rowData={relatedProjectsData}
          selectedIds={selectedProjectIds}
          onSelectionChange={handleProjectsChange}
          showSwitcher={true}
          isGlobal={approvalCheCkListData.IsGlobal}
          onGlobalChange={handleGlobalChange}
          // اضافه کردن رفتار مشابه Configuration
          ModalContentComponent={TableSelector}
          modalContentProps={{
            columnDefs: projectColumnDefs,
            rowData: relatedProjectsData,
            selectedRow: selectedRowData,
            onRowDoubleClick: handleRowDoubleClick,
            onRowClick: handleRowClick,
            onSelectButtonClick: handleSelectButtonClick,
            isSelectDisabled: !selectedRowData,
            onClose: handleCloseModal, // اضافه شده
            onSelectFromButton: handleSelectButtonClick, // اضافه شده
          }}
        />
      </TwoColumnLayout>

      {/* مودال داینامیک برای انتخاب پروژه‌ها */}
      <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
        {currentSelector === "Projects" && (
          <TableSelector
            columnDefs={projectColumnDefs}
            rowData={relatedProjectsData}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleRowDoubleClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        )}
      </DynamicModal>
    </div>
  );
};

export default ApprovalCheCkList;
