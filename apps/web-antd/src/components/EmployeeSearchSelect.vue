<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';

import { Select } from 'ant-design-vue';

import { requestClient } from '#/api/request';

const props = defineProps<{
  allowClear?: boolean;
  debounceMs?: number;
  disabled?: boolean;
  mode?: Mode; // single | multiple
  modelValue: string | string[] | undefined;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | string[] | undefined): void;
  (e: 'change', v: string | string[] | undefined, option?: any): void;
}>();

const ASelect = Select;

type Mode = 'multiple' | 'single';

const isMultiple = computed(() => props.mode === 'multiple');
const innerValue = ref<string | string[] | undefined>(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (innerValue.value = v),
);

type Option = {
  birthDate: Date | null;
  email: string;
  identification: string;
  label: string;
  name: string;
  phone: string;
  userName: string;
  value: number;
}; // name before value
const options = ref<Option[]>([]);
const loading = ref(false);
let timer: any = null;

function normalize(res: any): Option[] {
  let list: any[] = [];
  if (Array.isArray(res?.data)) {
    list = res.data;
  } else if (Array.isArray(res?.items)) {
    list = res.items;
  } else {
    list = [];
  }
  return list
    .map((u: any) => ({
      label: `${u?.name || u?.userName || u?.email || 'Unknown'}${u?.userName ? ` (${u.userName})` : ''}`,
      name: u?.name || u?.userName || u?.email || 'Unknown',
      userName: u?.userName,
      email: u?.email || '',
      phone: u?.phone || '',
      identification: u?.identification || '',
      birthDate: u?.birthDate ? new Date(u.birthDate) : null,
      value: Number(u?.id),
    }))
    .filter((o: any) => o.value);
}

async function fetchEmployees(keyword: string) {
  return requestClient.get<any>('/api/hrms/employee/_search', {
    params: { Keyword: keyword || undefined },
    responseReturn: 'body',
  });
}

function onSearch(value: string) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    loading.value = true;
    try {
      const res = await fetchEmployees(value);
      options.value = normalize(res);
    } catch {
      options.value = [];
    } finally {
      loading.value = false;
    }
  }, props.debounceMs ?? 300);
}

function onChange(v: any, option: any) {
  emit('update:modelValue', v);
  emit('change', v, option);
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <ASelect
    :mode="isMultiple ? 'multiple' : undefined"
    :value="innerValue as any"
    show-search
    :filter-option="false"
    :options="options"
    :loading="loading"
    :placeholder="
      placeholder || (isMultiple ? 'Chọn nhiều nhân viên' : 'Chọn nhân viên')
    "
    :disabled="disabled"
    :allow-clear="allowClear !== false"
    @search="onSearch"
    @change="onChange"
  />
</template>
