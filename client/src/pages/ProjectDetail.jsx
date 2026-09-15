import { Link, useParams } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';

export default function ProjectDetail() {
  const { workspaceId, projectId } = useParams();
  const { data: project, isLoading, isError, error } = useProject({
    workspaceId,
    projectId,
  });

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

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center gap-3">
          <span
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-2xl font-bold">{project?.name}</h1>
        </div>
        {project.description && (
          <p className="mt-2 text-sm text-slate-400">{project.description}</p>
        )}

        <div className="mt-8 rounded-2xl border border-dashed border-slate-800 p-10 text-center">
          <p className="text-slate-400">
            Tasks and Kanban board coming Day 6.
          </p>
        </div>
      </main>
    </div>
  );
}