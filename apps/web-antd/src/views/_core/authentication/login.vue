<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { BasicOption } from '@vben/types';

import { computed } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

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
      },
      dependencies: {
        trigger(values, form) {
          if (values.tenant) {
            // Set username và password tự động
            form.setValues({
              password: '1q2w3E*',
              username: 'admin',
            });
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
        .default(' '),
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
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="authStore.authLogin"
  />
</template>
