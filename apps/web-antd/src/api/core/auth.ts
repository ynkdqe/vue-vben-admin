import { baseRequestClient, formRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
    client_id?: string;
    client_secret?: string;
    scope?: string;
    grant_type?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  // Tự động thêm các params từ environment variables
  const loginData = {
    ...data,
    client_id: data.client_id || import.meta.env.VITE_APP_CLIENT_ID,
    client_secret: data.client_secret || import.meta.env.VITE_APP_CLIENT_SECRET,
    scope: data.scope || import.meta.env.VITE_APP_SCOPE,
    grant_type: data.grant_type || import.meta.env.VITE_APP_GRANT_TYPE,
  };
  // Sử dụng formRequestClient để gửi data dưới dạng x-www-form-urlencoded
  return formRequestClient.post<AuthApi.LoginResult>('/connect/token', loginData);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}
