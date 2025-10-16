<script lang="ts" setup>
import type { TableColumnsType } from 'ant-design-vue';

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
  Menu,
} from 'ant-design-vue';

import { requestClient } from '#/api/request';

const AButton = Button;
const ACard = Card;
const AForm = Form;
const AFormItem = Form.Item;
const AGrid = Grid;
const ACol = Col;
const ARow = Row;
const ASpace = Space;
const ATable = Table;
const ADropdown = Dropdown;
const AMenu = Menu;
const AMenuItem = Menu.Item;
const AInput = Input;

interface OrgItem {
  id: string;
  parentId?: string;
  code?: string;
  displayName?: string;
  userCount?: number;
}

const query = reactive({ keyword: '' });
const loading = ref(false);
const dataSource = ref<OrgItem[]>([]);
const screens = AGrid.useBreakpoint();
const isMobile = computed(() => !screens.value?.md);

const columns: TableColumnsType<OrgItem> = [
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
          ],
        },
      );

      return h(ADropdown, { overlay: menuVNode, trigger: ['click'] }, { default: () => h(AButton, { icon: h(SettingOutlined) }) });
    },
  },
  { title: 'Code', dataIndex: 'code', key: 'code' },
  { title: 'Name', dataIndex: 'displayName', key: 'displayName' },
  { title: 'Parent', dataIndex: 'parentId', key: 'parentId' },
  { title: 'User count', dataIndex: 'userCount', key: 'userCount' },
];

function handleAction(record: OrgItem, key: string) {
  // placeholder
  // eslint-disable-next-line no-console
  console.log('org action', key, record);
}

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
  // placeholder: re-load list, can be expanded to send query
  loadOrgs();
}

function handleReset() {
  query.keyword = '';
  loadOrgs();
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

