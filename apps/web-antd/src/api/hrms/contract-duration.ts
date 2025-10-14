import { requestClient } from '#/api/request';

export interface ContractDurationDto {
  id?: number | string;
  contractTypeId: number | string;
  name: string;
  duration: number;
  [key: string]: any;
}

export interface ContractDurationQuery {
  current?: number;
  page?: number;
  pageSize?: number;
  keyword?: string;
  contractTypeId?: number | string;
}

export interface ContractDurationListResult {
  items: ContractDurationDto[];
  total: number;
}

function normalizeListResponse(res: any): ContractDurationListResult {
  if (Array.isArray(res)) return { items: res, total: res.length };
  const data = res?.data ?? res;
  if (Array.isArray(res?.data))
    return { items: res.data, total: Number(res?.total ?? res.data.length) };
  if (Array.isArray(data?.items))
    return {
      items: data.items,
      total: Number(data?.total ?? data.items.length),
    };
  if (Array.isArray(data))
    return { items: data, total: Number(res?.total ?? data.length) };
  if (Array.isArray(res?.items))
    return { items: res.items, total: Number(res?.total ?? res.items.length) };
  return { items: [], total: 0 };
}

export async function fetchContractDurationList(
  params: ContractDurationQuery = {},
) {
  const res = await requestClient.get<any>('/api/hrms/contract-duration', {
    params,
    responseReturn: 'body',
  });
  return normalizeListResponse(res);
}

export async function createContractDuration(payload: Record<string, any>) {
  const res = await requestClient.post<any>(
    '/api/hrms/contract-duration',
    payload,
    {
      responseReturn: 'body',
    },
  );
  return res;
}

export async function deleteContractDuration(id: number | string) {
  const res = await requestClient.delete<any>(
    `/api/hrms/contract-duration/${id}`,
    {
      responseReturn: 'body',
    },
  );
  return res;
}
