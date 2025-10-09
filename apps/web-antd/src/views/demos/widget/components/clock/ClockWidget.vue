<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { usePreferences } from '@vben/preferences';

const { isDark } = usePreferences();
const currentTime = ref(new Date());
let timerInterval: null | number = null;

// Update the time every second
const updateTime = () => {
  currentTime.value = new Date();
};

// Format time as HH:MM:SS
const formattedTime = () => {
  const hours = currentTime.value.getHours().toString().padStart(2, '0');
  const minutes = currentTime.value.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.value.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// Format date as Day, Month Date, Year
const formattedDate = () => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return currentTime.value.toLocaleDateString(undefined, options);
};

// Get greeting based on time
const getGreeting = () => {
  const hour = currentTime.value.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

// Computed styles for dark mode
const widgetStyle = computed(() => ({
  backgroundColor: isDark.value ? 'hsl(var(--card))' : '#ffffff',
  border: `1px solid ${isDark.value ? 'hsl(var(--border))' : '#e5e7eb'}`,
  boxShadow: isDark.value
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
}));

// Set up and clean up the timer
onMounted(() => {
  updateTime();
  timerInterval = window.setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
  }
});
</script>

<template>
  <div class="clock-widget" :style="widgetStyle">
    <div class="clock-header">
      <div class="greeting">{{ getGreeting() }}</div>
      <div class="clock-icon">🕐</div>
    </div>
    <div class="time-display">
      <div class="time">{{ formattedTime() }}</div>
      <div class="date">{{ formattedDate() }}</div>
    </div>
    <div class="clock-footer">
      <div class="timezone">Local Time</div>
    </div>
  </div>
</template>

<style scoped>
.clock-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.clock-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
  border-radius: 12px 12px 0 0;
}

.clock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.greeting {
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  text-transform: capitalize;
}

.clock-icon {
  font-size: 1.25rem;
  opacity: 0.7;
}

.time-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.time {
  font-size: 2.5rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin-bottom: 8px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  letter-spacing: -0.025em;
}

.date {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  font-weight: 500;
  text-transform: capitalize;
}

.clock-footer {
  margin-top: 16px;
  text-align: center;
}

.timezone {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Dark mode adjustments */
.dark .clock-widget {
  background: hsl(var(--card));
  border-color: hsl(var(--border));
}

.dark .time {
  color: hsl(var(--foreground));
}

.dark .date {
  color: hsl(var(--muted-foreground));
}

.dark .greeting {
  color: hsl(var(--muted-foreground));
}

.dark .timezone {
  color: hsl(var(--muted-foreground));
}

/* Hover effect */
.clock-widget:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 25px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.dark .clock-widget:hover {
  box-shadow:
    0 10px 25px -3px rgba(0, 0, 0, 0.3),
    0 4px 6px -2px rgba(0, 0, 0, 0.1);
}
</style>
