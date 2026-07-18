import { useQuery } from '@tanstack/react-query';
import { businessPartnerApi } from '../api/business-partner-api';
import type { BusinessPartnerListQuery } from '../types/business-partner.types';

export const BUSINESS_PARTNER_QUERY_KEYS = { all: ['business-partners'] as const };
export function useBusinessPartners(query: BusinessPartnerListQuery) {
  return useQuery({ queryKey: [...BUSINESS_PARTNER_QUERY_KEYS.all, query], queryFn: () => businessPartnerApi.getAll(query), placeholderData: previous => previous });
}
