<script setup lang="ts">
import { computed, markRaw, onMounted, onUnmounted, ref } from 'vue';
import { GridItem, GridLayout } from 'vue-grid-layout-v3';

import { usePreferences } from '@vben/preferences';

import AddWidgetModal from './AddWidgetModal.vue';
// Clock Widgets
import ClockAnalog from './clock/ClockAnalog.vue';
import ClockNeon from './clock/ClockNeon.vue';
import ClockWidget from './clock/ClockWidget.vue';
// Notes
import NoteWidget from './NoteWidget.vue';
// Weather Widgets
import WeatherMinimal from './weather/WeatherMinimal.vue';
import WeatherModern from './weather/WeatherModern.vue';
import WeatherStandard from './weather/WeatherStandard.vue';

const { isDark } = usePreferences();

const availableWidgets = [
  {
    type: 'clock',
    name: 'Clock',
    component: null,
    description: 'Time and date widgets',
    variants: 3,
    icon: '🕐',
    variantsList: [
      {
        id: 'clock-standard',
        name: 'Clock',
        description: 'Standard digital clock with date and greeting',
        icon: '🕐',
        component: markRaw(ClockWidget),
      },
      {
        id: 'clock-analog',
        name: 'Clock Analog',
        description: 'Beautiful analog clock with moving hands',
        icon: '🕐',
        component: markRaw(ClockAnalog),
      },
      {
        id: 'clock-neon',
        name: 'Clock Neon',
        description: 'Futuristic neon-style digital clock',
        icon: '🕐',
        component: markRaw(ClockNeon),
      },
    ],
  },
  {
    type: 'note',
    name: 'Notes',
    component: markRaw(NoteWidget),
    description: 'Note-taking and text widgets',
    variants: 1,
    icon: '📝',
  },
  {
    type: 'weather',
    name: 'Weather',
    component: null,
    description: 'Weather information widgets',
    variants: 3,
    icon: '☀️',
    variantsList: [
      {
        id: 'weather-standard',
        name: 'Weather',
        description: 'Standard weather widget with detailed information',
        icon: '☁️',
        component: markRaw(WeatherStandard),
      },
      {
        id: 'weather-minimal',
        name: 'Weather Minimal',
        description: 'Clean and minimal weather design',
        icon: '☀️',
        component: markRaw(WeatherMinimal),
      },
      {
        id: 'weather-modern',
        name: 'Weather Modern',
        description: 'Modern weather widget with animations',
        icon: '🌈',
        component: markRaw(WeatherModern),
      },
    ],
  },
  {
    type: 'slideshow',
    name: 'Slideshow',
    component: null,
    description: 'Image gallery and slideshow widgets',
    variants: 1,
    icon: '🖼️',
  },
  {
    type: 'currency',
    name: 'Currency',
    component: null,
    description: 'Exchange rate widgets',
    variants: 2,
    icon: '💱',
  },
  {
    type: 'calendar',
    name: 'Calendar',
    component: null,
    description: 'Calendar and event widgets',
    variants: 3,
    icon: '📅',
  },
  {
    type: 'chart',
    name: 'Chart',
    component: null,
    description: 'Data visualization widgets',
    variants: 5,
    icon: '📊',
  },
  {
    type: 'todo',
    name: 'Todo List',
    component: null,
    description: 'Task management widgets',
    variants: 2,
    icon: '✅',
  },
];

// Computed styles for dark mode
const containerStyle = computed(() => ({
  height: '100vh',
  padding: '20px',
  backgroundColor: isDark.value ? 'hsl(var(--background))' : '#ffffff',
  color: isDark.value ? 'hsl(var(--foreground))' : '#000000',
  overflow: 'hidden', // Ngăn scroll
}));

const canvasStyle = computed(() => ({
  width: '100%',
  height: 'calc(100vh - 40px)', // Trừ padding
  backgroundColor: isDark.value ? 'hsl(var(--muted))' : '#f9f9f9',
  overflow: 'hidden', // Ngăn scroll
}));

// Layout grid hiện tại
const layout = ref<any[]>([]);

// Tăng index khi thêm widget mới
let nextId = 0;

// Kéo từ sidebar -> canvas
function addWidget(type: string, variantId?: string) {
  const widget = availableWidgets.find((w) => w.type === type);
  if (!widget) return;
  layout.value.push({
    x: 0,
    y: 0,
    w: 2,
    h: 2,
    i: `${nextId++}`,
    type: widget.type,
    component: widget.component,
    variantId,
  });
}

// State cho floating button
const isFabMenuOpen = ref(false);
const isPreviewMode = ref(false);
const showBackgroundConfig = ref(false);
const showWidgetLoader = ref(false);
const showAddWidgetModal = ref(false);
let hideMenuTimeout: NodeJS.Timeout | null = null;

// Các function cho Float Action Button
function saveLayout() {
  const layoutData = JSON.stringify(layout.value);
  localStorage.setItem('widget-layout', layoutData);
}

function clearAll() {
  layout.value = [];
  nextId = 0;
}

// Floating button functions
function toggleFabMenu() {
  isFabMenuOpen.value = !isFabMenuOpen.value;
  if (hideMenuTimeout) {
    clearTimeout(hideMenuTimeout);
    hideMenuTimeout = null;
  }
}

function hideFabMenu() {
  if (hideMenuTimeout) {
    clearTimeout(hideMenuTimeout);
    hideMenuTimeout = null;
  }
  isFabMenuOpen.value = false;
}

