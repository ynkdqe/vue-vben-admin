<script lang="ts" setup>
import { BankOutlined, TeamOutlined } from '@ant-design/icons-vue';

interface Props {
  name: string;
  description: string;
  subMerchantCount?: number;
  userCount?: number;
  isSelected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  subMerchantCount: 0,
  userCount: 0,
  isSelected: false,
});

const emit = defineEmits<{
  select: [void];
}>();
</script>

<template>
  <div
    class="group relative cursor-pointer rounded-lg bg-white p-6"
    :class="props.isSelected ? 'bg-blue-50' : ''"
    :style="props.isSelected ? 'box-shadow: inset 0 0 0 2px #3b82f6' : ''"
    @click="emit('select')"
  >
    <!-- Checkmark for selected state -->
    <div v-if="props.isSelected" class="absolute right-4 top-4 text-blue-500">
      <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <!-- Icon -->
    <div
      class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xl font-bold text-blue-500"
    >
      <slot name="icon">
        {{ props.name.charAt(0).toUpperCase() }}
      </slot>
    </div>

    <!-- Content -->
    <h3 class="mb-1 text-lg font-semibold text-gray-900">{{ props.name }}</h3>
    <p class="mb-4 text-sm text-gray-600">{{ props.description }}</p>

    <!-- Stats -->
    <div class="space-y-2 text-sm text-gray-700">
      <div class="flex items-center gap-2">
        <BankOutlined class="h-4 w-4" />
        <span>Sub-merchants: {{ props.subMerchantCount }}</span>
      </div>
      <div class="flex items-center gap-2">
        <TeamOutlined class="h-4 w-4" />
        <span>Users: {{ props.userCount }}</span>
      </div>
    </div>
  </div>
</template>
