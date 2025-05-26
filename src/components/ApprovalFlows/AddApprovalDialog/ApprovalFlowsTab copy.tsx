// ApprovalFlowsTab.tsx
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicModal from "../../utilities/DynamicModal";
import TableSelector from "../../General/Configuration/TableSelector";
import DataTable from "../../TableDynamic/DataTable";
import { FaPlus, FaTimes, FaEdit } from "react-icons/fa";
import BoxPredecessor from "./BoxPredecessor ";
import ListSelector from "../../ListSelector/ListSelector";
import ButtonComponent from "../../General/Configuration/ButtonComponent";
import { v4 as uuidv4 } from "uuid";
import { BoxTemplate, AFBtnItem } from "../../../services/api.services";
import { useApi } from "../../../context/ApiContext";
import DeemedSection from "./BoxDeemed";

// 🟢 react-toastify
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export interface Role {
  ID: string | number;
  Name: string;
  isStaticPost?: boolean;
}

export interface TableRow {
  id: string;
  nPostID: string;
  cost1: number;
  cost2: number;
  cost3: number;
  weight1: number;
  weight2: number;
  weight3: number;
  required: boolean;
  veto: boolean;
  code: number;
  originalID?: number;
}

export interface ApprovalFlowsTabData {
  nameValue: string;
  minAcceptValue: string;
  minRejectValue: string;
  actDurationValue: string;
  orderValue: string;
  acceptChecked: boolean;
  rejectChecked: boolean;
  tableData: TableRow[];
  selectedPredecessors: number[];
  selectedDefaultBtnIds: number[];
  deemDayValue: string;
  deemConditionValue: string;
  deemActionValue: string;
  previewsStateIdValue: string;
  goToPreviousStateIDValue: string;
  isStage: boolean;
  deemedEnabled: boolean;
  actionBtnID: number | null;
}

export interface ApprovalFlowsTabRef {
  getFormData: () => ApprovalFlowsTabData;
  validateMinFields: () => boolean;
}

interface ApprovalFlowsTabProps {
  editData?: BoxTemplate | null;
  boxTemplates?: BoxTemplate[];
}

