<script setup lang="ts">
import type { ContractFormModel } from '../models/contract-models';

import { Divider, Form, Input, Select } from 'ant-design-vue';

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
function updateField(field: string, value: any) {
  const copy = { ...props.form } as Record<string, any>;
  copy[field] = value;
  emit('update:form', copy as any);
}
</script>

<template>
  <div>
    <ADivider orientation="left">Trạng thái & Phê duyệt</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem label="Trạng thái">
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
      <AFormItem label="Người kiểm tra (Checkers)">
        <EmployeeSearchSelect
          mode="multiple"
          :model-value="props.form.checkers as any"
          placeholder="Chọn người kiểm tra"
          @update:model-value="(v: any) => updateField('checkers', v)"
        />
      </AFormItem>
      <AFormItem label="Người duyệt (Approver)">
        <EmployeeSearchSelect
          mode="single"
          :model-value="props.form.approver as any"
          placeholder="Chọn người duyệt"
          @update:model-value="(v: any) => updateField('approver', v)"
        />
      </AFormItem>
      <AFormItem class="md:col-span-3" label="Ghi chú">
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
