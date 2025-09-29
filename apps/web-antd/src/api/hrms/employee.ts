import { requestClient } from '#/api/request';

// Types for Employee and query/pagination
export interface Employee {
  id: string | number;
  username?: string;
  employeeCode?: string;
  code?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
  status?: string | number | boolean;
  dateOfBirth?: string;
  dob?: string;
  birthDate?: string;
  joinDate?: string;
  startDate?: string;
  hireDate?: string;
  leaveDate?: string | null;
  resignationDate?: string | null;
  address?: string;
  [key: string]: any;
}

export interface EmployeeQuery {
  keyword?: string;
  status?: string | number;
  page?: number;
  pageSize?: number;
}

export interface EmployeeListResult {
  items: Employee[];
  total: number;
}

/**
 * Normalize backend response to a standard shape
 */
function normalizeListResponse(res: any): EmployeeListResult {
  // Common shapes supported:
  // - Array<Employee>
  // - { items: Employee[], total: number }
  // - { data: { items: Employee[], total } }
  // - { data: Employee[], total?: number }
  if (Array.isArray(res)) {
    return { items: res, total: res.length };
  }

  const data = res?.data ?? res;
  if (Array.isArray(data)) {
    return { items: data, total: Number(res?.total ?? data.length) };
  }
  if (Array.isArray(data?.items)) {
    return { items: data.items, total: Number(data?.total ?? data.items.length) };
  }
  if (Array.isArray(res?.items)) {
    return { items: res.items, total: Number(res?.total ?? res.items.length) };
  }
  return { items: [], total: 0 };
}

/**
 * GET /api/hrms/employee
 * You can adjust baseURL via environment; here we rely on global baseRequestClient
 */
export async function fetchEmployeeList(params: EmployeeQuery = {}) {
  // Pass query params as-is; backend should handle keyword/status/page/pageSize
  // Use responseReturn: 'body' to bypass code/data interceptor assumptions
  const res = await requestClient.get<any>('/api/hrms/employee', {
    params,
    responseReturn: 'body',
  });
  return normalizeListResponse(res);
}
