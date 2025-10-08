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
import { useTranslation } from "react-i18next";

export interface ApprovalFlowHandle {
  save: () => Promise<boolean>;
  checkNameFilled: () => boolean;
}

interface ApprovalFlowProps {
  selectedRow: WfTemplateItem | null;
}

interface ApprovalFlowData extends WfTemplateItem {
  PersianName?: string;
  SubApprovalFlows: any[];
}

interface MappedProject {
  ID: string | number;
  Name: string;
}

const ApprovalFlow = forwardRef<ApprovalFlowHandle, ApprovalFlowProps>(
  ({ selectedRow }, ref) => {
    const { t, i18n } = useTranslation();
    const api = useApi();
    const { handleSaveApprovalFlow } = useAddEditDelete();

    const [approvalFlowData, setApprovalFlowData] = useState<ApprovalFlowData>({
      ID: 0,
      Name: "",
      PersianName: "",
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
    const [isLoadingBoxTemplates, setIsLoadingBoxTemplates] =
      useState<boolean>(false);

    // id ساب‌آیتمی که قصد حذفش رو داریم
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const [isFaMode, setIsFaMode] = useState(false); // false=EN(Name), true=FA(PersianName)

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
          PersianName: selectedRow.PersianName ?? "",
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
          PersianName: "",
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
        const nameTrim = (approvalFlowData.Name || "").trim();
        const pNameTrim = (approvalFlowData.PersianName || "").trim();
        if (!nameTrim && pNameTrim) {
          showAlert("warning", null, "Warning", "Please fill Name");
          return false;
        }
        return nameTrim.length > 0;
      },
      save: async () => {
        if (!ref.current?.checkNameFilled()) {
          showAlert("warning", null, "Warning", "Name cannot be empty");
          return false;
        }
        try {
          // ارسال PersianName به صورت string trim‌شده (بدون null)
          const payload: ApprovalFlowData = {
            ...approvalFlowData,
            PersianName: (approvalFlowData.PersianName ?? "").trim(), // ← کلید تغییر
          };
          const result = await handleSaveApprovalFlow(payload);
          return result !== null;
        } catch (error) {
          console.error("Error saving approval flow:", error);
          showAlert("error", null, "Error", "An error occurred while editing the item");
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
          // showAlert("success", null, "Success", "Added Successfully");
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
        headerName: t("AddApprovalFlows.Name", { defaultValue: "Name" }),
        field: "Name",
        filter: "agTextColumnFilter",
        sortable: true,
        flex: 1.2,
        minWidth: 160
      },
      {
        headerName: t("AddApprovalFlows.Predecessor", { defaultValue: "Predecessor" }),
        field: "PredecessorStr",
        filter: "agTextColumnFilter",
        sortable: true,
        flex: 2,
        minWidth: 220,
        valueGetter: (params: any) => {
          const raw = params?.data?.PredecessorStr;
          if (!raw) return "";
          const ids = String(raw)
            .split("|")
            .filter(Boolean);

          // اگر boxTemplates هنوز نیامده باشد
          if (!Array.isArray(boxTemplates) || boxTemplates.length === 0) {
            return ids.join(" - ");
          }

          return ids
            .map((id: string) => {
              const found = boxTemplates.find((b: any) => String(b?.ID) === id);
              return found?.Name ?? id;
            })
            .join(" - ");
        }
      }
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
        // showAlert("success", null, "موفقیت", "زیرجریان با موفقیت حذف شد");
      } catch (err) {
        console.error("Error deleting BoxTemplate:", err);
        showAlert("error", null, "خطا", "حذف با شکست مواجه شد");
      }
    };

    const handleBoxTemplateDuplicate = (box: BoxTemplate) => {
      console.log("Duplicate BoxTemplate:", box);
      // فراخوانی متد duplicate در صورت وجود
      // showAlert("info", null, "Info", "Added Successfully");
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
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <DynamicInput
                  name={isFaMode ? "PersianName" : t("ApprovalFlows.ApprovalFlowName")}
                  type="text"
                  value={isFaMode ? (approvalFlowData.PersianName ?? "") : (approvalFlowData.Name ?? "")}
                  placeholder=""
                  onChange={(e) =>
                    handleChange(isFaMode ? "PersianName" : "Name", e.target.value)
                  }
                  required={!isFaMode}
                />
              </div>

              {/* دکمه EN/FA با استایل گرادیانی */}
              <button
                type="button"
                onClick={() => setIsFaMode((p) => !p)}
                className={[
                  "shrink-0 inline-flex items-center justify-center h-10 px-4 rounded-xl",
                  "bg-gradient-to-r from-fuchsia-500 to-pink-500",
                  "text-white font-semibold tracking-wide",
                  "shadow-md shadow-pink-200/50",
                  "transition-all duration-200",
                  "hover:from-fuchsia-600 hover:to-pink-600 hover:shadow-lg hover:scale-[1.02]",
                  "active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-pink-300",
                ].join(" ")}
                title={isFaMode ? "Switch to EN (Name)" : "Switch to FA (PersianName)"}
              >
                {isFaMode ? "FA" : "EN"}
              </button>
            </div>
          </TwoColumnLayout.Item>


          <TwoColumnLayout.Item span={1}>
            <CustomTextarea
              name={t("ApprovalFlows.Description")}
              value={approvalFlowData.Describtion}
              placeholder=""
              onChange={(e) => handleChange("Describtion", e.target.value)}
            />
          </TwoColumnLayout.Item>

          <TwoColumnLayout.Item span={1} className="mt-10">
            <ListSelector
              title={t("ApprovalFlows.RelatedProjects")}
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
                      selectedSubRowData &&
                      handleBoxTemplateEdit(selectedSubRowData)
                    }
                    onDelete={() => {
                      if (selectedSubRowData) {
                        setPendingDeleteId(selectedSubRowData.ID);
                        setIsDeleteConfirmOpen(true);
                      }
                    }}
                    onDuplicate={() =>
                      selectedSubRowData &&
                      handleBoxTemplateDuplicate(selectedSubRowData)
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
                    direction={i18n.dir()}
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
