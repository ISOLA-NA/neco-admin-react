import React, { useState, useEffect, useMemo, ChangeEvent } from "react";
import DataTable from "../../../TableDynamic/DataTable";
import DynamicSelector from "../../../utilities/DynamicSelector";
import DynamicModal from "../../../utilities/DynamicModal";
import TableSelector from "../../../General/Configuration/TableSelector";
import { useApi } from "../../../../context/ApiContext";
import {
  AccessProject,
  Role,
  PostSmall,
} from "../../../../services/api.services";
import { showAlert } from "../../../utilities/Alert/DynamicAlert";

interface LeftProjectAccessProps {
  selectedRow: {
    ID: string;
    // سایر فیلدها...
  };
  onDoubleClickSubItem: (data: AccessProject) => void;
  onAddFromLeft?: () => void;
  onEditFromLeft?: () => void;
}

interface ValueGetterParams {
  data: AccessProject;
}

const LeftProjectAccess: React.FC<LeftProjectAccessProps> = ({
  selectedRow,
  onDoubleClickSubItem,
  onAddFromLeft,
  onEditFromLeft,
}) => {
  const api = useApi();

  // وضعیت‌های موجود
  const [leftRowData, setLeftRowData] = useState<AccessProject[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedSubItemRow, setSelectedSubItemRow] =
    useState<AccessProject | null>(null);

  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(false);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);
  const [errorRoles, setErrorRoles] = useState<string | null>(null);

  // وضعیت‌های جدید برای getPostSmall و مودال
  const [postSmallData, setPostSmallData] = useState<PostSmall[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoadingPostSmall, setIsLoadingPostSmall] = useState<boolean>(false);
  const [errorPostSmall, setErrorPostSmall] = useState<string | null>(null);
  const [selectedPostSmall, setSelectedPostSmall] = useState<PostSmall | null>(
    null
  );

  // ساخت map از نقش‌ها
  const rolesMap = useMemo(() => {
    const map: Record<string, string> = {};
    roles.forEach((role) => {
      if (role.ID) {
        map[role.ID.trim().toLowerCase()] = role.Name;
      }
    });
    return map;
  }, [roles]);

  // فیلتر کردن داده‌ها فقط برای نقش‌های معتبر
  const filteredRowData = useMemo(() => {
    return leftRowData.filter((item) => {
      const key = item.nPostID?.trim().toLowerCase();
      return key && rolesMap[key];
    });
  }, [leftRowData, rolesMap]);

  // ستون‌های جدول
  const leftColumnDefs = useMemo(
    () => [
      {
        headerName: "Name",
        valueGetter: (params: ValueGetterParams) => {
          const record = params.data;
          if (!record.nPostID) {
            return "(No Match)";
          }
          const key = record.nPostID.trim().toLowerCase();
          const roleName = rolesMap[key];
          return roleName || "(No Match)";
        },
        filter: "agTextColumnFilter",
      },
      {
        headerName: "AccessMode",
        field: "AccessMode",
        filter: "agNumberColumnFilter",
      },
      // سایر ستون‌ها...
    ],
    [rolesMap]
  );

  // واکشی پست‌های پروژه
  useEffect(() => {
    const fetchPostsInProject = async () => {
      setIsLoadingPosts(true);
      setErrorPosts(null);
      try {
        if (selectedRow && selectedRow.ID) {
          const data = await api.getPostsinProject(selectedRow.ID);
          console.log("Fetched Posts in Project:", data); // اضافه کردن این خط
          setLeftRowData(data);
        } else {
          setLeftRowData([]);
        }
      } catch (error) {
        console.error("Error fetching posts in project:", error);
        setErrorPosts("Failed to load posts.");
      } finally {
        setIsLoadingPosts(false);
      }
    };
    fetchPostsInProject();
  }, [selectedRow, api]);

  // واکشی نقش‌ها
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoadingRoles(true);
      setErrorRoles(null);
      try {
        const roleData = await api.getAllRoles();
        console.log("Fetched Roles:", roleData); // اضافه کردن این خط
        setRoles(roleData);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setErrorRoles("Failed to load roles.");
      } finally {
        setIsLoadingRoles(false);
      }
    };
    fetchRoles();
  }, [api]);

  // واکشی داده‌های getPostSmall
  useEffect(() => {
    const fetchPostSmall = async () => {
      setIsLoadingPostSmall(true);
      setErrorPostSmall(null);
      try {
        const data = await api.getPostSmall();
        console.log("Fetched PostSmall Data:", data); // اضافه کردن این خط
        setPostSmallData(data);
      } catch (error) {
        console.error("Error fetching postSmall data:", error);
        setErrorPostSmall("Failed to load postSmall data.");
      } finally {
        setIsLoadingPostSmall(false);
      }
    };

    fetchPostSmall();
  }, [api]);

  // کلیک روی سطر
  const handleSubItemClick = (data: AccessProject) => {
    setSelectedSubItemRow(data);
  };

  // دوبار کلیک روی سطر
  const handleSubItemDoubleClick = (data: AccessProject) => {
    setSelectedSubItemRow(data);
    onDoubleClickSubItem(data);
    // فراخوانی متد ویرایش (در والد)
    if (onEditFromLeft) {
      onEditFromLeft();
    }
  };

  // دکمه‌ی + (Add)
  const handleAdd = () => {
    // ساخت یک رکورد جدید با ID موقت
    const newRow: AccessProject = {
      ID: "TEMP_" + Date.now(), // ID موقت
      nPostID: "",
      nProjectID: selectedRow ? selectedRow.ID : "",
      AccessMode: 0,
      AllowToDownloadGroup: false,
      AlowToAllTask: false,
      AlowToEditRequest: false,
      AlowToWordPrint: false,
      CreateAlert: false,
      CreateIssue: false,
      CreateKnowledge: false,
      CreateLetter: false,
      CreateMeeting: false,
      IsVisible: false,
      LastModified: "",
      PostName: null,
      Show_Approval: false,
      Show_Assignment: false,
      Show_CheckList: false,
      Show_Comment: false,
      Show_Lessons: false,
      Show_Logs: false,
      Show_Procedure: false,
      Show_Related: false,
    };

    onDoubleClickSubItem(newRow);

    // اگر والد هم نیاز دارد بداند Add شده است
    if (onAddFromLeft) {
      onAddFromLeft();
    }
  };

  // دکمه‌ی Edit
  const handleEdit = () => {
    if (selectedSubItemRow) {
      onDoubleClickSubItem(selectedSubItemRow);

      if (onEditFromLeft) {
        onEditFromLeft();
      }
    } else {
      showAlert("warning", null, "Warning", "Please select a row to edit.");
    }
  };

  // تغییر در selector
  const handleSelectorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    console.log("Selected Value:", value); // اضافه کردن این خط
    const selected = postSmallData.find((item) => item.ID === value) || null; // تغییر از leftRowData به postSmallData
    if (selected) {
      setSelectedSubItemRow({
        ...selectedSubItemRow!,
        nPostID: selected.ID,
        PostName: selected.Name,
      });
    } else {
      setSelectedSubItemRow(null);
    }
  };

  // هندلر برای باز کردن مودال
  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  // هندلر برای بستن مودال
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // هندلر انتخاب ردیف در TableSelector
  const handleTableRowDoubleClick = (data: PostSmall) => {
    setSelectedPostSmall(data);
    // بروزرسانی DynamicSelector با مقدار انتخاب شده
    setSelectedSubItemRow({
      ...selectedSubItemRow!,
      nPostID: data.ID,
      PostName: data.Name,
    });
    setIsModalOpen(false);
  };

  // هندلر کلیک دکمه Select در TableSelector
  const handleTableSelectButtonClick = () => {
    if (selectedPostSmall) {
      setSelectedSubItemRow({
        ...selectedSubItemRow!,
        nPostID: selectedPostSmall.ID,
        PostName: selectedPostSmall.Name,
      });
      setIsModalOpen(false);
    } else {
      showAlert("warning", null, "Warning", "Please select a row to select.");
    }
  };

  const isLoading = isLoadingPosts || isLoadingRoles || isLoadingPostSmall;

  return (
    <div className="h-full p-4">
      {/* نمایش خطاها */}
      {errorPosts && (
        <div className="error mb-4 text-red-500">{errorPosts}</div>
      )}
      {errorRoles && (
        <div className="error mb-4 text-red-500">{errorRoles}</div>
      )}
      {errorPostSmall && (
        <div className="error mb-4 text-red-500">{errorPostSmall}</div>
      )}

      {/* DynamicSelector با داده‌های getPostSmall */}
      {!isLoadingPostSmall && postSmallData.length > 0 ? (
        <DynamicSelector
          label="جستجو"
          options={postSmallData.map((item) => ({
            value: item.ID,
            label: item.Name || "NoName",
          }))}
          selectedValue={selectedSubItemRow ? selectedSubItemRow.nPostID : ""}
          onChange={handleSelectorChange}
          className="w-full mb-8"
          error={false}
          showButton={true}
          onButtonClick={handleButtonClick}
        />
      ) : (
        <div className="loading-indicator mb-8">
          در حال بارگذاری گزینه‌ها...
        </div>
      )}

      {/* نمایش وضعیت بارگذاری */}
      {isLoading && (
        <div className="loading-indicator mb-4">در حال بارگذاری...</div>
      )}

      {/* جدول اصلی */}
      <DataTable
        columnDefs={leftColumnDefs}
        rowData={filteredRowData}
        onRowDoubleClick={handleSubItemDoubleClick}
        setSelectedRowData={handleSubItemClick}
        showDuplicateIcon={false}
        showEditIcon={true}
        showAddIcon={true}
        showDeleteIcon={true}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={() => {}}
        onDuplicate={() => {}}
        isLoading={isLoading}
      />

      {/* مودال با TableSelector */}
      <DynamicModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">انتخاب PostSmall</h2>
          {errorPostSmall && (
            <div className="error mb-4 text-red-500">{errorPostSmall}</div>
          )}
          <TableSelector
            columnDefs={[
              { headerName: "ID", field: "ID" },
              { headerName: "Name", field: "Name" },
              // سایر ستون‌ها بر اساس داده‌های PostSmall
            ]}
            rowData={postSmallData}
            onRowDoubleClick={handleTableRowDoubleClick}
            onRowClick={(data) => setSelectedPostSmall(data)}
            onSelectButtonClick={handleTableSelectButtonClick}
            isSelectDisabled={false}
          />
        </div>
      </DynamicModal>
    </div>
  );
};

export default LeftProjectAccess;
