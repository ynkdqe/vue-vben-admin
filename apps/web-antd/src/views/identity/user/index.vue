<script lang="ts" setup>
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';

import type { IdentityUser } from '#/api/identity';

import { computed, h, onMounted, reactive, ref } from 'vue';

import { formatDate } from '@vben/utils';

import { SettingOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Dropdown,
  Form,
  Grid,
  Input,
  Menu,
  message,
  Space,
  Table,
  Drawer,
  Tabs,
  Checkbox,
  Divider,
  Select,
  Tag,
} from 'ant-design-vue';

import { getIdentityUsers } from '#/api/identity';

import Permission from '../../../components/Permission.vue';

const AButton = Button;
const ACard = Card;
const AForm = Form;
const AFormItem = Form.Item;
const AGrid = Grid;
const AInput = Input;
const ASpace = Space;
const ATable = Table;
const ATag = Tag;
const ADropdown = Dropdown;
const AMenu = Menu;
const AMenuItem = Menu.Item;
const ADrawer = Drawer;
const ATabs = Tabs;
const ACheckbox = Checkbox;
const ADivider = Divider;
const ASelect = Select;

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

// permission popup state
const showPermission = ref(false);
const permissionProviderName = ref('');
const permissionProviderKey = ref('');
const permissionTitle = ref('');

// edit drawer state
const showEditDrawer = ref(false);
const editingUser = ref<IdentityUser | null>(null);
const editingSurname = ref('');

function openEditDrawer(user: IdentityUser) {
  editingUser.value = { ...user };
  // no surname field on the API; keep a local surname for the UI
  editingSurname.value = '';
  showEditDrawer.value = true;
}

function closeEditDrawer() {
  showEditDrawer.value = false;
  editingUser.value = null;
  editingSurname.value = '';
}

function saveUserEdits() {
  // placeholder: call API to save edits. For now, just show a message and close.
  message.success(`Saved changes for ${editingUser.value?.userName}`);
  // you may want to merge editingSurname into the payload if backend supports it
  closeEditDrawer();
}

function onPermissionSave(payload: { granted: string[] }) {
  // placeholder: you can call API to persist granted permissions here
  message.success(`Saved ${payload.granted.length} permissions`);
}

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
  {
    title: 'Failed logins',
    dataIndex: 'accessFailedCount',
    key: 'accessFailedCount',
    width: 120,
    customRender: ({ record: _record }) => {
      const locked = _record.lockoutEnabled;
      return locked
        ? h(ATag, { color: 'red' }, () => 'Locked')
        : h(ATag, { color: 'green' }, () => 'Unlocked');
    },
  },
  {
    title: 'Failed logins',
    dataIndex: 'accessFailedCount',
    key: 'accessFailedCount',
    width: 120,
  },
  {
    title: 'Creation Time',
    dataIndex: 'creationTime',
    key: 'creationTime',
    customRender: ({ record: _record }) => {
      return h(ATag, { color: 'blue' }, () =>
        formatDate(_record.creationTime, 'DD-MM-YYYY HH:mm:ss'),
      );
    },
  },
  {
    title: 'Last Modification Time',
    dataIndex: 'lastModificationTime',
    key: 'lastModificationTime',
    customRender: ({ record: _record }) => {
      return h(ATag, { color: 'blue' }, () =>
        formatDate(_record.lastModificationTime ?? '', 'DD-MM-YYYY HH:mm:ss'),
      );
    },
  },
];

function handleAction(record: IdentityUserTableItem, key: string) {
  // basic scaffold for handling actions from the settings menu
  switch (key) {
    case 'delete': {
      message.info(`Delete ${record.userName}`);
      break;
    }
    case 'edit': {
      // open edit drawer with tabs (User Information, Roles, Organization units)
      openEditDrawer(record as IdentityUser);
      break;
    }
    case 'lock': {
      message.info(`Lock ${record.userName}`);
      break;
    }
    case 'loginAs': {
      message.info(`Log in as ${record.userName}`);
      break;
    }
    case 'permission': {
      // open permission modal for this user
      // providerName = 'U', providerKey = record.id
      permissionProviderName.value = 'U';
      permissionProviderKey.value = (record.id as string) || String(record.id);
      permissionTitle.value = `Permissions - ${record.userName}`;
      showPermission.value = true;
      break;
    }
    case 'setPassword': {
      message.info(`Set password for ${record.userName}`);
      break;
    }
    default: {
      message.info(`Action ${key} on ${record.userName}`);
    }
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
    <Permission
      v-model="showPermission"
      :provider-name="permissionProviderName"
      :provider-key="permissionProviderKey"
      :title="permissionTitle"
      @save="onPermissionSave"
    />
    <ADrawer v-model:open="showEditDrawer" width="720px" :title="editingUser?.userName ? 'Edit - ' + editingUser.userName : 'Edit'">
      <ATabs defaultActiveKey="1">
        <ATabs.TabPane key="1" tab="User Information">
          <div class="space-y-4 p-4">
            <AForm layout="vertical" :model="editingUser">
              <AForm.Item label="User name *">
                <AInput v-model:value="editingUser.userName" />
              </AForm.Item>

              <div class="grid grid-cols-2 gap-4">
                <AForm.Item label="Name">
                  <AInput v-model:value="editingUser.name" />
                </AForm.Item>
                <AForm.Item label="Surname">
                  <AInput v-model:value="editingSurname" />
                </AForm.Item>
              </div>

              <AForm.Item label="Email address *">
                <AInput v-model:value="editingUser.email" />
              </AForm.Item>

              <AForm.Item label="Phone number">
                <AInput v-model:value="editingUser.phoneNumber" />
              </AForm.Item>

              <div class="flex items-center gap-6">
                <ACheckbox v-model:checked="editingUser.isActive">Active</ACheckbox>
                <ACheckbox v-model:checked="editingUser.lockoutEnabled">Account lockout</ACheckbox>
              </div>

              <div class="flex items-center gap-6 mt-2">
                <ACheckbox> Email confirmed </ACheckbox>
                <ACheckbox> Phone number confirmed </ACheckbox>
              </div>

              <div class="mt-2">
                <ACheckbox> Force password change </ACheckbox>
              </div>
            </AForm>
          </div>
        </ATabs.TabPane>

        <ATabs.TabPane key="2" tab="Roles (1)">
          <div class="p-4">
            <!-- roles list placeholder: should load roles for user -->
            <p>Roles for user will appear here.</p>
          </div>
        </ATabs.TabPane>

        <ATabs.TabPane key="3" tab="Organization units (1)">
          <div class="p-4">
            <!-- organization units placeholder: should load org units for user -->
            <p>Organization units for user will appear here.</p>
          </div>
        </ATabs.TabPane>
      </ATabs>

      <template #footer>
        <div class="flex justify-end gap-3">
          <AButton @click="closeEditDrawer">Cancel</AButton>
          <AButton type="primary" @click="saveUserEdits">Save</AButton>
        </div>
      </template>
    </ADrawer>
  </div>
</template>
