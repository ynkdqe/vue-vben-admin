<script lang="ts" setup>
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';

import { computed, h, onMounted, reactive, ref } from 'vue';

import { SettingOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Input,
  Grid,
  Row,
  Space,
  Table,
  Tag,
  Menu,
} from 'ant-design-vue';

import { requestClient } from '#/api/request';
import { formatDate } from '@vben/utils';

const AButton = Button;
const ACard = Card;
const AForm = Form;
const AFormItem = Form.Item;
const AGrid = Grid;
const ACol = Col;
const ARow = Row;
const ASpace = Space;
const ATable = Table;
const ATag = Tag;
const ADropdown = Dropdown;
const AMenu = Menu;
const AMenuItem = Menu.Item;
const AInput = Input;

interface RoleItem {
  id: string;
  name: string;
  isDefault?: boolean;
  isStatic?: boolean;
  isPublic?: boolean;
  creationTime: number | string;
}

const query = reactive({ keyword: '' });

const pagination = reactive<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });
const loading = ref(false);
const dataSource = ref<RoleItem[]>([]);
const screens = AGrid.useBreakpoint();
const isMobile = computed(() => !screens.value?.md);

const columns: TableColumnsType<RoleItem> = [
  {
    title: 'Action',
    key: 'action',
    width: 140,
    customRender: ({ record: _record }) => {
      const menuVNode = h(
        AMenu,
        {
          onClick: (info: any) => handleAction(_record, info.key),
        },
        {
          default: () => [
            h(AMenuItem, { key: 'edit' }, () => 'Edit'),
            h(AMenuItem, { key: 'delete' }, () => 'Delete'),
            h(AMenuItem, { key: 'permission' }, () => 'Permissions'),
            h(AMenuItem, { key: 'moveAllUsers' }, () => 'Move All Users'),

          ],
        },
      );

      return h(ADropdown, { overlay: menuVNode, trigger: ['click'] }, { default: () => h(AButton, { icon: h(SettingOutlined) }) });
    },
  },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Default', dataIndex: 'isDefault', key: 'isDefault', customRender: ({ record }) => record.isDefault ? h(ATag, { color: 'green' }, () => 'Yes') : h(ATag, { color: 'default' }, () => 'No') },
  { title: 'Static', dataIndex: 'isStatic', key: 'isStatic' },
  { title: 'Public', dataIndex: 'isPublic', key: 'isPublic' },
  { title: 'Creation Time', dataIndex: 'creationTime', key: 'creationTime',
    customRender: ({ record: _record }) => {
      return h(ATag, { color: 'blue' }, () => formatDate(_record.creationTime,'DD-MM-YYYY HH:mm:ss'));
    },
  },
];

function handleAction(record: RoleItem, key: string) {
  // placeholder
  // eslint-disable-next-line no-console
  console.log('role action', key, record);
}

async function loadRoles() {
  loading.value = true;
  try {
    const res = await requestClient.get<any>('/api/identity/roles', { responseReturn: 'body' });
    const items = res?.items ?? res ?? [];
    dataSource.value = items.map((i: any) => ({
      id: i.id,
      name: i.name,
      isDefault: i.isDefault,
      isStatic: i.isStatic,
      isPublic: i.isPublic,
      creationTime: i.creationTime,
    }));
    pagination.total = res?.totalCount ?? dataSource.value.length;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadRoles();
});

function handleSearch() {
  // for now just reload roles; in future we can send a query param
  pagination.current = 1;
  loadRoles();
}

function handleReset() {
  query.keyword = '';
  pagination.current = 1;
  pagination.pageSize = 10;
  loadRoles();
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
              placeholder="Tìm theo tên"
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
          </ASpace>
        </AFormItem>
      </AForm>
    </ACard>

    <ACard class="shadow-sm">
      <ATable :columns="columns" :data-source="dataSource" :loading="loading" row-key="id" />
    </ACard>
  </div>
</template>

<style scoped>
.grid { width: 100%; }
</style>

