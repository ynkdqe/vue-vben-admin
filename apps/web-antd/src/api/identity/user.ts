import { requestClient } from '#/api/request';

export interface IdentityUser {
  id: string;
  userName: string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  isActive?: boolean;
}

export interface GetIdentityUsersParams {
  filter?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface GetIdentityUsersResponse {
  items?: IdentityUser[];
  totalCount?: number;
  data?: { items?: IdentityUser[]; totalCount?: number };
}

export interface IdentityUserListResult {
  items: IdentityUser[];
  totalCount: number;
}

function normalizeIdentityUsersResponse(
  response: GetIdentityUsersResponse | IdentityUser[] | undefined,
): IdentityUserListResult {
  if (!response) {
    return { items: [], totalCount: 0 };
  }

  if (Array.isArray(response)) {
    return { items: response, totalCount: response.length };
  }

  const data = response.data ?? response;

  if (Array.isArray(data?.items)) {
    return {
      items: data.items,
      totalCount: Number(
        data.totalCount ?? response.totalCount ?? data.items.length ?? 0,
      ),
    };
  }

  if (Array.isArray(response.items)) {
    return {
      items: response.items,
      totalCount: Number(response.totalCount ?? response.items.length ?? 0),
    };
  }

  return { items: [], totalCount: Number(response.totalCount ?? 0) };
}

export async function getIdentityUsers(
  params: GetIdentityUsersParams = {},
): Promise<IdentityUserListResult> {
  const res = await requestClient.get<GetIdentityUsersResponse | IdentityUser[]>(
    '/api/identity/users',
    {
      params,
      responseReturn: 'body',
    },
  );

  return normalizeIdentityUsersResponse(res);
}