function toggleGallery() {
  showAddWidgetModal.value = true;
  hideFabMenu();
}

function saveDashboard() {
  saveLayout();
}

function clearDashboard() {
  clearAll();
}

function setDefaultLayoutHandler() {
  // Reset to default layout
  layout.value = [];
  nextId = 0;
  // Add some default widgets
  addWidget('clock');
  addWidget('note');
}

// Click outside to close menu
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement;
  const fabContainer = target.closest('.fab-container');
  if (!fabContainer && isFabMenuOpen.value) {
    hideFabMenu();
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Widget selection functions
function selectWidget(widget: any) {
  if (widget.component) {
    addWidget(widget.type);
  }
  showAddWidgetModal.value = false;
}

function selectVariant(widget: any, variant: any) {
  // Add widget with specific variant
  if (variant.component) {
    addWidgetWithComponent(variant.component, variant.id);
  } else {
    addWidget(widget.type, variant.id);
  }
  showAddWidgetModal.value = false;
}

function addWidgetWithComponent(component: any, variantId?: string) {
  layout.value.push({
    x: 0,
    y: 0,
    w: 2,
    h: 2,
    i: `${nextId++}`,
    type: 'custom',
    component,
    variantId,
  });
}

function closeAddWidgetModal() {
  showAddWidgetModal.value = false;
}

// Remove widget function
function removeWidget(widgetId: string) {
  const index = layout.value.findIndex((item) => item.i === widgetId);
  if (index !== -1) {
    layout.value.splice(index, 1);
  }
}
</script>

<template>
  <div :style="containerStyle">
    <!-- Canvas -->
    <div :style="canvasStyle">
      <GridLayout
        v-model:layout="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :margin="[10, 10]"
        :use-css-transforms="true"
        :style="canvasStyle"
      >
        <GridItem
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
        >
          <div class="widget-container">
            <component :is="item.component" />
            <button
              class="widget-remove-btn"
              @click="removeWidget(item.i)"
              v-if="!isPreviewMode"
            >
              ×
            </button>
          </div>
        </GridItem>
      </GridLayout>
    </div>

    <!-- Floating Action Button -->
    <div class="fab-container" v-if="!isPreviewMode">
      <div class="fab-menu" v-if="isFabMenuOpen" @click.stop>
        <button class="fab-menu-item add-item" @click="toggleGallery">
          <span class="fab-icon">+</span>
          <span class="fab-label">Add Widget</span>
        </button>
        <button class="fab-menu-item save-item" @click="saveDashboard">
          <span class="fab-icon">💾</span>
          <span class="fab-label">Save Layout</span>
        </button>
        <button class="fab-menu-item clear-item" @click="clearDashboard">
          <span class="fab-icon">🗑️</span>
          <span class="fab-label">Clear All</span>
        </button>
        <button
          class="fab-menu-item background-item"
          @click="showBackgroundConfig = true"
        >
          <span class="fab-icon">🎨</span>
          <span class="fab-label">Background</span>
        </button>
        <button
          class="fab-menu-item preview-item"
          @click="isPreviewMode = !isPreviewMode"
        >
          <span class="fab-icon">{{ isPreviewMode ? '👁️' : '👁️‍🗨️' }}</span>
          <span class="fab-label">{{
            isPreviewMode ? 'Exit Preview' : 'Preview'
          }}</span>
        </button>
        <button
          class="fab-menu-item default-layout-item"
          @click="setDefaultLayoutHandler"
        >
          <span class="fab-icon">🏠</span>
          <span class="fab-label">Set Default Layout</span>
        </button>
        <button
          class="fab-menu-item loader-item"
          @click="showWidgetLoader = true"
        >
          <span class="fab-icon">📁</span>
          <span class="fab-label">Load Config</span>
        </button>
      </div>
      <button class="fab-button" @click="toggleFabMenu">
        <span class="fab-main-icon">⚙️</span>
      </button>
    </div>

    <!-- Add Widget Modal -->
    <AddWidgetModal
      :show="showAddWidgetModal"
      :widgets="availableWidgets"
      @close="closeAddWidgetModal"
      @select="selectWidget"
      @select-variant="selectVariant"
    />
  </div>
</template>

<style scoped>
.fab-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  pointer-events: auto;
}

.fab-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: hsl(var(--primary));
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: white;
  font-size: 20px;
}

.fab-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.fab-menu {
  position: absolute;
  bottom: 70px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: slideUp 0.3s ease;
  pointer-events: auto;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fab-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: hsl(var(--foreground));
  font-size: 14px;
  white-space: nowrap;
}

.fab-menu-item:hover {
  background: hsl(var(--accent));
  transform: translateX(-4px);
}

.fab-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.fab-label {
  font-weight: 500;
}

.fab-main-icon {
  font-size: 20px;
}

/* Dark mode adjustments */
.dark .fab-menu-item {
  background: hsl(var(--card));
  border-color: hsl(var(--border));
  color: hsl(var(--foreground));
}

.dark .fab-menu-item:hover {
  background: hsl(var(--accent));
}

/* Widget Container Styles */
.widget-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.widget-remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
  backdrop-filter: blur(4px);
}

.widget-container:hover .widget-remove-btn {
  opacity: 1;
}

.widget-remove-btn:hover {
  background: rgba(220, 38, 38, 1);
  transform: scale(1.1);
}

.widget-remove-btn:active {
  transform: scale(0.95);
}
</style>
