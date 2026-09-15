import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../../lib/taskConstants';

export default function KanbanCard({
  task,
  overlay = false,
  onDelete,
  onClick,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, disabled: overlay });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const overdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !overlay && onClick?.(task)}
      className={`group relative cursor-grab rounded-lg border border-slate-800 bg-slate-950 p-3 active:cursor-grabbing ${
        overlay ? 'shadow-2xl ring-2 ring-indigo-500' : ''
      }`}
    >
      <p className="pr-6 text-sm font-medium text-slate-100">{task.title}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className={PRIORITY_COLORS[task.priority]}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        {task.assignee && (
          <>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{task.assignee.name}</span>
          </>
        )}
        {task.dueDate && (
          <>
            <span className="text-slate-600">·</span>
            <span className={overdue ? 'text-red-400' : 'text-slate-400'}>
              {overdue ? 'Overdue ' : ''}
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </>
        )}
      </div>

      {!overlay && onDelete && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task);
          }}
          className="absolute right-2 top-2 hidden rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-red-400 group-hover:block"
          aria-label="Delete task"
        >
          ✕
        </button>
      )}
    </div>
  );
}