// src/components/ProjectTreeTable.tsx
import React, { useEffect, useState } from "react";
import AppServices, { ProjectNode as ServerNode } from "../../../../services/api.services";

// مدل داخلی هر گره
interface Node {
  ID: number;
  Name: string;
  subProgramID: number;
}

interface Props {
  projectId: string;
  onSelect: (node: Node | null) => void;
  selectedNode?: Node | null; // برای هایلایت
}

const TreeNode: React.FC<{
  node: Node;
  depth: number;
  onSelectLeaf: (n: Node) => void;
  selectedNode?: Node | null;
}> = ({ node, depth, onSelectLeaf, selectedNode }) => {
  const [children, setChildren] = useState<Node[] | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const indent = { paddingLeft: depth * 16 };

  const loadChildren = async () => {
    try {
      const raw = await AppServices.getPrjChildren(node.subProgramID);
      if (!raw || raw.length === 0) {
        setChildren([]);
      } else {
        const mapped: Node[] = raw.map((d: ServerNode) => ({
          ID: d.ID,
          Name: d.Name,
          subProgramID: (d as any).subProgramID ?? d.ID,
        }));
        setChildren(mapped);
      }
    } catch (err) {
      setChildren([]);
    }
  };

  const onClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectLeaf(node);
    if (children && children.length === 0) return;
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && children === undefined) await loadChildren();
  };

  // فقط وقتی children هنوز undefined یا بعد از لود دارای length باشد فلش نمایش بده
  const showExpander = children === undefined || (children && children.length > 0);

  // مقایسه برای انتخاب (بر اساس ID کافی است)
  const isSelected = selectedNode && selectedNode.ID === node.ID;

  return (
    <div>
      <div
        style={indent}
        onClick={onClick}
        className={`flex items-center gap-1 py-1 rounded cursor-pointer select-none
          ${isSelected ? "bg-orange-100 font-bold text-orange-700" : "hover:bg-gray-100"}
        `}
      >
        {showExpander && <span>{open ? "▼" : "▶"}</span>}
        <span className="flex-1">{node.Name}</span>
      </div>
      {open && children && children.length > 0 && (
        children.map((c) => (
          <TreeNode
            key={c.ID}
            node={c}
            depth={depth + 1}
            onSelectLeaf={onSelectLeaf}
            selectedNode={selectedNode}
          />
        ))
      )}
    </div>
  );
};

const ProjectTreeTable: React.FC<Props> = ({ projectId, onSelect, selectedNode }) => {
  const [roots, setRoots] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRoots = async () => {
      if (!projectId) {
        setRoots([]);
        return;
      }
      setLoading(true);
      try {
        const raw = await AppServices.getPrjRoot(projectId);
        const mapped: Node[] = raw.map((d: ServerNode) => ({
          ID: d.ID,
          Name: d.Name,
          subProgramID: (d as any).subProgramID ?? d.ID,
        }));
        setRoots(mapped);
        onSelect(null); // ریست انتخاب
      } catch (err) {
        setRoots([]);
      } finally {
        setLoading(false);
      }
    };
    loadRoots();
    // eslint-disable-next-line
  }, [projectId]);

  return (
    <div className="border rounded h-full overflow-auto p-2">
      {loading && <p className="text-center text-gray-500 py-3">Loading…</p>}
      {!loading && roots.length === 0 && (
        <p className="text-center text-gray-500 py-3">داده‌ای یافت نشد…</p>
      )}
      {!loading &&
        roots.map((r) => (
          <TreeNode
            key={r.ID}
            node={r}
            depth={0}
            onSelectLeaf={onSelect}
            selectedNode={selectedNode}
          />
        ))}
    </div>
  );
};

export default ProjectTreeTable;
