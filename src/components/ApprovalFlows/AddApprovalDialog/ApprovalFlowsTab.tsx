// ApprovalFlowsTab.tsx

import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicModal from "../../utilities/DynamicModal";
import TableSelector from "../../General/Configuration/TableSelector";
import DataTable from "../../TableDynamic/DataTable";
import { subTabDataMapping, Role } from "../../TabHandler/tab/tabData";
import { FaPlus, FaTimes, FaEdit } from "react-icons/fa";
import BoxDeemed from "./BoxDeemed";
import BoxPredecessor from "./BoxPredecessor ";
import ListSelector from "../../ListSelector/ListSelector";
import ButtonComponent from "../../General/Configuration/ButtonComponent";
import { v4 as uuidv4 } from "uuid";
import { BoxTemplate } from "../../../services/api.services";

interface TableRow {
  id: string;
  post: string;
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

interface ButtonListItem {
  ID: string | number;
  Name: string;
  Tooltip: string;
}

interface ApprovalFlowsTabProps {
  editData?: BoxTemplate | null; // باکسی که داریم ویرایش می‌کنیم
  boxTemplates?: BoxTemplate[]; // کل باکس‌ها
}

const ApprovalFlowsTab: React.FC<ApprovalFlowsTabProps> = ({
  editData,
  boxTemplates = [],
}) => {
  // -- فیلدهای بالای فرم --
  const [nameValue, setNameValue] = useState<string>("");
  const [minAcceptValue, setMinAcceptValue] = useState<string>("");
  const [minRejectValue, setMinRejectValue] = useState<string>("");
  const [actDurationValue, setActDurationValue] = useState<string>("");
  const [orderValue, setOrderValue] = useState<string>("");

  const [acceptChecked, setAcceptChecked] = useState<boolean>(false);
  const [rejectChecked, setRejectChecked] = useState<boolean>(false);

  // -- فیلدهای بخش Approval Context --
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

  // جدول سمت چپ
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  // -- Predecessors --
  // آرایه‌ای از IDهایی که کاربر تیک زده
  const [selectedPredecessors, setSelectedPredecessors] = useState<number[]>(
    []
  );

  // برای ListSelector دکمه‌ها
  const [selectedDefaultBtnIds, setSelectedDefaultBtnIds] = useState<
    (string | number)[]
  >([]);

  // داده نمونه
  const buttons: ButtonListItem[] = Array.from({ length: 5 }, (_, index) => ({
    ID: index + 1,
    Name: `Button Item ${index + 1}`,
    Tooltip: `Tooltip for Button Item ${index + 1}`,
  }));

  // ستون‌های جدول Approval Context
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

  // وقتی editData تغییر کرد (حالت Edit یا Add):
  useEffect(() => {
    if (editData) {
      // حالت ویرایش
      setNameValue(editData.Name || "");
      setActDurationValue(String(editData.MaxDuration || ""));
      setOrderValue(String(editData.Order || ""));

      // اگر PredecessorStr داشت، جدا کرده و در selectedPredecessors بریز
      if (editData.PredecessorStr) {
        const splittedIds = editData.PredecessorStr.split("|").filter(Boolean);
        const numericIds = splittedIds.map((id) => parseInt(id, 10));
        setSelectedPredecessors(numericIds);
      } else {
        setSelectedPredecessors([]);
      }

      // در صورت نیاز، فیلدهای دیگر را هم از editData پر کنید
      setMinAcceptValue("");
      setMinRejectValue("");
      setAcceptChecked(false);
      setRejectChecked(false);

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

      // اگر بخواهید tableData را هم از editData بگیرید، در اینجا انجام دهید
    } else {
      // حالت Add
      setNameValue("");
      setMinAcceptValue("");
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
      setTableData([]);
      setSelectedRow(null);
    }
  }, [editData]);

  // لیست نقش‌ها برای Static Post
  const staticPostOptions = subTabDataMapping.Roles.rowData
    .filter((item: Role) => item.isStaticPost)
    .map((item: Role) => ({
      value: item.ID,
      label: item.Name,
    }));

  // هندل تغییر سلکت Static Post
  const handleStaticPostChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStaticPostValue(value);
    const selected = staticPostOptions.find((option) => option.value === value);
    if (selected) {
      const foundRole = subTabDataMapping.Roles.rowData.find(
        (role) => role.ID === selected.value
      );
      setSelectedStaticPost(foundRole || null);
    } else {
      setSelectedStaticPost(null);
    }
  };

  // کنترل مودال انتخاب پست
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleRowSelect = (data: Role) => {
    setSelectedStaticPost(data);
    setStaticPostValue(data.ID);
    closeModal();
  };

