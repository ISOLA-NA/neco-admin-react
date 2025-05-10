import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { v4 as uuidv4 } from "uuid";
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
  PostCode: string;
  CreateDate: string;
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

  const [isLoading, setIsLoading] = useState(true);

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
    isStaticPost: selectedRow?.isStaticPost || false,
    PostCode: selectedRow?.PostCode || "",
    CreateDate: selectedRow?.CreateDate || new Date().toISOString(),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<string | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [isProjectNameDisabled, setIsProjectNameDisabled] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, usersData, rolesData, companiesData, menusData] =
          await Promise.all([
            api.getAllProject(),
            api.getAllUsers(),
            api.getAllRoles(),
            api.getAllCompanies(),
            api.getAllMenu(),
          ]);

        setProjects(projectsData);
        setUsers(usersData);
        setRoles(rolesData);
        setCompanies(companiesData);
        setMenus(menusData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
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
        isStaticPost: selectedRow.isStaticPost || false,
        PostCode: selectedRow.PostCode || "",
        CreateDate: selectedRow.CreateDate || new Date().toISOString(),
      });

      if (selectedRow.nPostTypeID) {
        const selectedRole = roles.find(
          (role) => role.ID === selectedRow.nPostTypeID
        );
        const isStatic = selectedRole?.isStaticPost || false;
        setIsProjectNameDisabled(isStatic);
      }
    }
  }, [selectedRow, roles]);

  const save = async (): Promise<void> => {
    if (staffingData.nPostTypeID) {
      const selectedRole = roles.find(
        (role) => role.ID === staffingData.nPostTypeID
      );
      if (
        selectedRole &&
        !selectedRole.isStaticPost &&
        !staffingData.ProjectID
      ) {
        showAlert(
          "warning",
          null,
          "هشدار",
          "سمت داینامیک انتخاب شده است، لطفا یک پروژه انتخاب کنید"
        );
        throw new Error(
          "Validation failed: Missing ProjectID for dynamic role"
        );
      }
    }

    try {
      const currentUserId = localStorage.getItem("currentUserId");
      const sd = staffingData;

      const roleData: Role = {
        ID: sd.id || uuidv4(),
        Name: sd.Name,
        IsVisible: true,
        LastModified: new Date().toISOString(),
        CreateDate: sd.CreateDate,
        CreateById: null,
        ModifiedById: currentUserId || undefined,
        Authorization: "",
        Competencies: "",
        Description: "",
        Grade: "",
        PostCode: sd.PostCode,
        Responsibility: "",
        Type: "",
        OwnerID: sd.OwnerID || null,
        ParrentId: sd.ParentId || null,
        isAccessCreateProject: sd.isAccessCreateProject,
        isHaveAddressbar: sd.isHaveAddressbar,
        isStaticPost: sd.isStaticPost,
        nCompanyID: sd.nCompanyID || null,
        nMenuID: sd.nMenuID || null,
        nPostTypeID: null,
        nProjectID: sd.ProjectID || null,
        status: 1,
      };

      await api.updateRole(roleData);
      showAlert("success", null, "موفقیت", "اطلاعات با موفقیت ذخیره شد");
    } catch (error) {
      console.error("Error in staffing save:", error);
      showAlert("error", null, "خطا", "خطا در ذخیره سازی اطلاعات");
      throw error;
    }
  };

  useImperativeHandle(ref, () => ({
    save,
  }));

  const handleChange = (field: keyof StaffingData, value: string) => {
    setStaffingData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "nPostTypeID") {
      const selectedRole = roles.find((role) => role.ID === value);
      const isStatic = selectedRole?.isStaticPost || false;

      setIsProjectNameDisabled(isStatic);

      setStaffingData((prev) => ({
        ...prev,
        id: value,
        nPostTypeID: value,
        PostCode: selectedRole?.PostCode || "",
        Name: selectedRole?.Name || "",
        ProjectID: isStatic ? "" : prev.ProjectID,
      }));
      return;
    }
  };

  const handleSwitcherChange = (
    field: keyof Pick<
      StaffingData,
      "isAccessCreateProject" | "isHaveAddressbar"
    >
  ) => {
    setStaffingData((prev) => ({
      ...prev,
      [field]: !prev[field],
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">Loading...</div>
    );
  }

  return (
    <div className="p-4">
      <TwoColumnLayout>
        <DynamicSelector
          options={[
            { value: "", label: "انتخاب کنید..." },
            ...projects.map((project) => ({
              value: project.ID.toString(),
              label: project.ProjectName,
            })),
          ]}
          selectedValue={staffingData.ProjectID}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("ProjectID", e.target.value)
          }
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
              label: user.Username,
            })),
          ]}
          selectedValue={staffingData.OwnerID}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("OwnerID", e.target.value)
          }
          label="User Name"
          showButton={true}
          onButtonClick={() => handleOpenModal("OwnerID")}
        />

        <DynamicSelector
          options={[
            { value: "", label: "انتخاب کنید..." },
            ...roles.map((role) => ({
              value: role.ID,
              label: role.Name,
            })),
          ]}
          selectedValue={staffingData.nPostTypeID}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("nPostTypeID", e.target.value)
          }
          label="Roles Type"
          showButton={true}
          onButtonClick={() => handleOpenModal("nPostTypeID")}
        />

        <DynamicSelector
          options={[
            { value: "", label: "انتخاب کنید..." },
            ...companies.map((company) => ({
              value: company.ID.toString(),
              label: company.Name,
            })),
          ]}
          selectedValue={staffingData.nCompanyID}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("nCompanyID", e.target.value)
          }
          label="Enterprise"
          showButton={true}
          onButtonClick={() => handleOpenModal("nCompanyID")}
        />

        <DynamicSelector
          options={[
            { value: "", label: "انتخاب کنید..." },
            ...roles.map((role) => ({
              value: role.ID,
              label: role.Name,
            })),
          ]}
          selectedValue={staffingData.ParentId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("ParentId", e.target.value)
          }
          label="Parent"
          showButton={true}
          onButtonClick={() => handleOpenModal("ParentId")}
        />

        <DynamicSelector
          options={[
            { value: "", label: "انتخاب کنید..." },
            ...menus.map((menu) => ({
              value: menu.ID.toString(),
              label: menu.Name,
            })),
          ]}
          selectedValue={staffingData.nMenuID}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("nMenuID", e.target.value)
          }
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
            columnDefs={[{ headerName: "Username", field: "Username" }]}
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
