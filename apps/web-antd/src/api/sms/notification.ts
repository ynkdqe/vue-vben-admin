import { requestClient } from '#/api/request';

export interface NotificationItem {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  title: string;
  message: string;
  icon: string;
  url: string;
  isPublic: boolean;
  status: number; // 0 unread, 1 read
  type: number;
  tenantId: string;
  creatorId: string;
  creatorName: string;
  creationTime: string;
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
  const itemsField = (body?.data || body?.items || body?.records || body?.list) as any[] | undefined;
  const items: NotificationItem[] = Array.isArray(itemsField) ? (itemsField as any) : [];
  const total = Number(body?.total ?? body?.totalCount ?? body?.count ?? items.length) || 0;
  const current = Number(body?.current ?? body?.pageIndex ?? body?.pageNumber ?? 1) || 1;
  const pageSize = Number(body?.pageSize ?? body?.size ?? body?.pageSizeValue ?? 20) || 20;
  const totalUnread = body?.dataExtend?.totalUnread;
  return { items, total, current, pageSize, totalUnread };
}

export async function fetchNotificationList(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number | string;
  isMe?: boolean;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
} = {}) {
  const query: Record<string, any> = {
    current: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  };
  if (typeof params.isMe === 'boolean') query.isMe = params.isMe;
  if (params.keyword && params.keyword.trim()) query.keyword = params.keyword.trim();
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
export async function updateNotificationStatus(id: string, status: 0 | 1) {
  // PUT /api/sms/notification/{id}/status { status }
  return requestClient.put(`/api/sms/notification/${id}/status`, {
    data: { status },
    responseReturn: 'body',
  } as any);
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

export async function updateNotificationsStatus(ids: string[], status: 0 | 1) {
  // POST /api/sms/notification/batch-status { ids, status }
  return requestClient.post(`/api/sms/notification/batch-status`, {
    data: { ids, status },
    responseReturn: 'body',
  } as any);
}
