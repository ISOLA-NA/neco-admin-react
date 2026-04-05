import React, {
  useState,
  useEffect,
  Suspense,
  useRef,
  MouseEvent,
  useCallback,
  FC,
  useMemo,
} from "react";
import DataTable from "../../TableDynamic/DataTable";
import PanelHeader from "../tabcontent/PanelHeader";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import { ConfigurationHandle } from "../../General/Configuration/Configurations";
import { useApi } from "../../../context/ApiContext";
import { CommandHandle } from "../../General/CommandSettings";
import { UserHandle } from "../../General/Users";
import { RoleHandle } from "../../General/Roles";
import { CompanyHandle } from "../../General/Enterprises";
import { RoleGroupsHandle } from "../../General/RoleGroups";
import { StaffingHandle } from "../../General/Staffing";
import { ProgramTemplateHandle } from "../../Programs/ProgramTemplate/ProgramTemplate";
import { ProgramTypeHandle } from "../../Programs/ProgramTypes";
import { ProcedureHandle } from "../../Projects/Procedures";
import { CalendarHandle } from "../../Projects/Calendars";
import { OdpHandle } from "../../Projects/Odp";
import ProjectAccess, {
  ProjectAccessHandle,
} from "../../Projects/ProjectAccess/ProjectsAccess";
import { ApprovalFlowHandle } from "../../ApprovalFlows/MainApproval/ApprovalFlows";
import { FormsHandle } from "../../Forms/Forms";
import { CategoryHandle } from "../../Forms/Categories";
import DynamicButton from "../../utilities/DynamicButtons";
import DynamicInput from "../../utilities/DynamicInput";
import { FaSave, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import DynamicConfirm from "../../utilities/DynamicConfirm";
import { useSubTabDefinitions } from "../../../context/SubTabDefinitionsContext";
import { useTranslation } from "react-i18next";
import DynamicSelector from "../../utilities/DynamicSelector copy";
import { UpdateAddressProvider } from "../../Projects/UpdateAddress/UpdateAddressContext";
import UpdateAddressLeft from "../../Projects/UpdateAddress/UpdateAddressLeft";
import UpdateAddressRight from "../../Projects/UpdateAddress/UpdateAddressRight";

interface TabContentProps {
  component: React.LazyExoticComponent<React.ComponentType<any>> | null;
  columnDefs: any[];
  rowData: any[];
  onRowDoubleClick: (data: any) => void;
  selectedRow: any;
  activeSubTab: string;
  showDuplicateIcon: boolean;
  showEditIcon: boolean;
  showAddIcon: boolean;
  showDeleteIcon: boolean;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRowClick: (data: any) => void;
  isPanelOpen: boolean;
  setIsPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TabContent: FC<TabContentProps> = ({
  component: Component,
  columnDefs,
  rowData,
  onRowDoubleClick,
  selectedRow,
  activeSubTab,
  onAdd,
  onDelete,
  onDuplicate,
  onRowClick,
  showDuplicateIcon,
  showEditIcon,
  showAddIcon,
  showDeleteIcon,
  isPanelOpen,
  setIsPanelOpen,
}) => {
  // ✅ اصلاح: این فایل به کلیدهای Alerts / DynamicConfirm / DataTable هم نیاز دارد
  // پس نباید namespace "Forms" تنها باشد
  const { t, i18n } = useTranslation();

  // ✅ کمک: اگر کلید ترجمه نبود، defaultValue نمایش بده تا key خام دیده نشه
  const TT = useCallback(
    (key: string, fallback: string) => t(key, { defaultValue: fallback }),
    [t]
  );

  const api = useApi();
  const { fetchDataForSubTab, duplicateForSubTab } = useSubTabDefinitions();
  const [panelWidth, setPanelWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRightMaximized, setIsRightMaximized] = useState(false);
  const isMaximized = panelWidth >= 97;
  const configurationRef = useRef<ConfigurationHandle>(null);
  const commandRef = useRef<CommandHandle>(null);
  const userRef = useRef<UserHandle>(null);
  const roleRef = useRef<RoleHandle>(null);
  const companyRef = useRef<CompanyHandle>(null);
  const roleGroupsRef = useRef<RoleGroupsHandle>(null);
  const staffingRef = useRef<StaffingHandle>(null);
  const programTemplateRef = useRef<ProgramTemplateHandle>(null);
  const programTypeRef = useRef<ProgramTypeHandle>(null);
  const odpRef = useRef<OdpHandle>(null);
  const procedureRef = useRef<ProcedureHandle>(null);
  const calendarRef = useRef<CalendarHandle>(null);
  const projectAccessRef = useRef<ProjectAccessHandle>(null);
  const approvalFlowRef = useRef<ApprovalFlowHandle>(null);
  const formsRef = useRef<FormsHandle>(null);
  const categoriesRef = useRef<CategoryHandle>(null);
  const [canSave, setCanSave] = useState(true);
  const [canUpdate, setCanUpdate] = useState(false);
  const [selectedCategoryType, setSelectedCategoryType] = useState<
    "cata" | "catb"
  >("cata");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVariant, setConfirmVariant] = useState<"delete" | "edit">(
    "delete"
  );
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [isAdding, setIsAdding] = useState(false);
  const [pendingSelectedRow, setPendingSelectedRow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchedRowData, setFetchedRowData] = useState<any[]>([]);
  const [nameInput, setNameInput] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [resetSearchKey, setResetSearchKey] = useState(0);
  const [persianNameInput, setPersianNameInput] = useState<string>("");
  const [isFaMode, setIsFaMode] = useState(true);
  const [uaSelection, setUaSelection] = useState<{
    gid?: string;
    id?: number;
    address?: string;
  } | null>(null);

  // ✅ اصلاح: ترجمه هدرها با کلید درست
  const fixColumnHeaders = (defs: any[]) => {
    return defs.map((col) => {
      if (col.headerName === "Transmittal") {
        return {
          ...col,
          headerName: t("Forms.Transmittal"),
        };
      }
      if (col.headerName === "PersianName") {
        return {
          ...col,
          headerName: t("DataTable.Headers.PersianName"),
        };
      }
      return col;
    });
  };

  const fixedColumnDefs = fixColumnHeaders(columnDefs);

  const togglePanelSize = () => {
    setIsRightMaximized(false);
    setPanelWidth((prevWidth) => (isMaximized ? 50 : 97));
  };

  const togglePanelSizeFromRight = (maximize: boolean) => {
    if (maximize) {
      setIsRightMaximized(true);
      setPanelWidth(2);
    } else {
      setIsRightMaximized(false);
      setPanelWidth(50);
    }
  };

  const startDragging = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent | globalThis.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      let newWidth =
        ((e.clientX - containerRect.left) / containerRef.current.clientWidth) *
        100;
      newWidth = Math.max(2, Math.min(97, newWidth));
      setIsRightMaximized(false);
      setPanelWidth(newWidth);
    },
    [isDragging]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", stopDragging);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [isDragging, handleMouseMove, stopDragging]);

  const fetchTableData = useCallback(async () => {
    setIsLoading(true);
    try {
      let data;
      if (activeSubTab === "Categories") {
        data = await fetchDataForSubTab("Categories", {
          categoryType: selectedCategoryType,
        });
      } else {
        data = await fetchDataForSubTab(activeSubTab);
      }
      setFetchedRowData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert(
        "error",
        null,
        t("Alerts.Title.Error"),
        t("Alerts.Errors.FailedToFetchData")
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeSubTab, selectedCategoryType, fetchDataForSubTab, t]);

  /**
   * ✅ Duplicate behavior:
   * - برای Ribbons: دقیقا api.duplicateEntityType({ID}) کال می‌شود
   * - برای بقیه تب‌ها: همان duplicateForSubTab قبلی
   * + لاگ‌های کامل برای دیباگ
   */
  const handleDuplicateClick = () => {
  const row = pendingSelectedRow || selectedRow;

  console.log("[DUPLICATE] click", {
    activeSubTab,
    pendingSelectedRow,
    selectedRow,
    effectiveRow: row,
  });

  if (!row) {
    showAlert(
      "warning",
      null,
      t("Alerts.Title.Warning"),
      t("Alerts.Duplicated.NoRowSelected")
    );
    return;
  }

  setConfirmVariant("edit");
  setConfirmTitle(t("DynamicConfirm.Confirmations.Duplicate.Title"));
  setConfirmMessage(t("DynamicConfirm.Confirmations.Duplicate.Message"));

  setConfirmAction(() => async () => {
    console.log("[DUPLICATE] confirmed", { activeSubTab, row });

    try {
      console.log("[DUPLICATE] calling duplicateForSubTab", {
        activeSubTab,
        row,
      });

      await duplicateForSubTab(activeSubTab, row);

      console.log("[DUPLICATE] duplicateForSubTab success", {
        activeSubTab,
        row,
      });

      showAlert(
        "success",
        null,
        t("Alerts.Title.Success"),
        t("Alerts.Duplicated.Success")
      );

      await fetchTableData();
    } catch (err: any) {
      console.error("[DUPLICATE] failed", {
        activeSubTab,
        err,
        response: err?.response,
        data: err?.response?.data,
      });

      const data = err?.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.value?.message || data?.message || t("Alerts.Duplicated.Failed");

      showAlert("error", null, t("Alerts.Title.Error"), message);
    } finally {
      setConfirmOpen(false);
    }
  });

  setConfirmOpen(true);
};

  const handleCategoryTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as "cata" | "catb";
    setSelectedCategoryType(newType);
  };

  useEffect(() => {
    if (activeSubTab) {
      setIsAdding(true);
      fetchTableData();
    }
  }, [activeSubTab, fetchTableData]);

  const handleInsert = async () => {
    try {
      switch (activeSubTab) {
        case "Configurations":
          if (configurationRef.current) {
            const result = await configurationRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.Configuration")
            );
          }
          break;
        case "Commands":
          if (commandRef.current) {
            const result = await commandRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.Command")
            );
          }
          break;
        case "Users":
          if (userRef.current) {
            const result = await userRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.User")
            );
          }
          break;
        case "Ribbons": {
          const nameTrim = (nameInput || "").trim();
          const pNameTrim = (persianNameInput || "").trim();
          if (!nameTrim && !pNameTrim) {
            showAlert(
              "warning",
              null,
              t("Alerts.Title.Warning"),
              t("Alerts.Warnings.NameOrPersianNameRequired")
            );
            return;
          }
          await api.insertMenu({
            Name: nameTrim || pNameTrim,
            PersianName: pNameTrim || null,
            Description: descriptionInput,
            IsVisible: true,
          });
          showAlert(
            "success",
            null,
            t("Alerts.Title.Success"),
            t("Alerts.Added.Ribbon")
          );
          break;
        }
        case "Roles":
          if (roleRef.current) {
            const result = await roleRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.Role")
            );
          }
          break;
        case "Enterprises":
          if (companyRef.current) {
            const result = await companyRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.Enterprise")
            );
          }
          break;
        case "RoleGroups":
          if (roleGroupsRef.current) {
            const result = await roleGroupsRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.RoleGroup")
            );
          }
          break;
        case "Staffing":
          if (staffingRef.current) {
            const ok = await staffingRef.current.save();
            console.log("📦 نتیجه save():", ok);
            if (!ok) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.Staffing")
            );
            await fetchTableData();
          }
          break;
        case "ProgramTemplate":
          if (programTemplateRef.current) {
            const result = await programTemplateRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.ProgramTemplate")
            );
          }
          break;
        case "ProgramTypes":
          if (programTypeRef.current) {
            const result = await programTypeRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.ProgramType")
            );
          }
          break;
        case "Odp":
          if (odpRef.current) {
            const result = await odpRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.Odp")
            );
          }
          break;
        case "Procedures":
          if (procedureRef.current) {
            const result = await procedureRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.Procedure")
            );
          }
          break;
        case "Calendars":
          if (calendarRef.current) {
            const result = await calendarRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.Calendar")
            );
          }
          break;
        case "ProjectsAccess":
          if (projectAccessRef.current) {
            const result = await projectAccessRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.ProjectAccess")
            );
          }
          break;
        case "ApprovalFlows":
          if (approvalFlowRef.current) {
            const result = await approvalFlowRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.ApprovalFlow")
            );
          }
          break;
        case "Forms":
          if (formsRef.current) {
            const result = await formsRef.current.save();
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.Form")
            );
          }
          break;
        case "Categories":
          if (categoriesRef.current) {
            const categoryData = categoriesRef.current.getData();
            let result;
            if (selectedCategoryType === "cata") {
              result = await api.insertCatA({
                ...categoryData,
                categoryType: selectedCategoryType,
              });
            } else {
              result = await api.insertCatB({
                ...categoryData,
                categoryType: selectedCategoryType,
              });
            }
            if (!result) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Added.Category")
            );
          }
          break;
        default:
          break;
      }
      await fetchTableData();
      setResetSearchKey((k) => k + 1);
      if (activeSubTab !== "Ribbons") {
        setIsPanelOpen(false);
      }
      if (activeSubTab === "Ribbons") {
        setIsAdding(true);
      } else {
        setIsAdding(false);
      }
      resetInputs();
    } catch (error: any) {
      const data = error.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.value?.message ||
            data?.message ||
            t("Alerts.Errors.FailedToSaveCommand");
      showAlert("error", null, t("Alerts.Title.Error"), message);
    }
  };

  useEffect(() => {
    if (activeSubTab === "Ribbons") {
      setIsFaMode(true);
      setNameInput("");
      setPersianNameInput("");
      setDescriptionInput("");
      setIsAdding(true);
    }
  }, [activeSubTab]);

  const handleUpdate = async () => {
    try {
      if (activeSubTab === "Ribbons" && !checkNameNonEmpty()) {
        showNameEmptyWarning();
        return;
      }
      switch (activeSubTab) {
        case "Configurations":
          if (configurationRef.current) {
            await configurationRef.current.save();
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.Configuration")
            );
            await fetchTableData();
          }
          break;
        case "Commands":
          if (commandRef.current) {
            await commandRef.current.save();
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.Command")
            );
            await fetchTableData();
          }
          break;
        case "Users":
          if (userRef.current) {
            const result = await userRef.current.save();
            if (result) {
              showAlert(
                "success",
                null,
                t("Alerts.Title.Success"),
                t("Alerts.Updated.User")
              );
              await fetchTableData();
            }
          }
          break;
        case "Ribbons":
          if (selectedRow) {
            const nameTrim = (nameInput || "").trim();
            const pNameTrim = (persianNameInput || "").trim();
            if (!nameTrim && !pNameTrim) {
              showAlert(
                "warning",
                null,
                t("Alerts.Title.Warning"),
                t("Alerts.Warnings.NameOrPersianNameRequired")
              );
              return;
            }
            await api.updateMenu({
              ID: selectedRow.ID,
              Name: nameTrim || pNameTrim,
              PersianName: pNameTrim || null,
              Description: descriptionInput,
              IsVisible: selectedRow.IsVisible,
            });
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.Ribbon")
            );
            await fetchTableData();
          }
          break;
        case "Roles":
          if (selectedRow && roleRef.current) {
            await roleRef.current.save();
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.Role")
            );
            await fetchTableData();
          }
          break;
        case "Enterprises":
          if (selectedRow && companyRef.current) {
            await companyRef.current.save();
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.Enterprise")
            );
            await fetchTableData();
          }
          break;
        case "RoleGroups":
          if (selectedRow && roleGroupsRef.current) {
            await roleGroupsRef.current.save();
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.RoleGroup")
            );
            await fetchTableData();
          }
          break;
        case "Staffing":
          if (staffingRef.current) {
            const ok = await staffingRef.current.save();
            console.log("📦 نتیجه save():", ok);
            if (!ok) return;
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.Staffing")
            );
            await fetchTableData();
          }
          break;
        case "ProgramTemplate":
          if (programTemplateRef.current) {
            await programTemplateRef.current.save();
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.ProgramTemplate")
            );
            await fetchTableData();
          }
          break;
        case "ProgramTypes":
          if (programTypeRef.current) {
            await programTypeRef.current.save();
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.ProgramType")
            );
            await fetchTableData();
          }
          break;
        case "Odp":
          if (odpRef.current) {
            await odpRef.current.save();
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.Odp")
            );
            await fetchTableData();
          }
          break;
        case "Procedures":
          if (procedureRef.current) {
            await procedureRef.current.save();
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.Procedure")
            );
            await fetchTableData();
          }
          break;
        case "Calendars":
          if (calendarRef.current) {
            await calendarRef.current.save();
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.Calendar")
            );
            await fetchTableData();
          }
          break;
        case "ProjectsAccess":
          if (projectAccessRef.current) {
            await projectAccessRef.current.save();
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.ProjectsAccess")
            );
            await fetchTableData();
          }
          break;
        case "ApprovalFlows":
          if (approvalFlowRef.current) {
            await approvalFlowRef.current.save();
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.ApprovalFlow")
            );
            await fetchTableData();
          }
          break;
        case "Forms":
          if (formsRef.current) {
            await formsRef.current.save();
            showAlert(
              "success",
              undefined,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.Form")
            );
            await fetchTableData();
          }
          break;
        case "Categories":
          if (categoriesRef.current) {
            await (selectedCategoryType === "cata"
              ? api.updateCatA({
                  ...categoriesRef.current.getData(),
                  categoryType: selectedCategoryType,
                })
              : api.updateCatB({
                  ...categoriesRef.current.getData(),
                  categoryType: selectedCategoryType,
                }));
            showAlert(
              "success",
              null,
              t("Alerts.Title.Success"),
              t("Alerts.Updated.Category")
            );
            await fetchTableData();
            setResetSearchKey((k) => k + 1);
          }
          break;
      }
      setIsPanelOpen(false);
      if (activeSubTab === "Ribbons") {
        setIsAdding(true);
      } else {
        setIsAdding(false);
      }
      resetInputs();
    } catch (error: any) {
      const data = error.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.value?.message ||
            data?.message ||
            t("Alerts.Errors.FailedToSaveCommand");
      showAlert("error", null, t("Alerts.Title.Error"), message);
    }
  };

  const handleClose = () => {
    setIsPanelOpen(false);
    setIsAdding(false);
    resetInputs();
  };

  const resetInputs = () => {
    setNameInput("");
    setPersianNameInput("");
    setDescriptionInput("");
    setIsFaMode(true);
  };

  const handleDoubleClick = (data: any) => {
    onRowDoubleClick(data);
    setIsAdding(false);
    setIsPanelOpen(true);
    if (activeSubTab === "Ribbons") {
      setNameInput(data.Name);
      setDescriptionInput(data.Description);
    }
    if (activeSubTab === "ProjectsAccess") {
      setIsAdding(true);
    } else {
      setIsAdding(false);
    }
  };

  const handleRowClickLocal = (data: any) => {
    setPendingSelectedRow(data);
    onRowClick(data);
    if (activeSubTab === "Ribbons") {
      setNameInput(data.Name);
      setPersianNameInput(data.PersianName || "");
      setDescriptionInput(data.Description);
    }
    if (activeSubTab === "ProjectsAccess") {
      setIsAdding(true);
      setCanSave(true);
      setCanUpdate(false);
    } else {
      setIsAdding(false);
      setCanSave(false);
      setCanUpdate(true);
    }
    setIsPanelOpen(true);
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setIsPanelOpen(true);
    onAdd();
    resetInputs();
  };

  const handleDeleteClick = () => {
    if (!pendingSelectedRow) {
      showAlert(
        "warning",
        null,
        t("Alerts.Title.Warning"),
        t("Alerts.Deleted.NoRowSelected")
      );
      return;
    }
    setConfirmVariant("delete");
    setConfirmTitle(t("DynamicConfirm.Confirmations.Delete.Title"));
    setConfirmMessage(t("DynamicConfirm.Confirmations.Delete.Message"));
    setConfirmAction(() => async () => {
      try {
        switch (activeSubTab) {
          case "Users":
            await api.deleteUser(pendingSelectedRow.ID);
            break;
          case "Ribbons":
            await api.deleteMenu(pendingSelectedRow.ID);
            break;
          case "Commands":
            await api.deleteCommand(pendingSelectedRow.ID);
            break;
          case "Configurations":
            await api.deleteConfiguration(pendingSelectedRow.ID);
            break;
          case "Roles":
            await api.deleteRole(pendingSelectedRow.ID);
            break;
          case "Enterprises":
            await api.deleteCompany(pendingSelectedRow.ID);
            break;
          case "RoleGroups":
            await api.deletePostCat(pendingSelectedRow.ID);
            break;
          case "Staffing":
            await api.deleteRole(pendingSelectedRow.ID);
            break;
          case "ProgramTemplate":
            await api.deleteProgramTemplate(pendingSelectedRow.ID);
            break;
          case "ProgramTypes":
            await api.deleteProgramType(pendingSelectedRow.ID);
            break;
          case "Projects":
            await api.deleteProject(pendingSelectedRow.ID);
            break;
          case "Odp":
            await api.deleteOdp(pendingSelectedRow.ID);
            break;
          case "Procedures":
            await api.deleteEntityCollection(pendingSelectedRow.ID);
            break;
          case "Calendars":
            await api.deleteCalendar(pendingSelectedRow.ID);
            break;
          case "ProjectsAccess":
            await api.deleteAccessProject(pendingSelectedRow.ID);
            break;
          case "ApprovalFlows":
            await api.deleteApprovalFlow(pendingSelectedRow.ID);
            break;
          case "Forms":
            await api.deleteEntityType(pendingSelectedRow.ID);
            break;
          case "Categories":
            if (selectedCategoryType === "cata") {
              await api.deleteCatA(pendingSelectedRow.ID);
            } else {
              await api.deleteCatB(pendingSelectedRow.ID);
            }
            break;
        }
        showAlert(
          "success",
          null,
          t("Alerts.Title.Success"),
          `${activeSubTab} ${t("Alerts.Deleted.Success")}`
        );
        setIsPanelOpen(false);
        await fetchTableData();
      } catch (error) {
        console.error("Error deleting:", error);
        showAlert(
          "error",
          null,
          t("Alerts.Title.Error"),
          t("Alerts.Deleted.Failed")
        );
      } finally {
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  useEffect(() => {
    if (activeSubTab === "UpdateAddress") setIsPanelOpen(true);
  }, [activeSubTab]);

  const handleEditFromLeft = () => {
    setIsAdding(false);
    setIsPanelOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    await confirmAction();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescriptionInput(e.target.value);
  };

  const getActiveRef = () => {
    switch (activeSubTab) {
      case "Configurations":
        return configurationRef;
      case "Commands":
        return commandRef;
      case "Users":
        return userRef;
      case "Roles":
        return roleRef;
      case "Enterprises":
        return companyRef;
      case "RoleGroups":
        return roleGroupsRef;
      case "Staffing":
        return staffingRef;
      case "ProgramTemplate":
        return programTemplateRef;
      case "ProgramTypes":
        return programTypeRef;
      case "Odp":
        return odpRef;
      case "Procedures":
        return procedureRef;
      case "Calendars":
        return calendarRef;
      case "ProjectsAccess":
        return projectAccessRef;
      case "ApprovalFlows":
        return approvalFlowRef;
      case "Forms":
        return formsRef;
      case "Categories":
        return categoriesRef;
      default:
        return null;
    }
  };

  const checkNameNonEmpty = () => {
    if (activeSubTab === "Ribbons") {
      const nameTrim = (nameInput || "").trim();
      const pNameTrim = (persianNameInput || "").trim();
      return !!(nameTrim || pNameTrim);
    }
    const activeRef = getActiveRef();
    if (
      activeRef &&
      activeRef.current &&
      typeof (activeRef.current as any).checkNameFilled === "function"
    ) {
      return (activeRef.current as any).checkNameFilled();
    }
    return true;
  };

  const showNameEmptyWarning = () => {
    showAlert(
      "warning",
      null,
      t("Alerts.Title.Warning"),
      t("Alerts.Warnings.NameCannotBeEmpty")
    );
  };

  const categoryOptions = useMemo(
    () => [
      { value: "cata", label: t("Category.CategoryA") },
      { value: "catb", label: t("Category.CategoryB") },
    ],
    [t]
  );

  // ✅ طبق درخواست شما:
  // - فقط دکمه/آیکن Duplicate بالای جدول برای Ribbons فعال باشد
  // - دکمه Duplicate کنار Save/Edit/Add/Delete زیر اینپوت‌ها نباشد
  const effectiveShowDuplicateIcon =
    activeSubTab === "Ribbons" ? true : showDuplicateIcon;

  return (
    <UpdateAddressProvider>
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden mt-2 border border-gray-300 rounded-lg mb-6 flex relative"
        style={{ height: "100%" }}
      >
        <DynamicConfirm
          isOpen={confirmOpen}
          variant={confirmVariant}
          title={confirmTitle}
          message={confirmMessage}
          onConfirm={handleConfirm}
          onClose={() => setConfirmOpen(false)}
        />
        <div
          className="flex flex-col overflow-auto bg-gray-100 box-border"
          style={{
            flex: `0 0 calc(${panelWidth}% - 1px)`,
            transition: isDragging ? "none" : "flex-basis 0.1s ease-out",
            backgroundColor: "#f3f4f6",
          }}
        >
          <div className="flex items-center justify-between p-2 border-b border-gray-300 bg-gray-100 w-full">
            <div className="font-bold text-gray-700 text-sm"> </div>
            <button
              onClick={togglePanelSize}
              className="text-gray-700 hover:text-gray-900 transition"
              title={
                isMaximized
                  ? t("DynamicConfirm.Buttons.Minimize")
                  : t("DynamicConfirm.Buttons.Maximize")
              }
            >
              {isMaximized ? (
                <FiMinimize2 size={18} />
              ) : (
                <FiMaximize2 size={18} />
              )}
            </button>
          </div>

          {activeSubTab === "Categories" && (
            <div className="mb-4 p-2">
              <DynamicSelector
                name="categoryType"
                label={t("Category.CategoryType")}
                options={categoryOptions}
                selectedValue={selectedCategoryType}
                onChange={handleCategoryTypeChange}
                className="w-full"
              />
            </div>
          )}

          <div className="h-full p-4 overflow-auto relative">
            {activeSubTab === "UpdateAddress" ? (
              <UpdateAddressLeft onPick={(payload) => setUaSelection(payload)} />
            ) : (
              <>
                {activeSubTab === "Ribbons" && (
                  <div className="mt-4 w-full p-4 bg-white rounded-md shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <DynamicInput
                            name={
                              isFaMode
                                ? t("Ribbons.Name")
                                : t("Forms.PersianName")
                            }
                            type="text"
                            value={isFaMode ? nameInput : persianNameInput}
                            placeholder={
                              isFaMode
                                ? t("Ribbons.Name")
                                : t("Forms.PersianName")
                            }
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (isFaMode) setNameInput(e.target.value);
                              else setPersianNameInput(e.target.value);
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsFaMode((p) => !p)}
                          className={[
                            "shrink-0 inline-flex items-center justify-center h-10 px-3 rounded-lg",
                            "bg-gradient-to-r from-fuchsia-500 to-pink-500",
                            "text-white text-xs font-semibold tracking-wide",
                            "shadow-md shadow-pink-200/50",
                            "transition-all duration-200",
                            "hover:from-fuchsia-600 hover:to-pink-600 hover:shadow-lg hover:scale-[1.02]",
                            "active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-pink-300",
                          ].join(" ")}
                          title={
                            isFaMode
                              ? t("Forms.SwitchToEN", {
                                  field: t("Forms.PersianName"),
                                })
                              : t("Forms.SwitchToFA", { field: t("Forms.Name") })
                          }
                        >
                          {isFaMode ? "FA" : "EN"}
                        </button>
                      </div>
                      <DynamicInput
                        name={t("Ribbons.Description")}
                        type="text"
                        value={descriptionInput}
                        placeholder={
                          t("Ribbons.DescriptionPlaceholder") ||
                          "Enter description"
                        }
                        onChange={handleDescriptionChange}
                      />
                    </div>

                    {/* ✅ دکمه Duplicate اینجا حذف شد؛ فقط بالای جدول می‌خواهید */}
                    <div className="flex items-center gap-4 mt-6 justify-center">
                      <DynamicButton
                        text={TT("DynamicConfirm.Buttons.Save", "ذخیره")}
                        leftIcon={<FaSave />}
                        onClick={handleInsert}
                        isDisabled={!isAdding}
                        variant="orgGreen"
                        size="md"
                      />
                      <DynamicButton
                        text={TT("DynamicConfirm.Buttons.Edit", "ویرایش")}
                        leftIcon={<FaEdit />}
                        onClick={handleUpdate}
                        isDisabled={!selectedRow}
                        variant="orgYellow"
                        size="md"
                      />
                      <DynamicButton
                        text={TT("DynamicConfirm.Buttons.Add", "افزودن")}
                        leftIcon={<FaPlus />}
                        onClick={() => {
                          setIsAdding(true);
                          setNameInput("");
                          setPersianNameInput("");
                          setDescriptionInput("");
                          setIsFaMode(false);
                        }}
                        variant="orgBlue"
                        size="md"
                      />
                      <DynamicButton
                        text={TT("DynamicConfirm.Buttons.Delete", "حذف")}
                        leftIcon={<FaTrash />}
                        onClick={handleDeleteClick}
                        isDisabled={!selectedRow}
                        variant="orgRed"
                        size="md"
                      />
                    </div>
                  </div>
                )}

                {(() => {
                  const addPersianCol =
                    activeSubTab === "Ribbons" &&
                    Array.isArray(fixedColumnDefs) &&
                    !fixedColumnDefs.some((c: any) => c.field === "PersianName");

                  const cols = addPersianCol
                    ? [
                        ...fixedColumnDefs,
                        {
                          headerName: t("DataTable.Headers.PersianName"),
                          field: "PersianName",
                          sortable: true,
                          filter: true,
                          resizable: true,
                        },
                      ]
                    : fixedColumnDefs;

                  return (
                    <DataTable
                      columnDefs={cols}
                      rowData={fetchedRowData}
                      onRowDoubleClick={(data: any) => {
                        handleDoubleClick(data);
                        if (activeSubTab === "Ribbons") {
                          setPersianNameInput(data?.PersianName || "");
                        }
                      }}
                      setSelectedRowData={(data: any) => {
                        handleRowClickLocal(data);
                        if (activeSubTab === "Ribbons") {
                          setPersianNameInput(data?.PersianName || "");
                        }
                      }}
                      // ✅ فقط دکمه Duplicate بالای جدول (Toolbar)
                      showDuplicateIcon={effectiveShowDuplicateIcon}
                      showEditIcon={showEditIcon}
                      showAddIcon={showAddIcon}
                      showDeleteIcon={showDeleteIcon}
                      onEdit={handleEditFromLeft}
                      onAdd={handleAddClick}
                      onDelete={handleDeleteClick}
                      // ✅ اینجا دقیقا API مدنظر شما برای Ribbons کال می‌شود
                      // (و برای بقیه تب‌ها همان روال قبلی)
                      onDuplicate={handleDuplicateClick}
                      isLoading={isLoading}
                      direction={i18n.dir()}
                      resetSearchKey={resetSearchKey}
                    />
                  );
                })()}
              </>
            )}
          </div>
        </div>

        <div
          onMouseDown={startDragging}
          className="flex items-center justify-center cursor-ew-resize w-2"
          style={{ userSelect: "none", cursor: "col-resize", zIndex: 30 }}
        >
          <div className="h-full w-1 bg-[#dd4bae] rounded"></div>
        </div>

        {isPanelOpen && (
          <div
            className={`flex-1 transition-opacity duration-100 bg-gray-100 ${
              isMaximized ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
            style={{
              transition: "opacity 0.1s ease-out",
              backgroundColor: "#f3f4f6",
              display: "flex",
              flexDirection: "column",
              overflowX: panelWidth <= 30 ? "auto" : "hidden",
              maxWidth: panelWidth <= 30 ? "100%" : "100%",
            }}
          >
            <div
              className="h-full p-4 flex flex-col"
              style={{ minWidth: panelWidth <= 30 ? "300px" : "auto" }}
            >
              {activeSubTab !== "Ribbons" &&
                activeSubTab !== "ProjectsAccess" &&
                activeSubTab !== "UpdateAddress" && (
                  <PanelHeader
                    isExpanded={false}
                    toggleExpand={() => {}}
                    onSave={
                      isAdding &&
                      (activeSubTab === "Configurations" ||
                        activeSubTab === "Commands" ||
                        activeSubTab === "Users" ||
                        activeSubTab === "Ribbons" ||
                        activeSubTab === "Roles" ||
                        activeSubTab === "RoleGroups" ||
                        activeSubTab === "Enterprises" ||
                        activeSubTab === "Staffing" ||
                        activeSubTab === "ProgramTemplate" ||
                        activeSubTab === "ProgramTypes" ||
                        activeSubTab === "Odp" ||
                        activeSubTab === "Procedures" ||
                        activeSubTab === "Calendars" ||
                        activeSubTab === "ProjectsAccess" ||
                        activeSubTab === "ApprovalFlows" ||
                        activeSubTab === "Forms" ||
                        activeSubTab === "Categories")
                        ? handleInsert
                        : undefined
                    }
                    onUpdate={
                      !isAdding &&
                      (activeSubTab === "Configurations" ||
                        activeSubTab === "Commands" ||
                        activeSubTab === "Users" ||
                        activeSubTab === "Ribbons" ||
                        activeSubTab === "Roles" ||
                        activeSubTab === "Enterprises" ||
                        activeSubTab === "RoleGroups" ||
                        activeSubTab === "Staffing" ||
                        activeSubTab === "ProgramTemplate" ||
                        activeSubTab === "ProgramTypes" ||
                        activeSubTab === "Odp" ||
                        activeSubTab === "Procedures" ||
                        activeSubTab === "Calendars" ||
                        activeSubTab === "ProjectsAccess" ||
                        activeSubTab === "ApprovalFlows" ||
                        activeSubTab === "Forms" ||
                        activeSubTab === "Categories")
                        ? handleUpdate
                        : undefined
                    }
                    onClose={handleClose}
                    onTogglePanelSizeFromRight={togglePanelSizeFromRight}
                    isRightMaximized={isRightMaximized}
                    onCheckCanSave={() => checkNameNonEmpty()}
                    onCheckCanUpdate={() => checkNameNonEmpty()}
                    onShowEmptyNameWarning={showNameEmptyWarning}
                  />
                )}

              {activeSubTab === "UpdateAddress" ? (
                <div className="mt-2 flex-grow overflow-y-auto">
                  <UpdateAddressRight />
                </div>
              ) : activeSubTab === "ProjectsAccess" ? (
                <Suspense
                  fallback={<div>{t("General.LoadingProjectsAccess")}</div>}
                >
                  <ProjectAccess
                    ref={projectAccessRef}
                    selectedProject={selectedRow}
                    onAddFromLeft={handleAddClick}
                    onEditFromLeft={handleEditFromLeft}
                  />
                </Suspense>
              ) : (
                Component && (
                  <div className="mt-5 flex-grow overflow-y-auto">
                    <div style={{ minWidth: "600px" }}>
                      <Suspense fallback={<div>{t("General.Loading")}</div>}>
                        <Component
                          key={
                            isAdding
                              ? "add-mode"
                              : selectedRow
                              ? selectedRow.ID
                              : "no-selection"
                          }
                          selectedRow={isAdding ? null : selectedRow}
                          ref={getActiveRef()}
                          selectedCategoryType={selectedCategoryType}
                        />
                      </Suspense>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </UpdateAddressProvider>
  );
};

export default TabContent;
