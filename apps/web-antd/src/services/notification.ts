import type { NotificationItem as LayoutNotificationItem } from '@vben/layouts';

import type { NotificationUserItem as ApiNotificationItem } from '#/api/sms/notification';

import { computed, ref } from 'vue';

import {
  fetchNotificationList,
  updateNotificationStatus,
} from '#/api/sms/notification';

import { notificationHub } from './notification-hub';

// Extended notification item that includes ID for API operations
export interface NotificationItem extends LayoutNotificationItem {
  id: string;
}

/**
 * Transform API notification to UI notification format
 */
function transformNotification(
  apiNotification: ApiNotificationItem,
): NotificationItem {
  return {
    id: apiNotification.id,
    avatar:
      apiNotification.icon || 'https://avatar.vercel.sh/default.svg?text=NT',
    date: formatDate(apiNotification.creationTime),
    isRead: apiNotification.status === 1,
    message: apiNotification.message,
    title: apiNotification.title,
  };
}

/**
 * Format date to relative time
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

class NotificationService {
  get isLoading() {
    return this.loading;
  }

  get notificationsList() {
    return this.notifications;
  }

  get showDot() {
    return computed(() =>
      this.notifications.value.some((item) => !item.isRead),
    );
  }

  get unreadCount() {
    return computed(
      () => this.notifications.value.filter((item) => !item.isRead).length,
    );
  }

  private loading = ref(false);
  private notifications = ref<NotificationItem[]>([]);
  private unsubscribers: (() => void)[] = [];

  constructor() {
    this.initializeHub();
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications.value = [];
  }

  /**
   * Load notifications from API
   */
  async loadNotifications(
    params: {
      page?: number;
      pageSize?: number;
      status?: number;
    } = {},
  ) {
    try {
      this.loading.value = true;
      const result = await fetchNotificationList({
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        status: params.status,
      });

      this.notifications.value = result.items.map((item) =>
        transformNotification(item),
      );
      return result;
    } catch (error) {
      console.error('Failed to load notifications:', error);
      throw error;
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const unreadNotifications = this.notifications.value.filter(
        (n) => !n.isRead,
      );
      if (unreadNotifications.length === 0) return;

      // Update UI immediately for better UX
      unreadNotifications.forEach((n) => (n.isRead = true));

      // Update on server
      const unreadIds = unreadNotifications.map((n) => n.id);
      try {
        await updateNotificationStatus(unreadIds, 1);
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
        // Revert UI changes on error
        unreadNotifications.forEach((n) => (n.isRead = false));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    try {
      await updateNotificationStatus([notificationId], 1);

      const notification = this.notifications.value.find(
        (n) => n.id === notificationId,
      );
      if (notification) {
        notification.isRead = true;
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }

  /**
   * Start the notification service (connect to hub and load initial data)
   */
  async start() {
    try {
      // Start SignalR hub connection
      await notificationHub.start();

      // Load initial notifications
      await this.loadNotifications();

      // Request notification permission
      await this.requestNotificationPermission();
    } catch (error) {
      console.error('Failed to start notification service:', error);
    }
  }

  /**
   * Stop the notification service
   */
  async stop() {
    try {
      await notificationHub.stop();
      this.unsubscribers.forEach((unsub) => unsub());
      this.unsubscribers = [];
    } catch (error) {
      console.error('Failed to stop notification service:', error);
    }
  }

  /**
   * Handle new notification from SignalR hub
   */
  private handleNewNotification(data: any) {
    try {
      // Transform the received data to NotificationItem format
      const newNotification: NotificationItem = {
        id: data.id || Date.now().toString(),
        avatar:
          data.icon ||
          data.avatar ||
          'https://avatar.vercel.sh/default.svg?text=NT',
        date: 'just now',
        isRead: false,
        message: data.message || data.content || '',
        title: data.title || 'New Notification',
      };

      // Add to the beginning of the list (most recent first)
      this.notifications.value.unshift(newNotification);

      // Keep only the latest 50 notifications to prevent memory issues
      if (this.notifications.value.length > 50) {
        this.notifications.value = this.notifications.value.slice(0, 50);
      }

      // Show browser notification if permission is granted
      this.showBrowserNotification(newNotification);
    } catch (error) {
      console.error('Error handling new notification:', error);
    }
  }

  /**
   * Initialize SignalR hub connection and handlers
   */
  private initializeHub() {
    const unsubscribe = notificationHub.addHandler((data) => {
      this.handleNewNotification(data);
    });
    this.unsubscribers.push(unsubscribe);
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: NotificationItem) {
    if ('Notification' in window && Notification.permission === 'granted') {
      // eslint-disable-next-line no-new
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.avatar,
      });
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
