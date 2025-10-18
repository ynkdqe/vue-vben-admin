import { requestClient } from '#/api/request';

export interface WorkShift {
  id: number;
  name: string;
  nameAscii?: string;
  code?: string;
  fromTime?: string;
  toTime?: string;
  overShift?: boolean;
  hasBreak?: boolean;
  breakFrom?: string;
  breakTo?: string;
  flexible?: boolean;
  minCheckIn?: string;
  maxCheckIn?: string;
  minCheckOut?: string;
  maxCheckOut?: string;
  isDeleted?: boolean;
  tenantId?: string;
  extraProperties?: Record<string, any>;
}

export async function getWorkShifts(params: Record<string, any> = {}) {
  const res = await requestClient.get('/api/hrms/workshifts', {
    params,
    responseReturn: 'body',
  });

  // Normalize response to an array
  const data = res?.data ?? res ?? [];
  if (Array.isArray(data)) return data as WorkShift[];
  if (Array.isArray(data.data)) return data.data as WorkShift[];
  return [];
}

export async function createWorkShift(payload: Partial<WorkShift>) {
  return requestClient.post('/api/hrms/workshifts', payload, { responseReturn: 'body' });
}

export async function getWorkShiftById(id: number | string) {
  const res = await requestClient.get(`/api/hrms/workshifts/${id}`, { responseReturn: 'body' });
  // backend wraps item in data
  return res?.data ?? res;
}

export async function updateWorkShift(id: number | string, payload: Partial<WorkShift>) {
  return requestClient.put(`/api/hrms/workshifts/${id}`, payload, { responseReturn: 'body' });
}

export async function deleteWorkShift(id: number | string) {
  return requestClient.delete(`/api/hrms/workshifts/${id}`, { responseReturn: 'body' });
}
