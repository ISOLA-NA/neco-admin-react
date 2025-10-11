// src/components/Projects/UpdateAddress/UpdateAddressContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AppServices, { ProjectWithCalendar } from "../../../services/api.services";
import { showAlert } from "../../utilities/Alert/DynamicAlert";

export type AddressNode = {
  ID: number;
  Name: string;
  IsVisible: boolean;
  Address: string;
  ChildProgramID: number;
};

export type TreeNode = AddressNode & {
  children?: TreeNode[];
  _expanded?: boolean;
  _loaded?: boolean;
};

type Ctx = {
  projects: ProjectWithCalendar[];
  selectedProjectId: string;
  setSelectedProjectId: (gid: string) => void;
  roots: TreeNode[];
  loadingRoot: boolean;
  selectedNode: TreeNode | null;
  address: string;
  setAddress: (s: string) => void;
  loadRoots: (gid: string) => Promise<void>;
  toggleExpand: (node: TreeNode) => Promise<void>;
  selectNode: (node: TreeNode) => void;
  saveAddress: () => Promise<void>;
};

const UpdateAddressCtx = createContext<Ctx | null>(null);

export const UpdateAddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectWithCalendar[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const [roots, setRoots] = useState<TreeNode[]>([]);
  const [loadingRoot, setLoadingRoot] = useState(false);

  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [address, setAddress] = useState<string>("");

  // پروژه‌ها
  useEffect(() => {
    (async () => {
      try {
        const list = await AppServices.getAllProjectsWithCalendar();
        setProjects(list);
      } catch (e) {
        console.error("Load projects failed", e);
      }
    })();
  }, []);

  // ریشه‌های یک پروژه
  const loadRoots = async (gid: string) => {
    setSelectedProjectId(gid);
    setSelectedNode(null);
    setAddress("");
    if (!gid) return setRoots([]);

    setLoadingRoot(true);
    try {
      const data = await AppServices.getAddressesByPrjLevel(gid);
      setRoots(
        (data ?? []).map((n) => ({ ...n, children: [], _expanded: false, _loaded: false }))
      );
    } catch (e) {
      console.error("getAddressesByPrjLevel failed", e);
      setRoots([]);
    } finally {
      setLoadingRoot(false);
    }
  };

  const selectNode = (node: TreeNode) => {
    setSelectedNode(node);
    setAddress(node.Address || "");
  };

  const toggleExpand = async (node: TreeNode) => {
    if (!node._expanded) {
      // در حالت expand
      if (!node._loaded) {
        try {
          // نکته‌ی مهم: برای ریشه‌ها ChildProgramID می‌دیم؛
          // برای بقیه‌ی سطوح اگر ChildProgramID نداشت، از خود ID استفاده کن.
          const parentParam = node.ChildProgramID ?? node.ID;
          const kids = await AppServices.getChildren(parentParam);
          const prepared: TreeNode[] = (kids ?? []).map((k) => ({
            ...k,
            children: [],
            _expanded: false,
            _loaded: false,
          }));
          setRoots((prev) => attachChildren(prev, node, prepared, true));
        } catch (e) {
          console.error("getChildren failed", e);
        }
      } else {
        setRoots((prev) => attachChildren(prev, node, node.children ?? [], false));
      }
    } else {
      // در حالت collapse
      setRoots((prev) => mutateNode(prev, node, (n) => ({ ...n, _expanded: false })));
    }
  };

  const saveAddress = async () => {
    if (!selectedNode) return;
    const res = await AppServices.updateAddress(selectedNode.ID, address);
    if (res?.isSuccess) {
      showAlert("success", undefined, undefined, "Update Address Successfully");
      setRoots((prev) =>
        mutateNode(prev, selectedNode, (n) => ({ ...n, Address: address }))
      );
      setSelectedNode((p) => (p ? { ...p, Address: address } : p));
    } else {
      showAlert("error", undefined, undefined, res?.Msg || "Update failed");
    }
  };

  // کمک‌ها
  function sameNode(a: TreeNode, b: TreeNode) {
    return a.ID === b.ID && a.ChildProgramID === b.ChildProgramID;
  }
  function attachChildren(
    list: TreeNode[],
    target: TreeNode,
    children: TreeNode[],
    markLoaded = false
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

  const value = useMemo<Ctx>(
    () => ({
      projects,
      selectedProjectId,
      setSelectedProjectId,
      roots,
      loadingRoot,
      selectedNode,
      address,
      setAddress,
      loadRoots,
      toggleExpand,
      selectNode,
      saveAddress,
    }),
    [projects, selectedProjectId, roots, loadingRoot, selectedNode, address]
  );

  return <UpdateAddressCtx.Provider value={value}>{children}</UpdateAddressCtx.Provider>;
};

export const useUpdateAddress = () => {
  const ctx = useContext(UpdateAddressCtx);
  if (!ctx) throw new Error("useUpdateAddress must be used inside UpdateAddressProvider");
  return ctx;
};
