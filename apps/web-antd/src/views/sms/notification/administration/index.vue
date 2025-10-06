<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { Button, Form, Grid, Input, Select, Space, Table, Tag, message } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';
import { formatDate } from '@vben/utils';
import { fetchAdminNotificationList, type NotificationItem } from '#/api/sms/notification';

const AButton = Button;
const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
const ASelect = Select;
const ASelectOption = Select.Option;
const ASpace = Space;
const ATable = Table;
const ATag = Tag;

const screens = Grid.useBreakpoint();
const isMobile = computed(() => !screens.value?.md);

const query = reactive({
  keyword: '',
  status: undefined as number | string | undefined,
  page: 1,
  pageSize: 20,
});

const loading = ref(false);
const dataSource = ref<NotificationItem[]>([]);
const total = ref(0);

const columns: TableColumnsType = [
  { title: '#', key: 'index', width: 80 },
  { title: 'Tiêu đề', dataIndex: 'title', key: 'title', width: 300, ellipsis: true },
  { title: 'Loại thông báo', dataIndex: 'type', key: 'type', width: 140 },
  { title: 'Người gửi', dataIndex: 'senderName', key: 'senderName', width: 160 },
  { title: 'Người nhận', key: 'recipients', width: 200 },
  { title: 'Ngày tạo', dataIndex: 'creationTime', key: 'creationTime', width: 200 },
];

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchAdminNotificationList({
      page: query.page,
      pageSize: query.pageSize,
      keyword: query.keyword?.trim() || undefined,
      status: query.status,
    });
    dataSource.value = res.items;
    total.value = res.total;
  } catch (err: any) {
    message.error(err?.message || 'Không tải được danh sách thông báo');
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
  query.pageSize = 20;
  loadData();
}

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
            placeholder="Tìm theo tiêu đề, nội dung..."
            allow-clear
            :style="isMobile ? { width: '100%' } : { minWidth: '260px' }"
            @press-enter="handleSearch"
          />
        </AFormItem>

        <AFormItem label="Loại thông báo" :style="isMobile ? { width: '100%' } : {}">
          <ASelect v-model:value="query.status" allow-clear placeholder="Tất cả" :style="isMobile ? { width: '100%' } : { width: '180px' }">
            <ASelectOption :value="0">Cá nhân</ASelectOption>
            <ASelectOption :value="1">Công khai</ASelectOption>
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
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">
          {{ (query.page - 1) * query.pageSize + index + 1 }}
        </template>
        <template v-else-if="column.key === 'type'">
          <ATag :color="record.type === 1 ? 'blue' : 'green'">
            {{ record.type === 1 ? 'Công khai' : 'Cá nhân' }}
          </ATag>
        </template>
        <template v-else-if="column.key === 'recipients'">
          <div v-if="record.type === 1" class="text-blue-600 font-medium">
            Toàn bộ
          </div>
          <div v-else-if="record.type === 0 && record.notificationUsers?.length > 0">
            <div class="space-y-1">
              <div v-for="user in record.notificationUsers.slice(0, 2)" :key="user.id" class="text-sm">
                {{ user.name }} ({{ user.userName }})
              </div>
              <div v-if="record.notificationUsers.length > 2" class="text-xs text-gray-500">
                +{{ record.notificationUsers.length - 2 }} người khác
              </div>
            </div>
          </div>
          <div v-else class="text-gray-400">
            Không có người nhận
          </div>
        </template>
        <template v-else-if="column.key === 'creationTime'">
          {{ formatDate(record.creationTime, 'DD-MM-YYYY HH:mm:ss') }}
        </template>
      </template>
    </ATable>
  </div>
</template>
