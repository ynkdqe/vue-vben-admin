<script setup lang="ts">
import type { ContractFormModel } from '../models/contract-models';

import { Divider, Form, Input, InputNumber } from 'ant-design-vue';

const props = defineProps<{
  form: Partial<ContractFormModel> & Record<string, any>;
  numberFormatter: (v: any) => string;
  numberParser: (v: any) => any;
}>();
const emit = defineEmits<{
  (e: 'update:form', v: Partial<ContractFormModel> & Record<string, any>): void;
}>();
const AFormItem = Form.Item;
const AInputNumber = InputNumber;
const AInputGroup = Input.Group;
const ADivider = Divider;

function updateField(field: string, value: any) {
  const copy = { ...props.form } as Record<string, any>;
  copy[field] = value;
  emit('update:form', copy as any);
}
</script>

<template>
  <div>
    <ADivider orientation="left">Thông tin Lương</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem label="Lương cơ bản">
        <AInputNumber
          :value="props.form.basicSalary"
          @change="(v) => updateField('basicSalary', v)"
          :min="0"
          class="w-full"
          :formatter="props.numberFormatter"
          :parser="props.numberParser"
        />
      </AFormItem>
      <AFormItem label="KPI & Phụ cấp">
        <AInputGroup compact>
          <AInputNumber
            :value="props.form.allowance"
            @change="(v) => updateField('allowance', v)"
            :min="0"
            class="w-1/2"
            placeholder="KPI"
            :formatter="props.numberFormatter"
            :parser="props.numberParser"
          />
          <AInputNumber
            :value="props.form.kpi"
            @change="(v) => updateField('kpi', v)"
            :min="0"
            class="w-1/2"
            placeholder="Phụ cấp"
            :formatter="props.numberFormatter"
            :parser="props.numberParser"
          />
        </AInputGroup>
      </AFormItem>
      <AFormItem label="Lương gross">
        <AInputNumber
          :value="props.form.salaryGross"
          @change="(v) => updateField('salaryGross', v)"
          :min="0"
          class="w-full"
          :formatter="props.numberFormatter"
          :parser="props.numberParser"
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
