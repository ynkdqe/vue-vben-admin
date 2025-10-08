<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue';

import type { NotificationItem } from '#/api/sms/notification';

import { computed, onMounted, reactive, ref, watch } from 'vue';

import { formatDate } from '@vben/utils';

import {
  Button,
  Form,
  Grid,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  createNotification,
  fetchAdminNotificationList,
} from '#/api/sms/notification';
import AdminNotificationForm from '#/components/AdminNotificationForm.vue';
// requestClient no longer used here after refactor

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
  {
    title: 'Tiêu đề',
    dataIndex: 'title',
    key: 'title',
    width: 300,
    ellipsis: true,
  },
  { title: 'Loại thông báo', dataIndex: 'type', key: 'type', width: 140 },
  {
    title: 'Người gửi',
    dataIndex: 'senderName',
    key: 'senderName',
    width: 160,
  },
  { title: 'Người nhận', key: 'recipients', width: 200 },
  {
    title: 'Ngày tạo',
    dataIndex: 'creationTime',
    key: 'creationTime',
    width: 200,
  },
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
  } catch (error: any) {
    message.error(error?.message || 'Không tải được danh sách thông báo');
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
watch(
  () => [query.page, query.pageSize],
  () => loadData(),
);

// -------------------- Send Notification Modal --------------------
type NotificationType = 0 | 1; // 0: Private, 1: Public
const sendVisible = ref(false);
const sendSubmitting = ref(false);
const sendFormRef = ref();
const sendForm = reactive({
  isSystem: false,
  senderId: undefined as string | undefined,
  recipientIds: [] as string[],
  type: 0 as NotificationType,
  title: '',
  message: '',
  icon: '',
  url: '',
});

// Disable logic moved into child form

function openSendModal() {
  sendVisible.value = true;
  // Reset minimal state
  sendForm.isSystem = false;
  sendForm.senderId = undefined;
  sendForm.recipientIds = [];
  sendForm.type = 0;
  sendForm.title = '';
  sendForm.message = '';
  sendForm.icon = '';
  sendForm.url = '';
}

function closeSendModal() {
  sendVisible.value = false;
}

async function handleSend() {
  try {
    sendSubmitting.value = true;
    await sendFormRef.value?.validate?.();
    const payload = {
      senderId: sendForm.senderId || null,
      receiverIds: Array.isArray(sendForm.recipientIds)
        ? sendForm.recipientIds
        : [],
      title: sendForm.title,
      message: sendForm.message,
      icon: sendForm.icon || null,
      url: sendForm.url || null,
      type: sendForm.type,
      isSystem: !!sendForm.isSystem,
    };
    const res = await createNotification(payload as any);
    if (res?.success === true) {
      message.success(res?.message || 'Thành công');
      closeSendModal();
      // refresh list
      await loadData();
    } else {
      throw new Error(res?.message || 'Gửi thông báo thất bại');
    }
  } catch {
    // validation error ignored
  } finally {
    sendSubmitting.value = false;
  }
}
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="search-card rounded-md p-4 shadow-sm">
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

        <AFormItem
          label="Loại thông báo"
          :style="isMobile ? { width: '100%' } : {}"
        >
          <ASelect
            v-model:value="query.status"
            allow-clear
            placeholder="Tất cả"
            :style="isMobile ? { width: '100%' } : { width: '180px' }"
          >
            <ASelectOption :value="0">Cá nhân</ASelectOption>
            <ASelectOption :value="1">Công khai</ASelectOption>
          </ASelect>
        </AFormItem>

        <AFormItem :style="isMobile ? { width: '100%' } : {}">
          <ASpace :wrap="true" :style="isMobile ? { width: '100%' } : {}">
            <AButton :block="isMobile" type="primary" @click="handleSearch">
              Tìm kiếm
            </AButton>
            <AButton :block="isMobile" @click="handleReset">Làm mới</AButton>
            <AButton
              :block="isMobile"
              type="primary"
              ghost
              @click="openSendModal"
            >
              Gửi thông báo
            </AButton>
          </ASpace>
        </AFormItem>
      </AForm>
    </div>

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
        (p) => {
          query.page = p.current!;
          query.pageSize = p.pageSize!;
        }
      "
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
          <div v-if="record.type === 1" class="font-medium text-blue-600">
            Toàn bộ
          </div>
          <div
            v-else-if="
              record.type === 0 && record.notificationReceivers?.length > 0
            "
          >
            <div class="space-y-1">
              <div
                v-for="user in record.notificationReceivers.slice(0, 2)"
                :key="user.id"
                class="text-sm"
              >
                {{ user.name }} ({{ user.userName }})
              </div>
              <div
                v-if="record.notificationReceivers.length > 2"
                class="text-xs text-gray-500"
              >
                +{{ record.notificationReceivers.length - 2 }} người khác
              </div>
            </div>
          </div>
          <div v-else class="text-gray-400">Không có người nhận</div>
        </template>
        <template v-else-if="column.key === 'creationTime'">
          {{ formatDate(record.creationTime, 'DD-MM-YYYY HH:mm:ss') }}
        </template>
      </template>
    </ATable>

    <AModal
      v-model:open="sendVisible"
      :confirm-loading="sendSubmitting"
      title="Gửi thông báo"
      ok-text="Gửi"
      cancel-text="Hủy"
      @ok="handleSend"
      @cancel="closeSendModal"
      :width="720"
    >
      <AdminNotificationForm
        ref="sendFormRef"
        :model-value="sendForm"
        @update:model-value="(v) => Object.assign(sendForm, v)"
      />
    </AModal>
  </div>
</template>
