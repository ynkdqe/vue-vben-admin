import type { HubConnection } from '@microsoft/signalr';

import { useAccessStore } from '@vben/stores';

import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

type NotificationHandler = (data: any) => void;

class NotificationHubService {
  private connection: HubConnection | null = null;
  private handlers: Set<NotificationHandler> = new Set();
  private started = false;

  addHandler(handler: NotificationHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async start() {
    if (this.started) return;
    const accessStore = useAccessStore();

    this.connection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_GLOB_API_URL}/hub/app`, {
        accessTokenFactory: () => accessStore.accessToken ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    // Avoid duplicate binding if HMR or reconnect logic reuses the instance
    this.connection.off('HubMessage');
    this.connection.on('HubMessage', (data) => {
      // Ghi log phục vụ debug (use warn to satisfy lint rule)
      console.warn('HubMessage:', data);
      // Phát lại cho tất cả subscriber trong ứng dụng
      for (const h of this.handlers) {
        try {
          h(data);
        } catch (error) {
          console.error('[NotificationHub] handler error', error);
        }
      }
    });

    try {
      await this.connection.start();
      this.started = true;
      console.warn('[NotificationHub] connected');
    } catch (error) {
      console.error('[NotificationHub] failed to connect', error);
    }
  }

  async stop() {
    if (this.connection && this.started) {
      await this.connection.stop();
      this.started = false;
      console.warn('[NotificationHub] disconnected');
    }
  }
}

// Ensure true singleton across HMR
const g = globalThis as unknown as {
  __notificationHub?: NotificationHubService;
};
if (!g.__notificationHub) {
  g.__notificationHub = new NotificationHubService();
}
export const notificationHub = g.__notificationHub as NotificationHubService;
