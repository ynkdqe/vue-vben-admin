import { requestClient } from '#/api/request';

export interface NotificationItem {
  id: string;
  senderId: null | string;
  senderUserName: null | string;
  senderName: string;
  title: string;
  message: string;
  icon: string;
  url: string;
  type: number; // 0: Cá nhân, 1: Công khai
  creatorId: null | string;
  creationTime: string;
  creatorName: string;
  notificationUser: NotificationUserItem | null;
  notificationUsers: NotificationUserItem[];
}

export interface NotificationUserItem {
  id: string;
  notificationId: string;
  userId: null | string;
  name: string;
  userName: null | string;
  status: number;
  reatAt: null | string;
  senderId: null | string;
  senderUserName: null | string;
  senderName: string;
  title: string;
  message: string;
  icon: string;
  url: string;
  type: number; // 0: Cá nhân, 1: Công khai
  creatorId: null | string;
  creationTime: string;
  creatorName: string;
  totalCount: number;
  unreadCount: number;
}

export interface NotificationUserListResult {
  items: NotificationUserItem[];
  total: number;
  current: number;
  pageSize: number;
  totalUnread?: number;
}

export interface NotificationListResult {
  items: NotificationItem[];
  total: number;
  current: number;
  pageSize: number;
  totalUnread?: number;
}

function normalize(res: any): NotificationListResult {
  const body = res;
  const itemsField = (body?.data ||
    body?.items ||
    body?.records ||
    body?.list) as any[] | undefined;
  const items: NotificationItem[] = Array.isArray(itemsField)
    ? (itemsField as any)
    : [];
  const total =
    Number(body?.total ?? body?.totalCount ?? body?.count ?? items.length) || 0;
  const current =
    Number(body?.current ?? body?.pageIndex ?? body?.pageNumber ?? 1) || 1;
  const pageSize =
    Number(body?.pageSize ?? body?.size ?? body?.pageSizeValue ?? 20) || 20;
  const totalUnread = body?.dataExtend?.totalUnread;
  return { items, total, current, pageSize, totalUnread };
}

function normalizeUser(res: any): NotificationUserListResult {
  const body = res;
  const itemsField = (body?.data ||
    body?.items ||
    body?.records ||
    body?.list) as any[] | undefined;
  const items: NotificationUserItem[] = Array.isArray(itemsField)
    ? (itemsField as any)
    : [];
  const total =
    Number(body?.total ?? body?.totalCount ?? body?.count ?? items.length) || 0;
  const current =
    Number(body?.current ?? body?.pageIndex ?? body?.pageNumber ?? 1) || 1;
  const pageSize =
    Number(body?.pageSize ?? body?.size ?? body?.pageSizeValue ?? 20) || 20;
  const totalUnread = body?.dataExtend?.totalUnread;
  return { items, total, current, pageSize, totalUnread };
}
export async function fetchNotificationList(
  params: {
    endDate?: string; // ISO string
    keyword?: string;
    page?: number;
    pageSize?: number;
    startDate?: string; // ISO string
    status?: number | string;
  } = {},
) {
  const query: Record<string, any> = {
    current: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  };
  if (params.keyword && params.keyword.trim())
    query.keyword = params.keyword.trim();
  if (params.status !== undefined) query.status = params.status;
  if (params.startDate) query.startDate = params.startDate;
  if (params.endDate) query.endDate = params.endDate;
  const res = await requestClient.get('/api/sms/notification-user', {
    params: query,
    responseReturn: 'body',
  });
  return normalizeUser(res);
}

export async function fetchAdminNotificationList(
  params: {
    endDate?: string; // ISO string
    keyword?: string;
    page?: number;
    pageSize?: number;
    startDate?: string; // ISO string
    status?: number | string;
  } = {},
) {
  const query: Record<string, any> = {
    current: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  };
  if (params.keyword && params.keyword.trim())
    query.keyword = params.keyword.trim();
  if (params.status !== undefined) query.status = params.status;
  if (params.startDate) query.startDate = params.startDate;
  if (params.endDate) query.endDate = params.endDate;
  const res = await requestClient.get('/api/sms/notification', {
    params: query,
    responseReturn: 'body',
  });
  return normalize(res);
}

// TODO: Confirm endpoints with backend. Adjust paths/body if needed.
export async function updateNotificationStatus(ids: string[], status: 0 | 1) {
  // POST /api/sms/notification-user/status { ids, status }
  return requestClient.post(`/api/sms/notification-user/status`, {
    ids,
    status,
    responseReturn: 'body',
  });
}

export async function deleteNotification(id: string) {
  return requestClient.delete(`/api/sms/notification/${id}`, {
    responseReturn: 'body',
  } as any);
}

export async function deleteNotifications(ids: string[]) {
  // POST /api/sms/notification/batch-delete { ids }
  return requestClient.post(`/api/sms/notification/batch-delete`, {
    data: { ids },
    responseReturn: 'body',
  } as any);
}

// ---------------- Create Notification ----------------
export interface NotificationCreateDto {
  senderId?: null | string;
  receiverIds?: null | string[];
  title: string;
  message: string;
  icon?: null | string;
  url?: null | string;
  type: number; // 0: Private, 1: Public
  isSystem: boolean;
}

export async function createNotification(payload: NotificationCreateDto) {
  return requestClient.post(`/api/sms/notification`, payload, {
    responseReturn: 'body',
  } as any);
}
