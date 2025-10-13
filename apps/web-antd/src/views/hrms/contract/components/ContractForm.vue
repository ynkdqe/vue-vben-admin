<script setup lang="ts">
import type { Dayjs } from 'dayjs';

import type { ContractFormModel, Id } from '../models/contract-models';

import { computed, reactive, ref, watch } from 'vue';

import { Button, DatePicker, Form, Select, Space } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestClient } from '#/api/request';
import {
  calculateEHealthInsuranceFee,
  calculateESocialInsuranceFee,
  calculateEUnemployeeInsuranceFee,
  calculateTaxFee,
} from '#/utils/salary-utils';

import ContractEmployeeCosts from './ContractEmployeeCosts.vue';
import ContractEmployeeInfo from './ContractEmployeeInfo.vue';
import ContractEmployerCosts from './ContractEmployerCosts.vue';
import ContractSalaryInfo from './ContractSalaryInfo.vue';
import ContractStatusApproval from './ContractStatusApproval.vue';

const props = defineProps<{
  contractTypeOptions?: Array<{ label: string; value: Id }>;
  insuranceTypeOptions?: Array<{ label: string; value: Id }>;
  loading?: boolean;
  modelValue?: Partial<ContractFormModel>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: Partial<ContractFormModel>): void;
  (e: 'submit', v: Record<string, any>): void;
  (e: 'cancel'): void;
}>();

const AForm = Form;
const AFormItem = Form.Item;
const ASelect = Select;
const ASelectOption = Select.Option;
const ADatePicker = DatePicker;
const ASpace = Space;
const AButton = Button;

const form = reactive<ContractFormModel>({
  contractTypeId: undefined,
  employeeId: undefined,

  employeeName: '',
  employeeCode: '',
  email: '',
  phone: '',
  identification: '',
  birthDate: undefined,
  tax: undefined,

  effectiveDate: undefined,
  expiryDate: undefined,
  basicSalary: undefined,
  kpi: undefined,
  allowance: undefined,
  salaryGross: undefined,
  insuranceType: undefined,
  insuranceValue: undefined,
  insuranceSalary: undefined,

  eSocialInsuranceFee: undefined,
  eHealthInsuranceFee: undefined,
  eUnemploymentInsuranceFee: undefined,
  eUnionFee: undefined,
  eTaxFee: undefined,
  salaryNet: undefined,

  cSocialInsuranceFee: undefined,
  cCalculateOccAccInsuranceFee: undefined,
  cHealthInsuranceFee: undefined,
  cUnemploymentInsuranceFee: undefined,
  totalCost: undefined,

  status: 1,
  checkers: [],
  approver: undefined,
  notes: '',
});

watch(
  () => props.modelValue,
  (v) => {
    if (v) Object.assign(form, v);
  },
  { deep: true, immediate: true },
);

const defaultInsuranceTypes = [
  { label: 'Cố định', value: 1 },
  { label: '%', value: 2 },
];

const contractTypes = ref<Array<{ label: string; value: Id }>>([]);
const insuranceTypes = computed(
  () => props.insuranceTypeOptions || defaultInsuranceTypes,
);

watch(
  () => [
    form.basicSalary,
    form.kpi,
    form.allowance,
    form.insuranceValue,
    form.eTaxFee,
    form.eUnionFee,
  ],
  () => {
    const gross = [form.basicSalary, form.kpi, form.allowance]
      .map((n) => n || 0)
      .reduce((a, b) => a + b, 0);

    form.salaryGross = Number(gross.toFixed(2));

    const deductions = [form.insuranceValue, form.eTaxFee, form.eUnionFee]
      .map((n) => n || 0)
      .reduce((a, b) => a + b, 0);

    form.salaryNet = Number((gross - deductions).toFixed(2));
  },
);

// Compute insuranceSalary based on insuranceType
watch(
  () => [form.insuranceType, form.insuranceValue, form.salaryGross],
  () => {
    try {
      const type = Number(form.insuranceType);
      const value = Number(form.insuranceValue ?? 0);
      const gross = Number(form.salaryGross ?? 0);

      if (type === 1) {
        // Fixed amount
        form.insuranceSalary = Number((value || 0).toFixed(2));
      } else if (type === 2) {
        // Percent of gross
        const calc = gross * (value / 100);
        form.insuranceSalary = Number(calc.toFixed(2));
      } else {
        form.insuranceSalary = undefined;
      }
    } catch {
      form.insuranceSalary = undefined;
    }
  },
  { immediate: true },
);

