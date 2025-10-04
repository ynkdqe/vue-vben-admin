import { requestClient } from '#/api/request';

export interface SmsMessage {
  id: string | number;
  requestId?: string;
  smsProviderId?: number | string;
  smsTemplateId?: number | string;
  phoneNumber?: string;
  data?: string;
  message?: string;
  clientId?: string;
  status?: number;
  sendedTime?: string;
  creationTime?: string;
  request?: string;
  response?: string;
  [key: string]: any;
}

export interface PageQuery {
  keyword?: string;
  status?: number | string;
  smsProviderId?: number | string;
  smsTemplateId?: number | string;
  phoneNumber?: string;
  page?: number;
  pageSize?: number;
}

export interface ListResult<T = any> {
  items: T[];
  total: number;
}

function normalize(res: any): ListResult<SmsMessage> {
  if (Array.isArray(res)) return { items: res, total: res.length };
  if (Array.isArray(res?.data) && typeof res?.total !== 'undefined') {
    return { items: res.data, total: Number(res.total) };
  }
  if (Array.isArray(res?.data?.items)) {
    return { items: res.data.items, total: Number(res.data.total ?? res.data.items.length) };
  }
  if (Array.isArray(res?.items)) {
    return { items: res.items, total: Number(res.total ?? res.items.length) };
  }
  return { items: [], total: 0 };
}

export async function fetchSmsMessageList(params: PageQuery = {}) {
  const { page, pageSize, keyword, status, smsProviderId, smsTemplateId, phoneNumber } = params;
  const query = {
    current: (params as any).current ?? page,
    pageSize,
    keyword,
    status,
    smsProviderId,
    smsTemplateId,
    phoneNumber,
  } as Record<string, any>;
  const res = await requestClient.get<any>('/api/sms/message', {
    params: query,
    responseReturn: 'body',
  });
  return normalize(res);
}

export async function sendSmsMessage(payload: {
  phoneNumber: string;
  clientId: string;
  smsTemplateId: number | string;
  data: Record<string, any>;
}) {
  const res = await requestClient.post<any>('/api/sms/message', payload, {
    responseReturn: 'body',
  });
  return res;
}
