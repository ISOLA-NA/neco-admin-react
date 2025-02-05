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
import { showAlert } from "../../utilities/Alert/DynamicAlert";

// تعریف اینترفیس Role
export interface Role {
  ID: string | number;
  Name: string;
  isStaticPost?: boolean;
}

// هر سطر جدول Approval Context
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

// داده‌هایی که از این تب بیرون می‌دهیم
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

    // stateهای فرم Approval Context
    const [nameValue, setNameValue] = useState<string>("");
    const [minAcceptValue, setMinAcceptValue] = useState<string>("");
    const [minRejectValue, setMinRejectValue] = useState<string>("");
    const [actDurationValue, setActDurationValue] = useState<string>("");
    const [orderValue, setOrderValue] = useState<string>("");

    // تغییر چک‌باکس‌ها: وقتی تیک خورده ورودی مربوطه اینیبل می‌شود
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

    // اضافه کردن state برای Action Button
    const [actionBtnOptions, setActionBtnOptions] = useState<
      { value: number; label: string }[]
    >([]);
    const [actionBtnID, setActionBtnID] = useState<number | null>(null);

    // state لودینگ برای Approval Context
    const [approvalContextLoading, setApprovalContextLoading] =
      useState<boolean>(false);

    useEffect(() => {
      const fetchRoles = async () => {
        try {
          const res = await api.getAllRoles();
          const roles = Array.isArray(res) ? res : res.data || [];
          setAllRoles(roles);
        } catch (error) {
          console.error("Error fetching roles:", error);
          showAlert(
            "error",
            null,
            "Error",
            "An error occurred while fetching roles"
          );
        }
      };
      fetchRoles();
    }, [api]);

    useEffect(() => {
      const fetchButtons = async () => {
        try {
          const res = await api.getAllAfbtn();
          setBtnList(res);
        } catch (error) {
          console.error("Error fetching buttons:", error);
          showAlert(
            "error",
            null,
            "Error",
            "An error occurred while fetching buttons"
          );
        }
      };
      fetchButtons();
    }, [api]);

    // دریافت تنظیمات برای Action Button
    useEffect(() => {
      const fetchConfigurations = async () => {
        try {
          const res = await api.getAllConfigurations();
          const options = res.map((conf: any) => ({
            value: conf.ID,
            label: conf.Name,
          }));
          setActionBtnOptions(options);
        } catch (error) {
          console.error("Error fetching configurations:", error);
          showAlert(
            "error",
            null,
            "Error",
            "An error occurred while fetching Action Button configurations"
          );
        }
      };
      fetchConfigurations();
    }, [api]);

    // ستون‌های جدول Approval Context با تغییر در valueGetter برای ستون "Post"
    const columnDefs = [
      {
        headerName: "Post",
        field: "nPostID",
        sortable: true,
        filter: true,
        valueGetter: (params: any) => {
          const role = allRoles.find(
            (r) => r.ID.toString() === params.data.nPostID
          );
          if (role && role.Name) {
            return role.Name;
          } else {
            if (
              params.data.cost1 ||
              params.data.weight1 ||
              params.data.cost2 ||
              params.data.weight2 ||
              params.data.cost3 ||
              params.data.weight3
            ) {
              return params.data.nPostID;
            }
            return "";
          }
        },
      },
      { headerName: "Cost1", field: "cost1", sortable: true, filter: true },
      { headerName: "Cost2", field: "cost2", sortable: true, filter: true },
      { headerName: "Cost3", field: "cost3", sortable: true, filter: true },
      { headerName: "Weight1", field: "weight1", sortable: true, filter: true },
      { headerName: "Weight2", field: "weight2", sortable: true, filter: true },
      { headerName: "Weight3", field: "weight3", sortable: true, filter: true },
      {
        headerName: "Required",
        field: "required",
        cellRendererFramework: (params: any) => (
          <input type="checkbox" checked={params.value} readOnly />
        ),
      },
      {
        headerName: "Veto",
        field: "veto",
        cellRendererFramework: (params: any) => (
          <input type="checkbox" checked={params.value} readOnly />
        ),
      },
      { headerName: "Code", field: "code", sortable: true, filter: true },
    ];

    const rolesColumnDefs = [
      { headerName: "ID", field: "ID", sortable: true, filter: true },
      { headerName: "Name", field: "Name", sortable: true, filter: true },
    ];

    useEffect(() => {
      if (editData) {
        setNameValue(editData.Name || "");
        setActDurationValue(String(editData.MaxDuration || ""));
        setOrderValue(editData.Order ? editData.Order.toString() : "");
        setMinAcceptValue(
          editData.ActionMode ? editData.ActionMode.toString() : ""
        );
        setMinRejectValue(
          editData.MinNumberForReject
            ? editData.MinNumberForReject.toString()
            : ""
        );
        // ست کردن وضعیت چک‌باکس‌ها در حالت ادیت
        setAcceptChecked(!!editData.ActionMode);
        setRejectChecked(!!editData.MinNumberForReject);

        setDeemDay(editData.DeemDay || 0);
        setDeemCondition(editData.DeemCondition || 0);
        setDeemAction(editData.DeemAction || 0);
        setPreviewsStateId(editData.PreviewsStateId || null);
        setGoToPreviousStateID(editData.GoToPreviousStateID || null);
        // رفع مشکل نمایش مقدار Action Button در حالت ویرایش:
        setActionBtnID(
          typeof editData.ActionBtnID === "number" ? editData.ActionBtnID : null
        );

        if (!initialized) {
          if (editData.PredecessorStr) {
            const splittedIds =
              editData.PredecessorStr.split("|").filter(Boolean);
            const numericIds = splittedIds.map((idStr) => parseInt(idStr, 10));
            setSelectedPredecessors(numericIds);
          } else {
            setSelectedPredecessors([]);
          }
          if (editData.BtnIDs) {
            const splittedBtnIds = editData.BtnIDs.split("|").filter(Boolean);
            const numericBtnIds = splittedBtnIds.map((x) => parseInt(x, 10));
            setSelectedDefaultBtnIds(numericBtnIds);
          } else {
            setSelectedDefaultBtnIds([]);
          }
          // دریافت داده‌های Approval Context از API جدید
          setApprovalContextLoading(true);
          api
            .getApprovalContextData(editData.ID)
            .then((approvalData) => {
              const mappedRows: TableRow[] = approvalData.map((item) => ({
                id: item.ID.toString(),
                nPostID: item.nPostID,
                cost1: item.PCost,
                cost2: 0,
                cost3: 0,
                weight1: item.Weight,
                weight2: 0,
                weight3: 0,
                required: item.IsRequired,
                veto: item.IsVeto,
                code: item.Code === "" ? 0 : Number(item.Code),
                originalID: item.ID,
              }));
              setTableData(mappedRows);
            })
            .catch((err) => {
              console.error("Error fetching approval context data:", err);
              showAlert(
                "error",
                null,
                "Error",
                "An error occurred while fetching approval context data"
              );
              setTableData([]);
            })
            .finally(() => {
              setApprovalContextLoading(false);
            });
          setInitialized(true);
        }

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

    const staticPostOptions = allRoles.map((role) => ({
      value: role.ID,
      label: role.Name,
    }));

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleRoleSelect = (data: Role) => {
      setSelectedStaticPost(data);
      setStaticPostValue(data.ID.toString());
      closeModal();
    };

    const validateMinFields = (): boolean => {
      if (!acceptChecked && !rejectChecked) {
        showAlert(
          "error",
          null,
          "Error",
          "Please select at least one of Min Accept or Min Reject and enter a valid value."
        );
        return false;
      }
      if (acceptChecked && !isStage) {
        const val = parseInt(minAcceptValue, 10);
        if (!minAcceptValue || isNaN(val) || val === 0) {
          showAlert(
            "error",
            null,
            "Error",
            "An error occurred while editing the item"
          );
          return false;
        }
      }
      if (rejectChecked) {
        const val = parseInt(minRejectValue, 10);
        if (!minRejectValue || isNaN(val) || val === 0) {
          showAlert(
            "error",
            null,
            "Error",
            "An error occurred while editing the item"
          );
          return false;
        }
      }
      return true;
    };

    const handleAddOrUpdateRow = () => {
      if (!staticPostValue) {
        showAlert("error", null, "Error", "Static Post is empty!");
        return;
      }
      if (!validateMinFields()) {
        return;
      }

      if (selectedRow) {
        const updated = tableData.map((r) =>
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
        );
        setTableData(updated);
        resetForm();
        showAlert("success", null, "Success", "Edited Successfully");
      } else {
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
        showAlert("success", null, "Success", "Added Successfully");
      }
    };

    const handleDeleteRow = () => {
      if (!selectedRow) {
        showAlert("error", null, "Error", "No row is selected.");
        return;
      }
      const filtered = tableData.filter((r) => r.id !== selectedRow.id);
      setTableData(filtered);
      resetForm();
      showAlert("success", null, "Success", "Deleted Successfully");
    };

    const handleDuplicateRow = () => {
      if (!selectedRow) {
        showAlert("error", null, "Error", "No row is selected for duplicate.");
        return;
      }
      const duplicated: TableRow = {
        ...selectedRow,
        id: uuidv4(),
      };
      setTableData([...tableData, duplicated]);
      showAlert("success", null, "Success", "Added Successfully");
    };

    const handleSelectRow = (data: TableRow) => {
      setSelectedRow(data);
      setStaticPostValue(data.nPostID);
      const foundRole = allRoles.find((r) => r.ID.toString() === data.nPostID);
      setSelectedStaticPost(foundRole || null);
      setCost1(String(data.cost1));
      setCost2(String(data.cost2));
      setCost3(String(data.cost3));
      setWeight1(String(data.weight1));
      setWeight2(String(data.weight2));
      setWeight3(String(data.weight3));
      setRequiredChecked(data.required);
      setVetoChecked(data.veto);
      setCodeValue(String(data.code));
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
      selectedIds: (string | number)[]
    ) => {
      if (type === "DefaultBtn") {
        const numericIds = selectedIds.map((x) =>
          typeof x === "string" ? parseInt(x, 10) : x
        );
        setSelectedDefaultBtnIds(numericIds as number[]);
      }
    };

    useImperativeHandle(ref, () => ({
      getFormData: () => {
        return {
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
        };
      },
      validateMinFields: () => validateMinFields(),
    }));

    return (
      <div className="flex flex-row h-full">
        <main className="flex-1 p-4 bg-white overflow-auto">
          <div className="flex flex-row gap-x-4 w-full mt-4 items-center">
            <div className="flex flex-col">
              <DynamicInput
                name="Name"
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
              />
            </div>
            {/* ورودی مربوط به Min Accept */}
            {!isStage && (
              <div className="flex flex-col">
                <label className="flex items-center text-sm text-gray-700 mb-1">
                  <input
                    type="checkbox"
                    checked={acceptChecked}
                    onChange={(e) => setAcceptChecked(e.target.checked)}
                    className="h-4 w-4 mr-2"
                  />
                  <span>Min Accept</span>
                </label>
                <DynamicInput
                  name=""
                  type="number"
                  value={minAcceptValue}
                  onChange={(e) => setMinAcceptValue(e.target.value)}
                  disabled={!acceptChecked}
                />
              </div>
            )}
            {/* ورودی مربوط به Min Reject */}
            <div className="flex flex-col">
              <label className="flex items-center text-sm text-gray-700 mb-1">
                <input
                  type="checkbox"
                  checked={rejectChecked}
                  onChange={(e) => setRejectChecked(e.target.checked)}
                  className="h-4 w-4 mr-2"
                />
                <span>Min Reject</span>
              </label>
              <DynamicInput
                name=""
                type="number"
                value={minRejectValue}
                onChange={(e) => setMinRejectValue(e.target.value)}
                disabled={!rejectChecked}
              />
            </div>
            <div className="flex flex-col">
              <DynamicInput
                name="Act Duration"
                type="number"
                value={actDurationValue}
                onChange={(e) => setActDurationValue(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <DynamicInput
                name="Order"
                type="number"
                value={orderValue}
                onChange={(e) => setOrderValue(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 mb-2">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isStage}
                onChange={(e) => setIsStage(e.target.checked)}
                className="h-4 w-4"
              />
              <span>Is Stage</span>
            </label>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700">
                Approval Context:
              </span>
              <div className="flex gap-x-2">
                <button
                  type="button"
                  className="flex items-center justify-center bg-green-500 text-white rounded-md p-2 hover:bg-green-600 transition-colors"
                  onClick={handleAddOrUpdateRow}
                >
                  {selectedRow ? (
                    <>
                      <FaEdit className="mr-2" />
                      Edit
                    </>
                  ) : (
                    <>
                      <FaPlus className="mr-2" />
                      Add
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center bg-red-500 text-white rounded-md p-2 hover:bg-red-600 transition-colors ${
                    !selectedRow ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleDeleteRow}
                  disabled={!selectedRow}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-700">Static Post</label>
                <DynamicSelector
                  options={staticPostOptions}
                  selectedValue={staticPostValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStaticPostValue(val);
                    const foundRole = allRoles.find(
                      (r) => r.ID.toString() === val
                    );
                    setSelectedStaticPost(foundRole || null);
                  }}
                  label=""
                  showButton={true}
                  onButtonClick={openModal}
                  disabled={false}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-24">
                  <DynamicInput
                    name="Weight1"
                    type="number"
                    value={weight1}
                    onChange={(e) => setWeight1(e.target.value)}
                    className="w-24"
                  />
                </div>
                <div className="w-24">
                  <DynamicInput
                    name="Weight2"
                    type="number"
                    value={weight2}
                    onChange={(e) => setWeight2(e.target.value)}
                    className="w-24"
                  />
                </div>
                <div className="w-24">
                  <DynamicInput
                    name="Weight3"
                    type="number"
                    value={weight3}
                    onChange={(e) => setWeight3(e.target.value)}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={vetoChecked}
                      onChange={(e) => setVetoChecked(e.target.checked)}
                      className="h-4 w-4 mr-1"
                    />
                    Veto
                  </label>
                </div>
                <div className="w-20">
                  <DynamicInput
                    name="Code"
                    type="number"
                    value={codeValue}
                    onChange={(e) => setCodeValue(e.target.value)}
                    className="w-20"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-24">
                  <DynamicInput
                    name="Cost1"
                    type="number"
                    value={cost1}
                    onChange={(e) => setCost1(e.target.value)}
                    className="w-24"
                  />
                </div>
                <div className="w-24">
                  <DynamicInput
                    name="Cost2"
                    type="number"
                    value={cost2}
                    onChange={(e) => setCost2(e.target.value)}
                    className="w-24"
                  />
                </div>
                <div className="w-24">
                  <DynamicInput
                    name="Cost3"
                    type="number"
                    value={cost3}
                    onChange={(e) => setCost3(e.target.value)}
                    className="w-24"
                  />
                </div>
                <div>
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
            {!isStage && (
              <div className="mt-4" style={{ height: "33vh" }}>
                {approvalContextLoading ? (
                  <p className="text-center text-sm text-gray-600">
                    Loading Approval Context...
                  </p>
                ) : (
                  <DataTable
                    columnDefs={columnDefs}
                    rowData={tableData}
                    onRowDoubleClick={(data) => {
                      handleSelectRow(data);
                    }}
                    setSelectedRowData={(data) => {
                      handleSelectRow(data);
                    }}
                    showDuplicateIcon={false}
                    showEditIcon={false}
                    showAddIcon={false}
                    showDeleteIcon={false}
                    onAdd={() => {}}
                    onEdit={() => {}}
                    onDelete={handleDeleteRow}
                    onDuplicate={handleDuplicateRow}
                    domLayout="normal"
                  />
                )}
              </div>
            )}
          </div>

          <div className="mt-6 mb-2">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isDeemed}
                onChange={(e) => setIsDeemed(e.target.checked)}
                className="h-4 w-4"
              />
              <span>Deemed as Approved Or Reject</span>
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

        <aside className="w-64 bg-gray-100 p-4 border-l border-gray-300 overflow-auto space-y-4">
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
            onSelectionChange={(selectedIds: (string | number)[]) =>
              handleSelectionChange("DefaultBtn", selectedIds)
            }
            showSwitcher={false}
            isGlobal={false}
            ModalContentComponent={ButtonComponent}
            modalContentProps={{
              columnDefs: [
                { headerName: "Name", field: "Name" },
                { headerName: "Tooltip", field: "Tooltip" },
              ],
              rowData: btnList,
              onRowDoubleClick: () => {},
              onRowClick: () => {},
              onSelectButtonClick: () => {},
              isSelectDisabled: false,
              onClose: () => {},
              onSelectFromButton: () => {},
            }}
          />
        </aside>

        <DynamicModal isOpen={isModalOpen} onClose={closeModal}>
          <TableSelector
            columnDefs={rolesColumnDefs}
            rowData={allRoles}
            onRowDoubleClick={handleRoleSelect}
            onRowClick={(data: Role) => setSelectedStaticPost(data)}
            onSelectButtonClick={() => {
              if (selectedStaticPost) {
                setStaticPostValue(selectedStaticPost.ID.toString());
                closeModal();
              } else {
                showAlert("error", null, "Error", "No row is selected.");
              }
            }}
            isSelectDisabled={!selectedStaticPost}
          />
        </DynamicModal>
      </div>
    );
  }
);

ApprovalFlowsTab.displayName = "ApprovalFlowsTab";
export default ApprovalFlowsTab;
