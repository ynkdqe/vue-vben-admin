<script setup lang="ts">
import type { ContractFormModel } from '../models/contract-models';

import { Divider, Form, InputNumber } from 'ant-design-vue';
import { useI18n } from '@vben/locales';

const props = defineProps<{
  form: Partial<ContractFormModel> & Record<string, any>;
  numberFormatter: (v: any) => string;
  numberParser: (v: any) => any;
}>();
const emit = defineEmits<{
  (e: 'update:form', v: Partial<ContractFormModel> & Record<string, any>): void;
}>();
const { t } = useI18n();
function updateField(field: string, value: any) {
  const copy = { ...props.form } as Record<string, any>;
  copy[field] = value;
  emit('update:form', copy as any);
}

const AFormItem = Form.Item;
const AInputNumber = InputNumber;
const ADivider = Divider;
</script>

<template>
  <div>
    <ADivider orientation="left">{{ t('page.contract.form.businessCosts.title') }}</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem :label="t('page.contract.form.businessCosts.businessSocial')">
        <AInputNumber
          :value="props.form.businessSocialInsuranceFee"
          @change="(v) => updateField('businessSocialInsuranceFee', v)"
          :min="0"
          style="width: 100%"
          :formatter="props.numberFormatter"
          :parser="props.numberParser"
        />
      </AFormItem>
      <AFormItem :label="t('page.contract.form.businessCosts.businessOccAcc')">
        <AInputNumber
          :value="props.form.businessCalculateOccAccInsuranceFee"
          @change="(v) => updateField('businessCalculateOccAccInsuranceFee', v)"
          :min="0"
          style="width: 100%"
          :formatter="props.numberFormatter"
          :parser="props.numberParser"
        />
      </AFormItem>
      <AFormItem :label="t('page.contract.form.businessCosts.businessHealth')">
        <AInputNumber
          :value="props.form.businessHealthInsuranceFee"
          @change="(v) => updateField('businessHealthInsuranceFee', v)"
          :min="0"
          style="width: 100%"
          :formatter="props.numberFormatter"
          :parser="props.numberParser"
        />
      </AFormItem>
      <AFormItem :label="t('page.contract.form.businessCosts.businessUnemployment')">
        <AInputNumber
          :value="props.form.businessUnemploymentInsuranceFee"
          @change="(v) => updateField('businessUnemploymentInsuranceFee', v)"
          :min="0"
          style="width: 100%"
          :formatter="props.numberFormatter"
          :parser="props.numberParser"
        />
      </AFormItem>
      <AFormItem :label="t('page.contract.form.businessCosts.totalCost')">
        <AInputNumber
          :value="props.form.totalCost"
          @change="(v) => updateField('totalCost', v)"
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
