<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, reactive, computed } from 'vue';
import { App as AntApp, List, Pagination, Skeleton, Form, Input, Select, DatePicker, Button, Grid, Space, Checkbox, Popconfirm } from 'ant-design-vue';
import { formatDate } from '@vben/utils';
import { fetchNotificationList, type NotificationUserItem } from '#/api/sms/notification';
import NotificationListItem from './components/NotificationListItem.vue';
import type { Dayjs } from 'dayjs';

const AList = List;
const AListItem = List.Item;
const APagination = Pagination;
const ASkeleton = Skeleton;
const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
const ASelect = Select;
const ASelectOption = Select.Option;
const ARangePicker = DatePicker.RangePicker;
const AButton = Button;
const ASpace = Space;
const ACheckbox = Checkbox;
const APopconfirm = Popconfirm;

const { message } = AntApp.useApp();

type UiNotification = {
  id: string;
  avatar?: string;
  isRead: boolean;
  title: string;
  message: string;
  date: string;
  senderName?: string | null;
  raw: NotificationUserItem;
};

const list = ref<UiNotification[]>([]);
const loading = ref(false);
const total = ref(0);
const selectedIds = ref<Set<string>>(new Set());
const searchCollapsed = ref(true);
const query = reactive({
  keyword: '',
  status: undefined as number | string | undefined,
  page: 1,
  pageSize: 20,
  dateRange: undefined as [Dayjs, Dayjs] | undefined,
});

const screens = Grid.useBreakpoint();
const isMobile = computed(() => !screens.value?.md);

function mapToUiItem(n: NotificationUserItem): UiNotification {
  return {
    id: n?.id ?? crypto.randomUUID?.() ?? String(Math.random()),
    avatar: n?.icon || undefined,
    isRead: n.status === 1,
    title: n?.title ?? 'Thông báo',
    message: n?.message ?? '',
    date: n?.creationTime ? ((formatDate(n.creationTime, 'DD-MM-YYYY HH:mm:ss') as string) || '') : '',
    senderName: n?.senderName,
    raw: n as NotificationUserItem,
  };
}

function getDateParams() {
  if (!query.dateRange || !query.dateRange[0] || !query.dateRange[1]) return {} as { startDate?: string; endDate?: string };
  const [start, end] = query.dateRange;
  return {
    startDate: start?.toDate?.().toISOString?.() ?? undefined,
    endDate: end?.toDate?.().toISOString?.() ?? undefined,
  };
}

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchNotificationList({
      page: query.page,
      pageSize: query.pageSize,
      keyword: query.keyword?.trim() || undefined,
      status: query.status === '' ? undefined : query.status,
      ...getDateParams(),
    });
    total.value = res.total;
    list.value = Array.isArray(res.items)
      ? (res.items).map(mapToUiItem)
      : [];
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
  query.dateRange = undefined;
  query.page = 1;
  query.pageSize = 20;
  loadData();
}

onMounted(async () => {
  await loadData();
});

onBeforeUnmount(() => {
  // nothing
});

function handlePageChange(p: number, ps?: number) {
  query.page = p;
  if (ps) query.pageSize = ps;
  loadData();
}

function toggleSelect(id: string, checked: boolean) {
  if (checked) selectedIds.value.add(id);
  else selectedIds.value.delete(id);
}

const hasSelection = computed(() => selectedIds.value.size > 0);

const allSelected = computed({
  get() {
    return list.value.length > 0 && list.value.every((x) => selectedIds.value.has(x.id));
  },
  set(v: boolean) {
    if (v) {
      selectedIds.value = new Set(list.value.map((x) => x.id));
    } else {
      selectedIds.value.clear();
    }
  },
});

async function handleToggleRead(item: UiNotification) {
  try {
    const toStatus = item.isRead ? 0 : 1;
    const { updateNotificationStatus } = await import('#/api/sms/notification');
    await updateNotificationStatus([item.id], toStatus as 0 | 1);
    item.isRead = !item.isRead;
    message.success(item.isRead ? 'Đã đánh dấu đã đọc' : 'Đã đánh dấu chưa đọc');
  } catch (err: any) {
    message.error(err?.message || 'Không cập nhật được trạng thái');
  }
}

async function handleDeleteOne(item: UiNotification) {
  try {
    const { deleteNotification } = await import('#/api/sms/notification');
    await deleteNotification(item.id);
    list.value = list.value.filter((x) => x.id !== item.id);
    total.value = Math.max(0, total.value - 1);
    selectedIds.value.delete(item.id);
    message.success('Đã xóa thông báo');
  } catch (err: any) {
    message.error(err?.message || 'Không xóa được thông báo');
  }
}

async function handleDeleteSelected() {
  const ids = Array.from(selectedIds.value);
  if (ids.length === 0) return;
  try {
    const { deleteNotifications } = await import('#/api/sms/notification');
    await deleteNotifications(ids);
    list.value = list.value.filter((x) => !selectedIds.value.has(x.id));
    total.value = Math.max(0, total.value - ids.length);
    selectedIds.value.clear();
    message.success('Đã xóa các thông báo đã chọn');
  } catch (err: any) {
    message.error(err?.message || 'Không xóa được các thông báo đã chọn');
  }
}

