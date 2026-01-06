import React, {
  useState,
  useEffect,
  Suspense,
  useRef,
  MouseEvent,
  useCallback,
  FC,
  useMemo
  // 
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
// برای حالت خاصِ UpdateAddress
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
  onEdit: () => void; // در صورت نیاز از این پراپ استفاده کنید
  onDelete: () => void;
  onDuplicate: () => void;
  onRowClick: (data: any) => void;
  isPanelOpen: boolean; // این رو اضافه کن
  setIsPanelOpen: React.Dispatch<React.SetStateAction<boolean>>; // این رو هم اضافه کن
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
  const { i18n } = useTranslation();

  const api = useApi();
  const { t } = useTranslation();
  const { fetchDataForSubTab } = useSubTabDefinitions();
  const [panelWidth, setPanelWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRightMaximized, setIsRightMaximized] = useState(false);
  const isMaximized = panelWidth >= 97;

  // ریفرنس‌ها
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

  // انتخاب نوع Category در تب Categories
  const [selectedCategoryType, setSelectedCategoryType] = useState<
    "cata" | "catb"
  >("cata");

  // وضعیت تایید (حذف یا ویرایش)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVariant, setConfirmVariant] = useState<"delete" | "edit">(
    "delete"
  );
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => { });

  // وضعیت نمایش پنل راست
  // const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingSelectedRow, setPendingSelectedRow] = useState<any>(null);

  // وضعیت Loading جدول
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchedRowData, setFetchedRowData] = useState<any[]>([]);

  // ورودی‌های فرم (مثلاً در تب Ribbons)
  const [nameInput, setNameInput] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");

  const [resetSearchKey, setResetSearchKey] = useState(0);

  const [persianNameInput, setPersianNameInput] = useState<string>("");
  const [isFaMode, setIsFaMode] = useState(true); // false=EN(Name) | true=FA(PersianName)

  const [uaSelection, setUaSelection] = useState<{ gid?: string; id?: number; address?: string } | null>(null);



  // توابع تغییر اندازه‌ی پنل
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

  // منطق درگ کردن دستگیره میانی
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

  // واکشی داده‌ها
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let data;
      switch (activeSubTab) {
        case "Configurations":
          data = await api.getAllConfigurations();
          break;
        case "Commands":
          data = await api.getAllCommands();
          break;
        case "Ribbons":
          data = await api.getAllMenu();
          break;
        case "Users":
          data = await api.getAllUsers();
          break;
        case "Roles":
          data = await api.getAllRoles();
          break;
        case "Enterprises":
          data = await api.getAllCompanies();
          break;
        case "RoleGroups":
          data = await api.getAllPostCat();
          break;
        case "Staffing":
          // منطق مورد نظر برای لود Staffing
          // data = await api.getAllForPostAdmin();
          // break;
          data = await fetchDataForSubTab("Staffing");
          break;
        case "ProgramTemplate":
          data = await api.getAllProgramTemplates();
          break;
        case "ProgramTypes":
          data = await api.getAllProgramType();
          break;
        case "Projects":
          data = await api.getAllProjectsWithCalendar();
          break;
        case "Odp":
          data = await api.getAllOdpWithExtra();
          break;
        case "Procedures":
          data = await api.getAllEntityCollection();
          break;
        case "Calendars":
          data = await api.getAllCalendar();
          break;
        case "ProjectsAccess":
          data = await api.getAllProjectsWithCalendar();
          break;
        case "ApprovalFlows":
          data = await api.getAllWfTemplate();
          break;
        case "Forms":
          data = await api.getTableTransmittal();
          console.log("Data from getTableTransmittal: ", data);
          break;
        case "Categories":
          // مثال برای گرفتن دو نوع دیتای مختلف بر اساس selectedCategoryType
          if (selectedCategoryType === "cata") {
            data = await api.getAllCatA();
            console.log("Fetching CatA data:", data);
          } else {
            data = await api.getAllCatB();
            console.log("Fetching CatB data:", data);
          }
          break;
        default:
          data = rowData; // اگر هیچکدام از موارد بالا نبود، داده‌ی پیش‌فرض rowData
      }
      setFetchedRowData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert("error", null, "Error", "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [activeSubTab, selectedCategoryType]);

  const handleDuplicateClick = () => {
    const row = pendingSelectedRow || selectedRow;
    if (!row) {
      showAlert(
        "warning",
        null,
        "Warning",
        "Please select a row to duplicate."
      );
      return;
    }

    setConfirmVariant("edit"); // ظاهر دیالوگ
    setConfirmTitle(
      t("DynamicConfirm.Confirmations.Duplicate.Title") || "Duplicate"
    );
    setConfirmMessage(
      t("DynamicConfirm.Confirmations.Duplicate.Message") ||
      "Are you sure you want to duplicate this item?"
    );

    setConfirmAction(() => async () => {
      try {
        await duplicateForSubTab(activeSubTab, row);
        showAlert(
          "success",
          null,
          "",
          t("Alerts.Duplicated.Success") || "Item duplicated successfully."
        );
        await fetchData(); // ← همین تب را رفرش کن
      } catch (err) {
        console.error("Duplicate failed:", err);
        showAlert(
          "error",
          null,
          t("Alerts.Titles.Error"),
          t("Alerts.Duplicated.Failed") || "Failed to duplicate item."
        );
      }
    });

    setConfirmOpen(true);
  };

  // تغییر نوع Category
  const handleCategoryTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newType = e.target.value as "cata" | "catb";
    setSelectedCategoryType(newType);
    // if (activeSubTab === "Categories") {
    //   fetchData();
    // }
  };

  // هر زمان که activeSubTab تغییر کند، دوباره داده‌ها را می‌گیریم
  useEffect(() => {
    if (activeSubTab) {
      setIsAdding(true); // ← این خط را اضافه کن
      fetchData();
    }
  }, [activeSubTab, fetchData]);


  // متد درج (Save در حالت Adding)
  const handleInsert = async () => {
    try {
      switch (activeSubTab) {
        case "Configurations":
          if (configurationRef.current) {
            const result = await configurationRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.Configuration"));
          }
          break;
        case "Commands":
          if (commandRef.current) {
            const result = await commandRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.Command"));
          }
          break;
        case "Users":
          if (userRef.current) {
            const result = await userRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.User"));
          }
          break;
        case "Ribbons": {
          const nameTrim = (nameInput || "").trim();
          const pNameTrim = (persianNameInput || "").trim();

          // ✅ فقط اگر هر دو خالی بودن خطا بده
          if (!nameTrim && !pNameTrim) {
            showAlert("warning", null, "Warning", "Name یا PersianName را وارد کنید");
            return;
          }

          await api.insertMenu({
            Name: nameTrim || pNameTrim,      // ✅ اگر Name خالی بود از PersianName پر کن
            PersianName: pNameTrim || null,
            Description: descriptionInput,
            IsVisible: true,
          });

          showAlert("success", null, "", t("Alerts.Added.Ribbon"));
          break;
        }
        case "Roles":
          if (roleRef.current) {
            const result = await roleRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.Role"));
          }
          break;
        case "Enterprises":
          if (companyRef.current) {
            const result = await companyRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.Enterprise"));
          }
          break;
        case "RoleGroups":
          if (roleGroupsRef.current) {
            const result = await roleGroupsRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.RoleGroup"));
          }
          break;
        case "Staffing":
          if (staffingRef.current) {
            const ok = await staffingRef.current.save();
            console.log("📦 نتیجه save():", ok);
            if (!ok) return;
            showAlert("success", null, "", t("Alerts.Added.Staffing"));
            await fetchData();
          }
          break;

        case "ProgramTemplate":
          if (programTemplateRef.current) {
            const result = await programTemplateRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.Staffing"));
          }
          break;
        case "ProgramTypes":
          if (programTypeRef.current) {
            const result = await programTypeRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.ProgramType"));
          }
          break;
        case "Odp":
          if (odpRef.current) {
            const result = await odpRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.Odp"));
          }
          break;
        case "Procedures":
          if (procedureRef.current) {
            const result = await procedureRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.Procedure"));
          }
          break;
        case "Calendars":
          if (calendarRef.current) {
            const result = await calendarRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.Calendar"));
          }
          break;
        case "ProjectsAccess":
          if (projectAccessRef.current) {
            const result = await projectAccessRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.ProjectAccess"));
          }
          break;
        case "ApprovalFlows":
          if (approvalFlowRef.current) {
            const result = await approvalFlowRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.ApprovalFlow"));
          }
          break;
        case "Forms":
          if (formsRef.current) {
            const result = await formsRef.current.save();
            if (!result) return;
            showAlert("success", null, "", t("Alerts.Added.Form"));
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
            showAlert("success", null, "", t("Alerts.Added.Category"));
          }
          break;
        default:
          break;
      }

      await fetchData();
      setResetSearchKey(k => k + 1);

      // اگر Ribbons هستیم فرم سمت چپه، لازم نیست پنل راست رو ببندی
      if (activeSubTab !== "Ribbons") {
        setIsPanelOpen(false);
      }

      // ✅ برای Ribbons بعد از Add آماده Add بعدی بمون
      if (activeSubTab === "Ribbons") {
        setIsAdding(true);   // Save فعال بمونه
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
          // "خطایی در فرآیند ذخیره دستور رخ داده است.";
          "";
      showAlert("error", null, t("Alerts.Titles.Error"), message);
    }
  };

  useEffect(() => {
    if (activeSubTab === "Ribbons") {
      setIsFaMode(true); // ✅ پیشفرض EN => نمایش PersianName
      setNameInput("");
      setPersianNameInput("");
      setDescriptionInput("");
      setIsAdding(true); // ✅ آماده Add
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
            showAlert("success", null, "", t("Alerts.Updated.Configuration"));
            await fetchData();
          }
          break;
        case "Commands":
          if (commandRef.current) {
            await commandRef.current.save();
            showAlert("success", null, "", t("Alerts.Updated.Command"));
            await fetchData();
          }
          break;
        case "Users":
          if (userRef.current) {
            const result = await userRef.current.save();
            if (result) {
              showAlert("success", null, "", t("Alerts.Updated.User"));
              await fetchData();
            }
          }
          break;
        case "Ribbons":
          if (selectedRow) {
            const nameTrim = (nameInput || "").trim();
            const pNameTrim = (persianNameInput || "").trim();

            if (!nameTrim && !pNameTrim) {
              showAlert("warning", null, "Warning", "Name یا PersianName را وارد کنید");
              return;
            }

            await api.updateMenu({
              ID: selectedRow.ID,
              Name: nameTrim || pNameTrim,     // ✅ fallback
              PersianName: pNameTrim || null,
              Description: descriptionInput,
              IsVisible: selectedRow.IsVisible,
            });

            showAlert("success", null, "", t("Alerts.Updated.Ribbon"));
            await fetchData();
          }
          break;

        case "Roles":
          if (selectedRow && roleRef.current) {
            await roleRef.current.save();
            showAlert("success", null, "", t("Alerts.Updated.Role"));
            await fetchData();
          }
          break;
        case "Enterprises":
          if (selectedRow && companyRef.current) {
            await companyRef.current.save();
            showAlert("success", null, "", t("Alerts.Updated.Enterprise"));
            await fetchData();
          }
          break;
        case "RoleGroups":
          if (selectedRow && roleGroupsRef.current) {
            await roleGroupsRef.current.save();
            showAlert("success", null, "", t("Alerts.Updated.RoleGroup"));
            await fetchData();
          }
          break;
        case "Staffing":
          if (staffingRef.current) {
            const ok = await staffingRef.current.save();
            console.log("📦 نتیجه save():", ok);
            if (!ok) return;
            showAlert("success", null, "", t("Alerts.Updated.Staffing"));
            await fetchData();
          }
          break;

        case "ProgramTemplate":
          if (programTemplateRef.current) {
            await programTemplateRef.current.save();
            showAlert("success", null, "", t("Alerts.Updated.ProgramTemplate"));
            await fetchData();
          }
          break;
        case "ProgramTypes":
          if (programTypeRef.current) {
            await programTypeRef.current.save();
            showAlert("success", null, "", t("Alerts.Updated.ProgramType"));
            await fetchData();
          }
          break;
        case "Odp":
          if (odpRef.current) {
            await odpRef.current.save();
            showAlert("success", null, "", t("Alerts.Updated.Odp"));
            await fetchData();
          }
          break;
        case "Procedures":
          if (procedureRef.current) {
            await procedureRef.current.save();
            showAlert("success", null, "", t("Alerts.Updated.Procedure"));
            await fetchData();
          }
          break;
        case "Calendars":
          if (calendarRef.current) {
            await calendarRef.current.save();
            showAlert("success", null, "", t("Alerts.Updated.Calendar"));
            await fetchData();
          }
          break;
        case "ProjectsAccess":
          if (projectAccessRef.current) {
            await projectAccessRef.current.save();
            showAlert("success", null, "", t("Alerts.Updated.ProjectsAccess"));
            await fetchData();
          }
          break;
        case "ApprovalFlows":
          if (approvalFlowRef.current) {
            await approvalFlowRef.current.save();
            showAlert("success", null, "", t("Alerts.Updated.ApprovalFlow"));
            await fetchData();
          }
          break;
        case "Forms":
          if (formsRef.current) {
            await formsRef.current.save();
            showAlert("success", null, "", t("Alerts.Updated.Form"));
            await fetchData();
          }
          break;
        case "Categories":
          if (categoriesRef.current) {
            const result =
              selectedCategoryType === "cata"
                ? await api.updateCatA({
                  ...categoriesRef.current.getData(),
                  categoryType: selectedCategoryType,
                })
                : await api.updateCatB({
                  ...categoriesRef.current.getData(),
                  categoryType: selectedCategoryType,
                });
            showAlert("success", null, "", t("Alerts.Updated.Category"));
            await fetchData();
            setResetSearchKey(k => k + 1);
          }
          break;
      }
      setIsPanelOpen(false);

      // ✅ برای Ribbons بعد از Add آماده‌ی Add بعدی بمون
      if (activeSubTab === "Ribbons") {
        setIsAdding(true);   // Save فعال بمونه
      } else {
        setIsAdding(false);
      }

      resetInputs();

    } catch (error: any) {
      // console.error("Error updating:", error);
      // showAlert("error", null, "Error", "Failed to update data.");
      const data = error.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.value?.message ||
          data?.message ||
          "خطایی در فرآیند ذخیره دستور رخ داده است.";
      showAlert("error", null, "Error", message);
    }
  };

  // بستن پنل راست
  const handleClose = () => {
    setIsPanelOpen(false);
    setIsAdding(false);
    resetInputs();
  };

  // ریست کردن مقادیر ورودی (برای تب Ribbons نمونه)
  const resetInputs = () => {
    setNameInput("");
    setPersianNameInput("");
    setDescriptionInput("");
    setIsFaMode(true); // پیش‌فرض EN (نمایش PersianName)
  };

  // رویدادهای کلیک روی ردیف
  const handleDoubleClick = (data: any) => {
    onRowDoubleClick(data);
    setIsAdding(false);
    setIsPanelOpen(true);
    if (activeSubTab === "Ribbons") {
      setNameInput(data.Name);
      setDescriptionInput(data.Description);
    }
    if (activeSubTab === "ProjectsAccess") {
      setIsAdding(true); // فقط این تب
    } else {
      setIsAdding(false);
    }
  };

  // const handleRowClickLocal = (data: any) => {
  //   setPendingSelectedRow(data);
  //   onRowClick(data);
  //   if (activeSubTab === "Ribbons") {
  //     setNameInput(data.Name);
  //     setDescriptionInput(data.Description);
  //   }
  // };

  const handleRowClickLocal = (data: any) => {
    setPendingSelectedRow(data);
    onRowClick(data);

    if (activeSubTab === "Ribbons") {
      setNameInput(data.Name);
      setDescriptionInput(data.Description);
    }

    // تفاوت برای ProjectsAccess:
    if (activeSubTab === "ProjectsAccess") {
      setIsAdding(true); // Save فعال، Update غیرفعال
      setCanSave(true);
      setCanUpdate(false);
    } else {
      setIsAdding(false); // Save غیرفعال، Update فعال
      setCanSave(false);
      setCanUpdate(true);
    }

    setIsPanelOpen(true);
  };

  // یک تابع برای New
  // const handleNewClick = () => {
  //   resetInputs();
  //   setPendingSelectedRow(null);
  //   onRowClick(null);
  //   setIsAdding(true);
  //   setIsPanelOpen(true);
  //   // Save فعال، Update غیرفعال
  //   setCanSave(true);
  //   setCanUpdate(false);
  // };

  const handleNewClickRibbons = () => {
    setNameInput("");
    setDescriptionInput("");
  };

  // عملیات CRUD از دکمه‌های بالا یا داخل DataTable
  const handleAddClick = () => {
    setIsAdding(true);
    setIsPanelOpen(true);
    onAdd();
    resetInputs();
  };

  const handleDeleteClick = () => {
    if (!pendingSelectedRow) {
      showAlert("warning", null, "Warning", "Please select a row to delete.");
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
        // showAlert("success", null, "", `${activeSubTab} deleted successfully.`);
        showAlert(
          "success",
          null,
          "",
          `${activeSubTab} ${t("Alerts.Deleted.Deleted")}`
        );

        setIsPanelOpen(false);
        await fetchData();
      } catch (error) {
        console.error("Error deleting:", error);
        showAlert("error", null, "Error", "Failed to delete data.");
      }
    });
    setConfirmOpen(true);
  };


  useEffect(() => {
    if (activeSubTab === "UpdateAddress") setIsPanelOpen(true);
  }, [activeSubTab]);


  // تابع محلی برای Edit (بازکردن پنل راست در حالت ویرایش)
  const handleEditFromLeft = () => {
    setIsAdding(false);
    setIsPanelOpen(true);
  };

  // برای Confirm حذف/ویرایش
  const handleConfirm = async () => {
    setConfirmOpen(false);
    await confirmAction();
  };

  // برای فرم ساده‌ی تب Ribbons
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescriptionInput(e.target.value);
  };

  // انتخاب مرجع (ref) فعال بر اساس activeSubTab
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

  // ***************************
  // *******  منطق جدید  *******
  // ***************************
  // اگر در تب Ribbons هستیم، چک می‌کنیم که مقدار nameInput خالی نباشد.
  // در تب‌های دیگر، اگر تابعی با نام checkNameFilled وجود داشت، آن را چک می‌کنیم؛ در غیر اینصورت true می‌دهیم.
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
      typeof activeRef.current.checkNameFilled === "function"
    ) {
      return activeRef.current.checkNameFilled();
    }
    return true;
  };

  // اگر نام خالی بود، هشدار انگلیسی نمایش بده
  const showNameEmptyWarning = () => {
    showAlert("warning", null, "Warning", "Name cannot be empty");
  };

  const categoryOptions = useMemo(
    () => [
      { value: "cata", label: "Category A" },
      { value: "catb", label: "Category B" },
    ],
    []
  );


  return (
    <UpdateAddressProvider>

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden mt-2 border border-gray-300 rounded-lg mb-6 flex relative"
        style={{ height: "100%" }}
      >
        {/* Confirm برای حذف یا ویرایش */}
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
          {/* هدر کوچک پنل چپ */}
          <div className="flex items-center justify-between p-2 border-b border-gray-300 bg-gray-100 w-full">
            <div className="font-bold text-gray-700 text-sm"> </div>
            <button
              onClick={togglePanelSize}
              className="text-gray-700 hover:text-gray-900 transition"
              title={isMaximized ? "Minimize" : "Maximize"}
            >
              {isMaximized ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
            </button>
          </div>

          {/* سوییچر نوع Category فقط در تب Categories */}
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

          {/* محتوای اصلی پنل چپ */}
          <div className="h-full p-4 overflow-auto relative">
            {/* حالت ویژه: UpdateAddress — بدون جدول، فقط سلکت پروژه + درخت */}
            {activeSubTab === "UpdateAddress" ? (
              <UpdateAddressLeft onPick={(payload) => setUaSelection(payload)} />
            ) : (
              <>
                {/* فرم کامل Ribbons (بالا) */}
                {activeSubTab === "Ribbons" && (
                  <div className="mt-4 w-full p-4 bg-white rounded-md shadow-md">
                    {/* ورودی‌های فرم */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name / PersianName با سوئیچر حالت */}
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <DynamicInput
                            name={isFaMode ? t("Ribbons.Name") : t("Forms.PersianName")}
                            type="text"
                            value={isFaMode ? nameInput : persianNameInput}
                            placeholder={isFaMode ? t("Ribbons.Name") : t("Forms.PersianName")}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              if (isFaMode) setNameInput(e.target.value);
                              else setPersianNameInput(e.target.value);
                            }}
                          // ✅ required رو حذف کن تا ستاره نیاد
                          />
                        </div>

                        {/* دکمهٔ EN/FA */}
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
                              ? t("Forms.SwitchToEN", { field: t("Forms.PersianName") })
                              : t("Forms.SwitchToFA", { field: t("Forms.Name") })
                          }
                        >
                          {isFaMode ? "FA" : "EN"}
                        </button>
                      </div>

                      {/* Description */}
                      <DynamicInput
                        name={t("Ribbons.Description")}
                        type="text"
                        value={descriptionInput}
                        placeholder="Enter description"
                        onChange={handleDescriptionChange}
                      />
                    </div>

                    {/* اکشن‌های فرم */}
                    <div className="flex items-center gap-4 mt-6 justify-center">
                      <DynamicButton
                        text="Save"
                        leftIcon={<FaSave />}
                        onClick={handleInsert}
                        isDisabled={!isAdding}
                        variant="orgGreen"
                        size="md"
                      />
                      <DynamicButton
                        text="Update"
                        leftIcon={<FaEdit />}
                        onClick={handleUpdate}
                        isDisabled={!selectedRow}
                        variant="orgYellow"
                        size="md"
                      />
                      <DynamicButton
                        text="New"
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
                        text="Delete"
                        leftIcon={<FaTrash />}
                        onClick={handleDeleteClick}
                        isDisabled={!selectedRow}
                        variant="orgRed"
                        size="md"
                      />
                    </div>
                  </div>
                )}

                {/* جدول دیتا برای همهٔ تب‌ها (شامل Ribbons هم می‌تونه پایین فرم بیاد) */}
                {(() => {
                  const addPersianCol =
                    activeSubTab === "Ribbons" &&
                    Array.isArray(columnDefs) &&
                    !columnDefs.some((c: any) => c.field === "PersianName");

                  const cols = addPersianCol
                    ? [
                      ...columnDefs,
                      {
                        headerName: "PersianName",
                        field: "PersianName",
                        sortable: true,
                        filter: true,
                        resizable: true,
                      },
                    ]
                    : columnDefs;

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
                      showDuplicateIcon={showDuplicateIcon}
                      showEditIcon={false}
                      showAddIcon={showAddIcon}
                      showDeleteIcon={showDeleteIcon}
                      onEdit={handleEditFromLeft}
                      onAdd={handleAddClick}
                      onDelete={handleDeleteClick}
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


        {/* میله درگ کردن */}
        <div
          onMouseDown={startDragging}
          className="flex items-center justify-center cursor-ew-resize w-2"
          style={{ userSelect: "none", cursor: "col-resize", zIndex: 30 }}
        >
          <div className="h-full w-1 bg-[#dd4bae] rounded"></div>
        </div>
        {isPanelOpen && (
          <div
            className={`flex-1 transition-opacity duration-100 bg-gray-100 ${isMaximized ? "opacity-50 pointer-events-none" : "opacity-100"
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
              {/* PanelHeader را برای UpdateAddress و ProjectsAccess و Ribbons نشان نده */}
              {activeSubTab !== "Ribbons" &&
                activeSubTab !== "ProjectsAccess" &&
                activeSubTab !== "UpdateAddress" && (
                  <PanelHeader
                    isExpanded={false}
                    toggleExpand={() => { }}
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

              {/* محتوای پنل راست */}
              {activeSubTab === "UpdateAddress" ? (
                // فقط اینپوت تمام‌عرض + دکمه Edit
                <div className="mt-2 flex-grow overflow-y-auto">
                  <UpdateAddressRight />
                </div>
              ) : activeSubTab === "ProjectsAccess" ? (
                <Suspense fallback={<div>Loading Projects Access...</div>}>
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
                      <Suspense fallback={<div>Loading...</div>}>
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
