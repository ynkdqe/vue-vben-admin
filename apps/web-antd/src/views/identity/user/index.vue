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
} from 'ant-design-vue';

import { getIdentityUsers } from '#/api/identity';

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
    title: 'Action',
    key: 'action',
    width: 140,
    customRender: ({ record: _record }) => {
      const menu = [
        { key: 'edit', label: 'Edit' },
        { key: 'permission', label: 'Permission' },
        { key: 'setPassword', label: 'Set password' },
        { key: 'lock', label: 'Lock' },
        { key: 'loginAs', label: 'Log in with this user' },
        { key: 'delete', label: 'Delete' },
      ];
      return h(
        ADropdown,
        { menu: { items: menu }, trigger: ['click'] },
        {
          default: () => h(AButton, { icon: h(SettingOutlined) }),
        },
      );
    },
  },
];

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
        <ARow :gutter="16">
          <ACol :xs="24" :md="12">
            <AFormItem label="Keyword" name="keyword">
              <AInput
                v-model:value="query.keyword"
                allow-clear
                placeholder="Search by keyword"
                @press-enter="handleSearch"
              />
            </AFormItem>
          </ACol>
          <ACol
            :xs="24"
            :md="12"
            class="flex items-end justify-start md:justify-end"
          >
            <ASpace>
              <AButton type="primary" @click="handleSearch">Search</AButton>
              <AButton @click="handleReset">Reset</AButton>
            </ASpace>
          </ACol>
        </ARow>
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