watch(
  () => [
    form.cCalculateOccAccInsuranceFee,
    form.cHealthInsuranceFee,
    form.cHealthInsuranceFee,
    form.cUnemploymentInsuranceFee,
  ],
  () => {
    const total =
      (form.cSocialInsuranceFee || 0) +
      (form.cCalculateOccAccInsuranceFee || 0) +
      (form.cHealthInsuranceFee || 0) +
      (form.cUnemploymentInsuranceFee || 0);
    form.totalCost = Number(total.toFixed(2));
  },
);

const feesTotal = computed(() => {
  return (
    (form.eSocialInsuranceFee || 0) +
    (form.eHealthInsuranceFee || 0) +
    (form.eUnemploymentInsuranceFee || 0) +
    (form.eUnionFee || 0) +
    (form.eTaxFee || 0)
  );
});

// salaryConfig is loaded from API; declare before watches that reference it to avoid TDZ errors
const salaryConfig = ref<any>(null);

// Compute employee-side fees when relevant inputs or salaryConfig change
// Note: heuristic for isLaborContract: contractTypeId === 1 or 2 => treated as labor contract.
// Adjust mapping if your backend uses different ids.
watch(
  () => [
    form.insuranceType,
    form.insuranceSalary,
    form.salaryGross,
    form.contractTypeId,
    form.tax,
    salaryConfig.value,
  ],
  () => {
    const insSalary = Number(form.insuranceSalary ?? 0);
    const type = Number(form.insuranceType ?? 0);
    const gross = Number(form.salaryGross ?? 0);
    const taxPercent = Number(form.tax ?? 0);

    // Social
    form.eSocialInsuranceFee = calculateESocialInsuranceFee(
      type,
      insSalary,
      salaryConfig.value,
    );
    // Health
    form.eHealthInsuranceFee = calculateEHealthInsuranceFee(
      type,
      insSalary,
      salaryConfig.value,
    );
    // Unemployment
    form.eUnemploymentInsuranceFee = calculateEUnemployeeInsuranceFee(
      type,
      insSalary,
      salaryConfig.value,
    );
    // Union fee (employee) — use e_UnionPercent from config if present
    try {
      const unionPct = Number(salaryConfig.value?.e_UnionPercent ?? 0);
      form.eUnionFee = Number((insSalary * (unionPct || 0) || 0).toFixed(2));
    } catch {
      form.eUnionFee = undefined;
    }

    // Tax — determine if contract is labor type (heuristic)
    const isLabor =
      Number(form.contractTypeId) === 1 || Number(form.contractTypeId) === 2;
    form.eTaxFee = calculateTaxFee(
      isLabor,
      gross,
      taxPercent,
      salaryConfig.value,
    );
  },
  { immediate: true },
);

function onEmployeeChange(v: Id | Id[] | undefined, option?: any) {
  const id = Array.isArray(v) ? v?.[0] : v;
  if (!id && id !== 0) return;
  const opt = Array.isArray(option) ? option[0] : option;
  if (opt) {
    form.employeeId = id as Id;
    form.employeeName = opt?.name || '';
    form.employeeCode = opt?.userName || '';
    form.email = opt?.email || '';
    form.phone = opt?.phone || '';
    form.identification = opt?.identification || '';
    const bd = opt?.birthDate
      ? dayjs(opt.birthDate).format('DD-MM-YYYY')
      : undefined;
    form.birthDate = bd;
    form.tax = opt.taxCode || '';
  }
}

function toISO(d: Dayjs | null | undefined) {
  return d ? d.toDate().toISOString() : undefined;
}

function onCancel() {
  emit('cancel');
}

