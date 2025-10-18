<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import dayjs from 'dayjs';

import TimeshiftCalendar, {
  type TimeshiftCalendarDay,
  type TimeshiftCalendarEntry,
} from './components/TimeshiftCalendar.vue';
import TimeshiftMonthlyDetail, {
  type TimeshiftOverviewItem,
  type TimeshiftSelectedDayDetail,
  type TimeshiftStatisticItem,
} from './components/TimeshiftMonthlyDetail.vue';

function createWorkEntry(overrides: Partial<TimeshiftCalendarEntry> = {}): TimeshiftCalendarEntry {
  return {
    timeRange: '08:30 - 18:00',
    label: 'HC',
    type: 'work',
    ...overrides,
  };
}

function createDay(date: string, overrides: Partial<TimeshiftCalendarDay> = {}): TimeshiftCalendarDay {
  return {
    date,
    entries: [createWorkEntry()],
    ...overrides,
  };
}

const calendarValue = ref(dayjs('2025-10-01'));
const selectedDate = ref(dayjs('2025-10-18'));

const calendarData = reactive<Record<string, TimeshiftCalendarDay>>({
  '2025-10-01': createDay('2025-10-01', {
    badges: [{ text: 'OT 1h', type: 'primary' }],
    footerNote: '9.5h logged',
  }),
  '2025-10-02': createDay('2025-10-02', {
    badges: [{ text: 'OT 2h', type: 'primary' }],
    footerNote: '10h logged',
  }),
  '2025-10-03': createDay('2025-10-03', {
    entries: [
      createWorkEntry(),
      { timeRange: '19:00 - 21:00', label: 'Support', type: 'overtime', note: '+2h' },
    ],
    highlight: { value: '2h', type: 'success' },
    detailSummary: 'Overtime support for release',
  }),
  '2025-10-04': createDay('2025-10-04', {
    entries: [{ timeRange: 'Off', label: 'Weekend', type: 'weekend' }],
    badges: [{ text: 'N' }],
    footerNote: 'Rest day',
  }),
  '2025-10-05': createDay('2025-10-05', {
    entries: [{ timeRange: 'Off', label: 'Weekend', type: 'weekend' }],
    badges: [{ text: 'N' }],
    footerNote: 'Rest day',
  }),
  '2025-10-06': createDay('2025-10-06', {
    highlight: { value: 'Onsite', type: 'primary' },
    footerNote: '9h logged',
  }),
  '2025-10-07': createDay('2025-10-07', {
    entries: [
      createWorkEntry({ timeRange: '09:05 - 18:00', note: '+5m late', type: 'late' }),
      createWorkEntry({ timeRange: '18:30 - 19:30', label: 'Training', type: 'overtime', note: '+1h' }),
    ],
    highlight: { value: 'Late', type: 'warning' },
    detailSummary: 'Late check-in recorded, made up with training',
  }),
  '2025-10-08': createDay('2025-10-08', {
    footerNote: '8h logged',
  }),
  '2025-10-09': createDay('2025-10-09', {
    entries: [
      createWorkEntry({ timeRange: '08:30 - 12:00' }),
      { timeRange: 'PM', label: 'Annual leave', type: 'leave', note: '0.5d' },
    ],
    highlight: { value: '0.5', type: 'warning' },
    detailSummary: 'Half day annual leave (afternoon)',
  }),
  '2025-10-10': createDay('2025-10-10', {
    entries: [
      createWorkEntry({ timeRange: '08:30 - 17:30' }),
      { timeRange: '17:30 - 19:00', label: 'Overtime', type: 'overtime', note: '+1.5h' },
    ],
    badges: [{ text: 'OT', type: 'primary' }],
    footerNote: '9.5h logged',
  }),
  '2025-10-11': createDay('2025-10-11', {
    entries: [{ timeRange: 'Off', label: 'Weekend', type: 'weekend' }],
    badges: [{ text: 'N' }],
    footerNote: 'Rest day',
  }),
  '2025-10-12': createDay('2025-10-12', {
    entries: [{ timeRange: 'Off', label: 'Weekend', type: 'weekend' }],
    badges: [{ text: 'N' }],
    footerNote: 'Rest day',
  }),
  '2025-10-13': createDay('2025-10-13', {
    badges: [{ text: 'Remote', type: 'success' }],
    footerNote: '9h logged',
  }),
  '2025-10-14': createDay('2025-10-14', {
    entries: [
      createWorkEntry(),
      { timeRange: 'Check-out missed', label: 'Pending', type: 'late' },
    ],
    highlight: { value: 'Check', type: 'warning' },
    detailSummary: 'Awaiting manual checkout confirmation',
  }),
  '2025-10-15': createDay('2025-10-15', {
    footerNote: '8.5h logged',
  }),
  '2025-10-16': createDay('2025-10-16', {
    entries: [
      createWorkEntry({ timeRange: '08:30 - 17:00' }),
      { timeRange: '17:00 - 18:30', label: 'OT Support', type: 'overtime', note: '+1.5h' },
    ],
    badges: [{ text: 'OT', type: 'primary' }],
    footerNote: '9h logged',
  }),
  '2025-10-17': createDay('2025-10-17', {
    entries: [
      createWorkEntry({ timeRange: '08:45 - 18:00', type: 'late', note: '+15m late' }),
    ],
    highlight: { value: 'Late', type: 'warning' },
  }),
  '2025-10-18': createDay('2025-10-18', {
    entries: [
      createWorkEntry({ timeRange: 'Morning', label: 'HC', note: '08:30 - 12:00' }),
      { timeRange: 'Afternoon', label: 'WFH', type: 'leave', note: '0.5d' },
    ],
    highlight: { value: '0.5', type: 'warning' },
    badges: [{ text: 'WFH', type: 'success' }],
    detailSummary: 'WFH half day for personal errand',
  }),
  '2025-10-19': createDay('2025-10-19', {
    entries: [{ timeRange: 'Off', label: 'Weekend', type: 'weekend' }],
    badges: [{ text: 'N' }],
    footerNote: 'Rest day',
  }),
  '2025-10-20': createDay('2025-10-20', {
    footerNote: '9h logged',
  }),
  '2025-10-21': createDay('2025-10-21', {
    badges: [{ text: 'OT', type: 'primary' }],
    entries: [
      createWorkEntry(),
      { timeRange: '18:30 - 20:00', label: 'Deployment', type: 'overtime', note: '+1.5h' },
    ],
    footerNote: '9.5h logged',
  }),
  '2025-10-22': createDay('2025-10-22', {
    footerNote: '8h logged',
  }),
  '2025-10-23': createDay('2025-10-23', {
    entries: [
      createWorkEntry({ timeRange: '08:30 - 12:00' }),
      { timeRange: '13:00 - 17:30', label: 'Client visit', type: 'work', note: 'Onsite' },
    ],
    highlight: { value: 'Onsite', type: 'primary' },
  }),
  '2025-10-24': createDay('2025-10-24', {
    footerNote: '8h logged',
  }),
  '2025-10-25': createDay('2025-10-25', {
    entries: [{ timeRange: 'Off', label: 'Weekend', type: 'weekend' }],
    badges: [{ text: 'N' }],
    footerNote: 'Rest day',
  }),
  '2025-10-26': createDay('2025-10-26', {
    entries: [{ timeRange: 'Off', label: 'Weekend', type: 'weekend' }],
    badges: [{ text: 'N' }],
    footerNote: 'Rest day',
  }),
  '2025-10-27': createDay('2025-10-27', {
    footerNote: '8h logged',
  }),
  '2025-10-28': createDay('2025-10-28', {
    entries: [
      createWorkEntry({ timeRange: '08:30 - 17:30' }),
      { timeRange: '17:30 - 18:30', label: 'Team retro', type: 'overtime', note: '+1h' },
    ],
    highlight: { value: 'OT', type: 'success' },
  }),
  '2025-10-29': createDay('2025-10-29', {
    footerNote: '8h logged',
  }),
  '2025-10-30': createDay('2025-10-30', {
    entries: [
      createWorkEntry({ timeRange: '08:30 - 12:00' }),
      { timeRange: '13:30 - 18:00', label: 'Workshop', type: 'work', note: '+30m' },
    ],
    highlight: { value: '+30m', type: 'success' },
  }),
  '2025-10-31': createDay('2025-10-31', {
    entries: [
      { timeRange: 'Holiday', label: 'Company day', type: 'holiday' },
    ],
    highlight: { value: 'Holiday', type: 'success' },
    detailSummary: 'Company-wide autumn retreat',
  }),
});

