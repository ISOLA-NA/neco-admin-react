// src/components/General/RoleGroups.tsx

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import ListSelector from "../ListSelector/ListSelector";
import TableSelector from "./Configuration/TableSelector";
import { useApi } from "../../context/ApiContext";
import { PostCat, Project } from "../../services/api.services";
import { showAlert } from "../utilities/Alert/DynamicAlert";

export interface RoleGroupsHandle {
  save: () => Promise<boolean>;
}

interface RoleGroupsProps {
  selectedRow: PostCat | null;
}

// توابع کمکی برای پردازش رشته‌های جداشده با |
const parseIds = (idsStr?: string): string[] => {
  if (!idsStr) return [];
  // فیلتر کردن مقادیر خالی برای جلوگیری از ایجاد "" در آرایه
  return idsStr.split("|").filter(Boolean);
};

const getAssociatedProjects = (
  projectsStr?: string,
  projectsData?: Array<{ ID: string; Name: string }>
) => {
  const projectIds = parseIds(projectsStr);
  return (projectsData || []).filter((project) =>
    projectIds.includes(String(project.ID))
  );
};

const getAssociatedMembers = (
  postsStr?: string,
  membersData?: Array<{ ID: number | string; Name: string }>
) => {
  const memberIds = parseIds(postsStr).map((id) => String(id));
  return (membersData || []).filter((member) =>
    memberIds.includes(String(member.ID))
  );
};

