<script lang="ts" setup>
import type { Key } from 'ant-design-vue/es/_util/type';

import { computed, onMounted, reactive, ref, watch } from 'vue';

import { Button, Card, Form, Input, Grid, Space, Tree, Spin, Switch } from 'ant-design-vue';
import OrganizationTable from '#/components/OrganizationTable.vue';
import OrganizationTree from '#/components/OrganizationTree.vue';

import { requestClient } from '#/api/request';

const AButton = Button;
const ACard = Card;
const AForm = Form;
const AFormItem = Form.Item;
const AGrid = Grid;
const ASpace = Space;
const AInput = Input;
const ATree = Tree;
const ASpin = Spin;
const ASwitch = Switch;

interface OrgItem {
  id: string;
  parentId?: string;
  code?: string;
  displayName?: string;
  userCount?: number;
}

const query = reactive({ keyword: '' });
const keywordFilter = ref('');
const loading = ref(false);
const dataSource = ref<OrgItem[]>([]);
const screens = AGrid.useBreakpoint();
const isMobile = computed(() => !screens.value?.md);

interface OrgTreeNode {
  key: Key;
  title: string;
  displayName: string;
  code?: string;
  userCount?: number;
  children?: OrgTreeNode[];
}

const expandedKeys = ref<Key[]>([]);
const autoExpandParent = ref(true);

const treeData = computed<OrgTreeNode[]>(() => {
  if (!dataSource.value.length) {
    return [];
  }

  const nodesMap = new Map<string, OrgTreeNode>();
  const roots: OrgTreeNode[] = [];

  dataSource.value.forEach((item) => {
    nodesMap.set(item.id, {
      key: item.id,
      title: item.displayName ?? item.code ?? item.id,
      displayName: item.displayName ?? item.code ?? item.id,
      code: item.code,
      userCount: item.userCount,
      children: [],
    });
  });

  dataSource.value.forEach((item) => {
    const node = nodesMap.get(item.id);
    if (!node) return;
    if (item.parentId && nodesMap.has(item.parentId)) {
      nodesMap.get(item.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  const pruneEmptyChildren = (list: OrgTreeNode[]) => {
    list.forEach((node) => {
      if (node.children && node.children.length > 0) {
        pruneEmptyChildren(node.children);
      } else {
        delete node.children;
      }
    });
  };

  pruneEmptyChildren(roots);

  return roots;
});

const filteredTreeData = computed<OrgTreeNode[]>(() => {
  const keyword = keywordFilter.value.trim().toLowerCase();
  if (!keyword) {
    return treeData.value;
  }

  const filterNodes = (nodes: OrgTreeNode[]): OrgTreeNode[] => {
    const result: OrgTreeNode[] = [];
    nodes.forEach((node) => {
      const matchesSelf =
        node.displayName.toLowerCase().includes(keyword) ||
        (node.code ? node.code.toLowerCase().includes(keyword) : false);
      const children = node.children ? filterNodes(node.children) : [];
      if (matchesSelf || children.length) {
        result.push({
          ...node,
          children: children.length ? children : undefined,
        });
      }
    });
    return result;
  };

  return filterNodes(treeData.value);
});

// display mode: 'tree' | 'table'
const displayMode = ref<'tree' | 'table'>('tree');

// boolean binding for the Switch control
const isTree = computed<boolean>({
  get: () => displayMode.value === 'tree',
  set: (v: boolean) => {
    displayMode.value = v ? 'tree' : 'table';
  },
});

function collectKeys(list: OrgTreeNode[]): Key[] {
  const keys: Key[] = [];
  const stack = [...list];
  while (stack.length) {
    const node = stack.shift();
    if (!node) continue;
    keys.push(node.key);
    if (node.children?.length) {
      stack.push(...node.children);
    }
  }
  return Array.from(new Set(keys));
}

function handleExpand(keys: Key[]) {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
}

watch(
  treeData,
  (nodes) => {
    if (!nodes.length) {
      expandedKeys.value = [];
      return;
    }
    expandedKeys.value = collectKeys(nodes);
  },
  { immediate: true },
);

async function loadOrgs() {
  loading.value = true;
  try {
    const res = await requestClient.get<any>('/api/identity/organization-unit', { responseReturn: 'body' });
    const items = res?.data ?? res ?? [];
    dataSource.value = items.map((i: any) => ({
      id: i.id,
      parentId: i.parentId,
      code: i.code,
      displayName: i.displayName,
      userCount: i.userCount,
    }));
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadOrgs();
});

function handleSearch() {
  keywordFilter.value = query.keyword;
  autoExpandParent.value = true;
  expandedKeys.value = collectKeys(filteredTreeData.value);
}

function handleReset() {
  query.keyword = '';
  keywordFilter.value = '';
  autoExpandParent.value = true;
  expandedKeys.value = collectKeys(treeData.value);
}
</script>

<template>
  <div class="space-y-4 p-4">
    <ACard class="shadow-sm">
      <AForm
        :layout="isMobile ? 'vertical' : 'inline'"
        :model="query"
        class="space-y-2 md:space-y-0"
        @submit.prevent
      >
        <AFormItem label="Từ khóa" :style="isMobile ? { width: '100%' } : {}">
          <AInput
            v-model:value="query.keyword"
            placeholder="Tìm theo tên, mã..."
            allow-clear
            :style="isMobile ? { width: '100%' } : { minWidth: '260px' }"
            @press-enter="handleSearch"
          />
        </AFormItem>
        <AFormItem :style="isMobile ? { width: '100%' } : {}">
          <ASpace :wrap="true" :style="isMobile ? { width: '100%' } : {}">
            <AButton :block="isMobile" type="primary" @click="handleSearch">
              Tìm kiếm
            </AButton>
            <AButton :block="isMobile" @click="handleReset">
              Đặt lại
            </AButton>
            <div class="flex items-center ml-2">
              <span class="mr-2">Hiển thị</span>
              <ASwitch
                v-model:checked="isTree"
                :checked-children="'Tree'"
                :un-checked-children="'Table'"
              />
            </div>
          </ASpace>
        </AFormItem>
      </AForm>
    </ACard>

    <ACard class="shadow-sm">
      <ASpin :spinning="loading">
        <template v-if="displayMode === 'tree'">
          <OrganizationTree :items="dataSource" />
        </template>
        <template v-else>
          <OrganizationTable :items="dataSource" />
        </template>
      </ASpin>
    </ACard>
  </div>
</template>

<style scoped>
.grid { width: 100%; }
</style>

