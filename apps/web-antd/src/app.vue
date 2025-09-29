<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';

import { useAntdDesignTokens } from '@vben/hooks';
import { preferences, usePreferences } from '@vben/preferences';

import { App, ConfigProvider, theme } from 'ant-design-vue';

import { antdLocale } from '#/locales';

import {
  startAutoRefreshTokenJob,
  stopAutoRefreshTokenJob,
} from './utils/auto-refresh-token-job';
import { startTimeLogger, stopTimeLogger } from './utils/time-logger';

defineOptions({ name: 'App' });

const { isDark } = usePreferences();
const { tokens } = useAntdDesignTokens();

onMounted(() => {
  startAutoRefreshTokenJob();
  startTimeLogger();
});

onBeforeUnmount(() => {
  stopAutoRefreshTokenJob();
  stopTimeLogger();
});

const tokenTheme = computed(() => {
  const algorithm = isDark.value
    ? [theme.darkAlgorithm]
    : [theme.defaultAlgorithm];

  // antd compact mode algorithm
  if (preferences.app.compact) {
    algorithm.push(theme.compactAlgorithm);
  }

  return {
    algorithm,
    token: tokens,
  };
});
</script>

<template>
  <ConfigProvider :locale="antdLocale" :theme="tokenTheme">
    <App>
      <RouterView />
    </App>
  </ConfigProvider>
</template>
