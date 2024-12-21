// src/components/FormsCommand1.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import DynamicSelector from "../utilities/DynamicSelector";
import ListSelector from "../ListSelector/ListSelector";
import DynamicModal from "../utilities/DynamicModal";
import TableSelector from "../General/Configuration/TableSelector";
import HandlerUplodeExcellAccess from "../utilities/HandlerUplodeExcellAccess";
import DataTable from "../TableDynamic/DataTable";
import AddColumnForm from "./AddForm"; // Updated import
import { subTabDataMapping, SubForm } from "../Views/tab/tabData"; // Importing data

// A simple checkbox component
const CheckBox = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  return (
    <div className="flex items-center space-x-2 mb-6">
      <input
        type="checkbox"
        className="form-checkbox h-4 w-4 text-purple-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        id={label}
      />
      <label htmlFor={label} className="text-gray-800 text-sm">
        {label}
      </label>
    </div>
  );
};

interface FormsCommand1Props {
  selectedRow: any; // Information of the selected row
}

// Sample data for categories
const aCategoryOptions = [
  { value: "1", label: "Category A1" },
  { value: "2", label: "Category A2" },
  { value: "3", label: "Category A3" },
];

const bCategoryOptions = [
  { value: "1", label: "Category B1" },
  { value: "2", label: "Category B2" },
  { value: "3", label: "Category B3" },
];

// Sample data for projects
const projectData = [
  { ID: "101", Name: "Project A" },
  { ID: "102", Name: "Project B" },
  { ID: "103", Name: "Project C" },
  // Add more projects as needed
];

// Function to extract project IDs from a string
const extractProjectIds = (projectsStr: string): string[] => {
  if (!projectsStr) return [];
  return projectsStr.split("|").filter(Boolean);
};

