import { requestClient } from '#/api/request';

export interface ContractDto {
  id: number | string;
  contractCode: string;
  employeeId: number | string;
  contractTypeId: number | string;
  effectiveDate: string;
  expiryDate: string;
  basicSalary: number;
  kpi: number;
  allowance: number;
  totalSalary: number;
  insuranceType: number;
  insurance: number;
  tax: number;
  costType: number;
  status: number;
  note?: string;
  [key: string]: any;
}

export interface ContractQuery {
  keyword?: string;
  status?: number | string;
  current?: number;
  page?: number;
  pageSize?: number;
  effectiveStart?: string; // ISO
  effectiveEnd?: string; // ISO
}

export interface ContractListResult {
  items: ContractDto[];
  total: number;
}

function normalizeListResponse(res: any): ContractListResult {
  // Expected envelope: { current, pageSize, total, success, data: [] }
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

/**
 * GET /api/hrms/contract
 */
export async function fetchContractList(params: ContractQuery = {}) {
  const {
    page,
    current,
    pageSize,
    keyword,
    status,
    effectiveStart,
    effectiveEnd,
  } = params;
  const query: Record<string, any> = {
    current: current ?? page,
    pageSize,
    keyword,
    status,
    effectiveStart,
    effectiveEnd,
  };
  const res = await requestClient.get<any>('/api/hrms/contract', {
    params: query,
    responseReturn: 'body',
  });
  return normalizeListResponse(res);
}

/**
 * POST /api/hrms/contract
 */
export async function createContract(payload: Record<string, any>) {
  const res = await requestClient.post<any>('/api/hrms/contract', payload, {
    responseReturn: 'body',
  });
  // If API returns created object or envelope, return it directly
  return res;
}
