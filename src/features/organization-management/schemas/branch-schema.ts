import { z } from 'zod';

export const branchFormSchema = z.object({
  code: z.string().trim().min(1, 'validation.codeRequired').max(30, 'validation.codeRequired'),
  name: z.string().trim().min(2, 'validation.nameRequired').max(150, 'validation.nameRequired'),
  isDefault: z.boolean(),
  isActive: z.boolean(),
});

export type BranchFormSchema = z.infer<typeof branchFormSchema>;
