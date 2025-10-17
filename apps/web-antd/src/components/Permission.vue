<script lang="ts" setup>
import { computed, defineEmits, defineProps, ref, watch } from 'vue';

import { Button, Checkbox, Drawer, Input, message } from 'ant-design-vue';

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

const ADrawer = Drawer;
const AButton = Button;
const AInput = Input;
const ACheckbox = Checkbox;

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

const groupAllChecked = computed({
  get: () =>
    currentPermissions.value.length > 0 &&
    currentPermissions.value.every((p) => checked.value[p.name]),
  set: (v: boolean) => {
    toggleSelectAllInGroup(selectedGroup.value, v);
  },
});

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

// group select all handled by computed 'groupAllChecked'

watch(
  () => grantAll.value,
  (v) => {
    toggleGrantAll(v);
  },
);

function toggleGrantAll(v: boolean) {
  grantAll.value = v;
  Object.keys(checked.value).forEach((k) => (checked.value[k] = v));
}
</script>

<template>
  <ADrawer
    v-model:open="visible"
    :title="props.title || 'Permissions'"
    placement="left"
    width="600px"
    :closable="true"
  >
    <!-- Search and grant -->
    <div class="mt-4 flex items-center gap-4">
      <div class="flex flex-1 items-center gap-2 rounded-lg py-2">
        <AInput
          v-model:value="filter"
          placeholder="Filter"
          class="flex-1 bg-transparent"
        />
      </div>
      <label class="flex items-center gap-2 text-sm text-gray-600">
        <ACheckbox v-model:checked="grantAll" />
        Grant all permissions
      </label>
    </div>
    <!-- Content -->
    <div class="mt-4 rounded-lg border p-4">
      <div class="flex">
        <!-- Left group list -->
        <div class="w-56 pr-4">
          <div class="overflow-auto pr-2">
            <div class="space-y-2">
              <AButton
                v-for="g in groups"
                :key="g.name"
                @click="selectedGroup = g.name"
                class="w-full rounded-md border text-left"
                :class="
                  selectedGroup === g.name ? 'bg-indigo-500 text-white' : ''
                "
              >
                {{ g.displayName }}
              </AButton>
            </div>
          </div>
        </div>

        <!-- Right permission list -->
        <div class="flex-1 pl-6">
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm">
              <ACheckbox v-model:checked="groupAllChecked" />
              Select all
            </label>
          </div>

          <div class="mt-4 overflow-auto">
            <div
              v-for="perm in currentPermissions"
              :key="perm.name"
              class="flex items-center gap-3 py-2"
              :class="perm.parentName ? 'pl-4' : ''"
            >
              <label class="flex items-center gap-2">
                <ACheckbox v-model:checked="checked[perm.name]" />
                <span
                  class="font-medium"
                  :class="perm.parentName ? 'font-light' : 'font-bold'"
                >
                  {{ perm.displayName }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-4">
        <AButton @click="close">Cancel</AButton>
        <AButton type="primary" @click="onSave">Save</AButton>
      </div>
    </template>
  </ADrawer>
</template>
