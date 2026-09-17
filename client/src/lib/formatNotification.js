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