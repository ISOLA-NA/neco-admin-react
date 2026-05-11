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
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
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

    // حذف رکوردهای خالی از همه‌ی دیتاها، نه فقط Roles
    const validRoles = roles.filter(
      (r) => r?.ID && r?.Name && r.Name.trim() !== ""
    );

    const validProjects = projects.filter(
      (p) => p?.ID && p?.ProjectName && p.ProjectName.trim() !== ""
    );

    const validUsers = users.filter(
      (u) => u?.ID && u?.Username && u.Username.trim() !== ""
    );

    const validCompanies = companies.filter(
      (c) => c?.ID && c?.Name && c.Name.trim() !== ""
    );

    const validMenus = menus.filter(
      (m) => m?.ID && m?.Name && m.Name.trim() !== ""
    );

    useEffect(() => {
      Promise.all([
        api.getAllProject(),
        api.getAllUsers(),
        api.getAllRoles(),
        api.getAllCompanies(),
        api.getAllMenu(),
      ])
        .then(([pd, ud, rd, cd, md]) => {
          setProjects(Array.isArray(pd) ? pd : []);
          setUsers(Array.isArray(ud) ? ud : []);
          setRoles(Array.isArray(rd) ? rd : []);
          setCompanies(Array.isArray(cd) ? cd : []);
          setMenus(Array.isArray(md) ? md : []);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }, [api]);

    useEffect(() => {
      if (!selectedRow) return;

      const selectedPostTypeId = (selectedRow.nPostTypeID ?? "").toString();

      setStaffingData({
        id: selectedRow.ID?.toString() || "",
        Name: selectedRow.Name || "",
        ProjectID: (selectedRow.nProjectID ?? "").toString(),
        OwnerID: (selectedRow.OwnerID ?? "").toString(),
        nPostTypeID: selectedPostTypeId,
        nCompanyID: (selectedRow.nCompanyID ?? "").toString(),
        ParrentId: (selectedRow.ParrentId ?? "").toString(),
        nMenuID: (selectedRow.nMenuID ?? "").toString(),
        isAccessCreateProject: selectedRow.isAccessCreateProject || false,
        isHaveAddressbar: selectedRow.isHaveAddressbar || false,
        isStaticPost: selectedRow.isStaticPost || false,
        PostCode: selectedRow.PostCode || "",
        CreateDate: selectedRow.CreateDate || new Date().toISOString(),
      });

      if (selectedPostTypeId) {
        const sel = validRoles.find(
          (r) => r.ID?.toString() === selectedPostTypeId
        );
        setIsProjectNameDisabled(sel?.isStaticPost || false);
      }
    }, [selectedRow, validRoles]);

    const save = async () => {
      if (staffingData.nPostTypeID) {
        const sel = validRoles.find(
          (r) => r.ID?.toString() === staffingData.nPostTypeID
        );

        if (sel && !sel.isStaticPost && !staffingData.ProjectID) {
          showAlert("warning", null, t("Staffing.DynamicRoleSelectProject"));
          return false;
        }
      }

      if (!staffingData.OwnerID) {
        showAlert("warning", "", t("Staffing.SelectUserBeforeSaving"));
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
        return true;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    useImperativeHandle(ref, () => ({ save }));

    const handleChange = (field: keyof StaffingData, value: string) => {
      if (field === "nPostTypeID") {
        const sel = validRoles.find((r) => r.ID?.toString() === value);
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

        return;
      }

      setStaffingData((p) => ({ ...p, [field]: value }));
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

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-48">Loading...</div>
      );
    }

    return (
      <div className="p-4">
        <TwoColumnLayout>
          <DynamicSelector
            options={validRoles.map((r) => ({
              value: r.ID.toString(),
              label: r.Name,
            }))}
            selectedValue={staffingData.nPostTypeID}
            onChange={(e) => handleChange("nPostTypeID", e.target.value)}
            label={t("Staffing.RolesType")}
            showButton
            onButtonClick={() => openModal("nPostTypeID")}
            disabled={!!selectedRow}
          />

          <DynamicSelector
            options={validProjects.map((p) => ({
              value: p.ID.toString(),
              label: p.ProjectName,
            }))}
            selectedValue={staffingData.ProjectID}
            onChange={(e) => handleChange("ProjectID", e.target.value)}
            label={t("Staffing.ProjectName")}
            showButton
            onButtonClick={() => openModal("ProjectID")}
            disabled={staffingData.isStaticPost || isProjectNameDisabled}
          />

          <DynamicSelector
            options={validUsers.map((u) => ({
              value: u.ID.toString(),
              label: u.Username,
            }))}
            selectedValue={staffingData.OwnerID}
            onChange={(e) => handleChange("OwnerID", e.target.value)}
            label={t("Staffing.UserName")}
            showButton
            onButtonClick={() => openModal("OwnerID")}
          />

          <DynamicSelector
            options={validRoles.map((r) => ({
              value: r.ID.toString(),
              label: r.Name,
            }))}
            selectedValue={staffingData.ParrentId}
            onChange={(e) => handleChange("ParrentId", e.target.value)}
            label={t("Staffing.SuperiorRole")}
            showButton
            onButtonClick={() => openModal("ParrentId")}
          />

          <DynamicSelector
            options={validCompanies.map((c) => ({
              value: c.ID.toString(),
              label: c.Name,
            }))}
            selectedValue={staffingData.nCompanyID}
            onChange={(e) => handleChange("nCompanyID", e.target.value)}
            label={t("Staffing.Enterprise")}
            showButton
            onButtonClick={() => openModal("nCompanyID")}
          />

          <DynamicSelector
            options={validMenus.map((m) => ({
              value: m.ID.toString(),
              label: m.Name,
            }))}
            selectedValue={staffingData.nMenuID}
            onChange={(e) => handleChange("nMenuID", e.target.value)}
            label={t("Staffing.RelatedRibbons")}
            showButton
            onButtonClick={() => openModal("nMenuID")}
          />

          <DynamicSwitcher
            isChecked={staffingData.isAccessCreateProject}
            onChange={() => handleSwitcher("isAccessCreateProject")}
            leftLabel={t("Staffing.AccessToNewProjects")}
            rightLabel=""
          />

          <DynamicSwitcher
            isChecked={staffingData.isHaveAddressbar}
            onChange={() => handleSwitcher("isHaveAddressbar")}
            leftLabel={t("Staffing.ShowCommandBar")}
            rightLabel=""
          />
        </TwoColumnLayout>

        <DynamicModal isOpen={modalOpen} onClose={closeModal}>
          {currentSelector === "ProjectID" && (
            <TableSelector
              columnDefs={[
                { headerName: t("Staffing.Name"), field: "ProjectName" },
              ]}
              rowData={validProjects}
              onRowClick={onRowClick}
              onRowDoubleClick={onSelect}
              onSelectButtonClick={onSelect}
              isSelectDisabled={!selectedRowData}
            />
          )}

          {currentSelector === "OwnerID" && (
            <TableSelector
              columnDefs={[
                { headerName: t("Staffing.Name"), field: "Username" },
              ]}
              rowData={validUsers}
              onRowClick={onRowClick}
              onRowDoubleClick={onSelect}
              onSelectButtonClick={onSelect}
              isSelectDisabled={!selectedRowData}
            />
          )}

          {currentSelector === "nPostTypeID" && (
            <TableSelector
              columnDefs={[{ headerName: t("Staffing.Name"), field: "Name" }]}
              rowData={validRoles}
              onRowClick={onRowClick}
              onRowDoubleClick={onSelect}
              onSelectButtonClick={onSelect}
              isSelectDisabled={!selectedRowData}
            />
          )}

          {currentSelector === "ParrentId" && (
            <TableSelector
              columnDefs={[{ headerName: t("Staffing.Name"), field: "Name" }]}
              rowData={validRoles}
              onRowClick={onRowClick}
              onRowDoubleClick={onSelect}
              onSelectButtonClick={onSelect}
              isSelectDisabled={!selectedRowData}
            />
          )}

          {currentSelector === "nCompanyID" && (
            <TableSelector
              columnDefs={[{ headerName: t("Staffing.Name"), field: "Name" }]}
              rowData={validCompanies}
              onRowClick={onRowClick}
              onRowDoubleClick={onSelect}
              onSelectButtonClick={onSelect}
              isSelectDisabled={!selectedRowData}
            />
          )}

          {currentSelector === "nMenuID" && (
            <TableSelector
              columnDefs={[{ headerName: t("Staffing.Name"), field: "Name" }]}
              rowData={validMenus}
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