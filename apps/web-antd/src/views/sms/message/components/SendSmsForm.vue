<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { Modal, Form, Input, Select, message } from 'ant-design-vue';
import type { SmsTemplate } from '#/api/sms/template';
import type { SmsProvider } from '#/api/sms/provider';
import { fetchSmsTemplateList } from '#/api/sms/template';
import { fetchSmsProviderList } from '#/api/sms/provider';
import { sendSmsMessage } from '#/api/sms/message';

// Component aliases used in template
const AModal = Modal;
const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
const ASelect = Select;
const ASelectOption = Select.Option;

const props = defineProps({
  visible: { type: Boolean, required: true },
});
const emit = defineEmits(['update:visible', 'sent']);

const modalVisible = ref(false);
const loading = ref(false);
watch(() => props.visible, v => (modalVisible.value = v));

const templates = ref<SmsTemplate[]>([]);
const providers = ref<SmsProvider[]>([]);
const selectedTemplateId = ref<number | string | undefined>(undefined);
const selectedProviderId = ref<number | string | undefined>(undefined);

const form = reactive({ phoneNumber: '', smsTemplateId: undefined as number | string | undefined, smsProviderId: undefined as number | string | undefined, clientId: 'annal', data: {} as Record<string, any> });

async function loadTemplates() {
  const res = await fetchSmsTemplateList({ page: 1, pageSize: 1000 });
  templates.value = res.items;
}

async function loadProviders() {
  const res = await fetchSmsProviderList({ page: 1, pageSize: 1000 });
  providers.value = res.items;
}

onMounted(() => { loadTemplates(); loadProviders(); });

// Reset form when modal opens
watch(modalVisible, (v) => {
  if (v) {
    form.phoneNumber = '';
    form.smsTemplateId = undefined;
    form.smsProviderId = undefined;
    form.data = {} as Record<string, string>;
    selectedTemplateId.value = undefined;
    selectedProviderId.value = undefined;
  }
});

// When template changes, prepare data placeholders and set provider if present on template
watch(selectedTemplateId, (id) => {
  form.smsTemplateId = id as any;
  form.data = {};
  const t = templates.value.find(x => String(x.id) === String(id));
  // API trả về nội dung ở trường "template"; fallback sang "content" nếu cần
  const tpl: string | undefined = (t as any)?.template ?? (t as any)?.content;
  if (tpl) {
    const matches = Array.from(tpl.matchAll(/#(\d+)#/g)).map(m => m[1]);
    for (const k of matches) {
      const key = String(k);
      (form.data as Record<string, string>)[key] = '';
    }
  }
  // if template contains smsProviderId, preselect provider
  if ((t as any)?.smsProviderId) {
    selectedProviderId.value = (t as any).smsProviderId;
    form.smsProviderId = (t as any).smsProviderId;
  }
});

// Keep provider id in form if provider selection changes (read-only select may change programmatically)
watch(selectedProviderId, (v) => { form.smsProviderId = v as any; });

function close() {
  emit('update:visible', false);
}

async function handleSend() {
  loading.value = true;
  try {
    await sendSmsMessage({
      phoneNumber: form.phoneNumber,
      clientId: form.clientId,
      smsTemplateId: form.smsTemplateId as any,
      data: form.data,
    });
    message.success('Gửi tin nhắn thành công');
    emit('sent');
    close();
  } catch (err: any) {
    message.error(err?.message || 'Gửi thất bại');
  } finally {
    loading.value = false;
  }
}

// Live preview of template content with parameters applied
const templatePreview = computed(() => {
  const t = templates.value.find(x => String(x.id) === String(selectedTemplateId.value));
  const tpl: string | undefined = (t as any)?.template ?? (t as any)?.content;
  if (!tpl) return '';
  let content = tpl;
  for (const [k, v] of Object.entries(form.data)) {
    content = content.replaceAll(new RegExp(`#${k}#`, 'g'), String(v ?? ''));
  }
  return content;
});
</script>

<template>
  <AModal 
    v-model:open="modalVisible" 
    title="Gửi SMS" 
    width="600px"
    :confirm-loading="loading"
    @ok="handleSend"
    @cancel="close"
  >
    <AForm layout="vertical">
      <AFormItem label="Số điện thoại" required>
        <AInput v-model:value="form.phoneNumber" placeholder="+84..." />
      </AFormItem>

      <AFormItem label="Mẫu tin nhắn" required>
        <ASelect v-model:value="selectedTemplateId" placeholder="Chọn template">
          <ASelectOption v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }} - {{ t.code }}</ASelectOption>
        </ASelect>
      </AFormItem>

      <AFormItem label="Nhà cung cấp">
        <ASelect v-model:value="selectedProviderId" placeholder="Nhà cung cấp" disabled>
          <ASelectOption v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</ASelectOption>
        </ASelect>
      </AFormItem>

      <template v-if="Object.keys(form.data).length > 0">
        <div v-for="(_, key) in form.data" :key="key">
          <AFormItem :label="`Tham số #${key}#`" required>
            <AInput v-model:value="form.data[key]" :placeholder="`Nhập giá trị cho #${key}#`" />
          </AFormItem>
        </div>
      </template>

      <AFormItem v-if="templatePreview" label="Xem trước nội dung">
        <AInput.TextArea :value="templatePreview" :rows="4" disabled />
      </AFormItem>
    </AForm>
  </AModal>
</template>
