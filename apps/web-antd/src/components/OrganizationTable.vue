<script lang="ts" setup>
import type { PropType } from 'vue';
import { Table } from 'ant-design-vue';

const ATable = Table;

interface OrgItem {
  id: string;
  parentId?: string;
  code?: string;
  displayName?: string;
  userCount?: number;
}

const props = defineProps({
  items: {
    type: Array as PropType<OrgItem[]>,
    default: () => [],
  },
});

const columns = [
  { title: 'Mã', dataIndex: 'code', key: 'code' },
  { title: 'Tên', dataIndex: 'displayName', key: 'displayName' },
  { title: 'Người dùng', dataIndex: 'userCount', key: 'userCount' },
];
</script>

<template>
  <ATable :columns="columns" :data-source="items" row-key="id" bordered />
</template>
