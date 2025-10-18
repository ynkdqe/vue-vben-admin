<script lang="ts" setup>
import { ref, watch, reactive } from 'vue';
import { Drawer, Form, Input, Switch, TimePicker, Button, Space, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { WorkShift } from '#/api/hrms/workshift';
import { createWorkShift, updateWorkShift } from '#/api/hrms/workshift';

const ADrawer = Drawer;
const AForm = Form;
const AFormItem = Form.Item;
const AInput = Input;
const ASwitch = Switch;
const ATimePicker = TimePicker;
const AButton = Button;
const ASpace = Space;

const props = defineProps({
  open: { type: Boolean, default: false },
  initial: { type: Object as any, default: null },
});
const emit = defineEmits(['update:open', 'saved']);

const visible = ref(!!props.open);

watch(
  () => props.open,
  (v) => {
    visible.value = !!v;
  },
);

// reset form when drawer closed
watch(
  () => visible.value,
  (v) => {
    if (!v) resetForm();
  },
);

function close() {
  visible.value = false;
  emit('update:open', false);
}

const form = reactive<any>({
  name: '',
  nameAscii: '',
  code: '',
  fromTime: null,
  toTime: null,
  overShift: false,
  hasBreak: false,
  breakFrom: null,
  breakTo: null,
  flexible: false,
  minCheckIn: null,
  maxCheckIn: null,
  minCheckOut: null,
  maxCheckOut: null,
});

const pickerOpen = reactive({
  from: false,
  to: false,
  breakFrom: false,
  breakTo: false,
  minCheckIn: false,
  maxCheckIn: false,
  minCheckOut: false,
  maxCheckOut: false,
});

function handleTimeChange(field: string, value: any, key: keyof typeof pickerOpen) {
  form[field] = value;
  // close popover immediately after selecting
  pickerOpen[key] = false;
}

const errors = reactive<Record<string, string | null>>({
  name: null,
  nameAscii: null,
  code: null,
});

function resetForm() {
  form.name = '';
  form.nameAscii = '';
  form.code = '';
  form.fromTime = null;
  form.toTime = null;
  form.overShift = false;
  form.hasBreak = false;
  form.breakFrom = null;
  form.breakTo = null;
  form.flexible = false;
  form.minCheckIn = null;
  form.maxCheckIn = null;
  form.minCheckOut = null;
  form.maxCheckOut = null;
  // clear errors
  for (const k in errors) errors[k] = null;
}

// populate form when initial changes (for edit)
watch(
  () => props.initial,
  (v) => {
    if (!v) return;
    // backend returns times like HH:mm:ss; convert to moment objects for TimePicker
    form.name = v.name ?? '';
    form.nameAscii = v.nameAscii ?? '';
    form.code = v.code ?? '';
    dayjs.extend(customParseFormat);
    const parseTime = (s: any) => {
      if (!s) return null;
      const d = dayjs(s, ['HH:mm:ss', 'HH:mm']);
      return d.isValid() ? d : null;
    };
    form.fromTime = parseTime(v.fromTime);
    form.toTime = parseTime(v.toTime);
    form.overShift = !!v.overShift;
    form.hasBreak = !!v.hasBreak;
    form.breakFrom = parseTime(v.breakFrom);
    form.breakTo = parseTime(v.breakTo);
    form.flexible = !!v.flexible;
    form.minCheckIn = parseTime(v.minCheckIn);
    form.maxCheckIn = parseTime(v.maxCheckIn);
    form.minCheckOut = parseTime(v.minCheckOut);
    form.maxCheckOut = parseTime(v.maxCheckOut);
  },
  { immediate: false },
);

async function submit() {
  try {
    // validation
    let valid = true;
    // name required, max 255
    if (!form.name || !form.name.toString().trim()) {
      errors.name = 'Tên là bắt buộc';
      valid = false;
    } else if (form.name.toString().length > 255) {
      errors.name = 'Tên không được dài hơn 255 ký tự';
      valid = false;
    } else {
      errors.name = null;
    }

    // nameAscii max 20
    if (form.nameAscii && form.nameAscii.toString().length > 20) {
      errors.nameAscii = 'Tên ASCII không được dài hơn 20 ký tự';
      valid = false;
    } else {
      errors.nameAscii = null;
    }

    // code max 10
    if (form.code && form.code.toString().length > 10) {
      errors.code = 'Mã không được dài hơn 10 ký tự';
      valid = false;
    } else {
      errors.code = null;
    }

    if (!valid) {
      message.error('Vui lòng sửa lỗi trên form');
      return;
    }

    // convert TimePicker value to HH:mm (minutes precision)
    const payload: any = { ...form };
    const toISO = (t: any) => (t && t.format ? t.format('HH:mm') : t);
    payload.fromTime = toISO(form.fromTime);
    payload.toTime = toISO(form.toTime);
    payload.breakFrom = toISO(form.breakFrom);
    payload.breakTo = toISO(form.breakTo);
    payload.minCheckIn = toISO(form.minCheckIn);
    payload.maxCheckIn = toISO(form.maxCheckIn);
    payload.minCheckOut = toISO(form.minCheckOut);
    payload.maxCheckOut = toISO(form.maxCheckOut);

    if (props.initial && (props.initial as any).id) {
      await updateWorkShift((props.initial as any).id, payload);
      message.success('Cập nhật ca làm việc thành công');
    } else {
      await createWorkShift(payload);
      message.success('Tạo ca làm việc thành công');
    }
    // close drawer and notify parent to refresh
    emit('update:open', false);
    emit('saved');
    // reset local form for next open
    resetForm();
  } catch (err: any) {
    message.error(err?.message ?? 'Failed to create work shift');
  }
}
</script>
<template>
  <ADrawer v-model:open="visible" title="Tạo Ca Làm việc" width="600px" @close="close">
    <div class="p-4">
      <AForm layout="vertical">
        <!-- Dòng 1: Tên (full width) -->
        <AFormItem label="Tên" :validate-status="errors.name ? 'error' : undefined" :help="errors.name">
          <AInput v-model:value="form.name" :maxlength="255" placeholder="Nhập tên ca làm việc" />
        </AFormItem>

        <!-- Dòng 2: Tên ASCII và Mã -->
        <div class="grid grid-cols-2 gap-4">
          <AFormItem label="Tên ASCII" :validate-status="errors.nameAscii ? 'error' : undefined" :help="errors.nameAscii">
            <AInput v-model:value="form.nameAscii" :maxlength="20" placeholder="Nhập tên ASCII" />
          </AFormItem>
          <AFormItem label="Mã" :validate-status="errors.code ? 'error' : undefined" :help="errors.code">
            <AInput v-model:value="form.code" :maxlength="10" placeholder="Nhập mã" />
          </AFormItem>
        </div>

        <!-- Dòng 3: Từ - Đến - Qua ca -->
        <div class="grid grid-cols-3 gap-3">
          <AFormItem label="Qua ca">
            <ASwitch v-model:checked="form.overShift" />
          </AFormItem>
          <AFormItem label="Từ">
            <ATimePicker
              v-model:value="form.fromTime"
              :open="pickerOpen.from"
              @openChange="(v) => (pickerOpen.from = v)"
              @change="(val) => handleTimeChange('fromTime', val, 'from')"
              format="HH:mm"
              :showNow="false"
            />
          </AFormItem>
          <AFormItem label="Đến">
            <ATimePicker
              v-model:value="form.toTime"
              :open="pickerOpen.to"
              @openChange="(v) => (pickerOpen.to = v)"
              @change="(val) => handleTimeChange('toTime', val, 'to')"
              format="HH:mm"
              :showNow="false"
            />
          </AFormItem>
        </div>

        <!-- Dòng 4: Có nghỉ - Break từ - Break đến -->
        <div class="grid grid-cols-3 gap-3">
           <AFormItem label="Nghỉ giữa ca">
              <ASwitch v-model:checked="form.hasBreak" />
           </AFormItem>
          <AFormItem label="Break từ">
            <ATimePicker
              v-model:value="form.breakFrom"
              :disabled="!form.hasBreak"
              :open="pickerOpen.breakFrom"
              @openChange="(v) => (pickerOpen.breakFrom = v)"
              @change="(val) => handleTimeChange('breakFrom', val, 'breakFrom')"
              format="HH:mm"
              :showNow="false"
            />
          </AFormItem>
          <AFormItem label="Break đến">
            <ATimePicker
              v-model:value="form.breakTo"
              :disabled="!form.hasBreak"
              :open="pickerOpen.breakTo"
              @openChange="(v) => (pickerOpen.breakTo = v)"
              @change="(val) => handleTimeChange('breakTo', val, 'breakTo')"
              format="HH:mm"
              :showNow="false"
            />
          </AFormItem>
        </div>

        <!-- Dòng 5: Flexible switch -->
        <div class="flex items-center gap-2 mt-6 mb-4">
          <ASwitch v-model:checked="form.flexible" />
          <span class="font-medium">Flexible</span>
        </div>

        <!-- Dòng 6-7: Min/Max Check In và Check Out -->
        <div class="grid grid-cols-2 gap-4">
          <AFormItem label="Min Check In">
            <ATimePicker
              v-model:value="form.minCheckIn"
              :disabled="!form.flexible"
              :open="pickerOpen.minCheckIn"
              @openChange="(v) => (pickerOpen.minCheckIn = v)"
              @change="(val) => handleTimeChange('minCheckIn', val, 'minCheckIn')"
              format="HH:mm"
              class="w-full"
              :showNow="false"
            />
          </AFormItem>
          <AFormItem label="Max Check In">
            <ATimePicker
              v-model:value="form.maxCheckIn"
              :disabled="!form.flexible"
              :open="pickerOpen.maxCheckIn"
              @openChange="(v) => (pickerOpen.maxCheckIn = v)"
              @change="(val) => handleTimeChange('maxCheckIn', val, 'maxCheckIn')"
              format="HH:mm"
              class="w-full"
              :showNow="false"
            />
          </AFormItem>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <AFormItem label="Min Check Out">
            <ATimePicker
              v-model:value="form.minCheckOut"
              :disabled="!form.flexible"
              :open="pickerOpen.minCheckOut"
              @openChange="(v) => (pickerOpen.minCheckOut = v)"
              @change="(val) => handleTimeChange('minCheckOut', val, 'minCheckOut')"
              format="HH:mm"
              class="w-full"
              :showNow="false"
            />
          </AFormItem>
          <AFormItem label="Max Check Out">
            <ATimePicker
              v-model:value="form.maxCheckOut"
              :disabled="!form.flexible"
              :open="pickerOpen.maxCheckOut"
              @openChange="(v) => (pickerOpen.maxCheckOut = v)"
              @change="(val) => handleTimeChange('maxCheckOut', val, 'maxCheckOut')"
              format="HH:mm"
              class="w-full"
              :showNow="false"
            />
          </AFormItem>
        </div>

        <!-- Buttons -->
        <div class="mt-8 flex justify-end gap-3">
          <AButton @click="close">Hủy</AButton>
          <AButton type="primary" @click="submit">Lưu</AButton>
        </div>
      </AForm>
    </div>
  </ADrawer>
</template>
<style scoped>
:deep(.ant-picker-footer) {
  display: none;
}
</style>
