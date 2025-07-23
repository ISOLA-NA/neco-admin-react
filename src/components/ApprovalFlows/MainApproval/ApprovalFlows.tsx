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
import { useApi } from "../../../context/ApiContext";
import { useAddEditDelete } from "../../../context/AddEditDeleteContext";
import {
  WfTemplateItem,
  Project,
  BoxTemplate,
} from "../../../services/api.services";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import DynamicConfirm from "../../utilities/DynamicConfirm";

export interface ApprovalFlowHandle {
  save: () => Promise<boolean>;
  checkNameFilled: () => boolean;
}

interface ApprovalFlowProps {
  selectedRow: WfTemplateItem | null;
}

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
      IsGlobal: true,
      IsVisible: true,
      MaxDuration: 0,
      PCost: 0,
      ProjectsStr: "",
      SubApprovalFlows: [],
    });

    const [projects, setProjects] = useState<Project[]>([]);
    const [boxTemplates, setBoxTemplates] = useState<BoxTemplate[]>([]);
    const [selectedSubRowData, setSelectedSubRowData] =
      useState<BoxTemplate | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedRowData, setSelectedRowData] = useState<any>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isLoadingBoxTemplates, setIsLoadingBoxTemplates] = useState<boolean>(false);


    // id ساب‌آیتمی که قصد حذفش رو داریم
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    // دریافت پروژه‌ها
    useEffect(() => {
      const fetchProjects = async () => {
        try {
          const projectsData = await api.getAllProject();
          setProjects(projectsData);
        } catch (error) {
          console.error("Error fetching projects:", error);
          showAlert(
            "error",
            null,
            "Error",
            "An error occurred while fetching projects"
          );
        }
      };
      fetchProjects();
    }, [api]);

    useEffect(() => {
      if (selectedRow) {
        // مقداردهی اولیه داده‌های فرم
        setApprovalFlowData({
          ID: selectedRow.ID,
          Name: selectedRow.Name || "",
          Describtion: selectedRow.Describtion || "",
          IsGlobal:
            typeof selectedRow.IsGlobal === "boolean"
              ? selectedRow.IsGlobal
              : true,

          IsVisible: selectedRow.IsVisible || true,
          MaxDuration: selectedRow.MaxDuration || 0,
          PCost: selectedRow.PCost || 0,
          ProjectsStr: selectedRow.ProjectsStr || "",
          SubApprovalFlows: selectedRow.SubApprovalFlows || [],
        });

        if (selectedRow.ID) {
          // قبل از فراخوانی API، لودینگ را فعال کن
          setIsLoadingBoxTemplates(true);

          // دریافت لیست BoxTemplateها
          api
            .getAllBoxTemplatesByWfTemplateId(selectedRow.ID)
            .then((data) => {
              setBoxTemplates(data);
            })
            .catch((err) => {
              console.error("Error fetching BoxTemplates:", err);
              showAlert(
                "error",
                null,
                "Error",
                "An error occurred while fetching BoxTemplates"
              );
              setBoxTemplates([]);
            })
            .finally(() => {
              // در هر صورت (موفق یا خطا)، لودینگ را غیرفعال کن
              setIsLoadingBoxTemplates(false);
            });
        } else {
          // اگر ID نداشتیم، آرایه را خالی کن
          setBoxTemplates([]);
        }
      } else {
        // حالت جدید یا عدم انتخاب ردیف: بازنشانی فرم و جدول
        setApprovalFlowData({
          ID: 0,
          Name: "",
          Describtion: "",
          IsGlobal: true,
          IsVisible: true,
          MaxDuration: 0,
          PCost: 0,
          ProjectsStr: "",
          SubApprovalFlows: [],
        });
        setBoxTemplates([]);
      }
    }, [selectedRow, api]);


    // صادر کردن متدها از طریق ref
    useImperativeHandle(ref, () => ({
      checkNameFilled: () => {
        return approvalFlowData.Name.trim().length > 0;
      },
      save: async () => {
        // اعتبارسنجی از طریق checkNameFilled
        if (!ref.current?.checkNameFilled()) {
          showAlert("warning", null, "Warning", "Name cannot be empty");
          return false;
        }
        try {
          const result = await handleSaveApprovalFlow(approvalFlowData);
          // if (result) {
          //   showAlert("success", null, "Success", "Edited Successfully");
          // }
          return result !== null;
        } catch (error) {
          console.error("Error saving approval flow:", error);
          showAlert(
            "error",
            null,
            "Error",
            "An error occurred while editing the item"
          );
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
          showAlert("success", null, "Success", "Added Successfully");
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

    /* ───────── ستون‌های BoxTemplate با flex/minWidth ───────── */
    const boxTemplateColumnDefs = [
      {
        headerName: "Name",
        field: "Name",
        filter: "agTextColumnFilter",
        sortable: true,
        flex: 1.2,
        minWidth: 160,
      },
      {
        headerName: "Predecessor",
        field: "PredecessorStr",
        filter: "agTextColumnFilter",
        sortable: true,
        flex: 2,
        minWidth: 220,
        valueGetter: (params: any) => {
          if (!params.data?.PredecessorStr) return "";
          return params.data.PredecessorStr.split("|")
            .filter(Boolean)
            .map((id: string) => {
              const found = boxTemplates.find((b) => b.ID.toString() === id);
              return found ? found.Name : id;
            })
            .join(" - ");
        },
      },
    ];

    const handleBoxTemplateEdit = (box: BoxTemplate) => {
      setSelectedSubRowData(box);
      setIsModalOpen(true);
      // showAlert("info", null, "Info", "Edited Successfully");
    };

    const handleBoxTemplateDelete = async (id: number) => {
      try {
        await api.deleteBoxTemplate(id);
        // ۱. بارگذاری مجدد لیست
        await handleBoxTemplatesChanged();
        // ۲. حالا پیام موفقیت
        showAlert("success", null, "موفقیت", "زیرجریان با موفقیت حذف شد");
      } catch (err) {
        console.error("Error deleting BoxTemplate:", err);
        showAlert("error", null, "خطا", "حذف با شکست مواجه شد");
      }
    };

    const handleBoxTemplateDuplicate = (box: BoxTemplate) => {
      console.log("Duplicate BoxTemplate:", box);
      // فراخوانی متد duplicate در صورت وجود
      showAlert("info", null, "Info", "Added Successfully");
    };

    const handleSubRowDoubleClick = (data: any) => {
      handleBoxTemplateEdit(data);
    };

    // بارگذاری مجدد لیست BoxTemplates پس از درج/ویرایش
    const handleBoxTemplatesChanged = async () => {
      if (!approvalFlowData.ID) return;
      try {
        const newList = await api.getAllBoxTemplatesByWfTemplateId(
          approvalFlowData.ID
        );
        setBoxTemplates(newList);
        // showAlert("success", null, "Success", "Edited Successfully");
      } catch (error) {
        console.error("Error reloading boxTemplates:", error);
        showAlert(
          "error",
          null,
          "Error",
          "An error occurred while editing the item"
        );
      }
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
    

          <TwoColumnLayout.Item span={1} className="mt-10">
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

          {/* ───────── TwoColumnLayout.Item: BoxTemplate DataTable ───────── */}
          <TwoColumnLayout.Item span={2}>
            {selectedRow && (
              <div className="overflow-x-auto pb-2">
                <div className="h-[300px] min-w-full relative">
                  <DataTable
                    columnDefs={boxTemplateColumnDefs}
                    rowData={boxTemplates}
                    onRowDoubleClick={handleSubRowDoubleClick}
                    setSelectedRowData={setSelectedSubRowData}
                    showAddIcon
                    showEditIcon
                    showDeleteIcon
                    showDuplicateIcon={false}
                    onAdd={() => {
                      setSelectedSubRowData(null);
                      setIsModalOpen(true);
                    }}
                    onEdit={() =>
                      selectedSubRowData && handleBoxTemplateEdit(selectedSubRowData)
                    }
                    onDelete={() => {
                      if (selectedSubRowData) {
                        setPendingDeleteId(selectedSubRowData.ID);
                        setIsDeleteConfirmOpen(true);
                      }
                    }}
                    onDuplicate={() =>
                      selectedSubRowData && handleBoxTemplateDuplicate(selectedSubRowData)
                    }
                    domLayout="normal"
                    gridOptions={{
                      rowSelection: "single",
                      onGridReady: (p) => {
                        p.api.sizeColumnsToFit();
                        window.addEventListener("resize", () =>
                          p.api.sizeColumnsToFit()
                        );
                      },
                    }}
                    /** ← این خط رو اضافه کن **/
                    isLoading={isLoadingBoxTemplates}
                  />
                </div>
              </div>
            )}
          </TwoColumnLayout.Item>

        </TwoColumnLayout>

        <DynamicConfirm
          isOpen={isDeleteConfirmOpen}
          variant="delete"
          title="حذف جریان تأیید"
          message="آیا مطمئن هستید که می‌خواهید این جریان تأیید را حذف کنید؟"
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={() => {
            if (pendingDeleteId !== null) {
              handleBoxTemplateDelete(pendingDeleteId);
            }
            setIsDeleteConfirmOpen(false);
            setPendingDeleteId(null);
          }}
        />

        <AddSubApprovalFlowModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editData={selectedSubRowData}
          boxTemplates={boxTemplates}
          workflowTemplateId={selectedRow ? selectedRow.ID : 0}
          onBoxTemplateInserted={handleBoxTemplatesChanged}
        />
      </>
    );
  }
);

ApprovalFlow.displayName = "ApprovalFlow";
export default ApprovalFlow;
