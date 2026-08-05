// src/components/ProgramTemplate/ProgramTemplate.tsx
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import DynamicInput from "../../utilities/DynamicInput";
import ListSelector from "../../ListSelector/ListSelector";
import DynamicSelector from "../../utilities/DynamicSelector";
import TableSelector from "../../General/Configuration/TableSelector";
import { useApi } from "../../../context/ApiContext";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import {
  ProgramTemplateItem,
  Project,
  ProgramType,
} from "../../../services/api.services";
import DynamicConfirm from "../../utilities/DynamicConfirm";
import DynamicSwitcher from "../../utilities/DynamicSwitcher";
import AddColumnForm from "../../Forms/AddForm"; // برای انتخاب متادیتا
import { useTranslation } from "react-i18next";

// ================== Program Designer (سطح فعالیت‌ها / PFI) ==================
import Cookies from "js-cookie";
import SpeedIcon from "@mui/icons-material/Speed";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import CircularProgress from "@mui/material/CircularProgress";
import ProgramDesignerGrid, {
  PROGRAM_DESIGNER_TOGGLEABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMN_KEYS,
} from "../ProgramTemplate/ProgramDesignerGrid";
import AddEditProgramField from "../ProgramTemplate/AddEditProgramField";
import HealthCheckPanel from "../ProgramTemplate/Healthcheckpanel";
import { useProgramDesigner } from "../../../context/ProgramDesignerContext";
import {
  SinglePFI,
  ProgramValidationResult,
} from "../../../services/programDesigner/types";

/**
 * جایگزین امن برای crypto.randomUUID() — چون آن متد فقط توی Secure Context
 * (HTTPS یا localhost) کار می‌کند و روی سرورهای HTTP خطای
 * "crypto.randomUUID is not a function" می‌دهد. crypto.getRandomValues()
 * برخلاف randomUUID نیازی به Secure Context ندارد و همه‌جا کار می‌کند.
 */
