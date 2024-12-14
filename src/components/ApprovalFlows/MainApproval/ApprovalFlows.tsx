// src/components/General/ApprovalFlow.tsx
import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../../layout/TwoColumnLayout";
import DynamicInput from "../../utilities/DynamicInput";
import CustomTextarea from "../../utilities/DynamicTextArea";
import ListSelector from "../../ListSelector/ListSelector";
import TableSelector from "../../General/Configuration/TableSelector";
import DataTable from "../../TableDynamic/DataTable";
import AddSubApprovalFlowModal from "../AddApprovalDialog/AddSubApprovalFlowModal";
import { FiEdit, FiTrash2, FiCopy, FiPlus } from "react-icons/fi";

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

const ApprovalFlow: React.FC<ApprovalFlowProps> = ({ selectedRow }) => {
  const [approvalFlowData, setApprovalFlowData] = useState<{
    ID: string | number;
    Name: string;
    Description: string;
    ProjectsStr: string;
    IsGlobal: boolean;
    SubApprovalFlows: any[];
  }>({
    ID: "",
    Name: "",
    Description: "",
    ProjectsStr: "",
    IsGlobal: false,
    SubApprovalFlows: [],
  });

  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [selectedSubRowData, setSelectedSubRowData] = useState<any>(null);

  // حالت برای مدیریت باز شدن مودال
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (selectedRow) {
      setApprovalFlowData({
        ID: selectedRow.ID || "",
        Name: selectedRow.Name || "",
        Description: selectedRow.Description || "",
        ProjectsStr: selectedRow.ProjectsStr || "",
        IsGlobal: selectedRow.IsGlobal || false,
        SubApprovalFlows: selectedRow.SubApprovalFlows || [],
      });
    } else {
      setApprovalFlowData({
        ID: "",
        Name: "",
        Description: "",
        ProjectsStr: "",
        IsGlobal: false,
        SubApprovalFlows: [],
      });
    }
  }, [selectedRow]);

  const handleChange = (
    field: keyof typeof approvalFlowData,
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

  const associatedProjects = getAssociatedProjects(
    approvalFlowData.ProjectsStr,
    relatedProjectsData
  );
  const selectedProjectIds = associatedProjects.map((p) => p.ID);

  // مدیریت انتخاب سطر در مودال ListSelector
  const handleRowClick = (row: any) => {
    setSelectedRowData(row);
  };

  const handleSelectButtonClick = () => {
    if (selectedRowData) {
      const currentSelectedIds = selectedProjectIds.map((id) => id.toString());
      if (!currentSelectedIds.includes(selectedRowData.ID)) {
        const newSelection = [...currentSelectedIds, selectedRowData.ID];
        handleProjectsChange(newSelection);
      }
      setSelectedRowData(null);
    }
  };

  const handleRowDoubleClick = () => {
    handleSelectButtonClick();
  };

  // مدیریت ساب‌رُدی‌ها
  const handleSubApprovalFlowEdit = (subFlow: any) => {
    console.log("Edit SubApprovalFlow:", subFlow);
    // در اینجا می‌توانید یک مودال باز کنید برای ویرایش یا منطق دیگری را پیاده کنید
  };

  const handleSubApprovalFlowDelete = (subFlow: any) => {
    const updatedSubFlows = approvalFlowData.SubApprovalFlows.filter(
      (flow) => flow.ID !== subFlow.ID
    );
    setApprovalFlowData((prev) => ({
      ...prev,
      SubApprovalFlows: updatedSubFlows,
    }));
  };

  const handleSubApprovalFlowDuplicate = (subFlow: any) => {
    const newSubFlow = { ...subFlow, ID: `sub${Date.now()}` };
    setApprovalFlowData((prev) => ({
      ...prev,
      SubApprovalFlows: [...prev.SubApprovalFlows, newSubFlow],
    }));
  };

  const handleSubApprovalFlowAdd = () => {
    setIsModalOpen(true); // باز کردن مودال به جای افزودن مستقیم
  };

  // ستون‌های ساب‌رُدی‌ها
  const subApprovalFlowColumnDefs = [
    {
      headerName: "Name",
      field: "Name",
      filter: "agTextColumnFilter",
      sortable: true,
    },
    {
      headerName: "Description",
      field: "Description",
      filter: "agTextColumnFilter",
      sortable: true,
    },
    {
      headerName: "Duration",
      field: "MaxDuration",
      filter: "agNumberColumnFilter",
      sortable: true,
    },
    {
      headerName: "Budget",
      field: "PCost",
      filter: "agNumberColumnFilter",
      sortable: true,
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRendererFramework: (params: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleSubApprovalFlowEdit(params.data)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <FiEdit />
          </button>
          <button
            onClick={() => handleSubApprovalFlowDelete(params.data)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <FiTrash2 />
          </button>
          <button
            onClick={() => handleSubApprovalFlowDuplicate(params.data)}
            className="text-yellow-600 hover:text-yellow-800"
            title="Duplicate"
          >
            <FiCopy />
          </button>
        </div>
      ),
    },
  ];

  const handleSubRowDoubleClick = (data: any) => {
    handleSubApprovalFlowEdit(data);
  };

  return (
    <>
      <TwoColumnLayout>
        {/* Approval Flow Name Input */}
        <TwoColumnLayout.Item span={2}>
          <DynamicInput
            name="Approval Flow Name"
            type="text"
            value={approvalFlowData.Name}
            placeholder=""
            onChange={(e) => handleChange("Name", e.target.value)}
            required={true}
          />
        </TwoColumnLayout.Item>

        {/* Description Textarea */}
        <TwoColumnLayout.Item span={2}>
          <CustomTextarea
            id="Description"
            name="Description"
            value={approvalFlowData.Description}
            placeholder=""
            onChange={(e) => handleChange("Description", e.target.value)}
          />
        </TwoColumnLayout.Item>

        {/* Related Projects List Selector */}
        <TwoColumnLayout.Item span={2}>
          <ListSelector
            title="Related Projects"
            columnDefs={projectColumnDefs}
            rowData={relatedProjectsData}
            selectedIds={selectedProjectIds}
            onSelectionChange={handleProjectsChange}
            showSwitcher={true}
            isGlobal={approvalFlowData.IsGlobal}
            onGlobalChange={handleGlobalChange}
            ModalContentComponent={TableSelector}
            modalContentProps={{
              columnDefs: projectColumnDefs,
              rowData: relatedProjectsData,
              selectedRow: selectedRowData,
              onRowDoubleClick: handleRowDoubleClick,
              onRowClick: handleRowClick,
              onSelectButtonClick: handleSelectButtonClick,
              isSelectDisabled: !selectedRowData,
            }}
          />
        </TwoColumnLayout.Item>

        {/* جدول ساب Approval Flows */}
        <TwoColumnLayout.Item span={2}>
          <DataTable
            columnDefs={subApprovalFlowColumnDefs}
            rowData={approvalFlowData.SubApprovalFlows}
            onRowDoubleClick={handleSubRowDoubleClick}
            setSelectedRowData={setSelectedSubRowData}
            onAdd={handleSubApprovalFlowAdd}
            onEdit={() => {
              if (selectedSubRowData)
                handleSubApprovalFlowEdit(selectedSubRowData);
            }}
            onDelete={() => {
              if (selectedSubRowData)
                handleSubApprovalFlowDelete(selectedSubRowData);
            }}
            onDuplicate={() => {
              if (selectedSubRowData)
                handleSubApprovalFlowDuplicate(selectedSubRowData);
            }}
            showDuplicateIcon={true}
            showEditIcon={true}
            showAddIcon={true} // دکمه افزودن در بالا حذف شده است
            showDeleteIcon={true}
            isRowSelected={!!selectedSubRowData}
            domLayout="autoHeight"
          />
        </TwoColumnLayout.Item>
      </TwoColumnLayout>

      {/* مودال افزودن ساب Approval Flow */}
      <AddSubApprovalFlowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ApprovalFlow;
