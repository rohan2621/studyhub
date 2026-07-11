import { format, formatDistanceToNow, isPast, differenceInDays } from 'date-fns';

export function formatDueDate(iso: string): string {
  return format(new Date(iso), 'MMM d, yyyy');
}

export function relativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function daysUntil(iso: string): number {
  return differenceInDays(new Date(iso), new Date());
}

export function isOverdue(iso: string): boolean {
  return isPast(new Date(iso));
}

export type DueDateSeverity = 'red' | 'amber' | 'green' | 'overdue';

export function dueDateSeverity(iso: string): DueDateSeverity {
  if (isOverdue(iso)) return 'overdue';
  const days = daysUntil(iso);
  if (days <= 2)  return 'red';
  if (days <= 5)  return 'amber';
  return 'green';
}

export function formatTokenExpiry(iso: string): string {
  const days = daysUntil(iso);
  if (days <= 0) return 'Expired';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}