async function handleMarkSelected(status: 0 | 1) {
  const ids = Array.from(selectedIds.value);
  if (ids.length === 0) return;
  try {
    const { updateNotificationStatus } = await import('#/api/sms/notification');
    await updateNotificationStatus(ids, status);
    list.value = list.value.map((n) => (selectedIds.value.has(n.id) ? { ...n, isRead: status === 1 } : n));
    message.success(status === 1 ? 'Đã đánh dấu đã đọc' : 'Đã đánh dấu chưa đọc');
  } catch (err: any) {
    message.error(err?.message || 'Không cập nhật được trạng thái');
  }
}

</script>

<template>
  <div class="p-4 space-y-4">
    <div class="rounded-md p-4 shadow-sm search-card">
      <div :style="{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'8px' }">
        <div style="font-weight: 600">Bộ lọc</div>
        <AButton type="link" @click="searchCollapsed = !searchCollapsed">{{ searchCollapsed ? 'Mở' : 'Thu gọn' }}</AButton>
      </div>
      <div v-show="!searchCollapsed" style="margin-top:12px">
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

          <AFormItem label="Trạng thái" :style="isMobile ? { width: '100%' } : {}">
            <ASelect v-model:value="query.status" allow-clear placeholder="Tất cả" :style="isMobile ? { width: '100%' } : { width: '180px' }">
              <ASelectOption :value="0">Chưa đọc</ASelectOption>
              <ASelectOption :value="1">Đã đọc</ASelectOption>
            </ASelect>
          </AFormItem>

          <AFormItem label="Khoảng thời gian" :style="isMobile ? { width: '100%' } : {}">
            <ARangePicker
              v-model:value="query.dateRange"
              show-time
              :style="isMobile ? { width: '100%' } : { minWidth: '320px' }"
              format="DD-MM-YYYY HH:mm:ss"
            />
          </AFormItem>

          <AFormItem :style="isMobile ? { width: '100%' } : {}">
            <ASpace :wrap="true" :style="isMobile ? { width: '100%' } : {}">
              <AButton :block="isMobile" type="primary" @click="handleSearch">Tìm kiếm</AButton>
              <AButton :block="isMobile" @click="handleReset">Làm mới</AButton>
            </ASpace>
          </AFormItem>
        </AForm>
      </div>
    </div>

    <ASkeleton :loading="loading" active :paragraph="{ rows: 3 }">
      <div :style="isMobile ? { display:'block', marginBottom:'8px' } : { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }">
        <div :style="isMobile ? { marginBottom:'8px', display:'flex', alignItems:'center', gap:'8px' } : { display:'flex', alignItems:'center', gap:'8px' }">
          <ACheckbox v-model:checked="allSelected">Chọn tất cả</ACheckbox>
          <strong>Tổng:</strong> {{ total }}
          <span v-if="hasSelection"> • Đã chọn {{ selectedIds.size }}</span>
        </div>
        <div :style="{ display:'flex', gap:'8px', flexWrap:'wrap' }">
          <AButton :disabled="!hasSelection" @click="() => handleMarkSelected(1)" :block="isMobile">Đánh dấu tất cả đã đọc</AButton>
          <APopconfirm
            v-if="hasSelection"
            title="Bạn có chắc muốn xóa các thông báo đã chọn?"
            ok-text="Xóa"
            cancel-text="Hủy"
            @confirm="handleDeleteSelected"
          >
            <AButton danger :block="isMobile">Xóa đã chọn</AButton>
          </APopconfirm>
        </div>
      </div>
      <AList :data-source="list" bordered>
        <template #renderItem="{ item }">
          <AListItem>
            <div :style="isMobile ? { display: 'grid', gridTemplateColumns: '24px 1fr', gap: '10px', width:'100%' } : { display:'flex', gap:'10px', width:'100%' }">
              <div style="padding-top:6px">
                <ACheckbox :checked="selectedIds.has(item.id)" @change="(e:any) => toggleSelect(item.id, e.target.checked)" />
              </div>
              <div style="flex:1 1 auto; min-width:0">
                <NotificationListItem
                  :avatar="item.avatar"
                  :is-read="item.isRead"
                  :title="item.title"
                  :message="item.message"
                  :date="item.date"
                  :senderName="item.senderName"
                  @toggleRead="() => handleToggleRead(item)"
                  @delete="() => handleDeleteOne(item)"
                />
              </div>
            </div>
          </AListItem>
        </template>
        <template #footer>
          <div v-if="!loading && list.length === 0" style="text-align:center; color:#999">Không có thông báo</div>
        </template>
      </AList>
      <div style="display:flex; justify-content:flex-end; margin-top:12px">
        <APagination
          :current="query.page"
          :page-size="query.pageSize"
          :total="total"
          show-size-changer
          @change="handlePageChange"
          @showSizeChange="handlePageChange"
        />
      </div>
    </ASkeleton>
  </div>
</template>
