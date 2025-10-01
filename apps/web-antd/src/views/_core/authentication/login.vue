<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed, onMounted, ref } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

const TENANT_STORAGE_KEY = `REMEMBER_ME_TENANT_${location.hostname}`;

const storedTenant =
  typeof window === 'undefined'
    ? ' '
    : (localStorage.getItem(TENANT_STORAGE_KEY) ?? ' ');

const loginRef = ref<InstanceType<typeof AuthenticationLogin> | null>(null);

function persistTenant(value?: string) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(TENANT_STORAGE_KEY, value ?? ' ');
}

const TENANT_OPTIONS: BasicOption[] = [
  {
    label: 'Administration',
    value: ' ',
  },
  {
    label: 'FRT',
    value: 'FRT',
  },
  {
    label: 'VSC',
    value: 'VSC',
  },
  {
    label: 'F88',
    value: 'F88',
  },
];

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenSelect',
      componentProps: {
        options: TENANT_OPTIONS,
        placeholder: $t('authentication.selectAccount'),
        defaultValue: storedTenant,
      },
      dependencies: {
        trigger(values, form) {
          if (values.tenant) {
            // Set username và password tự động
            form.setValues({
              password: '1q2w3E*',
              username: 'admin',
              tenant: values.tenant,
            });
            persistTenant(values.tenant);
          } else {
            persistTenant(' ');
          }
        },
        triggerFields: ['tenant'],
      },
      fieldName: 'tenant',
      label: $t('authentication.selectAccount'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.selectAccount') })
        .optional()
        .default(storedTenant || ' '),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
  ];
});

async function handleLogin(values: Record<string, any>) {
  persistTenant(values?.tenant);
  return authStore.authLogin(values);
}

onMounted(() => {
  const tenant = storedTenant;
  if (!tenant) {
    return;
  }
  const formApi = loginRef.value?.getFormApi?.();
  if (!formApi) {
    return;
  }
  formApi.setFieldValue('tenant', tenant);
});
</script>

<template>
  <AuthenticationLogin
    ref="loginRef"
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="handleLogin"
  />
</template>
