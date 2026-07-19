export type BranchDetail = {
  id: number;
  code: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
};

export type BranchRow = BranchDetail & {
  createdAt: string;
  updatedAt: string | null;
};

export type BranchFormValues = {
  code: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
};

