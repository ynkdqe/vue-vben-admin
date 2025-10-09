<script setup lang="ts">
import { ref } from 'vue';

interface WidgetVariant {
  id: string;
  name: string;
  description: string;
  icon: string;
  component?: any;
}

interface Widget {
  type: string;
  name: string;
  component: any;
  description: string;
  variants: number;
  icon: string;
  variantsList?: WidgetVariant[];
}

interface Props {
  show: boolean;
  widgets: Widget[];
}

interface Emits {
  (e: 'close'): void;
  (e: 'select', widget: Widget): void;
  (e: 'selectVariant', widget: Widget, variant: WidgetVariant): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// const { isDark } = usePreferences();

const currentView = ref<'list' | 'variants'>('list');
const selectedWidget = ref<null | Widget>(null);

function selectWidget(widget: Widget) {
  if (widget.variantsList && widget.variantsList.length > 0) {
    selectedWidget.value = widget;
    currentView.value = 'variants';
  } else {
    emit('select', widget);
    console.warn(props);
  }
}

function selectVariant(variant: WidgetVariant) {
  if (selectedWidget.value) {
    emit('selectVariant', selectedWidget.value, variant);
  }
}

function goBack() {
  currentView.value = 'list';
  selectedWidget.value = null;
}

function closeModal() {
  currentView.value = 'list';
  selectedWidget.value = null;
  emit('close');
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Widget List View -->
      <div v-if="currentView === 'list'">
        <div class="modal-header">
          <h2 class="modal-title">Add Widget</h2>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="widget-list">
            <div
              v-for="widget in widgets"
              :key="widget.type"
              class="widget-item"
              @click="selectWidget(widget)"
            >
              <div class="widget-icon">
                <span class="icon">{{ widget.icon }}</span>
              </div>
              <div class="widget-info">
                <div class="widget-name">{{ widget.name }}</div>
                <div class="widget-description">{{ widget.description }}</div>
                <div class="widget-variants">
                  {{ widget.variants }} variant{{
                    widget.variants > 1 ? 's' : ''
                  }}
                </div>
              </div>
              <div class="widget-arrow">→</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Widget Variants View -->
      <div v-if="currentView === 'variants' && selectedWidget">
        <div class="modal-header">
          <div class="breadcrumb">
            <button class="breadcrumb-back" @click="goBack">← Widgets</button>
            <span class="breadcrumb-separator">></span>
            <span class="breadcrumb-current">{{ selectedWidget.name }}</span>
          </div>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="variants-header">
          <h2 class="variants-title">{{ selectedWidget.name }} Widgets</h2>
          <p class="variants-subtitle">
            Choose a design that fits your dashboard
          </p>
        </div>
        <div class="modal-body">
          <div class="variants-grid">
            <div
              v-for="variant in selectedWidget.variantsList"
              :key="variant.id"
              class="variant-item"
              @click="selectVariant(variant)"
            >
              <div class="variant-icon">
                <span class="icon">{{ variant.icon }}</span>
              </div>
              <div class="variant-info">
                <div class="variant-name">{{ variant.name }}</div>
                <div class="variant-description">{{ variant.description }}</div>
              </div>
              <button class="variant-add-btn">Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: hsl(var(--card));
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid hsl(var(--border));
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid hsl(var(--border));
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.modal-body {
  padding: 0;
  max-height: 60vh;
  overflow-y: auto;
}

.widget-list {
  padding: 8px 0;
}

.widget-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid hsl(var(--border));
}

.widget-item:last-child {
  border-bottom: none;
}

.widget-item:hover {
  background: hsl(var(--muted));
}

.widget-icon {
  width: 48px;
  height: 48px;
  background: hsl(var(--muted));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.widget-icon .icon {
  font-size: 24px;
}

.widget-info {
  flex: 1;
  min-width: 0;
}

.widget-name {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 4px;
}

.widget-description {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 2px;
}

.widget-variants {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  opacity: 0.8;
}

.widget-arrow {
  color: hsl(var(--muted-foreground));
  font-size: 1.25rem;
  margin-left: 16px;
  opacity: 0.6;
}

/* Dark mode modal adjustments */
.dark .modal-content {
  background: hsl(var(--card));
  border-color: hsl(var(--border));
}

.dark .modal-header {
  border-bottom-color: hsl(var(--border));
}

.dark .modal-title {
  color: hsl(var(--foreground));
}

.dark .widget-item {
  border-bottom-color: hsl(var(--border));
}

.dark .widget-item:hover {
  background: hsl(var(--muted));
}

.dark .widget-icon {
  background: hsl(var(--muted));
}

.dark .widget-name {
  color: hsl(var(--foreground));
}

.dark .widget-description {
  color: hsl(var(--muted-foreground));
}

.dark .widget-variants {
  color: hsl(var(--muted-foreground));
}

.dark .widget-arrow {
  color: hsl(var(--muted-foreground));
}

/* Variants View Styles */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.breadcrumb-back {
  background: none;
  border: none;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.breadcrumb-back:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.breadcrumb-separator {
  color: hsl(var(--muted-foreground));
  opacity: 0.6;
}

.breadcrumb-current {
  color: hsl(var(--foreground));
  font-weight: 500;
}

.variants-header {
  padding: 0 24px 20px;
  border-bottom: 1px solid hsl(var(--border));
}

.variants-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0 0 8px 0;
}

.variants-subtitle {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin: 0;
}

.variants-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px 24px;
}

.variant-item {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.variant-item:hover {
  border-color: hsl(var(--primary));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.variant-icon {
  width: 64px;
  height: 64px;
  background: hsl(var(--muted));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.variant-icon .icon {
  font-size: 32px;
}

.variant-info {
  flex: 1;
  margin-bottom: 16px;
}

.variant-name {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 8px;
}

.variant-description {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  line-height: 1.4;
}

.variant-add-btn {
  background: hsl(var(--primary));
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.variant-add-btn:hover {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-1px);
}

/* Dark mode variants adjustments */
.dark .variant-item {
  background: hsl(var(--card));
  border-color: hsl(var(--border));
}

.dark .variant-item:hover {
  border-color: hsl(var(--primary));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark .variant-icon {
  background: hsl(var(--muted));
}

.dark .variant-name {
  color: hsl(var(--foreground));
}

.dark .variant-description {
  color: hsl(var(--muted-foreground));
}
</style>
