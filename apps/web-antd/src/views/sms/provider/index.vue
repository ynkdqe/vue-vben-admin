<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch, h } from 'vue';
import { Button, Form, Grid, Input, Select, Space, Table, Tag, message, Modal } from 'ant-design-vue';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import type { TableColumnsType } from 'ant-design-vue';
import { fetchSmsProviderList, type SmsProvider } from '#/api/sms/provider';
import { formatDate } from '@vben/utils';
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

const screens = Grid.useBreakpoint();
const isMobile = computed(() => !screens.value?.md);

const query = reactive({ keyword: '', status: undefined as string | number | undefined, page: 1, pageSize: 10 });
const loading = ref(false);
const dataSource = ref<SmsProvider[]>([]);
const total = ref(0);

const columns: TableColumnsType = [
  { title: '#', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Tên', dataIndex: 'name', key: 'name', width: 220 },
  { title: 'Endpoint', dataIndex: 'providerUrl', key: 'providerUrl', ellipsis: true },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140 },
  { title: 'Ngày tạo', dataIndex: 'creationTime', key: 'creationTime', width: 160, customRender: ({ text }) => formatDate(text, 'DD-MM-YYYY HH:mm:ss') },
  { title: 'Người tạo', dataIndex: 'creatorName', key: 'creatorName', width: 160 },
  { title: 'Ngày chỉnh sửa', dataIndex: 'modificationTime', key: 'modificationTime', width: 160, customRender: ({ text }) => formatDate(text, 'DD-MM-YYYY HH:mm:ss') },
  { title: 'Cập nhật bởi', dataIndex: 'modifierName', key: 'modifierName', width: 160 },
  // action column (fixed right) - compact spacing
  {
    title: 'Action',
    key: 'action',
    width: 120,
    fixed: 'right',
    align: 'center',
    customRender: ({ record }: any) => h(ASpace, null, {
        default: () => [
          h(
            AButton,
            {
              type: 'text',
              onClick: () => message.info(`Chức năng sửa chưa được triển khai`),
              title: 'Sửa',
            },
            { default: () => h(EditOutlined, { style: { color: '#1677ff' } }) },
          ),
          h(
            AButton,
            {
              type: 'text',
              onClick: () => message.info(`Chức năng xóa chưa được triển khai`),
              title: 'Xóa',
            },
            { default: () => h(DeleteOutlined, { style: { color: '#ff4d4f' } }) },
          ),
        ],
      }),
  },
];

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchSmsProviderList({
      keyword: query.keyword?.trim() || undefined,
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });
    dataSource.value = res.items;
    total.value = res.total;
  } catch (err: any) {
    message.error(err?.message || 'Không tải được danh sách provider');
  } finally {
    loading.value = false;
  }
}

function handleSearch() { query.page = 1; loadData(); }
function handleReset() { query.keyword = ''; query.status = undefined; query.page = 1; query.pageSize = 10; loadData(); }

onMounted(loadData);
watch(() => [query.page, query.pageSize], () => loadData());
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="rounded-md p-4 shadow-sm search-card">
      <AForm :layout="isMobile ? 'vertical' : 'inline'" @submit.prevent>
        <AFormItem label="Từ khóa" :style="isMobile ? { width: '100%' } : {}">
          <AInput
            v-model:value="query.keyword"
            placeholder="Tìm theo mã, tên..."
            allow-clear
            :style="isMobile ? { width: '100%' } : { minWidth: '260px' }"
            @press-enter="handleSearch"
          />
        </AFormItem>

        <AFormItem label="Trạng thái" :style="isMobile ? { width: '100%' } : {}">
          <ASelect v-model:value="query.status" allow-clear placeholder="Tất cả" :style="isMobile ? { width: '100%' } : { width: '180px' }">
            <ASelectOption value="active">Hoạt động</ASelectOption>
            <ASelectOption value="inactive">Ngừng</ASelectOption>
          </ASelect>
        </AFormItem>

        <AFormItem :style="isMobile ? { width: '100%' } : {}">
          <ASpace :wrap="true" :style="isMobile ? { width: '100%' } : {}">
            <AButton :block="isMobile" type="primary" @click="handleSearch">Tìm kiếm</AButton>
            <AButton :block="isMobile" @click="handleReset">Làm mới</AButton>
          </ASpace>
        </AFormItem>
      </AForm>
    </div>

    <ATable
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="{ current: query.page, pageSize: query.pageSize, total, showSizeChanger: true }"
      row-key="id"
      @change="(p) => { query.page = p.current!; query.pageSize = p.pageSize!; }"
    >
      <template #bodyCell="{ column, text }">
        <template v-if="column.key === 'status'">
          <ATag :color="Number(text) === 1 ? 'success' : 'default'">{{ Number(text) === 1 ? 'Hoạt động' : 'Ngừng' }}</ATag>
        </template>
      </template>
    </ATable>
  </div>
</template>
