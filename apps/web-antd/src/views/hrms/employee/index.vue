<script lang="ts" setup>
import type { TableColumnsType } from 'ant-design-vue';

import type { Employee, EmployeeListResult } from '#/api/core';

import { computed, h, onMounted, reactive, ref, watch } from 'vue';

import {
  Button,
  Form,
  Grid,
  Input,
  message,
  Select,
  Space,
  Table,
  Tag,
  Modal,
} from 'ant-design-vue';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';

import { fetchEmployeeList } from '#/api/core';

import EmployeeForm from './components/EmployeeForm.vue';

// Component aliases for template usage
const AButton = Button;
const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
const ASelect = Select;
const ASelectOption = Select.Option;
const ASpace = Space;
const ATable = Table;
const ATag = Tag;
const AModal = Modal;

// Responsive breakpoint
const screens = Grid.useBreakpoint();
const isMobile = computed(() => !screens.value?.md);

// Search form state
const query = reactive({
  keyword: '',
  status: undefined as number | string | undefined,
  page: 1,
  pageSize: 10,
});

// Table state
const loading = ref(false);
const dataSource = ref<Employee[]>([]);
const total = ref(0);
function formatDMY(val?: Date | null | number | string) {
  if (!val) return '';
  const d = dayjs(val);
  return d.isValid() ? d.format('DD-MM-YYYY') : '';
}
const STATUS_COLOR_MAP: Record<string, string> = {
  'Đang làm': 'green',
  'Nghỉ việc': 'volcano',
  'Thử việc': 'blue',
  'Nghỉ phép năm': 'gold',
  'Nghỉ sinh con khối BO': 'magenta',
  'Nghỉ ốm': 'orange',
  'Nghỉ không lương': 'default',
  'Nghỉ chăm con': 'purple',
  'Nghỉ sinh con khối Shop': 'magenta',
  'Tạm khóa user': 'red',
  'Luân chuyển nội bộ FRT': 'cyan',
};

function renderStatusTag(val?: string) {
  const text = (val ?? '').toString().trim();
  const color = STATUS_COLOR_MAP[text] ?? 'default';
  return h(ATag, { color }, () => text || '-');
}

const columns: TableColumnsType = [
  { title: '#', dataIndex: 'id', key: 'id', width: 80, fixed: 'left' },
  { title: 'UserName', dataIndex: 'userName', key: 'username', width: 100 },
  {
    title: 'Mã NV',
    dataIndex: 'employeeCode',
    key: 'employeeCode',
    width: 100,
  },
  { title: 'Tên', dataIndex: 'name', key: 'name', width: 200 },
  { title: 'Điện thoại', dataIndex: 'phone', key: 'phone', width: 120 },
  { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    width: 160,
    customRender: ({ text }) => renderStatusTag(text as string),
  },
  {
    title: 'Ngày sinh',
    dataIndex: 'birthDate',
    key: 'birthDate',
    width: 140,
    customRender: ({ text }) => formatDMY(text),
  },
  {
    title: 'Ngày vào làm',
    dataIndex: 'enrollDate',
    key: 'joinDate',
    width: 140,
    customRender: ({ text }) => formatDMY(text),
  },
  {
    title: 'Ngày nghỉ việc',
    dataIndex: 'resignationDate',
    key: 'leaveDate',
    width: 140,
    customRender: ({ text }) => formatDMY(text),
  },
  {
    title: 'Địa chỉ',
    dataIndex: 'address',
    key: 'address',
    width: 220,
    ellipsis: true,
    customRender: ({ text }) => text || '-',
  },
   {
    title: 'Action',
    key: 'action',
    width: 120,
    align: 'center',
    fixed: 'right',
    customRender: ({ record }: any) => {
      return h('div', { style: { width: '100%', textAlign: 'center' } }, [
        h(ASpace, null, {
          default: () => [
            h(
              AButton,
              {
                type: 'text',
                onClick: () => message.info(`Edit ${record?.name || record?.userName}`),
                title: 'Sửa',
              },
              { default: () => h(EditOutlined, { style: { color: '#1677ff' } }) },
            ),
            h(
              AButton,
              {
                type: 'text',
                onClick: () => message.info(`Delete ${record?.name || record?.userName}`),
                title: 'Xóa',
              },
              { default: () => h(DeleteOutlined, { style: { color: '#ff4d4f' } }) },
            ),
          ],
        }),
      ]);
    },
  },
];

