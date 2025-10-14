<script setup lang="ts">
import { reactive } from 'vue';

import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Switch,
} from 'ant-design-vue';

const emit = defineEmits<{
  (e: 'submit', payload: Record<string, any>): void;
  (e: 'cancel'): void;
}>();
const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
const ASwitch = Switch;
const AInputNumber = InputNumber;
const AButton = Button;
const ADivider = Divider;

const model = reactive({
  name: '',
  code: '',
  contractDurations: [] as Array<{ id?: number | null; name: string; duration: number }>,
  extraProperties: {} as Record<string, any>,
  hasSocialInsurance: true,
  isTaxFixed: false,
  taxPercent: 0,
  employeeSocialInsurancePercent: 8,
  employeeHealthInsurancePercent: 1.5,
  employeeUnemployeeInsurancePercent: 1,
  employeeUnionPercent: 1,
  employeeMinTaxSalary: 0,
  businessSocialInsurancePercent: 17.5,
  businessHealthInsurancePercent: 3,
  businessOccAccInsurancePercent: 0.5,
  businessUnemploymentInsurancePercent: 1,
  minInsuranceSalary: 0,
});

function addDuration() {
  model.contractDurations.push({ id: null, name: '', duration: 1 });
}

function removeDuration(index: number) {
  model.contractDurations.splice(index, 1);
}

function onSubmit() {
  // Ensure extraProperties.durations is populated from contractDurations
  try {
    const durs = Array.isArray(model.contractDurations)
      ? model.contractDurations.map((d) => ({ name: d.name, duration: Number(d.duration) }))
      : [];
    model.extraProperties = { ...(model.extraProperties || {}), durations: durs };
  } catch (e) {
    // ignore mapping errors
  }
  emit('submit', { ...model });
}
function onCancel() {
  emit('cancel');
}

function numberFormatter(v: any) {
  if (v === null || v === undefined || v === '') return '';
  const n = Number(v);
  if (Number.isNaN(n)) return '';
  return n.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function numberParser(v: any) {
  return v ? String(v).replaceAll(',', '') : v;
}
</script>

<template>
  <AForm layout="vertical" class="mx-auto w-full max-w-[1100px] p-4 pb-20">
    <AFormItem label="Tên loại hợp đồng" name="name" required>
      <AInput v-model:value="model.name" placeholder="Tên loại hợp đồng" />
    </AFormItem>

    <AFormItem label="Mã" name="code">
      <AInput v-model:value="model.code" placeholder="Mã" />
    </AFormItem>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <AFormItem label="Thuế cố định" name="isTaxFixed">
        <ASwitch v-model:checked="model.isTaxFixed" />
      </AFormItem>

      <AFormItem label="Thuế (%)" name="taxPercent">
        <AInputNumber
          v-model:value="model.taxPercent"
          :disabled="!model.isTaxFixed"
          class="w-full"
        />
      </AFormItem>
    </div>

    <ADivider orientation="left">Các khoản NLĐ</ADivider>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <AFormItem label="Bảo hiểm xã hội" name="hasSocialInsurance">
        <ASwitch v-model:checked="model.hasSocialInsurance" />
      </AFormItem>

      <AFormItem label="BH Xã hội (%)" name="employeeSocialInsurancePercent">
        <AInputNumber
          v-model:value="model.employeeSocialInsurancePercent"
          :disabled="!model.hasSocialInsurance"
          class="w-full"
        />
      </AFormItem>

      <AFormItem label="BH Y Tế (%)" name="employeeHealthInsurancePercent">
        <AInputNumber
          v-model:value="model.employeeHealthInsurancePercent"
          :disabled="!model.hasSocialInsurance"
          class="w-full"
        />
      </AFormItem>

      <AFormItem
        label="BH Thất nghiệp (%)"
        name="employeeUnemployeeInsurancePercent"
      >
        <AInputNumber
          v-model:value="model.employeeUnemployeeInsurancePercent"
          :disabled="!model.hasSocialInsurance"
          class="w-full"
        />
      </AFormItem>

      <AFormItem label="Công đoàn (%)" name="employeeUnionPercent">
        <AInputNumber
          v-model:value="model.employeeUnionPercent"
          :disabled="!model.hasSocialInsurance"
          class="w-full"
        />
      </AFormItem>

      <AFormItem label="Lương tính thuế" name="employeeMinTaxSalary">
        <AInputNumber
          v-model:value="model.employeeMinTaxSalary"
          :disabled="!model.hasSocialInsurance"
          :formatter="numberFormatter"
          :parser="numberParser"
          class="w-full"
        />
      </AFormItem>
    </div>

    <ADivider orientation="left">Các khoản Doanh nghiệp</ADivider>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <AFormItem label="BH Xã hội (%)" name="businessSocialInsurancePercent">
        <AInputNumber
          v-model:value="model.businessSocialInsurancePercent"
          :disabled="!model.hasSocialInsurance"
          class="w-full"
        />
      </AFormItem>

      <AFormItem label="BH Y Tế (%)" name="businessHealthInsurancePercent">
        <AInputNumber
          v-model:value="model.businessHealthInsurancePercent"
          :disabled="!model.hasSocialInsurance"
          class="w-full"
        />
      </AFormItem>

      <AFormItem
        label="BH Thất nghiệp (%)"
        name="businessUnemploymentInsurancePercent"
      >
        <AInputNumber
          v-model:value="model.businessUnemploymentInsurancePercent"
          :disabled="!model.hasSocialInsurance"
          class="w-full"
        />
      </AFormItem>

      <AFormItem label="BH TNLĐ (%)" name="businessOccAccInsurancePercent">
        <AInputNumber
          v-model:value="model.businessOccAccInsurancePercent"
          :disabled="!model.hasSocialInsurance"
          class="w-full"
        />
      </AFormItem>

      <AFormItem label="Lương BH tối thiểu" name="minInsuranceSalary">
        <AInputNumber
          v-model:value="model.minInsuranceSalary"
          :disabled="!model.hasSocialInsurance"
          :formatter="numberFormatter"
          :parser="numberParser"
          class="w-full"
        />
      </AFormItem>
    </div>

    <ADivider orientation="left">Thời hạn</ADivider>
    <AFormItem>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-1">
        <div v-for="(d, idx) in model.contractDurations" :key="idx" class="flex gap-2 items-center">
          <AInput v-model:value="d.name" placeholder="Tên duration" class="flex-[3]" />
          <AInputNumber v-model:value="d.duration" :min="1" style="width:80px" />
          <AButton type="link" danger @click="() => removeDuration(idx)">Xóa</AButton>
        </div>
        <AButton type="dashed" @click="addDuration">Thêm thời hạn</AButton>
      </div>
    </AFormItem>

    <div class="form-actions mt-3 flex justify-end gap-2">
      <AButton @click="onCancel">Hủy</AButton>
      <AButton type="primary" @click="onSubmit">Lưu</AButton>
    </div>
  </AForm>
</template>

<style scoped>
.form-actions {
  position: sticky;
  bottom: 0;
  background: var(--ant-bg-layout, #fff);
  padding: 12px 0;
  z-index: 10000;
}
</style>
