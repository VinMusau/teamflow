import { STATUS_LABELS } from './taskConstants';

// Turn an activity document into a human sentence.
export function formatActivity(a) {
  const { action, targetLabel, meta } = a;
  const target = targetLabel ? `"${targetLabel}"` : 'something';

  switch (action) {
    case 'workspace.created':
      return `created the workspace ${target}`;
    case 'workspace.updated':
      return `updated the workspace ${target}`;
    case 'workspace.member_added':
      return `added ${targetLabel} as ${meta?.role ?? 'member'}`;
    case 'workspace.member_removed':
      return `removed ${targetLabel} from the workspace`;
    case 'project.created':
      return `created project ${target}`;
    case 'project.updated':
      return `updated project ${target}`;
    case 'project.deleted':
      return `deleted project ${target}`;
    case 'task.created':
      return `created task ${target}`;
    case 'task.updated':
      return `updated task ${target}${
        meta?.changedFields?.length
          ? ` (${meta.changedFields.join(', ')})`
          : ''
      }`;
    case 'task.status_changed':
      return `moved task ${target} from ${
        STATUS_LABELS[meta?.from] ?? meta?.from
      } to ${STATUS_LABELS[meta?.to] ?? meta?.to}`;
    case 'task.assigned':
      return `reassigned task ${target}`;
    case 'task.deleted':
      return `deleted task ${target}`;
    case 'comment.created':
      return `commented on task ${target}`;
    case 'comment.deleted':
      return `deleted a comment on ${target}`;
    default:
      return `${action}`;
  }
}

// "3m ago" style timestamps
export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const s = Math.floor((now - then) / 1000);

  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}