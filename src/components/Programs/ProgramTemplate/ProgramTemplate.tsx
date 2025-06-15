// src/components/ProgramTemplate/ProgramTemplate.tsx

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import TwoColumnLayout from "../../layout/TwoColumnLayout";
import DynamicInput from "../../utilities/DynamicInput";
import ListSelector from "../../ListSelector/ListSelector";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicModal from "../../ApprovalFlows/MainApproval/ModalApprovalFlow";
import TableSelector from "../../General/Configuration/TableSelector";
import DataTable from "../../TableDynamic/DataTable";
import AddProgramTemplate from "./AddProgramTemplate";
import { useApi } from "../../../context/ApiContext";
import type { ProgramTemplateField } from "../../../services/api.services";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import {
  ProgramTemplateItem,
  Project,
  ProgramType,
} from "../../../services/api.services";
import DynamicConfirm from "../../utilities/DynamicConfirm";

export interface ProgramTemplateHandle {
  save: () => Promise<boolean>;
}

interface ProgramTemplateProps {
  selectedRow: ProgramTemplateItem | null;
}

// Program type options به صورت پویا از API دریافت می‌شود
const ProgramTemplate = forwardRef<ProgramTemplateHandle, ProgramTemplateProps>(
  ({ selectedRow }, ref) => {
    console.log("selectedrow", selectedRow);
    const api = useApi();

    // State برای داده‌های برنامه تمپلیت
    const [programTemplateData, setProgramTemplateData] =
      useState<ProgramTemplateItem>({
        ID: selectedRow?.ID || undefined,
        ModifiedById: selectedRow?.ModifiedById || undefined,
        Name: selectedRow?.Name || "",
        MetaColumnName: selectedRow?.MetaColumnName || "",
        Duration: selectedRow?.Duration || "",
        nProgramTypeID: selectedRow?.nProgramTypeID || null,
        PCostAct: selectedRow?.PCostAct || 0,
        PCostAprov: selectedRow?.PCostAprov || 0,
        IsGlobal: selectedRow?.IsGlobal || false,
        ProjectsStr: selectedRow?.ProjectsStr || "",
        IsVisible: selectedRow?.IsVisible ?? true,
        LastModified: selectedRow?.LastModified || undefined,
      });

    // State برای پروژه‌های دریافت شده از API
    const [projectsData, setProjectsData] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState<boolean>(false);

    // State برای انواع برنامه‌ها دریافت شده از API
    const [programTypes, setProgramTypes] = useState<ProgramType[]>([]);
    const [loadingProgramTypes, setLoadingProgramTypes] =
      useState<boolean>(false);

    // انتخاب ID‌های پروژه به صورت رشتffه
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
      selectedRow?.ProjectsStr
        ? selectedRow.ProjectsStr.split("|").filter(Boolean)
        : []
    );

    const [programTemplateField, setProgramTemplateField] = useState<
      ProgramTemplateField[]
    >([]);

    const [roles, setRoles] = useState<{ ID: string; Name: string }[]>([]);
    const [wfTemplates, setWfTemplates] = useState<
      { ID: number; Name: string }[]
    >([]);
    const [activityTypes, setActivityTypes] = useState<
      { value: string; label: string }[]
    >([]);
    const [forms, setForms] = useState<{ ID: string; Name: string }[]>([]);

    const [programTemplates, setProgramTemplates] = useState<
      { ID: number; Name: string }[]
    >([]);

    const [loadingFields, setLoadingFields] = useState<boolean>(false);

    const [editingRow, setEditingRow] = useState<any | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDetailRow, setSelectedDetailRow] = useState<any | null>(
      null
    );

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const isEditMode = Boolean(selectedRow);

    useEffect(() => {
      const fetchTemplates = async () => {
        try {
          const res = await api.getAllProgramTemplates();
          setProgramTemplates(res);
        } catch (error) {
          console.error("خطا در دریافت Program Templates:", error);
        }
      };

      fetchTemplates();
    }, []);

    useEffect(() => {
      const fetchForms = async () => {
        try {
          const result = await api.getTableTransmittal();
          setForms(result);
        } catch (error) {
          console.error("Failed to fetch form names:", error);
        }
      };
      fetchForms();
    }, []);

    useEffect(() => {
      const fetchActivityTypes = async () => {
        try {
          const result = await api.getEnum({ str: "PFIType" });
          const formatted = Object.entries(result).map(([key, value]) => ({
            value: key,
            label: value,
          }));
          setActivityTypes(formatted);
        } catch (error) {
          console.error("خطا در گرفتن activity type:", error);
        }
      };

      fetchActivityTypes();
    }, []);

    useEffect(() => {
      const fetchWfTemplates = async () => {
        try {
          const result = await api.getAllWfTemplate();
          setWfTemplates(result);
        } catch (error) {
          console.error("Failed to fetch approval flows", error);
        }
      };
      fetchWfTemplates();
    }, []);

    useEffect(() => {
      const fetchRoles = async () => {
        try {
          const response = await api.getAllRoles();
          setRoles(response);
        } catch (error) {
          console.error("Failed to fetch roles", error);
        }
      };
      fetchRoles();
    }, []);

    useEffect(() => {
      const fetchEntityFields = async () => {
        if (!selectedRow?.ID) return;

        try {
          setLoadingFields(true);
          const result = await api.getProgramTemplateField(selectedRow.ID);
          console.log("rrrrrr", result);
          setProgramTemplateField(result);
        } catch (error: any) {
          console.error("Failed to fetch entity fields:", error);
          showAlert("error", null, "Error", "Could not load entity fields");
        } finally {
          setLoadingFields(false);
        }
      };

      fetchEntityFields();
    }, [selectedRow?.ID]);

    // انتخاب ID نوع برنامه به صورت رشته
    const [selectedProgramTypeId, setSelectedProgramTypeId] = useState<string>(
      selectedRow?.nProgramTypeID ? String(selectedRow.nProgramTypeID) : ""
    );

    // دریافت پروژه‌ها از API هنگام بارگذاری کامپوننت
    useEffect(() => {
      const fetchProjects = async () => {
        try {
          setLoadingProjects(true);
          const projects = await api.getAllProject();
          setProjectsData(projects);
        } catch (error) {
          console.error("Error fetching projects:", error);
          showAlert("error", null, "Error", "Failed to fetch projects.");
        } finally {
          setLoadingProjects(false);
        }
      };
      fetchProjects();
    }, [api]);

    // دریافت انواع برنامه‌ها از API هنگام بارگذاری کامپوننت
    useEffect(() => {
      const fetchProgramTypes = async () => {
        try {
          setLoadingProgramTypes(true);
          const types = await api.getAllProgramType();
          setProgramTypes(types);
        } catch (error) {
          console.error("Error fetching program types:", error);
          showAlert("error", null, "Error", "Failed to fetch program types.");
        } finally {
          setLoadingProgramTypes(false);
        }
      };
      fetchProgramTypes();
    }, [api]);

    // به‌روزرسانی داده‌های برنامه تمپلیت زمانی که `selectedRow` تغییر می‌کند
    useEffect(() => {
      if (selectedRow) {
        setProgramTemplateData({
          ID: selectedRow.ID,
          ModifiedById: selectedRow.ModifiedById,
          Name: selectedRow.Name,
          MetaColumnName: selectedRow.MetaColumnName || "",
          Duration: selectedRow.Duration,
          nProgramTypeID: selectedRow.nProgramTypeID,
          PCostAct: selectedRow.PCostAct,
          PCostAprov: selectedRow.PCostAprov,
          ProjectsStr: selectedRow.ProjectsStr || "",
          IsGlobal: selectedRow.IsGlobal,
          IsVisible: selectedRow.IsVisible,
          LastModified: selectedRow.LastModified,
        });
        setSelectedProjectIds(
          selectedRow.ProjectsStr
            ? selectedRow.ProjectsStr.split("|").filter(Boolean)
            : []
        );
        setSelectedProgramTypeId(
          selectedRow.nProgramTypeID ? String(selectedRow.nProgramTypeID) : ""
        );
      } else {
        setProgramTemplateData({
          Name: "",
          Duration: "0",
          PCostAct: 0,
          PCostAprov: 0,
          ProjectsStr: "",
          IsGlobal: false,
          IsVisible: true,
          nProgramTypeID: null,
          MetaColumnName: "",
          LastModified: null,
          ModifiedById: null,
          ID: 0,
        });
        setSelectedProjectIds([]);
        setSelectedProgramTypeId("");
      }
    }, [selectedRow]);

    // متد save قابل دسترسی از والدین
    useImperativeHandle(ref, () => ({
      save: async () => {
        try {
          const templateData: ProgramTemplateItem = {
            ...programTemplateData,
            nProgramTypeID: selectedProgramTypeId
              ? parseInt(selectedProgramTypeId)
              : null,
            PCostAct: programTemplateData.PCostAct || 0,
            PCostAprov: programTemplateData.PCostAprov || 0,
            IsVisible: programTemplateData.IsVisible,
            ProjectsStr:
              selectedProjectIds.length > 0
                ? selectedProjectIds.join("|") + "|"
                : "",
            ModifiedById: programTemplateData.ModifiedById,
            LastModified: programTemplateData.LastModified,
            ID: programTemplateData.ID,
          };

          if (selectedRow) {
            // ویرایش
            await api.updateProgramTemplate(templateData);
          } else {
            // درج جدید
            await api.insertProgramTemplate(templateData);
          }

          showAlert(
            "success",
            null,
            selectedRow ? "Updated" : "Saved",
            `Program Template ${
              selectedRow ? "updated" : "added"
            } successfully.`
          );
          return true;
        } catch (error) {
          console.error("Error saving program template:", error);
          showAlert("error", null, "Error", "Failed to save program template.");
          return false;
        }
      },
    }));

    // هندل تغییرات در فیلدهای ورودی
    const handleChange = (field: keyof ProgramTemplateItem, value: any) => {
      setProgramTemplateData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    // تعریف ستون‌ها برای جدول انتخاب پروژه‌ها
    const projectColumnDefs = [{ field: "Name", headerName: "Project Name" }];

    // هندل تغییرات انتخاب پروژه‌ها
    const handleProjectsChange = (selectedIds: (string | number)[]) => {
      const stringIds = selectedIds.map((id) => String(id));
      setSelectedProjectIds(stringIds);
    };

    // هندل تغییر وضعیت Global
    const handleGlobalChange = (isGlobal: boolean) => {
      handleChange("IsGlobal", isGlobal);
    };

    // آماده‌سازی داده‌ها برای ListSelector
    const projectsListData = projectsData.map((proj) => ({
      ID: proj.ID,
      Name: proj.ProjectName, // تغییر فیلد به Name برای سازگاری با ListSelector
    }));

    // آماده‌سازی داده‌ها برای DynamicSelector از انواع برنامه‌ها
    const programTypeOptions = programTypes.map((type) => ({
      value: String(type.ID),
      label: type.Name,
    }));

    // مدیریت وضعیت Modal برای انتخاب نوع برنامه
    const [modalOpen, setModalOpen] = useState(false);
    const [currentSelector] = useState<string>("ProgramType");
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
        handleChange("nProgramTypeID", parseInt(selectedRowData.value));
        setSelectedProgramTypeId(selectedRowData.value);
        handleCloseModal();
      }
    };

    const getRowData = (selector: string) => {
      if (selector === "ProgramType") {
        return programTypeOptions;
      }
      return [];
    };

    const handleDeleteRow = () => {
      if (!selectedDetailRow) {
        showAlert("warning", null, "Warning", "Please select a row to delete.");
        return;
      }

      setShowDeleteConfirm(true); // 👈 نمایش پنجره تأیید
    };

    const confirmDeleteRow = async () => {
      try {
        await api.deleteProgramTemplateField(selectedDetailRow.ID);

        // حذف از جدول
        setProgramTemplateField((prev) =>
          prev.filter((item) => item.ID !== selectedDetailRow.ID)
        );

        setSelectedDetailRow(null); // پاک‌سازی انتخاب
        setShowDeleteConfirm(false); // بستن مودال
        showAlert("success", null, "Deleted", "Row deleted successfully.");
      } catch (error) {
        console.error("❌ Error deleting row:", error);
        showAlert("error", null, "Error", "Failed to delete the row.");
        setShowDeleteConfirm(false);
      }
    };

    const handleSelectRow = (row: any) => {
      setSelectedDetailRow(row);
    };

    const handleEditRow = (row: any) => {
      setEditingRow(row);
      setIsAddModalOpen(true);
    };

    const handleAddClick = () => {
      setIsAddModalOpen(true);
      setEditingRow(null);
    };

    const enhancedProgramTemplateField = useMemo(() => {
      return programTemplateField.map((item) => {
        const role = roles.find((r) => r.ID === item.nPostId);
        const approvalFlowLabel =
          wfTemplates.find((f) => String(f.ID) === String(item.nWFTemplateID))?.Name || item.nWFTemplateID;
        const formLabel =
          forms.find((f) => String(f.ID) === String(item.nEntityTypeID))?.Name || item.nEntityTypeID;
        const programTemplateLabel =
          programTemplates.find((p) => String(p.ID) === String(item.nProgramTemplateID))?.Name || item.nProgramTemplateID;
    
        return {
          ...item,
          nPostIdDisplay: role?.Name || item.nPostId,
          nWFTemplateID: approvalFlowLabel,
          nEntityTypeID: formLabel,
          nProgramTemplateID: programTemplateLabel,
        };
      });
    }, [
      programTemplateField,
      roles,
      wfTemplates,
      forms,
      programTemplates,
    ]);
    
  

    // تعریف ستون‌ها برای جدول جزئیات
    const detailColumnDefs = [
      {
        headerName: "Order",
        field: "Order",
        flex: 1,
        minWidth: 80,
      },
      {
        headerName: "Activity Name",
        field: "Name",
        flex: 3,
        minWidth: 150,
      },
      {
        headerName: "Code",
        field: "Code",
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "Duration",
        field: "ActDuration",
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "Start",
        field: "Top",
        flex: 1,
        minWidth: 80,
      },
      {
        headerName: "End",
        field: "Left",
        flex: 1,
        minWidth: 80,
      },
      {
        headerName: "Responsible Post",
        field: "nPostIdDisplay",
        flex: 3,
        minWidth: 150,
      },

      {
        headerName: "Approval Flow",
        field: "nWFTemplateID",
        flex: 3,
        minWidth: 150,
      },
      {
        headerName: "Activity Type",
        field: "PFIType",
        flex: 2,
        minWidth: 150,
      },
      {
        headerName: "Form Name",
        field: "nEntityTypeID",
        flex: 3,
        minWidth: 150,
      },
      {
        headerName: "Weight",
        field: "Weight1",
        flex: 1,
        minWidth: 80,
      },
      {
        headerName: "Activity Budget",
        field: "PCostAct",
        flex: 1,
        minWidth: 80,
      },
      {
        headerName: "Program Template",
        field: "nProgramTemplateID",
        flex: 3,
        minWidth: 150,
      },
      {
        headerName: "Program Duration",
        field: "WFDuration",
        flex: 1,
        minWidth: 80,
      },
      {
        headerName: "FProgram Execution Budget",
        field: "PCostAprov",
        flex: 1,
        minWidth: 80,
      },
      {
        headerName: "Program to plan",
        field: "WeightWF",
        flex: 1,
        minWidth: 80,
      },
    ];

    const refreshTable = async () => {
      if (!selectedRow?.ID) return;
      try {
        const result = await api.getProgramTemplateField(selectedRow.ID);
        setProgramTemplateField(result);
      } catch (error) {
        console.error("Error refreshing table data:", error);
      }
    };

    const handleAddModalClose = () => {
      setIsAddModalOpen(false);
      setEditingRow(null);
    };

    const handleSaved = async () => {
      await refreshTable(); // جدول آپدیت بشه
      setIsAddModalOpen(false);
      setEditingRow(null); // مودال بسته بشه
    };

    return (
      <>
        <TwoColumnLayout>
          <TwoColumnLayout.Item>
            <DynamicInput
              name="Program Name"
              type="text"
              value={programTemplateData.Name}
              placeholder="Enter program name"
              onChange={(e) => handleChange("Name", e.target.value)}
              required={true}
            />
          </TwoColumnLayout.Item>

          <TwoColumnLayout.Item>
            <DynamicInput
              name="Duration"
              type="number"
              value={programTemplateData.Duration}
              placeholder="Enter duration"
              onChange={(e) => handleChange("Duration", Number(e.target.value))}
              required={true}
            />
          </TwoColumnLayout.Item>

          <TwoColumnLayout.Item>
            <DynamicInput
              name="Cost Approved"
              type="number"
              value={programTemplateData.PCostAprov}
              placeholder="Enter approved cost"
              onChange={(e) =>
                handleChange("PCostAprov", Number(e.target.value))
              }
            />
          </TwoColumnLayout.Item>

          {/* Updated ListSelector for Related Projects */}
          <TwoColumnLayout.Item>
            <ListSelector
              title="Related Projects"
              columnDefs={projectColumnDefs}
              rowData={projectsListData}
              selectedIds={selectedProjectIds}
              onSelectionChange={handleProjectsChange}
              showSwitcher={true}
              isGlobal={programTemplateData.IsGlobal}
              onGlobalChange={handleGlobalChange}
              loading={loadingProjects}
              ModalContentComponent={TableSelector}
              modalContentProps={{
                columnDefs: projectColumnDefs,
                rowData: projectsListData,
                selectedRow: selectedRowData,
                onRowDoubleClick: () => {
                  if (selectedRowData) {
                    const newSelection = [
                      ...selectedProjectIds,
                      String(selectedRowData.ID),
                    ];
                    handleProjectsChange(newSelection);
                  }
                },
                onRowClick: (row: any) => setSelectedRowData(row),
                onSelectButtonClick: () => {
                  if (selectedRowData) {
                    const newSelection = [
                      ...selectedProjectIds,
                      String(selectedRowData.ID),
                    ];
                    handleProjectsChange(newSelection);
                  }
                },
                isSelectDisabled: !selectedRowData,
              }}
            />
          </TwoColumnLayout.Item>

          {/* DynamicSelector برای انتخاب نوع برنامه به صورت پویا */}
          <TwoColumnLayout.Item>
            <DynamicSelector
              options={programTypeOptions}
              selectedValue={selectedProgramTypeId}
              onChange={(e) => {
                handleChange(
                  "nProgramTypeID",
                  e.target.value ? parseInt(e.target.value) : null
                );
                setSelectedProgramTypeId(e.target.value);
              }}
              label="Type"
              showButton={true}
              onButtonClick={handleOpenModal}
              className="-mt-24"
              loading={loadingProgramTypes} // افزودن وضعیت بارگذاری
            />
          </TwoColumnLayout.Item>

          {/* Dynamic Modal برای انتخاب نوع برنامه */}
          <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
            <TableSelector
              columnDefs={[{ headerName: "Name", field: "label" }]}
              rowData={getRowData(currentSelector)}
              selectedRow={selectedRowData}
              onRowDoubleClick={handleSelectButtonClick}
              onRowClick={handleRowClick}
              onSelectButtonClick={handleSelectButtonClick}
              isSelectDisabled={!selectedRowData}
            />
          </DynamicModal>

          {/* بخش جزئیات با DataTable */}
          {/* ───────── Two-Column Detail Table ───────── */}
          <TwoColumnLayout.Item span={2}>
            {/* ظرف بیرونی: فقط اسکرول افقی */}
            <div className="overflow-x-auto pb-2">
              {/* ظرف درونی: اسکرول عمودی با ارتفاع ثابت */}
              <div className="h-[400px] min-w-full">
                <DataTable
                  /* --------- داده‌ها و ستون‌ها --------- */
                  columnDefs={detailColumnDefs}
                  rowData={enhancedProgramTemplateField}
                  /* --------- رویدادهای انتخاب --------- */
                  onRowClick={handleSelectRow}
                  onRowDoubleClick={handleEditRow}
                  setSelectedRowData={setSelectedDetailRow}
                  /* --------- آیکن‌های CRUD --------- */
                  showAddIcon={true}
                  showEditIcon={true}
                  showDeleteIcon={true}
                  showDuplicateIcon={false}
                  onAdd={handleAddClick}
                  onEdit={() =>
                    selectedDetailRow
                      ? handleEditRow(selectedDetailRow)
                      : showAlert(
                          "warning",
                          null,
                          "No selection",
                          "Please select a row to edit."
                        )
                  }
                  onDelete={handleDeleteRow}
                  onDuplicate={() => {}}
                  /* --------- قابلیت جستجو و لودینگ --------- */
                  showSearch={true}
                  isLoading={loadingFields}
                  /* --------- تنظیمات طرح‌بندی ag-Grid --------- */
                  domLayout="normal" // اسکرول عمودی داخلی
                  gridOptions={{
                    rowSelection: "single",
                    onGridReady: (params) => {
                      params.api.sizeColumnsToFit(); // ستون‌ها فیت
                      window.addEventListener("resize", () =>
                        params.api.sizeColumnsToFit()
                      );
                    },
                  }}
                  isEditMode={isEditMode}
                />
              </div>
            </div>
          </TwoColumnLayout.Item>

          {/* Dynamic Modal برای افزودن برنامه جدید */}
          <DynamicModal isOpen={isAddModalOpen} onClose={handleAddModalClose}>
            <AddProgramTemplate
              selectedRow={selectedRow}
              editingRow={editingRow}
              onSaved={handleSaved}
              onCancel={() => {
                setIsAddModalOpen(false);
                setEditingRow(null);
              }}
            />
          </DynamicModal>
        </TwoColumnLayout>
        <DynamicConfirm
          isOpen={showDeleteConfirm}
          onConfirm={confirmDeleteRow}
          onClose={() => setShowDeleteConfirm(false)}
          variant="delete"
          title="Delete Confirmation"
          message="Are you sure you want to delete this program field?"
        />
      </>
    );
  }
);

export default ProgramTemplate;
