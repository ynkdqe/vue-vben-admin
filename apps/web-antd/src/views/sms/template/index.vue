<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { Button, Form, Grid, Input, Select, Space, Table, Tag, message } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';
import { fetchSmsTemplateList, type SmsTemplate } from '#/api/sms/template';
import { fetchSmsProviderList, type SmsProvider } from '#/api/sms/provider';

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

const query = reactive({ keyword: '', status: undefined as string | number | undefined, page: 1, pageSize: 10 });
const loading = ref(false);
const dataSource = ref<SmsTemplate[]>([]);
const total = ref(0);
const providerMap = ref<Record<string, string>>({});

const columns: TableColumnsType = [
  { title: '#', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Mã', dataIndex: 'code', key: 'code', width: 140 },
  { title: 'Tên', dataIndex: 'name', key: 'name', width: 220 },
  { title: 'Provider', dataIndex: 'smsProviderId', key: 'smsProviderId', width: 120 },
  { title: 'Nội dung', dataIndex: 'template', key: 'template', ellipsis: true },
  { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', width: 140 },
];

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchSmsTemplateList({
      keyword: query.keyword?.trim() || undefined,
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });
    dataSource.value = res.items;
    total.value = res.total;
  } catch (err: any) {
    message.error(err?.message || 'Không tải được danh sách template');
  } finally {
    loading.value = false;
  }
}

async function loadProviders() {
  try {
    const res = await fetchSmsProviderList({ page: 1, pageSize: 1000 });
    const mapEntries = res.items.map((p: SmsProvider) => [String(p.id), p.name || String(p.id)] as const);
    providerMap.value = Object.fromEntries(mapEntries);
  } catch (err: any) {
    // Không chặn trang nếu lỗi; chỉ thiếu tên provider
    console.warn('Load providers failed:', err?.message || err);
  }
}

function handleSearch() { query.page = 1; loadData(); }
function handleReset() { query.keyword = ''; query.status = undefined; query.page = 1; query.pageSize = 10; loadData(); }

onMounted(() => { loadProviders(); loadData(); });
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
            <ASelectOption value="true">Hoạt động</ASelectOption>
            <ASelectOption value="false">Ngừng</ASelectOption>
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
        <template v-if="column.key === 'smsProviderId'">
          {{ providerMap[String(text)] || text }}
        </template>
        <template v-if="column.key === 'isActive'">
          <ATag :color="text ? 'success' : 'default'">{{ text ? 'Hoạt động' : 'Ngừng' }}</ATag>
        </template>
      </template>
    </ATable>
  </div>
</template>
