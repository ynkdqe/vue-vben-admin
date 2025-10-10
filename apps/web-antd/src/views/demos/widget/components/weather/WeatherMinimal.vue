<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { usePreferences } from '@vben/preferences';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  pressure: number;
  visibility: number;
  uv: number;
  sunrise: string;
  sunset: string;
}

const { isDark } = usePreferences();
const weatherData = ref<null | WeatherData>(null);
const loading = ref(true);
const error = ref<null | string>(null);
const currentTime = ref('');

// Update current time
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

let timeInterval: ReturnType<typeof setInterval>;

// Fetch weather data from Weatherbit API
const fetchWeatherData = () => {
  loading.value = true;
  error.value = null;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const apiKey = '1c239fd06dc7433cbb1c83b3e9937a1b';
      const url = `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&lang=vi&key=${apiKey}`;

      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.data && data.data.length > 0) {
            const weatherInfo = data.data[0];

            weatherData.value = {
              location: weatherInfo.city_name,
              temperature: Math.round(weatherInfo.temp),
              condition: weatherInfo.weather.description,
              description: weatherInfo.weather.description,
              icon: weatherInfo.weather.icon,
              humidity: weatherInfo.rh,
              windSpeed: Math.round(weatherInfo.wind_spd * 3.6),
              feelsLike: Math.round(weatherInfo.app_temp),
              pressure: weatherInfo.pres,
              visibility: weatherInfo.vis,
              uv: weatherInfo.uv,
              sunrise: weatherInfo.sunrise,
              sunset: weatherInfo.sunset,
            };
          } else {
            throw new Error('No weather data available');
          }
          loading.value = false;
        })
        .catch((error) => {
          console.error('Error fetching weather data:', error);
          error.value = 'Không thể tải dữ liệu thời tiết';
          loading.value = false;
        });
    },
    (geolocationError) => {
      console.error('Geolocation error:', geolocationError);
      error.value = 'Không thể lấy vị trí. Vui lòng bật dịch vụ định vị.';
      loading.value = false;
    },
  );
};

const refreshWeather = () => {
  fetchWeatherData();
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
  fetchWeatherData();
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<template>
  <div class="weather-widget-minimal" :style="widgetStyle">
    <div v-if="loading" class="loading">
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div v-else-if="error" class="error">
      <div class="error-icon">!</div>
      <div class="error-text">{{ error }}</div>
      <button @click="refreshWeather" class="refresh-btn">Thử lại</button>
    </div>

    <div v-else-if="weatherData" class="weather-content">
      <!-- Time and Location -->
      <div class="header">
        <div class="time">{{ currentTime }}</div>
        <div class="location">{{ weatherData.location }}</div>
      </div>

      <!-- Main Weather -->
      <div class="main-weather">
        <div class="temp-section">
          <div class="temperature">{{ weatherData.temperature }}°</div>
          <div class="feels-like">Cảm giác {{ weatherData.feelsLike }}°</div>
        </div>
        <div class="icon-section">
          <img
            :src="`https://cdn.weatherbit.io/static/img/icons/${weatherData.icon}.png`"
            :alt="weatherData.description"
            class="weather-icon"
          />
        </div>
      </div>

      <!-- Weather Description -->
      <div class="description">{{ weatherData.description }}</div>

      <!-- Quick Stats -->
      <div class="stats">
        <div class="stat-item">
          <span class="stat-icon">💧</span>
          <span class="stat-value">{{ weatherData.humidity }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">💨</span>
          <span class="stat-value">{{ weatherData.windSpeed }}km/h</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">👁️</span>
          <span class="stat-value">{{ weatherData.visibility }}km</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-widget-minimal {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  color: hsl(var(--foreground));
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  overflow: hidden;
  position: relative;
  padding: 20px;
  transition: all 0.3s ease;
}

.weather-widget-minimal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #f0f0f0, #cacaca);
  border-radius: 20px 20px 0 0;
}

.dark .weather-widget-minimal::before {
  background: linear-gradient(90deg, #374151, #1f2937);
}

/* Loading State */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.loading-dots {
  display: flex;
  gap: 8px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: hsl(var(--muted-foreground));
  animation: bounce 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Error State */
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 20px;
}

.error-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ff6b6b;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 12px;
}

.error-text {
  font-size: 0.9rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 16px;
  line-height: 1.4;
}

.refresh-btn {
  padding: 8px 16px;
  background: hsl(var(--primary));
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-1px);
}

/* Main Content */
.weather-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.time {
  font-size: 1.1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.location {
  font-size: 0.9rem;
  color: hsl(var(--muted-foreground));
  font-weight: 500;
}

/* Main Weather */
.main-weather {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex: 1;
}

.temp-section {
  flex: 1;
}

.temperature {
  font-size: 3rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  line-height: 1;
  margin-bottom: 4px;
}

.feels-like {
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
}

.icon-section {
  flex-shrink: 0;
}

.weather-icon {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

/* Description */
.description {
  font-size: 1rem;
  color: hsl(var(--muted-foreground));
  text-align: center;
  margin-bottom: 20px;
  text-transform: capitalize;
  font-weight: 500;
}

/* Stats */
.stats {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.stat-icon {
  font-size: 1.2rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

/* Hover effect */
.weather-widget-minimal:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 25px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.dark .weather-widget-minimal:hover {
  box-shadow:
    0 10px 25px -3px rgba(0, 0, 0, 0.3),
    0 4px 6px -2px rgba(0, 0, 0, 0.1);
}
</style>
