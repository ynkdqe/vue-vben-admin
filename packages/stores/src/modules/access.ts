import type { RouteRecordRaw } from 'vue-router';

import type { MenuRecordRaw } from '@vben-core/typings';

import { acceptHMRUpdate, defineStore } from 'pinia';

type AccessToken = null | string;

interface AccessState {
  /** permission codes of current user */
  accessCodes?: string[];
  accessMenus: MenuRecordRaw[];
  accessRoutes: RouteRecordRaw[];
  accessToken: AccessToken;
  expiresAt?: number;
  isAccessChecked: boolean;
  isLockScreen: boolean;
  lockScreenPassword?: string;
  loginExpired: boolean;
  refreshToken: AccessToken;
}

/**
 * @vi_VN Liên quan đến quyền truy cập
 */
export const useAccessStore = defineStore('core-access', {
  actions: {
    getMenuByPath(path: string) {
      function findMenu(
        menus: MenuRecordRaw[],
        path: string,
      ): MenuRecordRaw | undefined {
        for (const menu of menus) {
          if (menu.path === path) {
            return menu;
          }
          if (menu.children) {
            const matched = findMenu(menu.children, path);
            if (matched) {
              return matched;
            }
          }
        }
      }
      return findMenu(this.accessMenus, path);
    },
    lockScreen(password: string) {
      this.isLockScreen = true;
      this.lockScreenPassword = password;
    },
    setAccessMenus(menus: MenuRecordRaw[]) {
      this.accessMenus = menus;
    },
    setAccessRoutes(routes: RouteRecordRaw[]) {
      this.accessRoutes = routes;
    },
    setAccessToken(token: any) {
      if (!token) {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = 0;
        return;
      }

      this.accessToken = token.access_token ?? null;
      this.refreshToken = token.refresh_token ?? null;

      const expiresIn = Number(token.expires_in);
      this.expiresAt = Number.isFinite(expiresIn)
        ? Math.floor(Date.now() / 1000) + expiresIn
        : 0;
    },
    setIsAccessChecked(isAccessChecked: boolean) {
      this.isAccessChecked = isAccessChecked;
    },
    setLoginExpired(loginExpired: boolean) {
      this.loginExpired = loginExpired;
    },
    unlockScreen() {
      this.isLockScreen = false;
      this.lockScreenPassword = undefined;
    },
  },
  persist: {
    // Lưu trữ bền vững
    pick: [
      'accessToken',
      'refreshToken',
      'expiresAt',
      'accessCodes',
      'isLockScreen',
      'lockScreenPassword',
    ],
  },
  state: (): AccessState => ({
    accessMenus: [],
    accessRoutes: [],
    accessCodes: [],
    accessToken: null,
    isAccessChecked: false,
    isLockScreen: false,
    lockScreenPassword: undefined,
    loginExpired: false,
    refreshToken: null,
    expiresAt: 0,
  }),
});

// Giải quyết vấn đề hot update
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useAccessStore, hot));
}
