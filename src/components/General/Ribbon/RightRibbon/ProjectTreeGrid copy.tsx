/* src/components/ProjectTreeTable.tsx */
import React, { useEffect, useState } from "react";
import AppServices, { ProjectNode } from "../../../../services/api.services";

interface Props {
  projectId: string;
  onSelect: (node: ProjectNode | null) => void;
}

/* گره بازگشتی */
const TreeNode: React.FC<{
  node: ProjectNode;
  depth: number;
  onSelectLeaf: (n: ProjectNode) => void;
}> = ({ node, depth, onSelectLeaf }) => {
  const [children, setChildren] = useState<ProjectNode[] | undefined>(
    node.HasChild ? undefined : [] // اگر سرور فیلدی نداد، undefined یعنی «هنوز نمی‌دانیم»
  );
  const [open, setOpen] = useState(false);

  const indent = { paddingLeft: depth * 16 };

  /* بارگذاری تنبل */
  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);

    if (next && children === undefined) {
      console.log("📥 Fetch children of", node.ID);
      const kids = await AppServices.getPrjChildren(node.ID);
      console.log("✅ Children:", kids);
      setChildren(kids);
      if (kids.length === 0) {
        // این گره برگ شد
        setOpen(false);
      }
    }
  };

  /* اگر برگ نهایی است */
  if (children !== undefined && children.length === 0) {
    return (
      <div
        style={indent}
        className="cursor-pointer py-1 hover:bg-blue-50 rounded"
        onClick={() => {
          console.log("🎯 Leaf selected:", node);
          onSelectLeaf(node);
        }}
      >
        {node.Name}
      </div>
    );
  }

  /* گره داخلی یا بالقوه داخلی */
  return (
    <div>
      <div
        style={indent}
        className="cursor-pointer flex items-center gap-1 py-1 hover:bg-gray-100 rounded select-none"
        onClick={toggleOpen}
      >
        <span>{open ? "▼" : "▶"}</span>
        <span>{node.Name}</span>
      </div>

      {open && (
        <div>
          {children === undefined ? (
            <p className="pl-8 text-sm text-gray-400">Loading…</p>
          ) : (
            children.map((c) => (
              <TreeNode
                key={c.ID}
                node={c}
                depth={depth + 1}
                onSelectLeaf={onSelectLeaf}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

/* ریشهٔ درخت */
const ProjectTreeTable: React.FC<Props> = ({ projectId, onSelect }) => {
  const [roots, setRoots] = useState<ProjectNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    console.log("📥 Fetch root for project:", projectId);
    AppServices.getPrjRoot(projectId)
      .then((data) => {
        console.log("✅ Root programs:", data);
        /* اگر سرور HasChild ندارد، به همه مقدار true می‌دهیم تا Expand بخورد */
        const fixed = data.map((d) =>
          Object.prototype.hasOwnProperty.call(d, "HasChild")
            ? d
            : { ...d, HasChild: true }
        );
        setRoots(fixed);
        onSelect(null);
      })
      .finally(() => setLoading(false));
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
            onSelectLeaf={(n) => onSelect(n)}
          />
        ))}
    </div>
  );
};

export default ProjectTreeTable;
