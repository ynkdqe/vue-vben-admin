<script lang="ts" setup>
import type { TablePaginationConfig } from 'ant-design-vue';

import type { ContractTypeDto } from '#/api/hrms/contract-type';

import { h, onMounted, reactive, ref } from 'vue';

import {
  Button,
  Drawer,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  createContractType,
  fetchContractTypeList,
} from '#/api/hrms/contract-type';
import { requestClient } from '#/api/request';

import ContractTypeForm from './components/ContractTypeForm.vue';

const AButton = Button;
const ADrawer = Drawer;
const ATable = Table;
const ASpace = Space;
const APopconfirm = Popconfirm;
const ATag = Tag;

const query = reactive({ current: 1, pageSize: 10, keyword: '' });
const loading = ref(false);
const dataSource = ref<ContractTypeDto[]>([]);
const total = ref(0);
const showCreate = ref(false);
const editModel = ref<null | Record<string, any>>(null);

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchContractTypeList({
      current: query.current,
      pageSize: query.pageSize,
      keyword: query.keyword,
    });
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onTableChange(pagination: TablePaginationConfig) {
  query.current = Number(pagination.current || 1);
  query.pageSize = Number(pagination.pageSize || 10);
  loadData();
}

function onCreateOpen() {
  editModel.value = null;
  showCreate.value = true;
}
function onCancel() {
  showCreate.value = false;
}

async function onSubmit(payload: Record<string, any>) {
  loading.value = true;
  try {
    await createContractType(payload);
    message.success('Tạo loại hợp đồng thành công');
    showCreate.value = false;
    await loadData();
  } catch {
    message.error('Tạo loại hợp đồng thất bại');
  } finally {
    loading.value = false;
  }
}

async function onDelete(id: number | string | undefined) {
  if (!id) return;
  loading.value = true;
  try {
    await requestClient.delete(`/api/hrms/contract-type/${id}`, {
      responseReturn: 'body',
    });
    message.success('Xóa loại hợp đồng thành công');
    await loadData();
  } catch {
    message.error('Xóa loại hợp đồng thất bại');
  } finally {
    loading.value = false;
  }
}

function numberFormatter(v: number | string) {
  if (v === null || v === undefined || v === '') return '';
  const n = Number(v);
  if (Number.isNaN(n)) return '';
  return String(n)
    .replaceAll(',', '')
    .replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const columns = [
  { title: '#', dataIndex: 'id', key: 'id', width: 70 },
  { title: 'Mã', dataIndex: 'code', key: 'code', width: 140 },
  { title: 'Tên loại HĐ', dataIndex: 'name', key: 'name', width: 240 },
  {
    title: 'BHXH',
    dataIndex: 'hasSocialInsurance',
    key: 'hasSocialInsurance',
    width: 100,
    customRender: ({ text }: any) =>
      text
        ? h(ATag, { color: 'green' }, { default: () => 'Có' })
        : h(ATag, { color: 'default' }, { default: () => 'Không' }),
  },
  {
    title: 'Thuế cố định',
    dataIndex: 'isTaxFixed',
    key: 'isTaxFixed',
    width: 120,
    customRender: ({ text }: any) =>
      text
        ? h(ATag, { color: 'green' }, { default: () => 'Có' })
        : h(ATag, { color: 'default' }, { default: () => 'Không' }),
  },
  { title: 'Thuế (%)', dataIndex: 'taxPercent', key: 'taxPercent', width: 120 },
  {
    title: 'Mức BHXH (NLĐ %)',
    dataIndex: 'employeeSocialInsurancePercent',
    key: 'employeeSocialInsurancePercent',
    width: 160,
  },
  {
    title: 'Mức BHYT (NLĐ %)',
    dataIndex: 'employeeHealthInsurancePercent',
    key: 'employeeHealthInsurancePercent',
    width: 160,
  },
  {
    title: 'Mức BHTN (NLĐ %)',
    dataIndex: 'employeeUnemployeeInsurancePercent',
    key: 'employeeUnemployeeInsurancePercent',
    width: 160,
  },
  {
    title: 'Lương tối thiểu BH',
    dataIndex: 'minInsuranceSalary',
    key: 'minInsuranceSalary',
    width: 140,
    customRender: ({ text }: { text: number | string }) =>
      text !== undefined && text !== null ? numberFormatter(text) : '',
  },
  {
    title: 'Hành động',
    key: 'actions',
    width: 140,
    customRender: ({ record }: { record: any }) =>
      h(ASpace, null, {
        default: () => [
          h(
            AButton,
            {
              type: 'link',
              onClick: () => {
                editModel.value = record;
                showCreate.value = true;
              },
            },
            { default: () => 'Sửa' },
          ),
          h(
            APopconfirm,
            {
              title: 'Bạn có chắc muốn xóa loại hợp đồng này không?',
              onConfirm: () => onDelete(record?.id),
              okText: 'Xóa',
              cancelText: 'Hủy',
            },
            {
              default: () =>
                h(
                  AButton,
                  { type: 'link', danger: true },
                  { default: () => 'Xóa' },
                ),
            },
          ),
        ],
      }),
  },
];

onMounted(loadData);
</script>

<template>
  <div class="p-4">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <input
          v-model="query.keyword"
          placeholder="Tìm kiếm..."
          class="rounded border px-2 py-1"
        />
        <AButton @click="loadData">Tìm</AButton>
      </div>
      <AButton type="primary" @click="onCreateOpen">Tạo loại hợp đồng</AButton>
    </div>

    <ATable
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      row-key="id"
      :pagination="{
        current: query.current,
        pageSize: query.pageSize,
        total,
        showTotal: (t: number) => `Tổng ${t}`,
      }"
      @change="onTableChange"
    />

    <ADrawer
      v-model:open="showCreate"
      title="Tạo / Sửa loại hợp đồng"
      destroy-on-close
      get-container="body"
    >
      <ContractTypeForm @cancel="onCancel" @submit="onSubmit" />
    </ADrawer>
  </div>
</template>

<style scoped>
.form-actions {
  position: sticky;
  bottom: 0;
  background: white;
  padding-top: 8px;
  padding-bottom: 8px;
}
</style>
