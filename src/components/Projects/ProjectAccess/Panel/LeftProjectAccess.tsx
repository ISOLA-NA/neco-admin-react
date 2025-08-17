/* ----------------------------------------------------------
   src/components/Projects/ProjectAccess/Panel/LeftProjectAccess.tsx
   ---------------------------------------------------------- */
import React, { useState, useEffect, useMemo } from "react";
import { FaTrash } from "react-icons/fa";
import SelectorProjectAccess, { OptionType } from "../SelectorProjectAccess";
import {
  AccessProject,
  Role,
  PostSmall,
} from "../../../../services/api.services";
import { useApi } from "../../../../context/ApiContext";
import { showAlert } from "../../../utilities/Alert/DynamicAlert";
import { useTranslation } from "react-i18next";
import DynamicConfirm from "../../../utilities/DynamicConfirm";

interface LeftProjectAccessProps {
  selectedRow?: { ID: string };
  editMode: "add" | "edit";
  currentAccess: AccessProject;
  onEditStart: (row: AccessProject) => void;
  onAccessChange: (changes: Partial<AccessProject>) => void;
  refreshTrigger: number;
}

const LeftProjectAccess: React.FC<LeftProjectAccessProps> = ({
  selectedRow,
  currentAccess,
  onEditStart,
  onAccessChange,
  refreshTrigger,
}) => {
  const api = useApi();
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isRtl = dir === "rtl";

  /* ----------------------------- state ------------------------------ */
  const [rows, setRows] = useState<AccessProject[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [posts, setPosts] = useState<PostSmall[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Confirm state for delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<AccessProject | null>(null);

  /* -------------------- maps & selector options --------------------- */
  const rolesMap = useMemo(() => {
    const m: Record<string, string> = {};
    roles.forEach((r) => {
      if (r.ID) m[r.ID.trim().toLowerCase()] = r.Name;
    });
    return m;
  }, [roles]);

  const options: OptionType[] = useMemo(
    () => posts.map((p) => ({ value: String(p.ID), label: p.Name })),
    [posts]
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((r) => {
        const k = (r.nPostID || "").trim().toLowerCase();
        return k && rolesMap[k];
      }),
    [rows, rolesMap]
  );

  /* ----------------------- data fetch ----------------------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      if (selectedRow?.ID) {
        const [rs, rl, ps] = await Promise.all([
          api.getPostsinProject(selectedRow.ID),
          api.getAllRoles(),
          api.getPostSmall(),
        ]);
        setRows(rs);
        setRoles(rl);
        setPosts(ps);
      }
      setLoading(false);
      setSelectedRowId(null);
    })();
  }, [selectedRow, api, refreshTrigger]);

  /* ---------------- sync selector with state ---------------- */
  useEffect(() => {
    setSelectedPostId(String(currentAccess.nPostID ?? ""));
  }, [currentAccess.nPostID]);

  /* ----------------------- handlers ------------------------- */
  const handlePostChange = (v: string) => {
    setSelectedPostId(v);
    onAccessChange({
      nPostID: v,
      PostName: options.find((o) => o.value === v)?.label || "",
    });
  };

  const handleSelectRow = (r: AccessProject) => {
    setSelectedRowId(r.ID);
    onEditStart(r); // تأیید ادیت در هدر (PAHeader) انجام می‌شود
  };

  // OPEN delete confirm
  const handleAskDelete = (r: AccessProject) => {
    setRowToDelete(r);
    setConfirmOpen(true);
  };

  // CONFIRM delete action
  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    try {
      await api.deleteAccessProject(rowToDelete.ID!);
      setRows((prev) => prev.filter((x) => x.ID !== rowToDelete.ID));
      showAlert("success", null, "", t("Alerts.Deleted.Deleted", { defaultValue: "Deleted successfully." }));
    } catch (e) {
      showAlert("error", null, t("DynamicConfirm.Confirmations.Default.Title", { defaultValue: "Error" }), t("Alerts.Errors.Default", { defaultValue: "Failed to delete." }));
    } finally {
      setConfirmOpen(false);
      setRowToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setRowToDelete(null);
  };

  /* --------------------------- UI --------------------------- */
  return (
    <>
      {/* DynamicConfirm for Delete */}
      <DynamicConfirm
        isOpen={confirmOpen}
        variant="delete"
        title={t("DynamicConfirm.Confirmations.Delete.Title", {
          defaultValue: "Delete Confirmation",
        })}
        message={t("DynamicConfirm.Confirmations.Delete.Message", {
          defaultValue: "Are you sure you want to perform the delete operation?",
        })}
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
      />

      <div className="h-full p-2 flex flex-col" dir={dir}>
        {/* Select Post */}
        <div className="mb-2">
          <SelectorProjectAccess
            options={options}
            selectedValue={selectedPostId}
            onChange={handlePostChange}
            loading={loading}
            disabled={false}
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto border rounded bg-white">
          <table className="w-full text-xs border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className={`p-2 ${isRtl ? "text-right" : "text-left"}`}>
                  {t("ProjectAccess.Name", { defaultValue: "Name" })}
                </th>
                <th className="p-2 text-center">
                  {t("ProjectAccess.Actions", { defaultValue: "Actions" })}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-4 text-center">
                    No records.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr
                    key={r.ID}
                    onClick={() => handleSelectRow(r)}
                    className={`cursor-pointer ${
                      selectedRowId === r.ID
                        ? `${
                            isRtl ? "border-r-4" : "border-l-4"
                          } border-blue-400 bg-blue-50`
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-2 truncate max-w-[200px]">
                      {r.PostName || rolesMap[r.nPostID.trim().toLowerCase()]}
                    </td>

                    {/* ستون Actions — فقط Delete (دکمه Edit حذف شد) */}
                    <td className="p-2">
                      <div className="flex items-center justify-center gap-2 flex-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAskDelete(r);
                          }}
                          className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-[0.8rem] flex items-center gap-2"
                          aria-label={t("Global.Delete", {
                            defaultValue: "Delete",
                          })}
                          title={t("Global.Delete", { defaultValue: "Delete" })}
                        >
                          <FaTrash />
                          <span>
                            {t("Global.Delete", { defaultValue: "Delete" })}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default LeftProjectAccess;
