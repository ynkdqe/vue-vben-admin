import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useAccessStore } from './access';

describe('useAccessStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('updates accessMenus state', () => {
    const store = useAccessStore();
    expect(store.accessMenus).toEqual([]);
    store.setAccessMenus([{ name: 'Dashboard', path: '/dashboard' }]);
    expect(store.accessMenus).toEqual([
      { name: 'Dashboard', path: '/dashboard' },
    ]);
  });

  it('updates accessToken state correctly', () => {
    const store = useAccessStore();
    expect(store.accessToken).toBeNull(); // 初始状态

    // Test with token object (new format)
    store.setAccessToken({
      access_token: 'abc123',
      refresh_token: 'refresh123',
      expires_in: 3600,
    });
    expect(store.accessToken).toBe('abc123');
    expect(store.refreshToken).toBe('refresh123');
    expect(store.expiresAt).toBeGreaterThan(0);
  });

  it('returns the correct accessToken', () => {
    const store = useAccessStore();
    store.setAccessToken({
      access_token: 'xyz789',
      refresh_token: 'refresh789',
      expires_in: 7200,
    });
    expect(store.accessToken).toBe('xyz789');
    expect(store.refreshToken).toBe('refresh789');
  });

  it('handles null token correctly', () => {
    const store = useAccessStore();
    // Set token first
    store.setAccessToken({
      access_token: 'test',
      refresh_token: 'test_refresh',
      expires_in: 3600,
    });
    expect(store.accessToken).toBe('test');

    // Clear token
    store.setAccessToken(null);
    expect(store.accessToken).toBeNull();
    expect(store.refreshToken).toBeNull();
    expect(store.expiresAt).toBe(0);
  });

  it('handles empty token object correctly', () => {
    const store = useAccessStore();
    store.setAccessToken({});
    expect(store.accessToken).toBeNull();
    expect(store.refreshToken).toBeNull();
    expect(store.expiresAt).toBe(0);
  });

  // 测试设置空的访问菜单列表
  it('handles empty accessMenus correctly', () => {
    const store = useAccessStore();
    store.setAccessMenus([]);
    expect(store.accessMenus).toEqual([]);
  });

  // 测试设置空的访问路由列表
  it('handles empty accessRoutes correctly', () => {
    const store = useAccessStore();
    store.setAccessRoutes([]);
    expect(store.accessRoutes).toEqual([]);
  });
});
