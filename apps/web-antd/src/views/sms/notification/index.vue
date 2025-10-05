<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { App as AntApp, List } from 'ant-design-vue';

// Nếu dùng alias "#/*" -> "#/services/notification-hub"
import { notificationHub } from '#/services/notification-hub';

// Local component aliases for Ant Design Vue (per-project convention)
const AList = List;
const AListItem = List.Item;

const { message } = AntApp.useApp();

const logs = ref<any[]>([]);
let off: null | (() => void) = null;

onMounted(async () => {
  // Đảm bảo đã kết nối (idempotent)
  await notificationHub.start();

  // Đăng ký handler nhận thông báo
  off = notificationHub.addHandler((data) => {
    logs.value.unshift({
      time: new Date().toISOString(),
      payload: data,
    });
    message.info('Có thông báo mới');
  });
});

onBeforeUnmount(() => {
  // Hủy đăng ký để tránh memory leak
  if (off) off();
});
</script>

<template>
  <div class="p-4 space-y-3">
    <h3 class="text-lg font-medium">Realtime notifications</h3>
    <AList :data-source="logs" bordered>
      <template #renderItem="{ item }">
        <AListItem>
          <div style="width: 100%">
            <div style="font-weight: 600">{{ item.time }}</div>
            <pre style="margin: 0">{{ JSON.stringify(item.payload, null, 2) }}</pre>
          </div>
        </AListItem>
      </template>
    </AList>
  </div>
</template>
