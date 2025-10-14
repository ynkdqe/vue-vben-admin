<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { Select } from 'ant-design-vue';

import { fetchContractTypeList } from '#/api/hrms/contract-type';

const props = defineProps<{
  disabled?: boolean;
  modelValue?: any;
  multiple?: boolean;
  placeholder?: string;
  types?: Array<{
    id?: number | string;
    label?: string;
    name?: string;
    value?: any;
  }>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: any): void;
}>();

const items = ref<Array<any>>(props.types ?? []);
const loading = ref(false);

async function load() {
  if (props.types && props.types.length > 0) return;
  loading.value = true;
  try {
    const res = await fetchContractTypeList({ pageSize: 9999 });
    items.value = res.items ?? [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);

watch(
  () => props.types,
  (v) => {
    if (v && v.length > 0) items.value = v;
  },
);

function onChange(v: any) {
  emit('update:modelValue', v);
}

const ASelect = Select;
const ASelectOption = Select.Option;
</script>

<template>
  <ASelect
    :mode="props.multiple ? 'multiple' : undefined"
    :value="props.modelValue"
    :placeholder="
      props.placeholder ||
      (props.multiple
        ? 'Ch\u1ecdn nhi\u1ec1u lo\u1ea1i'
        : 'Ch\u1ecdn lo\u1ea1i')
    "
    @change="onChange"
    style="width: 100%"
    :disabled="props.disabled"
    :loading="loading"
    allow-clear
  >
    <ASelectOption
      v-for="t in items"
      :key="t.id ?? t.value"
      :value="t.id ?? t.value"
    >
      {{ t.name ?? t.label }}
    </ASelectOption>
  </ASelect>
</template>
