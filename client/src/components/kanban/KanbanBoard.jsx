import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import { STATUSES } from '../../lib/taskConstants';

const COLUMN_IDS = STATUSES.map((s) => s.value);

export default function KanbanBoard({
  tasks,
  onTaskMoved,
  onAddTask,
  onDeleteTask,
}) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const tasksByColumn = useMemo(() => {
    const grouped = Object.fromEntries(COLUMN_IDS.map((id) => [id, []]));
    for (const t of tasks ?? []) {
      if (grouped[t.status]) grouped[t.status].push(t);
    }
    for (const id of COLUMN_IDS) {
      grouped[id].sort((a, b) => a.order - b.order);
    }
    return grouped;
  }, [tasks]);

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const movingTask = tasks.find((t) => t._id === active.id);
    if (!movingTask) return;

    // Figure out the target column
    let targetStatus;
    if (COLUMN_IDS.includes(over.id)) {
      targetStatus = over.id;
    } else {
      const overTask = tasks.find((t) => t._id === over.id);
      if (!overTask) return;
      targetStatus = overTask.status;
    }

    // Target column without the moving task
    const targetColumnTasks = tasksByColumn[targetStatus].filter(
      (t) => t._id !== movingTask._id
    );

    // Compute target index
    let targetIndex;
    if (COLUMN_IDS.includes(over.id)) {
      targetIndex = targetColumnTasks.length; // dropped on empty area → end
    } else {
      const idx = targetColumnTasks.findIndex((t) => t._id === over.id);
      targetIndex = idx === -1 ? targetColumnTasks.length : idx;
    }

    // Fractional order between neighbors
    const before = targetColumnTasks[targetIndex - 1]?.order;
    const after = targetColumnTasks[targetIndex]?.order;

    let newOrder;
    if (before === undefined && after === undefined) newOrder = 0;
    else if (before === undefined) newOrder = after - 1;
    else if (after === undefined) newOrder = before + 1;
    else newOrder = (before + after) / 2;

    // Bail out if nothing actually changed
    if (
      movingTask.status === targetStatus &&
      movingTask.order === newOrder
    ) {
      return;
    }

    onTaskMoved({
      taskId: movingTask._id,
      status: targetStatus,
      order: newOrder,
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMN_IDS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByColumn[status]}
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}