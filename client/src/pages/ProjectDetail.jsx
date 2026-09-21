import { useParams } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useWorkspace } from '../hooks/useWorkspaces';
import { useTasks, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useUiStore } from '../stores/useUiStore';
import { useAuthStore } from '../stores/useAuthStore';
import KanbanBoard from '../components/kanban/KanbanBoard';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
import { useRealtime } from '../hooks/useRealtime';
import AppHeader from '../components/AppHeader';
import { confirm } from '../stores/useConfirmStore';
import { TaskCardSkeleton, SkeletonLine } from '../components/Skeleton';

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
  useRealtime({ workspaceId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <AppHeader
          backTo={`/workspaces/${workspaceId}`}
          backLabel="Back to workspace"
        />

        <main className="mx-auto max-w-6xl px-6 py-10 space-y-6">
          <div className="flex items-center gap-3">
            <SkeletonLine className="h-4 w-4 rounded-full" />
            <SkeletonLine className="h-7 w-48" />
          </div>
          <SkeletonLine className="h-4 w-80" />

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <SkeletonLine className="h-6 w-24" />
              <SkeletonLine className="h-8 w-28" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {['To Do', 'In Progress', 'Done'].map((label) => (
                <div
                  key={label}
                  className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-3"
                >
                  <SkeletonLine className="mb-3 h-5 w-24" />
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <TaskCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
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

  const handleDeleteTask = async (task) => {
    const ok = await confirm({
      title: 'Delete task?',
      message: `"${task.title}" will be permanently deleted.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;

    deleteTask.mutate({ workspaceId, projectId, taskId: task._id });
  };

  const handleCardClick = (task) => {
    openTaskDetails(task._id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
          <AppHeader backTo={`/workspaces/${workspaceId}`} backLabel="Back to workspace" />
       

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
            <div className="grid gap-4 md:grid-cols-3">
              {['To Do', 'In Progress', 'Done'].map((label) => (
                <div
                  key={label}
                  className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-3"
                >
                  <div className="mb-3 h-5 w-24 animate-pulse rounded bg-slate-800" />
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <TaskCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
          currentUser={currentUser}
          currentUserRole={myRole}
          onClose={closeTaskDetails}
        />
      )}
    </div>
  );
}