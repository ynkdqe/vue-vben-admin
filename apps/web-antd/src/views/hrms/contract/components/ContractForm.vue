<script setup lang="ts">
import type { ContractFormModel, Id } from '../models/contract-models';

import { computed, reactive, ref, watch } from 'vue';

import { formatDate } from '@vben/utils';

import {
  Button,
  DatePicker,
  Form,
  message,
  Select,
  Space,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestClient } from '#/api/request';
import {
  calculateEHealthInsuranceFee,
  calculateESocialInsuranceFee,
  calculateEUnemployeeInsuranceFee,
  calculateTaxFee,
} from '#/utils/salary-utils';

import ContractEmployerCosts from './ContractBusinessCosts.vue';
import ContractEmployeeCosts from './ContractEmployeeCosts.vue';
import ContractEmployeeInfo from './ContractEmployeeInfo.vue';
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
  contractName: undefined,
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
  insuranceType: 1,
  insuranceValue: undefined,
  insuranceSalary: undefined,

  employeeSocialInsuranceFee: undefined,
  employeeHealthInsuranceFee: undefined,
  employeeUnemploymentInsuranceFee: undefined,
  employeeUnionFee: undefined,
  taxFee: undefined,
  salaryNet: undefined,

  businessSocialInsuranceFee: undefined,
  businessCalculateOccAccInsuranceFee: undefined,
  businessHealthInsuranceFee: undefined,
  businessUnemploymentInsuranceFee: undefined,
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
const contractTypeList = ref<Array<any>>([]);
const insuranceTypes = computed(
  () => props.insuranceTypeOptions || defaultInsuranceTypes,
);

watch(
  () => [
    form.basicSalary,
    form.kpi,
    form.allowance,
    form.insuranceValue,
    form.taxFee,
    form.employeeUnionFee,
  ],
  () => {
    const basic = Number(form.basicSalary ?? 0);
    const kpi = Number(form.kpi ?? 0);
    const allowance = Number(form.allowance ?? 0);

    const gross = basic + kpi + allowance;
    form.salaryGross = Number(gross.toFixed(2));
    const insuranceVal = Number(form.insuranceValue ?? 0);
    const taxFee = Number(form.taxFee ?? 0);
    const unionFee = Number(form.employeeUnionFee ?? 0);
    const deductions = insuranceVal + taxFee + unionFee;

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
    form.businessCalculateOccAccInsuranceFee,
    form.businessHealthInsuranceFee,
    form.businessHealthInsuranceFee,
    form.businessUnemploymentInsuranceFee,
  ],
  () => {
    const total =
      (form.businessSocialInsuranceFee || 0) +
      (form.businessCalculateOccAccInsuranceFee || 0) +
      (form.businessHealthInsuranceFee || 0) +
      (form.businessUnemploymentInsuranceFee || 0);
    form.totalCost = Number(total.toFixed(2));
  },
);

const feesTotal = computed(() => {
  return (
    (form.employeeSocialInsuranceFee || 0) +
    (form.employeeHealthInsuranceFee || 0) +
    (form.employeeUnemploymentInsuranceFee || 0) +
    (form.employeeUnionFee || 0) +
    (form.taxFee || 0)
  );
});

const durationsOptions = computed(() => {
  const id = form.contractTypeId;
  if (!id) return [] as Array<{ label: string; value: number }>;
  const ct = contractTypeList.value.find((c: any) => c?.id === id);
  const durs =
    ct?.durations ??
    ct?.extraProperties?.durations ??
    ct?.contractDurations ??
    [];
  if (!Array.isArray(durs)) return [];
  // Use the duration value (months) as option value. If backend uses an id for duration entries, adjust accordingly.
  return durs.map((d: any) => ({
    label: d?.name ?? String(d?.duration ?? ''),
    value: Number(d?.duration ?? 0),
  }));
});

// selectedDurationValue stores the numeric value (months) selected in the UI.
const selectedDurationValue = ref<number | undefined>(undefined);

