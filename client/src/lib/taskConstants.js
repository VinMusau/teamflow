export const STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export const STATUS_LABELS = Object.fromEntries(
  STATUSES.map((s) => [s.value, s.label])
);

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-slate-400' },
  { value: 'medium', label: 'Medium', color: 'text-sky-400' },
  { value: 'high', label: 'High', color: 'text-amber-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
];

export const PRIORITY_LABELS = Object.fromEntries(
  PRIORITIES.map((p) => [p.value, p.label])
);

export const PRIORITY_COLORS = Object.fromEntries(
  PRIORITIES.map((p) => [p.value, p.color])
);