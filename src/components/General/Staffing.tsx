// Staffing.tsx

import { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicSelector from "../utilities/DynamicSelector";
import DynamicModal from "../utilities/DynamicModal";
import TableSelector from "../General/Configuration/TableSelector";
import DynamicSwitcher from "../utilities/DynamicSwitcher"; // Import DynamicSwitcher
import { subTabDataMapping } from "../Views/tab/tabData"; // مطمئن شوید مسیر صحیح است
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const Staffing = ({ selectedRow }: any) => {
  // تعریف props به عنوان any
  const [staffingData, setStaffingData] = useState({
    id: selectedRow?.ID?.toString() || "",
    Name: selectedRow?.Name || "",
    ProjectID: selectedRow?.nProjectID || "",
    OwnerID: selectedRow?.OwnerID || "",
    nPostTypeID: selectedRow?.nPostTypeID || "",
    nCompanyID: selectedRow?.nCompanyID || "",
    ParentId: selectedRow?.ParentId?.toString() || "",
    nMenuID: selectedRow?.nMenuID?.toString() || "",
    isAccessCreateProject: selectedRow?.isAccessCreateProject || false,
    isHaveAddressbar: selectedRow?.isHaveAddressbar || false,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<string | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  // دریافت داده‌های Projects، Users، Roles، Enterprises، Parents و Menu
  const projectList = subTabDataMapping.Projects?.rowData || [];
  const userList = subTabDataMapping.Users?.rowData || [];
  const roleList = subTabDataMapping.Roles?.rowData || [];
  const enterpriseList = subTabDataMapping.Enterprises?.rowData || [];
  const parentList = subTabDataMapping.Parents?.rowData || [];
  const menuListData = subTabDataMapping.Menu?.rowData || [];

  // Handle field updates
  const handleChange = (field: string, value: string) => {
    setStaffingData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle switch changes
  const handleSwitcherChange = (field: string) => {
    setStaffingData((prev: any) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Open modal for selector
  const handleOpenModal = (selector: string) => {
    // نوع پارامتر به string تغییر یافت
    setCurrentSelector(selector);
    setModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRowData(null);
    setCurrentSelector(null);
  };

  // Handle row selection in modal
  const handleRowClick = (rowData: any) => {
    setSelectedRowData(rowData);
  };

  // Confirm selection and update the field
  const handleSelectButtonClick = () => {
    if (selectedRowData && currentSelector) {
      handleChange(
        currentSelector,
        ["ProjectID", "nCompanyID", "ParentId", "nMenuID"].includes(
          currentSelector
        )
          ? selectedRowData.ID.toString()
          : selectedRowData.ID
      );
      handleCloseModal();
    }
  };

  useEffect(() => {
    setStaffingData({
      id: selectedRow?.ID?.toString() || "",
      Name: selectedRow?.Name || "",
      ProjectID: selectedRow?.nProjectID || "",
      OwnerID: selectedRow?.OwnerID || "",
      nPostTypeID: selectedRow?.nPostTypeID || "",
      nCompanyID: selectedRow?.nCompanyID?.toString() || "",
      ParentId: selectedRow?.ParentId?.toString() || "",
      nMenuID: selectedRow?.nMenuID?.toString() || "",
      isAccessCreateProject: selectedRow?.isAccessCreateProject || false,
      isHaveAddressbar: selectedRow?.isHaveAddressbar || false,
    });
  }, [selectedRow]);

  return (
    <div>
      <TwoColumnLayout>
        {/* Selector برای Project Name */}
        <DynamicSelector
          options={projectList.map((project: any) => ({
            value: project.ID.toString(),
            label: project.ProjectName,
          }))}
          selectedValue={staffingData.ProjectID}
          onChange={(e: any) => handleChange("ProjectID", e.target.value)}
          label="Project Name"
          showButton={true}
          onButtonClick={() => handleOpenModal("ProjectID")}
        />

        {/* Selector برای UserName */}
        <DynamicSelector
          options={userList.map((user: any) => ({
            value: user.ID,
            label: user.Name,
          }))}
          selectedValue={staffingData.OwnerID}
          onChange={(e: any) => handleChange("OwnerID", e.target.value)}
          label="User Name"
          showButton={true}
          onButtonClick={() => handleOpenModal("OwnerID")}
        />

        {/* Selector برای Roles Type */}
        <DynamicSelector
          options={roleList.map((role: any) => ({
            value: role.ID,
            label: role.Name,
          }))}
          selectedValue={staffingData.nPostTypeID}
          onChange={(e: any) => handleChange("nPostTypeID", e.target.value)}
          label="Roles Type"
          showButton={true}
          onButtonClick={() => handleOpenModal("nPostTypeID")}
        />

        {/* Selector برای Enterprises */}
        <DynamicSelector
          options={enterpriseList.map((enterprise: any) => ({
            value: enterprise.ID.toString(),
            label: enterprise.Name,
          }))}
          selectedValue={staffingData.nCompanyID}
          onChange={(e: any) => handleChange("nCompanyID", e.target.value)}
          label="Enterprise"
          showButton={true}
          onButtonClick={() => handleOpenModal("nCompanyID")}
        />

        {/* Selector برای Parent */}
        <DynamicSelector
          options={parentList.map((parent: any) => ({
            value: parent.ID.toString(),
            label: parent.Name,
          }))}
          selectedValue={staffingData.ParentId}
          onChange={(e: any) => handleChange("ParentId", e.target.value)}
          label="Parent"
          showButton={true}
          onButtonClick={() => handleOpenModal("ParentId")}
        />

        {/* Selector برای Menu */}
        <DynamicSelector
          options={menuListData.map((menu: any) => ({
            value: menu.ID.toString(),
            label: menu.Name,
          }))}
          selectedValue={staffingData.nMenuID}
          onChange={(e: any) => handleChange("nMenuID", e.target.value)}
          label="Menu"
          showButton={true}
          onButtonClick={() => handleOpenModal("nMenuID")}
        />

        {/* Switcher برای Access To Projects */}
        <DynamicSwitcher
          isChecked={staffingData.isAccessCreateProject}
          onChange={() => handleSwitcherChange("isAccessCreateProject")}
          leftLabel=""
          rightLabel="Access To Projects"
        />

        {/* Switcher برای Show Command Bar */}
        <DynamicSwitcher
          isChecked={staffingData.isHaveAddressbar}
          onChange={() => handleSwitcherChange("isHaveAddressbar")}
          leftLabel=""
          rightLabel="Show Command Bar"
        />
      </TwoColumnLayout>

      {/* Modal برای انتخاب Project، User، Role، Enterprise، Parent یا Menu */}
      <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
        {currentSelector === "ProjectID" ? (
          <TableSelector
            columnDefs={[
              { headerName: "Project Name", field: "ProjectName" },
              // می‌توانید ستون‌های دیگر پروژه‌ها را اضافه کنید در صورت نیاز
            ]}
            rowData={projectList}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        ) : currentSelector === "OwnerID" ? (
          <TableSelector
            columnDefs={[
              { headerName: "User Name", field: "Name" },
              // می‌توانید ستون‌های دیگر کاربران را اضافه کنید در صورت نیاز
            ]}
            rowData={userList}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        ) : currentSelector === "nPostTypeID" ? (
          <TableSelector
            columnDefs={[
              { headerName: "Role Name", field: "Name" },
              // می‌توانید ستون‌های دیگر نقش‌ها را اضافه کنید در صورت نیاز
            ]}
            rowData={roleList}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        ) : currentSelector === "nCompanyID" ? (
          <TableSelector
            columnDefs={[
              { headerName: "Enterprise Name", field: "Name" },
              // می‌توانید ستون‌های دیگر سازمان‌ها را اضافه کنید در صورت نیاز
            ]}
            rowData={enterpriseList}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        ) : currentSelector === "ParentId" ? (
          <TableSelector
            columnDefs={[
              { headerName: "Parent Name", field: "Name" },
              // می‌توانید ستون‌های دیگر والدین را اضافه کنید در صورت نیاز
            ]}
            rowData={parentList}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        ) : currentSelector === "nMenuID" ? (
          <TableSelector
            columnDefs={[
              { headerName: "Menu Name", field: "Name" },
              // می‌توانید ستون‌های دیگر منوها را اضافه کنید در صورت نیاز
            ]}
            rowData={menuListData}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        ) : null}
      </DynamicModal>
    </div>
  );
};

export default Staffing;
