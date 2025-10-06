import { onMounted, onUnmounted } from 'vue';

import { notificationService } from '#/services/notification';

/**
 * Composable for managing notifications in components
 */
export function useNotifications() {
  const notifications = notificationService.notificationsList;
  const showDot = notificationService.showDot;
  const unreadCount = notificationService.unreadCount;
  const isLoading = notificationService.isLoading;

  const loadNotifications =
    notificationService.loadNotifications.bind(notificationService);
  const markAsRead = notificationService.markAsRead.bind(notificationService);
  const markAllAsRead =
    notificationService.markAllAsRead.bind(notificationService);
  const clearAll = notificationService.clearAll.bind(notificationService);
  const requestNotificationPermission =
    notificationService.requestNotificationPermission.bind(notificationService);

  return {
    // State
    notifications,
    showDot,
    unreadCount,
    isLoading,

    // Actions
    loadNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestNotificationPermission,
  };
}

/**
 * Composable for automatic notification service management
 * Use this in layout components or root components
 */
export function useNotificationService() {
  onMounted(async () => {
    try {
      await notificationService.start();
    } catch (error) {
      console.error('Failed to start notification service:', error);
    }
  });

  onUnmounted(async () => {
    try {
      await notificationService.stop();
    } catch (error) {
      console.error('Failed to stop notification service:', error);
    }
  });

  return notificationService;
}
