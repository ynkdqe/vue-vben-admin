<script lang="ts" setup>
import type { PropType, Key } from 'vue';
import { computed } from 'vue';
import { Tree } from 'ant-design-vue';

const ATree = Tree;

interface OrgItem {
  id: string;
  parentId?: string;
  code?: string;
  displayName?: string;
  userCount?: number;
}

interface OrgTreeNode {
  key: Key;
  title: string;
  displayName: string;
  code?: string;
  userCount?: number;
  children?: OrgTreeNode[];
}

const props = defineProps({
  items: {
    type: Array as PropType<OrgItem[]>,
    default: () => [],
  },
});

const treeData = computed<OrgTreeNode[]>(() => {
  if (!props.items || !props.items.length) return [];
  const nodesMap = new Map<string, OrgTreeNode>();
  const roots: OrgTreeNode[] = [];
  props.items.forEach((item) => {
    nodesMap.set(item.id, {
      key: item.id,
      title: item.displayName ?? item.code ?? item.id,
      displayName: item.displayName ?? item.code ?? item.id,
      code: item.code,
      userCount: item.userCount,
      children: [],
    });
  });
  props.items.forEach((item) => {
    const node = nodesMap.get(item.id);
    if (!node) return;
    if (item.parentId && nodesMap.has(item.parentId)) {
      nodesMap.get(item.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  const prune = (list: OrgTreeNode[]) => {
    list.forEach((n) => {
      if (!n.children || n.children.length === 0) delete n.children;
      else prune(n.children);
    });
  };
  prune(roots);
  return roots;
});
</script>

<template>
  <ATree :tree-data="treeData" block-node show-line>
    <template #title="{ dataRef }">
      <div class="flex w-full items-center gap-2">
        <span class="font-medium">{{ dataRef.displayName }}</span>
        <span v-if="dataRef.code" class="text-xs text-gray-500">({{ dataRef.code }})</span>
        <span v-if="typeof dataRef.userCount === 'number'" class="ml-auto text-xs text-gray-500">{{ dataRef.userCount }} thành viên</span>
      </div>
    </template>
  </ATree>
</template>
