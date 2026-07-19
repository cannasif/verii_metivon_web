import { useEffect, useState, type FormEvent, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Building2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { branchApi } from '../api/branch-api';
import { organizationQueryKeys } from '../query-keys';
import { branchFormSchema } from '../schemas/branch-schema';
import type { BranchFormValues } from '../types/branch-types';

type FieldErrors = Partial<Record<'code' | 'name', string>>;
const initialForm: BranchFormValues = { code: '', name: '', isDefault: false, isActive: true };

export function BranchFormPage(): ReactElement {
  const { t } = useTranslation('organization-management');
  const { t: te } = useTranslation('erp');
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const editId = Number(id) || null;
  const [form, setForm] = useState<BranchFormValues>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const detail = useQuery({
    queryKey: organizationQueryKeys.branch(editId ?? 0),
    queryFn: () => branchApi.getById(editId!),
    enabled: editId !== null,
  });

  useEffect(() => {
    if (detail.data) setForm(detail.data);
  }, [detail.data]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = branchFormSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if ((field === 'code' || field === 'name') && !nextErrors[field]) nextErrors[field] = t(`branchManagement.${issue.message}`);
      }
      setErrors(nextErrors);
      return;
    }

    try {
      setSaving(true);
      const values = { ...parsed.data, code: parsed.data.code.toUpperCase() };
      if (editId) await branchApi.update(editId, values); else await branchApi.create(values);
      toast.success(t('branchManagement.saved'));
      navigate('/settings/branches');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : te('common.createError'));
    } finally {
      setSaving(false);
    }
  };

  return <div className="mx-auto max-w-5xl space-y-5">
    <section className="metivon-hero rounded-3xl p-6 md:p-8">
      <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Building2 /></span><div>
        <p className="text-xs font-semibold uppercase tracking-[.24em] text-white/65">{t('branchManagement.eyebrow')}</p>
        <h1 className="mt-1 text-3xl font-semibold">{editId ? t('branchManagement.editTitle') : t('branchManagement.createTitle')}</h1>
        <p className="mt-2 text-white/75">{t('branchManagement.formDescription')}</p>
      </div></div>
    </section>
    <form onSubmit={submit} noValidate className="metivon-panel grid gap-5 rounded-2xl border p-5 md:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="branch-code">{t('branchManagement.fields.code')} <span className="text-destructive">*</span></Label><Input id="branch-code" value={form.code} maxLength={30} aria-invalid={Boolean(errors.code)} className={errors.code ? 'border-destructive ring-1 ring-destructive' : ''} onChange={event => { setForm(value => ({ ...value, code: event.target.value.toUpperCase() })); setErrors(value => ({ ...value, code: undefined })); }} />{errors.code ? <p className="text-sm text-destructive">{errors.code}</p> : null}</div>
      <div className="space-y-2"><Label htmlFor="branch-name">{t('branchManagement.fields.name')} <span className="text-destructive">*</span></Label><Input id="branch-name" value={form.name} maxLength={150} aria-invalid={Boolean(errors.name)} className={errors.name ? 'border-destructive ring-1 ring-destructive' : ''} onChange={event => { setForm(value => ({ ...value, name: event.target.value })); setErrors(value => ({ ...value, name: undefined })); }} />{errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}</div>
      <label className="flex items-center gap-3 rounded-xl border p-4"><input type="checkbox" checked={form.isDefault} onChange={event => setForm(value => ({ ...value, isDefault: event.target.checked }))} /><span><strong className="block">{t('branchManagement.fields.isDefault')}</strong><small className="text-muted-foreground">{t('branchManagement.defaultHint')}</small></span></label>
      <label className="flex items-center gap-3 rounded-xl border p-4"><input type="checkbox" checked={form.isActive} onChange={event => setForm(value => ({ ...value, isActive: event.target.checked }))} /><span><strong className="block">{t('branchManagement.fields.isActive')}</strong><small className="text-muted-foreground">{t('branchManagement.activeHint')}</small></span></label>
      <div className="flex justify-end gap-3 md:col-span-2"><Button type="button" variant="outline" onClick={() => navigate('/settings/branches')}>{te('common.cancel')}</Button><Button disabled={saving}><Save />{saving ? te('common.saving') : t('branchManagement.save')}</Button></div>
    </form>
  </div>;
}
