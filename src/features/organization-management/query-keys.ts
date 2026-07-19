export const organizationQueryKeys = {
  all: ['organization'] as const,
  branches: () => [...organizationQueryKeys.all, 'branches'] as const,
  branch: (id: number) => [...organizationQueryKeys.branches(), 'detail', id] as const,
};

