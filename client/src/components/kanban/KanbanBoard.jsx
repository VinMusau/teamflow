import { useMemo, useRef, useState } from 'react';
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
  onCardClick,
}) {
  const [activeTask, setActiveTask] = useState(null);
  const draggedRef = useRef(false);

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
    draggedRef.current = true;
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event) => {
    setActiveTask(null);
    const { active, over } = event;

    // Allow the click event to fire and get suppressed by the ref
    setTimeout(() => {
      draggedRef.current = false;
    }, 100);

    if (!over) return;

    const movingTask = tasks.find((t) => t._id === active.id);
    if (!movingTask) return;

    let targetStatus;
    if (COLUMN_IDS.includes(over.id)) {
      targetStatus = over.id;
    } else {
      const overTask = tasks.find((t) => t._id === over.id);
      if (!overTask) return;
      targetStatus = overTask.status;
    }

    const targetColumnTasks = tasksByColumn[targetStatus].filter(
      (t) => t._id !== movingTask._id
    );

    let targetIndex;
    if (COLUMN_IDS.includes(over.id)) {
      targetIndex = targetColumnTasks.length;
    } else {
      const idx = targetColumnTasks.findIndex((t) => t._id === over.id);
      targetIndex = idx === -1 ? targetColumnTasks.length : idx;
    }

    const before = targetColumnTasks[targetIndex - 1]?.order;
    const after = targetColumnTasks[targetIndex]?.order;

    let newOrder;
    if (before === undefined && after === undefined) newOrder = 0;
    else if (before === undefined) newOrder = after - 1;
    else if (after === undefined) newOrder = before + 1;
    else newOrder = (before + after) / 2;

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

  const handleCardClick = (task) => {
    // Ignore clicks that were actually drags
    if (draggedRef.current) return;
    onCardClick?.(task);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveTask(null);
        setTimeout(() => {
          draggedRef.current = false;
        }, 100);
      }}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMN_IDS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByColumn[status]}
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}