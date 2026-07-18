import { api } from '@/lib/axios';
import type { ApiResponse, PagedParams, PagedResponse } from '@/types/api';
import type { UserAuthorityDto } from '../types/powerbiRls.types';

function toPagedData<T>(raw: { items?: T[]; data?: T[] } & PagedResponse<T>): PagedResponse<T> {
  const list = raw.items ?? raw.data ?? [];
  return { ...raw, data: list };
}

export const userAuthorityApi = {
  getList: async (params: PagedParams): Promise<PagedResponse<UserAuthorityDto>> => {
    const response = await api.post<ApiResponse<PagedResponse<{ id: number; name: string; isActive: boolean }>>>(
      '/api/permission-groups/query',
      {
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 10,
        search: params.search ?? '',
        sortBy: params.sortBy ?? 'Id',
        sortDirection: params.sortDirection ?? 'asc',
        filterLogic: params.filterLogic ?? 'and',
        filters: params.filters ?? [],
      }
    );
    if (response.success && response.data) {
      const groups = toPagedData(response.data);
      return { ...groups, data: groups.data.filter((group) => group.isActive).map((group) => ({ id: group.id, title: group.name })) };
    }
    throw new Error(response.message ?? 'UserAuthority list could not be loaded');
  },
};
