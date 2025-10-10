<script setup lang="ts">
import type { Dayjs } from 'dayjs';

import { computed, reactive, ref, watch } from 'vue';

import {
  Button,
  Collapse,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestClient } from '#/api/request';
import EmployeeSearchSelect from '#/components/EmployeeSearchSelect.vue';

type Id = number | string;

interface ContractFormModel {
  contractTypeId?: Id;
  employeeId?: Id;

  employeeName?: string;
  employeeCode?: string;
  email?: string;
  phone?: string;
  identification?: string;
  birthDate?: string | undefined;
  tax?: number | string | undefined;

  effectiveDate?: Dayjs | undefined;
  expiryDate?: Dayjs | undefined;
  basicSalary?: number | undefined;
  kpi?: number | undefined;
  allowance?: number | undefined;
  salaryGross?: number | undefined;
  insuranceType?: Id | undefined;
  insuranceValue?: number | undefined;
  insuranceSalary?: number | undefined;

  eSocialInsuranceFee?: number | undefined;
  eHealthInsuranceFee?: number | undefined;
  eUnemploymentInsuranceFee?: number | undefined;
  eUnionFee?: number | undefined;
  eTaxFee?: number | undefined;

  salaryNet?: number | undefined;

  cSocialInsuranceFee?: number | undefined;
  cCalculateOccAccInsuranceFee?: number | undefined;
  cHealthInsuranceFee?: number | undefined;
  cUnemploymentInsuranceFee?: number | undefined;
  totalCost?: number | undefined;

  status?: Id | undefined;
  checkers?: Id[];
  approver?: Id | undefined;
  notes?: string;
}

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
const AInput = Input;
const AInputTextArea = Input.TextArea;
const AInputGroup = Input.Group;
const AInputNumber = InputNumber;
const ASelect = Select;
const ASelectOption = Select.Option;
const ADatePicker = DatePicker;
const ADivider = Divider;
const ASpace = Space;
const ACollapse = Collapse;
const ACollapsePanel = Collapse.Panel;
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

