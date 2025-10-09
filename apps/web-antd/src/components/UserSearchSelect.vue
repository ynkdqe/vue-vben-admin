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
  (e: 'change', v: string | string[] | undefined): void;
}>();

const ASelect = Select;

type Mode = 'multiple' | 'single';

const isMultiple = computed(() => props.mode === 'multiple');
const innerValue = ref<string | string[] | undefined>(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (innerValue.value = v),
);

type Option = { label: string; value: string };
const options = ref<Option[]>([]);
const loading = ref(false);
let timer: any = null;

function normalize(res: any): Option[] {
  const list = Array.isArray(res?.data) ? res.data : Array.isArray(res?.items) ? res.items : [];
  return list
    .map((u: any) => ({
      label: `${u?.name || u?.userName || u?.email || 'Unknown'}${u?.userName ? ` (${u.userName})` : ''}`,
      value: String(u?.id ?? u?.userId ?? ''),
    }))
    .filter((o: any) => o.value);
}

async function fetchUsers(keyword: string) {
  return requestClient.get<any>('/api/identity/users/_search', {
    params: { Keyword: keyword || undefined },
    responseReturn: 'body',
  });
}

function onSearch(value: string) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    loading.value = true;
    try {
      const res = await fetchUsers(value);
      options.value = normalize(res);
    } catch {
      options.value = [];
    } finally {
      loading.value = false;
    }
  }, props.debounceMs ?? 300);
}

function onChange(v: any) {
  emit('update:modelValue', v);
  emit('change', v);
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
      placeholder || (isMultiple ? 'Chọn nhiều người dùng' : 'Chọn người dùng')
    "
    :disabled="disabled"
    :allow-clear="allowClear !== false"
    @search="onSearch"
    @change="onChange"
  />
</template>
