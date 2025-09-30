<script lang="ts" setup>
import { h,onMounted, reactive, ref, watch } from 'vue';
import { message, Form as AForm, Input as AInput, Select as ASelect, Table as ATable, Space as ASpace, Button as AButton,Tag as ATag } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';
import { fetchEmployeeList, type Employee, type EmployeeListResult } from '#/api/core';
import dayjs from 'dayjs';

// Search form state
const query = reactive({
  keyword: '',
  status: undefined as undefined | string | number,
  page: 1,
  pageSize: 10,
});

// Table state
const loading = ref(false);
const dataSource = ref<Employee[]>([]);
const total = ref(0);
function formatDMY(val?: string | number | Date | null) {
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
  { title: 'Mã NV', dataIndex: 'employeeCode', key: 'employeeCode', width: 100 },
  { title: 'Tên', dataIndex: 'name', key: 'name', width: 160 },
  { title: 'Điện thoại', dataIndex: 'phone', key: 'phone', width: 140 },
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
  { title: 'Địa chỉ', dataIndex: 'address', key: 'address', width: 220 },
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
    total.value = res.total || res.items.length;
  } catch (err: any) {
    message.error(err?.message || 'Failed to load employees');
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

onMounted(loadData);

watch(
  () => [query.page, query.pageSize],
  () => {
    loadData();
  },
);

// expose sub components for template usage
const AFormItem = AForm.Item;
const ASelectOption = ASelect.Option;
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="bg-card rounded-md p-4 shadow-sm">
      <AForm layout="inline" @submit.prevent>
        <AFormItem label="Từ khóa">
          <AInput
            v-model:value="query.keyword"
            placeholder="Tìm theo tên, mã, email..."
            allow-clear
            style="min-width: 260px"
            @pressEnter="handleSearch"
          />
        </AFormItem>

        <AFormItem label="Trạng thái">
          <ASelect
            v-model:value="query.status"
            allow-clear
            placeholder="Tất cả"
            style="width: 180px"
          >
            <ASelectOption value="Đang làm">Đang làm</ASelectOption>
            <ASelectOption value="Nghỉ việc">Nghỉ việc</ASelectOption>
            <ASelectOption value="Nghỉ phép năm">Nghỉ phép năm</ASelectOption>
            <ASelectOption value="Nghỉ sinh con khối BO">Nghỉ sinh con khối BO</ASelectOption>
            <ASelectOption value="Nghỉ ốm">Nghỉ ốm</ASelectOption>
            <ASelectOption value="Nghỉ không lương">Nghỉ không lương</ASelectOption>
            <ASelectOption value="Nghỉ chăm con">Nghỉ chăm con</ASelectOption>
            <ASelectOption value="Nghỉ sinh con khối Shop">Nghỉ sinh con khối Shop</ASelectOption>
            <ASelectOption value="Tạm khóa user">Tạm khóa user</ASelectOption>
            <ASelectOption value="Luân chuyển nội bộ FRT">Luân chuyển nội bộ FRT</ASelectOption>
          </ASelect>
        </AFormItem>

        <AFormItem>
          <ASpace>
            <AButton type="primary" @click="handleSearch">Tìm kiếm</AButton>
            <AButton @click="handleReset">Làm mới</AButton>
          </ASpace>
        </AFormItem>
      </AForm>
    </div>

    <div class="bg-card rounded-md p-2 shadow-sm">
      <ATable
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="{
          current: query.page,
          pageSize: query.pageSize,
          total: total,
          showSizeChanger: true,
        }"
        row-key="id"
        @change="(pagination) => {
          query.page = pagination.current!;
          query.pageSize = pagination.pageSize!;
        }"
        :scroll="{ x: 1400 }"
      />
    </div>
  </div>
  
</template>

<style scoped>
.bg-card {
  background-color: var(--card-bg, #fff);
}
</style>
