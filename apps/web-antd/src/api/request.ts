/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { useAuthStore } from '#/store';

import { refreshTokenApi } from './core';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  /**
   * Reauthentication logic
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
    }
  }

  /**
   * Refresh token logic
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    if (accessStore && accessStore.refreshToken) {
      const resp = await refreshTokenApi(accessStore.refreshToken);
      accessStore.setAccessToken(resp.data);
      return resp.access_token;
    }
    return '';
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // Request header processing
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();
      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = preferences.app.locale;
      return config;
    },
  });

  // Process the returned response data format: adapt to the default response of the backend
  // Backend response example：
  // {
  //   current: number,
  //   pageSize: number,
  //   total: number,
  //   success: boolean,
  //   data: any,
  //   message: string,
  //   dataExtend: any
  // }
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      // Switch code judgment to read success field
      codeField: 'success',
      // The field that needs to be returned is still data (data can be an object or an array)
      dataField: 'data',
      // success === true is considered successful
      successCode: (val: any) => val === true,
    }),
  );

  //Processing of expired token
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      // enableRefreshToken: preferences.app.enableRefreshToken,
      enableRefreshToken: true,
      formatToken,
    }),
  );

  // General error handling, if the error handling logic above is not entered, it will enter here.
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
     //Here you can customize according to the business. You can get the information in the error for customization and make different prompts according to different codes, instead of using message.error prompt msg
      //The error field returned by the current mock interface is error or message
      const responseData = error?.response?.data ?? {};
      const errorMessage = responseData?.error ?? responseData?.message ?? '';
      // If there is no error message, it will be prompted according to the status code
      message.error(errorMessage || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
