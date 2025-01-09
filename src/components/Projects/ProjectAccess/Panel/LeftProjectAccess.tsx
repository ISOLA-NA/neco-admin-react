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
  };
  onDoubleClickSubItem: (data: AccessProject) => void;
  onAddFromLeft?: () => void;
  onEditFromLeft?: () => void;
  refreshTrigger: number;
}

interface ValueGetterParams {
  data: AccessProject;
}

const LeftProjectAccess: React.FC<LeftProjectAccessProps> = ({
  selectedRow,
  onDoubleClickSubItem,
  onAddFromLeft,
  onEditFromLeft,
  refreshTrigger,
}) => {
  const api = useApi();
  const [leftRowData, setLeftRowData] = useState<AccessProject[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedSubItemRow, setSelectedSubItemRow] =
    useState<AccessProject | null>(null);
  const [postSmallData, setPostSmallData] = useState<PostSmall[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPostSmall, setSelectedPostSmall] = useState<PostSmall | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string>("");

  const rolesMap = useMemo(() => {
    const map: Record<string, string> = {};
    roles.forEach((role) => {
      if (role.ID) {
        map[role.ID.trim().toLowerCase()] = role.Name;
      }
    });
    return map;
  }, [roles]);

  const filteredRowData = useMemo(() => {
    return leftRowData.filter((item) => {
      const key = item.nPostID?.trim().toLowerCase();
      return key && rolesMap[key];
    });
  }, [leftRowData, rolesMap]);

  const leftColumnDefs = useMemo(
    () => [
      {
        headerName: "Name",
        valueGetter: (params: ValueGetterParams) => {
          const record = params.data;
          if (!record.nPostID) return "(No Match)";
          const key = record.nPostID.trim().toLowerCase();
          return rolesMap[key] || "(No Match)";
        },
        filter: "agTextColumnFilter",
      },
    ],
    [rolesMap]
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [postsData, rolesData, postSmallData] = await Promise.all([
          selectedRow?.ID ? api.getPostsinProject(selectedRow.ID) : [],
          api.getAllRoles(),
          api.getPostSmall(),
        ]);

        setLeftRowData(postsData);
        setRoles(rolesData);
        setPostSmallData(postSmallData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedRow, api, refreshTrigger]);

  const handleSubItemClick = (data: AccessProject) => {
    setSelectedSubItemRow(data);
    setSelectedPostId(data.nPostID); // Update selected post ID when clicking a row
  };

  const handleSubItemDoubleClick = (data: AccessProject) => {
    setSelectedSubItemRow(data);
    setSelectedPostId(data.nPostID); // Update selected post ID when double-clicking a row
    onDoubleClickSubItem(data);
    if (onEditFromLeft) {
      onEditFromLeft();
    }
  };

  const handleAdd = () => {
    if (!selectedPostId) {
      showAlert("warning", null, "Warning", "Please select a post first.");
      return;
    }

    const selectedPost = postSmallData.find(
      (post) => post.ID === selectedPostId
    );
    if (!selectedPost) {
      showAlert("warning", null, "Warning", "Selected post not found.");
      return;
    }

    const newRow: Omit<AccessProject, "ID" | "LastModified"> = {
      nPostID: selectedPostId,
      nProjectID: selectedRow?.ID || "",
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
      IsVisible: true,
      PostName: selectedPost.Name,
      Show_Approval: false,
      Show_Assignment: false,
      Show_CheckList: false,
      Show_Comment: false,
      Show_Lessons: false,
      Show_Logs: false,
      Show_Procedure: false,
      Show_Related: false,
    };

    onDoubleClickSubItem(newRow as AccessProject);
    if (onAddFromLeft) {
      onAddFromLeft();
    }
  };

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

  const handleDelete = async () => {
    if (!selectedSubItemRow) {
      showAlert("warning", null, "Warning", "Please select a row to delete.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete "${selectedSubItemRow.PostName}"?`
      )
    ) {
      return;
    }

    try {
      await api.deleteAccessProject(selectedSubItemRow.ID!);
      setLeftRowData((prevData) =>
        prevData.filter((item) => item.ID !== selectedSubItemRow.ID)
      );
      setSelectedSubItemRow(null);
      setSelectedPostId(""); // Reset selected post ID after deletion
      showAlert(
        "success",
        null,
        "Success",
        "Access project deleted successfully."
      );
    } catch (error) {
      console.error("Error deleting access project:", error);
      showAlert("error", null, "Error", "Failed to delete access project.");
    }
  };

  const handleSelectorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedPostId(value); // Update selected post ID when changing selector

    const selected = postSmallData.find((item) => item.ID === value);
    if (selected) {
      // If we have a selected row, update it with new post data
      if (selectedSubItemRow) {
        const updatedRow = {
          ...selectedSubItemRow,
          nPostID: selected.ID,
          PostName: selected.Name,
        };
        setSelectedSubItemRow(updatedRow);
        onDoubleClickSubItem(updatedRow); // Notify parent of the change
      }
    }
  };

  const handleTableRowDoubleClick = (data: PostSmall) => {
    setSelectedPostSmall(data);
    setSelectedPostId(data.ID); // Update selected post ID when double-clicking in table selector

    if (selectedSubItemRow) {
      const updatedRow = {
        ...selectedSubItemRow,
        nPostID: data.ID,
        PostName: data.Name,
      };
      setSelectedSubItemRow(updatedRow);
      onDoubleClickSubItem(updatedRow);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="h-full p-4">
      {error && <div className="error mb-4 text-red-500">{error}</div>}

      <DynamicSelector
        label="جستجو"
        options={postSmallData.map((item) => ({
          value: item.ID,
          label: item.Name || "NoName",
        }))}
        selectedValue={selectedPostId} // Use selectedPostId instead of selectedSubItemRow?.nPostID
        onChange={handleSelectorChange}
        className="w-full mb-8"
        error={false}
        showButton={true}
        onButtonClick={() => setIsModalOpen(true)}
      />

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
        onDelete={handleDelete}
        onDuplicate={() => {}}
        isLoading={isLoading}
      />

      <DynamicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">انتخاب PostSmall</h2>
          <TableSelector
            columnDefs={[
              { headerName: "ID", field: "ID" },
              { headerName: "Name", field: "Name" },
            ]}
            rowData={postSmallData}
            onRowDoubleClick={handleTableRowDoubleClick}
            onRowClick={setSelectedPostSmall}
            onSelectButtonClick={() => {
              if (selectedPostSmall) {
                setSelectedPostId(selectedPostSmall.ID);
                if (selectedSubItemRow) {
                  const updatedRow = {
                    ...selectedSubItemRow,
                    nPostID: selectedPostSmall.ID,
                    PostName: selectedPostSmall.Name,
                  };
                  setSelectedSubItemRow(updatedRow);
                  onDoubleClickSubItem(updatedRow);
                }
                setIsModalOpen(false);
              }
            }}
            isSelectDisabled={!selectedPostSmall}
          />
        </div>
      </DynamicModal>
    </div>
  );
};

export default LeftProjectAccess;
