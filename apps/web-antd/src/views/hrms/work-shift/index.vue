<script lang="ts" setup>
import { ref, reactive, onMounted, h } from 'vue';
import { Button, Card, Form, Input, Space, Table, Tag, message } from 'ant-design-vue';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { getWorkShifts, getWorkShiftById, deleteWorkShift, type WorkShift } from '#/api/hrms/workshift';
import { Modal } from 'ant-design-vue';
import WorkShiftForm from './components/WorkShiftForm.vue';

const AButton = Button;
const ACard = Card;
const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
const ASpace = Space;
const ATable = Table;
const ATag = Tag;
const AModal = Modal;

const query = reactive({ keyword: '' });
const loading = ref(false);
const dataSource = ref<WorkShift[]>([]);
const showCreateDrawer = ref(false);
const editingInitial = ref<any>(null);

const pagination = reactive({ current: 1, pageSize: 10, total: 0 });

async function loadWorkShifts() {
  loading.value = true;
  try {
    const items = await getWorkShifts({ filter: query.keyword.trim() || undefined });
    dataSource.value = items;
    pagination.total = items.length;
  } catch (err: any) {
    message.error(err?.message ?? 'Failed to load work shifts');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.current = 1;
  loadWorkShifts();
}

function handleAdd() {
  editingInitial.value = null;
  showCreateDrawer.value = true;
}

async function handleEdit(id: number) {
  try {
    const res = await getWorkShiftById(id);
    const item = res?.data ?? res;
    editingInitial.value = item;
    showCreateDrawer.value = true;
  } catch (err: any) {
    message.error(err?.message ?? 'Failed to load work shift');
  }
}

async function handleDelete(id: number) {
  AModal.confirm({
    title: 'Xác nhận xóa',
    content: 'Bạn chắc chắn muốn xóa ca làm việc này?',
    okText: 'Xóa',
    cancelText: 'Hủy',
    async onOk() {
      try {
        await deleteWorkShift(id);
        message.success('Xóa thành công');
        loadWorkShifts();
      } catch (err: any) {
        message.error(err?.message ?? 'Xóa thất bại');
      }
    },
  });
}

onMounted(() => {
  loadWorkShifts();
});

const columns: any[] = [
  { title: '#', dataIndex: 'id', key: 'id' },
  { title: 'Mã', dataIndex: 'code', key: 'code' },
  { title: 'Tên', dataIndex: 'name', key: 'name' },
  { title: 'Từ', dataIndex: 'fromTime', key: 'fromTime' },
  { title: 'Đến', dataIndex: 'toTime', key: 'toTime' },
  {
    title: 'Qua ca',
    dataIndex: 'overShift',
    key: 'overShift',
    customRender: ({ record }: any) =>
      record.overShift ? h(ATag, { color: 'green' }, () => 'Yes') : h(ATag, { color: 'red' }, () => 'No'),
  },
  {
    title: 'Có break',
    dataIndex: 'hasBreak',
    key: 'hasBreak',
    customRender: ({ record }: any) =>
      record.hasBreak ? h(ATag, { color: 'green' }, () => 'Yes') : h(ATag, { color: 'red' }, () => 'No'),
  },
  {
    title: 'Action',
    key: 'action',
    width: 140,
    align: 'center',
    customRender: ({ record }: any) => {
      return h('div', { style: { width: '100%', textAlign: 'center' } }, [
        h(ASpace, null, {
          default: () => [
            h(
              AButton,
              {
                type: 'text',
                onClick: () => handleEdit(record.id),
                title: 'Sửa',
              },
              { default: () => h(EditOutlined, { style: { color: '#1677ff' } }) },
            ),
            h(
              AButton,
              {
                type: 'text',
                onClick: () => handleDelete(record.id),
                title: 'Xóa',
              },
              { default: () => h(DeleteOutlined, { style: { color: '#ff4d4f' } }) },
            ),
          ],
        }),
      ]);
    },
  },
];
</script>

<template>
  <div class="space-y-4 p-4">
    <ACard class="shadow-sm">
      <AForm :layout="'inline'" :model="query" @submit.prevent>
        <AFormItem>
          <AInput v-model:value="query.keyword" placeholder="Tìm theo tên, mã..." allow-clear @press-enter="handleSearch" />
        </AFormItem>
        <AFormItem>
          <ASpace>
            <AButton type="primary" @click="handleSearch">Tìm kiếm</AButton>
            <AButton @click="handleAdd">Thêm Ca Làm việc</AButton>
          </ASpace>
        </AFormItem>
      </AForm>
    </ACard>

    <ACard class="shadow-sm">
      <ATable :columns="columns" :data-source="dataSource" :loading="loading" :pagination="pagination" row-key="id" />
    </ACard>
    <WorkShiftForm v-model:open="showCreateDrawer" :initial="editingInitial" @saved="loadWorkShifts" />
  </div>
</template>
