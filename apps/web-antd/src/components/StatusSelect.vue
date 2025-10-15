<script setup lang="ts">
import { defineProps } from 'vue';

import { Select } from 'ant-design-vue';

const props = defineProps<{
  modelValue?: any;
  multiple?: boolean;
  placeholder?: string;
  statuses: Array<{
    id?: number | string;
    label?: string;
    name?: string;
    value?: any;
  }>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: any): void;
}>();

const ASelect = Select;
const ASelectOption = Select.Option;

function onChange(v: any) {
  emit('update:modelValue', v);
}
</script>

<template>
  <ASelect
    :mode="props.multiple ? 'multiple' : undefined"
    :value="props.modelValue"
    :placeholder="props.placeholder || (props.multiple ? 'Chọn nhiều' : 'Chọn')"
    @change="onChange"
    style="width: 100%"
    allow-clear
  >
    <ASelectOption
      v-for="s in props.statuses"
      :key="s.id ?? s.value"
      :value="s.id ?? s.value"
    >
      {{ s.name ?? s.label }}
    </ASelectOption>
  </ASelect>
</template>
