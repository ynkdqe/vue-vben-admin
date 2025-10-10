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
const currentDate = ref('');

// Update current time
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  currentDate.value = now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

let timeInterval: number;

// Fetch weather data from Weatherbit API
const fetchWeatherData = () => {
  loading.value = true;
  error.value = null;
  // Get user's location
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
        .catch((error_) => {
          console.error('Error fetching weather data:', error_);
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

// Refresh weather data
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
  // In browser, setInterval returns a number; cast to number to satisfy TS
  timeInterval = window.setInterval(updateTime, 1000) as unknown as number;
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<template>
  <div class="weather-widget" :style="widgetStyle">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Đang tải...</div>
    </div>

    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <div class="error-text">{{ error }}</div>
      <button @click="refreshWeather" class="refresh-button">Thử lại</button>
    </div>

    <div v-else-if="weatherData" class="weather-content">
      <!-- Header with time and location -->
      <div class="weather-header">
        <div class="time-info">
          <div class="current-time">{{ currentTime }}</div>
          <div class="current-date">{{ currentDate }}</div>
        </div>
        <div class="location-info">
          <div class="location-name">{{ weatherData.location }}</div>
        </div>
      </div>

      <!-- Main weather display -->
      <div class="weather-main">
        <div class="weather-icon">
          <img
            :src="`https://cdn.weatherbit.io/static/img/icons/${weatherData.icon}.png`"
            :alt="weatherData.description"
            class="weather-icon-img"
          />
        </div>
        <div class="weather-info">
          <div class="temperature">{{ weatherData.temperature }}°</div>
          <div class="description">{{ weatherData.description }}</div>
          <div class="feels-like">
            Cảm giác như {{ weatherData.feelsLike }}°
          </div>
        </div>
      </div>

      <!-- Weather details -->
      <div class="weather-details">
        <div class="detail-item">
          <div class="detail-icon">💧</div>
          <div class="detail-text">
            <div class="detail-label">Độ ẩm</div>
            <div class="detail-value">{{ weatherData.humidity }}%</div>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-icon">💨</div>
          <div class="detail-text">
            <div class="detail-label">Gió</div>
            <div class="detail-value">{{ weatherData.windSpeed }} km/h</div>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-icon">👁️</div>
          <div class="detail-text">
            <div class="detail-label">Tầm nhìn</div>
            <div class="detail-value">{{ weatherData.visibility }} km</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.weather-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
  border-radius: 12px 12px 0 0;
}

/* Loading State */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid hsl(var(--muted));
  border-top: 3px solid hsl(var(--primary));
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
}

/* Error State */
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
  padding: 20px;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.error-text {
  font-size: 0.9rem;
  margin-bottom: 16px;
  color: hsl(var(--muted-foreground));
  line-height: 1.4;
}

.refresh-button {
  padding: 8px 16px;
  background: hsl(var(--primary));
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-button:hover {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-1px);
}

/* Main Content */
.weather-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* Header */
.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.time-info {
  text-align: left;
}

.current-time {
  font-size: 1.2rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 2px;
}

.current-date {
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
  text-transform: capitalize;
}

.location-info {
  text-align: right;
}

.location-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
}

/* Main Weather Display */
.weather-main {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex: 1;
}

.weather-icon {
  margin-right: 16px;
  flex-shrink: 0;
}

.weather-icon-img {
  width: 60px;
  height: 60px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.weather-info {
  flex: 1;
}

.temperature {
  font-size: 2.5rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  line-height: 1;
  margin-bottom: 4px;
}

.description {
  font-size: 0.9rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 4px;
  text-transform: capitalize;
}

.feels-like {
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
}

/* Weather Details */
.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  background: hsl(var(--muted));
  padding: 12px;
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.detail-item:hover {
  transform: translateY(-2px);
  background: hsl(var(--accent));
}

.detail-icon {
  font-size: 1.2rem;
  margin-right: 8px;
  opacity: 0.9;
}

.detail-text {
  flex: 1;
}

.detail-label {
  font-size: 0.7rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

/* Hover effect */
.weather-widget:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 25px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.dark .weather-widget:hover {
  box-shadow:
    0 10px 25px -3px rgba(0, 0, 0, 0.3),
    0 4px 6px -2px rgba(0, 0, 0, 0.1);
}
</style>
