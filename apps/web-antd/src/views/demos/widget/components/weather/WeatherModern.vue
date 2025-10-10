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
  <div class="weather-widget-modern" :style="widgetStyle">
    <div class="background-animation">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div class="loading-text">Đang tải thời tiết...</div>
    </div>

    <div v-else-if="error" class="error">
      <div class="error-container">
        <div class="error-icon">🌧️</div>
        <div class="error-text">{{ error }}</div>
        <button @click="refreshWeather" class="refresh-button">
          <span class="refresh-icon">↻</span>
          Thử lại
        </button>
      </div>
    </div>

    <div v-else-if="weatherData" class="weather-content">
      <!-- Header -->
      <div class="header">
        <div class="time-section">
          <div class="current-time">{{ currentTime }}</div>
          <div class="current-date">{{ currentDate }}</div>
        </div>
        <div class="location-section">
          <div class="location-icon">📍</div>
          <div class="location-name">{{ weatherData.location }}</div>
        </div>
      </div>

      <!-- Main Weather Display -->
      <div class="main-weather">
        <div class="weather-icon-container">
          <div class="icon-background"></div>
          <img
            :src="`https://cdn.weatherbit.io/static/img/icons/${weatherData.icon}.png`"
            :alt="weatherData.description"
            class="weather-icon"
          />
        </div>
        <div class="temperature-section">
          <div class="temperature">{{ weatherData.temperature }}°</div>
          <div class="weather-description">{{ weatherData.description }}</div>
        </div>
      </div>

      <!-- Feels Like -->
      <div class="feels-like-card">
        <div class="feels-like-icon">🌡️</div>
        <div class="feels-like-content">
          <div class="feels-like-label">Cảm giác như</div>
          <div class="feels-like-temp">{{ weatherData.feelsLike }}°</div>
        </div>
      </div>

      <!-- Weather Stats -->
      <div class="weather-stats">
        <div class="stat-card">
          <div class="stat-icon">💧</div>
          <div class="stat-content">
            <div class="stat-label">Độ ẩm</div>
            <div class="stat-value">{{ weatherData.humidity }}%</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💨</div>
          <div class="stat-content">
            <div class="stat-label">Gió</div>
            <div class="stat-value">{{ weatherData.windSpeed }} km/h</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">👁️</div>
          <div class="stat-content">
            <div class="stat-label">Tầm nhìn</div>
            <div class="stat-value">{{ weatherData.visibility }} km</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-widget-modern {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  color: hsl(var(--foreground));
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  overflow: hidden;
  position: relative;
  padding: 24px;
  transition: all 0.3s ease;
}

.weather-widget-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
  border-radius: 24px 24px 0 0;
}

/* Background Animation */
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: hsl(var(--muted));
  animation: float 6s ease-in-out infinite;
  opacity: 0.1;
}

.circle-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 60px;
  height: 60px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Loading State */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  z-index: 2;
}

.loading-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

.loading-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid hsl(var(--primary));
  border-radius: 50%;
  animation: loading-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: hsl(var(--primary)) transparent transparent transparent;
}

.loading-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.loading-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.loading-ring div:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes loading-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
}

/* Error State */
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  z-index: 2;
}

.error-container {
  text-align: center;
  padding: 20px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.error-text {
  font-size: 1rem;
  margin-bottom: 20px;
  color: hsl(var(--muted-foreground));
  line-height: 1.5;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: hsl(var(--primary));
  border: 1px solid hsl(var(--primary));
  border-radius: 25px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-button:hover {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-2px);
}

.refresh-icon {
  font-size: 1.1rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Main Content */
.weather-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.time-section {
  text-align: left;
}

.current-time {
  font-size: 1.4rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin-bottom: 4px;
}

.current-date {
  font-size: 0.9rem;
  color: hsl(var(--muted-foreground));
  text-transform: capitalize;
}

.location-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.location-icon {
  font-size: 1.2rem;
}

.location-name {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
}

/* Main Weather */
.main-weather {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex: 1;
}

.weather-icon-container {
  position: relative;
  margin-right: 20px;
  flex-shrink: 0;
}

.icon-background {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: hsl(var(--muted));
  border-radius: 50%;
}

.weather-icon {
  width: 80px;
  height: 80px;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.temperature-section {
  flex: 1;
}

.temperature {
  font-size: 3.5rem;
  font-weight: 800;
  color: hsl(var(--foreground));
  line-height: 1;
  margin-bottom: 8px;
}

.weather-description {
  font-size: 1.1rem;
  color: hsl(var(--muted-foreground));
  text-transform: capitalize;
  font-weight: 500;
}

/* Feels Like Card */
.feels-like-card {
  display: flex;
  align-items: center;
  background: hsl(var(--muted));
  padding: 16px 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.feels-like-card:hover {
  transform: translateY(-2px);
  background: hsl(var(--accent));
}

.feels-like-icon {
  font-size: 1.5rem;
  margin-right: 12px;
}

.feels-like-content {
  flex: 1;
}

.feels-like-label {
  font-size: 0.9rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 2px;
}

.feels-like-temp {
  font-size: 1.2rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

/* Weather Stats */
.weather-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  background: hsl(var(--muted));
  padding: 16px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  background: hsl(var(--accent));
}

.stat-icon {
  font-size: 1.3rem;
  margin-right: 12px;
  opacity: 0.9;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

/* Hover effect */
.weather-widget-modern:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 25px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.dark .weather-widget-modern:hover {
  box-shadow:
    0 10px 25px -3px rgba(0, 0, 0, 0.3),
    0 4px 6px -2px rgba(0, 0, 0, 0.1);
}
</style>