const FormsCommand1: React.FC<FormsCommand1Props> = ({ selectedRow }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State for the Add modal

  const [formData, setFormData] = useState<{
    ID: string | number;
    FormName: string;
    IsDoc: boolean;
    IsGlobal: boolean;
    ProjectsStr: string;
    EntityCateAName: string;
    EntityCateBName: string;
    Code: string;
  }>({
    ID: "",
    FormName: "",
    IsDoc: false,
    IsGlobal: false,
    ProjectsStr: "",
    EntityCateAName: "",
    EntityCateBName: "",
    Code: "",
  });

  const [subForms, setSubForms] = useState<SubForm[]>([]); // State for sub-forms

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        ID: selectedRow.ID || "",
        FormName: selectedRow.Name || "",
        IsDoc: selectedRow.IsDoc || false,
        IsGlobal: selectedRow.IsGlobal || false,
        ProjectsStr: selectedRow.ProjectsStr || "",
        EntityCateAName: selectedRow.EntityCateAName || "",
        EntityCateBName: selectedRow.EntityCateBName || "",
        Code: selectedRow.Code || "",
      });

      // Fetch sub-forms based on the selected ID
      const selectedID = selectedRow.ID;
      const fetchedSubForms =
        subTabDataMapping.Forms.subForms?.[selectedID] || [];
      setSubForms(fetchedSubForms);
    } else {
      setFormData({
        ID: "",
        FormName: "",
        IsDoc: false,
        IsGlobal: false,
        ProjectsStr: "",
        EntityCateAName: "",
        EntityCateBName: "",
        Code: "",
      });
      setSubForms([]); // Clear sub-forms
    }
  }, [selectedRow]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProjectSelectionChange = (selectedIds: (string | number)[]) => {
    const selectedIdsStr = selectedIds.map(String).join("|") + "|";
    handleChange("ProjectsStr", selectedIdsStr);
  };

  const handleGlobalChange = (val: boolean) => {
    handleChange("IsGlobal", val);
  };

  const handleACategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange("EntityCateAName", e.target.value);
  };

  const handleBCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange("EntityCateBName", e.target.value);
  };

  // State for category selection modals
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<"A" | "B" | null>(
    null
  );
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  const handleOpenModal = (selector: "A" | "B") => {
    setCurrentSelector(selector);
    setSelectedRowData(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentSelector(null);
    setSelectedRowData(null);
  };

  const handleRowClick = (row: any) => {
    setSelectedRowData(row);
  };

  const handleSelectButtonClick = () => {
    if (selectedRowData && currentSelector) {
      const field =
        currentSelector === "A" ? "EntityCateAName" : "EntityCateBName";
      handleChange(field, selectedRowData.label);
      handleCloseModal();
    }
  };

  const getRowData = (selector: "A" | "B" | null) => {
    if (selector === "A") {
      return aCategoryOptions.map((option) => ({
        value: option.value,
        label: option.label,
      }));
    } else if (selector === "B") {
      return bCategoryOptions.map((option) => ({
        value: option.value,
        label: option.label,
      }));
    }
    return [];
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false); // Close the Add modal
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true); // Open the Add modal
  };

  // Data for related details (updated to display sub-forms)
  const relatedDetailData = subForms.map((sub) => ({
    ID: sub.SubID,
    FormName: sub.Name,
    Description: sub.Description,
    Status: sub.Status,
    CreatedDate: sub.CreatedDate,
  }));

  // Manage Word and Excel file uploads
  const [, setWordFile] = useState<File | null>(null);
  const [, setExcelFile] = useState<File | null>(null);

  const handleWordUpload = (file: File) => {
    setWordFile(file);
    console.log("Word file selected:", file);
  };

  const handleExcelUpload = (file: File) => {
    setExcelFile(file);
    console.log("Excel file selected:", file);
  };

  return (
    <div>
      <TwoColumnLayout>
        {/* Main Form */}
        <TwoColumnLayout.Item span={1}>
          <DynamicInput
            name="Form Name"
            type="text"
            value={formData.FormName}
            placeholder=""
            onChange={(e) => handleChange("FormName", e.target.value)}
            required={true}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicInput
            name="Code"
            type="text"
            value={formData.Code}
            placeholder=""
            onChange={(e) => handleChange("Code", e.target.value)}
            required={true}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSelector
            options={aCategoryOptions}
            selectedValue={formData.EntityCateAName}
            onChange={handleACategoryChange}
            label="Category A"
            showButton={true}
            onButtonClick={() => handleOpenModal("A")}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSelector
            options={bCategoryOptions}
            selectedValue={formData.EntityCateBName}
            onChange={handleBCategoryChange}
            label="Category B"
            showButton={true}
            onButtonClick={() => handleOpenModal("B")}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <CheckBox
            label="Is Document"
            checked={formData.IsDoc}
            onChange={(val) => handleChange("IsDoc", val)}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <CheckBox
            label="Is Global"
            checked={formData.IsGlobal}
            onChange={handleGlobalChange}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={2}>
          <ListSelector
            title="Related Projects"
            columnDefs={[{ field: "Name", headerName: "Project Name" }]}
            rowData={projectData}
            selectedIds={extractProjectIds(formData.ProjectsStr)}
            onSelectionChange={handleProjectSelectionChange}
            showSwitcher={true}
            isGlobal={formData.IsGlobal}
            onGlobalChange={handleGlobalChange}
            className="-mt-5"
            ModalContentComponent={TableSelector}
            modalContentProps={{
              columnDefs: [{ field: "Name", headerName: "Project Name" }],
              rowData: projectData,
              selectedRow: selectedRowData,
              onRowDoubleClick: () => {
                if (selectedRowData) {
                  const newSelection = [
                    ...extractProjectIds(formData.ProjectsStr),
                    selectedRowData.ID,
                  ];
                  handleProjectSelectionChange(newSelection);
                }
              },
              onRowClick: handleRowClick,
              onSelectButtonClick: handleSelectButtonClick,
              isSelectDisabled: !selectedRowData,
            }}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={2}>
          <HandlerUplodeExcellAccess
            onWordUpload={handleWordUpload}
            onExcelUpload={handleExcelUpload}
          />
        </TwoColumnLayout.Item>

        {/* Details Section using DataTable */}
        <TwoColumnLayout.Item span={2}>
          <div className="-mt-4">
            <DataTable
              columnDefs={[
                {
                  headerName: "Sub ID",
                  field: "ID",
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: "Name",
                  field: "FormName",
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: "Description",
                  field: "Description",
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: "Status",
                  field: "Status",
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: "Created Date",
                  field: "CreatedDate",
                  sortable: true,
                  filter: true,
                },
              ]}
              rowData={relatedDetailData}
              onRowDoubleClick={() => {
                /* Custom action for double-click */
              }}
              setSelectedRowData={() => {
                /* Manage row selection if needed */
              }}
              showDuplicateIcon={false}
              showEditIcon={true}
              showAddIcon={true} // Enable Add button
              showDeleteIcon={true}
              onAdd={handleAddClick} // Connect to the function to open the modal
              onEdit={() => {
                /* Edit function */
                console.log("Edit clicked");
              }}
              onDelete={() => {
                /* Delete function */
                console.log("Delete clicked");
              }}
              onDuplicate={() => {
                /* Duplicate function */
                console.log("Duplicate clicked");
              }}
              domLayout="autoHeight"
              isRowSelected={false} // Modify based on your needs
              showSearch={true} // Enable search in details
            />
          </div>
        </TwoColumnLayout.Item>
      </TwoColumnLayout>

      {/* Dynamic Modal for Category Selection */}
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

      {/* Dynamic Modal for Adding a New Column */}
      <DynamicModal isOpen={isAddModalOpen} onClose={handleAddModalClose}>
        <AddColumnForm onClose={handleAddModalClose} />
      </DynamicModal>
    </div>
  );
};

export default FormsCommand1;