  // افزودن/ویرایش سطر جدول سمت چپ
  const handleAddOrUpdateRow = () => {
    if (!staticPostValue) {
      alert("Static Post is empty!");
      return;
    }

    if (selectedRow) {
      // Edit
      const updated = tableData.map((r) =>
        r.id === selectedRow.id
          ? {
              ...r,
              post: selectedStaticPost ? selectedStaticPost.Name : "",
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
      // Add
      const newRow: TableRow = {
        id: uuidv4(),
        post: selectedStaticPost ? selectedStaticPost.Name : "",
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

  const handleSelectRow = (data: TableRow) => {
    setSelectedRow(data);
    setStaticPostValue(data.post);
    const foundRole = subTabDataMapping.Roles.rowData.find(
      (r) => r.Name === data.post
    );
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

  // تغییر انتخاب دکمه‌ها در ListSelector
  const handleSelectionChange = (
    type: string,
    selectedIds: (string | number)[]
  ) => {
    if (type === "DefaultBtn") {
      setSelectedDefaultBtnIds(selectedIds);
    }
  };

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

          <div className="flex flex-row gap-x-4 w-full items-center">
            <div className="flex flex-col flex-2 ">
              <label className="text-sm text-gray-700">Static Post</label>
              <DynamicSelector
                options={staticPostOptions}
                selectedValue={staticPostValue}
                onChange={handleStaticPostChange}
                label=""
                showButton={true}
                onButtonClick={openModal}
                disabled={false}
              />
            </div>

            <div className="flex flex-row gap-x-4 w-full mt-10 items-center">
              <div className="flex flex-col flex-1 ">
                <DynamicInput
                  name="Weight1"
                  type="number"
                  value={weight1}
                  onChange={(e) => setWeight1(e.target.value)}
                />
              </div>
              <div className="flex flex-col flex-1">
                <DynamicInput
                  name="Weight2"
                  type="number"
                  value={weight2}
                  onChange={(e) => setWeight2(e.target.value)}
                />
              </div>
              <div className="flex flex-col flex-1">
                <DynamicInput
                  name="Weight3"
                  type="number"
                  value={weight3}
                  onChange={(e) => setWeight3(e.target.value)}
                />
              </div>

              <div className="flex flex-col w-auto">
                <label className="flex items-center text-sm text-gray-700 mb-1">
                  <input
                    type="checkbox"
                    checked={vetoChecked}
                    onChange={(e) => setVetoChecked(e.target.checked)}
                    className="h-4 w-4 mr-2"
                  />
                  Veto
                </label>
              </div>

              <div className="flex flex-col flex-1">
                <DynamicInput
                  name="Code"
                  type="number"
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-x-4 w-full mt-4 items-center">
            <div className="flex flex-col flex-1 ">
              <DynamicInput
                name="Cost1"
                type="number"
                value={cost1}
                onChange={(e) => setCost1(e.target.value)}
              />
            </div>
            <div className="flex flex-col flex-1">
              <DynamicInput
                name="Cost2"
                type="number"
                value={cost2}
                onChange={(e) => setCost2(e.target.value)}
              />
            </div>
            <div className="flex flex-col flex-1">
              <DynamicInput
                name="Cost3"
                type="number"
                value={cost3}
                onChange={(e) => setCost3(e.target.value)}
              />
            </div>

            <div className="flex flex-col w-auto">
              <label className="flex items-center text-sm text-gray-700 mb-1">
                <input
                  type="checkbox"
                  checked={requiredChecked}
                  onChange={(e) => setRequiredChecked(e.target.checked)}
                  className="h-4 w-4 mr-2"
                />
                Required
              </label>
            </div>
          </div>
        </div>

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
          currentBoxId={editData ? editData.ID : 0} // برای فیلتر خود باکس
        />

        <ListSelector
          title="Button"
          columnDefs={[
            { headerName: "Name", field: "Name" },
            { headerName: "Tooltip", field: "Tooltip" },
          ]}
          rowData={buttons}
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
            rowData: buttons,
            onClose: closeModal,
            onRowSelect: handleRowSelect,
            onSelectFromButton: handleRowSelect,
          }}
        />
      </aside>

      <DynamicModal isOpen={isModalOpen} onClose={closeModal}>
        <TableSelector
          columnDefs={subTabDataMapping.Roles.columnDefs}
          rowData={subTabDataMapping.Roles.rowData}
          onRowDoubleClick={handleRowSelect}
          onRowClick={(data: Role) => setSelectedStaticPost(data)}
          onSelectButtonClick={() => {
            if (selectedStaticPost) {
              setStaticPostValue(selectedStaticPost.ID);
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
};

export default ApprovalFlowsTab;
