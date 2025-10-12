<script setup lang="ts">
import { Form, InputNumber, Input, Divider } from 'ant-design-vue';

const AFormItem = Form.Item;
const AInputNumber = InputNumber;
const AInputGroup = Input.Group;
const ADivider = Divider;

import type { ContractFormModel } from '../models/contract-models';
const props = defineProps<{
  form: Partial<ContractFormModel> & Record<string, any>;
  numberFormatter: (v: any) => string;
  numberParser: (v: any) => any;
}>();
</script>

<template>
  <div>
    <ADivider orientation="left">Thông tin Lương</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem label="Lương cơ bản">
        <AInputNumber
          v-model:value="props.form.basicSalary"
          :min="0"
          class="w-full"
          :formatter="props.numberFormatter"
          :parser="props.numberParser"
        />
      </AFormItem>
      <AFormItem label="KPI & Phụ cấp">
        <AInputGroup compact>
          <AInputNumber
            v-model:value="props.form.allowance"
            :min="0"
            class="w-1/2"
            placeholder="KPI"
            :formatter="props.numberFormatter"
            :parser="props.numberParser"
          />
          <AInputNumber
            v-model:value="props.form.kpi"
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
          v-model:value="props.form.salaryGross"
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
.grid { width: 100%; }
</style>
