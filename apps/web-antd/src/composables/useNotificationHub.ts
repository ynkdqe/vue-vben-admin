import { onBeforeUnmount } from 'vue';
import { App as AntApp } from 'ant-design-vue';
import { notificationHub } from '../services/notification-hub';

/**
 * Dùng trong bất kỳ view/component nào để lắng nghe sự kiện từ SignalR
 */
export function useNotificationHub(options?: { showToast?: boolean }) {
  const { message } = AntApp.useApp();

  const off = notificationHub.addHandler((data) => {
    if (options?.showToast) {
      message.info(typeof data === 'string' ? data : JSON.stringify(data));
    }
  });

  onBeforeUnmount(() => off());

  return {
    onMessage: notificationHub.addHandler.bind(notificationHub),
  };
}
