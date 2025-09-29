import { preferences } from '@vben/preferences';
import { useAccessStore } from '@vben/stores';

import { refreshTokenApi } from '#/api/core';

import { registerSimpleIntervalJob, removeJob } from './scheduler';

const JOB_ID = 'auto-refresh-token';
const REFRESH_THRESHOLD_SECONDS = 5 * 60;
let isRegistered = false;
let isRefreshing = false;

async function handleRefresh(): Promise<void> {
  if (!preferences.app.enableRefreshToken) {
    return;
  }

  const accessStore = useAccessStore();
  const { accessToken, expiresAt, refreshToken } = accessStore;
  if (!accessToken || !expiresAt || !refreshToken) {
    return;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const remainingLifetime = expiresAt - nowInSeconds;
  if (remainingLifetime > REFRESH_THRESHOLD_SECONDS) {
    return;
  }

  if (isRefreshing) {
    return;
  }

  isRefreshing = true;

  try {
    const response = await refreshTokenApi(refreshToken);
    const payload = response?.data ?? response;

    if (
      payload?.access_token &&
      payload?.refresh_token &&
      typeof payload?.expires_in === 'number'
    ) {
      accessStore.setAccessToken(payload);
    } else {
      console.warn(
        '[TokenRefreshJob] Unexpected refresh token payload',
        payload,
      );
    }
  } catch (error) {
    console.error('[TokenRefreshJob] Failed to refresh access token', error);
  } finally {
    isRefreshing = false;
  }
}

export function startAutoRefreshTokenJob(): void {
  if (isRegistered) {
    return;
  }

  registerSimpleIntervalJob(JOB_ID, {
    handler: handleRefresh,
    schedule: { seconds: 200 },
  });

  isRegistered = true;
}

export function stopAutoRefreshTokenJob(): void {
  if (!isRegistered) {
    return;
  }

  removeJob(JOB_ID);
  isRegistered = false;
}
