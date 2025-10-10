<script lang="ts" setup>
import type { TableColumnsType } from 'ant-design-vue';

import type { SmsMessage } from '#/api/sms/message';

import { computed, onMounted, reactive, ref, watch } from 'vue';

import { formatDate } from '@vben/utils';

import {
  Button,
  Form,
  Grid,
  Input,
  message,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import { fetchSmsMessageList } from '#/api/sms/message';
import { fetchSmsProviderList } from '#/api/sms/provider';
import { fetchSmsTemplateList } from '#/api/sms/template';

import SendSmsForm from './components/SendSmsForm.vue';

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
  smsProviderId: undefined as number | string | undefined,
  smsTemplateId: undefined as number | string | undefined,
  page: 1,
  pageSize: 20,
});

const loading = ref(false);
const dataSource = ref<SmsMessage[]>([]);
const total = ref(0);
const sendFormVisible = ref(false);

const providerMap = ref<Record<string, string>>({});
const templateMap = ref<Record<string, string>>({});

const columns: TableColumnsType = [
  { title: '#', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'RequestId', dataIndex: 'requestId', key: 'requestId', width: 260 },
  {
    title: 'Provider',
    dataIndex: 'smsProviderId',
    key: 'smsProviderId',
    width: 160,
  },
  {
    title: 'Template',
    dataIndex: 'smsTemplateId',
    key: 'smsTemplateId',
    width: 160,
  },
  { title: 'Phone', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 140 },
  { title: 'Message', dataIndex: 'message', key: 'message', ellipsis: true },
  { title: 'Status', dataIndex: 'status', key: 'status', width: 120 },
  {
    title: 'Thời gian gửi',
    dataIndex: 'sendedTime',
    key: 'sendedTime',
    width: 180,
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'creationTime',
    key: 'creationTime',
    width: 180,
  },
];

async function loadProviders() {
  try {
    const res = await fetchSmsProviderList({ page: 1, pageSize: 1000 });
    providerMap.value = Object.fromEntries(
      res.items.map((p) => [String(p.id), p.name || String(p.id)]),
    );
  } catch (error) {
    console.warn('Failed to load providers', error);
  }
}

async function loadTemplates() {
  try {
    const res = await fetchSmsTemplateList({ page: 1, pageSize: 1000 });
    templateMap.value = Object.fromEntries(
      res.items.map((t) => [String(t.id), t.name || String(t.id)]),
    );
  } catch (error) {
    console.warn('Failed to load templates', error);
  }
}

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchSmsMessageList({
      keyword: query.keyword?.trim() || undefined,
      status: query.status,
      smsProviderId: query.smsProviderId,
      smsTemplateId: query.smsTemplateId,
      page: query.page,
      pageSize: query.pageSize,
    });
    dataSource.value = res.items;
    total.value = res.total;
  } catch (error: any) {
    message.error(error?.message || 'Không tải được danh sách message');
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
  query.smsProviderId = undefined;
  query.smsTemplateId = undefined;
  query.page = 1;
  query.pageSize = 20;
  loadData();
}

onMounted(() => {
  loadProviders();
  loadTemplates();
  loadData();
});
watch(
  () => [query.page, query.pageSize],
  () => loadData(),
);
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="search-card rounded-md p-4 shadow-sm">
      <AForm :layout="isMobile ? 'vertical' : 'inline'" @submit.prevent>
        <AFormItem label="Từ khóa" :style="isMobile ? { width: '100%' } : {}">
          <AInput
            v-model:value="query.keyword"
            placeholder="Tìm theo SĐT, tin nhắn..."
            allow-clear
            :style="isMobile ? { width: '100%' } : { minWidth: '260px' }"
            @press-enter="handleSearch"
          />
        </AFormItem>

        <AFormItem label="Provider" :style="isMobile ? { width: '100%' } : {}">
          <ASelect
            v-model:value="query.smsProviderId"
            allow-clear
            placeholder="Tất cả"
            :style="isMobile ? { width: '100%' } : { width: '220px' }"
          >
            <ASelectOption
              v-for="(name, id) in providerMap"
              :key="id"
              :value="id"
            >
              {{ name }}
            </ASelectOption>
          </ASelect>
        </AFormItem>

        <AFormItem label="Template" :style="isMobile ? { width: '100%' } : {}">
          <ASelect
            v-model:value="query.smsTemplateId"
            allow-clear
            placeholder="Tất cả"
            :style="isMobile ? { width: '100%' } : { width: '220px' }"
          >
            <ASelectOption
              v-for="(name, id) in templateMap"
              :key="id"
              :value="id"
            >
              {{ name }}
            </ASelectOption>
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
              @click="sendFormVisible = true"
            >
              Gửi tin nhắn
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
      <template #bodyCell="{ column, text }">
        <template v-if="column.key === 'smsProviderId'">
          {{ providerMap[String(text)] || text }}
        </template>
        <template v-else-if="column.key === 'smsTemplateId'">
          {{ templateMap[String(text)] || text }}
        </template>
        <template v-else-if="column.key === 'status'">
          <ATag :color="Number(text) === 1 ? 'success' : 'default'">
            {{ Number(text) === 1 ? 'Thành công' : 'Thất bại' }}
          </ATag>
        </template>
        <template v-else-if="column.key === 'sendedTime'">
          {{ formatDate(text, 'DD-MM-YYYY HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'creationTime'">
          {{ formatDate(text, 'DD-MM-YYYY HH:mm:ss') }}
        </template>
      </template>
    </ATable>

    <SendSmsForm
      :visible="sendFormVisible"
      @update:visible="(v) => (sendFormVisible = v)"
      @sent="loadData"
    />
  </div>
</template>
