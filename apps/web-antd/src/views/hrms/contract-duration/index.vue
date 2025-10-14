<script lang="ts" setup>
import type { TablePaginationConfig } from 'ant-design-vue';

import type { ContractDurationDto } from '#/api/hrms/contract-duration';

import { h, onMounted, reactive, ref } from 'vue';

import {
  Button,
  Drawer,
  message,
  Popconfirm,
  Space,
  Table,
} from 'ant-design-vue';

import {
  createContractDuration,
  deleteContractDuration,
  fetchContractDurationList,
} from '#/api/hrms/contract-duration';

import ContractDurationForm from './components/ContractDurationForm.vue';

const AButton = Button;
const ADrawer = Drawer;
const ATable = Table;
const ASpace = Space;
const APopconfirm = Popconfirm;

const query = reactive({ current: 1, pageSize: 10, keyword: '' });
const loading = ref(false);
const dataSource = ref<ContractDurationDto[]>([]);
const total = ref(0);
const showCreate = ref(false);
const editModel = ref<null | Record<string, any>>(null);

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchContractDurationList({
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
    await createContractDuration(payload);
    message.success('Tạo thời hạn hợp đồng thành công');
    showCreate.value = false;
    await loadData();
  } catch {
    message.error('Tạo thời hạn hợp đồng thất bại');
  } finally {
    loading.value = false;
  }
}

async function onDelete(id: number | string | undefined) {
  if (!id) return;
  loading.value = true;
  try {
    await deleteContractDuration(id);
    message.success('Xóa thời hạn hợp đồng thành công');
    await loadData();
  } catch {
    message.error('Xóa thời hạn hợp đồng thất bại');
  } finally {
    loading.value = false;
  }
}

const columns = [
  { title: '#', dataIndex: 'id', key: 'id', width: 70 },
  {
    title: 'Loại HĐ',
    dataIndex: ['contractType', 'name'],
    key: 'contractTypeName',
    width: 200,
  },
  { title: 'Tên', dataIndex: 'name', key: 'name', width: 240 },
  {
    title: 'Thời hạn (tháng)',
    dataIndex: 'duration',
    key: 'duration',
    width: 140,
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
              title: 'Bạn có chắc muốn xóa thời hạn này không?',
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
      <AButton type="primary" @click="onCreateOpen">
        Tạo thời hạn hợp đồng
      </AButton>
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
      title="Tạo / Sửa thời hạn hợp đồng"
      destroy-on-close
      get-container="body"
    >
      <ContractDurationForm @cancel="onCancel" @submit="onSubmit" />
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
