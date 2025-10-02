import { requestClient } from '#/api/request';

export interface SmsProvider {
  id: string | number;
  name?: string;
  code?: string;
  status?: string | number | boolean;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface PageQuery {
  keyword?: string;
  status?: string | number;
  page?: number;
  pageSize?: number;
}

export interface ListResult<T = any> {
  items: T[];
  total: number;
}

function normalize(res: any): ListResult<SmsProvider> {
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

export async function fetchSmsProviderList(params: PageQuery = {}) {
  const { page, pageSize, keyword, status } = params;
  const query = {
    current: (params as any).current ?? page,
    pageSize,
    keyword,
    status,
  } as Record<string, any>;
  const res = await requestClient.get<any>('/api/sms/provider', {
    params: query,
    responseReturn: 'body',
  });
  return normalize(res);
}
