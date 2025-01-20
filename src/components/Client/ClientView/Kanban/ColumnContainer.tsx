import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
type Column = {
  id: string | number;
  title: string;
};
type Task = {
  id: string | number;
  columnId: string | number;
  content: string;
};
interface Props {
  column: Column;
  deleteColumn: (id: string | number) => void;
  updateColumn: (id: string | number, title: string) => void;
  createTask: (columnId: string | number) => void;
  tasks: Task[];
}

export default function ColumnContainer(props: Props) {
  const { column, deleteColumn, updateColumn, createTask, tasks } = props;

  const [editMode, setEditMode] = useState(false);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border-2 border-rose-400 p-4 rounded-lg  w-[270px] h-full opacity-60 "
      ></div>
    );
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-2 border-gray-200 p-4 rounded-lg w-[270px] h-full flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEditMode(true);
        }}
        className="bg-slate-900 text-md text-yellow-100 h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-2 flex items-center justify-between"
      >
        <div className="flex gap-2">
          <div className="flex justify-center items-centerbg-black text-sm rounded-full">
            0
          </div>
          {!editMode && column.title}
          {editMode && (
            <input
              className="bg-black focus:border-rose-400 border rounded outline-none px-2"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => {
                setEditMode(false);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
            />
          )}
        </div>
        <button
          onClick={() => deleteColumn(column.id)}
          className="stroke-gray-500 rounded px-1 py-2"
        >
          Delete
        </button>
      </div>
      <div className="grow flex flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        {tasks.map((task) => (
          <div key={task.id}>{task.content}</div>
        ))}
      </div>
      <button
        onClick={() => {
          createTask(column.id);
        }}
      >
        Add Task
      </button>
    </div>
  );
}
