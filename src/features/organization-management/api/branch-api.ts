import { api } from '@/lib/axios';
import type { BranchDetail, BranchFormValues } from '../types/branch-types';

type Envelope<T> = { data: T };

export const branchApi = {
  async getById(id: number): Promise<BranchDetail> {
    const response = await api.get<Envelope<BranchDetail>>(`/api/branches/${id}`);
    return response.data;
  },
  async create(values: BranchFormValues): Promise<BranchDetail> {
    const response = await api.post<Envelope<BranchDetail>>('/api/branches', values);
    return response.data;
  },
  async update(id: number, values: BranchFormValues): Promise<BranchDetail> {
    const response = await api.post<Envelope<BranchDetail>>(`/api/branches/${id}/update`, values);
    return response.data;
  },
};
