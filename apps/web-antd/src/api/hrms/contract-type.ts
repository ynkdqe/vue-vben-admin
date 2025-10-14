import { requestClient } from '#/api/request';

export interface ContractTypeDto {
  id: number | string;
  name: string;
  code?: string;
  hasSocialInsurance?: boolean;
  isTaxFixed?: boolean;
  taxPercent?: number;
  employeeSocialInsurancePercent?: number;
  employeeHealthInsurancePercent?: number;
  employeeUnemployeeInsurancePercent?: number;
  employeeUnionPercent?: number;
  employeeMinTaxSalary?: number;
  businessSocialInsurancePercent?: number;
  businessHealthInsurancePercent?: number;
  businessOccAccInsurancePercent?: number;
  businessUnemploymentInsurancePercent?: number;
  minInsuranceSalary?: number;
  [key: string]: any;
}

export interface ContractTypeQuery {
  current?: number;
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface ContractTypeListResult {
  items: ContractTypeDto[];
  total: number;
}

function normalizeListResponse(res: any): ContractTypeListResult {
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

export async function fetchContractTypeList(params: ContractTypeQuery = {}) {
  const res = await requestClient.get<any>('/api/hrms/contract-type', {
    params,
    responseReturn: 'body',
  });
  return normalizeListResponse(res);
}

export async function createContractType(payload: Record<string, any>) {
  const res = await requestClient.post<any>(
    '/api/hrms/contract-type',
    payload,
    {
      responseReturn: 'body',
    },
  );
  return res;
}
