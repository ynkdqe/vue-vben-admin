<script lang="ts" setup>
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';

import type { IdentityUser } from '#/api/identity';

import { computed, h, onMounted, reactive, ref } from 'vue';

import { SettingOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Grid,
  Input,
  message,
  Row,
  Space,
  Table,
  Tag,
  Menu,
} from 'ant-design-vue';

import { getIdentityUsers } from '#/api/identity';

import { formatDate } from '@vben/utils';

const AButton = Button;
const ACard = Card;
const AForm = Form;
const AFormItem = Form.Item;
const AGrid = Grid;
const ACol = Col;
const ARow = Row;
const AInput = Input;
const ASpace = Space;
const ATable = Table;
const ATag = Tag;
const ADropdown = Dropdown;
const AMenu = Menu;
const AMenuItem = Menu.Item;

interface IdentityUserTableItem extends IdentityUser {
  isActiveText: string;
}

const query = reactive({
  keyword: '',
});

const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
});

const loading = ref(false);
const dataSource = ref<IdentityUserTableItem[]>([]);

const screens = AGrid.useBreakpoint();
const isMobile = computed(() => !screens.value?.md);

const columns: TableColumnsType<IdentityUserTableItem> = [
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
            h(AMenuItem, { key: 'permission' }, () => 'Permission'),
            h(AMenuItem, { key: 'setPassword' }, () => 'Set password'),
            h(AMenuItem, { key: 'lock' }, () => 'Lock'),
            h(AMenuItem, { key: 'loginAs' }, () => 'Log in with this user'),
            h(AMenuItem, { key: 'delete' }, () => 'Delete'),
          ],
        },
      );

      return h(
        ADropdown,
        { overlay: menuVNode, trigger: ['click'] },
        {
          default: () => h(AButton, { icon: h(SettingOutlined) }),
        },
      );
    },
  },
  { title: 'Username', dataIndex: 'userName', key: 'userName' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber' },
  {
    title: 'Active',
    dataIndex: 'isActiveText',
    key: 'isActiveText',
    customRender: ({ record: _record }) => {
      const active = _record.isActive;
      return active
        ? h(ATag, { color: 'green' }, () => 'Active')
        : h(ATag, { color: 'red' }, () => 'Inactive');
    },
    
  },
  {
    title: 'Locked',
    dataIndex: 'lockoutEnabled',
    key: 'lockoutEnabled',
    width: 120,
    customRender: ({ record: _record }) => {
      const locked = _record.lockoutEnabled;
      return locked
        ? h(ATag, { color: 'red' }, () => 'Locked')
        : h(ATag, { color: 'green' }, () => 'Unlocked');
    },
  },
  { title: 'Failed logins', dataIndex: 'accessFailedCount', key: 'accessFailedCount', width: 120,
    customRender: ({ record: _record }) => {
      const locked = _record.lockoutEnabled;
      return locked
        ? h(ATag, { color: 'red' }, () => 'Locked')
        : h(ATag, { color: 'green' }, () => 'Unlocked');
    },
  },
  { title: 'Failed logins', dataIndex: 'accessFailedCount', key: 'accessFailedCount', width: 120, },
  { title: 'Creation Time', dataIndex: 'creationTime', key: 'creationTime',
    customRender: ({ record: _record }) => {
      return h(ATag, { color: 'blue' }, () => formatDate(_record.creationTime,'DD-MM-YYYY HH:mm:ss'));
    },
  },
  { title: 'Last Modification Time', dataIndex: 'lastModificationTime', key: 'lastModificationTime',
    customRender: ({ record: _record }) => {
      return h(ATag, { color: 'blue' }, () => formatDate(_record.lastModificationTime ?? '','DD-MM-YYYY HH:mm:ss'));
    },
  },
];

function handleAction(record: IdentityUserTableItem, key: string) {
  // basic scaffold for handling actions from the settings menu
  switch (key) {
    case 'edit':
      message.info(`Edit ${record.userName}`);
      break;
    case 'permission':
      message.info(`Permission ${record.userName}`);
      break;
    case 'setPassword':
      message.info(`Set password for ${record.userName}`);
      break;
    case 'lock':
      message.info(`Lock ${record.userName}`);
      break;
    case 'loginAs':
      message.info(`Log in as ${record.userName}`);
      break;
    case 'delete':
      message.info(`Delete ${record.userName}`);
      break;
    default:
      message.info(`Action ${key} on ${record.userName}`);
  }
}

async function loadUsers() {
  const current = pagination.current ?? 1;
  const pageSize = pagination.pageSize ?? 10;
  loading.value = true;
  try {
    const { items, totalCount } = await getIdentityUsers({
      filter: query.keyword.trim() || undefined,
      skipCount: (current - 1) * pageSize,
      maxResultCount: pageSize,
    });
    dataSource.value = items.map((item) => ({
      ...item,
      isActiveText: item.isActive ? 'Active' : 'Inactive',
    }));
    pagination.total = totalCount ?? items.length;
  } catch (error: any) {
    message.error(error?.message ?? 'Failed to load users');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.current = 1;
  loadUsers();
}

function handleReset() {
  query.keyword = '';
  pagination.current = 1;
  pagination.pageSize = 10;
  loadUsers();
}

function handleTableChange(pager: TablePaginationConfig) {
  pagination.current = pager.current ?? 1;
  pagination.pageSize = pager.pageSize ?? 10;
  loadUsers();
}

onMounted(() => {
  loadUsers();
});
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
              placeholder="Tìm theo tên, mã, email..."
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
      <ATable
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        bordered
        row-key="id"
        @change="handleTableChange"
      />
    </ACard>
  </div>
</template>
