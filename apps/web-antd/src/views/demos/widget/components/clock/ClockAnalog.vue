<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { usePreferences } from '@vben/preferences';

const { isDark } = usePreferences();
const currentTime = ref(new Date());
let timerInterval: number | null = null;

// Update the time every second
const updateTime = () => {
  currentTime.value = new Date();
};

// Get time values
const hours = computed(() => currentTime.value.getHours() % 12);
const minutes = computed(() => currentTime.value.getMinutes());
const seconds = computed(() => currentTime.value.getSeconds());

// Calculate rotation angles
const hourRotation = computed(() => (hours.value * 30) + (minutes.value * 0.5));
const minuteRotation = computed(() => minutes.value * 6);
const secondRotation = computed(() => seconds.value * 6);

// Get greeting based on time
const getGreeting = () => {
  const hour = currentTime.value.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

// Format time as HH:MM:SS
const formattedTime = () => {
  const h = currentTime.value.getHours().toString().padStart(2, '0');
  const m = currentTime.value.getMinutes().toString().padStart(2, '0');
  const s = currentTime.value.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// Format date
const formattedDate = () => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return currentTime.value.toLocaleDateString(undefined, options);
};

// Computed styles for dark mode
const widgetStyle = computed(() => ({
  backgroundColor: isDark.value ? 'hsl(var(--card))' : '#ffffff',
  border: `1px solid ${isDark.value ? 'hsl(var(--border))' : '#e5e7eb'}`,
  boxShadow: isDark.value 
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
}));

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
  <div class="clock-analog-widget" :style="widgetStyle">
    <div class="clock-header">
      <div class="greeting">{{ getGreeting() }}</div>
      <div class="clock-icon">🕐</div>
    </div>
    
    <div class="clock-display">
      <!-- Analog Clock -->
      <div class="analog-clock">
        <div class="clock-face">
          <!-- Hour markers -->
          <div v-for="i in 12" :key="i" class="hour-marker" :style="{ transform: `rotate(${i * 30}deg)` }">
            <div class="marker-line"></div>
            <div class="marker-number" :style="{ transform: `rotate(${-i * 30}deg)` }">{{ i }}</div>
          </div>
          
          <!-- Minute markers -->
          <div v-for="i in 60" :key="`min-${i}`" class="minute-marker" :style="{ transform: `rotate(${i * 6}deg)` }">
            <div class="minute-line" :class="{ 'major': i % 5 === 0 }"></div>
          </div>
          
          <!-- Clock hands -->
          <div class="clock-hands">
            <!-- Hour hand -->
            <div 
              class="hand hour-hand" 
              :style="{ transform: `rotate(${hourRotation}deg)` }"
            ></div>
            <!-- Minute hand -->
            <div 
              class="hand minute-hand" 
              :style="{ transform: `rotate(${minuteRotation}deg)` }"
            ></div>
            <!-- Second hand -->
            <div 
              class="hand second-hand" 
              :style="{ transform: `rotate(${secondRotation}deg)` }"
            ></div>
            <!-- Center dot -->
            <div class="center-dot"></div>
          </div>
        </div>
      </div>
      
      <!-- Digital Time -->
      <div class="digital-time">
        <div class="time">{{ formattedTime() }}</div>
        <div class="date">{{ formattedDate() }}</div>
      </div>
    </div>
    
    <div class="clock-footer">
      <div class="timezone">Local Time</div>
    </div>
  </div>
</template>

<style scoped>
.clock-analog-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.clock-analog-widget::before {
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

.clock-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

/* Analog Clock */
.analog-clock {
  position: relative;
  width: 200px;
  height: 200px;
}

.clock-face {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: hsl(var(--muted));
  position: relative;
  border: 3px solid hsl(var(--border));
}

/* Hour markers */
.hour-marker {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 20px;
  transform-origin: 50% 100px;
}

.marker-line {
  width: 100%;
  height: 12px;
  background: hsl(var(--foreground));
  border-radius: 1px;
}

.marker-number {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

/* Minute markers */
.minute-marker {
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 10px;
  transform-origin: 50% 100px;
}

.minute-line {
  width: 100%;
  height: 6px;
  background: hsl(var(--muted-foreground));
  border-radius: 0.5px;
  opacity: 0.6;
}

.minute-line.major {
  height: 8px;
  opacity: 0.8;
}

/* Clock hands */
.clock-hands {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.hand {
  position: absolute;
  transform-origin: 50% 100%;
  border-radius: 2px;
  transition: transform 0.1s ease;
}

.hour-hand {
  width: 4px;
  height: 60px;
  background: hsl(var(--foreground));
  top: -60px;
  left: -2px;
}

.minute-hand {
  width: 3px;
  height: 80px;
  background: hsl(var(--foreground));
  top: -80px;
  left: -1.5px;
}

.second-hand {
  width: 2px;
  height: 90px;
  background: #ef4444;
  top: -90px;
  left: -1px;
  z-index: 10;
}

.center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  background: hsl(var(--foreground));
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
}

/* Digital Time */
.digital-time {
  text-align: center;
}

.time {
  font-size: 1.5rem;
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
.dark .clock-face {
  background: hsl(var(--muted));
  border-color: hsl(var(--border));
}

.dark .marker-line {
  background: hsl(var(--foreground));
}

.dark .marker-number {
  color: hsl(var(--foreground));
}

.dark .minute-line {
  background: hsl(var(--muted-foreground));
}

.dark .hour-hand,
.dark .minute-hand {
  background: hsl(var(--foreground));
}

.dark .center-dot {
  background: hsl(var(--foreground));
}

/* Hover effect */
.clock-analog-widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.dark .clock-analog-widget:hover {
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
}
</style>
