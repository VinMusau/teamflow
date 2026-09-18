export function formatNotification(n) {
  const actor = n.actor?.name ?? 'Someone';
  const target = `"${n.targetLabel}"`;

  switch (n.type) {
    case 'workspace.member_added':
      return `${actor} added you to ${target}`;
    case 'task.assigned':
      return `${actor} assigned you ${target}`;
    case 'comment.created':
      return `${actor} commented on ${target}`;
    default:
      return `${actor} did something`;
  }
}