function onSubmit() {
  const payload = {
    contractTypeId: form.contractTypeId,
    employeeId: form.employeeId,
    effectiveDate: toISO(form.effectiveDate || null),
    expiryDate: toISO(form.expiryDate || null),
    basicSalary: form.basicSalary ?? 0,
    kpi: form.kpi ?? 0,
    allowance: form.allowance ?? 0,
    totalSalary: form.salaryGross ?? 0,
    insuranceType: form.insuranceType,
    insurance: form.insuranceValue ?? 0,
    tax: form.eTaxFee ?? 0,
    insuranceSalary: form.insuranceSalary ?? 0,
    eTaxFee: form.eTaxFee ?? 0,
    eUnionFee: form.eUnionFee ?? 0,
    salaryNet: form.salaryNet ?? 0,
    cSocialInsuranceFee: form.cSocialInsuranceFee ?? 0,
    cCalculateOccAccInsuranceFee: form.cCalculateOccAccInsuranceFee ?? 0,
    cHealthInsuranceFee: form.cHealthInsuranceFee ?? 0,
    cUnemploymentInsuranceFee: form.cUnemploymentInsuranceFee ?? 0,
    totalCost: form.totalCost ?? 0,
    status: form.status,
    checkers: form.checkers || [],
    approver: form.approver,
    note: form.notes || '',
  } as Record<string, any>;
  emit('submit', payload);
  emit('update:modelValue', { ...form });
}

const submitting = ref(false);

const statusOptions = ref<Array<{ label: string; value: Id }>>([]);
async function loadContractTypes() {
  try {
    const res = await requestClient.get<any>('/api/hrms/contract/type', {
      responseReturn: 'body',
    });
    const list = Array.isArray(res?.data) ? res.data : res?.items || [];
    contractTypes.value = list.map((x: any) => ({
      label: x?.name,
      value: x?.id,
    }));
  } catch {
    contractTypes.value = [];
  }
}

async function loadStatuses() {
  try {
    const res = await requestClient.get<any>('/api/hrms/contract/status', {
      responseReturn: 'body',
    });
    const list = Array.isArray(res?.data) ? res.data : res?.items || [];
    statusOptions.value = list.map((x: any) => ({
      label: x?.name,
      value: x?.id,
    }));
  } catch {
    statusOptions.value = [];
  }
}

async function loadSalaryConfig() {
  try {
    const res = await requestClient.get<any>(
      '/api/hrms/contract/salary-config',
      {
        responseReturn: 'body',
      },
    );
    salaryConfig.value = res?.data ?? null;
  } catch {
    salaryConfig.value = null;
  }
}

loadContractTypes();
loadStatuses();
loadSalaryConfig();

function numberFormatter(v: any) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return s.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function numberParser(v: any) {
  return v ? v.replaceAll(',', '') : v;
}
</script>

<template>
  <AForm layout="vertical" class="p-2">
    <!-- Loại hợp đồng & Nhân viên -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem label="Loại hợp đồng" name="contractTypeId">
        <ASelect
          v-model:value="form.contractTypeId"
          placeholder="Chọn loại hợp đồng"
        >
          <ASelectOption
            v-for="o in contractTypes"
            :key="o.value"
            :value="o.value"
          >
            {{ o.label }}
          </ASelectOption>
        </ASelect>
      </AFormItem>

      <AFormItem label="Hiệu lực">
        <ADatePicker
          v-model:value="form.effectiveDate"
          format="DD-MM-YYYY"
          class="w-full"
          placeholder="DD-MM-YYYY"
        />
      </AFormItem>

      <AFormItem label="Hết hạn">
        <ADatePicker
          v-model:value="form.expiryDate"
          format="DD-MM-YYYY"
          class="w-full"
          placeholder="DD-MM-YYYY"
        />
      </AFormItem>
    </div>

    <ContractEmployeeInfo
      :form="form"
      @change="onEmployeeChange"
      @update:model-value="(v) => (form.employeeId = v)"
    />

    <!-- Lương -->
    <ContractSalaryInfo
      :form="form"
      :number-formatter="numberFormatter"
      :number-parser="numberParser"
    />

    <ContractEmployeeCosts
      :form="form"
      :insurance-types="insuranceTypes"
      :number-formatter="numberFormatter"
      :number-parser="numberParser"
      :fees-total="feesTotal"
    />

    <ContractEmployerCosts
      :form="form"
      :number-formatter="numberFormatter"
      :number-parser="numberParser"
    />

    <ContractStatusApproval :form="form" :status-options="statusOptions" />

    <ASpace class="form-actions mt-4" align="center">
      <AButton @click="onCancel">Hủy</AButton>
      <AButton
        type="primary"
        :loading="submitting || !!props.loading"
        @click="onSubmit"
      >
        Lưu
      </AButton>
    </ASpace>
  </AForm>
</template>

<style scoped>
.grid {
  width: 100%;
}
</style>
