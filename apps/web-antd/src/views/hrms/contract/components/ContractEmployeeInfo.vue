<script setup lang="ts">
import type { ContractFormModel } from '../models/contract-models';

import { Divider, Form, Input, InputNumber } from 'ant-design-vue';
import { useI18n } from '@vben/locales';
import dayjs from 'dayjs';

import EmployeeSearchSelect from '#/components/EmployeeSearchSelect.vue';

const props = defineProps<{
  form: Partial<ContractFormModel> & Record<string, any>;
}>();
const emit = defineEmits<{
  (e: 'change', v: any, opt?: any): void;
  (e: 'update:model-value', v: any): void;
  (e: 'update:form', v: Partial<ContractFormModel> & Record<string, any>): void;
}>();
const AFormItem = Form.Item;
const AInput = Input;
const AInputNumber = InputNumber;
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
    <ADivider orientation="left">{{ t('page.contract.form.employeeInfo.title') || 'Thông tin nhân viên' }}</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem :label="t('page.contract.form.employeeInfo.employee') || 'Nhân viên'" name="employeeId">
        <EmployeeSearchSelect
          mode="single"
          :model-value="props.form.employeeId as any"
          :placeholder="t('page.contract.form.employeeInfo.selectEmployee') || 'Chọn nhân viên'"
          @change="(v, opt) => emit('change', v, opt)"
          @update:model-value="(v: any) => emit('update:model-value', v)"
        />
      </AFormItem>

      <AFormItem :label="t('page.contract.form.employeeInfo.phone') || 'Số điện thoại'">
        <AInput :value="props.form.phone" readonly />
      </AFormItem>
      <AFormItem :label="t('page.contract.form.employeeInfo.email') || 'Email'">
        <AInput :value="props.form.email" readonly />
      </AFormItem>
      <AFormItem :label="t('page.contract.form.employeeInfo.identification') || 'CMND/CCCD'">
        <AInput :value="props.form.identification" readonly />
      </AFormItem>
      <AFormItem :label="t('page.contract.form.employeeInfo.birthDate') || 'Ngày sinh'">
        <AInput
          :value="
            props.form.birthDate
              ? dayjs(props.form.birthDate).format('DD-MM-YYYY')
              : ''
          "
          readonly
        />
      </AFormItem>
      <AFormItem :label="t('page.contract.form.employeeInfo.taxCode') || 'Mã số thuế'">
        <AInputNumber
          :value="props.form.tax"
          @change="(v) => updateField('tax', v)"
          class="w-full"
          :min="0"
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
