<script setup lang="ts">
import { reactive, watch } from 'vue';

import { Button, Form, Input, InputNumber, Select } from 'ant-design-vue';

import ContractTypeSelect from '#/components/ContractTypeSelect.vue';

const props = defineProps<{
  defaultContractTypeId?: null | number | string;
  disableContractTypeSelect?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: Record<string, any>): void;
  (e: 'cancel'): void;
}>();

const AForm = Form;
const AFormItem = Form.Item;
const AButton = Button;
const ASelect = Select;
const ASelectOption = Select.Option;
const AInputNumber = InputNumber;
const AInputGroup = Input.Group;

const model = reactive({
  contractTypeId: props.defaultContractTypeId ?? undefined,
  duration: 0,
  nameUnit: 'tháng',
  name: '',
});

function updateName() {
  if (model.duration === null || model.duration === undefined) {
    model.name = '';
    return;
  }
  model.name = `${model.duration} ${model.nameUnit}`;
}

watch(() => [model.duration, model.nameUnit], updateName, {
  immediate: true,
});

function onSubmit() {
  updateName();
  emit('submit', { ...model });
}

function onCancel() {
  emit('cancel');
}
</script>

<template>
  <AForm layout="vertical" class="p-2">
    <div class="grid grid-cols-1 gap-3">
      <AFormItem label="Loại hợp đồng">
        <ContractTypeSelect
          v-model="model.contractTypeId"
          :disabled="disableContractTypeSelect || !!props.defaultContractTypeId"
          placeholder="Chọn loại hợp đồng"
        />
      </AFormItem>

      <AFormItem label="Tên (tự động)">
        <AInputGroup compact>
          <ASelect v-model:value="model.nameUnit" style="width: 120px">
            <ASelectOption value="tháng">Tháng</ASelectOption>
            <ASelectOption value="năm">Năm</ASelectOption>
          </ASelect>

          <AInputNumber
            v-model:value="model.duration"
            style="width: 160px"
            min="0"
          />
        </AInputGroup>
      </AFormItem>
    </div>

    <div class="form-actions mt-3 flex justify-end gap-2">
      <AButton @click="onCancel">Hủy</AButton>
      <AButton type="primary" @click="onSubmit">Lưu</AButton>
    </div>
  </AForm>
</template>
