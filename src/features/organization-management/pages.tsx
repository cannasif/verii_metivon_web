import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Building2, Save } from "lucide-react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErpPagedManagementPage } from "@/features/erp-operation-management/ErpPagedManagementPage";
import type { ErpPageConfig } from "@/features/erp-operation-management/types";

type BranchDetail = { id:number;code:string;name:string;isDefault:boolean;isActive:boolean };

export function BranchManagementPage(): ReactElement {
  const { t } = useTranslation("erp");
  const config = useMemo<ErpPageConfig>(() => ({
    pageKey:"branch-management",title:t("branchManagement.title"),eyebrow:t("branchManagement.eyebrow"),
    description:t("branchManagement.description"),endpoint:"/api/branches/query",queryMethod:"post",accent:"violet",
    createLabel:t("branchManagement.new"),createPath:"/settings/branches/new",
    columns:[
      {key:"id",label:t("fields.id"),format:"id",sortable:false,width:90},
      {key:"code",label:t("branchManagement.fields.code"),width:140},
      {key:"name",label:t("branchManagement.fields.name"),width:260},
      {key:"isDefault",label:t("branchManagement.fields.isDefault"),format:"boolean",width:120},
      {key:"isActive",label:t("branchManagement.fields.isActive"),format:"boolean",width:100},
      {key:"createdAt",label:t("branchManagement.fields.createdAt"),format:"datetime",width:180},
      {key:"updatedAt",label:t("branchManagement.fields.updatedAt"),format:"datetime",width:180},
    ],
    actions:[
      {label:t("common.edit"),kind:"update",navigateTo:(row)=>`/settings/branches/${row.id}/edit`},
      {label:t("common.delete"),kind:"delete",method:"post",endpoint:(row)=>`/api/branches/${row.id}/delete`,confirm:t("branchManagement.deleteConfirm"),variant:"destructive",visible:(row)=>row.isDefault!==true},
    ],
  }),[t]);
  return <ErpPagedManagementPage config={config}/>;
}

export function BranchFormPage(): ReactElement {
  const { t } = useTranslation("erp");
  const navigate=useNavigate();const {id}=useParams<{id?:string}>();const editId=Number(id)||null;
  const [form,setForm]=useState({code:"",name:"",isDefault:false,isActive:true});
  const [errors,setErrors]=useState<{code?:string;name?:string}>({});const [saving,setSaving]=useState(false);
  const detail=useQuery({queryKey:["branch",editId],queryFn:()=>api.get<{data:BranchDetail}>(`/api/branches/${editId}`),enabled:editId!==null});
  useEffect(()=>{const item=detail.data?.data;if(item)setForm({code:item.code,name:item.name,isDefault:item.isDefault,isActive:item.isActive});},[detail.data]);
  const submit=async(event:FormEvent)=>{
    event.preventDefault();const nextErrors:{code?:string;name?:string}={};
    if(!form.code.trim())nextErrors.code=t("branchManagement.validation.codeRequired");
    if(!form.name.trim())nextErrors.name=t("branchManagement.validation.nameRequired");
    setErrors(nextErrors);if(Object.keys(nextErrors).length)return;
    try{setSaving(true);await api.post(editId?`/api/branches/${editId}/update`:"/api/branches",{...form,code:form.code.trim().toUpperCase(),name:form.name.trim()});toast.success(t("branchManagement.saved"));navigate("/settings/branches");}
    catch(error){toast.error(error instanceof Error?error.message:t("common.createError"));}finally{setSaving(false);}
  };
  return <div className="mx-auto max-w-5xl space-y-5">
    <section className="metivon-hero rounded-3xl p-6 md:p-8"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Building2/></span><div><p className="text-xs font-semibold uppercase tracking-[.24em] text-white/65">{t("branchManagement.eyebrow")}</p><h1 className="mt-1 text-3xl font-semibold">{editId?t("branchManagement.editTitle"):t("branchManagement.createTitle")}</h1><p className="mt-2 text-white/75">{t("branchManagement.formDescription")}</p></div></div></section>
    <form onSubmit={submit} noValidate className="metivon-panel grid gap-5 rounded-2xl border p-5 md:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="branch-code">{t("branchManagement.fields.code")} <span className="text-destructive">*</span></Label><Input id="branch-code" value={form.code} maxLength={30} aria-invalid={Boolean(errors.code)} className={errors.code?"border-destructive ring-1 ring-destructive":""} onChange={e=>{setForm(x=>({...x,code:e.target.value.toUpperCase()}));setErrors(x=>({...x,code:undefined}));}}/>{errors.code?<p className="text-sm text-destructive">{errors.code}</p>:null}</div>
      <div className="space-y-2"><Label htmlFor="branch-name">{t("branchManagement.fields.name")} <span className="text-destructive">*</span></Label><Input id="branch-name" value={form.name} maxLength={150} aria-invalid={Boolean(errors.name)} className={errors.name?"border-destructive ring-1 ring-destructive":""} onChange={e=>{setForm(x=>({...x,name:e.target.value}));setErrors(x=>({...x,name:undefined}));}}/>{errors.name?<p className="text-sm text-destructive">{errors.name}</p>:null}</div>
      <label className="flex items-center gap-3 rounded-xl border p-4"><input type="checkbox" checked={form.isDefault} onChange={e=>setForm(x=>({...x,isDefault:e.target.checked}))}/><span><strong className="block">{t("branchManagement.fields.isDefault")}</strong><small className="text-muted-foreground">{t("branchManagement.defaultHint")}</small></span></label>
      <label className="flex items-center gap-3 rounded-xl border p-4"><input type="checkbox" checked={form.isActive} onChange={e=>setForm(x=>({...x,isActive:e.target.checked}))}/><span><strong className="block">{t("branchManagement.fields.isActive")}</strong><small className="text-muted-foreground">{t("branchManagement.activeHint")}</small></span></label>
      <div className="flex justify-end gap-3 md:col-span-2"><Button type="button" variant="outline" onClick={()=>navigate("/settings/branches")}>{t("common.cancel")}</Button><Button disabled={saving}><Save/>{saving?t("common.saving"):t("branchManagement.save")}</Button></div>
    </form>
  </div>;
}
