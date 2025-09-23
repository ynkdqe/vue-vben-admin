import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description Tệp cấu hình dự án
 * Chỉ cần ghi đè một phần cấu hình trong dự án, những cấu hình không cần thì không cần ghi đè.
 * Hệ thống sẽ tự động sử dụng cấu hình mặc định
 * !!! Sau khi thay đổi cấu hình, vui lòng xóa bộ nhớ đệm, nếu không có thể sẽ không có hiệu lực
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    locale: 'vi-VN',
    authPageLayout: 'panel-center', // Căn giữa form đăng nhập
  },
});