loadContractTypes();
loadStatuses();

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
        />
      </AFormItem>

      <AFormItem label="Hết hạn">
        <ADatePicker
          v-model:value="form.expiryDate"
          format="DD-MM-YYYY"
          class="w-full"
        />
      </AFormItem>
    </div>

    <ADivider orientation="left">Thông tin nhân viên</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem label="Nhân viên" name="employeeId">
        <EmployeeSearchSelect
          mode="single"
          :model-value="form.employeeId as any"
          placeholder="Chọn nhân viên"
          @change="onEmployeeChange"
          @update:model-value="(v: any) => (form.employeeId = v as any)"
        />
      </AFormItem>

      <AFormItem label="Số điện thoại">
        <AInput :value="form.phone" readonly />
      </AFormItem>
      <AFormItem label="Email">
        <AInput :value="form.email" readonly />
      </AFormItem>
      <AFormItem label="CMND/CCCD">
        <AInput :value="form.identification" readonly />
      </AFormItem>
      <AFormItem label="Ngày sinh">
        <AInput
          :value="
            form.birthDate ? dayjs(form.birthDate).format('DD-MM-YYYY') : ''
          "
          readonly
        />
      </AFormItem>
      <AFormItem label="Mã số thuế">
        <AInput v-model:value="form.tax as any" />
      </AFormItem>
    </div>

    <!-- Lương -->
    <ADivider orientation="left">Thông tin Lương</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem label="Lương cơ bản">
        <AInputNumber
          v-model:value="form.basicSalary"
          :min="0"
          class="w-full"
          :formatter="numberFormatter"
          :parser="numberParser"
        />
      </AFormItem>
      <AFormItem label="KPI & Phụ cấp">
        <AInputGroup compact>
          <AInputNumber
            v-model:value="form.allowance"
            :min="0"
            class="w-1/2"
            placeholder="KPI"
            :formatter="numberFormatter"
            :parser="numberParser"
          />
          <AInputNumber
            v-model:value="form.kpi"
            :min="0"
            class="w-1/2"
            placeholder="Phụ cấp"
            :formatter="numberFormatter"
            :parser="numberParser"
          />
        </AInputGroup>
      </AFormItem>
      <AFormItem label="Lương gross">
        <AInputNumber
          v-model:value="form.salaryGross"
          :min="0"
          class="w-full"
          :formatter="numberFormatter"
          :parser="numberParser"
        />
      </AFormItem>
      <!-- <AFormItem label="Lương net">
        <AInputNumber
          v-model:value="form.salaryNet"
          :min="0"
          style="width: 100%"
          :formatter="numberFormatter"
          :parser="numberParser"
        />
      </AFormItem> -->
    </div>

    <!-- Chi phí NLĐ -->
    <ADivider orientation="left">Chi phí NLĐ</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem label="Bảo hiểm">
        <AInputGroup class="-mx-1 flex flex-wrap" compact>
          <div class="w-full px-1 md:w-2/5">
            <div class="mb-1 text-xs text-gray-500">Loại</div>
            <ASelect v-model:value="form.insuranceType" class="w-full">
              <ASelectOption
                v-for="o in insuranceTypes"
                :key="o.value"
                :value="o.value"
              >
                {{ o.label }}
              </ASelectOption>
            </ASelect>
          </div>
          <div class="w-full px-1 md:w-3/5">
            <div class="mb-1 text-xs text-gray-500">Giá trị</div>
            <AInputNumber
              v-model:value="form.insuranceValue"
              :min="0"
              class="w-full"
              placeholder="Giá trị BH"
              :formatter="numberFormatter"
              :parser="numberParser"
            />
          </div>
        </AInputGroup>
        <div class="mt-1 text-sm text-gray-500">
          Lương đóng bảo hiểm (insuranceSalary) sẽ được dùng để tính các khoản
          bắt buộc.
          <span v-if="form.insuranceSalary !== undefined">
            Hiện: {{ numberFormatter(form.insuranceSalary) }}
          </span>
        </div>
      </AFormItem>

      <AFormItem label="Các khoản phải nộp" class="md:col-span-2">
        <ACollapse :bordered="false">
          <ACollapsePanel
            :header="`Các khoản phải nộp — Tổng: ${numberFormatter(feesTotal)}`"
            key="fees"
          >
            <AInputGroup class="-mx-1 flex flex-wrap" compact>
              <div class="w-full px-1 md:w-1/5">
                <div class="mb-1 text-xs text-gray-500">Xã hội</div>
                <AInputNumber
                  v-model:value="form.eSocialInsuranceFee"
                  :min="0"
                  class="w-full"
                  placeholder="Xã hội"
                  :formatter="numberFormatter"
                  :parser="numberParser"
                />
              </div>
              <div class="w-full px-1 md:w-1/5">
                <div class="mb-1 text-xs text-gray-500">Y tế</div>
                <AInputNumber
                  v-model:value="form.eHealthInsuranceFee"
                  :min="0"
                  class="w-full"
                  placeholder="Y tế"
                  :formatter="numberFormatter"
                  :parser="numberParser"
                />
              </div>
              <div class="w-full px-1 md:w-1/5">
                <div class="mb-1 text-xs text-gray-500">Thất nghiệp</div>
                <AInputNumber
                  v-model:value="form.eUnemploymentInsuranceFee"
                  :min="0"
                  class="w-full"
                  placeholder="Thất nghiệp"
                  :formatter="numberFormatter"
                  :parser="numberParser"
                />
              </div>
              <div class="w-full px-1 md:w-1/5">
                <div class="mb-1 text-xs text-gray-500">Công đoàn</div>
                <AInputNumber
                  v-model:value="form.eUnionFee"
                  :min="0"
                  class="w-full"
                  :formatter="numberFormatter"
                  :parser="numberParser"
                />
              </div>
              <div class="w-full px-1 md:w-1/5">
                <div class="mb-1 text-xs text-gray-500">Thuế TNCN</div>
                <AInputNumber
                  v-model:value="form.eTaxFee"
                  :min="0"
                  class="w-full"
                  :formatter="numberFormatter"
                  :parser="numberParser"
                />
              </div>
            </AInputGroup>
          </ACollapsePanel>
        </ACollapse>
      </AFormItem>
    </div>

    <!-- Chi phí doanh nghiệp -->
    <ADivider orientation="left">Chi phí doanh nghiệp</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem label="BHXH">
        <AInputNumber
          v-model:value="form.cSocialInsuranceFee"
          :min="0"
          style="width: 100%"
          :formatter="numberFormatter"
          :parser="numberParser"
        />
      </AFormItem>
      <AFormItem label="TNLĐ-BNN">
        <AInputNumber
          v-model:value="form.cCalculateOccAccInsuranceFee"
          :min="0"
          style="width: 100%"
          :formatter="numberFormatter"
          :parser="numberParser"
        />
      </AFormItem>
      <AFormItem label="BHYT">
        <AInputNumber
          v-model:value="form.cHealthInsuranceFee"
          :min="0"
          style="width: 100%"
          :formatter="numberFormatter"
          :parser="numberParser"
        />
      </AFormItem>
      <AFormItem label="BHTN">
        <AInputNumber
          v-model:value="form.cUnemploymentInsuranceFee"
          :min="0"
          style="width: 100%"
          :formatter="numberFormatter"
          :parser="numberParser"
        />
      </AFormItem>
      <AFormItem label="Tổng chi phí">
        <AInputNumber
          v-model:value="form.totalCost"
          :min="0"
          style="width: 100%"
          :formatter="numberFormatter"
          :parser="numberParser"
        />
      </AFormItem>
    </div>

    <ADivider orientation="left">Trạng thái & Phê duyệt</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem label="Trạng thái">
        <ASelect v-model:value="form.status" style="width: 100%">
          <ASelectOption
            v-for="s in statusOptions"
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
          :model-value="form.checkers as any"
          placeholder="Chọn người kiểm tra"
          @update:model-value="(v: any) => (form.checkers = v)"
        />
      </AFormItem>
      <AFormItem label="Người duyệt (Approver)">
        <EmployeeSearchSelect
          mode="single"
          :model-value="form.approver as any"
          placeholder="Chọn người duyệt"
          @update:model-value="(v: any) => (form.approver = v)"
        />
      </AFormItem>
      <AFormItem class="md:col-span-3" label="Ghi chú">
        <AInputTextArea v-model:value="form.notes" :rows="3" />
      </AFormItem>
    </div>

    <ASpace class="mt-4" align="center">
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
