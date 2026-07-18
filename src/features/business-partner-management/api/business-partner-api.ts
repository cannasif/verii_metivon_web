import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { BusinessPartnerDefinitions, BusinessPartnerListQuery, BusinessPartnerListResponse, CreateBusinessPartnerRequest, DefinitionKind, ManagedDefinition, PagedResponse, SaveDefinitionRequest } from '../types/business-partner.types';

export const businessPartnerApi = {
  getAll: (params: BusinessPartnerListQuery) => api.get<BusinessPartnerListResponse>('/api/business-partners', { params }),
  getDefinitions: () => api.get<ApiResponse<BusinessPartnerDefinitions>>('/api/business-partners/definitions'),
  create: (request: CreateBusinessPartnerRequest) => api.post<ApiResponse<{id:number}>>('/api/business-partners', request),
  getManagedDefinitions: (kind: DefinitionKind, params: {pageNumber:number;pageSize:number;search?:string;sortBy?:string;sortDirection?:'asc'|'desc'}) => api.get<ApiResponse<PagedResponse<ManagedDefinition>>>(`/api/business-partners/definition-management/${kind}`, {params}),
  createDefinition: (kind: DefinitionKind, request: SaveDefinitionRequest) => api.post<ApiResponse<{id:number}>>(`/api/business-partners/definition-management/${kind}`, request),
  updateDefinition: (kind: DefinitionKind, id: number, request: SaveDefinitionRequest) => api.post<ApiResponse<{id:number}>>(`/api/business-partners/definition-management/${kind}/${id}/update`, request),
  deleteDefinition: (kind: DefinitionKind, id: number) => api.post<ApiResponse<{id:number}>>(`/api/business-partners/definition-management/${kind}/${id}/delete`),
};
