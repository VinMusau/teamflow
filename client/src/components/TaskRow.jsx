import { useState } from 'react';
import { useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import {
  STATUSES,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from '../lib/taskConstants';

export default function TaskRow({ task, workspaceId, projectId }) {
  const updateTask = useUpdateTask(workspaceId, projectId);
  const deleteTask = useDeleteTask(workspaceId, projectId);
  const [expanded, setExpanded] = useState(false);

  const handleStatusChange = (e) => {
    updateTask.mutate({
      workspaceId,
      projectId,
      taskId: task._id,
      status: e.target.value,
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    deleteTask.mutate({ workspaceId, projectId, taskId: task._id });
  };

  const overdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate) < new Date();

  return (
    <li className="rounded-xl border border-slate-800 bg-slate-950">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 min-w-0 text-left"
        >
          <p className="truncate text-sm font-medium text-slate-100">
            {task.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className={PRIORITY_COLORS[task.priority]}>
              {PRIORITY_LABELS[task.priority]}
            </span>
            {task.assignee && (
              <>
                <span>·</span>
                <span>{task.assignee.name}</span>
              </>
            )}
            {task.dueDate && (
              <>
                <span>·</span>
                <span className={overdue ? 'text-red-400' : ''}>
                  {overdue ? 'Overdue · ' : 'Due · '}
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </button>

        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={updateTask.isPending}
          className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500 disabled:opacity-50"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleDelete}
          disabled={deleteTask.isPending}
          className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-red-400 disabled:opacity-50"
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-800 px-4 py-3 text-sm text-slate-400">
          {task.description ? (
            <p className="whitespace-pre-wrap">{task.description}</p>
          ) : (
            <p className="italic text-slate-500">No description.</p>
          )}
        </div>
      )}
    </li>
  );
}