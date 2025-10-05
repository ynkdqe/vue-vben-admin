import type { HubConnection } from '@microsoft/signalr';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useAccessStore } from '@vben/stores';

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

    this.connection.on('ReceiveNotification', (data) => {
      // Ghi log phục vụ debug
      console.log('Received notification:', data);
      // Phát lại cho tất cả subscriber trong ứng dụng
      for (const h of this.handlers) {
        try {
          h(data);
        } catch (e) {
          console.error('[NotificationHub] handler error', e);
        }
      }
    });

    try {
      await this.connection.start();
      this.started = true;
      console.info('[NotificationHub] connected');
    } catch (err) {
      console.error('[NotificationHub] failed to connect', err);
    }
  }

  async stop() {
    if (this.connection && this.started) {
      await this.connection.stop();
      this.started = false;
      console.info('[NotificationHub] disconnected');
    }
  }
}

export const notificationHub = new NotificationHubService();
