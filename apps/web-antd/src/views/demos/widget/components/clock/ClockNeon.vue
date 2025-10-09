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
const hours = computed(() => currentTime.value.getHours().toString().padStart(2, '0'));
const minutes = computed(() => currentTime.value.getMinutes().toString().padStart(2, '0'));
const seconds = computed(() => currentTime.value.getSeconds().toString().padStart(2, '0'));

// Get greeting based on time
const getGreeting = () => {
  const hour = currentTime.value.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
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
  <div class="clock-neon-widget" :style="widgetStyle">
    <div class="clock-header">
      <div class="greeting">{{ getGreeting() }}</div>
      <div class="clock-icon">🕐</div>
    </div>
    
    <div class="clock-display">
      <!-- Neon Clock -->
      <div class="neon-clock">
        <div class="clock-container">
          <!-- Hours -->
          <div class="time-segment hours">
            <div class="segment-label">HOURS</div>
            <div class="segment-display">
              <div class="digit" v-for="(digit, index) in hours" :key="`h-${index}`">
                {{ digit }}
              </div>
            </div>
          </div>
          
          <!-- Separator -->
          <div class="separator">
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          
          <!-- Minutes -->
          <div class="time-segment minutes">
            <div class="segment-label">MINUTES</div>
            <div class="segment-display">
              <div class="digit" v-for="(digit, index) in minutes" :key="`m-${index}`">
                {{ digit }}
              </div>
            </div>
          </div>
          
          <!-- Separator -->
          <div class="separator">
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          
          <!-- Seconds -->
          <div class="time-segment seconds">
            <div class="segment-label">SECONDS</div>
            <div class="segment-display">
              <div class="digit" v-for="(digit, index) in seconds" :key="`s-${index}`">
                {{ digit }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Date Display -->
      <div class="date-display">
        <div class="date">{{ formattedDate() }}</div>
      </div>
    </div>
    
    <div class="clock-footer">
      <div class="timezone">Neon Time</div>
    </div>
  </div>
</template>

<style scoped>
.clock-neon-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: #00ffff;
}

.clock-neon-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00ffff, #ff00ff, #ffff00);
  border-radius: 12px 12px 0 0;
  animation: neon-glow 2s ease-in-out infinite alternate;
}

@keyframes neon-glow {
  from { box-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff; }
  to { box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff; }
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
  color: #00ffff;
  text-transform: capitalize;
  text-shadow: 0 0 5px #00ffff;
}

.clock-icon {
  font-size: 1.25rem;
  opacity: 0.7;
  filter: drop-shadow(0 0 5px #00ffff);
}

.clock-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

/* Neon Clock */
.neon-clock {
  width: 100%;
  max-width: 300px;
}

.clock-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.time-segment {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.segment-label {
  font-size: 0.6rem;
  font-weight: 600;
  color: #00ffff;
  text-shadow: 0 0 5px #00ffff;
  letter-spacing: 1px;
  opacity: 0.8;
}

.segment-display {
  display: flex;
  gap: 2px;
}

.digit {
  width: 30px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 5px;
  text-shadow: 0 0 10px #00ffff;
  box-shadow: 
    0 0 5px rgba(0, 255, 255, 0.5),
    inset 0 0 5px rgba(0, 255, 255, 0.1);
  animation: digit-pulse 2s ease-in-out infinite;
}

.digit:nth-child(1) { animation-delay: 0s; }
.digit:nth-child(2) { animation-delay: 0.1s; }

@keyframes digit-pulse {
  0%, 100% { 
    box-shadow: 
      0 0 5px rgba(0, 255, 255, 0.5),
      inset 0 0 5px rgba(0, 255, 255, 0.1);
  }
  50% { 
    box-shadow: 
      0 0 15px rgba(0, 255, 255, 0.8),
      inset 0 0 10px rgba(0, 255, 255, 0.2);
  }
}

/* Separator */
.separator {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 0 5px;
}

.dot {
  width: 4px;
  height: 4px;
  background: #00ffff;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ffff;
  animation: dot-blink 1s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.5s;
}

@keyframes dot-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

/* Date Display */
.date-display {
  text-align: center;
}

.date {
  font-size: 0.875rem;
  color: #00ffff;
  font-weight: 500;
  text-transform: capitalize;
  text-shadow: 0 0 5px #00ffff;
  opacity: 0.9;
}

.clock-footer {
  margin-top: 16px;
  text-align: center;
}

.timezone {
  font-size: 0.75rem;
  color: #00ffff;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 0 5px #00ffff;
}

/* Dark mode adjustments */
.dark .clock-neon-widget {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
}

/* Hover effect */
.clock-neon-widget:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 10px 25px -3px rgba(0, 0, 0, 0.3), 
    0 4px 6px -2px rgba(0, 0, 0, 0.1),
    0 0 20px rgba(0, 255, 255, 0.3);
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .clock-container {
    gap: 10px;
    padding: 15px;
  }
  
  .digit {
    width: 25px;
    height: 35px;
    font-size: 1.2rem;
  }
  
  .segment-label {
    font-size: 0.5rem;
  }
}
</style>
