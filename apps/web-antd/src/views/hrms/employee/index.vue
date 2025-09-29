<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { message, Form as AForm, Input as AInput, Select as ASelect, Table as ATable, Space as ASpace, Button as AButton } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';
import { fetchEmployeeList, type Employee, type EmployeeListResult } from '#/api/core';

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

const columns: TableColumnsType = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 100, fixed: 'left' },
  { title: 'Username', dataIndex: 'username', key: 'username', width: 140 },
  { title: 'Mã NV', dataIndex: 'employeeCode', key: 'employeeCode', width: 120 },
  { title: 'Tên', dataIndex: 'name', key: 'name', width: 160 },
  { title: 'Điện thoại', dataIndex: 'phone', key: 'phone', width: 140 },
  { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120 },
  { title: 'Ngày sinh', dataIndex: 'dateOfBirth', key: 'dateOfBirth', width: 140 },
  { title: 'Ngày vào làm', dataIndex: 'joinDate', key: 'joinDate', width: 140 },
  { title: 'Ngày nghỉ việc', dataIndex: 'leaveDate', key: 'leaveDate', width: 140 },
  { title: 'Địa chỉ', dataIndex: 'address', key: 'address', width: 220 },
];

function normalizeRow(row: any): Employee {
  // Map common backend aliases to our preferred keys
  return {
    ...row,
    employeeCode: row.employeeCode ?? row.code ?? row.staffCode ?? row.empCode,
    name: row.name ?? row.fullName ?? row.displayName,
    phone: row.phone ?? row.phoneNumber,
    dateOfBirth: row.dateOfBirth ?? row.dob ?? row.birthDate,
    joinDate: row.joinDate ?? row.hireDate ?? row.startDate,
    leaveDate: row.leaveDate ?? row.resignationDate ?? null,
  } as Employee;
}

async function loadData() {
  loading.value = true;
  try {
    const res: EmployeeListResult = await fetchEmployeeList({
      keyword: query.keyword?.trim() || undefined,
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });
    dataSource.value = (res.items || []).map(normalizeRow);
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
            <ASelectOption value="active">Đang làm</ASelectOption>
            <ASelectOption value="inactive">Nghỉ việc</ASelectOption>
            <ASelectOption value="probation">Thử việc</ASelectOption>
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
