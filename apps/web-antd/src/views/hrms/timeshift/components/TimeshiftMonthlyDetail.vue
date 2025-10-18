<script lang="ts" setup>
import type { TimeshiftCalendarEntry } from './TimeshiftCalendar.vue';
import { Card, Divider, Progress, Tag } from 'ant-design-vue';
import { computed } from 'vue';
import dayjs from 'dayjs';

export interface TimeshiftOverviewItem {
  label: string;
  value: number;
  total: number;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export interface TimeshiftStatisticItem {
  label: string;
  value: string | number;
  hint?: string;
  trend?: 'up' | 'down';
}

export interface TimeshiftSelectedDayDetail {
  date: string;
  entries: TimeshiftCalendarEntry[];
  summary?: string;
}

const props = defineProps<{
  monthLabel: string;
  overview: TimeshiftOverviewItem[];
  statistics: TimeshiftStatisticItem[];
  selectedDay?: TimeshiftSelectedDayDetail | null;
}>();

const ACard = Card;
const ADivider = Divider;
const AProgress = Progress;
const ATag = Tag;

function overviewColor(item: TimeshiftOverviewItem) {
  switch (item.color) {
    case 'success':
      return '#52c41a';
    case 'warning':
      return '#faad14';
    case 'danger':
      return '#ff4d4f';
    default:
      return '#1677ff';
  }
}

const normalizedOverview = computed(() => {
  return props.overview.map((item) => {
    const percent = item.total ? Math.min((item.value / item.total) * 100, 120) : 0;
    const text = `${item.value}${item.unit ?? ''}/${item.total}${item.unit ?? ''}`;
    return { ...item, percent, text };
  });
});

const selectedDateLabel = computed(() => {
  if (!props.selectedDay?.date) return '';
  return dayjs(props.selectedDay.date).format('dddd, MMM D, YYYY');
});
</script>

<template>
  <ACard class="timeshift-monthly-detail" :bordered="false" :body-style="{ padding: '20px' }">
    <div class="monthly-detail__header">
      <div>
        <h3 class="monthly-detail__title">Statistics {{ monthLabel }}</h3>
        <p class="monthly-detail__subtitle">Actual performance vs target workday and workhour goals.</p>
      </div>
    </div>

    <div class="monthly-detail__overview">
      <div v-for="item in normalizedOverview" :key="item.label" class="monthly-detail__overview-item">
        <div class="monthly-detail__overview-label">{{ item.label }}</div>
        <div class="monthly-detail__overview-value">{{ item.text }}</div>
        <AProgress :percent="item.percent" :show-info="false" :stroke-color="overviewColor(item)" />
      </div>
    </div>

    <ADivider class="monthly-detail__divider">Workdays</ADivider>

    <div class="monthly-detail__stats">
      <div v-for="stat in statistics" :key="stat.label" class="monthly-detail__stat-item">
        <div class="monthly-detail__stat-label">{{ stat.label }}</div>
        <div class="monthly-detail__stat-value">{{ stat.value }}</div>
        <div v-if="stat.hint" class="monthly-detail__stat-hint">{{ stat.hint }}</div>
        <ATag v-if="stat.trend" :color="stat.trend === 'up' ? 'success' : 'warning'">
          {{ stat.trend === 'up' ? 'Improved' : 'Needs attention' }}
        </ATag>
      </div>
    </div>

    <template v-if="selectedDay">
      <ADivider class="monthly-detail__divider">Selected day</ADivider>
      <div class="monthly-detail__selected">
        <div class="monthly-detail__selected-header">
          <h4 class="monthly-detail__selected-title">{{ selectedDateLabel }}</h4>
          <p v-if="selectedDay?.summary" class="monthly-detail__selected-summary">{{ selectedDay.summary }}</p>
        </div>
        <div class="monthly-detail__selected-list">
          <div v-for="entry in selectedDay?.entries" :key="entry.timeRange + entry.label" class="monthly-detail__selected-entry">
            <span class="monthly-detail__selected-time">{{ entry.timeRange }}</span>
            <span class="monthly-detail__selected-label">{{ entry.label }}</span>
            <span v-if="entry.note" class="monthly-detail__selected-note">{{ entry.note }}</span>
          </div>
        </div>
      </div>
    </template>
  </ACard>
</template>

<style scoped>
.timeshift-monthly-detail {
  height: 100%;
}

.monthly-detail__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--ant-color-text-heading);
}

.monthly-detail__subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
}

.monthly-detail__overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.monthly-detail__overview-item {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.monthly-detail__overview-label {
  font-size: 14px;
  font-weight: 600;
}

.monthly-detail__overview-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--ant-color-primary);
}

.monthly-detail__divider {
  margin: 24px 0 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.65);
}

.monthly-detail__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.monthly-detail__stat-item {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.monthly-detail__stat-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}

.monthly-detail__stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--ant-color-text-heading);
}

.monthly-detail__stat-hint {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.monthly-detail__selected {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.monthly-detail__selected-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.monthly-detail__selected-summary {
  margin: 0;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
}

.monthly-detail__selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.monthly-detail__selected-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(22, 119, 255, 0.06);
}

.monthly-detail__selected-time {
  font-weight: 600;
}

.monthly-detail__selected-label {
  font-weight: 500;
}

.monthly-detail__selected-note {
  margin-left: auto;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
</style>
