<script lang="ts" setup>
import { computed, defineEmits, defineProps, ref, watch } from 'vue';

import { message } from 'ant-design-vue';

import { requestClient } from '#/api/request';

type ApiPermission = {
  displayName: string;
  isGranted: boolean;
  name: string;
  parentName: null | string;
};

type ApiGroup = {
  displayName: string;
  name: string;
  permissions: ApiPermission[];
};

const props = defineProps<{
  modelValue: boolean;
  providerKey: string;
  providerName: string;
  title?: string;
}>();

const emit = defineEmits(['update:modelValue', 'save']);

const visible = computed({
  get: () => !!props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const filter = ref('');
const groups = ref<ApiGroup[]>([]);
const selectedGroup = ref<string>('');
const checked = ref<Record<string, boolean>>({});
const grantAll = ref(false);
const loading = ref(false);

const currentGroup = computed(
  () => groups.value.find((g) => g.name === selectedGroup.value) || null,
);
const currentPermissions = computed(
  () => currentGroup.value?.permissions || [],
);

async function fetchPermissions(providerName: string, providerKey: string) {
  if (!providerName || !providerKey) return;
  loading.value = true;
  const hide = message.loading('Loading permissions...', 0);
  try {
    const res = await requestClient.get<any>(
      `/api/permission-management/permissions?providerName=${encodeURIComponent(
        providerName,
      )}&providerKey=${encodeURIComponent(providerKey)}`,
      { responseReturn: 'body' },
    );

    const body = res ?? {};
    const apiGroups: ApiGroup[] = (body.groups || []).map((g: any) => ({
      name: g.name,
      displayName: g.displayName,
      permissions: (g.permissions || []).map((p: any) => ({
        name: p.name,
        displayName: p.displayName,
        parentName: p.parentName,
        isGranted: !!p.isGranted,
      })),
    }));

    groups.value = apiGroups;
    selectedGroup.value =
      apiGroups && apiGroups.length > 0 ? (apiGroups[0]?.name ?? '') : '';

    // init checked map
    const map: Record<string, boolean> = {};
    apiGroups.forEach((g) => {
      g.permissions.forEach((p) => {
        map[p.name] = p.isGranted;
      });
    });
    checked.value = map;
    // initialize grantAll
    grantAll.value =
      Object.values(map).every((v) => v === true) &&
      Object.keys(map).length > 0;
  } catch (error: any) {
    message.error(error?.message ?? 'Failed to load permissions');
  } finally {
    hide();
    loading.value = false;
  }
}

// fetch when visible becomes true or provider props change
watch(
  () => visible.value,
  (v) => {
    if (v && props.providerName && props.providerKey) {
      fetchPermissions(props.providerName, props.providerKey);
    }
  },
);

function close() {
  visible.value = false;
}

function onSave() {
  // prepare granted permissions list
  const granted = Object.keys(checked.value).filter((k) => checked.value[k]);
  emit('save', { granted });
  visible.value = false;
}

function toggleSelectAllInGroup(groupName: string, v: boolean) {
  const g = groups.value.find((x) => x.name === groupName);
  if (!g) return;
  g.permissions.forEach((p) => (checked.value[p.name] = v));
  // update grantAll
  grantAll.value = Object.values(checked.value).every((c) => c === true);
}

function onGroupSelectAllChange(ev: Event) {
  const el = ev.target as HTMLInputElement | null;
  if (!el) return;
  toggleSelectAllInGroup(selectedGroup.value, el.checked);
}

function onGrantAllChange(ev: Event) {
  const el = ev.target as HTMLInputElement | null;
  if (!el) return;
  toggleGrantAll(el.checked);
}

function toggleGrantAll(v: boolean) {
  grantAll.value = v;
  Object.keys(checked.value).forEach((k) => (checked.value[k] = v));
}
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
  >
    <div class="w-[920px] max-w-[98%] rounded-lg bg-white p-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="text-lg font-semibold">
          {{ props.title || 'Permissions' }}
        </div>
        <button @click="close" class="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <!-- Search and grant -->
      <div class="mt-4 flex items-center gap-4">
        <div
          class="flex flex-1 items-center gap-2 rounded-lg bg-gray-100 px-3 py-2"
        >
          <svg
            class="h-4 w-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M21 21l-4.35-4.35"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
            <circle
              cx="11"
              cy="11"
              r="6"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
          <input
            v-model="filter"
            placeholder="Filter"
            class="flex-1 bg-transparent outline-none"
          />
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            v-model="grantAll"
            @change="onGrantAllChange"
          />
          Grant all permissions
        </label>
      </div>

      <!-- Content -->
      <div class="mt-4 rounded-lg border p-4">
        <div class="flex">
          <!-- Left group list -->
          <div class="w-56 pr-4">
            <div class="max-h-[420px] overflow-auto pr-2">
              <div class="space-y-2">
                <button
                  v-for="g in groups"
                  :key="g.name"
                  @click="selectedGroup = g.name"
                  :class="
                    selectedGroup === g.name
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700'
                  "
                  class="w-full rounded-md border px-3 py-2 text-left"
                >
                  {{ g.displayName }}
                </button>
              </div>
            </div>
          </div>

          <!-- Right permission list -->
          <div class="flex-1 pl-6">
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  :checked="currentPermissions.every((p) => checked[p.name])"
                  @change="onGroupSelectAllChange"
                />
                Select all
              </label>
            </div>

            <div class="mt-4 max-h-[420px] overflow-auto">
              <div
                v-for="perm in currentPermissions"
                :key="perm.name"
                class="flex items-center gap-3 py-2"
                :class="perm.parentName ? 'pl-4' : ''"
              >
                <label class="flex items-center gap-2 text-gray-700">
                  <input type="checkbox" v-model="checked[perm.name]" />
                  <span
                    class="font-medium"
                    :class="perm.parentName ? 'text-gray-600' : 'text-gray-800'"
                  >
                    {{ perm.displayName }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer actions -->
      <div class="mt-4 flex items-center justify-end gap-3">
        <button @click="close" class="rounded-md border px-4 py-2 text-sm">
          Cancel
        </button>
        <button
          @click="onSave"
          class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>
