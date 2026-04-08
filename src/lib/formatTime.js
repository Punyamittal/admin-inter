import { formatDistanceToNow } from 'date-fns';

function parseValidDate(value) {
  if (value == null || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Safe for dashboard feeds and live cards; never throws on bad/missing timestamps. */
export function formatRelativeTime(value, options = { addSuffix: true }) {
  const d = parseValidDate(value);
  if (!d) return '—';
  return formatDistanceToNow(d, options);
}
