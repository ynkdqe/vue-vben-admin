export type DateInput = string | number | Date | null | undefined;

/**
 * Format datetime with a default pattern 'DD-MM-YYYY HH:mm:ss'.
 * If input is falsy or invalid date, returns empty string.
 */
export function formatDateTimeDMY(input: DateInput, pattern = 'DD-MM-YYYY HH:mm:ss') {
  if (!input) return '';
  const d = normalizeToDate(input);
  if (Number.isNaN(d.getTime())) return '';
  return formatWithPattern(d, pattern);
}

/**
 * Format date only with default pattern 'DD-MM-YYYY'.
 */
export function formatDateDMY(input: DateInput, pattern = 'DD-MM-YYYY') {
  return formatDateTimeDMY(input, pattern);
}

function normalizeToDate(input: DateInput): Date {
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  if (typeof input === 'string') {
    // Support ISO or timestamp-like strings
    const num = Number(input);
    if (!Number.isNaN(num) && input.trim() !== '') return new Date(num);
    return new Date(input);
  }
  return new Date('');
}

function formatWithPattern(d: Date, pattern: string): string {
  const DD = pad(d.getDate());
  const MM = pad(d.getMonth() + 1);
  const YYYY = String(d.getFullYear());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return pattern
    .replace(/YYYY/g, YYYY)
    .replace(/DD/g, DD)
    .replace(/MM/g, MM)
    .replace(/HH/g, HH)
    .replace(/mm/g, mm)
    .replace(/ss/g, ss);
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
