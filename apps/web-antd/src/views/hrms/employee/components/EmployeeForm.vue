<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';

import { computed, reactive, ref, watch } from 'vue';

import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Textarea,
} from 'ant-design-vue';

interface EmployeeFormData {
  fullName: string;
  employeeCode: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: Dayjs | undefined;
  gender: string;
  position: string;
  department: string;
  startDate: Dayjs | undefined;
  status: string;
}

interface Props {
  visible: boolean;
  loading?: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'submit', data: EmployeeFormData): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

// Component aliases for template usage
const AButton = Button;
const ACol = Col;
const ADatePicker = DatePicker;
const ADrawer = Drawer;
const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
const ARow = Row;
const ASelect = Select;
const ASelectOption = Select.Option;
const ASpace = Space;
const ATextarea = Textarea;

const formRef = ref<FormInstance>();

// Form data
const formData = reactive<EmployeeFormData>({
  fullName: '',
  employeeCode: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: undefined,
  gender: '',
  position: '',
  department: '',
  startDate: undefined,
  status: '',
});

// Form validation rules
const formRules = {
  fullName: [{ required: true, message: 'Vui lòng nhập họ và tên' }],
  email: [
    { required: true, message: 'Vui lòng nhập email' },
    { type: 'email' as const, message: 'Email không hợp lệ' },
  ],
};

// Computed property for v-model
const drawerVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

// Watch for visibility changes to reset form
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      resetForm();
    }
  },
);

function handleClose() {
  emit('update:visible', false);
}

function resetForm() {
  Object.assign(formData, {
    fullName: '',
    employeeCode: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: undefined,
    gender: '',
    position: '',
    department: '',
    startDate: undefined,
    status: '',
  });
  formRef.value?.resetFields();
}

function handleReset() {
  resetForm();
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    emit('submit', { ...formData });
  } catch {
    message.error('Vui lòng kiểm tra lại thông tin');
  }
}
</script>

<template>
  <ADrawer
    v-model:open="drawerVisible"
    title="Thêm nhân viên mới"
    width="720"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <AForm
      ref="formRef"
      :model="formData"
      layout="vertical"
      :label-col="{ span: 24 }"
      :wrapper-col="{ span: 24 }"
      :rules="formRules"
    >
      <ARow :gutter="16">
        <ACol :span="12">
          <AFormItem label="Họ và tên" name="fullName">
            <AInput
              v-model:value="formData.fullName"
              placeholder="Nhập họ và tên"
            />
          </AFormItem>
        </ACol>
        <ACol :span="12">
          <AFormItem label="Mã nhân viên" name="employeeCode">
            <AInput
              v-model:value="formData.employeeCode"
              placeholder="Nhập mã nhân viên"
            />
          </AFormItem>
        </ACol>
      </ARow>

      <ARow :gutter="16">
        <ACol :span="12">
          <AFormItem label="Email" name="email">
            <AInput v-model:value="formData.email" placeholder="Nhập email" />
          </AFormItem>
        </ACol>
        <ACol :span="12">
          <AFormItem label="Số điện thoại" name="phone">
            <AInput
              v-model:value="formData.phone"
              placeholder="Nhập số điện thoại"
            />
          </AFormItem>
        </ACol>
      </ARow>

      <ARow :gutter="16">
        <ACol :span="12">
          <AFormItem label="Ngày sinh" name="dateOfBirth">
            <ADatePicker
              v-model:value="formData.dateOfBirth"
              style="width: 100%"
              placeholder="Chọn ngày sinh"
              format="DD/MM/YYYY"
            />
          </AFormItem>
        </ACol>
        <ACol :span="12">
          <AFormItem label="Giới tính" name="gender">
            <ASelect
              v-model:value="formData.gender"
              placeholder="Chọn giới tính"
            >
              <ASelectOption value="Nam">Nam</ASelectOption>
              <ASelectOption value="Nữ">Nữ</ASelectOption>
              <ASelectOption value="Khác">Khác</ASelectOption>
            </ASelect>
          </AFormItem>
        </ACol>
      </ARow>

      <ARow :gutter="16">
        <ACol :span="12">
          <AFormItem label="Vị trí" name="position">
            <AInput
              v-model:value="formData.position"
              placeholder="Nhập vị trí công việc"
            />
          </AFormItem>
        </ACol>
        <ACol :span="12">
          <AFormItem label="Phòng ban" name="department">
            <ASelect
              v-model:value="formData.department"
              placeholder="Chọn phòng ban"
            >
              <ASelectOption value="Nhân sự">Nhân sự</ASelectOption>
              <ASelectOption value="Kế toán">Kế toán</ASelectOption>
              <ASelectOption value="IT">IT</ASelectOption>
              <ASelectOption value="Marketing">Marketing</ASelectOption>
              <ASelectOption value="Kinh doanh">Kinh doanh</ASelectOption>
            </ASelect>
          </AFormItem>
        </ACol>
      </ARow>

      <AFormItem label="Địa chỉ" name="address">
        <ATextarea
          v-model:value="formData.address"
          placeholder="Nhập địa chỉ"
          :rows="3"
        />
      </AFormItem>

      <ARow :gutter="16">
        <ACol :span="12">
          <AFormItem label="Ngày vào làm" name="startDate">
            <ADatePicker
              v-model:value="formData.startDate"
              style="width: 100%"
              placeholder="Chọn ngày vào làm"
              format="DD/MM/YYYY"
            />
          </AFormItem>
        </ACol>
        <ACol :span="12">
          <AFormItem label="Trạng thái" name="status">
            <ASelect
              v-model:value="formData.status"
              placeholder="Chọn trạng thái"
            >
              <ASelectOption value="Đang làm">Đang làm</ASelectOption>
              <ASelectOption value="Nghỉ việc">Nghỉ việc</ASelectOption>
              <ASelectOption value="Nghỉ phép năm">
                Nghỉ phép năm
              </ASelectOption>
              <ASelectOption value="Nghỉ ốm">Nghỉ ốm</ASelectOption>
            </ASelect>
          </AFormItem>
        </ACol>
      </ARow>
    </AForm>

    <template #footer>
      <ASpace>
        <AButton @click="handleClose">Hủy</AButton>
        <AButton @click="handleReset">Làm mới</AButton>
        <AButton type="primary" :loading="loading" @click="handleSubmit">
          Lưu
        </AButton>
      </ASpace>
    </template>
  </ADrawer>
</template>

<style scoped>
.ant-form-item {
  margin-bottom: 16px;
}
</style>
