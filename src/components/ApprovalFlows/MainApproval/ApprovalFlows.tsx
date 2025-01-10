import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import TwoColumnLayout from "../../layout/TwoColumnLayout";
import DynamicInput from "../../utilities/DynamicInput";
import CustomTextarea from "../../utilities/DynamicTextArea";
import ListSelector from "../../ListSelector/ListSelector";
import TableSelector from "../../General/Configuration/TableSelector";
import DataTable from "../../TableDynamic/DataTable";
import AddSubApprovalFlowModal from "../AddApprovalDialog/AddSubApprovalFlowModal";
import { FiEdit, FiTrash2, FiCopy } from "react-icons/fi";
import { useApi } from "../../../context/ApiContext";
import { useAddEditDelete } from "../../../context/AddEditDeleteContext";
import { WfTemplateItem } from "../../../services/api.services";

export interface ApprovalFlowHandle {
  save: () => Promise<boolean>;
}

interface ApprovalFlowProps {
  selectedRow: any;
}

interface ApprovalFlowData extends WfTemplateItem {
  SubApprovalFlows: any[];
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

const ApprovalFlow = forwardRef<ApprovalFlowHandle, ApprovalFlowProps>(
  ({ selectedRow }, ref) => {
    const { handleSaveApprovalFlow } = useAddEditDelete();
    const [approvalFlowData, setApprovalFlowData] = useState<ApprovalFlowData>({
      Name: "",
      Describtion: "",
      IsGlobal: false,
      IsVisible: true,
      MaxDuration: 0,
      PCost: 0,
      ProjectsStr: "",
      SubApprovalFlows: [],
    });

    const [selectedRowData, setSelectedRowData] = useState<any>(null);
    const [selectedSubRowData, setSelectedSubRowData] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
      if (selectedRow) {
        setApprovalFlowData({
          ID: selectedRow.ID,
          Name: selectedRow.Name || "",
          Describtion: selectedRow.Describtion || "",
          IsGlobal: selectedRow.IsGlobal || false,
          IsVisible: selectedRow.IsVisible || true,
          MaxDuration: selectedRow.MaxDuration || 0,
          PCost: selectedRow.PCost || 0,
          ProjectsStr: selectedRow.ProjectsStr || "",
          LastModified: selectedRow.LastModified,
          ModifiedById: selectedRow.ModifiedById,
          SubApprovalFlows: selectedRow.SubApprovalFlows || [],
        });
      } else {
        setApprovalFlowData({
          Name: "",
          Describtion: "",
          IsGlobal: false,
          IsVisible: true,
          MaxDuration: 0,
          PCost: 0,
          ProjectsStr: "",
          SubApprovalFlows: [],
        });
      }
    }, [selectedRow]);

    useImperativeHandle(ref, () => ({
      save: async () => {
        try {
          const result = await handleSaveApprovalFlow(approvalFlowData);
          return result !== null;
        } catch (error) {
          console.error("Error saving approval flow:", error);
          return false;
        }
      },
    }));

    const handleChange = (
      field: keyof ApprovalFlowData,
      value: string | boolean | number
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

    const handleRowClick = (row: any) => {
      setSelectedRowData(row);
    };

    const handleSelectButtonClick = () => {
      if (selectedRowData) {
        const currentSelectedIds = selectedProjectIds.map((id) =>
          id.toString()
        );
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

    const handleSubApprovalFlowEdit = (subFlow: any) => {
      console.log("Edit SubApprovalFlow:", subFlow);
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
      setIsModalOpen(true);
    };

    const subApprovalFlowColumnDefs = [
      {
        headerName: "Name",
        field: "Name",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Description",
        field: "Describtion",
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
          <TwoColumnLayout.Item span={1}>
            <DynamicInput
              name="Approval Flow Name"
              type="text"
              value={approvalFlowData.Name}
              placeholder=""
              onChange={(e) => handleChange("Name", e.target.value)}
              required={true}
            />
          </TwoColumnLayout.Item>

          <TwoColumnLayout.Item span={1}>
            <CustomTextarea
              name="Description"
              value={approvalFlowData.Describtion}
              placeholder=""
              onChange={(e) => handleChange("Describtion", e.target.value)}
            />
          </TwoColumnLayout.Item>

          <TwoColumnLayout.Item span={1}>
            <DynamicInput
              name="Max Duration (Days)"
              type="number"
              value={approvalFlowData.MaxDuration.toString()}
              placeholder="Enter max duration"
              onChange={(e) =>
                handleChange("MaxDuration", parseInt(e.target.value) || 0)
              }
              required={true}
            />
          </TwoColumnLayout.Item>

          <TwoColumnLayout.Item span={1}>
            <DynamicInput
              name="Project Cost"
              type="number"
              value={approvalFlowData.PCost.toString()}
              placeholder="Enter project cost"
              onChange={(e) =>
                handleChange("PCost", parseInt(e.target.value) || 0)
              }
              required={true}
            />
          </TwoColumnLayout.Item>

          <TwoColumnLayout.Item span={2} className="mt-10">
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
              className="-mt-8"
            />
          </TwoColumnLayout.Item>

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
              showAddIcon={true}
              showDeleteIcon={true}
              domLayout="autoHeight"
            />
          </TwoColumnLayout.Item>
        </TwoColumnLayout>

        <AddSubApprovalFlowModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }
);

ApprovalFlow.displayName = "ApprovalFlow";

export default ApprovalFlow;