function generateUUID(): string {
  console.log("🔍 [generateUUID] typeof crypto:", typeof crypto);
  console.log(
    "🔍 [generateUUID] typeof crypto.randomUUID:",
    typeof crypto !== "undefined"
      ? typeof (crypto as any).randomUUID
      : "crypto is undefined"
  );

  if (
    typeof crypto !== "undefined" &&
    typeof (crypto as any).randomUUID === "function"
  ) {
    try {
      const result = (crypto as any).randomUUID();
      console.log(
        "🔍 [generateUUID] used crypto.randomUUID(), result:",
        result
      );
      return result;
    } catch (err) {
      console.log("🔍 [generateUUID] crypto.randomUUID() threw:", err);
      // ادامه به fallback زیر
    }
  }

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    console.log("🔍 [generateUUID] falling back to crypto.getRandomValues()");
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
    const result = `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
      .slice(6, 8)
      .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
    console.log("🔍 [generateUUID] result:", result);
    return result;
  }

  // fallback خیلی نادر (مرورگرهای بسیار قدیمی که هیچ‌کدام از موارد بالا را ندارند)
  console.log("🔍 [generateUUID] falling back to Math.random()!!");
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/* ---------- types ---------- */
export interface ProgramTemplateHandle {
  save: () => Promise<boolean>;
}
interface ProgramTemplateProps {
  selectedRow: ProgramTemplateItem | null;
}

interface PfiSelectedRowInfo {
  ID: string;
  GPIC: string;
  ActivityType: string;
}

/* ===================================================================== */
/*                              COMPONENT                                */
/* ===================================================================== */
const ProgramTemplate = forwardRef<ProgramTemplateHandle, ProgramTemplateProps>(
  ({ selectedRow }, ref) => {
    const { t, i18n } = useTranslation();
    const api = useApi();

    /* ---------------- state اصلی ---------------- */
    const [programTemplateData, setProgramTemplateData] =
      useState<ProgramTemplateItem>({
        ID: selectedRow?.ID,
        ModifiedById: selectedRow?.ModifiedById,
        Name: selectedRow?.Name || "",
        MetaColumnName: selectedRow?.MetaColumnName || "",
        Duration: selectedRow?.Duration || "",
        nProgramTypeID: selectedRow?.nProgramTypeID || null,
        PCostAct: selectedRow?.PCostAct || 0, // Activity Budget
        PCostAprov: selectedRow?.PCostAprov || 0, // Af Budget
        IsGlobal: selectedRow?.IsGlobal ?? true,
        ProjectsStr: selectedRow?.ProjectsStr || "",
        IsVisible: selectedRow?.IsVisible ?? true,
        LastModified: selectedRow?.LastModified,
      });

    /* ---------------- state کمکی ---------------- */
    const [projectsData, setProjectsData] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);

    const [programTypes, setProgramTypes] = useState<ProgramType[]>([]);
    const [loadingProgramTypes, setLoadingProgramTypes] = useState(false);

    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
      programTemplateData.ProjectsStr
        ? programTemplateData.ProjectsStr.split("|").filter(Boolean)
        : []
    );
    const [selectedProgramTypeId, setSelectedProgramTypeId] = useState<string>(
      programTemplateData.nProgramTypeID
        ? String(programTemplateData.nProgramTypeID)
        : ""
    );

    const isEditMode = Boolean(selectedRow);

    /* ------------ متادیتا (لیست سلکتور) ------------ */
    const [metaValues, setMetaValues] = useState<
      { ID: string; Name: string }[]
    >([]);
    const [metaNames, setMetaNames] = useState<{ ID: string; Name: string }[]>(
      []
    );
    const [selectedMetaIds, setSelectedMetaIds] = useState<string[]>(
      programTemplateData.MetaColumnName
        ? programTemplateData.MetaColumnName.split("|").filter(Boolean)
        : []
    );
    const [loadingMeta, setLoadingMeta] = useState(false);

    /* ================================================================= */
    /*                             FETCHES                               */
    /* ================================================================= */
    /* --- projects --- */
    useEffect(() => {
      setLoadingProjects(true);
      api
        .getAllProject()
        .then(setProjectsData)
        .catch(() =>
          showAlert("error", null, "Error", "Failed to fetch projects.")
        )
        .finally(() => setLoadingProjects(false));
    }, [api]);

    /* --- program types --- */
    useEffect(() => {
      setLoadingProgramTypes(true);
      api
        .getAllProgramType()
        .then(setProgramTypes)
        .catch(() =>
          showAlert("error", null, "Error", "Failed to fetch program types.")
        )
        .finally(() => setLoadingProgramTypes(false));
    }, [api]);

    /* --- initialise meta selector --- */
    useEffect(() => {
      if (!programTemplateData.MetaColumnName) {
        setSelectedMetaIds([]);
        setMetaNames([]);
        return;
      }
      const ids = programTemplateData.MetaColumnName.split("|").filter(Boolean);
      setSelectedMetaIds(ids);
      setLoadingMeta(true);
      Promise.all(
        ids.map((id) =>
          api
            .getEntityFieldById(Number(id))
            .then((res) => ({
              ID: String(res.ID),
              Name: res.DisplayName || res.Name || "",
            }))
            .catch(() => null)
        )
      )
        .then((arr) => {
          const ok = (arr.filter(Boolean) || []) as {
            ID: string;
            Name: string;
          }[];
          setMetaValues(ok);
          setMetaNames(ok);
        })
        .finally(() => setLoadingMeta(false));
    }, [programTemplateData.MetaColumnName, api]);

    /* --- sync MetaColumnName on selection change --- */
    useEffect(() => {
      handleChange(
        "MetaColumnName",
        selectedMetaIds.length ? selectedMetaIds.join("|") + "|" : ""
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMetaIds]);

    /* ================================================================= */
    /*                           HELPERS / MAPPINGS                      */
    /* ================================================================= */
    const handleChange = (field: keyof ProgramTemplateItem, value: any) =>
      setProgramTemplateData((p) => ({ ...p, [field]: value }));

    const projectColumnDefs = [{ field: "Name", headerName: i18n.language === "fa" ? "نام پروژه" : "Project Name" }];
    const projectsListData = projectsData.map((p) => ({
      ID: p.ID,
      Name: p.ProjectName,
    }));
    const programTypeOptions = programTypes.map((t) => ({
      value: String(t.ID),
      label: t.Name,
    }));

    /* ================================================================= */
    /*                    Program Designer (فعالیت‌ها / PFI)             */
    /* ================================================================= */
    const {
      getSinglePFI,
      deleteOneProgramFieldTemplate,
      checkValidation,
      getExcelTemplate,
      downloadFile,
      uploadFile,
      insertFileRecord,
      importExcelTemplate,
      checkIsWaitingForEngine,
    } = useProgramDesigner();

    // ProgramTemplateID واقعی؛ فقط وقتی selectedRow (یعنی حالت Edit) وجود
    // دارد معتبر است — قبل از ذخیره‌ی اول Program Template، مدیریت
    // فعالیت‌ها (Program Designer) معنی ندارد.
    const programTemplateId = selectedRow?.ID
      ? Number(selectedRow.ID)
      : null;

    const [pfiWarningMessage, setPfiWarningMessage] = useState<string | null>(
      null
    );
    const [pfiSelectedRow, setPfiSelectedRow] =
      useState<PfiSelectedRowInfo | null>(null);
    const [pfiRefreshKey, setPfiRefreshKey] = useState(0);

    const [pfiModalOpen, setPfiModalOpen] = useState(false);
    const [pfiModalMode, setPfiModalMode] = useState<"add" | "edit">("add");
    const [pfiModalParentGPIC, setPfiModalParentGPIC] = useState<
      string | null
    >(null);
    const [pfiModalInitialData, setPfiModalInitialData] =
      useState<SinglePFI | null>(null);

    // ---- Delete Row ----
    const [showDeleteRowConfirm, setShowDeleteRowConfirm] = useState(false);
    const [isDeletingRow, setIsDeletingRow] = useState(false);

    // ---- Column Chooser ----
    const [isColumnChooserOpen, setIsColumnChooserOpen] = useState(false);
    const [visibleColumnKeys, setVisibleColumnKeys] = useState<Set<string>>(
      new Set(DEFAULT_VISIBLE_COLUMN_KEYS)
    );

    // ---- Health Check ----
    const [isHealthCheckOpen, setIsHealthCheckOpen] = useState(false);
    const [isLoadingHealthCheck, setIsLoadingHealthCheck] = useState(false);
    const [healthCheckResult, setHealthCheckResult] =
      useState<ProgramValidationResult | null>(null);
    const [healthCheckError, setHealthCheckError] = useState<string | null>(
      null
    );

    // ---- Export ----
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    // ---- Import ----
    const importInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isWaitingForEngine, setIsWaitingForEngine] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);

    const handlePfiRowSelect = (row: any) => {
      setPfiSelectedRow({
        ID: row.ID,
        GPIC: row.GPIC,
        ActivityType: row["Activity Type"],
      });
      setPfiWarningMessage(null);
    };

    const handleAddPfiRoot = () => {
      setPfiModalMode("add");
      setPfiModalParentGPIC(null);
      setPfiModalInitialData(null);
      setPfiModalOpen(true);
    };

    const handleAddPfiChildForInFPP = () => {
      if (!pfiSelectedRow) {
        setPfiWarningMessage(
          t("AddEditProgramField.Warnings.SelectInFPPRowFirst")
        );
        return;
      }
      if (pfiSelectedRow.ActivityType !== "InFPP") {
        setPfiWarningMessage(
          t("AddEditProgramField.Warnings.SelectedRowMustBeInFPP")
        );
        return;
      }
      setPfiWarningMessage(null);
      setPfiModalMode("add");
      setPfiModalParentGPIC(pfiSelectedRow.GPIC);
      setPfiModalInitialData(null);
      setPfiModalOpen(true);
    };

    const handlePfiRowDoubleClick = async (
      row: any,
      parentGPIC: string | null
    ) => {
      const fullData = await getSinglePFI(Number(row.ID));
      setPfiModalMode("edit");
      setPfiModalParentGPIC(parentGPIC);
      setPfiModalInitialData(fullData);
      setPfiModalOpen(true);
    };

    const handlePfiSaved = () => {
      setPfiRefreshKey((k) => k + 1);
    };

    const handleDeleteRowClick = () => {
      if (!pfiSelectedRow) {
        setPfiWarningMessage(t("AddEditProgramField.Warnings.SelectRowFirst"));
        return;
      }
      setPfiWarningMessage(null);
      setShowDeleteRowConfirm(true);
    };

    const handleConfirmDeleteRow = async () => {
      if (!pfiSelectedRow) {
        setShowDeleteRowConfirm(false);
        return;
      }
      setIsDeletingRow(true);
      try {
        await deleteOneProgramFieldTemplate(Number(pfiSelectedRow.ID));
        setPfiSelectedRow(null);
        setPfiRefreshKey((k) => k + 1);
        showAlert(
          "success",
          null,
          "Delete",
          "Row has been deleted successfully."
        );
      } catch (err: any) {
        console.error("Delete failed:", err);
        showAlert(
          "error",
          null,
          "Error",
          err?.response?.data?.toString() ||
            err?.message ||
            "خطا در حذف ردیف."
        );
      } finally {
        setIsDeletingRow(false);
        setShowDeleteRowConfirm(false);
      }
    };

    const handleToggleColumn = (key: string) => {
      setVisibleColumnKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    };

    const runHealthCheck = async () => {
      if (!programTemplateId) return;
      setIsLoadingHealthCheck(true);
      setHealthCheckError(null);
      try {
        const result = await checkValidation(programTemplateId);
        setHealthCheckResult(result);
      } catch (err) {
        console.error("Health check failed:", err);
        setHealthCheckError("خطا در دریافت اطلاعات سلامت برنامه.");
        setHealthCheckResult(null);
      } finally {
        setIsLoadingHealthCheck(false);
      }
    };

    const handleToggleHealthCheck = () => {
      if (isHealthCheckOpen) {
        setIsHealthCheckOpen(false);
        return;
      }
      setIsHealthCheckOpen(true);
      runHealthCheck();
    };

    const handleExport = async () => {
      if (!programTemplateId) return;
      setIsExporting(true);
      setExportError(null);
      try {
        const { FileName, FolderName } = await getExcelTemplate(
          programTemplateId
        );
        const blob = await downloadFile(FileName, FolderName);

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = FileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        showAlert(
          "success",
          null,
          "Export",
          "Export has completed successfully."
        );
      } catch (err) {
        console.error("Export failed:", err);
        setExportError("خطا در دریافت فایل خروجی اکسل.");
      } finally {
        setIsExporting(false);
      }
    };

    const handleImportButtonClick = () => {
      importInputRef.current?.click();
    };

    const waitForEngine = async () => {
      if (!programTemplateId) return;
      setIsWaitingForEngine(true);
      const maxAttempts = 40;
      try {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const isWaiting = await checkIsWaitingForEngine(programTemplateId);
          if (!isWaiting) return;
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        throw new Error(
          "پردازش موتور بیش از حد انتظار طول کشید. لطفاً بعداً گرید را رفرش کنید."
        );
      } finally {
        setIsWaitingForEngine(false);
      }
    };

    const handleImportFileSelected = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !programTemplateId) return;

      setIsImporting(true);
      setImportError(null);
      try {
        const uploadResult = await uploadFile(file);
        const fileIQ = uploadResult.fileIQ;

        const userId = Cookies.get("userId");
        if (!userId) {
          throw new Error(
            "شناسه‌ی کاربر (userId) یافت نشد. لطفاً دوباره وارد شوید."
          );
        }

        const insertResult = await insertFileRecord({
          FileIQ: fileIQ,
          FileName: file.name,
          FolderName: "prgdes",
          FileSize: file.size,
          FileType: file.name.substring(file.name.lastIndexOf(".")),
          ID: (() => {
            console.log("🔍 [handleImportFileSelected] calling generateUUID() now...");
            const generatedId = generateUUID();
            console.log("🔍 [handleImportFileSelected] generatedId:", generatedId);
            return generatedId;
          })(),
          IsVisible: true,
          LastModified: null,
          SenderID: userId,
        });

        const fileId = insertResult.ID;
        if (!fileId) {
          throw new Error("ID نهایی فایل از پاسخ Insert دریافت نشد.");
        }

        const postId = Cookies.get("userPostId");
        if (!postId) {
          throw new Error(
            "PostID کاربر یافت نشد (userPostId). لطفاً دوباره وارد شوید."
          );
        }

        const importResult = await importExcelTemplate({
          FileID: fileId,
          IsForceEdit: true,
          PostID: postId,
          ProgramID: programTemplateId,
        });

        // ⚠️ این endpoint همیشه HTTP 200 برمی‌گرداند، حتی وقتی شکست خورده
        // باشد (مثلاً Validation های InFPP). پس باید isSuccess را خودمان
        // چک کنیم؛ وگرنه شکست‌ها به‌اشتباه موفق تلقی می‌شوند.
        if (!importResult.isSuccess) {
          throw new Error(
            importResult.Msg || "Import ناموفق بود (isSuccess=false)."
          );
        }

        await waitForEngine();
        setPfiRefreshKey((k) => k + 1);

        showAlert(
          "success",
          null,
          "Import",
          "Import has completed successfully."
        );
      } catch (err: any) {
        console.error("Import failed:", err);
        const message =
          err?.response?.data?.toString() ||
          err?.message ||
          "خطا در وارد کردن فایل اکسل.";
        setImportError(message);
        showAlert("error", null, "Import Error", message);
      } finally {
        setIsImporting(false);
      }
    };

    const isBusyWithImport = isImporting || isWaitingForEngine;

    /* ================================================================= */
    /*                          SAVE (forwardRef)                        */
    /* ================================================================= */
    useImperativeHandle(ref, () => ({
      save: async () => {
        try {
          const body: ProgramTemplateItem = {
            ...programTemplateData,
            nProgramTypeID: selectedProgramTypeId
              ? parseInt(selectedProgramTypeId)
              : null,
            ProjectsStr: selectedProjectIds.length
              ? selectedProjectIds.join("|") + "|"
              : "",
          };
          if (selectedRow) await api.updateProgramTemplate(body);
          else await api.insertProgramTemplate(body);

          return true;
        } catch (err) {
          console.error(err);
          showAlert("error", null, "Error", "Failed to save program template.");
          return false;
        }
      },
    }));

    const toLocalNum = (val: any): string =>
      i18n.language === "fa"
        ? String(val ?? "").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])
        : String(val ?? "");

    const fromLocalNum = (val: string): number =>
      Number(val.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))));

    /* ================================================================= */
    /*                               UI                                  */
    /* ================================================================= */
    return (
      <>
        {/* ============================= فرم اصلی ============================= */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
          {/* ---------------- ستون چپ (ورودی‌ها) ---------------- */}
          <div className="flex flex-col gap-10">
            <DynamicInput
              name={t("ProgramTemplate.ProgramName")}
              type="text"
              value={programTemplateData.Name}
              placeholder="Enter program name"
              onChange={(e) => handleChange("Name", e.target.value)}
              required
            />

            <DynamicInput
              name={t("ProgramTemplate.Duration")}
              type="text"
              value={toLocalNum(programTemplateData.Duration)}
              placeholder="Enter duration"
              onChange={(e) => handleChange("Duration", fromLocalNum(e.target.value))}
              required
            />

            {/* Activity & Af budgets در یک ردیف */}
            <div className="grid grid-cols-2 gap-6">
              <DynamicInput
                name={t("ProgramTemplate.ActivityBudget")}
                type="text"
                value={toLocalNum(programTemplateData.PCostAct)}
                placeholder="Activity budget"
                onChange={(e) =>
                  handleChange("PCostAct", fromLocalNum(e.target.value))
                }
              />
              <DynamicInput
                name={t("ProgramTemplate.AfBudget")}
                type="text"
                value={toLocalNum(programTemplateData.PCostAprov)}
                placeholder="Af budget"
                onChange={(e) =>
                  handleChange("PCostAprov", fromLocalNum(e.target.value))
                }
              />
            </div>

            {/* نوع برنامه */}
            <DynamicSelector
              label={t("ProgramTemplate.Type")}
              options={programTypeOptions}
              selectedValue={selectedProgramTypeId}
              onChange={(e) => {
                setSelectedProgramTypeId(e.target.value);
                handleChange(
                  "nProgramTypeID",
                  e.target.value ? parseInt(e.target.value) : null
                );
              }}
              loading={loadingProgramTypes}
              showButton={false}
            />
          </div>

          {/* ---------------- ستون راست (لیست سلکتورها) ---------------- */}
          <div className="flex flex-col gap-10">
            {/* سوییچر گلوبال */}
            <DynamicSwitcher
              isChecked={programTemplateData.IsGlobal}
              onChange={() =>
                handleChange("IsGlobal", !programTemplateData.IsGlobal)
              }
              leftLabel={i18n.language === "fa" ? "عمومی" : "Global"}
              rightLabel=""
            />

            {/* Related projects */}
            <ListSelector
              title={t("ProgramTemplate.RelatedProjects")}
              columnDefs={projectColumnDefs}
              rowData={projectsListData}
              selectedIds={selectedProjectIds}
              onSelectionChange={(ids) => setSelectedProjectIds(ids.map(String))}
              showSwitcher
              isGlobal={programTemplateData.IsGlobal}
              onGlobalChange={(v) => handleChange("IsGlobal", v)}
              loading={loadingProjects}
              ModalContentComponent={TableSelector}
              modalContentProps={{
                columnDefs: projectColumnDefs,
                rowData: projectsListData,
                selectedRow: null,
                onRowDoubleClick: () => { },
                onRowClick: () => { },
                onSelectButtonClick: () => { },
                isSelectDisabled: true,
              }}
            />

            {/* Meta-data selector */}
            <ListSelector
              title={t("ProgramTemplate.MetaData")}
              columnDefs={[{ field: "Name", headerName: "Name" }]}
              rowData={metaNames.map((m) => ({ ID: m.ID, Name: m.Name }))}
              selectedIds={selectedMetaIds}
              onSelectionChange={(ids) => setSelectedMetaIds(ids.map(String))}
              showSwitcher={false}
              isGlobal={false}
              loading={loadingMeta}
              ModalContentComponent={AddColumnForm}
              modalContentProps={{
                onSave: (nf: { ID: number; Name: string }) => {
                  if (!nf) return;
                  const id = String(nf.ID);
                  if (!selectedMetaIds.includes(id))
                    setSelectedMetaIds((p) => [...p, id]);
                  if (!metaValues.find((x) => x.ID === id))
                    setMetaValues((p) => [...p, { ID: id, Name: nf.Name }]);
                },
                onSuccessAdd: (nf: { ID: number; Name: string }) => {
                  if (!nf) return;
                  const id = String(nf.ID);
                  if (!selectedMetaIds.includes(id))
                    setSelectedMetaIds((p) => [...p, id]);
                  if (!metaValues.find((x) => x.ID === id))
                    setMetaValues((p) => [...p, { ID: id, Name: nf.Name }]);
                },
                entityTypeId: null,
              }}
            />
          </div>
        </div>

        {/* ============================= Program Designer (فعالیت‌ها / PFI) ============================= */}
        {programTemplateId ? (
          <div className="mt-10">
            {/* نوار ابزار بالای جدول: [Import/Export - سمت چپ] [Add/Delete Row - وسط‌چین] [Health Check/Column Chooser - سمت راست] */}
            <div
              className="grid grid-cols-[auto_1fr_auto] items-center gap-2 mb-3"
              dir="ltr"
            >
              <div className="flex items-center gap-2 justify-self-start">
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportFileSelected}
                  style={{ display: "none" }}
                />

                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  title="Export Excel"
                  className="w-9 h-9 flex items-center justify-center rounded-full border bg-white text-purple-600 border-purple-300 hover:bg-purple-50 disabled:opacity-50 transition"
                >
                  {isExporting ? (
                    <CircularProgress size={16} />
                  ) : (
                    <CloudUploadIcon sx={{ fontSize: 20 }} />
                  )}
                </button>

                <button
                  onClick={handleImportButtonClick}
                  disabled={isBusyWithImport}
                  title="Import Excel"
                  className="w-9 h-9 flex items-center justify-center rounded-full border bg-white text-purple-600 border-purple-300 hover:bg-purple-50 disabled:opacity-50 transition"
                >
                  {isBusyWithImport ? (
                    <CircularProgress size={16} />
                  ) : (
                    <CloudDownloadIcon sx={{ fontSize: 20 }} />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 justify-center">
                <button
                  onClick={handleAddPfiChildForInFPP}
                  className="px-4 py-2 bg-pink-500 text-white text-sm rounded hover:bg-pink-600"
                >
                  + Add Row For InFPP
                </button>
                <button
                  onClick={handleAddPfiRoot}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                >
                  + Add Row
                </button>
                <button
                  onClick={handleDeleteRowClick}
                  disabled={!pfiSelectedRow}
                  title="حذف ردیف"
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                  Delete Row
                </button>
              </div>

              <div className="flex items-center gap-2 justify-self-end relative">
                <button
                  onClick={handleToggleHealthCheck}
                  title=""
                  className={`w-9 h-9 flex items-center justify-center rounded-full border transition ${
                    isHealthCheckOpen
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-purple-600 border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <SpeedIcon sx={{ fontSize: 20 }} />
                </button>

                <button
                  onClick={() => setIsColumnChooserOpen((o) => !o)}
                  title="انتخاب ستون‌ها"
                  className={`w-9 h-9 flex items-center justify-center rounded-full border transition ${
                    isColumnChooserOpen
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-purple-600 border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <ViewColumnIcon sx={{ fontSize: 20 }} />
                </button>

                {isColumnChooserOpen && (
                  <div
                    dir="rtl"
                    className="absolute top-11 right-0 z-20 w-64 max-h-80 overflow-y-auto bg-white border border-purple-200 rounded-lg shadow-lg p-3 space-y-1"
                  >
                    {PROGRAM_DESIGNER_TOGGLEABLE_COLUMNS.map((col) => (
                      <label
                        key={col.key as string}
                        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumnKeys.has(col.key as string)}
                          onChange={() =>
                            handleToggleColumn(col.key as string)
                          }
                          className="w-4 h-4 accent-purple-600"
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isWaitingForEngine && (
              <div className="mb-3 flex items-center justify-center gap-2 py-2 text-gray-500 text-sm">
                <CircularProgress size={16} />
                در حال پردازش فایل توسط موتور برنامه... لطفاً صبر کنید.
              </div>
            )}
            {importError && (
              <div className="mb-3 px-3 py-2 bg-red-50 border border-red-300 text-red-600 text-sm rounded">
                {importError}
              </div>
            )}
            {exportError && (
              <div className="mb-3 px-3 py-2 bg-red-50 border border-red-300 text-red-600 text-sm rounded">
                {exportError}
              </div>
            )}

            {isHealthCheckOpen &&
              (isLoadingHealthCheck ? (
                <div className="mb-3 flex items-center justify-center gap-2 py-4 text-gray-400 text-sm">
                  <CircularProgress size={16} />
                  در حال بررسی سلامت برنامه...
                </div>
              ) : healthCheckError ? (
                <div className="mb-3 px-3 py-2 bg-red-50 border border-red-300 text-red-600 text-sm rounded">
                  {healthCheckError}
                </div>
              ) : healthCheckResult ? (
                <HealthCheckPanel result={healthCheckResult} />
              ) : null)}

            {pfiWarningMessage && (
              <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-300 text-yellow-700 text-sm rounded">
                {pfiWarningMessage}
              </div>
            )}

            <ProgramDesignerGrid
              programTemplateId={programTemplateId}
              onRowSelect={handlePfiRowSelect}
              onRowDoubleClick={handlePfiRowDoubleClick}
              selectedRowId={pfiSelectedRow?.GPIC ?? null}
              refreshKey={pfiRefreshKey}
              visibleColumnKeys={visibleColumnKeys}
            />

            {pfiModalOpen && (
              <AddEditProgramField
                isOpen={pfiModalOpen}
                onClose={() => setPfiModalOpen(false)}
                mode={pfiModalMode}
                mainProgramId={programTemplateId}
                parentGPIC={pfiModalParentGPIC}
                initialData={pfiModalInitialData}
                onSaved={handlePfiSaved}
                isProgramGlobal={programTemplateData.IsGlobal}
                programProjectsStr={programTemplateData.ProjectsStr}
              />
            )}

            <DynamicConfirm
              isOpen={showDeleteRowConfirm}
              onConfirm={handleConfirmDeleteRow}
              onClose={() => setShowDeleteRowConfirm(false)}
              variant="delete"
              title="Delete Confirmation"
              message={
                isDeletingRow
                  ? "در حال حذف..."
                  : "آیا از حذف این ردیف مطمئن هستید؟"
              }
            />
          </div>
        ) : (
          <div className="mt-10 text-center text-gray-400 text-sm py-8 border border-dashed border-gray-200 rounded-lg">
            برای مدیریت فعالیت‌ها (Program Designer)، ابتدا Program Template را
            ذخیره کنید.
          </div>
        )}
      </>
    );
  }
);

export default ProgramTemplate;