watch(
  () => selectedDurationValue.value,
  (val) => {
    if (val === undefined) {
      form.contractName = undefined;
      return;
    }
    const id = form.contractTypeId;
    if (!id) return;
    const ct = contractTypeList.value.find((c: any) => c?.id === id);
    const durs =
      ct?.durations ??
      ct?.extraProperties?.durations ??
      ct?.contractDurations ??
      [];
    const found = Array.isArray(durs)
      ? durs.find((d: any) => Number(d?.duration ?? 0) === Number(val))
      : null;
    if (found) {
      form.contractName = found?.name ?? String(found?.duration ?? '');
      const months = Number(found?.duration ?? 0);
      if (!Number.isNaN(months)) onContractNameChange(months);
    } else {
      form.contractName = undefined;
    }
  },
);

// selectedContractType stores the full contract type object chosen from the contract type list
const selectedContractType = ref<any>(null);

function mapContractTypeToSalaryConfig(ct: any) {
  if (!ct) return undefined;
  return {
    e_SocialInsurancePercent:
      (Number(ct.employeeSocialInsurancePercent ?? 0) || 0) / 100,
    e_HealthInsurancePercent:
      (Number(ct.employeeHealthInsurancePercent ?? 0) || 0) / 100,
    e_UnemployeeInsurancePercent:
      (Number(ct.employeeUnemployeeInsurancePercent ?? 0) || 0) / 100,
    e_UnionPercent: (Number(ct.employeeUnionPercent ?? 0) || 0) / 100,
    e_MinTaxSalary: Number(ct.employeeMinTaxSalary ?? 0) || 0,
    b_SocialInsurance:
      (Number(ct.businessSocialInsurancePercent ?? 0) || 0) / 100,
    b_OccAccInsurance:
      (Number(ct.businessOccAccInsurancePercent ?? 0) || 0) / 100,
    b_HealthInsurance:
      (Number(ct.businessHealthInsurancePercent ?? 0) || 0) / 100,
    b_UnemploymentInsurance:
      (Number(ct.businessUnemploymentInsurancePercent ?? 0) || 0) / 100,
    b_MinInsuranceSalary: Number(ct.minInsuranceSalary ?? 0) || 0,
    // Tax settings
    e_IsTaxFixed: Boolean(ct.isTaxFixed),
    e_TaxPercent: Number(ct.taxPercent ?? 0) || 0,
  };
}

// Compute employee-side fees when relevant inputs or selected contract type change
// Note: heuristic for isLaborContract: contractTypeId === 1 or 2 => treated as labor contract.
// Adjust mapping if your backend uses different ids.
watch(
  () => [
    form.insuranceType,
    form.insuranceSalary,
    form.salaryGross,
    form.contractTypeId,
    form.tax,
    selectedContractType.value,
  ],
  () => {
    const insSalary = Number(form.insuranceSalary ?? 0);
    const type = Number(form.insuranceType ?? 0);
    const gross = Number(form.salaryGross ?? 0);
    const taxPercent = Number(form.tax ?? 0);

    const cfg = mapContractTypeToSalaryConfig(selectedContractType.value);
    // Social
    const eSocial = calculateESocialInsuranceFee(type, insSalary, cfg);
    form.employeeSocialInsuranceFee = eSocial;
    // Also set short alias used by child components
    (form as any).eSocialInsuranceFee = eSocial;
    // Health
    const eHealth = calculateEHealthInsuranceFee(type, insSalary, cfg);
    form.employeeHealthInsuranceFee = eHealth;
    (form as any).eHealthInsuranceFee = eHealth;
    // Unemployment
    const eUnemp = calculateEUnemployeeInsuranceFee(type, insSalary, cfg);
    form.employeeUnemploymentInsuranceFee = eUnemp;
    (form as any).eUnemploymentInsuranceFee = eUnemp;
    // Union fee (employee) — use employeeUnionPercent from selected contract type if present (converted to decimal)
    try {
      const unionPctDecimal = Number(cfg?.e_UnionPercent ?? 0);
      const eUnion = Number(
        (insSalary * (unionPctDecimal || 0) || 0).toFixed(2),
      );
      form.employeeUnionFee = eUnion;
      (form as any).eUnionFee = eUnion;
    } catch {
      form.employeeUnionFee = undefined;
    }

    // Tax — determine if contract is labor type (heuristic)
    const isLabor =
      Number(form.contractTypeId) === 1 || Number(form.contractTypeId) === 2;
    const taxFee = calculateTaxFee(isLabor, gross, taxPercent, cfg);
    form.taxFee = taxFee;
    form.taxFee = taxFee; // child binds to taxFee already, keep consistent
  },
  { immediate: true },
);