const overviewMetrics: TimeshiftOverviewItem[] = [
  { label: 'Actual workday', value: 14.5, total: 25, color: 'primary' },
  { label: 'Actual workhour', value: 116, total: 200, unit: 'h', color: 'success' },
];

const statistics: TimeshiftStatisticItem[] = [
  { label: 'Total points', value: '14.5' },
  { label: 'Work hour', value: '116h 20m' },
  { label: 'Standard workday', value: '25' },
  { label: 'Late (days)', value: 2, hint: 'Total late minutes: 20', trend: 'down' },
  { label: 'Early out (days)', value: 1, hint: 'Left early on Oct 14', trend: 'down' },
  { label: 'Missing check-in', value: 1, hint: 'Pending checkout Oct 14', trend: 'down' },
  { label: 'Leave (days)', value: '1.5', hint: 'Annual leave on Oct 9 & Oct 18' },
  { label: 'Overtime (hours)', value: '9.0h', hint: 'Includes releases & training', trend: 'up' },
];

const selectedDayDetail = computed<TimeshiftSelectedDayDetail | null>(() => {
  const key = selectedDate.value.format('YYYY-MM-DD');
  const day = calendarData[key];
  if (!day) return null;
  return {
    date: day.date,
    entries: day.entries,
    summary: day.detailSummary ?? day.footerNote ?? 'No additional notes',
  };
});
</script>

<template>
  <div class="timeshift-page">
    <div class="timeshift-layout">
      <TimeshiftCalendar
        v-model:model-value="calendarValue"
        :data="calendarData"
        v-model:selected-date="selectedDate"
      />
      <TimeshiftMonthlyDetail
        month-label="Oct, 2025"
        :overview="overviewMetrics"
        :statistics="statistics"
        :selected-day="selectedDayDetail"
      />
    </div>
  </div>
</template>

<style scoped>
.timeshift-page {
  padding: 16px;
}

.timeshift-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 1200px) {
  .timeshift-layout {
    grid-template-columns: minmax(0, 2.5fr) minmax(0, 1fr);
  }
}
</style>
