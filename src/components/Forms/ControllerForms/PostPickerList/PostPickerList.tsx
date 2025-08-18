// src/components/ControllerForms/LookUp/PostPickerList/PostPickerList.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import DynamicModal from "../../../utilities/DynamicModal";
import RolePickerTabs from "./RolePickerTabs";
import TableSelector from "../../../General/Configuration/TableSelector";
import { useApi } from "../../../../context/ApiContext";
import { useTranslation } from "react-i18next";

export interface SelectedItem {
  id: string;
  name: string;
}

interface PostPickerListProps {
  sourceType?: "roles" | "projects";
  initialMetaType?: string;
  data?: { [key: string]: string | undefined };
  metaFieldKey?: string;
  fullWidth?: boolean;
  onMetaChange?: (metaUpdated: { [key: string]: string }) => void;
  label?: string;
  emptyText?: string;
}

const PostPickerList: React.FC<PostPickerListProps> = ({
  sourceType = "roles",
  initialMetaType = "",
  data,
  metaFieldKey = "metaType1",
  fullWidth = false,
  onMetaChange,
  label,
  emptyText,
}) => {
  const { t } = useTranslation();
  const finalLabel = label || t("PostPickerList.Labels.DefaultValues");
  const finalEmptyText =
    emptyText || t("PostPickerList.Labels.NoDefaultValues");

  const api = useApi();

  /* ---------- state ---------- */
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  /* ---------- derive init string ---------- */
  const metaInit = initialMetaType?.trim()
    ? initialMetaType.trim()
    : (data?.[metaFieldKey] || "").trim();

  /* ---------- load only when metaInit really changes ---------- */
  const prevInitRef = useRef<string>();
  useEffect(() => {
    if (metaInit === prevInitRef.current) return;
    prevInitRef.current = metaInit;
    setLoading(true);

    const ids = metaInit.split("|").filter(Boolean);

    (async () => {
      try {
        if (sourceType === "projects") {
          const list = await api.getAllProject();
          setProjects(list);
          setSelected(
            list
              .filter((p: any) => ids.includes(String(p.ID)))
              .map((p: any) => ({ id: String(p.ID), name: p.ProjectName }))
          );
        } else {
          const list = await api.getAllRoles();
          setRoles(list);
          setSelected(
            list
              .filter((r: any) => ids.includes(String(r.ID)))
              .map((r: any) => ({ id: String(r.ID), name: r.Name }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [api, sourceType, metaInit, metaFieldKey]);

  /* ---------- notify parent when list really changes ---------- */
  const prevJoinedRef = useRef<string>("");
  useEffect(() => {
    if (!onMetaChange) return;
    const joined = selected.map((i) => i.id).join("|");
    if (joined === prevJoinedRef.current) return;
    prevJoinedRef.current = joined;
    onMetaChange({ [metaFieldKey]: joined });
  }, [selected, metaFieldKey, onMetaChange]);

  /* ---------- handlers ---------- */
  const addItems = useCallback((items: SelectedItem[]) => {
    setSelected((prev) => [
      ...prev.filter((p) => !items.some((n) => n.id === p.id)),
      ...items,
    ]);
    setModalOpen(false);
  }, []);

  const remove = (id: string) =>
    setSelected((prev) => prev.filter((i) => i.id !== id));

  /* ---------- modal content ---------- */
  const modalContent =
    sourceType === "projects" ? (
      <div className="p-4 min-h-[400px] min-w-[600px]">
        <TableSelector
          columnDefs={[{ headerName: "Project", field: "ProjectName" }]}
          rowData={projects}
          onRowClick={() => {}}
          onRowDoubleClick={(row: any) =>
            row.ID && addItems([{ id: String(row.ID), name: row.ProjectName }])
          }
          onSelectButtonClick={(row: any) =>
            row.ID && addItems([{ id: String(row.ID), name: row.ProjectName }])
          }
        />
      </div>
    ) : (
      <div className="p-4 min-h-[400px] min-w-[600px]">
        <RolePickerTabs
          onSelect={addItems}
          onClose={() => setModalOpen(false)}
        />
      </div>
    );

  /* ---------- render ---------- */
  return (
    <div
      className="p-4 bg-white rounded-lg border border-gray-300"
      style={{ minHeight: 120, width: fullWidth ? "100%" : "auto" }}
    >
      <div className="flex items-center justify-between mb-2">
        <label className="text-gray-700 text-sm font-semibold">
          {finalLabel}
        </label>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="bg-indigo-500 text-white px-2 py-1 rounded-md hover:bg-indigo-600 flex items-center"
        >
          <FaPlus className="mr-1" /> {t("PostPickerList.Buttons.Add")}
        </button>
      </div>

      <div className="overflow-y-auto max-h-32 border border-gray-200 p-2 rounded">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-gray-500">
              {t("PostPickerList.Messages.Loading")}
            </span>
          </div>
        ) : selected.length ? (
          <div className="flex flex-wrap gap-2">
            {selected.map((item) => (
              <div
                key={item.id}
                className="flex items-center bg-gray-100 px-3 py-1 rounded-md"
              >
                <span>{item.name}</span>
                <button
                  onClick={() => remove(item.id)}
                  className="text-red-500 ml-2 hover:text-red-700"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">{finalEmptyText}</p>
        )}
      </div>

      <DynamicModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {modalContent}
      </DynamicModal>
    </div>
  );
};

export default PostPickerList;
