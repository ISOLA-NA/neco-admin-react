// ApprovalFlowsTab.tsx
import React, { useState } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicModal from "../../utilities/DynamicModal";
import TableSelector from "../../General/Configuration/TableSelector";
import DataTable from "../../TableDynamic/DataTable";
import { subTabDataMapping, Role } from "../../TabHandler/tab/tabData";
import { FaPlus, FaTimes, FaEdit } from "react-icons/fa";
import BoxDeemed from "./BoxDeemed";
import BoxPredecessor from "./BoxPredecessor "; // اطمینان از مسیر صحیح
import ListSelector from "../../ListSelector/ListSelector"; // اصلاح مسیر وارد کردن
import ButtonComponent from "../../General/Configuration/ButtonComponent"; // وارد کردن کامپوننت ButtonComponent
import { v4 as uuidv4 } from "uuid";

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

const ApprovalFlowsTab: React.FC = () => {
  // سایر state‌ها
  const [acceptChecked, setAcceptChecked] = useState<boolean>(false);
  const [rejectChecked, setRejectChecked] = useState<boolean>(false);
  const [nameValue, setNameValue] = useState<string>("");
  const [minAcceptValue, setMinAcceptValue] = useState<string>("1");
  const [minRejectValue, setMinRejectValue] = useState<string>("1");
  const [actDurationValue, setActDurationValue] = useState<string>("1");
  const [orderValue, setOrderValue] = useState<string>("1");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [staticPostValue, setStaticPostValue] = useState<string>("");
  const [selectedStaticPost, setSelectedStaticPost] = useState<Role | null>(
    null
  );
  const [cost1, setCost1] = useState<string>("1");
  const [cost2, setCost2] = useState<string>("1");
  const [cost3, setCost3] = useState<string>("1");
  const [weight1, setWeight1] = useState<string>("1");
  const [weight2, setWeight2] = useState<string>("1");
  const [weight3, setWeight3] = useState<string>("1");
  const [vetoChecked, setVetoChecked] = useState<boolean>(false);
  const [requiredChecked, setRequiredChecked] = useState<boolean>(false);
  const [codeValue, setCodeValue] = useState<string>("1");
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  // State جدید برای Predecessors
  const [selectedPredecessors, setSelectedPredecessors] = useState<number[]>(
    []
  );

  // State برای Default Action Buttons (ListSelector)
  const [selectedDefaultBtnIds, setSelectedDefaultBtnIds] = useState<
    (string | number)[]
  >([]);

  // داده‌های نمونه برای buttonlist (Default Action Buttons)
  const buttons: ButtonListItem[] = Array.from({ length: 20 }, (_, index) => ({
    ID: index + 1,
    Name: `Button Item ${index + 1}`,
    Tooltip: `Tooltip for Button Item ${index + 1}`,
  }));

  // ستون‌های جدول
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
      sortable: true,
      filter: true,
      cellRendererFramework: (params: any) => (
        <input type="checkbox" checked={params.value} readOnly />
      ),
    },
    {
      headerName: "Veto",
      field: "veto",
      sortable: true,
      filter: true,
      cellRendererFramework: (params: any) => (
        <input type="checkbox" checked={params.value} readOnly />
      ),
    },
    { headerName: "Code", field: "code", sortable: true, filter: true },
  ];

  // گزینه‌های استاتیک پست
  const staticPostOptions = subTabDataMapping.Roles.rowData
    .filter((item: Role) => item.isStaticPost)
    .map((item: Role) => ({
      value: item.ID,
      label: item.Name,
    }));

  // مدیریت تغییر سلکتور استاتیک پست
  const handleStaticPostChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStaticPostValue(value);
    const selected = staticPostOptions.find((option) => option.value === value);
    if (selected) {
      setSelectedStaticPost(
        subTabDataMapping.Roles.rowData.find(
          (role) => role.ID === selected.value
        ) || null
      );
    } else {
      setSelectedStaticPost(null);
    }
  };

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

  const handleAddOrUpdateRow = () => {
    if (!staticPostValue) {
      alert("مقدار پست را انتخاب نکردید.");
      return;
    }

    if (selectedRow) {
      const updatedTableData = tableData.map((row) =>
        row.id === selectedRow.id
          ? {
              ...row,
              post: selectedStaticPost ? selectedStaticPost.Name : "",
              cost1: Number(cost1),
              cost2: Number(cost2),
              cost3: Number(cost3),
              weight1: Number(weight1),
              weight2: Number(weight2),
              weight3: Number(weight3),
              required: requiredChecked,
              veto: vetoChecked,
              code: Number(codeValue),
            }
          : row
      );
      setTableData(updatedTableData);
      setSelectedRow(null);
    } else {
      const newRow: TableRow = {
        id: uuidv4(),
        post: selectedStaticPost ? selectedStaticPost.Name : "",
        cost1: Number(cost1),
        cost2: Number(cost2),
        cost3: Number(cost3),
        weight1: Number(weight1),
        weight2: Number(weight2),
        weight3: Number(weight3),
        required: requiredChecked,
        veto: vetoChecked,
        code: Number(codeValue),
      };
      setTableData([...tableData, newRow]);
    }

    resetForm();
  };

  const handleDeleteRow = () => {
    if (selectedRow) {
      const updatedTableData = tableData.filter(
        (row) => row.id !== selectedRow.id
      );
      setTableData(updatedTableData);
      setSelectedRow(null);
      resetForm();
    } else {
      alert("هیچ ردیفی برای حذف انتخاب نشده است.");
    }
  };

  const handleDuplicateRow = () => {
    if (selectedRow) {
      const duplicatedRow: TableRow = {
        ...selectedRow,
        id: uuidv4(),
      };
      setTableData([...tableData, duplicatedRow]);
    } else {
      alert("هیچ ردیفی برای کپی انتخاب نشده است.");
    }
  };

  const handleSelectRow = (data: TableRow) => {
    setSelectedRow(data);
    setStaticPostValue(data.post);
    setSelectedStaticPost(
      subTabDataMapping.Roles.rowData.find((role) => role.Name === data.post) ||
        null
    );
    setCost1(data.cost1.toString());
    setCost2(data.cost2.toString());
    setCost3(data.cost3.toString());
    setWeight1(data.weight1.toString());
    setWeight2(data.weight2.toString());
    setWeight3(data.weight3.toString());
    setRequiredChecked(data.required);
    setVetoChecked(data.veto);
    setCodeValue(data.code.toString());
  };

  const resetForm = () => {
    setCost1("1");
    setCost2("1");
    setCost3("1");
    setWeight1("1");
    setWeight2("1");
    setWeight3("1");
    setRequiredChecked(false);
    setVetoChecked(false);
    setCodeValue("1");
    setStaticPostValue("");
    setSelectedStaticPost(null);
    setSelectedRow(null);
  };

  // Handler برای تغییرات ListSelector (Default Action Buttons)
  const handleSelectionChange = (
    type: string,
    selectedIds: (string | number)[]
  ) => {
    if (type === "DefaultBtn") {
      setSelectedDefaultBtnIds(selectedIds);
    }
    // می‌توانید برای انواع دیگر نیز شرط‌های مشابه اضافه کنید
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
              className="mt-6"
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
              className="mt-6"
            />
          </div>

          <div className="flex flex-col">
            <DynamicInput
              name="Order"
              type="number"
              value={orderValue}
              onChange={(e) => setOrderValue(e.target.value)}
              className="mt-6"
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
              <label className="text-sm text-gray-700 ">Static Post</label>
              <DynamicSelector
                options={staticPostOptions}
                selectedValue={staticPostValue}
                onChange={handleStaticPostChange}
                label=""
                showButton={true}
                onButtonClick={openModal}
                disabled={false}
                className="w-full"
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
                  className="w-full"
                />
              </div>

              <div className="flex flex-col flex-1">
                <DynamicInput
                  name="Weight3"
                  type="number"
                  value={weight3}
                  onChange={(e) => setWeight3(e.target.value)}
                  className="w-full "
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
                  className="w-full"
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
                className="w-full"
              />
            </div>

            <div className="flex flex-col flex-1">
              <DynamicInput
                name="Cost3"
                type="number"
                value={cost3}
                onChange={(e) => setCost3(e.target.value)}
                className="w-full "
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

        {/* باکس خاکستری جدید زیر جدول */}
        <BoxDeemed />
      </main>

      <aside className="w-64 bg-gray-100 p-4 border-l border-gray-300 overflow-auto space-y-4">
        {/* استفاده از کامپوننت BoxPredecessor */}
        <BoxPredecessor
          selectedPredecessors={selectedPredecessors}
          onSelectionChange={setSelectedPredecessors}
        />

        {/* ListSelector - Default Action Buttons */}
        <ListSelector
          title="Button"
          className="mt-7"
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
