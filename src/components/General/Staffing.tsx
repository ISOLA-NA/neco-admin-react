// src/components/Staffing.tsx
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
import DynamicSwitcher from "../utilities/DynamicSwitcher";
import { Role, useApi } from "../../context/ApiContext";
import { showAlert } from "../utilities/Alert/DynamicAlert";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface StaffingData {
  id: string;
  Name: string;
  ProjectID: string;
  OwnerID: string;
  nPostTypeID: string;
  nCompanyID: string;
  ParrentId: string;
  nMenuID: string;
  isAccessCreateProject: boolean;
  isHaveAddressbar: boolean;
  isStaticPost: boolean;
  PostCode: string;
  CreateDate: string;
}

export interface StaffingHandle {
  save: () => Promise<boolean>;
}

interface StaffingProps {
  selectedRow: any;
}

const Staffing = forwardRef<StaffingHandle, StaffingProps>(
  ({ selectedRow }, ref) => {
    const api = useApi();
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [menus, setMenus] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentSelector, setCurrentSelector] = useState<string | null>(null);
    const [selectedRowData, setSelectedRowData] = useState<any>(null);
    const [isProjectNameDisabled, setIsProjectNameDisabled] =
      useState<boolean>(false);

    const [staffingData, setStaffingData] = useState<StaffingData>({
      id: "",
      Name: "",
      ProjectID: "",
      OwnerID: "",
      nPostTypeID: "",
      nCompanyID: "",
      ParrentId: "",
      nMenuID: "",
      isAccessCreateProject: false,
      isHaveAddressbar: false,
      isStaticPost: false,
      PostCode: "",
      CreateDate: new Date().toISOString(),
    });

    useEffect(() => {
      Promise.all([
        api.getAllProject(),
        api.getAllUsers(),
        api.getAllRoles(),
        api.getAllCompanies(),
        api.getAllMenu(),
      ])
        .then(([pd, ud, rd, cd, md]) => {
          setProjects(pd);
          setUsers(ud);
          setRoles(rd);
          setCompanies(cd);
          setMenus(md);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }, [api]);

    useEffect(() => {
      if (!selectedRow) return;
      setStaffingData({
        id: selectedRow.ID?.toString() || "",
        Name: selectedRow.Name || "",
        ProjectID: (selectedRow.nProjectID ?? "").toString(),
        OwnerID: (selectedRow.OwnerID ?? "").toString(),
        nPostTypeID: (selectedRow.nPostTypeID ?? "").toString(),
        nCompanyID: (selectedRow.nCompanyID ?? "").toString(),
        ParrentId: (selectedRow.ParrentId ?? "").toString(),
        nMenuID: (selectedRow.nMenuID ?? "").toString(),
        isAccessCreateProject: selectedRow.isAccessCreateProject || false,
        isHaveAddressbar: selectedRow.isHaveAddressbar || false,
        isStaticPost: selectedRow.isStaticPost || false,
        PostCode: selectedRow.PostCode || "",
        CreateDate: selectedRow.CreateDate || new Date().toISOString(),
      });
      if (selectedRow.nPostTypeID) {
        const sel = roles.find((r) => r.ID === selectedRow.nPostTypeID);
        setIsProjectNameDisabled(sel?.isStaticPost || false);
      }
    }, [selectedRow, roles]);

    const save = async () => {
      if (staffingData.nPostTypeID) {
        const sel = roles.find((r) => r.ID === staffingData.nPostTypeID);
        if (sel && !sel.isStaticPost && !staffingData.ProjectID) {
          showAlert(
            "warning",
            null,
            "A dynamic role has been selected; please select a project"
          );
          // throw new Error("Missing ProjectID");
          return false
        }
      }

      if (!staffingData.OwnerID) {
        showAlert(
          "warning",
          null,
          "Warning",
          "Please select a user before saving."
        );
        return false;
      }


      const currentUserId = localStorage.getItem("currentUserId") || undefined;
      const sd = staffingData;
      const payload: Role = {
        ID: sd.id || uuidv4(),
        Name: sd.Name,
        IsVisible: true,
        LastModified: new Date().toISOString(),
        CreateDate: sd.CreateDate,
        CreateById: null,
        ModifiedById: currentUserId,
        Authorization: "",
        Competencies: "",
        Description: "",
        Grade: "",
        PostCode: sd.PostCode,
        Responsibility: "",
        Type: "",
        OwnerID: sd.OwnerID || null,
        ParrentId: sd.ParrentId || null,
        isAccessCreateProject: sd.isAccessCreateProject,
        isHaveAddressbar: sd.isHaveAddressbar,
        isStaticPost: sd.isStaticPost,
        nCompanyID: sd.nCompanyID || null,
        nMenuID: sd.nMenuID || null,
        nPostTypeID: null,
        nProjectID: sd.ProjectID || null,
        status: 1,
      };

      try {
        await api.updateRole(payload);
        return true
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    useImperativeHandle(ref, () => ({ save }));

    const handleChange = (field: keyof StaffingData, value: string) => {
      setStaffingData((p) => ({ ...p, [field]: value }));
      if (field === "nPostTypeID") {
        const sel = roles.find((r) => r.ID === value);
        const isStatic = sel?.isStaticPost || false;
        setIsProjectNameDisabled(isStatic);
        setStaffingData((p) => ({
          ...p,
          id: value,
          nPostTypeID: value,
          PostCode: sel?.PostCode || "",
          Name: sel?.Name || "",
          ProjectID: isStatic ? "" : p.ProjectID,
          isStaticPost: isStatic,
        }));
      }
    };

    const handleSwitcher = (
      field: "isAccessCreateProject" | "isHaveAddressbar"
    ) => {
      setStaffingData((p) => ({ ...p, [field]: !p[field] }));
    };

    const openModal = (sel: string) => {
      setCurrentSelector(sel);
      setSelectedRowData(null);
      setModalOpen(true);
    };
    const closeModal = () => {
      setModalOpen(false);
      setCurrentSelector(null);
      setSelectedRowData(null);
    };
    const onRowClick = (row: any) => setSelectedRowData(row);
    const onSelect = () => {
      if (!currentSelector || !selectedRowData) return;
      handleChange(
        currentSelector as keyof StaffingData,
        selectedRowData.ID.toString()
      );
      closeModal();
    };

    if (isLoading)
      return (
        <div className="flex justify-center items-center h-48">
          Loading...
        </div>
      );

    return (
      <div className="p-4">
        <TwoColumnLayout>
          <DynamicSelector
            options={[
              { value: "", label: "" },
              ...roles.map((r) => ({ value: r.ID, label: r.Name })),
            ]}
            selectedValue={staffingData.Name}
            onChange={(e) => handleChange("nPostTypeID", e.target.value)}
            label="Roles Type"
            showButton
            onButtonClick={() => openModal("nPostTypeID")}
            disabled={!!selectedRow}
          />
          <DynamicSelector
            options={[
              { value: "", label: "" },
              ...projects.map((p) => ({
                value: p.ID.toString(),
                label: p.ProjectName,
              })),
            ]}
            selectedValue={staffingData.ProjectID}
            onChange={(e) => handleChange("ProjectID", e.target.value)}
            label="Project Name"
            showButton
            onButtonClick={() => openModal("ProjectID")}
            disabled={isProjectNameDisabled}
          />

          <DynamicSelector
            options={[
              { value: "", label: "" },
              ...users.map((u) => ({ value: u.ID, label: u.Username })),
            ]}
            selectedValue={staffingData.OwnerID}
            onChange={(e) => handleChange("OwnerID", e.target.value)}
            label="User Name"
            showButton
            onButtonClick={() => openModal("OwnerID")}
          />


          <DynamicSelector
            options={[
              { value: "", label: "" },
              ...roles.map((r) => ({ value: r.ID, label: r.Name })),
            ]}
            selectedValue={staffingData.ParrentId}
            onChange={(e) => handleChange("ParrentId", e.target.value)}
            label="Superior Role"
            showButton
            onButtonClick={() => openModal("ParrentId")}
          />

          <DynamicSelector
            options={[
              { value: "", label: "" },
              ...companies.map((c) => ({
                value: c.ID.toString(),
                label: c.Name,
              })),
            ]}
            selectedValue={staffingData.nCompanyID}
            onChange={(e) => handleChange("nCompanyID", e.target.value)}
            label="Enterprise"
            showButton
            onButtonClick={() => openModal("nCompanyID")}
          />


          <DynamicSelector
            options={[
              { value: "", label: "" },
              ...menus.map((m) => ({
                value: m.ID.toString(),
                label: m.Name,
              })),
            ]}
            selectedValue={staffingData.nMenuID}
            onChange={(e) => handleChange("nMenuID", e.target.value)}
            label="Related Ribbons"
            showButton
            onButtonClick={() => openModal("nMenuID")}
          />

          <DynamicSwitcher
            isChecked={staffingData.isAccessCreateProject}
            onChange={() => handleSwitcher("isAccessCreateProject")}
            leftLabel=""
            rightLabel="Access To New Projects"
          />

          <DynamicSwitcher
            isChecked={staffingData.isHaveAddressbar}
            onChange={() => handleSwitcher("isHaveAddressbar")}
            leftLabel=""
            rightLabel="Show Command Bar"
          />
        </TwoColumnLayout>

        <DynamicModal isOpen={modalOpen} onClose={closeModal}>
          {currentSelector === "ProjectID" && (
            <TableSelector
              columnDefs={[{ headerName: "Project Name", field: "ProjectName" }]}
              rowData={projects}
              // selectedRow={selectedRowData}
              onRowClick={onRowClick}
              onRowDoubleClick={onSelect}
              onSelectButtonClick={onSelect}
              isSelectDisabled={!selectedRowData}
            />
          )}
          {currentSelector === "OwnerID" && (
            <TableSelector
              columnDefs={[{ headerName: "Username", field: "Username" }]}
              rowData={users}
              // selectedRow={selectedRowData}
              onRowClick={onRowClick}
              onRowDoubleClick={onSelect}
              onSelectButtonClick={onSelect}
              isSelectDisabled={!selectedRowData}
            />
          )}
          {currentSelector === "nPostTypeID" && (
            <TableSelector
              columnDefs={[{ headerName: "Role Name", field: "Name" }]}
              rowData={roles}
              // selectedRow={selectedRowData}
              onRowClick={onRowClick}
              onRowDoubleClick={onSelect}
              onSelectButtonClick={onSelect}
              isSelectDisabled={!selectedRowData}
            />
          )}
          {currentSelector === "nCompanyID" && (
            <TableSelector
              columnDefs={[{ headerName: "Enterprise Name", field: "Name" }]}
              rowData={companies}
              // selectedRow={selectedRowData}
              onRowClick={onRowClick}
              onRowDoubleClick={onSelect}
              onSelectButtonClick={onSelect}
              isSelectDisabled={!selectedRowData}
            />
          )}

          {currentSelector === "nMenuID" && (
            <TableSelector
              columnDefs={[{ headerName: "Menu Name", field: "Name" }]}
              rowData={menus}
              // selectedRow={selectedRowData}
              onRowClick={onRowClick}
              onRowDoubleClick={onSelect}
              onSelectButtonClick={onSelect}
              isSelectDisabled={!selectedRowData}
            />
          )}

          {currentSelector === "ParrentId" && (
            <TableSelector
              columnDefs={[{ headerName: "Role Name", field: "Name" }]}
              rowData={roles}
              onRowClick={onRowClick}
              onRowDoubleClick={onSelect}
              onSelectButtonClick={onSelect}
              isSelectDisabled={!selectedRowData}
            />
          )}

        </DynamicModal>
      </div>
    );
  }
);

export default Staffing;
