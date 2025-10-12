<script lang="ts" setup>
import type { TablePaginationConfig } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';

import type { ContractDto } from '#/api/hrms/contract';

import { onMounted, reactive, ref } from 'vue';
import dayjs from 'dayjs';

import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Select,
  Space,
  Table,
} from 'ant-design-vue';

import { createContract, fetchContractList } from '#/api/hrms/contract';
import { requestClient } from '#/api/request';

import ContractForm from './components/ContractForm.vue';

const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
const ASelect = Select;
const ASelectOption = Select.Option;
const ARangePicker = DatePicker.RangePicker;
const ATable = Table;
const ASpace = Space;
const AButton = Button;
const ADrawer = Drawer;

interface QueryState {
  keyword?: string;
  status?: number | string;
  range?: [Dayjs, Dayjs] | undefined;
  current: number;
  pageSize: number;
}

const query = reactive<QueryState>({
  keyword: '',
  status: undefined,
  range: undefined,
  current: 1,
  pageSize: 10,
});

const loading = ref(false);
const dataSource = ref<ContractDto[]>([]);
const total = ref(0);
const showCreate = ref(false);
const statusOptions = ref<Array<{ label: string; value: number | string }>>([]);
const statusMap = ref<Record<string, string>>({});

async function loadData() {
  loading.value = true;
  try {
    const start = query.range?.[0];
    const end = query.range?.[1];
    const res = await fetchContractList({
      keyword: query.keyword,
      status: query.status,
      current: query.current,
      pageSize: query.pageSize,
      effectiveStart: start ? start.toISOString() : undefined,
      effectiveEnd: end ? end.toISOString() : undefined,
    });
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

async function loadStatuses() {
  try {
    const res = await requestClient.get<any>('/api/hrms/contract/status', { responseReturn: 'body' });
    const list = Array.isArray(res?.data) ? res.data : res?.items || res?.data || [];
    statusOptions.value = list.map((x: any) => ({ label: x?.name, value: x?.id }));
    statusMap.value = {};
    for (const s of statusOptions.value) statusMap.value[String(s.value)] = s.label;
  } catch {
    statusOptions.value = [];
    statusMap.value = {};
  }
}

function onReset() {
  query.keyword = '';
  query.status = undefined;
  query.range = undefined;
  query.current = 1;
  loadData();
}

function onTableChange(pagination: TablePaginationConfig) {
  query.current = Number(pagination.current || 1);
  query.pageSize = Number(pagination.pageSize || 10);
  loadData();
}

function onFilter() {
  query.current = 1;
  loadData();
}

function onCreateContract() {
  showCreate.value = true;
}

function onCreateCancel() {
  showCreate.value = false;
}

async function onCreateSubmit(payload: Record<string, any>) {
  loading.value = true;
  try {
    await createContract(payload);
    message.success('Tạo hợp đồng thành công');
    showCreate.value = false;
    query.current = 1;
    await loadData();
  } catch {
    // message displayed by request interceptor; optionally add fallback
    message.error('Tạo hợp đồng thất bại');
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
onMounted(loadStatuses);

function numberFormatter(v: number | string) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const columns = [
  {
    title: 'Mã HĐ',
    dataIndex: 'contractCode',
    key: 'contractCode',
    width: 140,
  },
  {
    title: 'Hiệu lực',
    dataIndex: 'effectiveDate',
    key: 'effectiveDate',
    width: 150,
    // render date as DD-MM-YYYY
    customRender: ({ text }: { text: string }) => (text ? dayjs(text).format('DD-MM-YYYY') : ''),
  },
  {
    title: 'Hết hạn',
    dataIndex: 'expiryDate',
    key: 'expiryDate',
    width: 150,
    customRender: ({ text }: { text: string }) => (text ? dayjs(text).format('DD-MM-YYYY') : ''),
  },
  {
    title: 'Lương cơ bản',
    dataIndex: 'basicSalary',
    key: 'basicSalary',
    width: 140,
    customRender: ({ text }: { text: number }) => (text !== undefined && text !== null ? numberFormatter(text) : ''),
  },
  {
    title: 'Tổng lương',
    dataIndex: 'totalSalary',
    key: 'totalSalary',
    width: 140,
    customRender: ({ text }: { text: number }) => (text !== undefined && text !== null ? numberFormatter(text) : ''),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    customRender: ({ text }: { text: number | string }) => statusMap.value[String(text)] || String(text || ''),
  },
];
</script>


<template>
  <div class="p-4">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <AForm layout="inline" class="mb-0 min-w-[280px] flex-1">
        <AFormItem label="Tìm kiếm">
          <AInput
            v-model:value="query.keyword"
            allow-clear
            placeholder="Mã/nhân viên..."
            style="width: 220px"
          />
        </AFormItem>
        <AFormItem label="Trạng thái">
          <ASelect
            v-model:value="query.status"
            allow-clear
            placeholder="Chọn trạng thái"
            style="width: 180px"
          >
            <ASelectOption :value="1">Hiệu lực</ASelectOption>
            <ASelectOption :value="0">Hết hạn</ASelectOption>
          </ASelect>
        </AFormItem>
        <AFormItem label="Hiệu lực">
          <ARangePicker v-model:value="query.range" format="YYYY-MM-DD" />
        </AFormItem>
        <ASpace>
          <AButton type="primary" @click="onFilter">Lọc</AButton>
          <AButton @click="onReset">Đặt lại</AButton>
        </ASpace>
      </AForm>
      <AButton type="primary" @click="onCreateContract">Tạo hợp đồng</AButton>
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
      :width="1000"
      title="Tạo hợp đồng"
      destroy-on-close
      placement="right"
      :body-style="{ padding: '12px' }"
    >
      <div class="drawer-responsive-wrapper">
        <ContractForm
          :loading="loading"
          @cancel="onCreateCancel"
          @submit="onCreateSubmit"
        />
      </div>
    </ADrawer>
  </div>
</template>

<style scoped>
.drawer-responsive-wrapper {
  width: 100%;
}
@media (max-width: 640px) {
  /* Force Drawer to occupy full viewport width on small screens */
  .ant-drawer-content-wrapper {
    width: 100% !important;
    max-width: 100% !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 9999 !important;
  }
}
</style>
