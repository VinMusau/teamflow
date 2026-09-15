import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import { STATUS_LABELS } from '../../lib/taskConstants';

export default function KanbanColumn({
  status,
  tasks,
  onAddTask,
  onDeleteTask,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-200">
            {STATUS_LABELS[status]}
          </h3>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="rounded p-1 text-lg leading-none text-slate-500 hover:bg-slate-800 hover:text-slate-200"
          aria-label={`Add task to ${STATUS_LABELS[status]}`}
        >
          +
        </button>
      </div>

      <SortableContext
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`min-h-[140px] flex-1 space-y-2 rounded-lg transition ${
            isOver ? 'bg-slate-800/50' : ''
          }`}
        >
          {tasks.length === 0 && (
            <p className="p-3 text-xs text-slate-600">Drop tasks here</p>
          )}
          {tasks.map((task) => (
            <KanbanCard
              key={task._id}
              task={task}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}