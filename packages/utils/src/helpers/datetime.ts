import dayjs from 'dayjs';

export type DateInput = string | number | Date | null | undefined;

/**
 * Format datetime with a default pattern 'DD-MM-YYYY HH:mm:ss'.
 * If input is falsy or invalid date, returns empty string.
 */
export function formatDateTimeDMY(input: DateInput, pattern = 'DD-MM-YYYY HH:mm:ss') {
  if (!input) return '';
  const d = dayjs(input);
  return d.isValid() ? d.format(pattern) : '';
}

/**
 * Format date only with default pattern 'DD-MM-YYYY'.
 */
export function formatDateDMY(input: DateInput, pattern = 'DD-MM-YYYY') {
  return formatDateTimeDMY(input, pattern);
}
