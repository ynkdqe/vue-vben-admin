<script lang="ts" setup>
import type { TablePaginationConfig } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';

import type { ContractFormModel } from './models/contract-models';

import type { ContractDto } from '#/api/hrms/contract';

import { h, onMounted, onUnmounted, reactive, ref } from 'vue';


import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';

import { createContract, fetchContractList } from '#/api/hrms/contract';
import { requestClient } from '#/api/request';
import ContractTypeSelect from '#/components/ContractTypeSelect.vue';
import StatusSelect from '#/components/StatusSelect.vue';

import ContractForm from './components/ContractForm.vue';
import { useI18n } from '@vben/locales';

const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
// ASelect / ASelectOption not used here (StatusSelect component used)
const ARangePicker = DatePicker.RangePicker;
const ASelect = Select;
const ATable = Table;
const ASpace = Space;
const AButton = Button;
const ADrawer = Drawer;
const ATag = Tag;
const APopconfirm = Popconfirm;
const AModal = Modal;

interface QueryState {
  keyword?: string;
  status?: string;
  isActive?: number;
  contractType?: string;
  effective?: [Dayjs, Dayjs] | undefined;
  current: number;
  pageSize: number;
}

const query = reactive<QueryState>({
  keyword: '',
  status: undefined,
  contractType: undefined,
  effective: undefined,
  current: 1,
  pageSize: 10,
});

const loading = ref(false);
const dataSource = ref<ContractDto[]>([]);
const total = ref(0);
const showCreate = ref(false);
const isMobile = ref(false);
const drawerWidth = ref<number | string>(1000);
const drawerPlacement = ref<'bottom' | 'right'>('right');
const drawerHeight = ref<number | string | undefined>(undefined);
const statusOptions = ref<Array<{ label: string; value: number | string }>>([]);
const statusMap = ref<Record<string, string>>({});
const contractTypes = ref<Array<{ label: string; value: number | string }>>([]);

