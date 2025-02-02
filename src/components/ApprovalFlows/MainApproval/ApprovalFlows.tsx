// ApprovalFlow.tsx

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
import {
  WfTemplateItem,
  Project,
  BoxTemplate,
} from "../../../services/api.services";

export interface ApprovalFlowHandle {
  save: () => Promise<boolean>;
}

interface ApprovalFlowProps {
  selectedRow: any;
}

// اگر می‌خواهید ساختار ApprovalFlowData را داشته باشید
interface ApprovalFlowData extends WfTemplateItem {
  SubApprovalFlows: any[];
}

interface MappedProject {
  ID: string | number;
  Name: string;
}

const ApprovalFlow = forwardRef<ApprovalFlowHandle, ApprovalFlowProps>(
  ({ selectedRow }, ref) => {
    const api = useApi();
    const { handleSaveApprovalFlow } = useAddEditDelete();

    const [approvalFlowData, setApprovalFlowData] = useState<ApprovalFlowData>({
      ID: 0,
      Name: "",
      Describtion: "",
      IsGlobal: false,
      IsVisible: true,
      MaxDuration: 0,
      PCost: 0,
      ProjectsStr: "",
      SubApprovalFlows: [],
    });

    // پروژه‌ها برای ListSelector
    const [projects, setProjects] = useState<Project[]>([]);

    // باکس‌های مربوط به این WfTemplate
    const [boxTemplates, setBoxTemplates] = useState<BoxTemplate[]>([]);

    // کنترل انتخاب یک باکس برای Edit / Delete
    const [selectedSubRowData, setSelectedSubRowData] =
      useState<BoxTemplate | null>(null);

    // باز/بسته بودن مودال
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // برای انتخاب پروژه در TableSelector
    const [selectedRowData, setSelectedRowData] = useState<any>(null);

    useEffect(() => {
      const fetchProjects = async () => {
        try {
          const projectsData = await api.getAllProject();
          setProjects(projectsData);
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      };
      fetchProjects();
    }, [api]);

    // هروقت selectedRow عوض شد (انتخاب ApprovalFlow جدید یا Add)، مقداردهی می‌کنیم
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

        if (selectedRow.ID) {
          // گرفتن باکس‌های مربوط به این الگوی کاری
          api
            .getAllBoxTemplatesByWfTemplateId(selectedRow.ID)
            .then((data) => {
              setBoxTemplates(data);
            })
            .catch((err) => {
              console.error("Error fetching BoxTemplates:", err);
              setBoxTemplates([]);
            });
        } else {
          setBoxTemplates([]);
        }
      } else {
        // حالت Add
        setApprovalFlowData({
          ID: 0,
          Name: "",
          Describtion: "",
          IsGlobal: false,
          IsVisible: true,
          MaxDuration: 0,
          PCost: 0,
          ProjectsStr: "",
          SubApprovalFlows: [],
        });
        setBoxTemplates([]);
      }
    }, [selectedRow, api]);

    // متد save که توسط والد فراخوانی می‌شود
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

    // برای ListSelector پروژه‌ها
    const mappedProjects: MappedProject[] = projects.map((project) => ({
      ID: project.ID,
      Name: project.ProjectName,
    }));

    const projectColumnDefs = [
      {
        field: "Name",
        headerName: "Project Name",
        filter: "agTextColumnFilter",
      },
    ];

    const handleProjectsChange = (selectedIds: (string | number)[]) => {
      const newProjectsStr =
        selectedIds.length > 0 ? selectedIds.join("|") + "|" : "";
      handleChange("ProjectsStr", newProjectsStr);
    };

    const handleGlobalChange = (isGlobal: boolean) => {
      handleChange("IsGlobal", isGlobal);
    };

    const getSelectedProjectIds = () => {
      if (!approvalFlowData.ProjectsStr) return [];
      return approvalFlowData.ProjectsStr.split("|").filter((id) => id);
    };

    const selectedProjectIds = getSelectedProjectIds();

    // TableSelector پروژ‌ه‌ها
    const handleRowClick = (row: any) => {
      setSelectedRowData(row);
    };
    const handleSelectButtonClick = () => {
      if (selectedRowData) {
        const currentSelectedIds = getSelectedProjectIds();
        if (!currentSelectedIds.includes(selectedRowData.ID.toString())) {
          const newSelection = [
            ...currentSelectedIds,
            selectedRowData.ID.toString(),
          ];
          handleProjectsChange(newSelection);
        }
        setSelectedRowData(null);
      }
    };
    const handleRowDoubleClick = () => {
      handleSelectButtonClick();
    };
    const modalContentProps = {
      columnDefs: projectColumnDefs,
      rowData: mappedProjects,
      selectedRow: selectedRowData,
      onRowDoubleClick: handleRowDoubleClick,
      onRowClick: handleRowClick,
      onSelectButtonClick: handleSelectButtonClick,
      isSelectDisabled: !selectedRowData,
    };

    // ستون‌های جدول boxTemplates
    const boxTemplateColumnDefs = [
      {
        headerName: "Name",
        field: "Name",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Predecessor",
        field: "PredecessorStr",
        filter: "agTextColumnFilter",
        sortable: true,
        flex: 1,
        valueGetter: (params: any) => {
          // اگر رشته‌ی پیش‌نیاز خالی است، مقداری برنگرداند
          if (!params.data?.PredecessorStr) return "";

          const predecessorIds =
            params.data.PredecessorStr.split("|").filter(Boolean);

          return predecessorIds
            .map((id: string) => {
              const found = boxTemplates.find(
                (box) => box.ID.toString() === id
              );
              return found ? found.Name : id;
            })
            .join("- ");
        },
      },

      {
        headerName: "MaxDuration",
        field: "MaxDuration",
        filter: "agNumberColumnFilter",
        sortable: true,
      },
      {
        headerName: "Actions",
        field: "actions",
        cellRendererFramework: (params: any) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleBoxTemplateEdit(params.data)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              <FiEdit />
            </button>
            <button
              onClick={() => handleBoxTemplateDelete(params.data)}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
              <FiTrash2 />
            </button>
            <button
              onClick={() => handleBoxTemplateDuplicate(params.data)}
              className="text-yellow-600 hover:text-yellow-800"
              title="Duplicate"
            >
              <FiCopy />
            </button>
          </div>
        ),
      },
    ];

    const handleBoxTemplateEdit = (box: BoxTemplate) => {
      setSelectedSubRowData(box);
      setIsModalOpen(true);
    };

    const handleBoxTemplateDelete = (box: BoxTemplate) => {
      // منطق حذف
      console.log("Delete BoxTemplate:", box);
    };

    const handleBoxTemplateDuplicate = (box: BoxTemplate) => {
      // منطق Duplicate
      console.log("Duplicate BoxTemplate:", box);
    };

    const handleSubRowDoubleClick = (data: any) => {
      handleBoxTemplateEdit(data);
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
              placeholder=""
              onChange={(e) =>
                handleChange("MaxDuration", parseInt(e.target.value) || 0)
              }
            />
          </TwoColumnLayout.Item>

          <TwoColumnLayout.Item span={1}>
            <DynamicInput
              name="Project Cost"
              type="number"
              value={approvalFlowData.PCost.toString()}
              placeholder=""
              onChange={(e) =>
                handleChange("PCost", parseInt(e.target.value) || 0)
              }
            />
          </TwoColumnLayout.Item>

          <TwoColumnLayout.Item span={2} className="mt-10">
            <ListSelector
              title="Related Projects"
              columnDefs={projectColumnDefs}
              rowData={mappedProjects}
              selectedIds={selectedProjectIds}
              onSelectionChange={handleProjectsChange}
              showSwitcher={true}
              isGlobal={approvalFlowData.IsGlobal}
              onGlobalChange={handleGlobalChange}
              ModalContentComponent={TableSelector}
              modalContentProps={modalContentProps}
              className="-mt-8"
            />
          </TwoColumnLayout.Item>

          {selectedRow && (
            <TwoColumnLayout.Item span={2}>
              <DataTable
                columnDefs={boxTemplateColumnDefs}
                rowData={boxTemplates}
                onRowDoubleClick={handleSubRowDoubleClick}
                setSelectedRowData={setSelectedSubRowData}
                onAdd={() => {
                  // Add new BoxTemplate
                  setSelectedSubRowData(null);
                  setIsModalOpen(true);
                }}
                onEdit={() => {
                  if (selectedSubRowData) {
                    handleBoxTemplateEdit(selectedSubRowData);
                  }
                }}
                onDelete={() => {
                  if (selectedSubRowData) {
                    handleBoxTemplateDelete(selectedSubRowData);
                  }
                }}
                onDuplicate={() => {
                  if (selectedSubRowData) {
                    handleBoxTemplateDuplicate(selectedSubRowData);
                  }
                }}
                showDuplicateIcon={true}
                showEditIcon={true}
                showAddIcon={true}
                showDeleteIcon={true}
                domLayout="autoHeight"
              />
            </TwoColumnLayout.Item>
          )}
        </TwoColumnLayout>

        <AddSubApprovalFlowModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editData={selectedSubRowData}
          boxTemplates={boxTemplates}
        />
      </>
    );
  }
);

ApprovalFlow.displayName = "ApprovalFlow";

export default ApprovalFlow;
