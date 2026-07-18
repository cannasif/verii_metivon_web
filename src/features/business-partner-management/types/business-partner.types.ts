import type { ApiResponse, PagedFilter } from '@/types/api';

export interface BusinessPartner { id:number; code:string; name:string; partnerType:string; customerGroup?:string|null; paymentTerm:string; currency:string; taxGroup:string; creditLimit:number; hasUnlimitedCredit:boolean; isActive:boolean }
export interface PagedResponse<T> { items:T[]; pageNumber:number; pageSize:number; totalCount:number; totalPages:number; hasPreviousPage:boolean; hasNextPage:boolean }
export interface BusinessPartnerListQuery { pageNumber:number; pageSize:number; search?:string; sortBy?:'code'|'name'|'creditLimit'|'createdAt'; sortDirection?:'asc'|'desc'; isActive?:boolean; filters?:PagedFilter[]; filterLogic?:'and'|'or' }
export type BusinessPartnerListResponse = ApiResponse<PagedResponse<BusinessPartner>>;
export interface DefinitionItem { id:number; code:string; name:string; isDefault:boolean }
export interface BusinessPartnerDefinitions { partnerTypes:DefinitionItem[]; customerGroups:DefinitionItem[]; paymentTerms:DefinitionItem[]; currencies:DefinitionItem[]; taxGroups:DefinitionItem[] }
export interface CreateBusinessPartnerRequest { code:string; name:string; legalName?:string; branchId:number; businessPartnerTypeId:number; customerGroupId?:number|null; paymentTermId:number; currencyId:number; taxGroupId:number; taxOffice?:string; taxNumber?:string; nationalIdentityNumber?:string; email?:string; phone?:string; mobilePhone?:string; website?:string; creditLimit:number; hasUnlimitedCredit:boolean; notes?:string }
export type DefinitionKind = 'partner-types'|'customer-groups'|'payment-terms'|'currencies'|'tax-groups';
export interface ManagedDefinition extends DefinitionItem { description?:string|null; isActive:boolean; displayOrder:number; dueDays?:number|null; discountDays?:number|null; discountRate?:number|null; isoCode?:string|null; symbol?:string|null; decimalPlaces?:number|null; isTaxExempt?:boolean|null }
export interface SaveDefinitionRequest { code:string; name:string; description?:string; isActive:boolean; isDefault:boolean; displayOrder:number; dueDays?:number|null; discountDays?:number|null; discountRate?:number|null; isoCode?:string; symbol?:string; decimalPlaces?:number|null; isTaxExempt?:boolean|null }
