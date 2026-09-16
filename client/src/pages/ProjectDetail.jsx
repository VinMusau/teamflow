import { Link, useParams } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useWorkspace } from '../hooks/useWorkspaces';
import { useTasks, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useUiStore } from '../stores/useUiStore';
import { useAuthStore } from '../stores/useAuthStore';
import KanbanBoard from '../components/kanban/KanbanBoard';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailsModal from '../components/TaskDetailsModal';

export default function ProjectDetail() {
  const { workspaceId, projectId } = useParams();

  const openCreateTask = useUiStore((s) => s.openCreateTask);
  const selectedTaskId = useUiStore((s) => s.selectedTaskId);
  const openTaskDetails = useUiStore((s) => s.openTaskDetails);
  const closeTaskDetails = useUiStore((s) => s.closeTaskDetails);
  const currentUser = useAuthStore((s) => s.user);

  const { data: project, isLoading, isError, error } = useProject({
    workspaceId,
    projectId,
  });
  const { data: workspace } = useWorkspace(workspaceId);
  const { data: tasks, isLoading: loadingTasks } = useTasks(
    workspaceId,
    projectId
  );

  const updateTask = useUpdateTask(workspaceId, projectId);
  const deleteTask = useDeleteTask(workspaceId, projectId);

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

  const myMembership = workspace?.members?.find(
    (m) => m.user._id === currentUser._id
  );
  const myRole = myMembership?.role ?? 'member';

  // Find the currently selected task from the cached list. If it was
  // deleted elsewhere, selectedTask is null and the modal unmounts.
  const selectedTask =
    tasks?.find((t) => t._id === selectedTaskId) ?? null;

  const handleTaskMoved = ({ taskId, status, order }) => {
    updateTask.mutate({ workspaceId, projectId, taskId, status, order });
  };

  const handleDeleteTask = (task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    deleteTask.mutate({ workspaceId, projectId, taskId: task._id });
  };

  const handleCardClick = (task) => {
    openTaskDetails(task._id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <Link
            to={`/workspaces/${workspaceId}`}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            ← Back to workspace
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-6">
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Board{' '}
              <span className="text-sm font-normal text-slate-500">
                ({tasks?.length ?? 0})
              </span>
            </h2>
            <button
              onClick={() => openCreateTask('todo')}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              + New task
            </button>
          </div>

          {loadingTasks ? (
            <p className="text-sm text-slate-400">Loading tasks…</p>
          ) : (
            <KanbanBoard
              tasks={tasks ?? []}
              onTaskMoved={handleTaskMoved}
              onAddTask={(status) => openCreateTask(status)}
              onDeleteTask={handleDeleteTask}
              onCardClick={handleCardClick}
            />
          )}
        </section>
      </main>

      <CreateTaskModal
        workspaceId={workspaceId}
        projectId={projectId}
        members={members}
      />

      {selectedTask && (
        <TaskDetailsModal
          key={selectedTask._id}
          task={selectedTask}
          workspaceId={workspaceId}
          projectId={projectId}
          members={members}
          currentUserId={currentUser._id}
          currentUserRole={myRole}
          onClose={closeTaskDetails}
        />
      )}
    </div>
  );
}