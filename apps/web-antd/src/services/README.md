# Hệ Thống Thông Báo (Notification System)

Thư mục này chứa hệ thống thông báo tích hợp với API SMS notification và SignalR hub để cập nhật real-time.

## Các File

- `notification.ts` - Service chính quản lý tích hợp API và giao tiếp SignalR hub
- `notification-hub.ts` - Service kết nối SignalR hub
- `../composables/useNotificationHub.ts` - Composable sử dụng SignalR hub trong components
- `../composables/useNotifications.ts` - Composable quản lý thông báo trong components

## Cách Sử Dụng

### Trong Layout Components

Hệ thống thông báo đã được tích hợp sẵn trong layout `basic.vue`:

```vue
<script setup>
import { useNotifications, useNotificationService } from '#/composables/useNotifications';

// Lấy dữ liệu và hành động thông báo
const { notifications, showDot, markAsRead, markAllAsRead, clearAll } = useNotifications();

// Khởi tạo notification service (xử lý kết nối SignalR và tải API)
useNotificationService();
</script>

<template>
  <Notification
    :dot="showDot"
    :notifications="notifications"
    @clear="clearAll"
    @make-all="markAllAsRead"
    @read="markAsRead"
  />
</template>
```

### Trong Các Components Khác

Đối với các components cần chức năng thông báo:

```vue
<script setup>
import { useNotifications } from '#/composables/useNotifications';

const { notifications, unreadCount, markAsRead } = useNotifications();
</script>
```

### Sử Dụng Service Trực Tiếp

Để sử dụng nâng cao, bạn có thể dùng notification service trực tiếp:

```typescript
import { notificationService } from '#/services/notification';

// Tải thông báo
await notificationService.loadNotifications({ page: 1, pageSize: 20 });

// Đánh dấu đã đọc
await notificationService.markAsRead('notification-id');

// Khởi động/dừng service
await notificationService.start();
await notificationService.stop();
```

## Tích Hợp API

Hệ thống tích hợp với các API endpoints sau:

- `GET /api/sms/notification` - Lấy danh sách thông báo
- `PUT /api/sms/notification/{id}/status` - Cập nhật trạng thái thông báo
- `DELETE /api/sms/notification/{id}` - Xóa thông báo
- `POST /api/sms/notification/batch-status` - Cập nhật trạng thái hàng loạt
- `POST /api/sms/notification/batch-delete` - Xóa hàng loạt

## Tích Hợp SignalR

Hệ thống kết nối với SignalR hub tại `/hub/app` và lắng nghe sự kiện `ReceiveNotification`. Khi nhận được thông báo mới:

1. Thêm vào danh sách thông báo
2. Hiển thị thông báo trình duyệt (nếu được cấp quyền)
3. Cập nhật UI tự động

## Tính Năng

- ✅ Thông báo real-time qua SignalR
- ✅ Tích hợp API với phân trang
- ✅ Chức năng đánh dấu đã đọc/chưa đọc
- ✅ Thông báo trình duyệt
- ✅ Định dạng ngày tự động
- ✅ Xử lý lỗi và trạng thái loading
- ✅ Hỗ trợ TypeScript
- ✅ Vue 3 Composition API

## Cấu Hình

URL SignalR hub được cấu hình qua biến môi trường `VITE_GLOB_API_URL`. Hệ thống tự động sử dụng access token từ authentication store.

## Cách Hoạt Động

1. **Khởi tạo**: Khi layout load, notification service bắt đầu và kết nối SignalR hub
2. **Tải dữ liệu**: Lấy thông báo ban đầu từ API
3. **Cập nhật real-time**: Lắng nghe sự kiện `ReceiveNotification` từ SignalR hub
4. **Cập nhật UI**: Tự động cập nhật danh sách thông báo và hiển thị thông báo trình duyệt
5. **Hành động người dùng**: Xử lý đánh dấu thông báo đã đọc, xóa thông báo, v.v.

## API Endpoints Sử Dụng

- `GET /api/sms/notification` - Lấy thông báo
- `PUT /api/sms/notification/{id}/status` - Cập nhật trạng thái thông báo
- SignalR Hub: `/hub/app` - Thông báo real-time

Hệ thống hiện đã hoạt động đầy đủ và sẵn sàng sử dụng. Khi có thông báo mới được gửi qua SignalR hub, chúng sẽ tự động xuất hiện trong dropdown thông báo và kích hoạt thông báo trình duyệt (nếu được cấp quyền).