const RoleGroups = forwardRef<RoleGroupsHandle, RoleGroupsProps>(
  ({ selectedRow }, ref) => {
    const api = useApi();

    // وضعیت اولیه داده‌های گروه نقش
    const [roleGroupData, setRoleGroupData] = useState<PostCat>({
      Name: "",
      Description: "",
      IsGlobal: false,
      IsVisible: true,
      PostsStr: "",
      ProjectsStr: "",
    });

    // وضعیت پروژه‌ها از API
    const [projectsData, setProjectsData] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState<boolean>(false);

    // آیتم‌های انتخاب‌شده (ID ها)
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<(string | number)[]>([]);

    // داده‌های استاتیک اعضا (این داده‌ها را شما به‌صورت دستی قرار داده‌اید)
    const membersData = [
      { ID: 1, Name: "User One" },
      { ID: 2, Name: "User Two" },
      { ID: 3, Name: "User Three" },
      { ID: 4, Name: "User Four" },
      { ID: 5, Name: "User Five" },
    ];

    // فراخوانی API برای دریافت لیست پروژه‌ها
    useEffect(() => {
      const fetchProjects = async () => {
        try {
          setLoadingProjects(true);
          const projects = await api.getAllProject();
          setProjectsData(projects);
        } catch (error) {
          console.error("Error fetching projects:", error);
          showAlert("error", null, "Error", "Failed to fetch projects");
        } finally {
          setLoadingProjects(false);
        }
      };
      fetchProjects();
    }, [api]);

    // زمانی که selectedRow تغییر می‌کند یا پروژه‌ها لود می‌شوند
    useEffect(() => {
      if (selectedRow) {
        // هنگام ویرایش
        console.log("Editing existing Role Group:", selectedRow);
        setRoleGroupData({
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

        // تنظیم آی‌دی‌های انتخاب‌شده پروژه‌ها
        if (projectsData.length > 0) {
          const existingProjectIds = parseIds(selectedRow.ProjectsStr);
          setSelectedProjectIds(existingProjectIds);
          console.log("Existing Project IDs:", existingProjectIds);
        }

        // تنظیم آی‌دی‌های انتخاب‌شده اعضا
        const existingMemberIds = parseIds(selectedRow.PostsStr);
        setSelectedMemberIds(existingMemberIds);
        console.log("Existing Member IDs:", existingMemberIds);
      } else {
        // اگر در حالت افزودن جدید هستیم
        console.log("Creating a new Role Group");
        setRoleGroupData({
          Name: "",
          Description: "",
          IsGlobal: false,
          IsVisible: true,
          PostsStr: "",
          ProjectsStr: "",
        });
        setSelectedProjectIds([]);
        setSelectedMemberIds([]);
      }
    }, [selectedRow, projectsData]);

    // تابعی که از بیرون صدا زده می‌شود تا ذخیره انجام شود
    useImperativeHandle(ref, () => ({
      async save() {
        try {
          // ساده‌ترین اعتبارسنجی: چک کردن خالی نبودن نام
          if (!roleGroupData.Name.trim()) {
            showAlert(
              "error",
              null,
              "Validation Error",
              "Role group name is required"
            );
            return false;
          }

          // لاگ کردن آی‌دی‌های نهایی انتخاب‌شده پروژه‌ها و اعضا
          console.log("Final selected Project IDs:", selectedProjectIds);
          console.log("Final selected Member IDs:", selectedMemberIds);

          // آماده‌سازی داده‌ها برای ذخیره‌سازی
          const dataToSave: PostCat = {
            ...roleGroupData,
            ProjectsStr:
              selectedProjectIds.join("|") +
              (selectedProjectIds.length > 0 ? "|" : ""),
            PostsStr:
              selectedMemberIds.join("|") +
              (selectedMemberIds.length > 0 ? "|" : ""),
            LastModified: new Date().toISOString(),
          };

          console.log("Data to be saved:", dataToSave);

          // تصمیم‌گیری برای آپدیت یا اینسرت
          if (selectedRow && selectedRow.ID) {
            // ویرایش
            await api.updatePostCat(dataToSave);
            console.log("Role Group updated successfully");
          } else {
            // اینسرت
            await api.insertPostCat(dataToSave);
            console.log("Role Group inserted successfully");
          }
          return true;
        } catch (error) {
          console.error("Error saving role group:", error);
          showAlert("error", null, "Error", "Failed to save role group data");
          return false;
        }
      },
    }));

    // هندل تغییرات فیلدهای فرم
    const handleChange = (field: keyof PostCat, value: any) => {
      setRoleGroupData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    // تعریف ستون‌های جدول برای پروژه‌ها (فقط نمایش نام پروژه)
    const projectColumnDefs = [{ field: "Name", headerName: "Project Name" }];

    // تعریف ستون‌های جدول برای اعضا
    const memberColumnDefs = [{ field: "Name", headerName: "Member Name" }];

    // هندل تغییرات انتخاب پروژه‌ها
    const handleProjectsChange = (selectedIds: (string | number)[]) => {
      // تبدیل تمام ID ها به استرینگ برای هماهنگی در ذخیره
      setSelectedProjectIds(selectedIds.map(String));
      console.log("Projects selected:", selectedIds);
    };

    // هندل تغییرات انتخاب اعضا
    const handleMembersChange = (selectedIds: (string | number)[]) => {
      setSelectedMemberIds(selectedIds);
      console.log("Members selected:", selectedIds);
    };

    // هندل تغییر وضعیت Global
    const handleGlobalChange = (isGlobal: boolean) => {
      handleChange("IsGlobal", isGlobal);
      console.log("IsGlobal changed to:", isGlobal);
    };

    // آماده‌سازی داده‌ها برای ListSelector (فرمت دهی پروژه‌ها به {ID, Name})
    const projectsListData = projectsData.map((proj) => ({
      ID: proj.ID,
      Name: proj.ProjectName,
    }));

    // آماده‌سازی داده‌ها برای ListSelector اعضا (داده‌های استاتیک)
    const membersListData = membersData.map((member) => ({
      ID: member.ID,
      Name: member.Name,
    }));

    // آماده‌سازی پروژه‌های انتخاب‌شده برای نمایش در مودال
    const selectedProjectsForModal = getAssociatedProjects(
      roleGroupData.ProjectsStr,
      projectsListData
    );

    // آماده‌سازی اعضای انتخاب‌شده برای نمایش در مودال
    const selectedMembersForModal = getAssociatedMembers(
      roleGroupData.PostsStr,
      membersData
    );

    return (
      <TwoColumnLayout>
        {/* نام گروه نقش */}
        <DynamicInput
          name="Name"
          type="text"
          value={roleGroupData.Name}
          placeholder="Enter group name"
          onChange={(e) => handleChange("Name", e.target.value)}
          required
          className="mb-4"
        />

        {/* توضیحات */}
        <CustomTextarea
          name="Description"
          value={roleGroupData.Description || ""}
          placeholder="Enter description"
          onChange={(e) => handleChange("Description", e.target.value)}
          className="mb-4"
        />

        {/* سلکتور پروژه‌ها */}
        <ListSelector
          title="Projects"
          className="mb-4"
          columnDefs={projectColumnDefs}
          rowData={projectsListData}
          selectedIds={selectedProjectIds}
          onSelectionChange={handleProjectsChange}
          showSwitcher={true}
          isGlobal={roleGroupData.IsGlobal}
          onGlobalChange={handleGlobalChange}
          loading={loadingProjects}
          ModalContentComponent={TableSelector}
          modalContentProps={{
            columnDefs: projectColumnDefs,
            rowData: projectsListData,
            selectedRows: selectedProjectsForModal,
            onRowDoubleClick: (rows: any[]) =>
              handleProjectsChange(rows.map((row) => row.ID)),
            selectionMode: "multiple",
          }}
        />

        {/* سلکتور اعضا */}
        <ListSelector
          title="Members"
          className="mb-4"
          columnDefs={memberColumnDefs}
          rowData={membersListData}
          selectedIds={selectedMemberIds}
          onSelectionChange={handleMembersChange}
          showSwitcher={false}
          isGlobal={false}
          ModalContentComponent={TableSelector}
          modalContentProps={{
            columnDefs: memberColumnDefs,
            rowData: membersListData,
            selectedRows: selectedMembersForModal,
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
