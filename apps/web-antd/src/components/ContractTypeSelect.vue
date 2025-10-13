<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';

import { Select } from 'ant-design-vue';

const props = defineProps<{
  modelValue?: any;
  multiple?: boolean;
  placeholder?: string;
  types: Array<{
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
    :placeholder="
      props.placeholder || (props.multiple ? 'Chọn nhiều loại' : 'Chọn loại')
    "
    @change="onChange"
    style="width: 100%"
    allow-clear
  >
    <ASelectOption
      v-for="t in props.types"
      :key="t.id ?? t.value"
      :value="t.id ?? t.value"
    >
      {{ t.name ?? t.label }}
    </ASelectOption>
  </ASelect>
</template>