const ApprovalFlowsTab = forwardRef<ApprovalFlowsTabRef, ApprovalFlowsTabProps>(
  ({ editData, boxTemplates = [] }, ref) => {
    const api = useApi();

    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [nameValue, setNameValue] = useState<string>("");
    const [minAcceptValue, setMinAcceptValue] = useState<string>("1");
    const [minRejectValue, setMinRejectValue] = useState<string>("");
    const [actDurationValue, setActDurationValue] = useState<string>("");
    const [orderValue, setOrderValue] = useState<string>("");
    const [acceptChecked, setAcceptChecked] = useState<boolean>(false);
    const [rejectChecked, setRejectChecked] = useState<boolean>(false);

    const [staticPostValue, setStaticPostValue] = useState<string>("");
    const [selectedStaticPost, setSelectedStaticPost] = useState<Role | null>(
      null
    );

    const [cost1, setCost1] = useState<string>("");
    const [cost2, setCost2] = useState<string>("");
    const [cost3, setCost3] = useState<string>("");

    const [weight1, setWeight1] = useState<string>("");
    const [weight2, setWeight2] = useState<string>("");
    const [weight3, setWeight3] = useState<string>("");

    const [vetoChecked, setVetoChecked] = useState<boolean>(false);
    const [requiredChecked, setRequiredChecked] = useState<boolean>(false);
    const [codeValue, setCodeValue] = useState<string>("");

    const [tableData, setTableData] = useState<TableRow[]>([]);
    const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
    const [selectedPredecessors, setSelectedPredecessors] = useState<number[]>(
      []
    );
    const [initialized, setInitialized] = useState<boolean>(false);

    const [btnList, setBtnList] = useState<AFBtnItem[]>([]);
    const [selectedDefaultBtnIds, setSelectedDefaultBtnIds] = useState<
      number[]
    >([]);

    const [deemDay, setDeemDay] = useState<number>(0);
    const [deemCondition, setDeemCondition] = useState<number>(0);
    const [deemAction, setDeemAction] = useState<number>(0);
    const [previewsStateId, setPreviewsStateId] = useState<number | null>(null);
    const [goToPreviousStateID, setGoToPreviousStateID] = useState<
      number | null
    >(null);

    const [isStage, setIsStage] = useState<boolean>(false);
    const [isDeemed, setIsDeemed] = useState<boolean>(true);

    const [actionBtnOptions, setActionBtnOptions] = useState<
      { value: number; label: string }[]
    >([]);
    const [actionBtnID, setActionBtnID] = useState<number | null>(null);
    const [approvalContextLoading, setApprovalContextLoading] =
      useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // 🔵 helpers
    const error = (msg: string) => toast.error(msg);
    const success = (msg: string) => toast.success(msg);

    /* ───────────────────────────── fetch roles ───────────────────────────── */
    useEffect(() => {
      const fetchRoles = async () => {
        try {
          const res = await api.getAllRoles();
          setAllRoles(Array.isArray(res) ? res : res.data || []);
        } catch (e) {
          console.error(e);
          error("خطا در دریافت نقش‌ها");
        }
      };
      fetchRoles();
    }, [api]);

    /* ───────────────────────────── fetch buttons ─────────────────────────── */
    useEffect(() => {
      const fetchButtons = async () => {
        try {
          const res = await api.getAllAfbtn();
          setBtnList(res);
        } catch (e) {
          console.error(e);
          error("خطا در دریافت دکمه‌ها");
        }
      };
      fetchButtons();
    }, [api]);

    /* ───────────────────────────── fetch configs ─────────────────────────── */
    useEffect(() => {
      const fetchConfigurations = async () => {
        try {
          const res = await api.getAllConfigurations();
          const options = res.map((conf: any) => ({
            value: conf.ID,
            label: conf.Name,
          }));
          setActionBtnOptions(options);
        } catch (e) {
          console.error(e);
          error("خطا در دریافت تنظیمات Action Button");
        }
      };
      fetchConfigurations();
    }, [api]);

    /* ───────────────────────────── table helpers ─────────────────────────── */
    const handleCellValueChanged = (params: any) => {
      const updatedRow: TableRow = {
        ...params.data,
        cost1: Number(params.data.cost1),
        cost2: Number(params.data.cost2),
        cost3: Number(params.data.cost3),
        weight1: Number(params.data.weight1),
        weight2: Number(params.data.weight2),
        weight3: Number(params.data.weight3),
        code: Number(params.data.code),
      };
      setTableData((rows) =>
        rows.map((r) => (r.id === updatedRow.id ? updatedRow : r))
      );
    };

    const handleCheckboxChange = (params: any, field: "required" | "veto") => {
      const newValue = !params.value;
      setTableData((rows) =>
        rows.map((r) =>
          r.id === params.data.id
            ? { ...r, [field]: newValue }
            : r
        )
      );
    };

    const columnDefs = [
      {
        headerName: "Post",
        field: "nPostID",
        sortable: true,
        filter: true,
        editable: false,
        valueGetter: (params: any) => {
          const role = allRoles.find(
            (r) => r.ID.toString() === params.data.nPostID
          );
          return role?.Name ?? "";
        },
      },
      { headerName: "Cost1", field: "cost1", sortable: true, editable: true },
      { headerName: "Cost2", field: "cost2", sortable: true, editable: true },
      { headerName: "Cost3", field: "cost3", sortable: true, editable: true },
      { headerName: "Weight1", field: "weight1", sortable: true, editable: true },
      { headerName: "Weight2", field: "weight2", sortable: true, editable: true },
      { headerName: "Weight3", field: "weight3", sortable: true, editable: true },
      {
        headerName: "Required",
        field: "required",
        editable: true,
        cellRendererFramework: (p: any) => (
          <input
            type="checkbox"
            checked={p.value}
            onChange={() => handleCheckboxChange(p, "required")}
          />
        ),
      },
      {
        headerName: "Veto",
        field: "veto",
        editable: true,
        cellRendererFramework: (p: any) => (
          <input
            type="checkbox"
            checked={p.value}
            onChange={() => handleCheckboxChange(p, "veto")}
          />
        ),
      },
      { headerName: "Code", field: "code", sortable: true, editable: true },
    ];

    const rolesColumnDefs = [
      { headerName: "Name", field: "Name", sortable: true, filter: true },
    ];

    /* ───────────────────────────── init on edit ─────────────────────────── */
    useEffect(() => {
      if (editData) {
        setNameValue(editData.Name || "");
        setActDurationValue(String(editData.MaxDuration ?? ""));
        setOrderValue(editData.Order ? editData.Order.toString() : "");
        setMinAcceptValue(
          editData.ActionMode ? editData.ActionMode.toString() : "1"
        );
        setMinRejectValue(
          editData.MinNumberForReject ? editData.MinNumberForReject.toString() : ""
        );
        setAcceptChecked(!!editData.ActionMode);
        setRejectChecked(!!editData.MinNumberForReject);
        setDeemDay(editData.DeemDay || 0);
        setDeemCondition(editData.DeemCondition || 0);
        setDeemAction(editData.DeemAction || 0);
        setPreviewsStateId(editData.PreviewsStateId ?? null);
        setGoToPreviousStateID(editData.GoToPreviousStateID ?? null);
        setActionBtnID(
          typeof editData.ActionBtnID === "number" ? editData.ActionBtnID : null
        );

        if (!initialized) {
          setSelectedPredecessors(
            editData.PredecessorStr
              ? editData.PredecessorStr.split("|").filter(Boolean).map(Number)
              : []
          );
          setSelectedDefaultBtnIds(
            editData.BtnIDs
              ? editData.BtnIDs.split("|").filter(Boolean).map(Number)
              : []
          );

          setApprovalContextLoading(true);
          api
            .getApprovalContextData(editData.ID)
            .then((d) =>
              setTableData(
                d.map((x) => ({
                  id: x.ID.toString(),
                  nPostID: x.nPostID,
                  cost1: x.PCost,
                  cost2: 0,
                  cost3: 0,
                  weight1: x.Weight,
                  weight2: 0,
                  weight3: 0,
                  required: x.IsRequired,
                  veto: x.IsVeto,
                  code: x.Code === "" ? 0 : Number(x.Code),
                  originalID: x.ID,
                }))
              )
            )
            .catch((err) => {
              console.error(err);
              error("خطا در دریافت Approval Context");
              setTableData([]);
            })
            .finally(() => setApprovalContextLoading(false));

          setInitialized(true);
        }

        // reset form values
        setCost1("");
        setCost2("");
        setCost3("");
        setWeight1("");
        setWeight2("");
        setWeight3("");
        setRequiredChecked(false);
        setVetoChecked(false);
        setCodeValue("");
        setStaticPostValue("");
        setSelectedStaticPost(null);
      } else {
        // new box
        setNameValue("");
        setMinAcceptValue("1");
        setMinRejectValue("");
        setActDurationValue("");
        setOrderValue("");
        setAcceptChecked(false);
        setRejectChecked(false);
        setCost1("");
        setCost2("");
        setCost3("");
        setWeight1("");
        setWeight2("");
        setWeight3("");
        setVetoChecked(false);
        setRequiredChecked(false);
        setCodeValue("");
        setStaticPostValue("");
        setSelectedStaticPost(null);
        setSelectedPredecessors([]);
        setSelectedDefaultBtnIds([]);
        setTableData([]);
        setSelectedRow(null);
        setInitialized(false);
        setDeemDay(0);
        setDeemCondition(0);
        setDeemAction(0);
        setPreviewsStateId(null);
        setGoToPreviousStateID(null);
        setActionBtnID(null);
      }
    }, [editData, initialized, api]);

    /* ───────────────────────────── helpers ──────────────────────────────── */
    const staticPostOptions = allRoles.map((r) => ({
      value: r.ID,
      label: r.Name,
    }));

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleRoleSelect = (data: Role) => {
      setSelectedStaticPost(data);
      setStaticPostValue(data.ID.toString());
      closeModal();
    };

    const validateMinFields = (): boolean => {
      if (!acceptChecked && !rejectChecked) {
        error("باید حداقل یکی از Min Accept یا Min Reject انتخاب شود.");
        return false;
      }
      if (acceptChecked && !isStage) {
        const val = parseInt(minAcceptValue, 10);
        if (!minAcceptValue || isNaN(val) || val === 0) {
          error("مقدار Min Accept نامعتبر است.");
          return false;
        }
      }
      if (rejectChecked) {
        const val = parseInt(minRejectValue, 10);
        if (!minRejectValue || isNaN(val) || val === 0) {
          error("مقدار Min Reject نامعتبر است.");
          return false;
        }
      }
      return true;
    };

    /* ───────────────────────────── CRUD rows ────────────────────────────── */
    const handleAddOrUpdateRow = () => {
      if (!staticPostValue) {
        error("Static Post خالی است!");
        return;
      }
      if (!validateMinFields()) return;

      if (selectedRow) {
        // update
        setTableData((rows) =>
          rows.map((r) =>
            r.id === selectedRow.id
              ? {
                ...r,
                nPostID: selectedStaticPost
                  ? selectedStaticPost.ID.toString()
                  : "",
                cost1: Number(cost1) || 0,
                cost2: Number(cost2) || 0,
                cost3: Number(cost3) || 0,
                weight1: Number(weight1) || 0,
                weight2: Number(weight2) || 0,
                weight3: Number(weight3) || 0,
                required: requiredChecked,
                veto: vetoChecked,
                code: Number(codeValue) || 0,
              }
              : r
          )
        );
        resetForm();
        success("سطر با موفقیت ویرایش شد");
      } else {
        // add new
        const newRow: TableRow = {
          id: uuidv4(),
          nPostID: selectedStaticPost ? selectedStaticPost.ID.toString() : "",
          cost1: Number(cost1) || 0,
          cost2: Number(cost2) || 0,
          cost3: Number(cost3) || 0,
          weight1: Number(weight1) || 0,
          weight2: Number(weight2) || 0,
          weight3: Number(weight3) || 0,
          required: requiredChecked,
          veto: vetoChecked,
          code: Number(codeValue) || 0,
        };
        setTableData([...tableData, newRow]);
        success("سطر جدید افزوده شد");
      }
    };

    const handleDeleteRow = () => {
      if (!selectedRow) {
        error("سطر انتخاب نشده است");
        return;
      }
      setTableData(tableData.filter((r) => r.id !== selectedRow.id));
      resetForm();
      success("سطر حذف شد");
    };

    const handleDuplicateRow = () => {
      if (!selectedRow) {
        error("سطر انتخاب نشده است");
        return;
      }
      setTableData([...tableData, { ...selectedRow, id: uuidv4() }]);
      success("سطر کپی شد");
    };

    const handleSelectRow = (d: TableRow) => {
      setSelectedRow(d);
      setStaticPostValue(d.nPostID);
      setSelectedStaticPost(allRoles.find((r) => r.ID.toString() === d.nPostID) ?? null);
      setCost1(String(d.cost1));
      setCost2(String(d.cost2));
      setCost3(String(d.cost3));
      setWeight1(String(d.weight1));
      setWeight2(String(d.weight2));
      setWeight3(String(d.weight3));
      setRequiredChecked(d.required);
      setVetoChecked(d.veto);
      setCodeValue(String(d.code));
    };

    const resetForm = () => {
      setStaticPostValue("");
      setSelectedStaticPost(null);
      setCost1("");
      setCost2("");
      setCost3("");
      setWeight1("");
      setWeight2("");
      setWeight3("");
      setRequiredChecked(false);
      setVetoChecked(false);
      setCodeValue("");
      setSelectedRow(null);
    };

    const handleSelectionChange = (
      type: string,
      ids: (string | number)[]
    ) => {
      if (type === "DefaultBtn") {
        setSelectedDefaultBtnIds(
          ids.map((x) => (typeof x === "string" ? parseInt(x, 10) : x))
        );
      }
    };

    /* ───────────────────────────── expose to parent ─────────────────────── */
    useImperativeHandle(ref, () => ({
      getFormData: () => ({
        nameValue,
        minAcceptValue,
        minRejectValue,
        actDurationValue,
        orderValue,
        acceptChecked,
        rejectChecked,
        tableData,
        selectedPredecessors,
        selectedDefaultBtnIds,
        deemDayValue: deemDay.toString(),
        deemConditionValue: deemCondition.toString(),
        deemActionValue: deemAction.toString(),
        previewsStateIdValue:
          previewsStateId !== null ? previewsStateId.toString() : "",
        goToPreviousStateIDValue:
          goToPreviousStateID !== null ? goToPreviousStateID.toString() : "",
        isStage,
        deemedEnabled: isDeemed,
        actionBtnID,
      }),
      validateMinFields: () => validateMinFields(),
    }));

    /* ───────────────────────────── JSX ──────────────────────────────────── */
    return (
      <>
       <div className="sticky top-0 right-0 z-[5000000] flex justify-end">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          limit={3}
        />
      </div>
      <div className="flex flex-col md:flex-row h-full relative">
        {/* Main */}
        <main className="flex-1 p-4 bg-white overflow-auto">
          {/* ───── form header ───── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 items-center">
            <DynamicInput
              name="Name"
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className="w-full"
            />

            {!isStage && (
              <div>
                <label className="flex items-center text-sm text-gray-700 mb-1">
                  <input
                    type="checkbox"
                    checked={acceptChecked}
                    onChange={(e) => setAcceptChecked(e.target.checked)}
                    className="h-4 w-4 mr-2"
                  />
                  Min Accept
                </label>
                <DynamicInput
                  name=""
                  type="number"
                  value={minAcceptValue}
                  onChange={(e) => setMinAcceptValue(e.target.value)}
                  disabled={!acceptChecked}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <label className="flex items-center text-sm text-gray-700 mb-1">
                <input
                  type="checkbox"
                  checked={rejectChecked}
                  onChange={(e) => setRejectChecked(e.target.checked)}
                  className="h-4 w-4 mr-2"
                />
                Min Reject
              </label>
              <DynamicInput
                name=""
                type="number"
                value={minRejectValue}
                onChange={(e) => setMinRejectValue(e.target.value)}
                disabled={!rejectChecked}
                className="w-full"
              />
            </div>

            <DynamicInput
              name="Act Duration"
              type="number"
              value={actDurationValue}
              onChange={(e) => setActDurationValue(e.target.value)}
              className="w-full"
            />
            <DynamicInput
              name="Order"
              type="number"
              value={orderValue}
              onChange={(e) => setOrderValue(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="mt-6">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isStage}
                onChange={(e) => setIsStage(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="ml-2">Is Stage</span>
            </label>
          </div>

          {/* Approval Context */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700">
                Approval Context:
              </span>
              <button
                type="button"
                onClick={handleAddOrUpdateRow}
                className="flex items-center bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors"
              >
                <FaPlus className="mr-2" /> Add
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Static Post */}
              <div>
                <label className="block text-sm text-gray-700">Static Post</label>
                <DynamicSelector
                  options={staticPostOptions}
                  selectedValue={staticPostValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStaticPostValue(val);
                    setSelectedStaticPost(
                      allRoles.find((r) => r.ID.toString() === val) ?? null
                    );
                  }}
                  label=""
                  showButton
                  onButtonClick={openModal}
                />
              </div>

              {/* Weights & Costs */}
              <div className="grid grid-cols-3 gap-2">
                {/* col 1 */}
                <div className="flex flex-col gap-1">
                  <DynamicInput
                    name="Weight1"
                    type="number"
                    value={weight1}
                    onChange={(e) => setWeight1(e.target.value)}
                  />
                  <DynamicInput
                    name="Cost1"
                    type="number"
                    value={cost1}
                    onChange={(e) => setCost1(e.target.value)}
                  />
                </div>
                {/* col 2 */}
                <div className="flex flex-col gap-1">
                  <DynamicInput
                    name="Weight2"
                    type="number"
                    value={weight2}
                    onChange={(e) => setWeight2(e.target.value)}
                  />
                  <DynamicInput
                    name="Cost2"
                    type="number"
                    value={cost2}
                    onChange={(e) => setCost2(e.target.value)}
                  />
                </div>
                {/* col 3 */}
                <div className="flex flex-col gap-1">
                  <DynamicInput
                    name="Weight3"
                    type="number"
                    value={weight3}
                    onChange={(e) => setWeight3(e.target.value)}
                  />
                  <DynamicInput
                    name="Cost3"
                    type="number"
                    value={cost3}
                    onChange={(e) => setCost3(e.target.value)}
                  />
                </div>
              </div>

              {/* Code / Veto / Required */}
              <div className="flex items-center justify-center mt-2 space-x-5">
                <div className="w-1/3">
                  <DynamicInput
                    name="Code"
                    type="number"
                    value={codeValue}
                    onChange={(e) => setCodeValue(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-5 mt-4">
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={vetoChecked}
                      onChange={(e) => setVetoChecked(e.target.checked)}
                      className="h-4 w-4 mr-1"
                    />
                    Veto
                  </label>
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={requiredChecked}
                      onChange={(e) => setRequiredChecked(e.target.checked)}
                      className="h-4 w-4 mr-1"
                    />
                    Required
                  </label>
                </div>
              </div>
            </div>

            {/* Table */}
            {!isStage && (
              <div className="mt-4 h-[33vh]">
                {approvalContextLoading ? (
                  <p className="text-center text-sm text-gray-600">
                    Loading Approval Context...
                  </p>
                ) : (
                  <DataTable
                    columnDefs={columnDefs}
                    rowData={tableData}
                    onCellValueChanged={handleCellValueChanged}
                    onRowDoubleClick={() => { }}
                    setSelectedRowData={() => { }}
                    showDuplicateIcon={false}
                    showEditIcon={false}
                    showAddIcon={false}
                    showDeleteIcon={false}
                    onAdd={() => { }}
                    onEdit={() => { }}
                    onDelete={() => { }}
                    onDuplicate={() => { }}
                    domLayout="normal"
                  />
                )}
              </div>
            )}
          </div>

          {/* Deemed */}
          <div className="mt-6">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isDeemed}
                onChange={(e) => setIsDeemed(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="ml-2">Deemed as Approved Or Reject</span>
            </label>
          </div>

          <DeemedSection
            deemDay={deemDay}
            setDeemDay={setDeemDay}
            deemCondition={deemCondition}
            setDeemCondition={setDeemCondition}
            deemAction={deemAction}
            setDeemAction={setDeemAction}
            previewsStateId={previewsStateId}
            setPreviewsStateId={setPreviewsStateId}
            goToPreviousStateID={goToPreviousStateID}
            setGoToPreviousStateID={setGoToPreviousStateID}
            boxTemplates={boxTemplates}
            disableMain={!isDeemed}
            showAdminSection={true}
            actionBtnOptions={actionBtnOptions}
            actionBtnID={actionBtnID}
            setActionBtnID={setActionBtnID}
          />
        </main>

        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-gray-100 p-4 border-t md:border-l border-gray-300 overflow-auto mt-4 md:mt-0">
          <BoxPredecessor
            boxTemplates={boxTemplates}
            selectedPredecessors={selectedPredecessors}
            onSelectionChange={setSelectedPredecessors}
            currentBoxId={editData ? editData.ID : 0}
          />
          <ListSelector
            title="Button"
            columnDefs={[
              { headerName: "Name", field: "Name" },
              { headerName: "Tooltip", field: "Tooltip" },
            ]}
            rowData={btnList}
            selectedIds={selectedDefaultBtnIds}
            onSelectionChange={(ids) => handleSelectionChange("DefaultBtn", ids)}
            showSwitcher={false}
            isGlobal={false}
            ModalContentComponent={ButtonComponent}
            modalContentProps={{
              columnDefs: [
                { headerName: "Name", field: "Name" },
                { headerName: "Tooltip", field: "Tooltip" },
              ],
              rowData: btnList,
              onRowDoubleClick: () => { },
              onRowClick: () => { },
              onSelectButtonClick: () => { },
              isSelectDisabled: false,
              onClose: () => { },
              onSelectFromButton: () => { },
            }}
          />
        </aside>

        {/* Static Post Modal */}
        <DynamicModal isOpen={isModalOpen} onClose={closeModal}>
          <TableSelector
            columnDefs={rolesColumnDefs}
            rowData={allRoles}
            onRowDoubleClick={handleRoleSelect}
            onRowClick={(d: Role) => setSelectedStaticPost(d)}
            onSelectButtonClick={() => {
              if (selectedStaticPost) {
                setStaticPostValue(selectedStaticPost.ID.toString());
                closeModal();
              } else {
                error("سطر انتخاب نشده است");
              }
            }}
            isSelectDisabled={!selectedStaticPost}
          />
        </DynamicModal>
      </div>
      </>
    );
  }
);

ApprovalFlowsTab.displayName = "ApprovalFlowsTab";
export default ApprovalFlowsTab;
