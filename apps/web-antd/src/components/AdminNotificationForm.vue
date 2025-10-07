<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { Col, Form, Input, Row, Select, Switch } from 'ant-design-vue';

import UserSearchSelect from '#/components/UserSearchSelect.vue';

type NotificationType = 0 | 1; // 0: Private, 1: Public

const props = defineProps<{
  modelValue: {
    icon?: string;
    isSystem: boolean;
    message: string;
    recipientIds: string[];
    senderId?: string;
    title: string;
    type: NotificationType;
    url?: string;
  };
}>();
const emit = defineEmits<{ (e: 'update:modelValue', v: any): void }>();
const AForm = Form;
const AFormItem = Form.Item;
const ASwitch = Switch;
const ARow = Row;
const ACol = Col;
const AInput = Input;
const ASelect = Select;
const ASelectOption = Select.Option;
const inner = reactive({ ...props.modelValue });
watch(
  () => props.modelValue,
  (v) => Object.assign(inner, v || {}),
  { deep: true },
);

watch(inner, (v) => emit('update:modelValue', { ...v }), { deep: true });

const formRef = ref();
const rules = {
  title: [{ required: true, message: 'Vui lòng nhập tiêu đề' }],
  message: [{ required: true, message: 'Vui lòng nhập nội dung' }],
};

const disableSender = computed(() => inner.isSystem === true);
const disableRecipients = computed(() => inner.type === 1);

watch(
  () => inner.isSystem,
  (v) => {
    if (v) inner.senderId = undefined;
  },
);

watch(
  () => inner.type,
  (v) => {
    if (v === 1) inner.recipientIds = [];
  },
);

defineExpose({
  validate: () => formRef.value?.validate?.(),
});
</script>

<template>
  <AForm ref="formRef" :model="inner" :rules="rules" layout="vertical">
    <!-- Row: System checkbox + Type -->
    <ARow :gutter="16">
      <ACol :span="12">
        <AFormItem label="Hệ thống">
          <ASwitch v-model:checked="inner.isSystem" />
        </AFormItem>
      </ACol>
      <ACol :span="12">
        <AFormItem label="Loại thông báo">
          <ASelect v-model:value="inner.type">
            <ASelectOption :value="0">Private</ASelectOption>
            <ASelectOption :value="1">Public</ASelectOption>
          </ASelect>
        </AFormItem>
      </ACol>
    </ARow>

    <!-- Row: Sender + Recipients -->
    <ARow :gutter="16">
      <ACol :span="24">
        <AFormItem label="Người gửi">
          <UserSearchSelect
            v-model="inner.senderId"
            :disabled="disableSender"
            placeholder="Chọn người gửi"
          />
        </AFormItem>
      </ACol>
      <ACol :span="24">
        <AFormItem label="Người nhận">
          <UserSearchSelect
            v-model="inner.recipientIds"
            mode="multiple"
            :disabled="disableRecipients"
            placeholder="Chọn người nhận"
          />
        </AFormItem>
      </ACol>
    </ARow>

    <!-- Row: Title -->
    <ARow :gutter="16">
      <ACol :span="24">
        <AFormItem label="Title" name="title">
          <AInput v-model:value="inner.title" placeholder="Nhập tiêu đề" />
        </AFormItem>
      </ACol>
    </ARow>

    <!-- Row: Message -->
    <ARow :gutter="16">
      <ACol :span="24">
        <AFormItem label="Message" name="message">
          <AInput.TextArea
            v-model:value="inner.message"
            placeholder="Nhập nội dung"
            :rows="4"
          />
        </AFormItem>
      </ACol>
    </ARow>

    <!-- Row: Icon + Url on same line -->
    <ARow :gutter="16">
      <ACol :span="12">
        <AFormItem label="Icon">
          <AInput v-model:value="inner.icon" placeholder="Ví dụ: mdi:bell" />
        </AFormItem>
      </ACol>
      <ACol :span="12">
        <AFormItem label="Url">
          <AInput v-model:value="inner.url" placeholder="Ví dụ: /dashboard" />
        </AFormItem>
      </ACol>
    </ARow>
  </AForm>
</template>
