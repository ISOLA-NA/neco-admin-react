import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle
} from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicSelector from "../utilities/DynamicSelector";
import DynamicModal from "../utilities/DynamicModal";
import TableSelector from "../General/Configuration/TableSelector";
import { Role, useApi } from "../../context/ApiContext";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import DynamicSwitcher from "../utilities/DynamicSwitcher";
import { showAlert } from "../utilities/Alert/DynamicAlert";

interface StaffingData {
  id: string;
  Name: string;
  ProjectID: string;
  OwnerID: string;
  nPostTypeID: string;
  nCompanyID: string;
  ParentId: string;
  nMenuID: string;
  isAccessCreateProject: boolean;
  isHaveAddressbar: boolean;
  isStaticPost: boolean;
}

export interface StaffingHandle {
  save: () => Promise<void>;
}

interface StaffingProps {
  selectedRow: any;
}

const Staffing = forwardRef<StaffingHandle, StaffingProps>((props, ref) => {
  const { selectedRow } = props;
  const api = useApi();
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);

  const [staffingData, setStaffingData] = useState<StaffingData>({
    id: selectedRow?.ID || "",
    Name: selectedRow?.Name || "",
    ProjectID: selectedRow?.nProjectID || "",
    OwnerID: selectedRow?.OwnerID || "",
    nPostTypeID: selectedRow?.nPostTypeID || "",
    nCompanyID: selectedRow?.nCompanyID || "",
    ParentId: selectedRow?.ParentId || "",
    nMenuID: selectedRow?.nMenuID || "",
    isAccessCreateProject: selectedRow?.isAccessCreateProject || false,
    isHaveAddressbar: selectedRow?.isHaveAddressbar || false,
    isStaticPost: selectedRow?.isStaticPost || false
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<string | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [isProjectNameDisabled, setIsProjectNameDisabled] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          projectsData,
          usersData,
          rolesData,
          companiesData,
          menusData
        ] = await Promise.all([
          api.getAllProject(),
          api.getAllUsers(),
          api.getAllRoles(),
          api.getAllCompanies(),
          api.getAllMenu()
        ]);

        setProjects(projectsData);
        setUsers(usersData);
        setRoles(rolesData);
        setCompanies(companiesData);
        setMenus(menusData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [api]);

  useEffect(() => {
    if (selectedRow) {
      setStaffingData({
        id: selectedRow.ID || "",
        Name: selectedRow.Name || "",
        ProjectID: selectedRow.nProjectID || "",
        OwnerID: selectedRow.OwnerID || "",
        nPostTypeID: selectedRow.nPostTypeID || "",
        nCompanyID: selectedRow.nCompanyID || "",
        ParentId: selectedRow.ParentId || "",
        nMenuID: selectedRow.nMenuID || "",
        isAccessCreateProject: selectedRow.isAccessCreateProject || false,
        isHaveAddressbar: selectedRow.isHaveAddressbar || false,
        isStaticPost: selectedRow.isStaticPost || false
      });

      if (selectedRow.nPostTypeID) {
        const selectedRole = roles.find(role => role.ID === selectedRow.nPostTypeID);
        const isStatic = selectedRole?.isStaticPost || false;
        setIsProjectNameDisabled(isStatic);
      }
    }
  }, [selectedRow, roles]);

  const save = async (): Promise<void> => {
    console.log("Save function called");
    // بررسی اعتبارسنجی برای سمت داینامیک و پروژه
    if (staffingData.nPostTypeID) {
      const selectedRole = roles.find(role => role.ID === staffingData.nPostTypeID);
      console.log("Selected Role:", selectedRole);
      if (selectedRole && !selectedRole.isStaticPost && !staffingData.ProjectID) {
        showAlert(
          'warning',
          null,
          'هشدار',
          'سمت داینامیک انتخاب شده است، لطفا یک پروژه انتخاب کنید'
        );
        console.log("Validation failed: Missing ProjectID for dynamic role");
        throw new Error('Validation failed: Missing ProjectID for dynamic role');
      }
    }

    try {
      console.log("Proceeding to save data");
      if (staffingData.id) {
        const roleData: Role = {
          ID: staffingData.id,
          Name: staffingData.Name,
          IsVisible: true,
          LastModified: new Date().toISOString(),
          CreateDate: new Date().toISOString(),
          Authorization: null,
          Competencies: null,
          Description: null,
          Grade: null,
          PostCode: null,
          Responsibility: null,
          Type: null,
          OwnerID: staffingData.OwnerID || null,
          ParrentId: staffingData.ParentId || null,
          isAccessCreateProject: staffingData.isAccessCreateProject,
          isHaveAddressbar: staffingData.isHaveAddressbar,
          isStaticPost: staffingData.isStaticPost,
          nCompanyID: staffingData.nCompanyID || null,
          nMenuID: staffingData.nMenuID || null,
          nPostTypeID: staffingData.nPostTypeID || null,
          nProjectID: staffingData.ProjectID || null,
          status: 1
        };
        await api.updateRole(roleData);
        console.log("Role updated successfully");
      } else {
        const roleData: Role = {
          ID: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          Name: staffingData.Name,
          IsVisible: true,
          LastModified: new Date().toISOString(),
          ModifiedById: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          Authorization: "",
          Competencies: "",
          Description: "",
          Grade: "",
          PostCode: "",
          Responsibility: "",
          Type: null,
          isAccessCreateProject: staffingData.isAccessCreateProject,
          isHaveAddressbar: staffingData.isHaveAddressbar,
          isStaticPost: staffingData.isStaticPost,
          OwnerID: staffingData.OwnerID || null,
          ParrentId: staffingData.ParentId || null,
          nCompanyID: staffingData.nCompanyID || null,
          nMenuID: staffingData.nMenuID || null,
          nPostTypeID: staffingData.nPostTypeID || null,
          nProjectID: staffingData.ProjectID || null,
          status: 1
        };
        await api.updateRole(roleData);
        console.log("Role inserted successfully");
      }
      showAlert('success', null, 'موفقیت', 'اطلاعات با موفقیت ذخیره شد');
    } catch (error) {
      console.error("Error in staffing save:", error);
      showAlert('error', null, 'خطا', 'خطا در ذخیره سازی اطلاعات');
      throw error;
    }
  };

  useImperativeHandle(ref, () => ({
    save
  }));

  const handleChange = (field: keyof StaffingData, value: string) => {
    setStaffingData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === "nPostTypeID") {
      const selectedRole = roles.find(role => role.ID === value);
      const isStatic = selectedRole?.isStaticPost || false;
      setIsProjectNameDisabled(isStatic);

      if (isStatic) {
        setStaffingData(prev => ({
          ...prev,
          ProjectID: ""
        }));
      }
    }
  };

  const handleSwitcherChange = (
    field: keyof Pick<StaffingData, "isAccessCreateProject" | "isHaveAddressbar">
  ) => {
    setStaffingData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleOpenModal = (selector: string) => {
    setCurrentSelector(selector);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRowData(null);
    setCurrentSelector(null);
  };

  const handleRowClick = (rowData: any) => {
    setSelectedRowData(rowData);
  };

  const handleSelectButtonClick = () => {
    if (selectedRowData && currentSelector) {
      const field = currentSelector as keyof StaffingData;
      handleChange(field, selectedRowData.ID.toString());
      handleCloseModal();
    }
  };

  return (
    <div className="p-4">
      <TwoColumnLayout>
        <DynamicSelector
          options={[
            { value: "", label: "انتخاب کنید..." },
            ...projects.map((project) => ({
              value: project.ID.toString(),
              label: project.ProjectName
            }))
          ]}
          selectedValue={staffingData.ProjectID}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("ProjectID", e.target.value)}
          label="Project Name"
          showButton={true}
          onButtonClick={() => handleOpenModal("ProjectID")}
          disabled={isProjectNameDisabled}
        />

        <DynamicSelector
          options={[
            { value: "", label: "انتخاب کنید..." },
            ...users.map((user) => ({
              value: user.ID,
              label: user.Name
            }))
          ]}
          selectedValue={staffingData.OwnerID}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("OwnerID", e.target.value)}
          label="User Name"
          showButton={true}
          onButtonClick={() => handleOpenModal("OwnerID")}
        />

        <DynamicSelector
          options={[
            { value: "", label: "انتخاب کنید..." },
            ...roles.map((role) => ({
              value: role.ID,
              label: role.Name
            }))
          ]}
          selectedValue={staffingData.nPostTypeID}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("nPostTypeID", e.target.value)}
          label="Roles Type"
          showButton={true}
          onButtonClick={() => handleOpenModal("nPostTypeID")}
        />

        <DynamicSelector
          options={[
            { value: "", label: "انتخاب کنید..." },
            ...companies.map((company) => ({
              value: company.ID.toString(),
              label: company.Name
            }))
          ]}
          selectedValue={staffingData.nCompanyID}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("nCompanyID", e.target.value)}
          label="Enterprise"
          showButton={true}
          onButtonClick={() => handleOpenModal("nCompanyID")}
        />

        <DynamicSelector
          options={[
            { value: "", label: "انتخاب کنید..." },
            ...roles.map((role) => ({
              value: role.ID,
              label: role.Name
            }))
          ]}
          selectedValue={staffingData.ParentId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("ParentId", e.target.value)}
          label="Parent"
          showButton={true}
          onButtonClick={() => handleOpenModal("ParentId")}
        />

        <DynamicSelector
          options={[
            { value: "", label: "انتخاب کنید..." },
            ...menus.map((menu) => ({
              value: menu.ID.toString(),
              label: menu.Name
            }))
          ]}
          selectedValue={staffingData.nMenuID}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("nMenuID", e.target.value)}
          label="Menu"
          showButton={true}
          onButtonClick={() => handleOpenModal("nMenuID")}
        />

        <DynamicSwitcher
          isChecked={staffingData.isAccessCreateProject}
          onChange={() => handleSwitcherChange("isAccessCreateProject")}
          leftLabel=""
          rightLabel="Access To Projects"
        />

        <DynamicSwitcher
          isChecked={staffingData.isHaveAddressbar}
          onChange={() => handleSwitcherChange("isHaveAddressbar")}
          leftLabel=""
          rightLabel="Show Command Bar"
        />
      </TwoColumnLayout>

      <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
        {currentSelector === "ProjectID" && (
          <TableSelector
            columnDefs={[{ headerName: "Project Name", field: "ProjectName" }]}
            rowData={projects}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        )}
        {currentSelector === "OwnerID" && (
          <TableSelector
            columnDefs={[{ headerName: "User Name", field: "Name" }]}
            rowData={users}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        )}
        {currentSelector === "nPostTypeID" && (
          <TableSelector
            columnDefs={[{ headerName: "Role Name", field: "Name" }]}
            rowData={roles}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        )}
        {currentSelector === "nCompanyID" && (
          <TableSelector
            columnDefs={[{ headerName: "Enterprise Name", field: "Name" }]}
            rowData={companies}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        )}
        {currentSelector === "ParentId" && (
          <TableSelector
            columnDefs={[{ headerName: "Parent Name", field: "Name" }]}
            rowData={roles}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        )}
        {currentSelector === "nMenuID" && (
          <TableSelector
            columnDefs={[{ headerName: "Menu Name", field: "Name" }]}
            rowData={menus}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        )}
      </DynamicModal>
    </div>
  );
});

export default Staffing;
