import { organizationPermissions } from './permissions';

export const organizationFeatureManifest = {
  key: 'organization-management',
  version: '1.0.0',
  namespace: 'organization-management',
  routes: {
    list: '/settings/branches',
    create: '/settings/branches/new',
    edit: '/settings/branches/:id/edit',
  },
  permissions: organizationPermissions,
} as const;