async function loadData() {
  loading.value = true;
  try {
    const res: EmployeeListResult = await fetchEmployeeList({
      keyword: query.keyword?.trim() || undefined,
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });
    dataSource.value = res.items || [];
    total.value = res.total;
  } catch (error: any) {
    message.error(error?.message || 'Failed to load employees');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  loadData();
}

function handleReset() {
  query.keyword = '';
  query.status = undefined;
  query.page = 1;
  query.pageSize = 10;
  loadData();
}

// Drawer state
const drawerVisible = ref(false);
const drawerLoading = ref(false);

// Drawer handlers
function showAddDrawer() {
  drawerVisible.value = true;
}

function handleFormSubmit(_formData: any) {
  drawerLoading.value = true;

  // TODO: Call API to create employee
  // await createEmployee(_formData);

  // Simulate API call
  setTimeout(() => {
    message.success('Thêm nhân viên thành công');
    drawerVisible.value = false;
    drawerLoading.value = false;
    loadData(); // Reload the table
  }, 1000);
}

onMounted(loadData);

watch(
  () => [query.page, query.pageSize],
  () => {
    loadData();
  },
);
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="search-card rounded-md p-4 shadow-sm">
      <AForm
        class="search-form"
        :layout="isMobile ? 'vertical' : 'inline'"
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

        <AFormItem label="Trạng thái" :style="isMobile ? { width: '100%' } : {}">
          <ASelect
            v-model:value="query.status"
            allow-clear
            placeholder="Tất cả"
            :style="isMobile ? { width: '100%' } : { width: '180px' }"
          >
            <ASelectOption value="Đang làm">Đang làm</ASelectOption>
            <ASelectOption value="Nghỉ việc">Nghỉ việc</ASelectOption>
            <ASelectOption value="Nghỉ phép năm">Nghỉ phép năm</ASelectOption>
            <ASelectOption value="Nghỉ sinh con khối BO">
              Nghỉ sinh con khối BO
            </ASelectOption>
            <ASelectOption value="Nghỉ ốm">Nghỉ ốm</ASelectOption>
            <ASelectOption value="Nghỉ không lương">
              Nghỉ không lương
            </ASelectOption>
            <ASelectOption value="Nghỉ chăm con">Nghỉ chăm con</ASelectOption>
            <ASelectOption value="Nghỉ sinh con khối Shop">
              Nghỉ sinh con khối Shop
            </ASelectOption>
            <ASelectOption value="Tạm khóa user">Tạm khóa user</ASelectOption>
            <ASelectOption value="Luân chuyển nội bộ FRT">
              Luân chuyển nội bộ FRT
            </ASelectOption>
          </ASelect>
        </AFormItem>

        <AFormItem :style="isMobile ? { width: '100%' } : {}">
          <ASpace :wrap="true" :style="isMobile ? { width: '100%' } : {}">
            <AButton :block="isMobile" type="primary" @click="handleSearch">
              Tìm kiếm
            </AButton>
            <AButton :block="isMobile" @click="handleReset">Làm mới</AButton>
            <AButton :block="isMobile" type="primary" ghost @click="showAddDrawer">
              Thêm mới
            </AButton>
          </ASpace>
        </AFormItem>
      </AForm>
    </div>

    <div class="table-container">
      <ATable
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="{
          current: query.page,
          pageSize: query.pageSize,
          total,
          showSizeChanger: true,
        }"
        row-key="id"
        @change="
          (pagination) => {
            query.page = pagination.current!;
            query.pageSize = pagination.pageSize!;
          }
        "
        :scroll="{ x: 1400 }"
      />
    </div>

    <!-- Employee Form Component -->
    <EmployeeForm
      v-model:visible="drawerVisible"
      :loading="drawerLoading"
      @submit="handleFormSubmit"
    />
  </div>
</template>
