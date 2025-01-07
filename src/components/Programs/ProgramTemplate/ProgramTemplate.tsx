// src/components/ProgramTemplate/ProgramTemplate.tsx

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import TwoColumnLayout from "../../layout/TwoColumnLayout";
import DynamicInput from "../../utilities/DynamicInput";
import ListSelector from "../../ListSelector/ListSelector";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicModal from "../../utilities/DynamicModal";
import TableSelector from "../../General/Configuration/TableSelector";
import DataTable from "../../TableDynamic/DataTable";
import AddProgramTemplate from "./AddProgramTemplate";
import { useApi } from "../../../context/ApiContext";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import {
  ProgramTemplateItem,
  Project,
  ProgramType,
} from "../../../services/api.services";

export interface ProgramTemplateHandle {
  save: () => Promise<boolean>;
}

interface ProgramTemplateProps {
  selectedRow: ProgramTemplateItem | null;
}

// توابع کمکی برای پردازش رشته‌های جداشده با |
function getAssociatedProjects(
  projectsStr?: string,
  projectsData?: { ID: string; Name: string }[]
) {
  const safeProjectsData = projectsData || [];
  const safeProjectsStr = projectsStr || "";
  const projectsArray = safeProjectsStr.split("|").filter(Boolean);
  return safeProjectsData.filter((project) =>
    projectsArray.includes(String(project.ID))
  );
}

// Program type options به صورت پویا از API دریافت می‌شود
const ProgramTemplate = forwardRef<ProgramTemplateHandle, ProgramTemplateProps>(
  ({ selectedRow }, ref) => {
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
    const [loadingProgramTypes, setLoadingProgramTypes] = useState<boolean>(
      false
    );

    // انتخاب ID‌های پروژه به صورت رشته
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
      selectedRow?.ProjectsStr
        ? selectedRow.ProjectsStr.split("|").filter(Boolean)
        : []
    );

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
            `Program Template ${selectedRow ? "updated" : "added"} successfully.`
          );
          return true;
        } catch (error) {
          console.error("Error saving program template:", error);
          showAlert(
            "error",
            null,
            "Error",
            "Failed to save program template."
          );
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

    // مدیریت وضعیت Modal برای افزودن برنامه جدید
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleAddClick = () => {
      setIsAddModalOpen(true);
    };

    const handleAddModalClose = () => {
      setIsAddModalOpen(false);
    };

    // تعریف ستون‌ها برای جدول جزئیات
    const detailColumnDefs = [
      { headerName: "ID", field: "ID", sortable: true, filter: true },
      { headerName: "Name", field: "Name", sortable: true, filter: true },
      {
        headerName: "Is Global",
        field: "IsGlobal",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Duration",
        field: "Duration",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Cost Act",
        field: "PCostAct",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Cost Approved",
        field: "PCostAprov",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Program Type ID",
        field: "nProgramTypeID",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Last Modified",
        field: "LastModified",
        sortable: true,
        filter: true,
      },
    ];

    // داده‌های جزئیات مرتبط
    const relatedDetailData = [
      {
        ID: programTemplateData.ID,
        Name: programTemplateData.Name,
        MetaColumnName: programTemplateData.MetaColumnName,
        IsGlobal: programTemplateData.IsGlobal,
        Duration: programTemplateData.Duration,
        PCostAct: programTemplateData.PCostAct,
        PCostAprov: programTemplateData.PCostAprov,
        nProgramTypeID: programTemplateData.nProgramTypeID,
        LastModified: programTemplateData.LastModified,
      },
    ];

    return (
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
            onChange={(e) => handleChange("PCostAprov", Number(e.target.value))}
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
        <TwoColumnLayout.Item span={2}>
          <div className="-mt-12">
            <DataTable
              columnDefs={detailColumnDefs}
              rowData={relatedDetailData}
              onRowDoubleClick={() => {}}
              setSelectedRowData={() => {}}
              showDuplicateIcon={false}
              showEditIcon={true}
              showAddIcon={true}
              showDeleteIcon={true}
              onAdd={handleAddClick}
              onEdit={() => {}}
              onDelete={() => {}}
              onDuplicate={() => {}}
              domLayout="autoHeight"
              showSearch={true}
            />
          </div>
        </TwoColumnLayout.Item>

        {/* Dynamic Modal برای افزودن برنامه جدید */}
        <DynamicModal isOpen={isAddModalOpen} onClose={handleAddModalClose}>
          <AddProgramTemplate />
        </DynamicModal>
      </TwoColumnLayout>
    );
  }
);

export default ProgramTemplate;
