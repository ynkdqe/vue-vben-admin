<script setup lang="ts">
import { Avatar, Badge, Button, Space, Tag } from 'ant-design-vue';

const AAvatar = Avatar;
const ABadge = Badge;
const AButton = Button;
const ASpace = Space;
const ATag = Tag;

type Props = {
  avatar?: string;
  isRead?: boolean;
  title?: string;
  message?: string;
  date?: string;
  fromUserName?: string;
};

withDefaults(defineProps<Props>(), {
  isRead: true,
});

const emit = defineEmits<{
  (e: 'toggleRead'): void;
  (e: 'delete'): void;
  (e: 'select', checked: boolean): void;
}>();
</script>

<template>
  <div style="display:flex; gap:12px; align-items:flex-start; width:100%">
    <ABadge :dot="!isRead">
      <AAvatar :src="avatar" shape="circle">
        {{ title?.charAt(0) ?? 'N' }}
      </AAvatar>
    </ABadge>
    <div style="flex:1 1 auto; min-width:0">
      <div style="font-weight:600; word-break:break-word; white-space:normal; line-height:1.3;">
        {{ title }}
      </div>
      <div style="color:#999; font-size:12px; margin-top:4px;">{{ date }}</div>
      <div style="margin:4px 0 6px; color:#666; font-size:12px">
        <ATag color="blue">Người gửi: {{ fromUserName || '—' }}</ATag>
      </div>
      <div style="color:#555; white-space:pre-wrap">{{ message }}</div>
      <div style="margin-top:8px">
        <ASpace size="small">
          <AButton size="small" type="default" @click="() => emit('toggleRead')">
            {{ isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc' }}
          </AButton>
          <AButton size="small" danger type="default" @click="() => emit('delete')">Xóa</AButton>
        </ASpace>
      </div>
    </div>
  </div>
</template>
