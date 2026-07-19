import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { BusinessPartnerDefinitions, BusinessPartnerDetail, BusinessPartnerListQuery, BusinessPartnerListResponse, CreateBusinessPartnerRequest, DefinitionKind, ManagedDefinition, PagedResponse, SaveDefinitionRequest } from '../types/business-partner.types';

export const businessPartnerApi = {
  getAll: (params: BusinessPartnerListQuery) => api.get<BusinessPartnerListResponse>('/api/business-partners', { params }),
  getDefinitions: () => api.get<ApiResponse<BusinessPartnerDefinitions>>('/api/business-partners/definitions'),
  create: (request: CreateBusinessPartnerRequest) => api.post<ApiResponse<{id:number}>>('/api/business-partners', request),
  getById: (id:number) => api.get<ApiResponse<BusinessPartnerDetail>>(`/api/business-partners/${id}`),
  update: (id:number,request:CreateBusinessPartnerRequest) => api.put<ApiResponse<{id:number}>>(`/api/business-partners/${id}`,request),
  delete: (id:number) => api.delete<ApiResponse<{id:number}>>(`/api/business-partners/${id}`),
  getManagedDefinitions: (kind: DefinitionKind, params: {pageNumber:number;pageSize:number;search?:string;sortBy?:string;sortDirection?:'asc'|'desc'}) => api.get<ApiResponse<PagedResponse<ManagedDefinition>>>(`/api/business-partners/definition-management/${kind}`, {params}),
  createDefinition: (kind: DefinitionKind, request: SaveDefinitionRequest) => api.post<ApiResponse<{id:number}>>(`/api/business-partners/definition-management/${kind}`, request),
  updateDefinition: (kind: DefinitionKind, id: number, request: SaveDefinitionRequest) => api.put<ApiResponse<{id:number}>>(`/api/business-partners/definition-management/${kind}/${id}`, request),
  deleteDefinition: (kind: DefinitionKind, id: number) => api.delete<ApiResponse<{id:number}>>(`/api/business-partners/definition-management/${kind}/${id}`),
};
