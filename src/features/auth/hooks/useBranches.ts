import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { Branch } from '../types/auth';
import { AUTH_QUERY_KEYS } from '../utils/query-keys';

interface BranchListItem {
  id: number;
  code: string;
  name: string;
  isDefault: boolean;
}

export const useBranches = () => {
  return useQuery<Branch[]>({
    queryKey: [AUTH_QUERY_KEYS.BRANCHES],
    queryFn: async (): Promise<Branch[]> => {
      const response = await api.get<ApiResponse<BranchListItem[]>>('/api/branches');
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Branches could not be loaded.');
      }

      return response.data.map((branch) => ({
        id: String(branch.id),
        name: branch.name,
        code: branch.code,
        isDefault: branch.isDefault,
      }));
    },
    staleTime: Infinity,
  });
};
