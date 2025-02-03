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
import BoxDeemed from "./BoxDeemed";
import BoxPredecessor from "./BoxPredecessor ";
import ListSelector from "../../ListSelector/ListSelector";
import ButtonComponent from "../../General/Configuration/ButtonComponent";
import { v4 as uuidv4 } from "uuid";
import { BoxTemplate, AFBtnItem } from "../../../services/api.services";
import { useApi } from "../../../context/ApiContext";

// تعریف اینترفیس Role (در صورت نیاز می‌توانید فیلدهای بیشتر اضافه کنید)
export interface Role {
  ID: string | number;
  Name: string;
  isStaticPost?: boolean;
  // سایر فیلدها در صورت نیاز
}

// هر سطر جدول Approval Context
export interface TableRow {
  id: string;
  post: string;
  postID: string;
  cost1: number;
  cost2: number;
  cost3: number;
  weight1: number;
  weight2: number;
  weight3: number;
  required: boolean;
  veto: boolean;
  code: number;
}

// داده‌هایی که از این تب بیرون می‌دهیم
export interface ApprovalFlowsTabData {
  nameValue: string;
  minAcceptValue: string; // مربوط به ActionMode
  minRejectValue: string; // مربوط به MinNumberForReject
  actDurationValue: string;
  orderValue: string;
  acceptChecked: boolean;
  rejectChecked: boolean;
  tableData: TableRow[];
  selectedPredecessors: number[];
  selectedDefaultBtnIds: number[]; // آی‌دی‌های انتخاب‌شده دکمه‌ها (اعدادی)
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

    // استیت مربوط به دریافت Roles از API
    const [allRoles, setAllRoles] = useState<Role[]>([]);

    // stateهای فرم
    const [nameValue, setNameValue] = useState<string>("");
    const [minAcceptValue, setMinAcceptValue] = useState<string>(""); // ActionMode
    const [minRejectValue, setMinRejectValue] = useState<string>(""); // MinNumberForReject
    const [actDurationValue, setActDurationValue] = useState<string>("");
    const [orderValue, setOrderValue] = useState<string>("");

    // چک‌باکس‌های مربوط به min
    const [acceptChecked, setAcceptChecked] = useState<boolean>(true); // پیش‌فرض true
    const [rejectChecked, setRejectChecked] = useState<boolean>(false);

    const [staticPostValue, setStaticPostValue] = useState<string>("");
    const [selectedStaticPost, setSelectedStaticPost] = useState<Role | null>(null);

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

    const [selectedPredecessors, setSelectedPredecessors] = useState<number[]>([]);
    const [initialized, setInitialized] = useState<boolean>(false);

    // state برای نگهداری لیست دکمه‌های واقعی دریافتی از سرور
    const [btnList, setBtnList] = useState<AFBtnItem[]>([]);
    // state برای نگهداری آی‌دی‌های انتخاب‌شده دکمه‌ها (اعدادی)
    const [selectedDefaultBtnIds, setSelectedDefaultBtnIds] = useState<number[]>([]);

    // دریافت لیست Roles از API
    useEffect(() => {
      const fetchRoles = async () => {
        try {
          const res = await api.getAllRoles();
          setAllRoles(res);
        } catch (error) {
          console.error("Error fetching roles:", error);
        }
      };
      fetchRoles();
    }, [api]);

    // دریافت لیست دکمه‌ها از API
    useEffect(() => {
      const fetchButtons = async () => {
        try {
          const res = await api.getAllAfbtn();
          setBtnList(res);
        } catch (error) {
          console.error("Error fetching buttons:", error);
        }
      };
      fetchButtons();
    }, [api]);

