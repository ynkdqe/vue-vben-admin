import { baseRequestClient, requestClient } from '#/api/request';

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
    accessToken: string;
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
    client_id: data.client_id || import.meta.env.VITE_CLIENT_ID,
    client_secret: data.client_secret || import.meta.env.VITE_CLIENT_SECRET,
    scope: data.scope || import.meta.env.VITE_SCOPE,
    grant_type: data.grant_type || import.meta.env.VITE_GRANT_TYPE,
  };
  
  return requestClient.post<AuthApi.LoginResult>('/auth/login', loginData);
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
