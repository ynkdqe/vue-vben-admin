import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** Tham số của API đăng nhập */
  export interface LoginParams {
    password?: string;
    username?: string;
    client_id?: string;
    client_secret?: string;
    scope?: string;
    grant_type?: string;
  }

  /** Giá trị trả về của API đăng nhập */
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
 * Đăng nhập
 */
export async function loginApi(data: AuthApi.LoginParams) {
  const loginData = {
    ...data,
    client_id: import.meta.env.VITE_APP_CLIENT_ID,
    client_secret: import.meta.env.VITE_APP_CLIENT_SECRET,
    scope: import.meta.env.VITE_APP_SCOPE,
    grant_type: import.meta.env.VITE_APP_GRANT_TYPE,
  };
  return requestClient.post<AuthApi.LoginResult>('/connect/token', loginData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    responseReturn: 'body',
  });
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi(refreshToken: any) {
  const refreshData = {
    client_id: import.meta.env.VITE_APP_CLIENT_ID,
    client_secret: import.meta.env.VITE_APP_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  };

  return baseRequestClient.post<any>('/connect/token', refreshData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    responseReturn: 'body',
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/connect/endsession', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}
