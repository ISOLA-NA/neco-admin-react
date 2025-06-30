// src/components/WindowsCommandSelectorModal.tsx
import React, { useEffect, useState } from "react";
import DataTable from "../../../TableDynamic/DataTable";
import DynamicSelector from "../../../utilities/DynamicSelector";
import HelpBox from "./HelpBox";
import ProjectTreeTable from "./ProjectTreeGrid";
import AppServices, {
  EntityTypeComplete,
  ProgramType,
  ProjectWithCalendar,
  ProjectNode,
} from "../../../../services/api.services";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cmd: string) => void;
}

const WindowsCommandSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // داده‌ها
  const [entityTypes, setEntityTypes] = useState<EntityTypeComplete[]>([]);
  const [projects, setProjects] = useState<ProjectWithCalendar[]>([]);
  const [programTypes, setProgramTypes] = useState<ProgramType[]>([]);

  // انتخاب‌ها
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // بارگیری اولیه
  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(0);
    setSelectedRow(null);
    setSelectedProjectId("");
    setLoading(true);

    Promise.all([
      AppServices.getTableTransmittal(),
      AppServices.getAllProjectsWithCalendar(),
      AppServices.getAllProgramType(),
    ])
      .then(([forms, projs, ptypes]) => {
        setEntityTypes(forms);
        setProjects(projs);
        setProgramTypes(ptypes);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  // ستون‌های جدول‌ها
  const formCols = [
    { headerName: "Name", field: "Name", flex: 1 },
    { headerName: "CateA", field: "EntityCateAName", flex: 1 },
    { headerName: "CateB", field: "EntityCateBName", flex: 1 },
  ];
  const progTypeCols = [
    { headerName: "Name", field: "Name", flex: 1 },
    { headerName: "Description", field: "Describtion", flex: 1 },
  ];

  // فرمان نهایی
  const buildCmd = (): string => {
    if (!selectedRow) return "";
    if (activeTab === 0)
      return `NecoPM:\\ncmd\\forms?TypeID=${selectedRow.ID}`;
    if (activeTab === 1)
      return `NecoPM:\\cmd\\prj?id=${selectedRow.subProgramID}`;
    return `NecoPM:\\cmd\\prg?id=${selectedRow.ID}`;
  };

  console.log("rrrrrrrrrr",selectedRow)

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg h-[80vh] w-[850px] flex flex-col p-4">
        <HelpBox />

        {/* تب‌ها */}
        <div className="flex gap-2 mb-3 border-b pb-2">
          {["cmd form command", "cmd prj command", "cmd prg command"].map(
            (t, i) => (
              <button
                key={i}
                className={`px-4 py-1 rounded-t ${
                  activeTab === i
                    ? "bg-blue-100 border-b-2 border-blue-600 font-bold"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  setActiveTab(i);
                  setSelectedRow(null);
                }}
              >
                {t}
              </button>
            )
          )}
          <button
            className="ml-auto text-xl px-2 hover:text-red-500"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* محتوا */}
        <div className="flex-1 min-h-0">
          {/* Form Tab */}
          {activeTab === 0 && (
            <DataTable
              columnDefs={formCols}
              rowData={entityTypes}
              onRowClick={(row) => setSelectedRow(row)}
              isLoading={loading}
              showAddIcon={false}
              showEditIcon={false}
              showDeleteIcon={false}
              showDuplicateIcon={false}
              domLayout="normal"
            />
          )}

          {/* Project Tab */}
          {activeTab === 1 && (
            <div className="flex flex-col h-full min-h-0">
              <DynamicSelector
                label="Select Project"
                options={projects.map((p) => ({
                  value: p.ID,
                  label: p.ProjectName,
                }))}
                selectedValue={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setSelectedRow(null);
                }}
                className="mb-2"
              />

              {selectedProjectId ? (
                <ProjectTreeTable
                  projectId={selectedProjectId}
                  onSelect={(n: ProjectNode | null) => setSelectedRow(n)}
                  selectedNode={selectedRow} // هایلایت انتخاب
                />
              ) : (
                <p className="text-center text-gray-500 mt-8">
                  ابتدا یک پروژه انتخاب کنید…
                </p>
              )}
            </div>
          )}

          {/* Program Type Tab */}
          {activeTab === 2 && (
            <DataTable
              columnDefs={progTypeCols}
              rowData={programTypes}
              onRowClick={(row) => setSelectedRow(row)}
              isLoading={loading}
              showAddIcon={false}
              showEditIcon={false}
              showDeleteIcon={false}
              showDuplicateIcon={false}
              domLayout="normal"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            disabled={!selectedRow}
            className={`px-8 py-2 rounded font-bold transition ${
              selectedRow
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-orange-300 text-gray-100 cursor-not-allowed"
            }`}
            onClick={() => {
              const cmd = buildCmd();
              onSelect(cmd);
              onClose();
            }}
          >
            Select
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default WindowsCommandSelectorModal;
