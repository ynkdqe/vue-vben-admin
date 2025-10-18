<script lang="ts" setup>
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { Calendar, Card } from 'ant-design-vue';
import { computed } from 'vue';

type EntryType = 'work' | 'late' | 'leave' | 'holiday' | 'weekend' | 'overtime';
export interface TimeshiftCalendarEntry {
  timeRange: string;
  label: string;
  type: EntryType;
  note?: string;
}

export interface TimeshiftCalendarBadge {
  text: string;
  type?: 'default' | 'primary' | 'warning' | 'success' | 'danger';
}

export interface TimeshiftCalendarDay {
  date: string;
  entries: TimeshiftCalendarEntry[];
  highlight?: {
    value: string;
    type?: 'primary' | 'success' | 'warning' | 'danger';
  };
  badges?: TimeshiftCalendarBadge[];
  footerNote?: string;
  detailSummary?: string;
}

const props = defineProps<{
  modelValue: Dayjs;
  data: Record<string, TimeshiftCalendarDay>;
  selectedDate: Dayjs;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: Dayjs): void;
  (event: 'update:selectedDate', value: Dayjs): void;
}>();

const ACalendar = Calendar;
const ACard = Card;

const calendarValue = computed({
  get: () => props.modelValue,
  set: (value: Dayjs) => emit('update:modelValue', value),
});

function handleSelect(value: Dayjs) {
  emit('update:selectedDate', value);
}

function getKey(value: Dayjs) {
  return value.format('YYYY-MM-DD');
}

function getDay(value: Dayjs) {
  return props.data[getKey(value)];
}

function getEntries(value: Dayjs) {
  return getDay(value)?.entries ?? [];
}

function getHighlight(value: Dayjs) {
  return getDay(value)?.highlight;
}

function getBadges(value: Dayjs) {
  return getDay(value)?.badges ?? [];
}

function getFooter(value: Dayjs) {
  return getDay(value)?.footerNote;
}

function isSameDay(value: Dayjs, other: Dayjs) {
  return value.isSame(other, 'day');
}

function isToday(value: Dayjs) {
  return value.isSame(dayjs(), 'day');
}

function entryClass(type: EntryType) {
  switch (type) {
    case 'late':
      return 'calendar-entry--late';
    case 'leave':
      return 'calendar-entry--leave';
    case 'holiday':
      return 'calendar-entry--holiday';
    case 'weekend':
      return 'calendar-entry--weekend';
    case 'overtime':
      return 'calendar-entry--overtime';
    default:
      return 'calendar-entry--work';
  }
}

function highlightClass(type?: 'primary' | 'success' | 'warning' | 'danger') {
  return type ? `calendar-highlight--${type}` : 'calendar-highlight--primary';
}

function badgeClass(type?: TimeshiftCalendarBadge['type']) {
  return type ? `calendar-badge--${type}` : 'calendar-badge--default';
}
</script>

<template>
  <ACard class="calendar-card" :bordered="false" :body-style="{ padding: '16px' }">
    <ACalendar v-model:value="calendarValue" :fullscreen="false" @select="handleSelect">
      <template #dateFullCellRender="{ current }">
        <div
          :class="[
            'calendar-cell',
            {
              'calendar-cell--today': isToday(current),
              'calendar-cell--selected': isSameDay(current, selectedDate),
            },
          ]"
        >
          <div class="calendar-cell__header">
            <span class="calendar-cell__date">{{ current.date() }}</span>
            <span
              v-if="getHighlight(current)"
              :class="['calendar-highlight', highlightClass(getHighlight(current)?.type)]"
            >
              {{ getHighlight(current)?.value }}
            </span>
          </div>

          <div class="calendar-cell__entries">
            <div
              v-for="entry in getEntries(current)"
              :key="entry.timeRange + entry.label"
              :class="['calendar-entry', entryClass(entry.type)]"
            >
              <span class="calendar-entry__time">{{ entry.timeRange }}</span>
              <span class="calendar-entry__label">{{ entry.label }}</span>
              <span v-if="entry.note" class="calendar-entry__note">{{ entry.note }}</span>
            </div>
          </div>

          <div v-if="getBadges(current).length" class="calendar-cell__badges">
            <span
              v-for="badge in getBadges(current)"
              :key="badge.text + badge.type"
              :class="['calendar-badge', badgeClass(badge.type)]"
            >
              {{ badge.text }}
            </span>
          </div>

          <div v-if="getFooter(current)" class="calendar-cell__footer">
            {{ getFooter(current) }}
          </div>
        </div>
      </template>
    </ACalendar>
  </ACard>
</template>

<style scoped>
.calendar-card {
  height: 100%;
}

:deep(.ant-picker-calendar-mini .ant-picker-calendar-date) {
  height: 100px;
}

.calendar-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.calendar-cell:hover {
  border-color: rgba(22, 119, 255, 0.35);
  box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.15);
}

.calendar-cell--today {
  border-color: rgba(22, 119, 255, 0.35);
}

.calendar-cell--selected {
  border-color: rgba(22, 119, 255, 0.45);
  box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.25);
}

.calendar-cell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: var(--ant-color-text);
}

.calendar-cell__date {
  font-size: 16px;
}

.calendar-highlight {
  min-width: 32px;
  padding: 0 6px;
  border-radius: 12px;
  font-size: 12px;
  text-align: center;
  font-weight: 600;
}

.calendar-highlight--primary {
  background-color: rgba(22, 119, 255, 0.12);
  color: #1677ff;
}

.calendar-highlight--success {
  background-color: rgba(82, 196, 26, 0.18);
  color: #389e0d;
}

.calendar-highlight--warning {
  background-color: rgba(250, 173, 20, 0.18);
  color: #d48806;
}

.calendar-highlight--danger {
  background-color: rgba(255, 77, 79, 0.18);
  color: #cf1322;
}

.calendar-cell__entries {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.calendar-entry {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
  line-height: 1.4;
  background-color: rgba(0, 0, 0, 0.03);
}

.calendar-entry__time {
  font-weight: 600;
}

.calendar-entry__label {
  font-weight: 500;
}

.calendar-entry__note {
  margin-left: auto;
  font-size: 11px;
  opacity: 0.75;
}

.calendar-entry--late {
  background-color: rgba(250, 84, 28, 0.12);
  color: #d4380d;
}

.calendar-entry--leave {
  background-color: rgba(250, 173, 20, 0.15);
  color: #d48806;
}

.calendar-entry--holiday,
.calendar-entry--weekend {
  background-color: rgba(114, 46, 209, 0.12);
  color: #722ed1;
}

.calendar-entry--overtime {
  background-color: rgba(47, 84, 235, 0.12);
  color: #2f54eb;
}

.calendar-entry--work {
  background-color: rgba(22, 119, 255, 0.08);
  color: #0958d9;
}

.calendar-cell__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.calendar-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.calendar-badge--default {
  background-color: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.65);
}

.calendar-badge--primary {
  background-color: rgba(22, 119, 255, 0.15);
  color: #1677ff;
}

.calendar-badge--warning {
  background-color: rgba(250, 173, 20, 0.15);
  color: #d48806;
}

.calendar-badge--success {
  background-color: rgba(82, 196, 26, 0.15);
  color: #389e0d;
}

.calendar-badge--danger {
  background-color: rgba(255, 77, 79, 0.18);
  color: #cf1322;
}

.calendar-cell__footer {
  margin-top: auto;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.45);
}

@media (max-width: 768px) {
  :deep(.ant-picker-calendar-mini .ant-picker-calendar-date) {
    height: 80px;
  }
}
</style>
