import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useWorkspace } from '../hooks/useWorkspaces';
import { useTasks } from '../hooks/useTasks';
import { useUiStore } from '../stores/useUiStore';
import { STATUSES } from '../lib/taskConstants';
import TaskRow from '../components/TaskRow';
import CreateTaskModal from '../components/CreateTaskModal';

export default function ProjectDetail() {
  const { workspaceId, projectId } = useParams();
  const openCreateTask = useUiStore((s) => s.openCreateTask);

  const { data: project, isLoading, isError, error } = useProject({
    workspaceId,
    projectId,
  });
  const { data: workspace } = useWorkspace(workspaceId);
  const { data: tasks, isLoading: loadingTasks } = useTasks(
    workspaceId,
    projectId
  );

  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned' && t.assignee) return false;
        if (assigneeFilter !== 'unassigned' && t.assignee?._id !== assigneeFilter)
          return false;
      }
      return true;
    });
  }, [tasks, statusFilter, assigneeFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-10 text-slate-400">
        Loading project…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-950 p-10 text-red-400">
        {error?.response?.data?.message || error.message}
      </div>
    );
  }

  const members = workspace?.members ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <Link
            to={`/workspaces/${workspaceId}`}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            ← Back to workspace
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div className="flex items-center gap-3">
          <span
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
        {project.description && (
          <p className="text-sm text-slate-400">{project.description}</p>
        )}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              Tasks{' '}
              <span className="text-sm font-normal text-slate-500">
                ({filteredTasks.length})
              </span>
            </h2>
            <button
              onClick={() => openCreateTask('todo')}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              + New task
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="all">All assignees</option>
              <option value="unassigned">Unassigned</option>
              {members.map((m) => (
                <option key={m.user._id} value={m.user._id}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            {loadingTasks && (
              <p className="text-sm text-slate-400">Loading tasks…</p>
            )}

            {!loadingTasks && filteredTasks.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center">
                <p className="text-sm text-slate-400">
                  {tasks?.length === 0
                    ? 'No tasks yet. Create one to get started.'
                    : 'No tasks match these filters.'}
                </p>
              </div>
            )}

            {filteredTasks.length > 0 && (
              <ul className="space-y-2">
                {filteredTasks.map((t) => (
                  <TaskRow
                    key={t._id}
                    task={t}
                    workspaceId={workspaceId}
                    projectId={projectId}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <CreateTaskModal
        workspaceId={workspaceId}
        projectId={projectId}
        members={members}
      />
    </div>
  );
}