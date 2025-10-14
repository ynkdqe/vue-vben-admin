<script setup lang="ts">
import dayjs from 'dayjs';
import { Form, InputNumber, Divider, Input } from 'ant-design-vue';

import EmployeeSearchSelect from '#/components/EmployeeSearchSelect.vue';

const AFormItem = Form.Item;
const AInput = Input;
const AInputNumber = InputNumber;
const ADivider = Divider;

import type { ContractFormModel } from '../models/contract-models';
const props = defineProps<{
  form: Partial<ContractFormModel> & Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'change', v: any, opt?: any): void;
  (e: 'update:model-value', v: any): void;
}>();
</script>

<template>
  <div>
    <ADivider orientation="left">Thông tin nhân viên</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem label="Nhân viên" name="employeeId">
        <EmployeeSearchSelect
          mode="single"
          :model-value="props.form.employeeId as any"
          placeholder="Chọn nhân viên"
          @change="(v, opt) => emit('change', v, opt)"
          @update:model-value="(v: any) => emit('update:model-value', v)"
        />
      </AFormItem>

      <AFormItem label="Số điện thoại">
        <AInput :value="props.form.phone" readonly />
      </AFormItem>
      <AFormItem label="Email">
        <AInput :value="props.form.email" readonly />
      </AFormItem>
      <AFormItem label="CMND/CCCD">
        <AInput :value="props.form.identification" readonly />
      </AFormItem>
      <AFormItem label="Ngày sinh">
        <AInput
          :value="props.form.birthDate ? dayjs(props.form.birthDate).format('DD-MM-YYYY') : ''"
          readonly
        />
      </AFormItem>
      <AFormItem label="Mã số thuế">
        <AInputNumber v-model:value="props.form.tax" class="w-full" :min="0" />
      </AFormItem>
    </div>
  </div>
</template>

<style scoped>
.grid { width: 100%; }
</style>
