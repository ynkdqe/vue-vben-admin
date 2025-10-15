<script setup lang="ts">
import type { ContractFormModel } from '../models/contract-models';

import { Divider, Form, Input, Select } from 'ant-design-vue';
import { useI18n } from '@vben/locales';

import EmployeeSearchSelect from '#/components/EmployeeSearchSelect.vue';

const props = defineProps<{
  form: Partial<ContractFormModel> & Record<string, any>;
  statusOptions: Array<{ label: string; value: any }>;
}>();
const emit = defineEmits<{
  (e: 'update:form', v: Partial<ContractFormModel> & Record<string, any>): void;
}>();
const AFormItem = Form.Item;
const ASelect = Select;
const ASelectOption = Select.Option;
const AInputTextArea = Input.TextArea;
const ADivider = Divider;
const { t } = useI18n();
function updateField(field: string, value: any) {
  const copy = { ...props.form } as Record<string, any>;
  copy[field] = value;
  emit('update:form', copy as any);
}
</script>

<template>
  <div>
    <ADivider orientation="left">{{ t('page.contract.form.statusApproval.title') }}</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem :label="t('page.contract.form.status')">
        <ASelect
          :value="props.form.status"
          @change="(v) => updateField('status', v)"
          style="width: 100%"
        >
          <ASelectOption
            v-for="s in props.statusOptions"
            :key="s.value"
            :value="s.value"
          >
            {{ s.label }}
          </ASelectOption>
        </ASelect>
      </AFormItem>
      <AFormItem :label="t('page.contract.form.checkers') + ' (Checkers)'">
        <EmployeeSearchSelect
          mode="multiple"
          :model-value="props.form.checkers as any"
          :placeholder="t('page.contract.form.checkersPlaceholder')"
          @update:model-value="(v: any) => updateField('checkers', v)"
        />
      </AFormItem>
      <AFormItem :label="t('page.contract.form.approver') + ' (Approver)'">
        <EmployeeSearchSelect
          mode="single"
          :model-value="props.form.approver as any"
          :placeholder="t('page.contract.form.approverPlaceholder')"
          @update:model-value="(v: any) => updateField('approver', v)"
        />
      </AFormItem>
      <AFormItem class="md:col-span-3" :label="t('page.contract.form.notes')">
        <AInputTextArea
          :value="props.form.notes"
          @change="(v) => updateField('notes', v)"
          :rows="3"
        />
      </AFormItem>
    </div>
  </div>
</template>

<style scoped>
.grid {
  width: 100%;
}
</style>