function onEmployeeChange(v: Id | Id[] | undefined, option?: any) {
  const id = Array.isArray(v) ? v?.[0] : v;
  if (!id && id !== 0) return;
  const opt = Array.isArray(option) ? option[0] : option;
  if (opt) {
    form.employeeId = id as number;
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

function onContractNameChange(val: any) {
  try {
    const months = Number(val);
    if (!Number.isNaN(months) && months > 0) {
      form.effectiveDate = dayjs();
      form.expiryDate = dayjs().add(months, 'month');
      message.success(`Đã đặt hiệu lực hôm nay, hết hạn sau ${months} tháng`);
    } else if (months === 0) {
      // Vô thời hạn: set effective today and clear expiry
      form.effectiveDate = dayjs();
      form.expiryDate = undefined;
      message.success('Đã đặt hiệu lực hôm nay, vô thời hạn');
    }
  } catch {
    // ignore
  }
}

function onCancel() {
  emit('cancel');
}

function onSubmit() {
  const payload = {
    contractTypeId: form.contractTypeId,
    contractName: form.contractName,
    employeeId: form.employeeId,
    effectiveDate: formatDate(
      form.effectiveDate?.toString() ?? dayjs().format('YYYY-MM-DD'),
      'YYYY-MM-DD',
    ),
    expiryDate: formatDate(
      form.expiryDate?.toString() ?? dayjs().format('YYYY-MM-DD'),
      'YYYY-MM-DD',
    ),
    basicSalary: form.basicSalary ?? 0,
    kpi: form.kpi ?? 0,
    allowance: form.allowance ?? 0,
    totalSalary: form.salaryGross ?? 0,
    insuranceType: form.insuranceType,
    insurance: form.insuranceValue ?? 0,
    tax: Number(form.tax ?? 0),
    insuranceSalary: form.insuranceSalary ?? 0,
    taxFee: form.taxFee ?? 0,
    employeeUnionFee: form.employeeUnionFee ?? 0,
    salaryNet: form.salaryNet ?? 0,
    businessSocialInsuranceFee: form.businessSocialInsuranceFee ?? 0,
    businessCalculateOccAccInsuranceFee:
      form.businessCalculateOccAccInsuranceFee ?? 0,
    businessHealthInsuranceFee: form.businessHealthInsuranceFee ?? 0,
    businessUnemploymentInsuranceFee:
      form.businessUnemploymentInsuranceFee ?? 0,
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
    const res = await requestClient.get<any>('/api/hrms/contract-type', {
      responseReturn: 'body',
    });
    const list = Array.isArray(res?.data) ? res.data : res?.items || [];
    contractTypeList.value = list;
    contractTypes.value = list.map((x: any) => ({
      label: x?.name,
      value: x?.id,
    }));
    // If a contract type is already selected in form, set selectedContractType so calculations can use it
    if (form.contractTypeId) {
      const chosen =
        list.find((c: any) => c?.id === form.contractTypeId) ?? null;
      selectedContractType.value = chosen;
    }
  } catch {
    contractTypes.value = [];
  }
}

watch(
  () => form.contractTypeId,
  (_v) => {
    // clear the selected contractName (keep the field name as-is)
    form.contractName = undefined;
    selectedDurationValue.value = undefined;
    // store the selected contract type object for calculations
    const ct =
      contractTypeList.value.find((c: any) => c?.id === form.contractTypeId) ??
      null;
    selectedContractType.value = ct;
  },
);

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

loadContractTypes();
loadStatuses();

// If the form already has a contractName (e.g., editing), try to select the matching duration option when durations load
watch(
  () => durationsOptions.value,
  (opts) => {
    if (!form.contractName) return;
    const name = String(form.contractName ?? '').trim();
    if (!name) return;
    // try to match by name first
    const byName = opts.find((o: any) => String(o.label ?? '').trim() === name);
    if (byName) {
      selectedDurationValue.value = byName.value;
      return;
    }
    // try numeric match
    const num = Number(name.replaceAll(/[^0-9.-]+/g, ''));
    if (!Number.isNaN(num)) {
      const byNum = opts.find((o: any) => Number(o.value) === num);
      if (byNum) selectedDurationValue.value = byNum.value;
    }
  },
  { immediate: true },
);

function numberFormatter(v: any) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return s.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function numberParser(v: any) {
  return v ? v.replaceAll(',', '') : v;
}

// Default insuranceValue to basicSalary when insuranceType is fixed and user hasn't set a value
watch(
  () => form.basicSalary,
  (val) => {
    try {
      const basic = Number(val ?? 0);
      const insVal = form.insuranceValue;
      if (
        Number(form.insuranceType) === 1 &&
        (insVal === undefined || insVal === null || Number(insVal) === 0)
      ) {
        form.insuranceValue = Number(basic.toFixed(2));
      }
    } catch {
      // ignore
    }
  },
);

watch(
  () => form.insuranceType,
  (t) => {
    try {
      const insVal = form.insuranceValue;
      if (
        Number(t) === 1 &&
        (insVal === undefined || insVal === null || Number(insVal) === 0)
      ) {
        form.insuranceValue = Number(Number(form.basicSalary ?? 0).toFixed(2));
      }
    } catch {
      // ignore
    }
  },
);
</script>

<template>
  <AForm layout="vertical" class="p-2">
    <!-- Loại hợp đồng & Nhân viên -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <AFormItem label="Loại hợp đồng" name="contractType">
        <ASelect
          v-model:value="form.contractTypeId"
          placeholder="Chọn loại hợp đồng"
          class="flex-1"
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

      <AFormItem label="Thời hạn hợp đồng" name="contractName">
        <ASelect
          v-model:value="selectedDurationValue"
          placeholder="Thời hạn"
          class="flex-1"
        >
          <ASelectOption
            v-for="d in durationsOptions"
            :key="d.value"
            :value="d.value"
          >
            {{ d.label }}
          </ASelectOption>
        </ASelect>
      </AFormItem>

      <AFormItem label="Hiệu lực">
        <ADatePicker
          v-model:value="form.effectiveDate"
          format="DD-MM-YYYY"
          class="w-full"
          placeholder="DD-MM-YYYY"
          value-format="YYYY-MM-DD"
        />
      </AFormItem>

      <AFormItem label="Hết hạn">
        <ADatePicker
          v-model:value="form.expiryDate"
          format="DD-MM-YYYY"
          class="w-full"
          placeholder="DD-MM-YYYY"
          value-format="YYYY-MM-DD"
        />
      </AFormItem>
    </div>

    <ContractEmployeeInfo
      :form="form"
      @change="onEmployeeChange"
      @update:model-value="(v) => (form.employeeId = v)"
      @update:form="(v) => Object.assign(form, v)"
    />

    <!-- Lương -->
    <ContractSalaryInfo
      :form="form"
      @update:form="(v) => Object.assign(form, v)"
      :number-formatter="numberFormatter"
      :number-parser="numberParser"
    />

    <ContractEmployeeCosts
      :form="form"
      @update:form="(v) => Object.assign(form, v)"
      :insurance-types="insuranceTypes"
      :number-formatter="numberFormatter"
      :number-parser="numberParser"
      :fees-total="feesTotal"
    />

    <ContractEmployerCosts
      :form="form"
      @update:form="(v) => Object.assign(form, v)"
      :number-formatter="numberFormatter"
      :number-parser="numberParser"
    />

    <ContractStatusApproval
      :form="form"
      :status-options="statusOptions"
      @update:form="(v) => Object.assign(form, v)"
    />

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
