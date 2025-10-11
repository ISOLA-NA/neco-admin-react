// src/components/Projects/UpdateAddress.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FiChevronRight, FiChevronDown, FiRefreshCcw } from "react-icons/fi";

import AppServices, {
  AddressNode,
  ProjectWithCalendar,
} from "../../services/api.services";

import DynamicSelector from "../utilities/DynamicSelector";
import DynamicInput from "../utilities/DynamicInput";
import { showAlert } from "../utilities/Alert/DynamicAlert"; // ← مسیر درست: Projects/.. -> utilities/Alert

type TreeNode = AddressNode & {
  children?: TreeNode[];
  _expanded?: boolean;
  _loaded?: boolean;
};

const UpdateAddress: React.FC = () => {
  const [projects, setProjects] = useState<ProjectWithCalendar[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const [roots, setRoots] = useState<TreeNode[]>([]);
  const [loadingRoot, setLoadingRoot] = useState(false);

  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [address, setAddress] = useState<string>("");

  const [updatingAddress, setUpdatingAddress] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await AppServices.getAllProjectsWithCalendar();
      setProjects(list);
    })();
  }, []);

  const loadRoots = async (gid: string) => {
    if (!gid) {
      setRoots([]);
      setSelectedNode(null);
      setAddress("");
      return;
    }
    setLoadingRoot(true);
    try {
      const data = await AppServices.getAddressesByPrjLevel(gid);
      const prepared: TreeNode[] = data.map((n) => ({
        ...n,
        children: [],
        _expanded: false,
        _loaded: false,
      }));
      setRoots(prepared);
      setSelectedNode(null);
      setAddress("");
    } finally {
      setLoadingRoot(false);
    }
  };

  const handleProjectChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const gid = e.target.value;
    setSelectedProjectId(gid);
    await loadRoots(gid);
  };

  const handleRefresh = async () => {
    if (selectedProjectId) await loadRoots(selectedProjectId);
  };

  const handleSelectNode = (node: TreeNode) => {
    setSelectedNode(node);
    setAddress(node.Address || "");
  };

  const toggleExpand = async (node: TreeNode) => {
    if (!node._expanded) {
      if (!node._loaded) {
        const kids = await AppServices.getChildren(node.ChildProgramID); // id = ChildProgramID
        const prepared: TreeNode[] = kids.map((k) => ({
          ...k,
          children: [],
          _expanded: false,
          _loaded: false,
        }));
        setRoots((prev) => attachChildren(prev, node, prepared, true));
      } else {
        setRoots((prev) => attachChildren(prev, node, node.children ?? [], false, true));
      }
    } else {
      setRoots((prev) => mutateNode(prev, node, (n) => ({ ...n, _expanded: false })));
    }
  };

  function attachChildren(
    list: TreeNode[],
    target: TreeNode,
    children: TreeNode[],
    markLoaded = false,
    _justExpand = false
  ): TreeNode[] {
    return list.map((n) => {
      if (sameNode(n, target)) {
        return {
          ...n,
          children: markLoaded ? children : n.children,
          _loaded: markLoaded ? true : n._loaded,
          _expanded: true,
        };
      }
      if (n.children && n.children.length) {
        return { ...n, children: attachChildren(n.children, target, children, markLoaded) };
      }
      return n;
    });
  }

  function mutateNode(
    list: TreeNode[],
    target: TreeNode,
    mutate: (n: TreeNode) => TreeNode
  ): TreeNode[] {
    return list.map((n) => {
      if (sameNode(n, target)) return mutate(n);
      if (n.children && n.children.length) {
        return { ...n, children: mutateNode(n.children, target, mutate) };
      }
      return n;
    });
  }

  function sameNode(a: TreeNode, b: TreeNode) {
    return a.ID === b.ID && a.ChildProgramID === b.ChildProgramID;
  }

  // === دکمه Edit Address
  const handleEditAddress = async () => {
    if (!selectedNode) return;
    try {
      setUpdatingAddress(true);

      // طبق فیدلر: id = ID نود، str = آدرس
      const res = await AppServices.updateAddress(selectedNode.ID, address);

      if (res?.isSuccess) {
        // پیام موفقیت
        showAlert("success", undefined, undefined, "Update Address Successfully");

        // آدرس نود انتخابی را در State هم به‌روز کن
        setRoots((prev) =>
          mutateNode(prev, selectedNode, (n) => ({ ...n, Address: address }))
        );
        setSelectedNode((prev) => (prev ? { ...prev, Address: address } : prev));
      } else {
        showAlert("error", undefined, undefined, res?.Msg || "Update failed");
      }
    } catch (e) {
      showAlert("error", undefined, undefined, "Update failed");
    } finally {
      setUpdatingAddress(false);
    }
  };

  const projectOptions = useMemo(
    () =>
      projects.map((p) => ({
        value: p.ID,
        label: p.ProjectName,
      })),
    [projects]
  );

  const TreeView: React.FC<{ nodes: TreeNode[] }> = ({ nodes }) => {
    if (!nodes.length) return <div className="text-gray-400 text-sm px-2 py-3">موردی وجود ندارد…</div>;
    return (
      <ul className="space-y-1">
        {nodes.map((n) => (
          <li key={`${n.ID}-${n.ChildProgramID}`}>
            <div
              className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                selectedNode && sameNode(n, selectedNode)
                  ? "bg-indigo-100"
                  : "hover:bg-gray-100"
              }`}
            >
              <button
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200"
                title={n._expanded ? "Collapse" : "Expand"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(n);
                }}
              >
                {n._expanded ? <FiChevronDown /> : <FiChevronRight />}
              </button>

              <div
                className="flex-1 truncate"
                onClick={() => handleSelectNode(n)}
                title={n.Name}
              >
                {n.Name}
              </div>
            </div>

            {n._expanded && n.children && n.children.length > 0 && (
              <div className="pl-6 mt-1">
                <TreeView nodes={n.children} />
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Select پروژه + Refresh */}
      <div className="flex items-center gap-2">
        <div className="min-w-[260px]">
          <DynamicSelector
            label="Project"
            options={projectOptions}
            selectedValue={selectedProjectId}
            onChange={handleProjectChange}
          />
        </div>

        <button
          onClick={handleRefresh}
          title="Refresh"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
          disabled={!selectedProjectId || loadingRoot}
        >
          <FiRefreshCcw className={loadingRoot ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* بدنه: درخت / آدرس */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="h-full overflow-auto border rounded-md bg-white p-3">
          {loadingRoot ? (
            <div className="text-gray-500">در حال بارگذاری…</div>
          ) : selectedProjectId ? (
            <TreeView nodes={roots} />
          ) : (
            <div className="text-gray-500">ابتدا یک پروژه انتخاب کنید…</div>
          )}
        </div>

        <div className="h-full overflow-auto border rounded-md bg-white p-4 space-y-3">
          <DynamicInput
            name="Address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder=""
          />

          <div className="flex gap-2">
            <button
              onClick={handleEditAddress}
              disabled={!selectedNode || !address || updatingAddress}
              className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {updatingAddress ? "Saving..." : "Edit Address"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateAddress;
