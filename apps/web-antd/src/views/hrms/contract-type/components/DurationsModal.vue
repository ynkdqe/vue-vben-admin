<script lang="ts" setup>
import { ref, watch, toRefs } from 'vue';
import { Modal, Input, InputNumber, Button, message } from 'ant-design-vue';
const AModal = Modal;
const AInput = Input;
const AInputNumber = InputNumber;
const AButton = Button;
import { requestClient } from '#/api/request';

const props = defineProps<{ open: boolean; record?: any }>();
const { open } = toRefs(props);
const emit = defineEmits(['update:open', 'saved']);

const durations = ref<Array<{ name: string; duration: number }>>([]);
const loading = ref(false);
const contractTypeId = ref<number | string | null>(null);

async function loadDurationsFromRecordOrFetch() {
  contractTypeId.value = props.record?.id ?? null;
  const maybeDurations =
    props.record?.durations ?? props.record?.extraProperties?.durations ?? props.record?.contractDurations ?? [];
  durations.value = Array.isArray(maybeDurations)
    ? maybeDurations.map((d: any) => ({ name: d?.name ?? '', duration: typeof d?.duration === 'number' ? d.duration : 0 }))
    : [];

  if (!durations.value.length && contractTypeId.value) {
    try {
      const res = await requestClient.get<any>(`/api/hrms/contract-type/${contractTypeId.value}`, {
        responseReturn: 'body',
      });
      const data = res?.data ?? res;
      const remote = data?.items?.[0] ?? data ?? res;
      const fetchedDurations =
        remote?.durations ?? remote?.extraProperties?.durations ?? remote?.contractDurations ?? [];
      durations.value = Array.isArray(fetchedDurations)
        ? fetchedDurations.map((d: any) => ({ name: d?.name ?? '', duration: typeof d?.duration === 'number' ? d.duration : 0 }))
        : [];
    } catch (e) {
      durations.value = [];
    }
  }
}

watch(open, (v) => {
  if (v) loadDurationsFromRecordOrFetch();
});

function addRow() {
  durations.value.push({ name: '', duration: 1 });
}

function removeRow(idx: number) {
  durations.value.splice(idx, 1);
}

async function save() {
  if (!contractTypeId.value) {
    message.error('Không xác định loại hợp đồng');
    return;
  }
  loading.value = true;
  try {
  const normalized = durations.value.map((d) => ({ name: d?.name ?? null, duration: d?.duration ?? null }));
  // Backend expects an object with key 'durations'
  const payload = { durations: normalized };
  await requestClient.put(`/api/hrms/contract-type/update-duration/${contractTypeId.value}`, payload, { responseReturn: 'body' });
    message.success('Lưu durations thành công');
    emit('saved');
    emit('update:open', false);
  } catch (e) {
    message.error('Lưu durations thất bại');
  } finally {
    loading.value = false;
  }
}

function close() {
  emit('update:open', false);
}
</script>

<template>
  <AModal
    :open="open"
    title="Contract Durations"
    :width="800"
    :confirmLoading="loading"
    @ok="save"
    @cancel="close"
  >
    <div>
      <AButton type="primary" @click="addRow">Thêm dòng</AButton>
      <div class="mt-3">
        <table class="min-w-full text-left">
          <thead>
            <tr>
              <th class="pr-4">#</th>
              <th class="pr-4">Tên</th>
              <th class="pr-4">Duration (tháng)</th>
              <th class="pr-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, idx) in durations" :key="idx">
              <td>{{ idx + 1 }}</td>
              <td>
                            <AInput v-model:value="d.name" />
              </td>
              <td>
                <AInputNumber v-model:value="d.duration" :min="0" />
              </td>
              <td>
                <AButton type="link" danger @click="() => removeRow(idx)">Xóa</AButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AModal>
</template>

<style scoped>
.mt-3 {
  margin-top: 0.75rem;
}
</style>
