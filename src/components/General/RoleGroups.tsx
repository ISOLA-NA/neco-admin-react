import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import ListSelector from "../ListSelector/ListSelector";
import TableSelector from "./Configuration/TableSelector";
import { useApi } from "../../context/ApiContext";
import { PostCat, Project, Role, Company, User } from "../../services/api.services";
import { showAlert } from "../utilities/Alert/DynamicAlert";

export interface RoleGroupsHandle {
  save: () => Promise<boolean>;
  checkNameFilled: () => boolean;
}

interface RoleGroupsProps {
  selectedRow: PostCat | null;
}

interface ProcessedRole {
  ID: string;
  Name: string;
  UserName: string;
  UserFamily: string;
  UserNameFromAllUser: string;
  Enterprise: string;
  SuperIndent: string;
}

interface ProjectListItem {
  ID: string;
  Name: string;
}

// Helper functions
const parseIds = (idsStr?: string): string[] => {
  if (!idsStr) return [];
  return idsStr.split("|").filter(Boolean);
};

const getAssociatedItems = <T extends { ID: string; Name: string }>(
  idsStr?: string,
  itemsData?: T[]
) => {
  const ids = parseIds(idsStr);
  return (itemsData || []).filter((item) => ids.includes(String(item.ID)));
};

const RoleGroups = forwardRef<RoleGroupsHandle, RoleGroupsProps>(
  ({ selectedRow }, ref) => {
    const api = useApi();
    const dataCache = useRef<{
      projects?: Project[];
      roles?: Role[];
      companies?: Company[];
      users?: User[];
    }>({});

    const [formData, setFormData] = useState<PostCat>({
      Name: "",
      Description: "",
      IsGlobal: false,
      IsVisible: true,
      PostsStr: "",
      ProjectsStr: "",
    });

    const [apiData, setApiData] = useState<{
      projects: Project[];
      roles: Role[];
      companies: Company[];
      users: User[];
    }>({
      projects: [],
      roles: [],
      companies: [],
      users: [],
    });

    const [selectedIds, setSelectedIds] = useState({
      projects: [] as string[],
      members: [] as string[],
    });

    const [loading, setLoading] = useState({
      projects: true,
      groupMembers: true,
      allData: true,
    });

    // Column definitions
    const columnDefs = {
      projects: [{ field: "Name", headerName: "Project Name" }],
      members: [
        { field: "Name", headerName: "Role" },
        { field: "UserNameFromAllUser", headerName: "Name" },
        { field: "UserFamily", headerName: "Family" },
        { field: "Enterprise", headerName: "Enterprise" },
        { field: "SuperIndent", headerName: "SuperIndent" },
      ],
    };

    // Fetch data
    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading((prev) => ({
            ...prev,
            allData: true,
            projects: true,
            groupMembers: true,
          }));

          let projects = dataCache.current.projects;
          let roles = dataCache.current.roles;
          let companies = dataCache.current.companies;
          let users = dataCache.current.users;

          if (!projects) {
            projects = await api.getAllProject();
            dataCache.current.projects = projects;
          }
          if (!roles) {
            roles = await api.getAllRoles();
            dataCache.current.roles = roles;
          }
          if (!companies) {
            companies = await api.getAllCompanies();
            dataCache.current.companies = companies;
          }
          if (!users) {
            users = await api.getAllUsers();
            dataCache.current.users = users;
          }

          setApiData({
            projects: projects || [],
            roles: roles || [],
            companies: companies || [],
            users: users || [],
          });
        } catch (error) {
          console.error("Error fetching data:", error);
          showAlert("error", null, "Error", "Failed to fetch data");
        } finally {
          setLoading({
            allData: false,
            projects: false,
            groupMembers: false,
          });
        }
      };

      fetchData();
    }, [api]);

    // Process data
    const processedData = useMemo(() => {
      const processedRoles: ProcessedRole[] = apiData.roles
        .filter((role) => role.ID)
        .map((role) => {
          const user = apiData.users.find((user) => user.ID === role.OwnerID);
          const company = apiData.companies.find(
            (company) => String(company.ID) === String(role.nCompanyID)
          );
          const superIndent = apiData.roles.find(
            (item) => item.ID === role.ParrentId
          )?.Name;

          return {
            ID: role.ID!,
            Name: role.Name,
            UserName: user?.Username || "",
            UserFamily: user?.Family || "",
            UserNameFromAllUser: user?.Name || "",
            Enterprise: company?.Name || "",
            SuperIndent: superIndent || "",
          };
        });

      const projectsListData: ProjectListItem[] = apiData.projects.map((proj) => ({
        ID: String(proj.ID),
        Name: proj.ProjectName,
      }));

      return {
        processedRoles,
        projectsListData,
      };
    }, [apiData]);

    // Update form when selected row changes
    useEffect(() => {
      if (selectedRow && !loading.allData) {
        setFormData({
          ID: selectedRow.ID,
          Name: selectedRow.Name || "",
          Description: selectedRow.Description || "",
          IsGlobal: selectedRow.IsGlobal || false,
          IsVisible: selectedRow.IsVisible ?? true,
          LastModified: selectedRow.LastModified,
          ModifiedById: selectedRow.ModifiedById,
          PostsStr: selectedRow.PostsStr || "",
          ProjectsStr: selectedRow.ProjectsStr || "",
        });

        setSelectedIds({
          projects: parseIds(selectedRow.ProjectsStr),
          members: parseIds(selectedRow.PostsStr),
        });
      } else if (!selectedRow) {
        setFormData({
          Name: "",
          Description: "",
          IsGlobal: false,
          IsVisible: true,
          PostsStr: "",
          ProjectsStr: "",
        });
        setSelectedIds({
          projects: [],
          members: [],
        });
      }
    }, [selectedRow, loading.allData]);

    // Event handlers
    const handleProjectsChange = (selectedIds: (string | number)[]) => {
      setSelectedIds((prev) => ({
        ...prev,
        projects: selectedIds.map(String),
      }));
    };

    const handleMembersChange = (selectedIds: (string | number)[]) => {
      setSelectedIds((prev) => ({
        ...prev,
        members: selectedIds.map(String),
      }));
    };

    const handleGlobalChange = (isGlobal: boolean) => {
      setFormData((prev) => ({
        ...prev,
        IsGlobal: isGlobal,
      }));
    };

    const handleChange = (field: keyof PostCat, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    // Expose functions to parent via ref
    useImperativeHandle(
      ref,
      () => ({
        checkNameFilled: () => {
          return formData.Name.trim().length > 0;
        },
        async save() {
          if (!formData.Name.trim()) {
            showAlert("error", null, "Validation Error", "Role group name is required");
            return false;
          }
          const dataToSave: PostCat = {
            ...formData,
            ProjectsStr: selectedIds.projects.join("|") + (selectedIds.projects.length > 0 ? "|" : ""),
            PostsStr: selectedIds.members.join("|") + (selectedIds.members.length > 0 ? "|" : ""),
            LastModified: new Date().toISOString(),
          };
          try {
            if (selectedRow?.ID) {
              await api.updatePostCat(dataToSave);
              showAlert("success", null, "Updated", "Role group updated successfully.");
            } else {
              await api.insertPostCat(dataToSave);
              showAlert("success", null, "Saved", "Role group added successfully.");
            }
            return true;
          } catch (error) {
            console.error("Error saving role group:", error);
            showAlert("error", null, "Error", "Failed to save role group data");
            return false;
          }
        },
      }),
      [api, formData, selectedIds, selectedRow?.ID]
    );

    return (
      <TwoColumnLayout>
        <DynamicInput
          name="Name"
          type="text"
          value={formData.Name}
          placeholder="Enter group name"
          onChange={(e) => handleChange("Name", e.target.value)}
          required
          className="mb-4"
        />

        <CustomTextarea
          name="Description"
          value={formData.Description || ""}
          placeholder="Enter description"
          onChange={(e) => handleChange("Description", e.target.value)}
          className="mb-4"
        />

        <ListSelector
          title="Projects"
          className="mb-4"
          columnDefs={columnDefs.projects}
          rowData={processedData.projectsListData}
          selectedIds={selectedIds.projects}
          onSelectionChange={handleProjectsChange}
          showSwitcher={true}
          isGlobal={formData.IsGlobal}
          onGlobalChange={handleGlobalChange}
          loading={loading.projects}
          ModalContentComponent={TableSelector}
          modalContentProps={{
            columnDefs: columnDefs.projects,
            rowData: processedData.projectsListData,
            selectedRows: getAssociatedItems(formData.ProjectsStr, processedData.projectsListData),
            onRowDoubleClick: (rows: any[]) =>
              handleProjectsChange(rows.map((row) => row.ID)),
            selectionMode: "multiple",
          }}
        />

        <ListSelector
          title="Members"
          className="mb-4"
          columnDefs={columnDefs.members}
          rowData={processedData.processedRoles}
          selectedIds={selectedIds.members}
          onSelectionChange={handleMembersChange}
          showSwitcher={false}
          isGlobal={false}
          loading={loading.groupMembers}
          ModalContentComponent={TableSelector}
          modalContentProps={{
            columnDefs: columnDefs.members,
            rowData: processedData.processedRoles,
            selectedRows: getAssociatedItems(formData.PostsStr, processedData.processedRoles),
            onRowDoubleClick: (rows: any[]) =>
              handleMembersChange(rows.map((row) => row.ID)),
            selectionMode: "multiple",
          }}
        />
      </TwoColumnLayout>
    );
  }
);

RoleGroups.displayName = "RoleGroups";
export default RoleGroups;
