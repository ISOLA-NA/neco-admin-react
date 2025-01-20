import { useMemo, useState } from "react";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
type Column = {
  id: string | number;
  title: string;
};

type Task = {
  id: string | number;
  columnId: string | number;
  content: string;
};
function generateId() {
  return Math.floor(Math.random() * 10001);
}
export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([]);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const createTask = (columnId: string | number) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };

    setTasks([...tasks, newTask]);
  };

  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns([...columns, columnToAdd]);
  };

  const deleteColumn = (id: number | string) => {
    const filteredColumns = columns.filter((column) => column.id !== id);
    setColumns(filteredColumns);
  };

  const updateColumn = (id: number | string, title: string) => {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });

    setColumns(newColumns);
  };

  const onDragStart = (event: DragStartEvent) => {
    console.log("onDragStart", event);
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;
    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (column) => column.id === activeColumnId,
      );
      const overColumnIndex = columns.findIndex(
        (column) => column.id === overColumnId,
      );

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );
  return (
    <div className="h-full overflow-x-auto flex gap-2 items-center ">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="mx-auto flex h-full">
          <div className="flex gap-2">
            <SortableContext items={columnsId}>
              {columns.map((column) => (
                <ColumnContainer
                  key={column.id}
                  column={column}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  tasks={tasks.filter((task) => task.columnId === column.id)}
                />
              ))}
            </SortableContext>
          </div>
          <button
            className="h-[60px] w-[360px] min-w-[350px] cursor-pointer rounded-lg bg-black border-2 border-black p-4 ring-rose-500 hover:ring-2 text-white"
            onClick={createNewColumn}
          >
            Add Column
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                tasks={tasks.filter((task) => task.columnId === column.id)}
              />
            )}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </div>
  );
}
