<script setup lang="ts">
import type { ContractFormModel } from '../models/contract-models';

import {
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
} from 'ant-design-vue';

const props = defineProps<{
  feesTotal: number;
  form: Partial<ContractFormModel> & Record<string, any>;
  insuranceTypes: Array<{ label: string; value: any }>;
  numberFormatter: (v: any) => string;
  numberParser: (v: any) => any;
}>();
const emit = defineEmits<{
  (e: 'update:form', v: Partial<ContractFormModel> & Record<string, any>): void;
  (e: 'insuranceValueChange', v: number): void;
}>();

function updateField(field: string, value: any) {
  const copy = { ...props.form } as Record<string, any>;
  copy[field] = value;
  emit('update:form', copy as any);
  if (field === 'insuranceValue') {
    // notify parent that the user changed insuranceValue so it can avoid overwriting
    emit('insuranceValueChange', value);
  }
}
const AFormItem = Form.Item;
const ASelect = Select;
const ASelectOption = Select.Option;
const AInputNumber = InputNumber;
const AInputGroup = Input.Group;
const ACollapse = Collapse;
const ACollapsePanel = Collapse.Panel;
const ADivider = Divider;
</script>

<template>
  <div>
    <ADivider orientation="left">Chi phí NLĐ</ADivider>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AFormItem label="Bảo hiểm">
        <AInputGroup class="-mx-1 flex flex-wrap" compact>
          <div class="w-full px-1 md:w-2/5">
            <div class="mb-1 text-xs text-gray-500">Loại</div>
            <ASelect
              :value="props.form.insuranceType"
              class="w-full"
              @change="(v) => updateField('insuranceType', v)"
            >
              <ASelectOption
                v-for="o in props.insuranceTypes"
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
              :value="props.form.insuranceValue"
              @change="(v) => updateField('insuranceValue', v)"
              :min="0"
              class="w-full"
              placeholder="Giá trị BH"
              :formatter="props.numberFormatter"
              :parser="props.numberParser"
            />
          </div>
        </AInputGroup>
        <div
          class="mt-1 text-sm text-gray-500"
          v-if="props.form.insuranceSalary !== undefined"
        >
          Mức lương đóng bảo hiểm là
          <span style="font-weight: 700">{{
            props.numberFormatter(props.form.insuranceSalary)
          }}</span>
          đ
        </div>
      </AFormItem>

      <AFormItem class="md:col-span-2">
        <ACollapse :bordered="false">
          <ACollapsePanel
            :header="`Các khoản phải nộp — Tổng: ${props.numberFormatter(props.feesTotal)}`"
            key="fees"
          >
            <AInputGroup class="-mx-1 flex flex-wrap" compact>
              <div class="w-full px-1 md:w-1/5">
                <div class="mb-1 text-xs text-gray-500">Xã hội</div>
                <AInputNumber
                  :value="props.form.employeeSocialInsuranceFee"
                  @change="(v) => updateField('employeeSocialInsuranceFee', v)"
                  :min="0"
                  class="w-full"
                  placeholder="Xã hội"
                  :formatter="props.numberFormatter"
                  :parser="props.numberParser"
                />
              </div>
              <div class="w-full px-1 md:w-1/5">
                <div class="mb-1 text-xs text-gray-500">Y tế</div>
                <AInputNumber
                  :value="props.form.employeeHealthInsuranceFee"
                  @change="(v) => updateField('employeeHealthInsuranceFee', v)"
                  :min="0"
                  class="w-full"
                  placeholder="Y tế"
                  :formatter="props.numberFormatter"
                  :parser="props.numberParser"
                />
              </div>
              <div class="w-full px-1 md:w-1/5">
                <div class="mb-1 text-xs text-gray-500">Thất nghiệp</div>
                <AInputNumber
                  :value="props.form.employeeUnemploymentInsuranceFee"
                  @change="
                    (v) => updateField('employeeUnemploymentInsuranceFee', v)
                  "
                  :min="0"
                  class="w-full"
                  placeholder="Thất nghiệp"
                  :formatter="props.numberFormatter"
                  :parser="props.numberParser"
                />
              </div>
              <div class="w-full px-1 md:w-1/5">
                <div class="mb-1 text-xs text-gray-500">Công đoàn</div>
                <AInputNumber
                  :value="props.form.employeeUnionFee"
                  @change="(v) => updateField('employeeUnionFee', v)"
                  :min="0"
                  class="w-full"
                  :formatter="props.numberFormatter"
                  :parser="props.numberParser"
                />
              </div>
              <div class="w-full px-1 md:w-1/5">
                <div class="mb-1 text-xs text-gray-500">Thuế TNCN</div>
                <AInputNumber
                  :value="props.form.taxFee"
                  @change="(v) => updateField('taxFee', v)"
                  :min="0"
                  class="w-full"
                  :formatter="props.numberFormatter"
                  :parser="props.numberParser"
                />
              </div>
            </AInputGroup>
          </ACollapsePanel>
        </ACollapse>
      </AFormItem>
    </div>
  </div>
</template>

<style scoped>
.grid {
  width: 100%;
}
</style>