    const columnDefs = [
      { headerName: "Post", field: "post", sortable: true, filter: true },
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

    // ستون‌های جدول انتخاب پست (Roles)
    const rolesColumnDefs = [
      { headerName: "ID", field: "ID", sortable: true, filter: true },
      { headerName: "Name", field: "Name", sortable: true, filter: true },
    ];

    // مقداردهی اولیه (برای حالت ادیت یا افزودن)
    useEffect(() => {
      if (editData) {
        setNameValue(editData.Name || "");
        setActDurationValue(String(editData.MaxDuration || ""));
        setOrderValue(editData.Order ? editData.Order.toString() : "");
        setMinAcceptValue(
          editData.ActionMode ? editData.ActionMode.toString() : ""
        );
        setMinRejectValue(
          editData.MinNumberForReject ? editData.MinNumberForReject.toString() : ""
        );

        if (!initialized) {
          if (editData.PredecessorStr) {
            const splittedIds = editData.PredecessorStr.split("|").filter(Boolean);
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
          // اگر در editData اطلاعات Approval Flow موجود باشد
          if ((editData as any).WFApprovals && Array.isArray((editData as any).WFApprovals)) {
            setTableData((editData as any).WFApprovals);
          } else if ((editData as any).WFApproval && Array.isArray((editData as any).WFApproval)) {
            setTableData((editData as any).WFApproval);
          }
          setInitialized(true);
        }

        // خالی کردن فیلدهای افزودن/ویرایش ردیف (local)
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
        setMinAcceptValue("1"); // در حالت افزودن، پیش‌فرض 1
        setMinRejectValue("");
        setActDurationValue("");
        setOrderValue("");
        setAcceptChecked(true);
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
      }
    }, [editData, initialized]);

    // گزینه‌های مربوط به سلکت پست از لیست Roles دریافت‌شده از API
    const staticPostOptions = allRoles.map((role) => ({
      value: role.ID,
      label: role.Name,
    }));

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // انتخاب پست از داخل مودال TableSelector
    const handleRoleSelect = (data: Role) => {
      setSelectedStaticPost(data);
      setStaticPostValue(data.ID.toString());
      closeModal();
    };

    // اعتبارسنجی فیلدهای Min (برای Add و Edit)
    const validateMinFields = (): boolean => {
      if (!acceptChecked && !rejectChecked) {
        alert(
          "لطفاً حداقل یکی از گزینه‌های Min Accept یا Min Reject را انتخاب کرده و مقدار معتبر وارد نمایید."
        );
        return false;
      }
      if (acceptChecked) {
        const val = parseInt(minAcceptValue, 10);
        if (!minAcceptValue || isNaN(val) || val === 0) {
          alert("لطفاً مقدار معتبر برای Min Accept (ActionMode) وارد نمایید.");
          return false;
        }
      }
      if (rejectChecked) {
        const val = parseInt(minRejectValue, 10);
        if (!minRejectValue || isNaN(val) || val === 0) {
          alert("لطفاً مقدار معتبر برای Min Reject (MinNumberForReject) وارد نمایید.");
          return false;
        }
      }
      return true;
    };

    const handleAddOrUpdateRow = () => {
      if (!staticPostValue) {
        alert("Static Post is empty!");
        return;
      }
      if (!validateMinFields()) {
        return;
      }

      if (selectedRow) {
        // ویرایش ردیف انتخاب‌شده
        const updated = tableData.map((r) =>
          r.id === selectedRow.id
            ? {
                ...r,
                post: selectedStaticPost ? selectedStaticPost.Name : "",
                postID: selectedStaticPost
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
      } else {
        // افزودن ردیف جدید به جدول
        const newRow: TableRow = {
          id: uuidv4(),
          post: selectedStaticPost ? selectedStaticPost.Name : "",
          postID: selectedStaticPost ? selectedStaticPost.ID.toString() : "",
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
      }
    };

    const handleDeleteRow = () => {
      if (!selectedRow) {
        alert("No row is selected.");
        return;
      }
      const filtered = tableData.filter((r) => r.id !== selectedRow.id);
      setTableData(filtered);
      resetForm();
    };

    const handleDuplicateRow = () => {
      if (!selectedRow) {
        alert("No row is selected for duplicate.");
        return;
      }
      const duplicated: TableRow = {
        ...selectedRow,
        id: uuidv4(),
      };
      setTableData([...tableData, duplicated]);
    };

    // انتخاب ردیف از جدول Approval Context
    const handleSelectRow = (data: TableRow) => {
      setSelectedRow(data);
      setStaticPostValue(data.postID);
      const foundRole = allRoles.find((r) => r.ID.toString() === data.postID);
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
        };
      },
      validateMinFields: () => validateMinFields(),
    }));

    return (
      <div className="flex flex-row h-full">
        <main className="flex-1 p-4 bg-white overflow-auto">
          {/* ردیف اصلی: تمام اینپوت‌ها در یک خط */}
          <div className="flex flex-row gap-x-4 w-full mt-4 items-center">
            <div className="flex flex-col">
              <DynamicInput
                name="Name"
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
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
                disabled={acceptChecked}
              />
            </div>

            <div className="flex flex-col">
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
                disabled={rejectChecked}
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

          {/* ادامه فرم اصلی */}
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
              {/* سلکت پست */}
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
          </div>

          {/* جدول نمایش داده‌های وارد شده */}
          <div className="mt-4">
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
              showSearch={false}
              onAdd={() => {}}
              onEdit={() => {}}
              onDelete={handleDeleteRow}
              onDuplicate={handleDuplicateRow}
              domLayout="autoHeight"
            />
          </div>

          <BoxDeemed />
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
                alert("هیچ ردیفی انتخاب نشده است.");
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
