<script setup lang="ts">
import type { ContractFormModel } from '../models/contract-models';

import { Divider, Form, InputNumber } from 'ant-design-vue';

const props = defineProps<{
  form: Partial<ContractFormModel> & Record<string, any>;
  numberFormatter: (v: any) => string;
  numberParser: (v: any) => any;
}>();
const AFormItem = Form.Item;
const AInputNumber = InputNumber;
const ADivider = Divider;
</script>

<template>
  <div>
    <ADivider orientation="left">Chi phí doanh nghiệp</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem label="BHXH">
        <AInputNumber
          v-model:value="props.form.cSocialInsuranceFee"
          :min="0"
          style="width: 100%"
          :formatter="props.numberFormatter"
          :parser="props.numberParser"
        />
      </AFormItem>
      <AFormItem label="TNLĐ-BNN">
        <AInputNumber
          v-model:value="props.form.cCalculateOccAccInsuranceFee"
          :min="0"
          style="width: 100%"
          :formatter="props.numberFormatter"
          :parser="props.numberParser"
        />
      </AFormItem>
      <AFormItem label="BHYT">
        <AInputNumber
          v-model:value="props.form.cHealthInsuranceFee"
          :min="0"
          style="width: 100%"
          :formatter="props.numberFormatter"
          :parser="props.numberParser"
        />
      </AFormItem>
      <AFormItem label="BHTN">
        <AInputNumber
          v-model:value="props.form.cUnemploymentInsuranceFee"
          :min="0"
          style="width: 100%"
          :formatter="props.numberFormatter"
          :parser="props.numberParser"
        />
      </AFormItem>
      <AFormItem label="Tổng chi phí">
        <AInputNumber
          v-model:value="props.form.totalCost"
          :min="0"
          style="width: 100%"
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