async function loadData() {
  loading.value = true;
  try {
    const effectiveStart = query.effective?.[0].toString();
    const effectiveEnd = query.effective?.[1].toString();

    const res = await fetchContractList({
      keyword: query.keyword,
      status: Array.isArray(query.status)
        ? query.status.join(',')
        : query.status,
      contractType: query.contractType,
      isActive: query.isActive,
      current: query.current,
      pageSize: query.pageSize,
      effectiveStart: effectiveStart || undefined,
      effectiveEnd: effectiveEnd || undefined,
    });
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

async function loadStatuses() {
  try {
    const res = await requestClient.get<any>('/api/hrms/contract/status', {
      responseReturn: 'body',
    });
    const list = Array.isArray(res?.data)
      ? res.data
      : res?.items || res?.data || [];
    statusOptions.value = list.map((x: any) => ({
      label: x?.name,
      value: x?.id,
    }));
    statusMap.value = {};
    for (const s of statusOptions.value)
      statusMap.value[String(s.value)] = s.label;
  } catch {
    statusOptions.value = [];
    statusMap.value = {};
  }
}

async function loadContractTypes() {
  try {
    const res = await requestClient.get<any>('/api/hrms/contract/type', {
      responseReturn: 'body',
    });
    const list = Array.isArray(res?.data)
      ? res.data
      : res?.items || res?.data || [];
    contractTypes.value = list.map((x: any) => ({
      label: x?.name,
      value: x?.id,
    }));
  } catch {
    contractTypes.value = [];
  }
}

function onReset() {
  query.keyword = '';
  query.status = undefined;
  query.effective = undefined;
  query.contractType = undefined;
  query.isActive = undefined;
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
  editModel.value = undefined;
  showCreate.value = true;
}

function onCreateCancel() {
  showCreate.value = false;
}

async function onCreateSubmit(payload: Record<string, any>) {
    loading.value = true;
  try {
    await createContract(payload);
    message.success(t('page.contract.index.createSuccess') || 'Tạo hợp đồng thành công');
    showCreate.value = false;
    query.current = 1;
    await loadData();
  } catch {
    // message displayed by request interceptor; optionally add fallback
    message.error(t('page.contract.index.createError') || 'Tạo hợp đồng thất bại');
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
onMounted(loadStatuses);
onMounted(loadContractTypes);

const { t } = useI18n();

function updateDrawerResponsive() {
  const w = window.innerWidth;
  isMobile.value = w <= 640;
  if (isMobile.value) {
    drawerWidth.value = '100%';
    drawerPlacement.value = 'bottom';
    drawerHeight.value = '100%';
  } else {
    drawerWidth.value = 1000;
    drawerPlacement.value = 'right';
    drawerHeight.value = undefined;
  }
}

onMounted(() => {
  updateDrawerResponsive();
  window.addEventListener('resize', updateDrawerResponsive);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateDrawerResponsive);
});

function numberFormatter(v: number | string) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return s.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const columns = [
  {
    title: '#',
    dataIndex: 'id',
    key: 'id',
    width: 70,
    customRender: ({ text }: { text: number | string }) => String(text ?? ''),
  },
  {
    title: t('page.contract.index.columns.contractCode') || 'Mã HĐ',
    dataIndex: 'contractCode',
    key: 'contractCode',
    width: 140,
  },
  {
    title: t('page.contract.index.columns.contractName') || 'Tên HĐ',
    dataIndex: 'contractName',
    key: 'contractName',
    width: 200,
    customRender: ({ record }: { record: any }) =>
      String(record?.contractName ?? record?.name ?? ''),
  },
  {
    title: t('page.contract.index.columns.employee') || 'Tên nhân viên',
    dataIndex: ['employee', 'name'],
    key: 'employeeName',
    width: 180,
    customRender: ({ record }: { record: any }) =>
      String(record?.employee?.name ?? record?.employeeName ?? ''),
  },
  {
    title: t('page.contract.index.columns.employeeCode') || 'Mã nhân viên',
    dataIndex: ['employee', 'employeeCode'],
    key: 'employeeCode',
    width: 140,
    customRender: ({ record }: { record: any }) =>
      String(
        record?.employee?.employeeCode ?? record?.employee?.userName ?? '',
      ),
  },
  {
    title: t('page.contract.index.columns.effectiveDate') || 'Hiệu lực',
    dataIndex: 'effectiveDate',
    key: 'effectiveDate',
    width: 120,
    // render date as DD-MM-YYYY
    customRender: ({ text }: { text: string }) =>
      text ? dayjs(text).format('DD-MM-YYYY') : '',
  },
  {
    title: t('page.contract.index.columns.expiryDate') || 'Hết hạn',
    dataIndex: 'expiryDate',
    key: 'expiryDate',
    width: 120,
    customRender: ({ text }: { text: string }) =>
      text ? dayjs(text).format('DD-MM-YYYY') : '',
  },
  {
    title: t('page.contract.index.columns.salaryGross') || 'Lương gross',
    dataIndex: 'salaryGross',
    key: 'salaryGross',
    width: 140,
    customRender: ({ record }: { record: any }) => {
      const val = record?.salaryGross ?? record?.totalSalary ?? '';
      return val !== undefined && val !== null ? numberFormatter(val) : '';
    },
  },
  {
    title: t('page.contract.index.columns.totalCost') || 'Chi phí hợp đồng',
    dataIndex: 'totalCost',
    key: 'totalCost',
    width: 140,
    customRender: ({ record }: { record: any }) => {
      const val = record?.totalCost ?? '';
      return val !== undefined && val !== null ? numberFormatter(val) : '';
    },
  },
  {
    title: t('page.contract.index.columns.status') || 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    customRender: ({ text }: { text: number | string }) =>
      h(
        ATag,
        { color: getStatusColor(Number(text)) },
        { default: () => statusMap.value[String(text)] || String(text || '') },
      ),
  },
  {
    title: t('page.contract.index.columns.actions') || 'Hành động',
    key: 'actions',
    width: 140,
    customRender: ({ record }: { record: any }) =>
      h(ASpace, null, {
        default: () => [
          h(
            AButton,
            {
              type: 'text',
              onClick: () => onEdit(record),
              title: t('page.contract.index.edit') || 'Sửa',
            },
            { default: () => h(EditOutlined, { style: { color: '#1677ff' } }) },
          ),
          h(
            AButton,
            {
              type: 'text',
              onClick: () => showDeleteConfirm(record?.id),
              title: t('page.contract.index.delete') || 'Xóa',
            },
            { default: () => h(DeleteOutlined, { style: { color: '#ff4d4f' } }) },
          ),
        ],
      }),
  },
];

function getStatusColor(s: number | string) {
  try {
    const n = Number(s);
    if (n === 1) return 'green';
    if (n === 0) return 'red';
    return 'default';
  } catch {
    return 'default';
  }
}

const editModel = ref<Partial<ContractFormModel> | undefined>(undefined);

function onEdit(record: any) {
  editModel.value = { ...record };
  showCreate.value = true;
}

async function onDelete(id: number | string | undefined) {
  if (!id) return;
  try {
    loading.value = true;
    await requestClient.delete(`/api/hrms/contract/${id}`, {
      responseReturn: 'body',
    });
    message.success('Xóa hợp đồng thành công');
    await loadData();
  } catch {
    message.error('Xóa hợp đồng thất bại');
  } finally {
    loading.value = false;
  }
}

function showDeleteConfirm(id: number | string | undefined) {
  if (!id) return;
  AModal.confirm({
    title: t('page.contract.index.deleteConfirm') || 'Bạn có chắc muốn xóa hợp đồng này không?',
    okText: t('page.contract.index.delete') || 'Xóa',
    cancelText: t('page.contract.form.cancel') || 'Hủy',
    async onOk() {
      await onDelete(id);
    },
  });
}
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
          <StatusSelect
            :statuses="statusOptions"
            :multiple="true"
            v-model="query.status"
            placeholder="Chọn trạng thái"
            style="width: 220px"
          />
        </AFormItem>
        <AFormItem label="Loại HĐ">
          <ContractTypeSelect
            :types="contractTypes"
            v-model="query.contractType"
            placeholder="Chọn loại hợp đồng"
            style="width: 220px"
          />
        </AFormItem>
        <AFormItem label="Hiệu lực">
          <div class="flex items-center gap-2">
            <ARangePicker
              v-model:value="query.effective"
              format="DD-MM-YYYY"
              value-format="YYYY-MM-DD"
            />
            <ASelect
              v-model:value="query.isActive"
                :placeholder="t('page.contract.index.effectivePlaceholder') || 'Hiệu lực'"
              style="width: 140px"
            >
                <ASelect.Option :value="1">{{ t('page.contract.index.effective') || 'Hiệu lực' }}</ASelect.Option>
                <ASelect.Option :value="0">{{ t('page.contract.index.expired') || 'Hết hạn' }}</ASelect.Option>
            </ASelect>
          </div>
        </AFormItem>
        <ASpace>
          <AButton type="primary" @click="onFilter">{{ t('page.contract.index.filter') || 'Lọc' }}</AButton>
          <AButton @click="onReset">{{ t('page.contract.index.reset') || 'Đặt lại' }}</AButton>
        </ASpace>
      </AForm>
  <AButton type="primary" @click="onCreateContract">{{ t('page.contract.index.create') || 'Tạo hợp đồng' }}</AButton>
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
        showTotal: (totalCount: number) => `${t('page.contract.index.total') || 'Total'} ${totalCount}`,
      }"
      @change="onTableChange"
    />

    <ADrawer
      v-model:open="showCreate"
      :width="drawerWidth"
      :height="drawerHeight"
      :placement="drawerPlacement"
  :title="t('page.contract.index.create') || 'Tạo hợp đồng'"
      destroy-on-close
      get-container="body"
      wrap-class-name="hrms-contract-drawer"
      :mask-closable="true"
      :closable="true"
      :body-style="{ padding: '12px', overflow: 'auto', height: '100%' }"
    >
      <div class="drawer-responsive-wrapper">
        <div class="drawer-body">
          <ContractForm
            :loading="loading"
            v-model="editModel"
            :key="String(editModel?.id || 'new')"
            @cancel="onCreateCancel"
            @submit="onCreateSubmit"
          />
        </div>
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
  .hrms-contract-drawer .ant-drawer-mask {
    z-index: 9998 !important;
  }
}

/* drawer body helper: make the form scroll and keep action buttons visible */
.drawer-body {
  display: flex;
  flex-direction: column;
  min-height: 60vh;
}
.drawer-body > form {
  flex: 1 1 auto;
}
.ant-drawer-footer {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 12px;
  z-index: 9999;
}

/* make action bar inside ContractForm sticky */
.hrms-contract-drawer .form-actions {
  position: sticky;
  bottom: 0;
  background: white;
  padding-top: 8px;
  padding-bottom: 8px;
  z-index: 10000;
}
</style>
