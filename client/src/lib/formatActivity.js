import { STATUS_LABELS } from './taskConstants';
export { timeAgo } from './timeAgo';

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
